const Activity = require('../models/Activity');
const ActivityReservation = require('../models/ActivityReservation');
const { sendReservationConfirmation, sendAdminNotification, sendReservationStatusUpdate } = require('../utils/emailService');
const asyncHandler = require('express-async-handler');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
const getActivities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};

  // isActive filter
  if (req.query.isActive) {
    // Allow fetching all (active and inactive) activities with ?isActive=all
    if (req.query.isActive !== 'all') {
      query.isActive = req.query.isActive === 'true';
    }
  } else {
    // By default, only fetch active activities for public view
    query.isActive = true;
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Location filter
  if (req.query.location) {
    query.location = { $regex: req.query.location, $options: 'i' };
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Search filter
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Sort options
  let sortOptions = {};
  switch (req.query.sort) {
    case 'price_asc':
      sortOptions = { price: 1 };
      break;
    case 'price_desc':
      sortOptions = { price: -1 };
      break;
    case 'rating':
      sortOptions = { rating: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'popular':
      sortOptions = { numReviews: -1 };
      break;
    default:
      sortOptions = { isFeatured: -1, rating: -1 };
  }

  const activities = await Activity.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const total = await Activity.countDocuments(query);

  res.json({
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single activity
// @route   GET /api/activities/:slug
// @access  Public
const getActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  });

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  res.json(activity);
});

// @desc    Get featured activities
// @route   GET /api/activities/featured
// @access  Public
const getFeaturedActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const activities = await Activity.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .sort({ rating: -1 })
    .limit(limit);

  res.json(activities);
});

// @desc    Get activity categories
// @route   GET /api/activities/categories
// @access  Public
const getActivityCategories = asyncHandler(async (req, res) => {
  const categories = await Activity.getCategoryStats();
  res.json(categories);
});

// @desc    Check activity availability
// @route   GET /api/activities/:id/availability
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }

  const isAvailable = await Activity.checkAvailability(req.params.id, date);
  
  res.json({ 
    available: isAvailable,
    date: new Date(date).toISOString().split('T')[0]
  });
});

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private/Admin
const createActivity = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Activity name is required to generate a slug.' });
      return;
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens

    const activity = new Activity({
      ...req.body,
      slug,
    });

    const createdActivity = await activity.save();
    res.status(201).json(createdActivity);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private/Admin
const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  Object.assign(activity, req.body);
  const updatedActivity = await activity.save();

  res.json(updatedActivity);
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private/Admin
const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  // Soft delete - just mark as inactive
  activity.isActive = false;
  await activity.save();

  res.json({ message: 'Activity deleted successfully' });
});

// @desc    Create activity reservation
// @route   POST /api/activities/:id/reserve
// @access  Public
const createReservation = asyncHandler(async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity || !activity.isActive) {
      res.status(404).json({ message: 'Activity not found or not available' });
      return;
    }

    const { customerInfo, reservationDate, numberOfPersons, notes } = req.body;

    // Validate required fields
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.whatsapp) {
      res.status(400).json({ message: 'Customer name, email, and WhatsApp are required' });
      return;
    }

    if (!reservationDate || !numberOfPersons) {
      res.status(400).json({ message: 'Reservation date and number of persons are required' });
      return;
    }

    // Check if number of persons is within limits
    if (numberOfPersons < activity.minParticipants || numberOfPersons > activity.maxParticipants) {
      res.status(400).json({ message: `Number of persons must be between ${activity.minParticipants} and ${activity.maxParticipants}` });
      return;
    }

    // Check availability for the date
    const isAvailable = await Activity.checkAvailability(activity._id, reservationDate);
    if (!isAvailable) {
      res.status(400).json({ message: 'Activity is not available on the selected date' });
      return;
    }

    // Calculate total price
    const totalPrice = activity.price * numberOfPersons;

    // Generate reservation ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const reservationId = `ACT-${timestamp}-${random}`.toUpperCase();

    // Create reservation
    const reservation = new ActivityReservation({
      reservationId,
      activity: activity._id,
      customerInfo,
      reservationDate: new Date(reservationDate),
      numberOfPersons,
      totalPrice,
      notes
    });

    const createdReservation = await reservation.save();
    await createdReservation.populate('activity', 'name location duration');

    /**
     * Send email notifications when a new reservation is created.
     */
    try {
      // Send confirmation email to customer
      const confirmationResult = await sendReservationConfirmation(createdReservation);
      if (confirmationResult.success) {
        createdReservation.confirmationSent = true;
        await createdReservation.save();
      }

      // Send notification email to admin
      await sendAdminNotification(createdReservation);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the reservation if email fails
    }

    res.status(201).json(createdReservation);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Get activity reservations
// @route   GET /api/activities/reservations
// @access  Private/Admin
const getReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Status filter
  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  // Payment status filter
  if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
    query.paymentStatus = req.query.paymentStatus;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    query.reservationDate = {};
    if (req.query.startDate) query.reservationDate.$gte = new Date(req.query.startDate);
    if (req.query.endDate) query.reservationDate.$lte = new Date(req.query.endDate);
  }

  // Activity filter
  if (req.query.activity) {
    query.activity = req.query.activity;
  }

  // Search filter
  if (req.query.search && req.query.search.trim() !== '') {
    const searchTerm = req.query.search;
    const regex = new RegExp(searchTerm, 'i');

    // Find activities that match the search term
    const matchingActivities = await Activity.find({ name: regex }).select('_id');
    const activityIds = matchingActivities.map(a => a._id);

    query.$or = [
      { 'customerInfo.name': regex },
      { 'customerInfo.email': regex },
      { 'activity': { $in: activityIds } }
    ];
  }

  const reservations = await ActivityReservation.find(query)
    .populate('activity', 'name category location duration price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ActivityReservation.countDocuments(query);

  res.json({
    reservations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single reservation
// @route   GET /api/activities/reservations/:id
// @access  Private/Admin
const getReservation = asyncHandler(async (req, res) => {
  const reservation = await ActivityReservation.findById(req.params.id)
    .populate('activity');

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  res.json(reservation);
});

// @desc    Admin Create activity reservation
// @route   POST /api/activities/reservations
// @access  Private/Admin
const createReservationAdmin = asyncHandler(async (req, res) => {
  try {
    const { activity, customerInfo, reservationDate, numberOfPersons, totalPrice, status, paymentStatus, notes } = req.body;

    if (!activity || !customerInfo || !reservationDate || !numberOfPersons) {
      return res.status(400).json({ message: 'Missing required fields for reservation.' });
    }

    // Generate reservation ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const reservationId = `ACT-ADM-${timestamp}-${random}`.toUpperCase();

    const reservation = new ActivityReservation({
      reservationId,
      activity,
      customerInfo,
      reservationDate: new Date(reservationDate),
      numberOfPersons,
      totalPrice,
      status: status || 'confirmed',
      paymentStatus: paymentStatus || 'pending',
      notes,
      createdBy: req.user._id, // Track who created it
    });

    const createdReservation = await reservation.save();
    await createdReservation.populate('activity', 'name');
    res.status(201).json(createdReservation);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Update reservation
// @route   PUT /api/activities/reservations/:id
// @access  Private/Admin
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await ActivityReservation.findById(req.params.id).populate('activity');

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const oldStatus = reservation.status;

  // Update all fields from the request body
  Object.assign(reservation, req.body);

  const updatedReservation = await reservation.save();
  await updatedReservation.populate('activity', 'name category location');

  /**
   * Send a status update email to the customer if the reservation status has changed.
   */
  if (req.body.status && oldStatus !== updatedReservation.status) {
    try {
      await sendReservationStatusUpdate(updatedReservation);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }
  }

  res.json(updatedReservation);
});

// @desc    Get activity stats
// @route   GET /api/activities/stats
// @access  Private/Admin
const getActivityStats = asyncHandler(async (req, res) => {
  const activityStats = await Activity.getActivityStats();
  const reservationStats = await ActivityReservation.getReservationStats();
  const popularActivities = await ActivityReservation.getPopularActivities(5);
  const monthlyStats = await ActivityReservation.getMonthlyStats();

  res.json({
    activities: activityStats,
    reservations: reservationStats,
    popular: popularActivities,
    monthly: monthlyStats
  });
});

// @desc    Delete reservation
// @route   DELETE /api/activities/reservations/:id
// @access  Private/Admin
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await ActivityReservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  await reservation.deleteOne();

  res.json({ message: 'Reservation removed' });
});

module.exports = {
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
};
