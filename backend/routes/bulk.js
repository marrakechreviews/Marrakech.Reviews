const express = require('express');
const router = express.Router();
const bulkController = require('../controllers/bulkController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/articles', protect, admin, upload.single('file'), bulkController.importArticles);
router.post('/products', protect, admin, upload.single('file'), bulkController.importProducts);
router.post('/activities', protect, admin, upload.single('file'), bulkController.importActivities);
router.post('/organized-travels', protect, admin, upload.single('file'), bulkController.importOrganizedTravels);

module.exports = router;
