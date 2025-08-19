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

// Product data generation template
const PRODUCT_TEMPLATE = `
You are an expert data extractor for e-commerce websites. Your task is to extract product information from the provided scraped content and return it as a valid JSON object.

**JSON Object Structure:**
The JSON object must conform to the following structure. Do not add any extra fields.
{
  "name": "String",
  "description": "String",
  "price": "Number",
  "comparePrice": "Number",
  "category": "String",
  "subcategory": "String",
  "brand": "String",
  "image": "String (URL)",
  "images": ["String (URL)"],
  "countInStock": "Number",
  "rating": "Number (0-5)",
  "numReviews": "Number",
  "specifications": { "key": "value" },
  "tags": ["String"],
  "sku": "String",
  "seoTitle": "String",
  "seoDescription": "String"
}

**Instructions:**
1.  **Analyze the scraped content**: Carefully review the HTML content, metadata, and JSON-LD data.
2.  **Extract data for each field**: Fill in the JSON object with the extracted information.
3.  **Handle missing data**: If a value is not found, use a reasonable default (e.g., empty string for text, 0 for numbers, empty array for lists). For 'countInStock', if not specified, default to 10.
4.  **price and comparePrice**: These should be numbers, not strings. Remove currency symbols. If there's only one price, use it for 'price' and leave 'comparePrice' as 0. If there are two prices (e.g., a sale price and an original price), the lower one is 'price' and the higher one is 'comparePrice'.
5.  **images**: The 'image' field should be the main product image. The 'images' field should be an array of all product image URLs.
6.  **description**: Provide a detailed and clean product description. Remove any HTML tags.
7.  **specifications**: Extract key-value pairs of product specifications if available.
8.  **Output**: Return only the raw JSON object. Do not wrap it in markdown or any other text.
`;

// Web scraping function for product pages
async function scrapeProductPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Extract JSON-LD structured data first, as it's often the most reliable
    let productJsonLd = null;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data['@type'] === 'Product') {
          productJsonLd = data;
          return false; // exit loop
        }
      } catch (e) { /* ignore */ }
    });

    const getText = (selector) => $(selector).first().text().trim();
    const getAttr = (selector, attr) => $(selector).first().attr(attr);

    const title = productJsonLd?.name || getText('h1') || $('title').text();
    const description = productJsonLd?.description || getText('#product-description, .product-description, [class*="description"]') || getAttr('meta[name="description"]', 'content');

    let price, comparePrice;
    if (productJsonLd?.offers) {
      const offer = Array.isArray(productJsonLd.offers) ? productJsonLd.offers[0] : productJsonLd.offers;
      price = parseFloat(offer.price);
    } else {
        const priceText = getText('[class*="price"], [id*="price"]');
        const prices = priceText.match(/[\d,.]+/g)?.map(p => parseFloat(p.replace(/,/g, ''))) || [];
        price = Math.min(...prices);
        comparePrice = prices.length > 1 ? Math.max(...prices) : undefined;
    }

    const mainImage = productJsonLd?.image || getAttr('meta[property="og:image"]', 'content');
    const images = $('img[src*="product"]').map((i, el) => $(el).attr('src')).get();
    if (mainImage && !images.includes(mainImage)) {
        images.unshift(mainImage);
    }

    const brand = productJsonLd?.brand?.name || getText('[class*="brand"]');
    const sku = productJsonLd?.sku || getText('[class*="sku"], [id*="sku"]');

    const bodyText = $('body').text().substring(0, 5000); // Limit body text for performance

    return {
      url,
      title,
      description,
      price,
      comparePrice,
      images: [...new Set(images)], // Unique images
      brand,
      sku,
      content: `Title: ${title}\nDescription: ${description}\nFull Text: ${bodyText}`,
      jsonLd: productJsonLd,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return { url, error: error.message };
  }
}

// Generate product data using OpenAI
async function generateProductData(scrapedData) {
  try {
    const prompt = `${PRODUCT_TEMPLATE}

**Scraped Content from URL:** ${scrapedData.url}

**Extracted Information:**
- Title: ${scrapedData.title}
- Description: ${scrapedData.description}
- Price: ${scrapedData.price}
- Compare Price: ${scrapedData.comparePrice}
- Brand: ${scrapedData.brand}
- SKU: ${scrapedData.sku}
- Images: ${scrapedData.images.join(', ')}
- JSON-LD Data: ${JSON.stringify(scrapedData.jsonLd, null, 2)}

**Raw Content for Analysis:**
${scrapedData.content}

**Instructions:**
Generate the JSON object based on the provided data.
`;

    const response = await axios.post(`${OPENAI_API_BASE}/chat/completions`, {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert data extractor for e-commerce websites. Your task is to return a single, valid JSON object with the product data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // The response should be a JSON string, so we parse it.
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating product data:', error.response ? error.response.data : error.message);
    throw new Error('Failed to generate product data from AI.');
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

    processUrl(taskId, product_url);

    res.json({
      status: "success",
      message: "Product generation initiated",
      task_id: taskId
    });
  } catch (error) {
    console.error('Error initiating product generation:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to initiate product generation"
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
async function processUrl(taskId, url) {
  const task = tasks.get(taskId);
  if (!task) return;

  try {
    task.status = "in_progress";
    task.progress = "25%";
    tasks.set(taskId, task);

    const scrapedData = await scrapeProductPage(url);
    if (scrapedData.error) {
      throw new Error(`Scraping failed: ${scrapedData.error}`);
    }

    task.progress = "50%";
    tasks.set(taskId, task);

    const productData = await generateProductData(scrapedData);

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
