const ActivityReservation = require('../models/ActivityReservation');
const asyncHandler = require('express-async-handler');

// @desc    Get reservation by payment token
// @route   GET /api/reservations/payment/:token
// @access  Public
const getReservationByPaymentToken = asyncHandler(async (req, res) => {
  const reservation = await ActivityReservation.findOne({
    paymentToken: req.params.token,
    paymentTokenExpires: { $gt: Date.now() },
  }).populate('activity', 'name');

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found or payment link expired');
  }

  res.json({ success: true, data: reservation });
});

module.exports = {
  getReservationByPaymentToken,
};
