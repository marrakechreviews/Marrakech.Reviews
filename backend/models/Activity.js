const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true,
    maxlength: [100, 'Activity name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [300, 'Short description cannot be more than 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Activity price is required'],
    min: [0, 'Price cannot be negative']
  },
  marketPrice: {
    type: Number,
    required: [true, 'Market price is required'],
    min: [0, 'Market price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'MAD']
  },
  category: {
    type: String,
    required: [true, 'Activity category is required'],
    enum: [
      'Desert Tours',
      'City Tours',
      'Cultural Experiences',
      'Adventure Sports',
      'Food & Cooking',
      'Wellness & Spa',
      'Day Trips',
      'Multi-day Tours'
    ]
  },
  location: {
    type: String,
    required: [true, 'Activity location is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Activity duration is required'],
    trim: true
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Must allow at least 1 participant']
  },
  minParticipants: {
    type: Number,
    default: 1,
    min: [1, 'Must require at least 1 participant']
  },
  image: {
    type: String,
    required: [true, 'Activity image is required']
  },
  images: [{
    type: String
  }],
  included: [{
    type: String,
    trim: true
  }],
  excluded: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  cancellationPolicy: {
    type: String,
    default: 'Free cancellation up to 24 hours before the activity'
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  availability: {
    type: String,
    enum: ['Daily', 'Weekdays', 'Weekends', 'Custom'],
    default: 'Daily'
  },
  unavailableDates: [{
    type: Date
  }],
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Expert'],
    default: 'Easy'
  },
  ageRestriction: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 99
    }
  },
  languages: [{
    type: String,
    default: ['English', 'French', 'Arabic']
  }],
  meetingPoint: {
    type: String,
    trim: true
  },
  contactInfo: {
    phone: String,
    whatsapp: String,
    email: String
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot be more than 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot be more than 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activitySchema.index({ name: 'text', description: 'text', location: 'text' });
activitySchema.index({ category: 1 });
activitySchema.index({ location: 1 });
activitySchema.index({ price: 1 });
activitySchema.index({ rating: -1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ slug: 1 });
activitySchema.index({ isActive: 1 });
activitySchema.index({ isFeatured: 1 });

// Virtual for discount percentage
activitySchema.virtual('discountPercentage').get(function() {
  if (this.marketPrice && this.marketPrice > this.price) {
    return Math.round(((this.marketPrice - this.price) / this.marketPrice) * 100);
  }
  return 0;
});

// Virtual for savings amount
activitySchema.virtual('savings').get(function() {
  if (this.marketPrice && this.marketPrice > this.price) {
    return this.marketPrice - this.price;
  }
  return 0;
});

// Pre-save middleware to generate slug
activitySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  }
  next();
});

// Static method to get activity stats
activitySchema.statics.getActivityStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        activeActivities: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        featuredActivities: {
          $sum: {
            $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
          }
        },
        averagePrice: { $avg: '$price' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  return stats[0] || {
    totalActivities: 0,
    activeActivities: 0,
    featuredActivities: 0,
    averagePrice: 0,
    averageRating: 0
  };
};

// Static method to get category stats
activitySchema.statics.getCategoryStats = async function() {
  return await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        averageRating: { $avg: '$rating' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to check availability for a date
activitySchema.statics.checkAvailability = async function(activityId, date) {
  const activity = await this.findById(activityId);
  if (!activity || !activity.isActive) {
    return false;
  }

  // Check if date is in unavailable dates
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  const isUnavailable = activity.unavailableDates.some(unavailableDate => {
    const unavailableDateOnly = new Date(unavailableDate);
    unavailableDateOnly.setHours(0, 0, 0, 0);
    return unavailableDateOnly.getTime() === dateOnly.getTime();
  });

  if (isUnavailable) {
    return false;
  }

  // Check availability pattern
  const dayOfWeek = dateOnly.getDay(); // 0 = Sunday, 6 = Saturday
  
  switch (activity.availability) {
    case 'Daily':
      return true;
    case 'Weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case 'Weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Saturday and Sunday
    case 'Custom':
      // For custom availability, you might want to implement additional logic
      return true;
    default:
      return true;
  }
};

module.exports = mongoose.model('Activity', activitySchema);

