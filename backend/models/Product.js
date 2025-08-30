const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [100, "Product name cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    maxlength: [2000, "Description cannot be more than 2000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
  },
  comparePrice: {
    type: Number,
    min: [0, "Compare price cannot be negative"],
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "Product brand is required"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Product image is required"],
  },
  images: [
    {
      type: String,
    },
  ],
  countInStock: {
    type: Number,
    required: [true, "Stock count is required"],
    min: [0, "Stock cannot be negative"],
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, "Rating cannot be negative"],
    max: [5, "Rating cannot be more than 5"],
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, "Number of reviews cannot be negative"],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  specifications: {
    type: Map,
    of: String,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  weight: {
    type: Number,
    min: [0, "Weight cannot be negative"],
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  seoTitle: {
    type: String,
    maxlength: [60, "SEO title cannot be more than 60 characters"],
  },
  seoDescription: {
    type: String,
    maxlength: [160, "SEO description cannot be more than 160 characters"],
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  slug: {
    type: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ slug: 1 }, { unique: true });

// Virtual for checking if product is low in stock
productSchema.virtual("isLowStock").get(function () {
  return this.countInStock <= this.lowStockThreshold;
});

// Virtual for checking if product is out of stock
productSchema.virtual("isOutOfStock").get(function () {
  return this.countInStock === 0;
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Pre-save middleware to generate slug
productSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim("-"); // Remove leading/trailing hyphens
  }
  next();
});

// Static method to get product stats
productSchema.statics.getProductStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
        featuredProducts: {
          $sum: {
            $cond: [{ $eq: ["$isFeatured", true] }, 1, 0],
          },
        },
        outOfStockProducts: {
          $sum: {
            $cond: [{ $eq: ["$countInStock", 0] }, 1, 0],
          },
        },
        averagePrice: { $avg: "$price" },
        totalValue: { $sum: { $multiply: ["$price", "$countInStock"] } },
      },
    },
  ]);

  return stats[0] || {
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    outOfStockProducts: 0,
    averagePrice: 0,
    totalValue: 0,
  };
};

// Static method to get category stats
productSchema.statics.getCategoryStats = async function () {
  return await this.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        averagePrice: { $avg: "$price" },
        averageRating: { $avg: "$rating" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

module.exports = mongoose.model("Product", productSchema);


