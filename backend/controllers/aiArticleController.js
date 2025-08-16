const asyncHandler = require("express-async-handler");
const Article = require("../models/Article");

// AI Article Generation Template
const generateArticleHTML = (data) => {
  const {
    title,
    primaryKeyword,
    secondaryKeywords = [],
    metaDescription,
    content,
    businessName,
    location,
    uniqueSellingPoints = [],
    customerExperience = [],
    locationAdvantages = [],
    offerings = [],
    competitiveDifferentiators = [],
    history = "",
    testimonial = "",
    callToAction = ""
  } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${[primaryKeyword, ...secondaryKeywords].join(', ')}">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #000000;
            background-color: #ffffff;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: bold;
            color: #000000;
            margin-bottom: 20px;
            border-bottom: 3px solid #000000;
            padding-bottom: 10px;
        }
        
        h2 {
            font-size: 1.8rem;
            font-weight: bold;
            color: #000000;
            margin: 30px 0 15px 0;
        }
        
        h3 {
            font-size: 1.4rem;
            font-weight: bold;
            color: #000000;
            margin: 25px 0 10px 0;
        }
        
        p {
            margin-bottom: 15px;
            font-size: 1rem;
            line-height: 1.7;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .testimonial {
            background-color: #f5f5f5;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #000000;
            font-style: italic;
        }
        
        .cta {
            background-color: #000000;
            color: #ffffff;
            padding: 15px 30px;
            text-align: center;
            margin: 30px 0;
            border-radius: 5px;
        }
        
        .cta a {
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 15px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            h3 {
                font-size: 1.2rem;
            }
        }
    </style>
</head>
<body>
    <article>
        <header>
            <h1>${title}</h1>
        </header>
        
        <section>
            <p>${content.introduction || `Discover the exceptional experience that awaits you at ${businessName} in ${location}. Our commitment to excellence and unique approach sets us apart in the industry.`}</p>
        </section>

        ${history ? `
        <section>
            <h2>Our Story</h2>
            <p>${history}</p>
        </section>
        ` : ''}

        ${uniqueSellingPoints.length > 0 ? `
        <section>
            <h2>What Makes Us Special</h2>
            <ul>
                ${uniqueSellingPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </section>
        ` : ''}

        ${offerings.length > 0 ? `
        <section>
            <h2>Our Offerings</h2>
            <ul>
                ${offerings.map(offering => `<li>${offering}</li>`).join('')}
            </ul>
        </section>
        ` : ''}

        ${locationAdvantages.length > 0 ? `
        <section>
            <h2>Prime Location Benefits</h2>
            <ul>
                ${locationAdvantages.map(advantage => `<li>${advantage}</li>`).join('')}
            </ul>
        </section>
        ` : ''}

        ${customerExperience.length > 0 ? `
        <section>
            <h2>Customer Experience</h2>
            <ul>
                ${customerExperience.map(experience => `<li>${experience}</li>`).join('')}
            </ul>
        </section>
        ` : ''}

        ${competitiveDifferentiators.length > 0 ? `
        <section>
            <h2>Why Choose Us</h2>
            <ul>
                ${competitiveDifferentiators.map(diff => `<li>${diff}</li>`).join('')}
            </ul>
        </section>
        ` : ''}

        ${testimonial ? `
        <section>
            <h2>What Our Customers Say</h2>
            <div class="testimonial">
                <p>"${testimonial}"</p>
            </div>
        </section>
        ` : ''}

        ${callToAction ? `
        <section>
            <div class="cta">
                <p>${callToAction}</p>
            </div>
        </section>
        ` : ''}
    </article>
</body>
</html>`;
};

// @desc    Generate AI articles from base URLs
// @route   POST /api/articles/generate-ai
// @access  Private/Admin
const generateAIArticles = asyncHandler(async (req, res) => {
  const { baseUrls } = req.body;

  if (!baseUrls || !Array.isArray(baseUrls) || baseUrls.length === 0) {
    res.status(400);
    throw new Error("Base URLs are required and must be an array");
  }

  const generatedArticles = [];

  for (const baseUrl of baseUrls) {
    try {
      // Extract business information from URL
      const urlParts = new URL(baseUrl);
      const domain = urlParts.hostname.replace('www.', '');
      const businessName = domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Generate article data based on URL analysis
      const articleData = {
        title: `${businessName} - Your Premier Destination in Marrakech`,
        primaryKeyword: `${businessName} Marrakech`,
        secondaryKeywords: [
          `best ${businessName.toLowerCase()} Marrakech`,
          `${businessName.toLowerCase()} Morocco`,
          `Marrakech ${businessName.toLowerCase()}`
        ],
        metaDescription: `Discover ${businessName} in Marrakech - offering exceptional service, prime location, and unforgettable experiences. Book now for the best rates.`,
        businessName,
        location: "Marrakech, Morocco",
        content: {
          introduction: `Welcome to ${businessName}, where exceptional service meets authentic Moroccan hospitality in the heart of Marrakech. Our commitment to excellence and attention to detail ensures every guest enjoys an unforgettable experience.`
        },
        uniqueSellingPoints: [
          "Authentic Moroccan experience with modern comfort",
          "Prime location in the heart of Marrakech",
          "Exceptional customer service and personalized attention",
          "Competitive pricing with premium quality"
        ],
        customerExperience: [
          "Warm welcome with traditional Moroccan hospitality",
          "Personalized service tailored to your needs",
          "Clean, comfortable, and well-maintained facilities",
          "Knowledgeable staff ready to assist with local recommendations"
        ],
        locationAdvantages: [
          "Walking distance to major attractions",
          "Easy access to public transportation",
          "Surrounded by authentic local markets and restaurants",
          "Safe and secure neighborhood"
        ],
        offerings: [
          "Premium services at competitive rates",
          "24/7 customer support",
          "Flexible booking options",
          "Special packages and seasonal offers"
        ],
        competitiveDifferentiators: [
          "Years of experience in hospitality",
          "Consistently high customer satisfaction ratings",
          "Commitment to sustainable tourism practices",
          "Strong local partnerships and connections"
        ],
        history: `${businessName} has been serving visitors to Marrakech for years, building a reputation for excellence and authentic Moroccan hospitality. Our deep understanding of local culture and commitment to quality service has made us a trusted choice for travelers.`,
        testimonial: `Our stay at ${businessName} exceeded all expectations. The location was perfect, the service was outstanding, and the authentic Moroccan atmosphere made our trip truly memorable. We'll definitely be back!`,
        callToAction: `Ready to experience the best of Marrakech? Contact ${businessName} today to book your unforgettable stay. Visit ${baseUrl} or call us directly for the best rates and personalized service.`
      };

      // Generate HTML content
      const htmlContent = generateArticleHTML(articleData);

      // Create article slug
      const slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");

      // Create article object
      const article = new Article({
        title: articleData.title,
        slug,
        content: htmlContent,
        author: req.user ? req.user._id : null,
        category: "Business",
        tags: [businessName, "Marrakech", "Morocco", "Travel", "Hospitality"],
        metaTitle: articleData.title,
        metaDescription: articleData.metaDescription,
        keywords: [articleData.primaryKeyword, ...articleData.secondaryKeywords],
        isPublished: true,
        sourceUrl: baseUrl
      });

      const savedArticle = await article.save();
      generatedArticles.push(savedArticle);

    } catch (error) {
      console.error(`Error generating article for ${baseUrl}:`, error);
      // Continue with other URLs even if one fails
    }
  }

  if (generatedArticles.length === 0) {
    res.status(500);
    throw new Error("Failed to generate any articles");
  }

  res.status(201).json({
    message: `Successfully generated ${generatedArticles.length} articles`,
    articles: generatedArticles
  });
});

module.exports = {
  generateAIArticles
};

