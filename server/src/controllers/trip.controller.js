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

    user = await userModel.findOne({ email: email });

    if (user) {
      user.clerkId = clerkId;
      await user.save();
    } else {
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
  console.log("\n--- [CREATE TRIP START] ---");
  try {
    const { destination, days, budget, travelGroup } = req.body;
    const clerkId = req.auth.userId;
    // console.log("Request Body:", { destination, days, budget, travelGroup });

    if (!destination || !days || !budget || !travelGroup) {
      console.error("Error: Missing required fields.");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (parseInt(days, 10) > 7) {
      console.error("Error: Max 7 days allowed.");
      return res.status(400).json({ message: "Max 7 days allowed" });
    }

    const user = await syncUser(clerkId);
    console.log("User synced/found:", user.email);

    // Generate AI Response
    const FINAL_PROMPT = AI_PROMPT.replace("{location}", destination)
      .replace("{totalDays}", days)
      .replace("{traveler}", travelGroup)
      .replace("{budget}", budget)
      .replace("{totaldays}", days);

    console.log("Sending prompt to AI...");
    // console.log("Final Prompt:", FINAL_PROMPT); // Uncomment for debugging prompt issues

    const result = await chatSession.sendMessage(FINAL_PROMPT);
    const rawResponse = result?.response?.text();
    console.log("--- Raw AI Response ---", rawResponse);

    if (!rawResponse) {
      console.error("Error: AI model returned an empty response.");
      return res.status(500).json({ message: "AI model returned an empty response." });
    }

    const cleanedResponse = rawResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    console.log("--- Cleaned AI Response ---", cleanedResponse);

    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedResponse);
      console.log("Successfully parsed AI response.");
    } catch (error) {
      console.error("Error: Failed to parse AI response. JSON is malformed.");
      console.error("Underlying parse error:", error.message);
      return res.status(500).json({ message: "AI returned a malformed plan. Could not parse." });
    }

    console.log("Fetching images for itinerary and hotels...");
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
    console.log("Image fetching complete.");

    console.log("Attempting to save trip to database...");
    const trip = await tripModel.create({
      userId: user._id,
      destination,
      days,
      budget,
      travelGroup,
      generatedPlan: aiResponse,
    });
    console.log("Successfully saved trip to database. Trip ID:", trip._id);

    await userModel.findByIdAndUpdate(user._id, { $push: { trips: trip._id } });
    console.log("Added trip reference to user.");

    console.log("--- [CREATE TRIP SUCCESS] ---\n");
    res.status(200).json({ trip });

  } catch (error) {
    console.error("--- [CREATE TRIP FAILED] ---");
    console.error("An unexpected error occurred:", error);
    res.status(500).json({ message: `Failed to generate trip: ${error.message}` });
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
