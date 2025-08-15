const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  category: {
    type: String,
    enum: ['general', 'travel', 'review', 'partnership', 'feedback', 'technical'],
    default: 'general'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved'],
    default: 'new'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters']
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ isRead: 1 });
contactSchema.index({ email: 1 });

// Virtual for formatted date
contactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
contactSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Contact', contactSchema);

