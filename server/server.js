// Load dotenv only in development (not on Render)
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
    console.log("✅ Loaded .env file for local development");
  } catch (err) {
    console.warn("⚠️ Skipping dotenv (not installed in production)");
  }
}

const app = require("./src/app");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const http = require("http");

// Connect to DB
const connect = require("./src/db/db");
connect();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_URI || "https://go-yatra-team-async.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Authenticate socket connections using JWT
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("Connection rejected: No token provided");
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.error("Error during authentication:", error.message);
    return next(new Error("Authentication error"));
  }
});

// Socket events
io.on("connection", (socket) => {
  console.log("A user connected: ", socket.user?.name || "Unknown User");

  socket.on("chat message", (msg) => {
    console.log("Message received: ", msg);
    io.emit("chat message", msg); // Broadcast
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
