const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || process.env.SMTP_SERVER || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USERNAME,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
    }
  });
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, category, message } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create contact entry
    const contact = new Contact({
      name,
      email,
      subject,
      category,
      message,
      ipAddress,
      userAgent
    });

    await contact.save();

    // Send email notification to admin
    try {
      await sendEmailNotification(contact);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendConfirmationEmail(contact);
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
const getContactSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === 'true';
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex }
      ];
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadCount = await Contact.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        statusBreakdown: stats,
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactSubmission = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Mark as read when viewed
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Get contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update contact submission status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactSubmission = async (req, res) => {
  try {
    const { status, adminNotes, isRead } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (adminNotes !== undefined) contact.adminNotes = adminNotes;
    if (isRead !== undefined) contact.isRead = isRead;

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact submission updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactSubmission = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to send email notification to admin
const sendEmailNotification = async (contact) => {
  const transporter = createTransporter();

  const adminEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USERNAME || 'admin@marrakechreviews.com';

  const mailOptions = {
    from: `"Marrakech Reviews" <${process.env.EMAIL_USER || process.env.SMTP_USERNAME}>`,
    to: adminEmail,
    subject: `New Contact Form Submission: ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #e74c3c; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Category:</strong> ${contact.category}</p>
          <p><strong>Date:</strong> ${contact.formattedDate}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 5px;">
          <p style="margin: 0; color: #2d5a2d;">
            <strong>Action Required:</strong> Please respond to this inquiry through the admin dashboard.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated notification from Marrakech Reviews contact form.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Helper function to send confirmation email to user
const sendConfirmationEmail = async (contact) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Marrakech Reviews" <${process.env.EMAIL_USER || process.env.SMTP_USERNAME}>`,
    to: contact.email,
    subject: 'Thank you for contacting Marrakech Reviews',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
          Thank You for Contacting Us!
        </h2>
        
        <p>Dear ${contact.name},</p>
        
        <p>Thank you for reaching out to Marrakech Reviews. We have received your message and will get back to you within 24 hours.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Your Message Details</h3>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Category:</strong> ${contact.category}</p>
          <p><strong>Date Submitted:</strong> ${contact.formattedDate}</p>
        </div>
        
        <p>In the meantime, feel free to explore our website for the latest reviews and travel tips about Marrakech.</p>
        
        <div style="margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 5px;">
          <h3 style="color: #2d5a2d; margin-top: 0;">Quick Links</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><a href="https://marrakechreviews.com/articles" style="color: #e74c3c; text-decoration: none;">📖 Latest Reviews</a></li>
            <li style="margin: 10px 0;"><a href="https://marrakechreviews.com/activities" style="color: #e74c3c; text-decoration: none;">🎯 Activities</a></li>
            <li style="margin: 10px 0;"><a href="https://marrakechreviews.com/faq" style="color: #e74c3c; text-decoration: none;">❓ FAQ</a></li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Best regards,<br>The Marrakech Reviews Team</p>
          <p>This is an automated confirmation email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  submitContactForm,
  getContactSubmissions,
  getContactSubmission,
  updateContactSubmission,
  deleteContactSubmission
};

