const express = require('express');
const { body, query } = require('express-validator');
const {
  submitContactForm,
  getContactSubmissions,
  getContactSubmission,
  updateContactSubmission,
  deleteContactSubmission
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Submit contact form (Public)
// @route   POST /api/contact
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('category')
    .optional()
    .isIn(['general', 'travel', 'review', 'partnership', 'feedback', 'technical'])
    .withMessage('Invalid category'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
], submitContactForm);

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', [
  protect,
  admin,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'resolved'])
    .withMessage('Invalid status'),
  
  query('category')
    .optional()
    .isIn(['general', 'travel', 'review', 'partnership', 'feedback', 'technical'])
    .withMessage('Invalid category'),
  
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
], getContactSubmissions);

// @desc    Get single contact submission (Admin only)
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get('/:id', [
  protect,
  admin
], getContactSubmission);

// @desc    Update contact submission (Admin only)
// @route   PUT /api/contact/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  admin,
  body('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'resolved'])
    .withMessage('Invalid status'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters'),
  
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean')
], updateContactSubmission);

// @desc    Delete contact submission (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', [
  protect,
  admin
], deleteContactSubmission);

module.exports = router;

