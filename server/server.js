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

// Increase header size limits
server.maxHeadersCount = 2000;
server.headersTimeout = 60000;
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for your specific frontend URL in production
    methods: ["GET", "POST"],
  },
});

// --- 3. MIDDLEWARES ---
app.use(cors());
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload());
app.use(passport.initialize());
require("./config/passport")(passport);

// --- 4. SOCKET.IO LOGIC ---
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join room", ({ room1, room2 }) => {
    socket.join(room1);
    socket.join(room2);
  });

  socket.on("private message", (message) => {
    // Emitting to the specific room
    io.to(message.room).emit("new Message", {
      message: message.message,
      sender: message.sender,
    });
  });

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
console.log("✅ auth.js file has been loaded successfully!");

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