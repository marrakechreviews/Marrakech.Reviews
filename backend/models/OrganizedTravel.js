const mongoose = require("mongoose");
const crypto = require('crypto');

const itineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  activities: [{
    type: String
  }]
});

const organizedTravelSchema = new mongoose.Schema({
  refId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  maxGroupSize: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  itinerary: [itineraryDaySchema],
  included: [{
    type: String
  }],
  excluded: [{
    type: String
  }],
  heroImage: {
    type: String,
    default: ""
  },
  gallery: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    default: 'moderate'
  },
  category: {
    type: String,
    enum: ['cultural', 'adventure', 'relaxation', 'culinary', 'historical'],
    default: 'cultural'
  },
  highlights: [{
    type: String
  }],
  meetingPoint: {
    type: String,
    default: ""
  },
  cancellationPolicy: {
    type: String,
    default: "Free cancellation up to 24 hours before the start date"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  seasonality: {
    bestMonths: [{
      type: String
    }],
    notes: String
  },
  requirements: {
    minAge: {
      type: Number,
      default: 0
    },
    maxAge: {
      type: Number
    },
    fitnessLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'low'
    },
    specialRequirements: [{
      type: String
    }]
  },
  slug: {
    type: String,
    sparse: true
  },
  seoTitle: {
    type: String,
    maxlength: [60, "SEO title cannot be more than 60 characters"]
  },
  seoDescription: {
    type: String,
    maxlength: [1600, "SEO description cannot be more than 160 characters"]
  },
  seoKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better search performance
organizedTravelSchema.index({ destination: 1, isActive: 1 });
organizedTravelSchema.index({ title: 'text', description: 'text' });
organizedTravelSchema.index({ featured: -1, createdAt: -1 });
organizedTravelSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Virtual for formatted price
organizedTravelSchema.virtual('formattedPrice').get(function() {
  return `$${this.price}`;
});

// Virtual for duration in days
organizedTravelSchema.virtual('durationInDays').get(function() {
  const match = this.duration.match(/(\d+)\s*days?/i);
  return match ? parseInt(match[1]) : 1;
});

// Method to calculate total price for group
organizedTravelSchema.methods.calculateGroupPrice = function(numberOfTravelers) {
  return this.price * numberOfTravelers;
};

// Static method to find by destination
organizedTravelSchema.statics.findByDestination = function(destination) {
  return this.findOne({ 
    destination: { $regex: new RegExp(destination, 'i') },
    isActive: true 
  });
};

// Static method to get featured programs
organizedTravelSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ featured: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get travel stats
organizedTravelSchema.statics.getTravelStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPrograms: { $sum: 1 },
        activePrograms: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
        featuredPrograms: {
          $sum: {
            $cond: [{ $eq: ["$featured", true] }, 1, 0],
          },
        },
        averagePrice: { $avg: "$price" },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  return stats[0] || {
    totalPrograms: 0,
    activePrograms: 0,
    featuredPrograms: 0,
    averagePrice: 0,
    averageRating: 0,
  };
};

// Pre-save middleware to update slug and generate refId
organizedTravelSchema.pre('save', function(next) {
  // Generate refId for new documents
  if (this.isNew && !this.refId) {
    this.refId = crypto.randomBytes(8).toString('hex');
  }

  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const OrganizedTravel = mongoose.model("OrganizedTravel", organizedTravelSchema);

module.exports = OrganizedTravel;

