const mongoose = require('mongoose');

const instagramVideoSchema = new mongoose.Schema({
  // Instagram Video Information
  instagramId: {
    type: String,
    required: [true, 'Instagram video ID is required'],
    unique: true
  },
  instagramUrl: {
    type: String,
    required: [true, 'Instagram video URL is required']
  },
  embedUrl: {
    type: String,
    required: [true, 'Instagram embed URL is required']
  },
  
  // Video Details
  title: {
    type: String,
    required: [true, 'Video title is required'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  caption: {
    type: String,
    maxlength: [2000, 'Caption cannot be more than 2000 characters']
  },
  
  // Media Information
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number, // Duration in seconds
    min: [0, 'Duration cannot be negative']
  },
  
  // Engagement Metrics (can be updated periodically)
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  comments: {
    type: Number,
    default: 0,
    min: [0, 'Comments cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  
  // Display Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Categories and Tags
  category: {
    type: String,
    enum: ['travel', 'food', 'culture', 'adventure', 'tips', 'reviews', 'other'],
    default: 'travel'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Location Information
  location: {
    name: String,
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Admin Information
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  publishedAt: {
    type: Date,
    required: [true, 'Published date is required']
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  },
  
  // SEO and Display
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot be more than 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  }
}, {
  timestamps: true
});

// Indexes
instagramVideoSchema.index({ isActive: 1, displayOrder: 1 });
instagramVideoSchema.index({ isFeatured: 1, publishedAt: -1 });
instagramVideoSchema.index({ category: 1, isActive: 1 });
instagramVideoSchema.index({ tags: 1 });
instagramVideoSchema.index({ publishedAt: -1 });
instagramVideoSchema.index({ 'location.city': 1, 'location.country': 1 });

// Generate slug before saving
instagramVideoSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Add timestamp to ensure uniqueness
    this.slug += '-' + Date.now();
  }
  next();
});

// Static method to get featured videos
instagramVideoSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    isActive: true, 
    isFeatured: true 
  })
  .sort({ displayOrder: 1, publishedAt: -1 })
  .limit(limit)
  .populate('addedBy', 'name');
};

// Static method to get videos by category
instagramVideoSchema.statics.getByCategory = function(category, limit = 12) {
  return this.find({ 
    isActive: true, 
    category: category 
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .populate('addedBy', 'name');
};

// Static method to get recent videos
instagramVideoSchema.statics.getRecent = function(limit = 12) {
  return this.find({ isActive: true })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .populate('addedBy', 'name');
};

// Instance method to generate embed code
instagramVideoSchema.methods.getEmbedCode = function(width = 400, height = 500) {
  return `<iframe src="${this.embedUrl}" width="${width}" height="${height}" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
};

// Instance method to update metrics
instagramVideoSchema.methods.updateMetrics = function(metrics) {
  if (metrics.likes !== undefined) this.likes = metrics.likes;
  if (metrics.comments !== undefined) this.comments = metrics.comments;
  if (metrics.views !== undefined) this.views = metrics.views;
  this.lastSyncedAt = new Date();
  return this.save();
};

// Virtual for engagement rate
instagramVideoSchema.virtual('engagementRate').get(function() {
  if (this.views === 0) return 0;
  return ((this.likes + this.comments) / this.views * 100).toFixed(2);
});

// Virtual for formatted duration
instagramVideoSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'Unknown';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return `0:${seconds.toString().padStart(2, '0')}`;
});

// Ensure virtuals are included in JSON output
instagramVideoSchema.set('toJSON', { virtuals: true });
instagramVideoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InstagramVideo', instagramVideoSchema);

