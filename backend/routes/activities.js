const express = require('express');
const router = express.Router();
const {
  getActivities,
  getActivity,
  getFeaturedActivities,
  getActivityCategories,
  checkAvailability,
  createActivity,
  updateActivity,
  deleteActivity,
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
  createReservationAdmin,
  getActivityStats
} = require('../controllers/activityController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getActivities);
router.get('/featured', getFeaturedActivities);
router.get('/categories', getActivityCategories);
router.get('/stats', protect, admin, getActivityStats);

// Reservation routes
// Note: /reservations route must come before /:slug to avoid conflicts
router.post('/reservations', protect, admin, createReservationAdmin);
router.get('/reservations', protect, admin, getReservations);
router.get('/reservations/:id', protect, admin, getReservation);
router.put('/reservations/:id', protect, admin, updateReservation);
router.delete('/reservations/:id', protect, admin, deleteReservation);
router.post('/:id/reserve', optionalAuth, createReservation);

// Public routes with params - must be after specific routes
router.get('/:slug', getActivity);
router.get('/:id/availability', checkAvailability);


// Admin routes
router.post('/', protect, admin, createActivity);
router.put('/:id', protect, admin, updateActivity);
router.delete('/:id', protect, admin, deleteActivity);

module.exports = router;

