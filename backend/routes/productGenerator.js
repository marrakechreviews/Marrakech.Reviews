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

// Web scraping function for eBay product pages
async function scrapeEbayProductPage(url) {
  if (!url.includes('ebay.com')) {
    throw new Error('This scraper currently only supports eBay.com URLs.');
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.google.com/'
    };

    const response = await axios.get(url, { headers, timeout: 15000 });
    const $ = cheerio.load(response.data);

    // --- eBay Specific Selectors ---
    const name = $('.x-item-title__mainTitle .ux-textspans').text().trim();
    const priceString = $('.x-price-primary .ux-textspans').first().text().trim();

    const images = [];
    $('.ux-image-carousel-item img').each((i, el) => {
      // Use .attr('data-src') if it exists, otherwise fall back to 'src'
      const imageUrl = $(el).attr('data-src') || $(el).attr('src');
      if (imageUrl) {
        images.push(imageUrl);
      }
    });

    // --- Description from iframe ---
    let description = 'N/A';
    const iframeSrc = $('iframe#desc_ifr').attr('src');
    if (iframeSrc) {
      const descResponse = await axios.get(iframeSrc, { headers, timeout: 10000 });
      const $desc = cheerio.load(descResponse.data);
      description = $desc('div#ds_div').text().trim();
    }

    // --- Data Cleanup ---
    const price = parseFloat(priceString.replace(/[^0-9.]/g, ''));

    // --- Constructing the Product Data ---
    const productData = {
      name: name || 'N/A',
      description: description,
      price: isNaN(price) ? 0 : price,
      comparePrice: 0,
      category: 'eBay Product',
      brand: 'N/A', // eBay doesn't have a standard brand field
      image: images.length > 0 ? images[0] : '',
      images: images,
      countInStock: 10,
      seoTitle: name,
      seoDescription: description.substring(0, 160),
    };

    return productData;

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    if (error.response?.status === 403) {
      throw new Error('Scraping failed: eBay is blocking the request (403 Forbidden).');
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
    processEbayUrl(taskId, product_url);

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

// Async function to process a single eBay URL
async function processEbayUrl(taskId, url) {
  const task = tasks.get(taskId);
  if (!task) return;

  try {
    task.status = "in_progress";
    task.progress = "50%";
    tasks.set(taskId, task);

    const productData = await scrapeEbayProductPage(url);

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
