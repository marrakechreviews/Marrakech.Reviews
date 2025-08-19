const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// In-memory storage for tasks (in production, use a database)
const tasks = new Map();

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

// Web scraping function for Etsy product pages
async function scrapeEtsyProductPage(url) {
  if (!url.includes('etsy.com')) {
    throw new Error('This scraper currently only supports Etsy.com URLs.');
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.google.com/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // --- Etsy Specific Selectors ---
    const name = $('h1[data-buy-box-listing-title="true"]').text().trim();
    const priceString = $('p.wt-text-title-03').first().text().trim();
    const description = $('div#description-text .wt-text-body-01').text().trim();

    const images = [];
    $('ul.wt-list-unstyled.wt-position-absolute li img').each((i, el) => {
      images.push($(el).attr('src'));
    });

    // --- Data Cleanup ---
    const price = parseFloat(priceString.replace(/[^0-9.]/g, ''));

    // --- Constructing the Product Data ---
    const productData = {
      name: name || 'N/A',
      description: description || 'N/A',
      price: isNaN(price) ? 0 : price,
      comparePrice: 0, // Etsy doesn't always show compare price clearly
      category: 'Etsy Product', // Default category
      subcategory: '',
      brand: 'Etsy Seller', // Etsy doesn't have a standard brand field
      image: images.length > 0 ? images[0] : '',
      images: images,
      countInStock: 10, // Default value
      rating: 0,
      numReviews: 0,
      specifications: {},
      tags: [],
      sku: '',
      seoTitle: name,
      seoDescription: description.substring(0, 160),
    };

    return productData;

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    // Re-throw a more specific error to be handled by the route
    if (error.response?.status === 403) {
      throw new Error('Scraping failed: Etsy is blocking the request (403 Forbidden).');
    }
    throw new Error(`Scraping failed: ${error.message}`);
  }
}

// POST /api/generate-product
router.post("/generate-product", async (req, res) => {
  try {
    const { product_url } = req.body;

    if (!product_url) {
      return res.status(400).json({
        status: "error",
        message: "product_url is required"
      });
    }

    const taskId = uuidv4();

    tasks.set(taskId, {
      status: "pending",
      progress: "0%",
      product_data: null,
      created_at: new Date()
    });

    // Process asynchronously
    processEtsyUrl(taskId, product_url);

    res.json({
      status: "success",
      message: "Product scraping initiated",
      task_id: taskId
    });
  } catch (error) {
    console.error('Error initiating product scraping:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to initiate product scraping"
    });
  }
});

// GET /api/product-status/:taskId
router.get("/product-status/:taskId", (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({
      status: "error",
      message: "Task not found"
    });
  }

  res.json(task);
});

// Async function to process a single Etsy URL
async function processEtsyUrl(taskId, url) {
  const task = tasks.get(taskId);
  if (!task) return;

  try {
    task.status = "in_progress";
    task.progress = "50%"; // No AI step, so we start at 50%
    tasks.set(taskId, task);

    const productData = await scrapeEtsyProductPage(url);

    task.status = "completed";
    task.progress = "100%";
    task.product_data = productData;
    tasks.set(taskId, task);

  } catch (error) {
    console.error(`Error processing ${url}:`, error);
    task.status = "failed";
    task.error = error.message;
    tasks.set(taskId, task);
  }
}

module.exports = router;
