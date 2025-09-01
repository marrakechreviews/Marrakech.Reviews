const Article = require('../models/Article');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const OrganizedTravel = require('../models/OrganizedTravel');

const BASE_URL = 'https://www.marrakech.reviews';

const generateSitemap = async (req, res) => {
  try {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    const addUrl = (loc, lastmod, changefreq = 'daily', priority = '0.7') => {
      sitemap += '<url>';
      sitemap += `<loc>${loc}</loc>`;
      if (lastmod) {
        sitemap += `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>`;
      }
      sitemap += `<changefreq>${changefreq}</changefreq>`;
      sitemap += `<priority>${priority}</priority>`;
      sitemap += '</url>';
    };

    // Static pages
    addUrl(`${BASE_URL}/`, new Date(), 'daily', '1.0');
    addUrl(`${BASE_URL}/products`, new Date(), 'daily', '0.8');
    addUrl(`${BASE_URL}/articles`, new Date(), 'daily', '0.8');
    addUrl(`${BASE_URL}/activities`, new Date(), 'daily', '0.8');
    addUrl(`${BASE_URL}/travels`, new Date(), 'daily', '0.8');
    addUrl(`${BASE_URL}/about`, new Date(), 'monthly', '0.5');
    addUrl(`${BASE_URL}/contact`, new Date(), 'monthly', '0.5');

    // Articles
    const articles = await Article.find({ isPublished: true }).select('slug updatedAt');
    articles.forEach(article => {
      addUrl(`${BASE_URL}/articles/${article.slug}`, article.updatedAt);
    });

    // Products
    const products = await Product.find({ isActive: true }).select('slug updatedAt');
    products.forEach(product => {
      addUrl(`${BASE_URL}/products/${product.slug}`, product.updatedAt);
    });

    // Activities
    const activities = await Activity.find({ isActive: true }).select('slug updatedAt');
    activities.forEach(activity => {
      addUrl(`${BASE_URL}/activities/${activity.slug}`, activity.updatedAt);
    });

    // Organized Travels
    const travels = await OrganizedTravel.find({ isActive: true }).select('destination updatedAt');
    travels.forEach(travel => {
      addUrl(`${BASE_URL}/travels/${travel.destination}`, travel.updatedAt);
    });

    sitemap += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
};

module.exports = {
  generateSitemap,
};
