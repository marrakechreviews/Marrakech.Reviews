const express = require('express');
const router = express.Router();
const { getReservationByPaymentToken } = require('../controllers/reservationController');

router.get('/payment/:token', getReservationByPaymentToken);

module.exports = router;
