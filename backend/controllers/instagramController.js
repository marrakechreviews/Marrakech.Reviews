const InstagramVideo = require("../models/InstagramVideo");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const cheerio = require("cheerio");

// @desc    Get all Instagram videos with filtering and pagination
// @route   GET /api/instagram
// @access  Public
const getInstagramVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    featured,
    active,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
    search
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (category) filter.category = category;
  if (featured !== undefined) filter.isFeatured = featured === 'true';
  if (active !== undefined) filter.isActive = active === 'true';
  
  // Add search functionality
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
      { 'location.name': { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  if (sortBy === 'engagement') {
    // Sort by engagement (likes + comments)
    sort.likes = sortOrder === 'desc' ? -1 : 1;
    sort.comments = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'displayOrder') {
    sort.displayOrder = sortOrder === 'desc' ? -1 : 1;
    sort.publishedAt = -1; // Secondary sort
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const videos = await InstagramVideo.find(filter)
    .populate('addedBy', 'name email')
    .populate('lastUpdatedBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await InstagramVideo.countDocuments(filter);

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get single Instagram video
// @route   GET /api/instagram/:id
// @access  Public
const getInstagramVideo = asyncHandler(async (req, res) => {
  const video = await InstagramVideo.findById(req.params.id)
    .populate('addedBy', 'name email')
    .populate('lastUpdatedBy', 'name');

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  res.json({
    success: true,
    data: video
  });
});

// @desc    Get Instagram video by slug
// @route   GET /api/instagram/slug/:slug
// @access  Public
const getInstagramVideoBySlug = asyncHandler(async (req, res) => {
  const video = await InstagramVideo.findOne({ slug: req.params.slug })
    .populate('addedBy', 'name email')
    .populate('lastUpdatedBy', 'name');

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  res.json({
    success: true,
    data: video
  });
});

// @desc    Create new Instagram video
// @route   POST /api/instagram
// @access  Private/Admin
const createInstagramVideo = asyncHandler(async (req, res) => {
  const {
    instagramId,
    instagramUrl,
    embedUrl,
    title,
    description,
    caption,
    thumbnailUrl,
    duration,
    category,
    tags,
    location,
    publishedAt,
    isFeatured,
    displayOrder,
    metaTitle,
    metaDescription
  } = req.body;

  // Validate required fields
  if (!instagramId || !instagramUrl || !title) {
    res.status(400);
    throw new Error("Please provide all required fields: instagramId, instagramUrl, title");
  }

  // Auto-generate embedUrl if not provided
  const finalEmbedUrl = embedUrl || `${instagramUrl}/embed`;

  let finalThumbnailUrl = thumbnailUrl;
  if (!finalThumbnailUrl) {
    try {
      const response = await axios.get(instagramUrl);
      const $ = cheerio.load(response.data);
      const ogImage = $("meta[property=\"og:image\"]").attr("content");
      if (ogImage) {
        finalThumbnailUrl = ogImage;
      } else {
        console.warn("Could not extract og:image from Instagram URL. Proceeding without thumbnail.");
      }
    } catch (error) {
      console.error("Error extracting thumbnail from Instagram URL:", error.message);
      // Proceed without thumbnail if extraction fails
    }
  }

  // Check if Instagram video already exists
  const existingVideo = await InstagramVideo.findOne({ instagramId });
  if (existingVideo) {
    res.status(400);
    throw new Error("Instagram video with this ID already exists");
  }

  // Create video data
  const videoData = {
    instagramId,
    instagramUrl,
    embedUrl: finalEmbedUrl,
    title,
    description,
    caption,
    thumbnailUrl: finalThumbnailUrl, // Use the extracted or provided thumbnail URL
    duration,
    category: category || "travel",
    tags: tags || [],
    location,
    publishedAt: publishedAt || new Date(),
    isFeatured: isFeatured || false,
    displayOrder: displayOrder || 0,
    metaTitle,
    metaDescription,
    addedBy: null // Temporarily set to null to bypass authentication
  };

  const video = await InstagramVideo.create(videoData);

  // Populate the created video only if addedBy is not null
  let populatedVideo = video;
  if (video.addedBy) {
    populatedVideo = await InstagramVideo.findById(video._id)
      .populate('addedBy', 'name email');
  }

  res.status(201).json({
    success: true,
    data: populatedVideo,
    message: 'Instagram video added successfully'
  });
});

// @desc    Update Instagram video
// @route   PUT /api/instagram/:id
// @access  Private/Admin
const updateInstagramVideo = asyncHandler(async (req, res) => {
  const video = await InstagramVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  // Update fields
  const updateFields = { ...req.body };
  updateFields.lastUpdatedBy = req.user ? req.user._id : null;

  // Remove fields that shouldn't be updated directly
  delete updateFields._id;
  delete updateFields.createdAt;
  delete updateFields.addedBy;

  const updatedVideo = await InstagramVideo.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  ).populate('addedBy', 'name email').populate('lastUpdatedBy', 'name');

  res.json({
    success: true,
    data: updatedVideo,
    message: 'Instagram video updated successfully'
  });
});

// @desc    Update video metrics
// @route   PUT /api/instagram/:id/metrics
// @access  Private/Admin
const updateVideoMetrics = asyncHandler(async (req, res) => {
  const { likes, comments, views } = req.body;

  const video = await InstagramVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  await video.updateMetrics({ likes, comments, views });

  res.json({
    success: true,
    data: video,
    message: 'Video metrics updated successfully'
  });
});

// @desc    Toggle video active status
// @route   PUT /api/instagram/:id/toggle-active
// @access  Private/Admin
const toggleVideoActive = asyncHandler(async (req, res) => {
  const video = await InstagramVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  video.isActive = !video.isActive;
  video.lastUpdatedBy = req.user ? req.user._id : null;
  await video.save();

  res.json({
    success: true,
    data: video,
    message: `Video ${video.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Toggle video featured status
// @route   PUT /api/instagram/:id/toggle-featured
// @access  Private/Admin
const toggleVideoFeatured = asyncHandler(async (req, res) => {
  const video = await InstagramVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  video.isFeatured = !video.isFeatured;
  video.lastUpdatedBy = req.user ? req.user._id : null;
  await video.save();

  res.json({
    success: true,
    data: video,
    message: `Video ${video.isFeatured ? 'featured' : 'unfeatured'} successfully`
  });
});

// @desc    Delete Instagram video
// @route   DELETE /api/instagram/:id
// @access  Private/Admin
const deleteInstagramVideo = asyncHandler(async (req, res) => {
  const video = await InstagramVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('Instagram video not found');
  }

  await video.deleteOne();

  res.json({
    success: true,
    message: 'Instagram video deleted successfully'
  });
});

// @desc    Get featured videos for homepage
// @route   GET /api/instagram/featured
// @access  Public
const getFeaturedVideos = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const videos = await InstagramVideo.getFeatured(parseInt(limit));

  res.json({
    success: true,
    data: videos
  });
});

// @desc    Get videos by category
// @route   GET /api/instagram/category/:category
// @access  Public
const getVideosByCategory = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;
  const { category } = req.params;

  const videos = await InstagramVideo.getByCategory(category, parseInt(limit));

  res.json({
    success: true,
    data: videos
  });
});

// @desc    Get recent videos
// @route   GET /api/instagram/recent
// @access  Public
const getRecentVideos = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;

  const videos = await InstagramVideo.getRecent(parseInt(limit));

  res.json({
    success: true,
    data: videos
  });
});

// @desc    Get Instagram statistics
// @route   GET /api/instagram/stats
// @access  Private/Admin
const getInstagramStats = asyncHandler(async (req, res) => {
  const stats = await InstagramVideo.aggregate([
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalVideos: { $sum: 1 },
              activeVideos: {
                $sum: { $cond: ['$isActive', 1, 0] }
              },
              featuredVideos: {
                $sum: { $cond: ['$isFeatured', 1, 0] }
              },
              totalLikes: { $sum: '$likes' },
              totalComments: { $sum: '$comments' },
              totalViews: { $sum: '$views' },
              averageLikes: { $avg: '$likes' },
              averageComments: { $avg: '$comments' },
              averageViews: { $avg: '$views' }
            }
          }
        ],
        categoryStats: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalLikes: { $sum: '$likes' },
              totalViews: { $sum: '$views' }
            }
          },
          {
            $sort: { count: -1 }
          }
        ],
        monthlyStats: [
          {
            $group: {
              _id: {
                year: { $year: '$publishedAt' },
                month: { $month: '$publishedAt' }
              },
              count: { $sum: 1 },
              totalLikes: { $sum: '$likes' },
              totalViews: { $sum: '$views' }
            }
          },
          {
            $sort: { '_id.year': -1, '_id.month': -1 }
          },
          {
            $limit: 12
          }
        ],
        topPerforming: [
          {
            $match: { isActive: true }
          },
          {
            $addFields: {
              engagement: { $add: ['$likes', '$comments'] }
            }
          },
          {
            $sort: { engagement: -1 }
          },
          {
            $limit: 10
          },
          {
            $project: {
              title: 1,
              likes: 1,
              comments: 1,
              views: 1,
              engagement: 1,
              category: 1
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0]
  });
});

// @desc    Bulk update display order
// @route   PUT /api/instagram/bulk-order
// @access  Private/Admin
const bulkUpdateDisplayOrder = asyncHandler(async (req, res) => {
  const { videos } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(videos)) {
    res.status(400);
    throw new Error('Videos must be an array');
  }

  const bulkOps = videos.map(video => ({
    updateOne: {
      filter: { _id: video.id },
      update: { 
        displayOrder: video.displayOrder,
        lastUpdatedBy: req.user ? req.user._id : null
      }
    }
  }));

  await InstagramVideo.bulkWrite(bulkOps);

  res.json({
    success: true,
    message: 'Display order updated successfully'
  });
});

module.exports = {
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
};

