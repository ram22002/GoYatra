
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const { customAuthMiddleware } = require("./middleware/auth.middleware.js");

dotenv.config({ path: "./.env" });

const userRoutes = require("./routes/user.routes.js");
const tripPlanRoutes = require("./routes/tripPlan.routes.js");
const bookingRoutes= require("./routes/booking.routes.js")

// Middleware should be registered before routes
app.use(
  cors({
    origin: [process.env.CORS_URI || "https://go-yatra-team-async.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/tripplan", tripPlanRoutes);
app.use('/api', bookingRoutes);

module.exports = app;
