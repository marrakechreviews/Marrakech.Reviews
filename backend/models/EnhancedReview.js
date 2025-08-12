const mongoose = require('mongoose');

const enhancedReviewSchema = new mongoose.Schema({
  // Reviewer Information
  name: {
    type: String,
    required: [true, 'Reviewer name is required']
  },
  email: {
    type: String,
    required: [true, 'Reviewer email is required']
  },
  
  // Review Content
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot be more than 2000 characters']
  },
  
  // Review Target (Product or Activity)
  reviewType: {
    type: String,
    required: true,
    enum: ['product', 'activity']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.reviewType === 'product'; }
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: function() { return this.reviewType === 'activity'; }
  },
  
  // User Reference (optional for guest reviews)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Review Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Additional Features
  verified: {
    type: Boolean,
    default: false // True if user actually purchased/booked the item
  },
  helpful: {
    type: Number,
    default: 0 // Number of users who found this review helpful
  },
  notHelpful: {
    type: Number,
    default: 0 // Number of users who found this review not helpful
  },
  
  // Media
  images: [{
    url: String,
    caption: String
  }],
  
  // Admin Notes
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot be more than 500 characters']
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  
  // Response from business
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'admin'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Indexes
enhancedReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
enhancedReviewSchema.index({ activity: 1, status: 1, createdAt: -1 });
enhancedReviewSchema.index({ user: 1, createdAt: -1 });
enhancedReviewSchema.index({ email: 1, createdAt: -1 });
enhancedReviewSchema.index({ status: 1, createdAt: -1 });
enhancedReviewSchema.index({ verified: 1, status: 1 });

// Compound index to prevent duplicate reviews
enhancedReviewSchema.index({ 
  user: 1, 
  product: 1, 
  activity: 1 
}, { 
  unique: true,
  partialFilterExpression: { user: { $exists: true } }
});

// Virtual for getting the target item
enhancedReviewSchema.virtual('targetItem', {
  refPath: 'reviewType',
  localField: function() {
    return this.reviewType === 'product' ? 'product' : 'activity';
  },
  foreignField: '_id'
});

// Static method to calculate average rating for products
enhancedReviewSchema.statics.calcProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { 
        product: productId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingBreakdown: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: { $toString: '$$this' }, v: {
                      $size: {
                        $filter: {
                          input: '$ratingDistribution',
                          cond: { $eq: ['$$item', '$$this'] }
                        }
                      }
                    }}
                  ]]
                }
              ]
            }
          }
        }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews,
        ratingBreakdown: stats[0].ratingBreakdown
      });
    } else {
      await this.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
        ratingBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Static method to calculate average rating for activities
enhancedReviewSchema.statics.calcActivityRating = async function(activityId) {
  const stats = await this.aggregate([
    {
      $match: { 
        activity: activityId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$activity',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingBreakdown: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: { $toString: '$$this' }, v: {
                      $size: {
                        $filter: {
                          input: '$ratingDistribution',
                          cond: { $eq: ['$$item', '$$this'] }
                        }
                      }
                    }}
                  ]]
                }
              ]
            }
          }
        }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await this.model('Activity').findByIdAndUpdate(activityId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews,
        ratingBreakdown: stats[0].ratingBreakdown
      });
    } else {
      await this.model('Activity').findByIdAndUpdate(activityId, {
        rating: 0,
        numReviews: 0,
        ratingBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      });
    }
  } catch (error) {
    console.error('Error updating activity rating:', error);
  }
};

// Method to update ratings after review changes
enhancedReviewSchema.methods.updateTargetRating = function() {
  if (this.reviewType === 'product' && this.product) {
    this.constructor.calcProductRating(this.product);
  } else if (this.reviewType === 'activity' && this.activity) {
    this.constructor.calcActivityRating(this.activity);
  }
};

// Middleware to update ratings
enhancedReviewSchema.post('save', function() {
  this.updateTargetRating();
});

enhancedReviewSchema.post('remove', function() {
  this.updateTargetRating();
});

enhancedReviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.updateTargetRating();
  }
});

enhancedReviewSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    doc.updateTargetRating();
  }
});

module.exports = mongoose.model('EnhancedReview', enhancedReviewSchema);

