
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const { customAuthMiddleware } = require("./middleware/auth.middleware.js");

dotenv.config({ path: "./.env" });

const userRoutes = require("./routes/user.routes.js");
const tripPlanRoutes = require("./routes/tripPlanRoutes.js");

app.use(
  cors({
    origin: [process.env.CORS_URI || "https://go-yatra-team-async.vercel.app", "http://localhost:5173", "https://5175-firebase-goyatragit-1757951790422.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", customAuthMiddleware, userRoutes);
app.use("/api/tripplan", customAuthMiddleware, tripPlanRoutes);

module.exports = app;
