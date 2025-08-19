const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { scrapeProduct } = require("../services/scraper");

// In-memory storage for tasks (in production, use a database)
const tasks = new Map();

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
    processProductUrl(taskId, product_url);

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

// Async function to process a single URL
async function processProductUrl(taskId, url) {
  const task = tasks.get(taskId);
  if (!task) return;

  try {
    task.status = "in_progress";
    task.progress = "50%";
    tasks.set(taskId, task);

    const productData = await scrapeProduct(url);

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
