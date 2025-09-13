const express = require('express');
const { body, query } = require('express-validator');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserStats
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', getUserStats);

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().trim()
], getUsers);

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', getUserById);

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], updateUser);

// @desc    Delete multiple users (Admin only)
// @route   DELETE /api/users/bulk
// @access  Private/Admin
router.delete('/bulk', protect, admin, bulkDeleteUsers);

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', deleteUser);

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  createUser
);

module.exports = router;

