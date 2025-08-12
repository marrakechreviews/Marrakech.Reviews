const express = require('express');
const router = express.Router();
const {
  getAllFlightReservations,
  getFlightReservation,
  createFlightReservation,
  updateFlightReservation,
  deleteFlightReservation,
  getFlightReservationStats,
  getFlightReservationByReference
} = require('../controllers/flightController');

// Public routes
router.post('/', createFlightReservation);
router.get('/reference/:reference', getFlightReservationByReference);

// Admin routes (add authentication middleware as needed)
router.get('/', getAllFlightReservations);
router.get('/stats', getFlightReservationStats);
router.get('/:id', getFlightReservation);
router.put('/:id', updateFlightReservation);
router.delete('/:id', deleteFlightReservation);

module.exports = router;

