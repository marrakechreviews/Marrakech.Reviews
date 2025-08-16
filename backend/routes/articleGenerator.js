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

// Article generation template
const ARTICLE_TEMPLATE = `
You are an expert SEO content writer. Generate a complete HTML article based on the provided content and requirements.

CONTENT REQUIREMENTS:
- Focus on products or services with unique selling points
- Highlight customer experience
- Include location advantages
- Detail menu/offerings/amenities
- Show competitive differentiators

SEO SPECIFICATIONS:
- Include primary and secondary keywords naturally
- Meta description under 160 characters
- Proper H1-H3 heading hierarchy (only one H1)
- Local SEO elements

CONTENT STRUCTURE:
- Engaging H1 title with primary keyword
- Introductory paragraph (hook + value proposition)
- 4-6 detailed sections with H2 headers
- Subsections with H3 headers where needed
- Bullet-point lists for features
- Customer review/quote highlights
- Call-to-action

STYLING REQUIREMENTS:
- Font: Black text only (#000000)
- Headings: Bold only
- H1 with bottom border
- Light gray highlight boxes for testimonials
- Clean, spacious layout
- Mobile-responsive design

TONE & STYLE:
- Professional yet approachable
- Benefit-focused language
- Active voice
- Concise paragraphs (max 3-4 sentences)

Generate a complete HTML document with embedded CSS that follows these requirements exactly.
`;

// Web scraping function
async function scrapeWebsite(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract basic metadata
    const title = $('title').text() || $('h1').first().text() || '';
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';
    
    // Extract structured data
    const jsonLd = [];
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        jsonLd.push(data);
      } catch (e) {
        // Ignore invalid JSON-LD
      }
    });
    
    // Extract headings with hierarchy
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const text = $(el).text().trim();
      const level = el.tagName.toLowerCase();
      if (text) {
        headings.push({ level, text });
      }
    });
    
    // Extract paragraphs with context
    const paragraphs = [];
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 30) {
        // Check if paragraph is near important sections
        const nearHeading = $(el).prevAll('h1, h2, h3').first().text().trim();
        paragraphs.push({ text, nearHeading });
      }
    });
    
    // Extract lists with context
    const lists = [];
    $('ul, ol').each((i, el) => {
      const items = [];
      $(el).find('li').each((j, li) => {
        const text = $(li).text().trim();
        if (text) items.push(text);
      });
      if (items.length > 0) {
        const nearHeading = $(el).prevAll('h1, h2, h3').first().text().trim();
        lists.push({ items, nearHeading });
      }
    });
    
    // Extract potential testimonials/reviews
    const testimonials = [];
    $('[class*="review"], [class*="testimonial"], [class*="quote"], blockquote').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20 && text.length < 500) {
        testimonials.push(text);
      }
    });
    
    // Extract contact/location information
    const contactInfo = [];
    $('[class*="contact"], [class*="address"], [class*="location"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10 && text.length < 200) {
        contactInfo.push(text);
      }
    });
    
    // Extract features/amenities
    const features = [];
    $('[class*="feature"], [class*="amenity"], [class*="service"], [class*="benefit"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && text.length < 100) {
        features.push(text);
      }
    });
    
    // Extract pricing information
    const pricing = [];
    $('[class*="price"], [class*="cost"], [class*="rate"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && /[\$€£¥₹]|\d+/.test(text)) {
        pricing.push(text);
      }
    });
    
    // Extract images with alt text
    const images = [];
    $('img[alt]').each((i, el) => {
      const alt = $(el).attr('alt');
      const src = $(el).attr('src');
      if (alt && alt.length > 5) {
        images.push({ alt, src });
      }
    });
    
    // Combine content for analysis
    const combinedContent = [
      ...paragraphs.map(p => p.text),
      ...lists.flatMap(l => l.items),
      ...testimonials,
      ...features
    ].join(' ').substring(0, 3000);
    
    return {
      url,
      title,
      description,
      headings: headings.slice(0, 15),
      paragraphs: paragraphs.slice(0, 20),
      lists: lists.slice(0, 8),
      testimonials: testimonials.slice(0, 5),
      contactInfo: contactInfo.slice(0, 3),
      features: features.slice(0, 10),
      pricing: pricing.slice(0, 5),
      images: images.slice(0, 5),
      jsonLd: jsonLd.slice(0, 3),
      content: combinedContent
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return {
      url,
      error: error.message,
      title: '',
      description: '',
      headings: [],
      paragraphs: [],
      lists: [],
      testimonials: [],
      contactInfo: [],
      features: [],
      pricing: [],
      images: [],
      jsonLd: [],
      content: ''
    };
  }
}

// Generate article using OpenAI
async function generateArticle(scrapedData) {
  try {
    const prompt = `${ARTICLE_TEMPLATE}

SCRAPED CONTENT FROM: ${scrapedData.url}

BASIC INFORMATION:
- Title: ${scrapedData.title}
- Meta Description: ${scrapedData.description}

CONTENT STRUCTURE:
- Headings: ${scrapedData.headings.map(h => `${h.level.toUpperCase()}: ${h.text}`).join(' | ')}
- Main Content: ${scrapedData.content}

BUSINESS DETAILS:
- Features/Services: ${scrapedData.features.join(', ')}
- Pricing Information: ${scrapedData.pricing.join(', ')}
- Contact/Location: ${scrapedData.contactInfo.join(' | ')}

CUSTOMER EXPERIENCE:
- Testimonials/Reviews: ${scrapedData.testimonials.join(' | ')}

CONTENT LISTS:
${scrapedData.lists.map(list => `- ${list.nearHeading}: ${list.items.join(', ')}`).join('\n')}

VISUAL ELEMENTS:
- Image Descriptions: ${scrapedData.images.map(img => img.alt).join(', ')}

STRUCTURED DATA:
${scrapedData.jsonLd.length > 0 ? JSON.stringify(scrapedData.jsonLd[0], null, 2) : 'None available'}

INSTRUCTIONS:
1. Create a unique, SEO-optimized article that focuses on the business's unique selling points
2. Highlight customer experience and location advantages
3. Include specific features, amenities, and competitive differentiators found in the scraped content
4. Use testimonials naturally within the content
5. Generate proper meta description under 160 characters
6. Create engaging H1 title with primary keyword related to the business
7. Structure with 4-6 H2 sections and appropriate H3 subsections
8. Include bullet points for features and a strong call-to-action
9. Follow the exact styling requirements (black text, bold headings, minimal decoration)
10. Make the article ready to publish and mobile-responsive

Generate a complete, professional HTML article now:`;

    const response = await axios.post(`${OPENAI_API_BASE}/chat/completions`, {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert SEO content writer who creates high-quality, original HTML articles that convert visitors into customers. Focus on unique value propositions and customer benefits."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating article:', error.message);
    throw new Error('Failed to generate article');
  }
}

// POST /api/generate-article
router.post("/generate-article", async (req, res) => {
  try {
    const { base_urls } = req.body;
    
    if (!base_urls || !Array.isArray(base_urls) || base_urls.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "base_urls array is required and must not be empty"
      });
    }

    const taskId = uuidv4();
    
    // Initialize task
    tasks.set(taskId, {
      status: "pending",
      progress: "0%",
      articles: [],
      total_urls: base_urls.length,
      completed_urls: 0,
      created_at: new Date()
    });

    // Process URLs asynchronously
    processUrls(taskId, base_urls);

    res.json({
      status: "success",
      message: "Article generation initiated",
      task_id: taskId
    });
  } catch (error) {
    console.error('Error initiating article generation:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to initiate article generation"
    });
  }
});

// GET /api/article-status/:taskId
router.get("/article-status/:taskId", (req, res) => {
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

// Async function to process URLs
async function processUrls(taskId, urls) {
  const task = tasks.get(taskId);
  if (!task) return;

  task.status = "in_progress";
  tasks.set(taskId, task);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    try {
      // Update progress
      task.progress = `${Math.round(((i) / urls.length) * 100)}%`;
      tasks.set(taskId, task);

      // Scrape website
      const scrapedData = await scrapeWebsite(url);
      
      if (scrapedData.error) {
        task.articles.push({
          url,
          error: scrapedData.error,
          html_content: null
        });
      } else {
        // Generate article
        const htmlContent = await generateArticle(scrapedData);
        
        task.articles.push({
          url,
          html_content: htmlContent,
          scraped_data: {
            title: scrapedData.title,
            description: scrapedData.description
          }
        });
      }
      
      task.completed_urls++;
      
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      task.articles.push({
        url,
        error: error.message,
        html_content: null
      });
    }
  }

  // Mark as completed
  task.status = "completed";
  task.progress = "100%";
  tasks.set(taskId, task);
}

module.exports = router;

