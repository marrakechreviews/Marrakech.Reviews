const Visit = require('../models/Visit');
const User = require('../models/User');
const ActivityReservation = require('../models/ActivityReservation');
const FlightReservation = require('../models/FlightReservation');
const Order = require('../models/Order');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    console.log('Fetching dashboard analytics...');
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    console.log(`Analytics period: ${days} days (from ${startDate.toISOString()})`);

    // Get visit stats
    console.log('Step 1: Fetching visit stats...');
    const visitStats = await Visit.getVisitStats(startDate, new Date());
    console.log('Step 1: Visit stats fetched successfully.');
    
    // Get user stats
    console.log('Step 2: Fetching user stats...');
    const userStats = await User.getUserStats();
    console.log('Step 2: User stats fetched successfully.');
    
    // Get reservation stats
    console.log('Step 3: Fetching activity reservation stats...');
    const activityReservationStats = await ActivityReservation.getReservationStats();
    console.log('Step 3: Activity reservation stats fetched successfully.');
    
    // Get flight reservation stats
    console.log('Step 4: Fetching flight reservation stats...');
    const flightReservations = await FlightReservation.aggregate([
      {
        $group: {
          _id: null,
          totalFlightReservations: { $sum: 1 },
          pendingFlightReservations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          confirmedFlightReservations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
            }
          },
          totalFlightRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'completed']] },
                '$pricing.totalPrice',
                0
              ]
            }
          }
        }
      }
    ]);
    console.log('Step 4: Flight reservation stats fetched successfully.');

    const flightStats = flightReservations[0] || {
      totalFlightReservations: 0,
      pendingFlightReservations: 0,
      confirmedFlightReservations: 0,
      totalFlightRevenue: 0
    };

    // Get order stats
    console.log('Step 5: Fetching order stats...');
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalOrderRevenue: { $sum: '$totalPrice' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          }
        }
      }
    ]);
    console.log('Step 5: Order stats fetched successfully.');

    const orderStatsData = orderStats[0] || {
      totalOrders: 0,
      totalOrderRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0
    };

    // Calculate total revenue
    console.log('Step 6: Calculating total revenue...');
    const totalRevenue =
      (activityReservationStats?.totalRevenue || 0) +
      (flightStats?.totalFlightRevenue || 0) +
      (orderStatsData?.totalOrderRevenue || 0);
    console.log('Step 6: Total revenue calculated.');

    // Get recent activity
    console.log('Step 7: Fetching recent activity...');
    const recentReservations = await ActivityReservation.find()
      .populate('activity', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('reservationId customerInfo.name status totalPrice createdAt');
    console.log('Step 7a: Recent reservations fetched.');

    const recentFlightReservations = await FlightReservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bookingReference customerInfo.firstName customerInfo.lastName status pricing.totalPrice createdAt');
    console.log('Step 7b: Recent flight reservations fetched.');

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber user status totalPrice createdAt');
    console.log('Step 7c: Recent orders fetched.');
    console.log('Step 7: Recent activity fetched successfully.');

    console.log('All analytics data fetched. Preparing response...');
    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalVisits: visitStats.totalVisits,
          totalUsers: userStats.totalUsers,
          totalReservations: activityReservationStats.totalReservations + flightStats.totalFlightReservations,
          totalOrders: orderStatsData.totalOrders
        },
        visitStats,
        userStats,
        activityReservationStats,
        flightStats,
        orderStats: orderStatsData,
        recentActivity: {
          reservations: recentReservations,
          flightReservations: recentFlightReservations,
          orders: recentOrders
        }
      }
    });
    console.log('Response sent successfully.');
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
};

// @desc    Get visit analytics
// @route   GET /api/analytics/visits
// @access  Private/Admin
const getVisitAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    // Get visit stats
    const visitStats = await Visit.getVisitStats();
    
    // Get daily trends
    const dailyTrends = await Visit.getDailyTrends(days);
    
    // Get top pages
    const topPages = await Visit.getTopPages(10);
    
    // Get traffic sources
    const trafficSources = await Visit.getTrafficSources();
    
    // Get geographic stats
    const geographicStats = await Visit.getGeographicStats();

    res.json({
      success: true,
      data: {
        overview: visitStats,
        dailyTrends,
        topPages,
        trafficSources,
        geographicStats
      }
    });
  } catch (error) {
    console.error('Visit analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visit analytics',
      error: error.message
    });
  }
};

// @desc    Get reservation analytics
// @route   GET /api/analytics/reservations
// @access  Private/Admin
const getReservationAnalytics = async (req, res) => {
  try {
    // Get activity reservation stats
    const activityStats = await ActivityReservation.getReservationStats();
    
    // Get monthly stats for current year
    const monthlyStats = await ActivityReservation.getMonthlyStats();
    
    // Get popular activities
    const popularActivities = await ActivityReservation.getPopularActivities(10);
    
    // Get flight reservation stats
    const flightStats = await FlightReservation.aggregate([
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalPrice' },
          averageValue: { $avg: '$pricing.totalPrice' },
          byStatus: {
            $push: {
              status: '$status',
              count: 1,
              revenue: '$pricing.totalPrice'
            }
          }
        }
      }
    ]);

    // Get flight reservations by supplier
    const flightsBySupplier = await FlightReservation.aggregate([
      {
        $group: {
          _id: '$referralInfo.supplier',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalPrice' },
          commission: { $sum: '$pricing.referralCommission' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        activities: {
          overview: activityStats,
          monthlyTrends: monthlyStats,
          popularActivities
        },
        flights: {
          overview: flightStats[0] || {},
          bySupplier: flightsBySupplier
        }
      }
    });
  } catch (error) {
    console.error('Reservation analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation analytics',
      error: error.message
    });
  }
};

// @desc    Track page visit
// @route   POST /api/analytics/track
// @access  Public
const trackVisit = async (req, res) => {
  try {
    const {
      sessionId,
      page,
      referrer,
      userAgent,
      device,
      location
    } = req.body;

    const ipAddress = req.ip || req.connection.remoteAddress;

    // Find existing visit or create new one
    let visit = await Visit.findOne({ sessionId });

    if (visit) {
      // Update existing visit
      visit.pages.push({
        url: page.url,
        title: page.title,
        timestamp: new Date()
      });
      visit.pageViews += 1;
      visit.endTime = new Date();
      visit.duration = Math.floor((visit.endTime - visit.startTime) / 1000);
      
      // Update bounce status
      if (visit.pageViews > 1) {
        visit.bounced = false;
      }
    } else {
      // Create new visit
      visit = new Visit({
        sessionId,
        ipAddress,
        userAgent,
        country: location?.country || 'Unknown',
        city: location?.city || 'Unknown',
        region: location?.region || 'Unknown',
        device: {
          type: device?.type || 'unknown',
          browser: device?.browser || 'Unknown',
          os: device?.os || 'Unknown'
        },
        pages: [{
          url: page.url,
          title: page.title,
          timestamp: new Date()
        }],
        referrer: {
          url: referrer?.url || '',
          source: referrer?.source || 'direct',
          medium: referrer?.medium || '',
          campaign: referrer?.campaign || ''
        },
        pageViews: 1,
        bounced: true // Will be updated if more pages are visited
      });
    }

    await visit.save();

    res.json({
      success: true,
      message: 'Visit tracked successfully'
    });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking visit',
      error: error.message
    });
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private/Admin
const getCustomerAnalytics = async (req, res) => {
  try {
    // Get user registration trends
    const userTrends = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]);

    // Get top customers by spending
    const topCustomers = await ActivityReservation.aggregate([
      {
        $match: {
          status: { $in: ['Confirmed', 'Completed'] }
        }
      },
      {
        $group: {
          _id: '$customerInfo.email',
          customerName: { $first: '$customerInfo.name' },
          totalSpent: { $sum: '$totalPrice' },
          reservationCount: { $sum: 1 },
          lastReservation: { $max: '$createdAt' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get customer segments
    const customerSegments = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userTrends,
        topCustomers,
        customerSegments
      }
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getVisitAnalytics,
  getReservationAnalytics,
  trackVisit,
  getCustomerAnalytics
};

