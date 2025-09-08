const express = require("express");
const router = express.Router();
const { Parser } = require('json2csv');
const OrganizedTravel = require("../models/OrganizedTravel");
const TravelReservation = require("../models/TravelReservation");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  sendTravelReservationConfirmation,
  sendTravelAdminNotification,
  sendReservationUpdateNotification
} = require('../utils/emailService');

// @desc    Export organized travels to CSV
// @route   POST /api/organized-travel/export
// @access  Private/Admin
router.post("/export", protect, admin, async (req, res) => {
  try {
    const { ids } = req.body;

    let travels;
    if (ids && ids.length > 0) {
      travels = await OrganizedTravel.find({ _id: { $in: ids } });
    } else {
      travels = await OrganizedTravel.find({});
    }

    const travelsData = travels.map(travel => {
      return {
        refId: travel.refId,
        refModel: 'OrganizedTravel',
        title: travel.title,
        destination: travel.destination,
        price: travel.price,
        duration: travel.duration,
        isActive: travel.isActive,
        createdAt: travel.createdAt.toDateString(),
      };
    });

    const fields = ['refId', 'refModel', 'title', 'destination', 'price', 'duration', 'isActive', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(travelsData);

    res.header('Content-Type', 'text/csv');
    res.attachment('organized-travels.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all organized travel programs
// @route   GET /api/organized-travel
// @access  Public
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const stats = await OrganizedTravel.getTravelStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const programs = await OrganizedTravel.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get organized travel program by destination
// @route   GET /api/organized-travel/:destination
// @access  Public
router.get("/:destination", async (req, res) => {
  try {
    const { destination } = req.params;
    
    // First try to find by destination field
    let program = await OrganizedTravel.findOne({ 
      destination: { $regex: new RegExp(destination, 'i') },
      isActive: true 
    });
    
    // If not found, try to find by title
    if (!program) {
      program = await OrganizedTravel.findOne({ 
        title: { $regex: new RegExp(destination, 'i') },
        isActive: true 
      });
    }
    
    // If still not found, create a default program
    if (!program) {
      const defaultProgram = {
        title: `Discover ${destination.charAt(0).toUpperCase() + destination.slice(1)}`,
        subtitle: "An unforgettable organized travel experience",
        destination: destination.toLowerCase(),
        description: `Experience the best of ${destination} with our carefully curated travel program. Discover hidden gems, taste authentic cuisine, and immerse yourself in the local culture with expert guides and premium accommodations.`,
        price: 599,
        duration: "3 days / 2 nights",
        maxGroupSize: 12,
        itinerary: [
          {
            day: 1,
            title: "Arrival & City Tour",
            description: `Welcome to ${destination}! City orientation and local cuisine tasting.`,
            activities: ["Airport transfer", "City tour", "Welcome dinner"]
          },
          {
            day: 2,
            title: "Cultural Immersion",
            description: "Explore historical sites, local markets, and traditional crafts.",
            activities: ["Historical sites", "Local markets", "Traditional crafts workshop"]
          },
          {
            day: 3,
            title: "Adventure & Relaxation",
            description: "Outdoor activities and leisure time at premium locations.",
            activities: ["Outdoor adventure", "Leisure time", "Farewell dinner"]
          }
        ],
        included: [
          "Premium Accommodation",
          "All Meals Included",
          "Private Transportation",
          "Expert Local Guide",
          "Photography Sessions",
          "VIP Experiences"
        ],
        heroImage: `/images/destinations/${destination.toLowerCase()}.png`,
        gallery: [],
        isActive: true
      };
      
      return res.json(defaultProgram);
    }
    
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new travel reservation
// @route   POST /api/organized-travel/reservations
// @access  Public
router.post("/reservations", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      numberOfTravelers,
      preferredDate,
      specialRequests,
      emergencyContact,
      emergencyPhone,
      destination,
      programId,
      totalPrice
    } = req.body;

    const reservation = new TravelReservation({
      firstName,
      lastName,
      email,
      phone,
      numberOfTravelers,
      preferredDate: new Date(preferredDate),
      specialRequests,
      emergencyContact,
      emergencyPhone,
      destination,
      programId,
      totalPrice,
      status: 'pending'
    });

    const savedReservation = await reservation.save();
    
    // Send email notifications
    try {
      await sendTravelReservationConfirmation(savedReservation);
      await sendTravelAdminNotification(savedReservation);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: savedReservation
    });
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Get all reservations (Admin only)
// @route   GET /api/organized-travel/admin/reservations
// @access  Private/Admin
router.get("/admin/reservations", protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, destination, paymentStatus } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
    if (destination) query.destination = { $regex: new RegExp(destination, 'i') };
    
    const reservations = await TravelReservation.find(query)
      .populate('programId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await TravelReservation.countDocuments(query);
    
    res.json({
      reservations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Admin Create travel reservation
// @route   POST /api/organized-travel/admin/reservations
// @access  Private/Admin
router.post("/admin/reservations", protect, admin, async (req, res) => {
  try {
    const reservation = new TravelReservation({
      ...req.body,
      createdBy: req.user._id,
    });
    const savedReservation = await reservation.save();
    await savedReservation.populate('programId');
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Update travel reservation (Admin only)
// @route   PUT /api/organized-travel/admin/reservations/:id
// @access  Private/Admin
router.put("/admin/reservations/:id", protect, admin, async (req, res) => {
  try {
    const reservation = await TravelReservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Selectively update fields from the request body
    for (const key in req.body) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        reservation.set(key, req.body[key]);
      }
    }
    
    const updatedReservation = await reservation.save();
    await updatedReservation.populate('programId');

    // Send update notification email
    try {
      await sendReservationUpdateNotification(updatedReservation);
    } catch (emailError) {
      console.error('Failed to send update notification email for travel reservation:', emailError);
    }

    res.json(updatedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Delete travel reservation (Admin only)
// @route   DELETE /api/organized-travel/admin/reservations/:id
// @access  Private/Admin
router.delete("/admin/reservations/:id", protect, admin, async (req, res) => {
  try {
    const reservation = await TravelReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    await reservation.deleteOne();
    res.json({ message: "Reservation removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new organized travel program (Admin only)
// @route   POST /api/organized-travel/admin/programs
// @access  Private/Admin
router.post("/admin/programs", protect, admin, async (req, res) => {
  try {
    const { title } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    const program = new OrganizedTravel({ ...req.body, slug });
    const savedProgram = await program.save();
    res.status(201).json(savedProgram);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Update organized travel program (Admin only)
// @route   PUT /api/organized-travel/admin/programs/:id
// @access  Private/Admin
router.put("/admin/programs/:id", protect, admin, async (req, res) => {
  try {
    const { title } = req.body;
    if (title) {
      req.body.slug = title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    }
    const program = await OrganizedTravel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    
    res.json(program);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// @desc    Delete organized travel program (Admin only)
// @route   DELETE /api/organized-travel/admin/programs/:id
// @access  Private/Admin
router.delete("/admin/programs/:id", protect, admin, async (req, res) => {
  try {
    const program = await OrganizedTravel.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all programs for admin (Admin only)
// @route   GET /api/organized-travel/admin/programs
// @access  Private/Admin
router.get("/admin/programs", protect, admin, async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    const programs = await OrganizedTravel.find(filter).sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
