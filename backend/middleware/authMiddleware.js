const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  // Allow bypass for specific routes
  const bypassRoutes = [
    "/api/users",
    "/api/flights",
    "/api/instagram",
    "/api/products",
    "/api/orders",
    "/api/articles",
  ];

  if (bypassRoutes.includes(req.path)) {
    req.user = {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), // Valid ObjectId for bypass
      name: "Bypass User",
      email: "user@bypass.com",
      role: "user",
      isActive: true,
    };
    return next();
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Check for bypass mode
      if (token === "bypass-token") {
        // Create a mock admin user for bypass mode with valid ObjectId
        req.user = {
          _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), // Valid ObjectId for bypass
          name: "Bypass Admin",
          email: "admin@bypass.com",
          role: "admin",
          isActive: true,
        };
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

// Optional auth middleware (doesn't require authentication)
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Token is invalid, but we don't throw an error
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, admin, optionalAuth };


