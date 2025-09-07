const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Reviewer name is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'refModel'
  },
  refModel: {
    type: String,
    required: true,
    enum: ['Product', 'Activity', 'OrganizedTravel', 'Article']
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound index to ensure one review per user per item
reviewSchema.index({ user: 1, refId: 1, refModel: 1 }, { unique: true });

// Index for reviews
reviewSchema.index({ refId: 1, refModel: 1, isApproved: 1, createdAt: -1 });

// Static method to calculate average rating for a referenced item
reviewSchema.statics.calcAverageRating = async function(refId, refModel) {
  if (!refModel) return;

  const stats = await this.aggregate([
    {
      $match: { 
        refId: refId,
        refModel: refModel,
        isApproved: true
      }
    },
    {
      $group: {
        _id: '$refId',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const Model = mongoose.model(refModel);
    if (stats.length > 0) {
      await Model.findByIdAndUpdate(refId, {
        rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal place
        numReviews: stats[0].numReviews
      });
    } else {
      await Model.findByIdAndUpdate(refId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error(`Error updating ${refModel} rating:`, error);
  }
};

// Call calcAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.refId, this.refModel);
});

// Call calcAverageRating after remove
reviewSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.refId, this.refModel);
});

// Call calcAverageRating after findOneAndDelete
reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.refId, doc.refModel);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

