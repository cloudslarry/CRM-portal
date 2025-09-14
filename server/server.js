// server.js

// --- 1. IMPORTS ---
const express = require("express");
const http = require("http");
const { Server } = require("socket.io"); // Modern import style for Socket.IO
const mongoose = require("mongoose");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");

// --- 2. INITIAL CONFIGURATION & SETUP ---
dotenv.config();
const keys = require("./config/key");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for your specific frontend URL in production
    methods: ["GET", "POST"],
  },
});

// --- 3. MIDDLEWARES ---
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.use(passport.initialize());
require("./config/passport")(passport);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// --- 4. SOCKET.IO LOGIC ---
const Message = require('./models/Message');

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join room for chat between two users
  socket.on("join room", ({ room1, room2 }) => {
    socket.join(room1);
    socket.join(room2);
    console.log(`Socket ${socket.id} joined rooms: ${room1}, ${room2}`);
  });

  // Handle private messages
  socket.on("private message", async (messageData) => {
    try {
      const {
        sender,
        message,
        room,
        senderId,
        receiverId,
        senderName,
        receiverName,
        senderRegistrationNumber,
        receiverRegistrationNumber,
        files = []
      } = messageData;

      // Save message to database
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        senderName,
        receiverName,
        senderRegistrationNumber,
        receiverRegistrationNumber,
        roomId: room,
        fileUrl: files.length > 0 ? files[0].url : null,
        fileName: files.length > 0 ? files[0].name : null,
        fileType: files.length > 0 ? files[0].type : null,
        fileSize: files.length > 0 ? files[0].size : null
      });

      await newMessage.save();

      // Emit to the specific room
      io.to(room).emit("new Message", {
        _id: newMessage._id,
        message: newMessage.message,
        sender: newMessage.senderName,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        fileUrl: newMessage.fileUrl,
        fileName: newMessage.fileName,
        fileType: newMessage.fileType,
        fileSize: newMessage.fileSize,
        createdAt: newMessage.createdAt,
        roomId: newMessage.roomId,
        replyTo: newMessage.replyTo,
        replyMessage: newMessage.replyMessage,
        replySender: newMessage.replySender
      });

      // Emit notification to receiver
      socket.to(receiverId).emit("new notification", {
        type: "message",
        title: "New Message",
        message: `You received a new message from ${senderName}`,
        senderId: newMessage.senderId,
        messageId: newMessage._id
      });

      console.log(`Message sent in room ${room}: ${message}`);
    } catch (error) {
      console.error('Error handling private message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(data.room).emit("user typing", {
      user: data.user,
      isTyping: data.isTyping
    });
  });

  // Handle message read status
  socket.on("mark as read", async (data) => {
    try {
      const { messageId, userId } = data;
      
      await Message.findByIdAndUpdate(messageId, {
        isRead: true,
        readAt: new Date()
      });

      socket.to(data.room).emit("message read", {
        messageId,
        readBy: userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle message edit events
  socket.on("message edited", async (data) => {
    try {
      const { messageId, newMessage, editedAt, room } = data;
      
      // Update message in database
      await Message.findByIdAndUpdate(messageId, {
        message: newMessage,
        isEdited: true,
        editedAt: editedAt || new Date()
      });

      // Broadcast edit to all users in the room
      io.to(room).emit("message edited", {
        messageId,
        newMessage,
        editedAt: editedAt || new Date()
      });
    } catch (error) {
      console.error('Error handling message edit:', error);
    }
  });

  // Handle message delete events
  socket.on("message deleted", async (data) => {
    try {
      const { messageId, room } = data;
      
      // Soft delete message in database
      await Message.findByIdAndUpdate(messageId, {
        isDeleted: true,
        deletedAt: new Date()
      });

      // Broadcast deletion to all users in the room
      io.to(room).emit("message deleted", {
        messageId
      });
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  });

  // Handle user online status
  socket.on("user online", (data) => {
    socket.broadcast.emit("user status", {
      userId: data.userId,
      status: "online"
    });
  });

  // Handle user offline status
  socket.on("user offline", (data) => {
    socket.broadcast.emit("user status", {
      userId: data.userId,
      status: "offline"
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// --- 5. API ROUTES ---
// Import route files
const adminRoutes = require("./routes/adminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminHostelRoutes = require("./routes/admin/hostelRoutes");
const studentHostelRoutes = require("./routes/student/hostelRoutes");
const studentReceiptRoutes = require("./routes/student/receiptRoutes");
const adminCollegeFeeRoutes = require("./routes/admin/collegeFeeRoutes");
const studentCollegeFeeRoutes = require("./routes/student/collegeFeeRoutes");
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chatRoutes');
console.log("✅ auth.js file has been loaded successfully!");
console.log("✅ chatRoutes.js file has been loaded successfully!");

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    database: mongoose.connection.readyState === 1 ? "Healthy" : "Disconnected",
    server: "Healthy",
  });
});

// Mount routes
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin/hostel", adminHostelRoutes);
app.use("/api/student/hostel", studentHostelRoutes);
app.use("/api/admin/college", adminCollegeFeeRoutes);
app.use("/api/student/college", studentCollegeFeeRoutes);
app.use("/api/student/receipts", studentReceiptRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
// REMOVED: The broad alias `app.use('/api/student', studentReceiptRoutes)`
// was removed to prevent conflicts with other student routes.

// --- 6. ERROR HANDLING MIDDLEWARES ---
// 404 Not Found handler
app.use((req, res, next) => {
  const error = new Error("Invalid Route - Not Found");
  error.status = 404;
  next(error);
});

// General error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

// --- 7. SERVER & DATABASE CONNECTION ---
const PORT = process.env.PORT || keys.port || 5000;

const startServer = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || keys.mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log('WebSocket server initialized and listening.');
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

startServer();