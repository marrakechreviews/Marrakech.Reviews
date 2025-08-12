const { validationResult } = require('express-validator');
const Settings = require('../models/Settings');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { section, data } = req.body;
    
    if (!section || !data) {
      return res.status(400).json({
        success: false,
        message: 'Section and data are required'
      });
    }

    const updatedSettings = await Settings.updateSettings(section, data);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};

// @desc    Update specific section of settings
// @route   PUT /api/settings/:section
// @access  Private/Admin
const updateSettingsSection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { section } = req.params;
    const data = req.body;
    
    const validSections = ['general', 'seo', 'payment', 'api', 'gallery', 'social', 'scripts'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings section'
      });
    }

    const updatedSettings = await Settings.updateSettings(section, data);

    res.json({
      success: true,
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`,
      data: updatedSettings[section]
    });
  } catch (error) {
    console.error('Update settings section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings section'
    });
  }
};

// @desc    Get specific section of settings
// @route   GET /api/settings/:section
// @access  Public (for frontend)
const getSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await Settings.getSettings();
    
    const validSections = ['general', 'seo', 'payment', 'api', 'gallery', 'social', 'scripts'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings section'
      });
    }

    // For public access, filter out sensitive information
    let sectionData = settings[section];
    
    if (section === 'payment') {
      // Remove sensitive payment information for public access
      sectionData = {
        ...sectionData.toObject(),
        stripeSecretKey: undefined,
        paypalEmail: undefined
      };
    }
    
    if (section === 'api') {
      // Remove sensitive API information for public access
      sectionData = {
        ...sectionData.toObject(),
        apiKeys: undefined,
        integrations: {
          ...sectionData.integrations.toObject(),
          mailchimp: { enabled: sectionData.integrations.mailchimp.enabled },
          sendgrid: { enabled: sectionData.integrations.sendgrid.enabled },
          twilio: { enabled: sectionData.integrations.twilio.enabled }
        }
      };
    }

    res.json({
      success: true,
      data: sectionData
    });
  } catch (error) {
    console.error('Get settings section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings section'
    });
  }
};

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Return only public settings that frontend needs
    const publicSettings = {
      general: {
        siteName: settings.general.siteName,
        siteDescription: settings.general.siteDescription,
        contactEmail: settings.general.contactEmail,
        contactPhone: settings.general.contactPhone,
        address: settings.general.address,
        logo: settings.general.logo,
        favicon: settings.general.favicon,
        currency: settings.general.currency,
        language: settings.general.language
      },
      seo: {
        metaTitle: settings.seo.metaTitle,
        metaDescription: settings.seo.metaDescription,
        metaKeywords: settings.seo.metaKeywords,
        googleAnalyticsId: settings.seo.googleAnalyticsId,
        googleTagManagerId: settings.seo.googleTagManagerId,
        facebookPixelId: settings.seo.facebookPixelId,
        schemaMarkup: settings.seo.schemaMarkup
      },
      social: settings.social,
      gallery: {
        carousels: settings.gallery.carousels,
        allowedFileTypes: settings.gallery.allowedFileTypes,
        maxFileSize: settings.gallery.maxFileSize
      },
      scripts: settings.scripts,
      payment: {
        paymentMethods: settings.payment.paymentMethods,
        currency: settings.payment.currency,
        taxRate: settings.payment.taxRate,
        shippingRates: settings.payment.shippingRates
      }
    };

    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateSettingsSection,
  getSettingsSection,
  getPublicSettings
};

