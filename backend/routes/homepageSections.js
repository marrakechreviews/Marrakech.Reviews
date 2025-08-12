const express = require('express');
const router = express.Router();
const {
  getAllSections,
  getEnabledSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  toggleSection,
  reorderSections,
  initializeDefaultSections
} = require('../controllers/homepageSectionController');

// Get all sections (admin)
router.get('/', getAllSections);

// Get enabled sections only (public)
router.get('/enabled', getEnabledSections);

// Initialize default sections
router.post('/initialize', initializeDefaultSections);

// Reorder sections
router.put('/reorder', reorderSections);

// Get single section by ID
router.get('/:id', getSectionById);

// Create new section
router.post('/', createSection);

// Update section
router.put('/:id', updateSection);

// Toggle section enabled/disabled
router.patch('/:id/toggle', toggleSection);

// Delete section
router.delete('/:id', deleteSection);

module.exports = router;

