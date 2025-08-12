const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  // Visitor Information
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  
  // Geographic Information
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  region: {
    type: String,
    default: 'Unknown'
  },
  
  // Device Information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    os: {
      type: String,
      default: 'Unknown'
    }
  },
  
  // Visit Details
  pages: [{
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  
  // Referrer Information
  referrer: {
    url: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      enum: ['direct', 'search', 'social', 'email', 'referral', 'unknown'],
      default: 'unknown'
    },
    medium: {
      type: String,
      default: ''
    },
    campaign: {
      type: String,
      default: ''
    }
  },
  
  // Session Metrics
  duration: {
    type: Number, // in seconds
    default: 0
  },
  pageViews: {
    type: Number,
    default: 1
  },
  bounced: {
    type: Boolean,
    default: false
  },
  
  // Conversion Tracking
  conversions: [{
    type: {
      type: String,
      enum: ['signup', 'purchase', 'booking', 'contact', 'download'],
      required: true
    },
    value: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // User Association (if logged in)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Timestamps
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
visitSchema.index({ startTime: -1 });
visitSchema.index({ country: 1 });
visitSchema.index({ 'device.type': 1 });
visitSchema.index({ 'referrer.source': 1 });
visitSchema.index({ user: 1 });
visitSchema.index({ sessionId: 1, startTime: -1 });

// Static method to get visit stats
visitSchema.statics.getVisitStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.startTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' },
        totalPageViews: { $sum: '$pageViews' },
        averageDuration: { $avg: '$duration' },
        bounceRate: {
          $avg: {
            $cond: [{ $eq: ['$bounced', true] }, 1, 0]
          }
        },
        mobileVisits: {
          $sum: {
            $cond: [{ $eq: ['$device.type', 'mobile'] }, 1, 0]
          }
        },
        desktopVisits: {
          $sum: {
            $cond: [{ $eq: ['$device.type', 'desktop'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        totalVisits: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        totalPageViews: 1,
        averageDuration: { $round: ['$averageDuration', 2] },
        bounceRate: { $round: [{ $multiply: ['$bounceRate', 100] }, 2] },
        mobileVisits: 1,
        desktopVisits: 1,
        mobilePercentage: {
          $round: [
            { $multiply: [{ $divide: ['$mobileVisits', '$totalVisits'] }, 100] },
            2
          ]
        }
      }
    }
  ]);

  return stats[0] || {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    averageDuration: 0,
    bounceRate: 0,
    mobileVisits: 0,
    desktopVisits: 0,
    mobilePercentage: 0
  };
};

// Static method to get daily visit trends
visitSchema.statics.getDailyTrends = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        startTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' },
          day: { $dayOfMonth: '$startTime' }
        },
        visits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' },
        pageViews: { $sum: '$pageViews' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        visits: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        pageViews: 1
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
};

// Static method to get top pages
visitSchema.statics.getTopPages = async function(limit = 10) {
  return await this.aggregate([
    { $unwind: '$pages' },
    {
      $group: {
        _id: '$pages.url',
        views: { $sum: 1 },
        averageTimeSpent: { $avg: '$pages.timeSpent' },
        uniqueVisitors: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        url: '$_id',
        views: 1,
        averageTimeSpent: { $round: ['$averageTimeSpent', 2] },
        uniqueVisitors: { $size: '$uniqueVisitors' }
      }
    },
    {
      $sort: { views: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get traffic sources
visitSchema.statics.getTrafficSources = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$referrer.source',
        visits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        source: '$_id',
        visits: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' }
      }
    },
    {
      $sort: { visits: -1 }
    }
  ]);
};

// Static method to get geographic distribution
visitSchema.statics.getGeographicStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: {
          country: '$country',
          city: '$city'
        },
        visits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        country: '$_id.country',
        city: '$_id.city',
        visits: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' }
      }
    },
    {
      $sort: { visits: -1 }
    },
    {
      $limit: 20
    }
  ]);
};

module.exports = mongoose.model('Visit', visitSchema);

