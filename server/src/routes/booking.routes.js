const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// Flight routes
router.get('/flights', bookingController.searchFlights);
router.post('/book-flight', bookingController.bookFlight);

// Train routes
router.get('/trains', bookingController.searchTrains);
router.post('/book-train', bookingController.bookTrain);

module.exports = router;
