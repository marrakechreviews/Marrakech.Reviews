const express = require('express');
const { body } = require('express-validator');
const {
  getSettings,
  updateSettings,
  updateSettingsSection,
  getSettingsSection,
  getPublicSettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
router.get('/public', getPublicSettings);

// @desc    Get all settings (Admin only)
// @route   GET /api/settings
// @access  Private/Admin
router.get('/', protect, admin, getSettings);

// @desc    Update all settings (Admin only)
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, [
  body('section').notEmpty().withMessage('Section is required'),
  body('data').notEmpty().withMessage('Data is required')
], updateSettings);

// @desc    Get specific section of settings
// @route   GET /api/settings/:section
// @access  Public (filtered for sensitive data)
router.get('/:section', getSettingsSection);

// @desc    Update specific section of settings (Admin only)
// @route   PUT /api/settings/:section
// @access  Private/Admin
router.put('/:section', protect, admin, updateSettingsSection);

module.exports = router;

