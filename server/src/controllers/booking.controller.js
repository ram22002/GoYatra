const axios = require("axios");

// Search for flights (using Amadeus API)
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    const response = await axios.get(
      `https://test.api.amadeus.com/v2/shopping/flight-offers`,
      {
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: date,
          adults: 1,
        },
        headers: {
          Authorization: `Bearer ${process.env.AMADEUS_API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error searching flights:", error);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
};

// Book a flight (mock)
exports.bookFlight = async (req, res) => {
  try {
    const { optionId, userId } = req.body;
    // In a real app, save booking to your database
    const bookingId = `FLIGHT-${Date.now()}`;
    res.json({ bookingId, status: "confirmed" });
  } catch (error) {
    console.error("Error booking flight:", error);
    res.status(500).json({ error: "Failed to book flight" });
  }
};

// Search for trains (mock)
exports.searchTrains = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    // In a real app, call a train API (e.g., IRCTC API for India)
    const mockTrains = [
      { id: "TRAIN-1", departure: "10:00", arrival: "14:00", price: "₹500", bookingLink: "https://www.irctc.co.in" },
      { id: "TRAIN-2", departure: "12:00", arrival: "16:00", price: "₹600", bookingLink: "https://www.irctc.co.in" },
    ];
    res.json(mockTrains);
  } catch (error) {
    console.error("Error searching trains:", error);
    res.status(500).json({ error: "Failed to fetch trains" });
  }
};

// Book a train (mock)
exports.bookTrain = async (req, res) => {
  try {
    const { optionId, userId } = req.body;
    // In a real app, save booking to your database
    const bookingId = `TRAIN-${Date.now()}`;
    res.json({ bookingId, status: "confirmed" });
  } catch (error) {
    console.error("Error booking train:", error);
    res.status(500).json({ error: "Failed to book train" });
  }
};
