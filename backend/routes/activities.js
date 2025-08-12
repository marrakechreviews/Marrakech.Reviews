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
  updateReservationStatus,
  getActivityStats
} = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getActivities);
router.get('/featured', getFeaturedActivities);
router.get('/categories', getActivityCategories);
router.get('/stats', protect, admin, getActivityStats);
router.get('/:slug', getActivity);
router.get('/:id/availability', checkAvailability);

// Reservation routes
router.post('/:id/reserve', createReservation);
router.get('/reservations/all', protect, admin, getReservations);
router.get('/reservations/:id', protect, admin, getReservation);
router.put('/reservations/:id/status', protect, admin, updateReservationStatus);

// Admin routes
router.post('/', protect, admin, createActivity);
router.put('/:id', protect, admin, updateActivity);
router.delete('/:id', protect, admin, deleteActivity);

module.exports = router;

