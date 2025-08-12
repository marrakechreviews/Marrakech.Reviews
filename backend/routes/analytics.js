const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getVisitAnalytics,
  getReservationAnalytics,
  trackVisit,
  getCustomerAnalytics
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/track', trackVisit);

// Protected admin routes (temporarily removing auth for development)
router.get('/dashboard', getDashboardAnalytics);
router.get('/visits', getVisitAnalytics);
router.get('/reservations', getReservationAnalytics);
router.get('/customers', getCustomerAnalytics);

module.exports = router;

