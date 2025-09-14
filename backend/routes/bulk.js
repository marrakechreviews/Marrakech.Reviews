const express = require('express');
const router = express.Router();
const bulkController = require('../controllers/bulkController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const uploadDir = '/tmp/uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post('/articles', protect, admin, upload.single('file'), bulkController.importArticles);
router.post('/products', protect, admin, upload.single('file'), bulkController.importProducts);
router.post('/activities', protect, admin, upload.single('file'), bulkController.importActivities);
router.post('/organized-travels', protect, admin, upload.single('file'), bulkController.importOrganizedTravels);
router.post('/reviews', protect, admin, upload.single('file'), bulkController.importReviews);

module.exports = router;
