const csv = require('csv-parser');
const fs = require('fs');
const Article = require('../models/Article');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const OrganizedTravel = require('../models/OrganizedTravel');

exports.importArticles = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath, { encoding: 'utf-8' })
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const articles = results.map(item => ({
          title: item.title,
          content: item.content,
          author: req.user._id, // Assuming author is the logged-in admin
          category: item.category,
          tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
          image: item.image,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          keywords: item.keywords ? item.keywords.split(',').map(kw => kw.trim()) : [],
          isPublished: item.isPublished ? item.isPublished.toLowerCase() === 'true' : false,
        }));

        await Article.insertMany(articles);
        res.status(201).send({ message: `${articles.length} articles imported successfully.` });
      } catch (error) {
        res.status(500).send({ message: 'Error importing articles.', error: error.message });
      } finally {
        fs.unlinkSync(filePath); // Clean up uploaded file
      }
    });
};

exports.importProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath, { encoding: 'utf-8' })
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const products = results.map(item => ({
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          comparePrice: item.comparePrice ? parseFloat(item.comparePrice) : undefined,
          category: item.category,
          subcategory: item.subcategory,
          brand: item.brand,
          image: item.image,
          images: item.images ? item.images.split(',').map(img => img.trim()) : [],
          countInStock: parseInt(item.countInStock),
          lowStockThreshold: item.lowStockThreshold ? parseInt(item.lowStockThreshold) : 10,
          rating: item.rating ? parseFloat(item.rating) : 0,
          numReviews: item.numReviews ? parseInt(item.numReviews) : 0,
          isFeatured: item.isFeatured ? item.isFeatured.toLowerCase() === 'true' : false,
          isActive: item.isActive ? item.isActive.toLowerCase() === 'true' : true,
          tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
          sku: item.sku,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          seoKeywords: item.seoKeywords ? item.seoKeywords.split(',').map(kw => kw.trim()) : [],
        }));

        await Product.insertMany(products);
        res.status(201).send({ message: `${products.length} products imported successfully.` });
      } catch (error) {
        res.status(500).send({ message: 'Error importing products.', error: error.message });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
};

exports.importActivities = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath, { encoding: 'utf-8' })
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const activities = results
          .filter(item => item.name && item.name.trim() !== '')
          .map(item => {
            const slug = item.name
              .toLowerCase()
              .replace(/[^a-z0-9 -]/g, '') // Remove special characters
              .replace(/\s+/g, '-') // Replace spaces with hyphens
              .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

            return {
              name: item.name,
              slug: slug,
              description: item.description,
              shortDescription: item.shortDescription,
              price: parseFloat(item.price),
              marketPrice: parseFloat(item.marketPrice),
              currency: item.currency,
              category: item.category,
              location: item.location,
              duration: item.duration,
              maxParticipants: parseInt(item.maxParticipants),
              minParticipants: parseInt(item.minParticipants),
              image: item.image,
              images: item.images ? item.images.split(',').map(img => img.trim()) : [],
              isActive: item.isActive ? item.isActive.toLowerCase() === 'true' : true,
              isFeatured: item.isFeatured ? item.isFeatured.toLowerCase() === 'true' : false,
              tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
              difficulty: item.difficulty,
              seoTitle: item.seoTitle,
              seoDescription: item.seoDescription,
              seoKeywords: item.seoKeywords ? item.seoKeywords.split(',').map(kw => kw.trim()) : [],
            };
          });

        if (activities.length > 0) {
          await Activity.insertMany(activities);
        }
        res.status(201).send({ message: `${activities.length} activities imported successfully.` });
      } catch (error) {
        console.error('Error importing activities:', JSON.stringify(error, null, 2));
        res.status(500).send({ message: 'Error importing activities.', error: error.message, details: error });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
};

exports.importOrganizedTravels = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath, { encoding: 'utf-8' })
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const travels = results.map(item => ({
          title: item.title,
          destination: item.destination,
          description: item.description,
          price: parseFloat(item.price),
          duration: item.duration,
          maxGroupSize: parseInt(item.maxGroupSize),
          included: item.included ? item.included.split(',').map(inc => inc.trim()) : [],
          excluded: item.excluded ? item.excluded.split(',').map(exc => exc.trim()) : [],
          heroImage: item.heroImage,
          gallery: item.gallery ? item.gallery.split(',').map(img => img.trim()) : [],
          difficulty: item.difficulty,
          category: item.category,
          highlights: item.highlights ? item.highlights.split(',').map(hl => hl.trim()) : [],
          isActive: item.isActive ? item.isActive.toLowerCase() === 'true' : true,
          featured: item.featured ? item.featured.toLowerCase() === 'true' : false,
          tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          seoKeywords: item.seoKeywords ? item.seoKeywords.split(',').map(kw => kw.trim()) : [],
        }));

        await OrganizedTravel.insertMany(travels);
        res.status(201).send({ message: `${travels.length} organized travels imported successfully.` });
      } catch (error) {
        res.status(500).send({ message: 'Error importing organized travels.', error: error.message });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
};
