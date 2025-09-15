const mongoose = require("mongoose");
const tripModel = require("../models/trip.model");
const userModel = require("../models/user.model");
const { chatSession } = require("../utils/AIModal"); // your AI integration
const { AI_PROMPT } = require("../utils/options");
const { Clerk } = require('@clerk/clerk-sdk-node');

const { fetchPlacePhoto } = require("../utils/fetchPlacePhoto"); // your helper function

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Helper function for user synchronization
const syncUser = async (clerkId) => {
  let user = await userModel.findOne({ clerkId });

  if (!user) {
    const clerkUser = await clerk.users.getUser(clerkId);
    if (!clerkUser) {
      throw new Error("User not found in Clerk");
    }
    const email = clerkUser.emailAddresses[0].emailAddress;

    // If not found by clerkId, check if a user exists with the email
    user = await userModel.findOne({ email: email });

    if (user) {
      // User with email exists, link it to the clerkId
      user.clerkId = clerkId;
      await user.save();
    } else {
      // If no user found by either clerkId or email, create a new one
      const username = clerkUser.username || email.split('@')[0];
      user = await userModel.create({
        clerkId: clerkId,
        username: username,
        email: email,
      });
    }
  }
  return user;
};

module.exports.createTrip = async (req, res) => {
  try {
    const { destination, days, budget, travelGroup } = req.body;
    const clerkId = req.auth.userId;

    if (!destination || !days || !budget || !travelGroup) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (parseInt(days, 10) > 7) {
      return res.status(400).json({ message: "Max 7 days allowed" });
    }

    const user = await syncUser(clerkId);

    // Generate AI Response
    const FINAL_PROMPT = AI_PROMPT.replace("{location}", destination)
      .replace("{totalDays}", days)
      .replace("{traveler}", travelGroup)
      .replace("{budget}", budget)
      .replace("{totaldays}", days);

    const result = await chatSession.sendMessage(FINAL_PROMPT);
    const aiResponse = JSON.parse(result?.response?.text());

    // Fetch real images
    if (aiResponse?.itinerary) {
      for (const day of Object.values(aiResponse.itinerary)) {
        for (const place of day.plan) {
          place.placeImageUrl = await fetchPlacePhoto(place.placeName);
        }
      }
    }
    if (aiResponse?.hotelOptions) {
      for (const hotel of aiResponse.hotelOptions) {
        hotel.hotelImageUrl = await fetchPlacePhoto(hotel.hotelName);
      }
    }

    // Save trip to database
    const trip = await tripModel.create({
      userId: user._id,
      destination,
      days,
      budget,
      travelGroup,
      generatedPlan: aiResponse,
    });

    await userModel.findByIdAndUpdate(user._id, { $push: { trips: trip._id } });

    res.status(200).json({ trip });
  } catch(error){
    console.error(error);
    res.status(500).json({ message: `Failed to generate trip   ${error}` });
  }
};

module.exports.getTrip = async (req, res) => {
  try {
    let { tripId } = req.params;
    const clerkId = req.auth.userId;

    tripId = tripId.replace(":", "");

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const trip = await tripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const user = await syncUser(clerkId);

    if (trip.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this trip" });
    }

    return res.status(200).json({ trip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch trip details" });
  }
};
