const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const mongoose = require('mongoose');

const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { rating, comment, refId, refModel } = req.body;

    // Validate refModel
    if (!['Product', 'Activity', 'OrganizedTravel', 'Article'].includes(refModel)) {
      return res.status(400).json({ success: false, message: 'Invalid reference model' });
    }

    // Check if referenced item exists
    const Model = mongoose.model(refModel);
    const itemExists = await Model.findById(refId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: `${refModel} not found` });
    }

    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({ user: req.user._id, refId, refModel });
    if (existingReview) {
      return res.status(400).json({ success: false, message: `You have already reviewed this ${refModel.toLowerCase()}` });
    }

    // Create review
    const reviewData = {
      name: req.user.name,
      rating,
      comment,
      user: req.user._id,
      refId,
      refModel,
    };

    if (req.files) {
      reviewData.images = req.files.map(file => file.path);
    }

    const review = await Review.create(reviewData);

    res.status(201).json({ success: true, message: 'Review created successfully', data: review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating review' });
  }
};

// @desc    Get reviews for a specific item
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { refId, refModel } = req.query;

    if (!refId || !refModel) {
      return res.status(400).json({ success: false, message: 'refId and refModel are required query parameters' });
    }

    if (!['Product', 'Activity', 'OrganizedTravel', 'Article'].includes(refModel)) {
      return res.status(400).json({ success: false, message: 'Invalid reference model' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let sort = { createdAt: -1 };
    if (req.query.sort) {
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      const sortField = req.query.sort.replace(/^-/, '');
      sort = { [sortField]: sortOrder };
    }

    const filter = {
      refId: mongoose.Types.ObjectId(refId),
      refModel,
      isApproved: true
    };

    const reviews = await Review.find(filter)
      .populate('user', 'name image')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Review.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const ratingStats = await Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      ratingStats
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid refId' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching reviews' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update fields
    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    // Reset approval status when review is updated
    review.isApproved = true; // Auto-approve updates, or set to false for manual approval

    const updatedReview = await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === 'true';
    }
    if (req.query.refId) {
      filter.refId = req.query.refId;
    }
    if (req.query.refModel) {
      filter.refModel = req.query.refModel;
    }
    if (req.query.user) {
      filter.user = req.query.user;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('refId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Review.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

// @desc    Approve/Disapprove a review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const approveReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isApproved = req.body.isApproved;
    const updatedReview = await review.save();

    res.json({
      success: true,
      message: `Review ${req.body.isApproved ? 'approved' : 'disapproved'} successfully`,
      data: updatedReview
    });
  } catch (error) {
    console.error('Approve review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating review approval'
    });
  }
};

const bulkImportReviews = async (req, res) => {
  const { reviews } = req.body;

  if (!reviews || !Array.isArray(reviews)) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Add user id to each review
  const reviewsWithUser = reviews.map(r => ({ ...r, user: req.user._id }));

  try {
    const result = await Review.insertMany(reviewsWithUser, { ordered: false });
    successCount = result.length;
  } catch (error) {
    successCount = error.result.nInserted;
    errorCount = error.result.writeErrors.length;
    errors.push(...error.result.writeErrors);
  }

  res.status(201).json({
    success: true,
    message: `Import complete. ${successCount} reviews imported, ${errorCount} failed.`,
    successCount,
    errorCount,
    errors,
  });
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  bulkImportReviews,
};

