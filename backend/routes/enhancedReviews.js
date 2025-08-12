const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/enhancedReviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getReviews);
router.get('/stats', getReviewStats);
router.get('/product/:productId', getProductReviews);
router.get('/activity/:activityId', getActivityReviews);
router.get('/:id', getReview);
router.post('/', createReview);
router.put('/:id/helpful', markReviewHelpful);

// Protected admin routes
router.put('/:id/status', protect, admin, updateReviewStatus);
router.put('/:id/response', protect, admin, addBusinessResponse);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;

