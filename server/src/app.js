const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const { customAuthMiddleware } = require("./middleware/auth.middleware.js");

dotenv.config({ path: "./.env" });

const userRoutes = require("./routes/user.routes.js");
const tripPlanRoutes = require("./routes/tripPlan.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");
const webhookRoutes = require("./routes/webhook.routes.js"); // Import webhook routes

// Middleware for webhook
app.use("/api/webhooks", express.raw({ type: 'application/json' }), webhookRoutes);

// General middleware
app.use(
  cors({
    origin: ["https://go-yatra-nine.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Bypass auth middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use("/api/user", userRoutes);
  app.use("/api/tripplan", tripPlanRoutes);
  app.use('/api', bookingRoutes);
} else {
  app.use("/api/user", customAuthMiddleware, userRoutes);
  app.use("/api/tripplan", customAuthMiddleware, tripPlanRoutes);
  app.use('/api', bookingRoutes);
}

module.exports = app;
