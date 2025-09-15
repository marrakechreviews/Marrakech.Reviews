const express = require('express');
const { body, query } = require('express-validator');
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  deleteAllReviews,
  bulkDeleteReviews,
  getAllReviews,
  approveReview,
  bulkImportReviews
} = require('../controllers/reviewController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return getAllReviews(req, res, next);
  }
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

router.post('/bulk-import', protect, admin, bulkImportReviews);

router.delete('/bulk', protect, admin, bulkDeleteReviews);

router.delete('/all', protect, admin, deleteAllReviews);

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

router.delete('/:id', protect, deleteReview);

router.put('/:id/approve', protect, admin, [
  body('isApproved')
    .isBoolean()
    .withMessage('isApproved must be a boolean')
], approveReview);

module.exports = router;
