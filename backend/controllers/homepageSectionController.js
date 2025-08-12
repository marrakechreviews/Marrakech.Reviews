const HomepageSection = require('../models/HomepageSection');

// Get all homepage sections
const getAllSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find().sort({ sortOrder: 1 });
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage sections',
      error: error.message
    });
  }
};

// Get enabled homepage sections only
const getEnabledSections = async (req, res) => {
  try {
    const sections = await HomepageSection.getEnabledSections();
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching enabled homepage sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enabled homepage sections',
      error: error.message
    });
  }
};

// Get single homepage section by ID
const getSectionById = async (req, res) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found'
      });
    }
    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error fetching homepage section:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage section',
      error: error.message
    });
  }
};

// Create new homepage section
const createSection = async (req, res) => {
  try {
    const { name, title, description, type, content, styling } = req.body;

    // Get the highest sort order and increment by 1
    const lastSection = await HomepageSection.findOne().sort({ sortOrder: -1 });
    const sortOrder = lastSection ? lastSection.sortOrder + 1 : 1;

    const section = new HomepageSection({
      name,
      title,
      description,
      type,
      content: content || {},
      styling: styling || {},
      sortOrder
    });

    await section.save();

    res.status(201).json({
      success: true,
      message: 'Homepage section created successfully',
      data: section
    });
  } catch (error) {
    console.error('Error creating homepage section:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating homepage section',
      error: error.message
    });
  }
};

// Update homepage section
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const section = await HomepageSection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found'
      });
    }

    res.json({
      success: true,
      message: 'Homepage section updated successfully',
      data: section
    });
  } catch (error) {
    console.error('Error updating homepage section:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating homepage section',
      error: error.message
    });
  }
};

// Delete homepage section
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await HomepageSection.findByIdAndDelete(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found'
      });
    }

    res.json({
      success: true,
      message: 'Homepage section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting homepage section:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting homepage section',
      error: error.message
    });
  }
};

// Toggle section enabled/disabled status
const toggleSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await HomepageSection.findById(id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found'
      });
    }

    section.isEnabled = !section.isEnabled;
    await section.save();

    res.json({
      success: true,
      message: `Homepage section ${section.isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: section
    });
  } catch (error) {
    console.error('Error toggling homepage section:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling homepage section',
      error: error.message
    });
  }
};

// Reorder sections
const reorderSections = async (req, res) => {
  try {
    const { sectionIds } = req.body;

    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Section IDs array is required'
      });
    }

    await HomepageSection.reorderSections(sectionIds);

    res.json({
      success: true,
      message: 'Sections reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering sections',
      error: error.message
    });
  }
};

// Initialize default sections
const initializeDefaultSections = async (req, res) => {
  try {
    const existingSections = await HomepageSection.countDocuments();
    
    if (existingSections > 0) {
      return res.json({
        success: true,
        message: 'Default sections already exist'
      });
    }

    const defaultSections = [
      {
        name: 'hero',
        title: 'Hero Slideshow',
        description: 'Main hero section with slideshow',
        type: 'hero',
        sortOrder: 1,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-gradient-to-r from-red-500 to-orange-500', textColor: 'text-white', padding: 'py-0' }
      },
      {
        name: 'google_reviews',
        title: 'Google Reviews',
        description: 'Customer reviews and testimonials',
        type: 'reviews',
        sortOrder: 2,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-gray-100', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'hosting_reservations',
        title: 'Hosting Reservations',
        description: 'Accommodation booking section',
        type: 'hosting',
        sortOrder: 3,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-white', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'activities',
        title: 'Activities',
        description: 'Marrakech activities and experiences',
        type: 'activities',
        sortOrder: 4,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-gray-100', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'stats',
        title: 'Statistics',
        description: 'Company statistics and achievements',
        type: 'stats',
        sortOrder: 5,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-muted/30', textColor: 'text-foreground', padding: 'py-16' }
      },
      {
        name: 'flight_reservations',
        title: 'Flight Reservations',
        description: 'Flight booking and referral program',
        type: 'flights',
        sortOrder: 6,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-white', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'categories',
        title: 'Categories',
        description: 'Product and service categories',
        type: 'categories',
        sortOrder: 7,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-white', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'recommended_places',
        title: 'Recommended Places',
        description: 'Instagram video carousel of recommended places',
        type: 'recommended_places',
        sortOrder: 8,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-white', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'features',
        title: 'Features',
        description: 'Why choose our services',
        type: 'features',
        sortOrder: 9,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-gray-50', textColor: 'text-gray-900', padding: 'py-16' }
      },
      {
        name: 'cta',
        title: 'Call to Action',
        description: 'Final call to action section',
        type: 'cta',
        sortOrder: 10,
        isEnabled: true,
        content: {},
        styling: { backgroundColor: 'bg-gradient-to-r from-red-500 to-orange-500', textColor: 'text-white', padding: 'py-16' }
      }
    ];

    await HomepageSection.insertMany(defaultSections);

    res.json({
      success: true,
      message: 'Default sections initialized successfully',
      data: defaultSections
    });
  } catch (error) {
    console.error('Error initializing default sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing default sections',
      error: error.message
    });
  }
};

module.exports = {
  getAllSections,
  getEnabledSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  toggleSection,
  reorderSections,
  initializeDefaultSections
};

