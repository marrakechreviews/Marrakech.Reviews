const express = require('express');
const { body, query } = require('express-validator');
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview
} = require('../controllers/reviewController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews
// @access  Private/Admin
router.get('/', protect, admin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('isApproved').optional().isBoolean().withMessage('isApproved must be a boolean'),
  query('product').optional().isMongoId().withMessage('Valid product ID required'),
  query('user').optional().isMongoId().withMessage('Valid user ID required')
], getAllReviews);

const createUploader = require('../middleware/upload');
const reviewImageUpload = createUploader({
    type: 'array',
    fieldName: 'images',
    maxCount: 5,
    prefix: 'review'
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, reviewImageUpload, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('product')
    .isMongoId()
    .withMessage('Valid product ID is required')
], createReview);

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['rating', '-rating', 'createdAt', '-createdAt', 'isHelpful', '-isHelpful']).withMessage('Invalid sort field')
], getProductReviews);

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
], updateReview);

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, deleteReview);

// @desc    Approve/Disapprove a review (Admin only)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
router.put('/:id/approve', protect, admin, [
  body('isApproved')
    .isBoolean()
    .withMessage('isApproved must be a boolean')
], approveReview);

module.exports = router;

