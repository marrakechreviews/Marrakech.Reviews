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
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2c3e50; /* Dark Blue/Charcoal */
            --secondary-color: #3498db; /* Bright Blue */
            --accent-color: #e74c3c; /* Red/Orange */
            --text-color: #333333;
            --light-gray: #f8f8f8;
            --border-color: #dddddd;
            --shadow-light: rgba(0, 0, 0, 0.05);
            --shadow-medium: rgba(0, 0, 0, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Roboto', sans-serif;
            line-height: 1.8;
            color: var(--text-color);
            background: linear-gradient(to bottom right, #f0f2f5, #e0e4e8); /* Subtle gradient background */
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 20px;
        }

        article {
            background-color: #ffffff;
            max-width: 900px;
            width: 100%;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px var(--shadow-medium);
            overflow: hidden;
            position: relative;
            z-index: 1;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Playfair Display', serif;
            color: var(--primary-color);
            margin-bottom: 20px;
            line-height: 1.3;
            text-rendering: optimizeLegibility;
        }

        h1 {
            font-size: 3.2rem;
            font-weight: 700;
            text-align: center;
            padding-bottom: 25px;
            border-bottom: 3px solid var(--border-color);
            margin-bottom: 50px;
            position: relative;
            color: #1a202c; /* Darker primary for H1 */
        }
        h1::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: -3px;
            transform: translateX(-50%);
            width: 80px;
            height: 6px;
            background-color: var(--secondary-color);
            border-radius: 3px;
        }
        
        h2 {
            font-size: 2.4rem;
            font-weight: 700;
            margin: 50px 0 25px;
            color: var(--secondary-color);
            position: relative;
            padding-left: 20px;
            letter-spacing: -0.5px;
        }
        h2::before {
            content: '✨'; /* Sparkle emoji */
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.5rem;
        }
        
        h3 {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 35px 0 18px;
            color: var(--primary-color);
            border-bottom: 1px dashed var(--border-color);
            padding-bottom: 10px;
        }
        
        p {
            margin-bottom: 22px;
            font-size: 1.15rem;
            line-height: 2;
            text-align: justify;
            color: #4a5568; /* Slightly softer text color */
        }
        
        ul, ol {
            margin: 25px 0;
            padding-left: 45px;
            list-style-type: none; /* Remove default list style */
        }
        
        ul li::before {
            content: '✅'; /* Checkmark emoji */
            margin-right: 10px;
            font-size: 1.1rem;
        }

        ol li::before {
            content: counter(list-item) '. ';
            font-weight: bold;
            color: var(--accent-color);
            margin-right: 10px;
        }
        ol {
            counter-reset: list-item;
        }
        ol li {
            counter-increment: list-item;
        }

        li {
            margin-bottom: 15px;
            line-height: 1.9;
            font-size: 1.1rem;
            color: #4a5568;
        }

        section {
            margin-bottom: 60px;
            padding: 20px;
            background-color: #fdfefe; /* Slightly off-white for sections */
            border-radius: 12px;
            box-shadow: 0 5px 15px var(--shadow-light);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        section:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 25px var(--shadow-medium);
        }
        
        .testimonial {
            background: linear-gradient(to right, var(--secondary-color), #5dade2); /* Gradient background */
            padding: 35px;
            margin: 45px 0;
            border-radius: 12px;
            font-style: italic;
            color: #ffffff; /* White text for contrast */
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }
        .testimonial::before {
            content: '“'; /* Opening quote */
            font-family: serif;
            font-size: 8rem;
            color: rgba(255, 255, 255, 0.2);
            position: absolute;
            top: -20px;
            left: 20px;
            z-index: 0;
        }
        .testimonial p {
            font-size: 1.3rem;
            line-height: 1.7;
            margin-bottom: 0;
            color: #ffffff;
            position: relative;
            z-index: 1;
        }
        
        .cta {
            background: linear-gradient(to right, var(--accent-color), #e67e22); /* Orange gradient */
            color: #ffffff;
            padding: 30px 40px;
            text-align: center;
            margin: 60px 0;
            border-radius: 12px;
            font-size: 1.4rem;
            font-weight: 700;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            cursor: pointer;
        }
        
        .cta:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.3);
            background: linear-gradient(to right, #e67e22, #f39c12); /* Slightly shifted gradient */
        }

        .cta a {
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
            display: block;
        }

        .image-placeholder {
            width: 100%;
            height: 350px;
            background-color: var(--light-gray);
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--text-color);
            font-size: 1.5rem;
            margin: 35px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px var(--shadow-light);
        }
        .image-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .image-placeholder img:hover {
            transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
            body {
                padding: 20px 15px;
            }
            article {
                padding: 30px;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 40px;
            }
            h2 {
                font-size: 2rem;
                margin: 40px 0 20px;
            }
            h3 {
                font-size: 1.5rem;
                margin: 30px 0 15px;
            }
            p {
                font-size: 1.05rem;
            }
            .testimonial p {
                font-size: 1.1rem;
            }
            .cta {
                font-size: 1.2rem;
                padding: 25px 30px;
            }
            .image-placeholder {
                height: 250px;
            }
            ul, ol {
                padding-left: 30px;
            }
            ul li::before {
                font-size: 1rem;
            }
        }

        @media (max-width: 480px) {
            article {
                padding: 20px;
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 30px;
            }
            h2 {
                font-size: 1.7rem;
                margin: 30px 0 15px;
            }
            h3 {
                font-size: 1.3rem;
            }
            p {
                font-size: 1rem;
            }
            .testimonial p {
                font-size: 1rem;
            }
            .cta {
                font-size: 1rem;
                padding: 20px 25px;
            }
            .image-placeholder {
                height: 180px;
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
            ${content.imageUrl ? `<div class="image-placeholder"><img src="${content.imageUrl}" alt="${title}"></div>` : ''}
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
          introduction: `Welcome to ${businessName}, where exceptional service meets authentic Moroccan hospitality in the heart of Marrakech. Our commitment to excellence and attention to detail ensures every guest enjoys an unforgettable experience.`,
          imageUrl: `https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=400&fit=crop&auto=format` // Default Marrakech image
        },
        uniqueSellingPoints: [
          "🏛️ Authentic Moroccan experience with modern comfort and luxury amenities",
          "📍 Prime location in the heart of Marrakech's historic medina",
          "⭐ Exceptional customer service with 24/7 multilingual support",
          "💰 Competitive pricing with premium quality and value for money",
          "🎯 Personalized experiences tailored to your preferences"
        ],
        customerExperience: [
          "🤝 Warm welcome with traditional Moroccan mint tea ceremony",
          "👥 Personalized service with dedicated concierge assistance",
          "🧹 Immaculately clean and well-maintained facilities",
          "🗺️ Expert local recommendations and guided tour arrangements",
          "📱 Modern amenities including high-speed WiFi and mobile check-in"
        ],
        locationAdvantages: [
          "🚶 Walking distance to Jemaa el-Fnaa square and major attractions",
          "🚌 Easy access to public transportation and airport transfers",
          "🍽️ Surrounded by authentic local restaurants and traditional souks",
          "🛡️ Safe and secure neighborhood with 24/7 security presence",
          "🏛️ Rich cultural heritage with historic landmarks nearby"
        ],
        offerings: [
          "🏨 Premium accommodation with traditional Moroccan architecture",
          "📞 24/7 customer support in multiple languages",
          "📅 Flexible booking options with free cancellation",
          "🎁 Special packages including spa treatments and cultural tours",
          "🍽️ Authentic Moroccan cuisine and international dining options"
        ],
        competitiveDifferentiators: [
          "📈 Over 10 years of experience in Moroccan hospitality industry",
          "⭐ Consistently rated 4.8+ stars with over 1000 positive reviews",
          "🌱 Commitment to sustainable tourism and eco-friendly practices",
          "🤝 Strong partnerships with local artisans and cultural centers",
          "🏆 Award-winning service recognized by international travel organizations"
        ],
        history: `${businessName} has been a cornerstone of Marrakech's hospitality scene for over a decade, building an unparalleled reputation for excellence and authentic Moroccan experiences. Founded by local entrepreneurs with deep roots in the community, we have welcomed thousands of guests from around the world, each leaving with unforgettable memories of Morocco's rich culture and warm hospitality. Our journey began with a simple vision: to share the magic of Marrakech while preserving its authentic character and supporting local communities.`,
        testimonial: `Our stay at ${businessName} was absolutely magical! From the moment we arrived, we were treated like family. The location was perfect for exploring the medina, the staff went above and beyond to make our experience special, and the authentic Moroccan atmosphere made our trip truly unforgettable. The attention to detail, from the beautiful traditional decor to the personalized recommendations, exceeded all our expectations. We're already planning our return visit!`,
        callToAction: `Ready to experience the enchanting beauty of Marrakech? Book your unforgettable stay at ${businessName} today and discover why we're the preferred choice for discerning travelers. Visit ${baseUrl} or contact us directly for exclusive rates, personalized packages, and expert travel planning. Don't just visit Marrakech – experience it authentically with ${businessName}. Your Moroccan adventure awaits!`
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

