const EnhancedReview = require('../models/EnhancedReview');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all reviews with filtering and pagination
// @route   GET /api/enhanced-reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    reviewType,
    product,
    activity,
    rating,
    verified,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (status) filter.status = status;
  if (reviewType) filter.reviewType = reviewType;
  if (product) filter.product = product;
  if (activity) filter.activity = activity;
  if (rating) filter.rating = parseInt(rating);
  if (verified !== undefined) filter.verified = verified === 'true';

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await EnhancedReview.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug image')
    .populate('activity', 'name slug image')
    .populate('moderatedBy', 'name')
    .populate('response.respondedBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EnhancedReview.countDocuments(filter);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get single review
// @route   GET /api/enhanced-reviews/:id
// @access  Public
const getReview = asyncHandler(async (req, res) => {
  const review = await EnhancedReview.findById(req.params.id)
    .populate('user', 'name email')
    .populate('product', 'name slug image price')
    .populate('activity', 'name slug image price')
    .populate('moderatedBy', 'name')
    .populate('response.respondedBy', 'name');

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  res.json({
    success: true,
    data: review
  });
});

// @desc    Create new review
// @route   POST /api/enhanced-reviews
// @access  Public
const createReview = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    rating,
    title,
    comment,
    reviewType,
    product,
    activity,
    images
  } = req.body;

  // Validate required fields
  if (!name || !email || !rating || !title || !comment || !reviewType) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate review type and target
  if (reviewType === 'product' && !product) {
    res.status(400);
    throw new Error('Product ID is required for product reviews');
  }

  if (reviewType === 'activity' && !activity) {
    res.status(400);
    throw new Error('Activity ID is required for activity reviews');
  }

  // Check if target exists
  if (reviewType === 'product') {
    const productExists = await Product.findById(product);
    if (!productExists) {
      res.status(404);
      throw new Error('Product not found');
    }
  }

  if (reviewType === 'activity') {
    const activityExists = await Activity.findById(activity);
    if (!activityExists) {
      res.status(404);
      throw new Error('Activity not found');
    }
  }

  // Check for existing review from same user/email
  const existingReview = await EnhancedReview.findOne({
    email,
    ...(reviewType === 'product' ? { product } : { activity })
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this item');
  }

  // Create review data
  const reviewData = {
    name,
    email,
    rating,
    title,
    comment,
    reviewType,
    images: images || [],
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    source: 'website'
  };

  // Add target reference
  if (reviewType === 'product') {
    reviewData.product = product;
  } else {
    reviewData.activity = activity;
  }

  // Add user reference if authenticated
  if (req.user) {
    reviewData.user = req.user._id;
    reviewData.verified = true; // Can be enhanced to check actual purchase/booking
  }

  const review = await EnhancedReview.create(reviewData);

  // Populate the created review
  const populatedReview = await EnhancedReview.findById(review._id)
    .populate('user', 'name email')
    .populate('product', 'name slug image')
    .populate('activity', 'name slug image');

  res.status(201).json({
    success: true,
    data: populatedReview,
    message: 'Review submitted successfully and is pending approval'
  });
});

// @desc    Update review status (Admin only)
// @route   PUT /api/enhanced-reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const review = await EnhancedReview.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.status = status;
  review.adminNotes = adminNotes || review.adminNotes;
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();

  await review.save();

  const updatedReview = await EnhancedReview.findById(review._id)
    .populate('user', 'name email')
    .populate('product', 'name slug image')
    .populate('activity', 'name slug image')
    .populate('moderatedBy', 'name');

  res.json({
    success: true,
    data: updatedReview,
    message: `Review ${status} successfully`
  });
});

// @desc    Add business response to review (Admin only)
// @route   PUT /api/enhanced-reviews/:id/response
// @access  Private/Admin
const addBusinessResponse = asyncHandler(async (req, res) => {
  const { responseText } = req.body;

  if (!responseText) {
    res.status(400);
    throw new Error('Response text is required');
  }

  const review = await EnhancedReview.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.response = {
    text: responseText,
    respondedBy: req.user._id,
    respondedAt: new Date()
  };

  await review.save();

  const updatedReview = await EnhancedReview.findById(review._id)
    .populate('user', 'name email')
    .populate('product', 'name slug image')
    .populate('activity', 'name slug image')
    .populate('response.respondedBy', 'name');

  res.json({
    success: true,
    data: updatedReview,
    message: 'Business response added successfully'
  });
});

// @desc    Mark review as helpful/not helpful
// @route   PUT /api/enhanced-reviews/:id/helpful
// @access  Public
const markReviewHelpful = asyncHandler(async (req, res) => {
  const { helpful } = req.body; // true for helpful, false for not helpful

  const review = await EnhancedReview.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (helpful === true) {
    review.helpful += 1;
  } else if (helpful === false) {
    review.notHelpful += 1;
  } else {
    res.status(400);
    throw new Error('Please specify if the review is helpful (true) or not helpful (false)');
  }

  await review.save();

  res.json({
    success: true,
    data: {
      helpful: review.helpful,
      notHelpful: review.notHelpful
    },
    message: 'Thank you for your feedback'
  });
});

// @desc    Delete review (Admin only)
// @route   DELETE /api/enhanced-reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await EnhancedReview.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.remove();

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get review statistics
// @route   GET /api/enhanced-reviews/stats
// @access  Private/Admin
const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await EnhancedReview.aggregate([
    {
      $facet: {
        statusStats: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        typeStats: [
          {
            $group: {
              _id: '$reviewType',
              count: { $sum: 1 },
              averageRating: { $avg: '$rating' }
            }
          }
        ],
        ratingStats: [
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ],
        monthlyStats: [
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 },
              averageRating: { $avg: '$rating' }
            }
          },
          {
            $sort: { '_id.year': -1, '_id.month': -1 }
          },
          {
            $limit: 12
          }
        ],
        totalStats: [
          {
            $group: {
              _id: null,
              totalReviews: { $sum: 1 },
              averageRating: { $avg: '$rating' },
              verifiedReviews: {
                $sum: { $cond: ['$verified', 1, 0] }
              },
              reviewsWithResponse: {
                $sum: { $cond: [{ $ne: ['$response.text', null] }, 1, 0] }
              }
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0]
  });
});

// @desc    Get reviews for a specific product
// @route   GET /api/enhanced-reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const filter = {
    product: req.params.productId,
    status: 'approved'
  };

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await EnhancedReview.find(filter)
    .populate('user', 'name')
    .populate('response.respondedBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EnhancedReview.countDocuments(filter);

  // Get rating breakdown
  const ratingBreakdown = await EnhancedReview.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  ratingBreakdown.forEach(item => {
    breakdown[item._id.toString()] = item.count;
  });

  res.json({
    success: true,
    data: reviews,
    ratingBreakdown: breakdown,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get reviews for a specific activity
// @route   GET /api/enhanced-reviews/activity/:activityId
// @access  Public
const getActivityReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const filter = {
    activity: req.params.activityId,
    status: 'approved'
  };

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await EnhancedReview.find(filter)
    .populate('user', 'name')
    .populate('response.respondedBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EnhancedReview.countDocuments(filter);

  // Get rating breakdown
  const ratingBreakdown = await EnhancedReview.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  ratingBreakdown.forEach(item => {
    breakdown[item._id.toString()] = item.count;
  });

  res.json({
    success: true,
    data: reviews,
    ratingBreakdown: breakdown,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReviewStatus,
  addBusinessResponse,
  markReviewHelpful,
  deleteReview,
  getReviewStats,
  getProductReviews,
  getActivityReviews
};

