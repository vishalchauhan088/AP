const http = require("http");
const app = require("./app.js");
const socket = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./src/models/messageModel.js");

const server = http.createServer(app);

// initialize socket
const io = socket(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// implement authentication on socket
io.use(async (socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    console.log("No token provided");
    return next(new Error("Authentication error"));
  }
  // verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");
  console.log(socket.handshake.query);

  socket.on("sendMessage", async (data) => {
    let parsedData;
    if (typeof data === "string") {
      try {
        parsedData = JSON.parse(data); // Parse string to object
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        return; // Exit if parsing fails
      }
    } else {
      parsedData = data; // Use as is if already an object
    }
    try {
      const message = await Message.create({
        chatId: parsedData.chatId,
        senderId: parsedData.senderId,
        content: parsedData.content,
      });
      console.log(message);
      console.log(parsedData.content);
      io.to(parsedData.chatId).emit("receiveMessage", parsedData.content);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);

    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

module.exports = { io, server };
