const express = require("express");
const router = express.Router();
const OrganizedTravel = require("../models/OrganizedTravel");
const TravelReservation = require("../models/TravelReservation");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc    Get all organized travel programs
// @route   GET /api/organized-travel
// @access  Public
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
    
    res.status(201).json({
      message: "Reservation created successfully",
      reservation: savedReservation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all reservations (Admin only)
// @route   GET /api/organized-travel/reservations
// @access  Private/Admin
router.get("/admin/reservations", protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, destination } = req.query;
    
    const query = {};
    if (status) query.status = status;
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

// @desc    Update reservation status (Admin only)
// @route   PUT /api/organized-travel/reservations/:id
// @access  Private/Admin
router.put("/admin/reservations/:id", protect, admin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const reservation = await TravelReservation.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: Date.now() },
      { new: true }
    ).populate('programId');
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Create new organized travel program (Admin only)
// @route   POST /api/organized-travel/admin/programs
// @access  Private/Admin
router.post("/admin/programs", protect, admin, async (req, res) => {
  try {
    const program = new OrganizedTravel(req.body);
    const savedProgram = await program.save();
    res.status(201).json(savedProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update organized travel program (Admin only)
// @route   PUT /api/organized-travel/admin/programs/:id
// @access  Private/Admin
router.put("/admin/programs/:id", protect, admin, async (req, res) => {
  try {
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
    res.status(400).json({ message: error.message });
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
    const programs = await OrganizedTravel.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

