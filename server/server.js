const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { setupSocket } = require("./socket/socketHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
      : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Add database indexes for optimization (run once on startup)
if (process.env.NODE_ENV !== "production") {
  const { addDatabaseIndexes } = require("./utils/dbOptimization");
  setTimeout(() => {
    addDatabaseIndexes().catch(console.error);
  }, 2000); // Wait 2 seconds for DB connection
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());

// CORS - Must be after helmet but before routes
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
      : ["https://devconnect-xi-woad.vercel.app/"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting - More lenient for development, strict on auth
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // More lenient for general API requests
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => process.env.NODE_ENV !== "production", // Disable in development
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict on auth endpoints
  message: "Too many login attempts, please try again later.",
  skip: (req) => process.env.NODE_ENV !== "production", // Disable in development
});

app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.io
setupSocket(io);

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/bookmarks", require("./routes/bookmark"));
app.use("/api/endorsements", require("./routes/endorsement"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/search", require("./routes/search"));

// Serve uploaded files with proper CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
);

// Health check endpoint for monitoring and Docker
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug endpoint to check env vars
app.get("/api/debug", (req, res) => {
  res.status(200).json({
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
});
