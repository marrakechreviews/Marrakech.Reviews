const express = require('express');
const router = express.Router();
const { getReservationByPaymentToken, getMyReservations } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');


router.get('/payment/:token', getReservationByPaymentToken);
router.get('/myreservations', protect, getMyReservations);


module.exports = router;
