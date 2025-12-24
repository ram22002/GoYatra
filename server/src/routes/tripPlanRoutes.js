const express = require("express");
const { createTrip, getTrip, getTripHistory, deleteTrip } = require("../controllers/trip.controller");
const { clerkAuthMiddleware } = require("../middleware/clerk.middleware");
const { chatController } = require("../controllers/chat.controller");

const router = express.Router();


router.post("/createtrip", createTrip);

router.post("/chat", chatController);

// Swapped the order of the next two routes
router.get("/history", getTripHistory);

router.get("/:tripId", getTrip);

router.delete("/:tripId", deleteTrip);

module.exports = router;