const FlightReservation = require('../models/FlightReservation');
const emailService = require('../utils/emailService');

// Get all flight reservations (Admin)
const getAllFlightReservations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.supplier) {
      filter['referralInfo.supplier'] = req.query.supplier;
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { 'customerInfo.firstName': searchRegex },
        { 'customerInfo.lastName': searchRegex },
        { 'customerInfo.email': searchRegex },
        { bookingReference: searchRegex },
        { 'flightDetails.departure.city': searchRegex },
        { 'flightDetails.arrival.city': searchRegex }
      ];
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      filter['flightDetails.departure.date'] = {};
      if (req.query.dateFrom) {
        filter['flightDetails.departure.date'].$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter['flightDetails.departure.date'].$lte = new Date(req.query.dateTo);
      }
    }

    const reservations = await FlightReservation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('processedBy', 'name email');

    const total = await FlightReservation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching flight reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight reservations',
      error: error.message
    });
  }
};

// Get single flight reservation
const getFlightReservation = async (req, res) => {
  try {
    const reservation = await FlightReservation.findById(req.params.id)
      .populate('processedBy', 'name email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Flight reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error fetching flight reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight reservation',
      error: error.message
    });
  }
};

// Create new flight reservation
const createFlightReservation = async (req, res) => {
  try {
    const reservationData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'customerInfo.firstName',
      'customerInfo.lastName', 
      'customerInfo.email',
      'customerInfo.phone',
      'customerInfo.whatsapp',
      'flightDetails.departure.airport',
      'flightDetails.departure.city',
      'flightDetails.departure.country',
      'flightDetails.departure.date',
      'flightDetails.arrival.airport',
      'flightDetails.arrival.city',
      'flightDetails.arrival.country',
      'pricing.basePrice',
      'referralInfo.supplier'
    ];

    for (const field of requiredFields) {
      const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], reservationData);
      if (!fieldValue) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    const reservation = new FlightReservation(reservationData);
    await reservation.save();

    // Send confirmation email to customer
    try {
      await emailService.sendFlightReservationConfirmation(reservation);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the reservation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Flight reservation created successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error creating flight reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating flight reservation',
      error: error.message
    });
  }
};

// Update flight reservation
const updateFlightReservation = async (req, res) => {
  try {
    const reservation = await FlightReservation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('processedBy', 'name email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Flight reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Flight reservation updated successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error updating flight reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating flight reservation',
      error: error.message
    });
  }
};

// Delete flight reservation
const deleteFlightReservation = async (req, res) => {
  try {
    const reservation = await FlightReservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Flight reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Flight reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting flight reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting flight reservation',
      error: error.message
    });
  }
};

// Get flight reservation statistics
const getFlightReservationStats = async (req, res) => {
  try {
    const stats = await FlightReservation.aggregate([
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalPrice' },
          totalCommission: { $sum: '$pricing.referralCommission' },
          averagePrice: { $avg: '$pricing.totalPrice' }
        }
      }
    ]);

    const statusStats = await FlightReservation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const supplierStats = await FlightReservation.aggregate([
      {
        $group: {
          _id: '$referralInfo.supplier',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalPrice' },
          commission: { $sum: '$pricing.referralCommission' }
        }
      }
    ]);

    const monthlyStats = await FlightReservation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalPrice' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalReservations: 0,
          totalRevenue: 0,
          totalCommission: 0,
          averagePrice: 0
        },
        statusBreakdown: statusStats,
        supplierBreakdown: supplierStats,
        monthlyTrends: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching flight reservation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight reservation statistics',
      error: error.message
    });
  }
};

// Get flight reservation by booking reference
const getFlightReservationByReference = async (req, res) => {
  try {
    const reservation = await FlightReservation.findOne({
      bookingReference: req.params.reference.toUpperCase()
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Flight reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error fetching flight reservation by reference:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight reservation',
      error: error.message
    });
  }
};

module.exports = {
  getAllFlightReservations,
  getFlightReservation,
  createFlightReservation,
  updateFlightReservation,
  deleteFlightReservation,
  getFlightReservationStats,
  getFlightReservationByReference
};

