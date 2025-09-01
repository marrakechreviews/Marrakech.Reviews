const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

router.get('/sitemap.xml', sitemapController.generateSitemap);

module.exports = router;
