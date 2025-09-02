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
const reservationRoutes = require("./routes/reservations");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting disabled for development

// CORS configuration
const allowedOrigins = [
    "https://www.marrakech.reviews",
    "http://localhost:5000",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://marrakech-reviews-sigma.vercel.app",
    "https://marrakech-reviews-backend.vercel.app",
    "https://admin.marrakech.reviews"
];

if (process.env.CORS_ORIGIN) {
    const customOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    allowedOrigins.push(...customOrigins);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
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
app.use("/api/reservations", reservationRoutes); // Corrected route
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend assets and handle client-side routing
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
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

// Handle favicon.png requests to prevent 404 errors
app.get("/favicon.png", (req, res) => res.status(204).send());

module.exports = app;
