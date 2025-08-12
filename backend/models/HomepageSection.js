const mongoose = require('mongoose');

const homepageSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['hero', 'reviews', 'hosting', 'activities', 'stats', 'flights', 'categories', 'recommended_places', 'features', 'cta'],
    default: 'features'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    required: true,
    default: 0
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  styling: {
    backgroundColor: {
      type: String,
      default: 'bg-white'
    },
    textColor: {
      type: String,
      default: 'text-gray-900'
    },
    padding: {
      type: String,
      default: 'py-16'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for sorting
homepageSectionSchema.index({ sortOrder: 1, isEnabled: 1 });

// Pre-save middleware to update the updatedAt field
homepageSectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get enabled sections in order
homepageSectionSchema.statics.getEnabledSections = function() {
  return this.find({ isEnabled: true }).sort({ sortOrder: 1 });
};

// Static method to reorder sections
homepageSectionSchema.statics.reorderSections = async function(sectionIds) {
  const bulkOps = sectionIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { sortOrder: index + 1 }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);

