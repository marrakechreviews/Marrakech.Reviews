const mongoose = require('mongoose');

const activityReservationSchema = new mongoose.Schema({
  reservationId: {
    type: String,
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: [true, 'Activity is required']
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true
    }
  },
  reservationDate: {
    type: Date,
    required: [true, 'Reservation date is required']
  },
  numberOfPersons: {
    type: Number,
    required: [true, 'Number of persons is required'],
    min: [1, 'Must have at least 1 person']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'PayPal', 'Other'],
    default: 'Cash'
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters']
  },
  source: {
    type: String,
    enum: ['Website', 'Phone', 'Email', 'WhatsApp', 'Walk-in'],
    default: 'Website'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
  },
  cancelledAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance

activityReservationSchema.index({ activity: 1 });
activityReservationSchema.index({ 'customerInfo.email': 1 });
activityReservationSchema.index({ reservationDate: 1 });
activityReservationSchema.index({ status: 1 });
activityReservationSchema.index({ createdAt: -1 });
activityReservationSchema.index({ reservationId: 1 }, { unique: true });

// Virtual for formatted reservation date
activityReservationSchema.virtual('formattedReservationDate').get(function() {
  return this.reservationDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for days until reservation
activityReservationSchema.virtual('daysUntilReservation').get(function() {
  const today = new Date();
  const reservationDate = new Date(this.reservationDate);
  const diffTime = reservationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to generate reservation ID
activityReservationSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.reservationId = `ACT-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Pre-save middleware to set confirmation timestamp
activityReservationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  if (this.isModified('status') && this.status === 'Cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  next();
});

// Static method to get reservation stats
activityReservationSchema.statics.getReservationStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalReservations: { $sum: 1 },
        pendingReservations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
          }
        },
        confirmedReservations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0]
          }
        },
        cancelledReservations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
          }
        },
        completedReservations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
          }
        },
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Completed']] },
              '$totalPrice',
              0
            ]
          }
        },
        averageReservationValue: { $avg: '$totalPrice' },
        totalPersons: { $sum: '$numberOfPersons' }
      }
    }
  ]);

  return stats[0] || {
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    completedReservations: 0,
    totalRevenue: 0,
    averageReservationValue: 0,
    totalPersons: 0
  };
};

// Static method to get monthly stats
activityReservationSchema.statics.getMonthlyStats = async function(year = new Date().getFullYear()) {
  return await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Completed']] },
              '$totalPrice',
              0
            ]
          }
        },
        persons: { $sum: '$numberOfPersons' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

// Static method to get popular activities
activityReservationSchema.statics.getPopularActivities = async function(limit = 10) {
  return await this.aggregate([
    {
      $match: {
        status: { $in: ['Confirmed', 'Completed'] }
      }
    },
    {
      $group: {
        _id: '$activity',
        reservationCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        totalPersons: { $sum: '$numberOfPersons' }
      }
    },
    {
      $lookup: {
        from: 'activities',
        localField: '_id',
        foreignField: '_id',
        as: 'activityInfo'
      }
    },
    {
      $unwind: '$activityInfo'
    },
    {
      $project: {
        activityName: '$activityInfo.name',
        category: '$activityInfo.category',
        reservationCount: 1,
        totalRevenue: 1,
        totalPersons: 1,
        averageReservationValue: { $divide: ['$totalRevenue', '$reservationCount'] }
      }
    },
    {
      $sort: { reservationCount: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

module.exports = mongoose.model('ActivityReservation', activityReservationSchema);

