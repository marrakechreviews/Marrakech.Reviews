const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const uploadRoutes = require("./routes/upload");
const articleRoutes = require("./routes/articles");
const settingsRoutes = require("./routes/settings");
const activityRoutes = require("./routes/activities");
const homepageSectionsRoutes = require("./routes/homepageSections");
const analyticsRoutes = require("./routes/analytics");
const enhancedReviewsRoutes = require("./routes/enhancedReviews");
const instagramRoutes = require("./routes/instagram");
const organizedTravelRoutes = require("./routes/organizedTravel");
const contactRoutes = require("./routes/contact");
const articleGeneratorRoutes = require("./routes/articleGenerator");
const productGeneratorRoutes = require("./routes/productGenerator");
const bulkRoutes = require("./routes/bulk");
const sitemapRoutes = require("./routes/sitemap");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting disabled for development

// CORS configuration - More permissive for development
let corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["https://www.marrakech.reviews", "http://localhost:5000", "http://localhost:3000", "http://localhost:5173", "https://marrakech-reviews-sigma.vercel.app", "https://marrakech-reviews-backend.vercel.app/", "https://admin.marrakech.reviews"];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.options("/api/products", cors());
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.options("/api/articles", cors());
app.use("/api/articles", articleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/reservations", activityRoutes); // Add reservations route
app.use("/api/homepage-sections", homepageSectionsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/enhanced-reviews", enhancedReviewsRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/organized-travel", organizedTravelRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", articleGeneratorRoutes);
app.use("/api", productGeneratorRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/", sitemapRoutes);

// Root route handler for token-based requests
app.get("/", (req, res) => {
  const { token } = req.query;
  
  if (token) {
    // Handle token-based access
    res.status(200).json({
      success: true,
      message: "Token received successfully",
      token: token,
      timestamp: new Date().toISOString()
    });
  } else {
    // Default root response
    res.status(200).json({
      success: true,
      message: "Enhanced E-commerce Backend API",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

module.exports = app;




// Handle favicon.png requests to prevent 404 errors
app.get("/favicon.png", (req, res) => res.status(204).send());
