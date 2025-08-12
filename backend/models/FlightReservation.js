const mongoose = require('mongoose');

const flightReservationSchema = new mongoose.Schema({
  // Customer Information
  customerInfo: {
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
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    whatsapp: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: false
    },
    passportNumber: {
      type: String,
      required: false,
      trim: true
    },
    nationality: {
      type: String,
      required: false,
      trim: true
    }
  },

  // Flight Details
  flightDetails: {
    tripType: {
      type: String,
      enum: ['one-way', 'round-trip', 'multi-city'],
      required: true,
      default: 'round-trip'
    },
    departure: {
      airport: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        required: true
      },
      time: {
        type: String,
        required: false
      }
    },
    arrival: {
      airport: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        required: function() {
          return this.flightDetails.tripType === 'round-trip';
        }
      },
      time: {
        type: String,
        required: false
      }
    },
    passengers: {
      adults: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
      children: {
        type: Number,
        default: 0,
        min: 0
      },
      infants: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    class: {
      type: String,
      enum: ['economy', 'premium-economy', 'business', 'first'],
      default: 'economy'
    }
  },

  // Pricing Information
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0
    },
    fees: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    referralCommission: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Referral Program Information
  referralInfo: {
    supplier: {
      type: String,
      enum: ['skyscanner', 'expedia', 'booking', 'kayak', 'tripadvisor', 'other'],
      required: true
    },
    affiliateId: {
      type: String,
      required: false,
      trim: true
    },
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    trackingCode: {
      type: String,
      required: false,
      trim: true
    }
  },

  // Reservation Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Additional Information
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },

  // Booking Reference
  bookingReference: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  // External booking details
  externalBookingId: {
    type: String,
    trim: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin fields
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
flightReservationSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `FL-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Calculate total price before saving
flightReservationSchema.pre('save', function(next) {
  if (this.pricing.basePrice !== undefined) {
    this.pricing.totalPrice = this.pricing.basePrice + (this.pricing.taxes || 0) + (this.pricing.fees || 0);
  }
  next();
});

// Indexes for better query performance
flightReservationSchema.index({ 'customerInfo.email': 1 });
flightReservationSchema.index({ bookingReference: 1 });
flightReservationSchema.index({ status: 1 });
flightReservationSchema.index({ createdAt: -1 });
flightReservationSchema.index({ 'flightDetails.departure.date': 1 });
flightReservationSchema.index({ 'referralInfo.supplier': 1 });

// Virtual for full customer name
flightReservationSchema.virtual('customerInfo.fullName').get(function() {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

// Virtual for total passengers
flightReservationSchema.virtual('flightDetails.totalPassengers').get(function() {
  return this.flightDetails.passengers.adults + 
         this.flightDetails.passengers.children + 
         this.flightDetails.passengers.infants;
});

// Ensure virtual fields are serialized
flightReservationSchema.set('toJSON', { virtuals: true });
flightReservationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FlightReservation', flightReservationSchema);

