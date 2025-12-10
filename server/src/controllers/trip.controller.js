
const mongoose = require("mongoose");
const tripModel = require("../models/trip.model");
const userModel = require("../models/user.model");
const { chatSession } = require("../utils/AIModal");
const { AI_PROMPT } = require("../utils/options");
const { Clerk } = require('@clerk/clerk-sdk-node');
const { fetchPlacePhoto } = require("../utils/fetchPlacePhoto");

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const findOrCreateUser = async (clerkId) => {
  let user = await userModel.findOne({ clerkId });

  if (!user) {
    console.log("User not found in DB. Creating new user...");
    const clerkUser = await clerk.users.getUser(clerkId);
    if (!clerkUser) {
      throw new Error("Failed to fetch user details from Clerk.");
    }
    const email = clerkUser.emailAddresses[0].emailAddress;
    const username = clerkUser.username || email.split('@')[0];

    user = await userModel.create({
      clerkId,
      username,
      email,
    });
    console.log("New user created:", user.email);
  } else {
    console.log("User found in DB:", user.email);
  }
  return user;
};

// A robust function to build a valid plan item, providing defaults for missing fields.
const createValidPlace = (placeData) => ({
    placeName: placeData.placeName || "Unnamed Place",
    placeDetails: placeData.placeDetails || "Details not provided by AI.",
    geoCoordinates: placeData.geoCoordinates || { latitude: 0, longitude: 0 },
    ticketPricing: placeData.ticketPricing || "Not Specified",
    rating: placeData.rating || 3,
    timeTravel: placeData.timeTravel || "Not Specified",
    placeImageUrl: placeData.placeImageUrl || ''
});

module.exports.createTrip = async (req, res) => {
  console.log("\n--- [CREATE TRIP START] ---");
  try {
    const { destination, days, budget, travelGroup } = req.body;
    const clerkId = req.auth.userId;

    if (!destination || !days || !budget || !travelGroup) {
      console.error("Error: Missing required fields.");
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await findOrCreateUser(clerkId);

    const FINAL_PROMPT = AI_PROMPT.replace("{location}", destination)
      .replace("{totalDays}", days)
      .replace("{traveler}", travelGroup)
      .replace("{budget}", budget)
      .replace("{totaldays}", days);

    console.log("Sending prompt to AI...");
    const result = await chatSession.sendMessage(FINAL_PROMPT);
    const rawResponse = result?.response?.text();
    const cleanedResponse = rawResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    let aiResponse;
    try {
        aiResponse = JSON.parse(cleanedResponse);
    } catch (e) {
        console.error("Fatal: AI returned invalid JSON.", cleanedResponse);
        throw new Error("The AI service returned a response that was not valid JSON.");
    }

    const finalGeneratedPlan = {
        tripDetails: aiResponse.tripDetails || { location: destination, duration: days, travelers: travelGroup, budget: budget },
        hotelOptions: [],
        itinerary: {}
    };

    // Defensively build itinerary
    if (Array.isArray(aiResponse.itinerary)) {
        for (const dayData of aiResponse.itinerary) {
            const dayKey = `day${dayData.day}`;
            const validPlaces = Array.isArray(dayData.places) ? dayData.places.map(createValidPlace) : [];

            finalGeneratedPlan.itinerary[dayKey] = {
                theme: dayData.theme || `A Day of Exploration in ${destination}`,
                bestTimeToVisit: dayData.bestTimeToVisit || "Anytime",
                plan: validPlaces
            };
        }
    }

    // Defensively build hotel options
    if (Array.isArray(aiResponse.hotelOptions)) {
        finalGeneratedPlan.hotelOptions = aiResponse.hotelOptions.map(hotel => ({
            hotelName: hotel.hotelName || "Unnamed Hotel",
            hotelAddress: hotel.hotelAddress || "Address not provided",
            price: hotel.price || "Not Specified",
            rating: hotel.rating || 3,
            description: hotel.description || "No description available.",
            geoCoordinates: hotel.geoCoordinates || { latitude: 0, longitude: 0 },
            hotelImageUrl: hotel.hotelImageUrl || ''
        }));
    }

    // Fetch images in a separate, non-blocking loop
    for (const dayKey in finalGeneratedPlan.itinerary) {
        for (const place of finalGeneratedPlan.itinerary[dayKey].plan) {
            if (place.placeName !== "Unnamed Place") {
                try {
                    place.placeImageUrl = await fetchPlacePhoto(place.placeName);
                } catch (e) { console.error(`Image fetch failed for ${place.placeName}`)}
            }
        }
    }
    for (const hotel of finalGeneratedPlan.hotelOptions) {
        if (hotel.hotelName !== "Unnamed Hotel") {
            try {
                hotel.hotelImageUrl = await fetchPlacePhoto(hotel.hotelName);
            } catch (e) { console.error(`Image fetch failed for ${hotel.hotelName}`)}
        }
    }

    const trip = await tripModel.create({
      userId: user._id,
      destination,
      days,
      budget,
      travelGroup,
      generatedPlan: finalGeneratedPlan,
    });

    await userModel.findByIdAndUpdate(user._id, { $push: { trips: trip._id } });

    console.log("--- [CREATE TRIP SUCCESS] ---\n");
    res.status(200).json({ trip });

  } catch (error) {
    console.error("--- [CREATE TRIP FAILED] ---", error);
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

    const user = await userModel.findOne({ clerkId });
    if (!user || trip.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view this trip" });
    }

    return res.status(200).json({ trip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch trip details" });
  }
};

module.exports.getTripHistory = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await findOrCreateUser(clerkId);

    const trips = await tripModel.find({ userId: user._id });

    return res.status(200).json({ trips });
  } catch (error) {
    console.error("Error in getTripHistory:", error);
    res.status(500).json({ message: "Failed to fetch trip history" });
  }
};

module.exports.deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const clerkId = req.auth.userId;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID" });
        }

        const trip = await tripModel.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const user = await userModel.findOne({ clerkId });
        if (!user || trip.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this trip" });
        }

        await tripModel.findByIdAndDelete(tripId);

        await userModel.findByIdAndUpdate(user._id, { $pull: { trips: tripId } });

        res.status(200).json({ message: "Trip deleted successfully" });
    } catch (error) {
        console.error("Error deleting trip:", error);
        res.status(500).json({ message: "Failed to delete trip" });
    }
};
