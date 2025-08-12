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

// Protected admin routes
router.post('/', protect, admin, createInstagramVideo);
router.put('/bulk-order', protect, admin, bulkUpdateDisplayOrder);
router.get('/admin/stats', protect, admin, getInstagramStats);
router.put('/:id', protect, admin, updateInstagramVideo);
router.put('/:id/metrics', protect, admin, updateVideoMetrics);
router.put('/:id/toggle-active', protect, admin, toggleVideoActive);
router.put('/:id/toggle-featured', protect, admin, toggleVideoFeatured);
router.delete('/:id', protect, admin, deleteInstagramVideo);

module.exports = router;

