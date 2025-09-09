const csv = require('csv-parser');
const fs = require('fs');
const iconv = require('iconv-lite');
const Article = require('../models/Article');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const OrganizedTravel = require('../models/OrganizedTravel');
const Review = require('../models/Review');
const User = require('../models/User');

exports.importArticles = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('windows-1252'))
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

  fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('windows-1252'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const productsByName = new Map();
        results.forEach(item => {
          if (!productsByName.has(item.name)) {
            productsByName.set(item.name, {
              ...item,
              reviews: []
            });
          }
          if (item.reviewComment) {
            productsByName.get(item.name).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail
            });
          }
        });

        const productNames = Array.from(productsByName.keys());
        const existingProducts = await Product.find({ name: { $in: productNames } });
        const existingProductMap = new Map(existingProducts.map(p => [p.name, p]));

        const newProductsData = [];
        productNames.forEach(name => {
          if (!existingProductMap.has(name)) {
            const item = productsByName.get(name);
            newProductsData.push({
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
            });
          }
        });

        if (newProductsData.length > 0) {
          const insertedProducts = await Product.insertMany(newProductsData);
          insertedProducts.forEach(p => existingProductMap.set(p.name, p));
        }

        const reviewsToInsert = [];
        const userEmails = [...new Set(results.filter(item => item.reviewComment).map(item => item.reviewUserEmail))];
        const users = await User.find({ email: { $in: userEmails } });
        const userMap = new Map(users.map(u => [u.email, u]));

        for (const item of results) {
          if (item.reviewComment) {
            const product = existingProductMap.get(item.name);
            const user = userMap.get(item.reviewUserEmail);

            if (product && user) {
              reviewsToInsert.push({
                name: item.reviewName,
                rating: parseInt(item.reviewRating),
                comment: item.reviewComment,
                user: user._id,
                refId: product._id,
                refModel: 'Product',
              });
            } else if (!user) {
              console.warn(`User with email ${item.reviewUserEmail} not found. Skipping review for product ${item.name}.`);
            }
          }
        }

        if (reviewsToInsert.length > 0) {
          await Review.insertMany(reviewsToInsert);
        }

        res.status(201).send({ message: `Products and reviews imported successfully.` });
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

  fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('windows-1252'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const activitiesByName = new Map();
        results.forEach(item => {
          if (!activitiesByName.has(item.name)) {
            activitiesByName.set(item.name, {
              ...item,
              reviews: []
            });
          }
          if (item.reviewComment) {
            activitiesByName.get(item.name).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail
            });
          }
        });

        const activityNames = Array.from(activitiesByName.keys());
        const existingActivities = await Activity.find({ name: { $in: activityNames } });
        const existingActivityMap = new Map(existingActivities.map(a => [a.name, a]));

        const newActivitiesData = [];
        activityNames.forEach(name => {
          if (!existingActivityMap.has(name)) {
            const item = activitiesByName.get(name);
            const slug = item.name
              .toLowerCase()
              .replace(/[^a-z0-9 -]/g, '') // Remove special characters
              .replace(/\s+/g, '-') // Replace spaces with hyphens
              .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
            newActivitiesData.push({
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
            });
          }
        });

        if (newActivitiesData.length > 0) {
          const insertedActivities = await Activity.insertMany(newActivitiesData);
          insertedActivities.forEach(a => existingActivityMap.set(a.name, a));
        }

        const reviewsToInsert = [];
        const userEmails = [...new Set(results.filter(item => item.reviewComment).map(item => item.reviewUserEmail))];
        const users = await User.find({ email: { $in: userEmails } });
        const userMap = new Map(users.map(u => [u.email, u]));

        for (const item of results) {
          if (item.reviewComment) {
            const activity = existingActivityMap.get(item.name);
            const user = userMap.get(item.reviewUserEmail);

            if (activity && user) {
              reviewsToInsert.push({
                name: item.reviewName,
                rating: parseInt(item.reviewRating),
                comment: item.reviewComment,
                user: user._id,
                refId: activity._id,
                refModel: 'Activity',
              });
            } else if (!user) {
              console.warn(`User with email ${item.reviewUserEmail} not found. Skipping review for activity ${item.name}.`);
            }
          }
        }

        if (reviewsToInsert.length > 0) {
          await Review.insertMany(reviewsToInsert);
        }

        res.status(201).send({ message: `Activities and reviews imported successfully.` });
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

  fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('windows-1252'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const travelsByName = new Map();
        results.forEach(item => {
          if (!travelsByName.has(item.title)) {
            travelsByName.set(item.title, {
              ...item,
              reviews: []
            });
          }
          if (item.reviewComment) {
            travelsByName.get(item.title).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail
            });
          }
        });

        const travelTitles = Array.from(travelsByName.keys());
        const existingTravels = await OrganizedTravel.find({ title: { $in: travelTitles } });
        const existingTravelMap = new Map(existingTravels.map(t => [t.title, t]));

        const newTravelsData = [];
        travelTitles.forEach(title => {
          if (!existingTravelMap.has(title)) {
            const item = travelsByName.get(title);
            newTravelsData.push({
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
            });
          }
        });

        if (newTravelsData.length > 0) {
          const insertedTravels = await OrganizedTravel.insertMany(newTravelsData);
          insertedTravels.forEach(t => existingTravelMap.set(t.title, t));
        }

        const reviewsToInsert = [];
        const userEmails = [...new Set(results.filter(item => item.reviewComment).map(item => item.reviewUserEmail))];
        const users = await User.find({ email: { $in: userEmails } });
        const userMap = new Map(users.map(u => [u.email, u]));

        for (const item of results) {
          if (item.reviewComment) {
            const travel = existingTravelMap.get(item.title);
            const user = userMap.get(item.reviewUserEmail);

            if (travel && user) {
              reviewsToInsert.push({
                name: item.reviewName,
                rating: parseInt(item.reviewRating),
                comment: item.reviewComment,
                user: user._id,
                refId: travel._id,
                refModel: 'OrganizedTravel',
              });
            } else if (!user) {
              console.warn(`User with email ${item.reviewUserEmail} not found. Skipping review for travel ${item.title}.`);
            }
          }
        }

        if (reviewsToInsert.length > 0) {
          await Review.insertMany(reviewsToInsert);
        }

        res.status(201).send({ message: `Organized travels and reviews imported successfully.` });
      } catch (error) {
        res.status(500).send({ message: 'Error importing organized travels.', error: error.message });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
};
