const express = require('express');
const router = express.Router();
const {
  getInstagramVideos,
  getInstagramVideo,
  getInstagramVideoBySlug,
  createInstagramVideo,
  updateInstagramVideo,
  updateVideoMetrics,
  toggleVideoActive,
  toggleVideoFeatured,
  deleteInstagramVideo,
  getFeaturedVideos,
  getVideosByCategory,
  getRecentVideos,
  getInstagramStats,
  bulkUpdateDisplayOrder
} = require('../controllers/instagramController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getInstagramVideos);
router.get('/featured', getFeaturedVideos);
router.get('/recent', getRecentVideos);
router.get('/category/:category', getVideosByCategory);
router.get('/slug/:slug', getInstagramVideoBySlug);
router.get('/:id', getInstagramVideo);

// Admin routes with bypass authentication
router.post('/', createInstagramVideo);
router.put('/bulk-order', bulkUpdateDisplayOrder);
router.get('/admin/stats', getInstagramStats);
router.put('/:id', updateInstagramVideo);
router.put('/:id/metrics', updateVideoMetrics);
router.put('/:id/toggle-active', toggleVideoActive);
router.put('/:id/toggle-featured', toggleVideoFeatured);
router.delete('/:id', deleteInstagramVideo);

module.exports = router;


