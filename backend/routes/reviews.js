const express = require('express');
const { body, query } = require('express-validator');
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview
} = require('../controllers/reviewController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get reviews
// @route   GET /api/reviews
// @access  Public (for item reviews), Private/Admin (for all reviews)
router.get('/', optionalAuth, (req, res, next) => {
  // If user is admin and authenticated, use the admin controller
  if (req.user && req.user.role === 'admin') {
    return getAllReviews(req, res, next);
  }
  // Otherwise, use the public controller
  return getReviews(req, res, next);
}, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['rating', '-rating', 'createdAt', '-createdAt', 'isHelpful', '-isHelpful']).withMessage('Invalid sort field'),
  query('refId').optional().isMongoId().withMessage('Valid refId required'),
  query('refModel').optional().isString().withMessage('Valid refModel required'),
  query('isApproved').optional().isBoolean().withMessage('isApproved must be a boolean'),
  query('user').optional().isMongoId().withMessage('Valid user ID required')
]);


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
  body('refId')
    .isMongoId()
    .withMessage('A valid reference ID is required'),
  body('refModel')
    .isIn(['Product', 'Activity', 'OrganizedTravel', 'Article'])
    .withMessage('A valid reference model is required')
], createReview);

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

