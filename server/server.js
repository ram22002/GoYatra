const dotenv = require("dotenv");
dotenv.config();
const app = require('./src/app');
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

const connct = require("./src/db/db");
connct();

const http = require("http");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://go-yatra-nine.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const { chatModel } = require("./src/models/chat");
const chatWithGemini = require("./src/utils/gemini");
const intents = require("./src/utils/intents");

const getBotReply = async (message) => {
  if (!message || typeof message !== "string") {
    return "Message must be a string.";
  }

  try {
    let reply = null;

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        const match = message.match(pattern);
        if (match) {
          if (intent.action) {
            reply = await intent.action(match);
          } else {
            reply = intent.response;
          }
          break;
        }
      }
      if (reply) break;
    }

    if (!reply) {
      reply = await chatWithGemini(message);
    }

    await new chatModel({ user: message, bot: reply }).save();
    return reply;
  } catch (err) {
    console.error("Chat error:", err.message);
    return "An internal error occurred.";
  }
};

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
    console.error("Error during authentication:", error);
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.user?.name || "Unknown User");

  socket.on("chat message", async (msg) => {
    console.log("Message received: ", msg);
    const reply = await getBotReply(msg);
    socket.emit("bot reply", { bot: reply });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
