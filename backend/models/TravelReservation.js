const mongoose = require("mongoose");

const travelReservationSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Travel Details
  numberOfTravelers: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  preferredDate: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizedTravel'
  },
  
  // Pricing
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Additional Information
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  emergencyPhone: {
    type: String,
    trim: true
  },
  
  // Reservation Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Admin Notes
  notes: {
    type: String,
    trim: true
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'paypal'],
    default: 'credit_card'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Confirmation Details
  confirmationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  confirmedDate: {
    type: Date
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Travel Dates (final confirmed dates)
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  
  // Additional Services
  additionalServices: [{
    name: String,
    price: Number,
    description: String
  }],
  
  // Traveler Details
  travelers: [{
    firstName: String,
    lastName: String,
    age: Number,
    passportNumber: String,
    nationality: String,
    dietaryRestrictions: String,
    medicalConditions: String
  }],
  
  // Communication Log
  communications: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['email', 'phone', 'sms', 'in_person'],
      default: 'email'
    },
    subject: String,
    message: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Cancellation Information
  cancellationReason: {
    type: String,
    trim: true
  },
  cancellationDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Source tracking
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'social_media', 'referral'],
    default: 'website'
  },
  referralSource: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
travelReservationSchema.index({ email: 1 });
travelReservationSchema.index({ status: 1, createdAt: -1 });
travelReservationSchema.index({ destination: 1, preferredDate: 1 });

// Virtual for full name
travelReservationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for remaining balance
travelReservationSchema.virtual('remainingBalance').get(function() {
  return Math.max(0, this.totalPrice - this.paidAmount);
});

// Virtual for is fully paid
travelReservationSchema.virtual('isFullyPaid').get(function() {
  return this.paidAmount >= this.totalPrice;
});

// Pre-save middleware to generate confirmation number
travelReservationSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmationNumber) {
    // Generate confirmation number: TR + timestamp + random
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.confirmationNumber = `TR${timestamp}${random}`;
  }
  next();
});

// Method to add communication log
travelReservationSchema.methods.addCommunication = function(type, subject, message, sentBy) {
  this.communications.push({
    type,
    subject,
    message,
    sentBy
  });
  return this.save();
};

// Method to confirm reservation
travelReservationSchema.methods.confirm = function(confirmedBy, startDate, endDate) {
  this.status = 'confirmed';
  this.confirmedDate = new Date();
  this.confirmedBy = confirmedBy;
  if (startDate) this.startDate = startDate;
  if (endDate) this.endDate = endDate;
  return this.save();
};

// Method to cancel reservation
travelReservationSchema.methods.cancel = function(reason, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellationDate = new Date();
  this.cancellationReason = reason;
  this.refundAmount = refundAmount;
  return this.save();
};

// Static method to get reservations by date range
travelReservationSchema.statics.getByDateRange = function(startDate, endDate, status = null) {
  const query = {
    preferredDate: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).populate('programId').sort({ preferredDate: 1 });
};

// Static method to get revenue statistics
travelReservationSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        paidRevenue: { $sum: '$paidAmount' },
        reservationCount: { $sum: 1 },
        averageBookingValue: { $avg: '$totalPrice' }
      }
    }
  ]);
};

const TravelReservation = mongoose.model("TravelReservation", travelReservationSchema);

module.exports = TravelReservation;

