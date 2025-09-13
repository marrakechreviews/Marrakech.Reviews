const csv = require('csv-parser');
const fs = require('fs');
const iconv = require('iconv-lite');
const crypto = require('crypto');
const Article = require('../models/Article');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const OrganizedTravel = require('../models/OrganizedTravel');
const Review = require('../models/Review');
const User = require('../models/User');

const updateRatings = async (Model, docId) => {
  try {
    const reviews = await Review.find({ refId: docId });
    const numReviews = reviews.length;
    const rating = numReviews > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
      : 0;

    await Model.findByIdAndUpdate(docId, {
      rating,
      numReviews,
    });
  } catch (error) {
    console.error(`Failed to update ratings for ${Model.modelName} ${docId}:`, error);
  }
};

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
        const articlesToProcess = new Map();
        results.forEach(item => {
          const key = item.refId || item.title;
          if (!articlesToProcess.has(key)) {
            articlesToProcess.set(key, { ...item, reviews: [] });
          }
          if (item.reviewComment && item.reviewUserEmail) {
            articlesToProcess.get(key).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail,
            });
          }
        });

        const refIds = [];
        const titles = [];
        articlesToProcess.forEach((value, key) => {
          if (value.refId) {
            refIds.push(value.refId);
          } else {
            titles.push(value.title);
          }
        });

        const existingArticlesByRefId = refIds.length > 0 ? await Article.find({ refId: { $in: refIds } }) : [];
        const existingArticlesByTitle = titles.length > 0 ? await Article.find({ title: { $in: titles } }) : [];

        const existingArticleMap = new Map();
        existingArticlesByRefId.forEach(a => existingArticleMap.set(a.refId.toString(), a));
        existingArticlesByTitle.forEach(a => existingArticleMap.set(a.title, a));

        const newArticlesData = [];
        const updatePromises = [];

        for (const item of articlesToProcess.values()) {
          const key = item.refId || item.title;
          const existingArticle = existingArticleMap.get(key);

          const articleData = {
            title: item.title,
            content: item.content,
            author: req.user._id,
            category: item.category,
            tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
            image: item.image,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            keywords: item.keywords ? item.keywords.split(',').map(kw => kw.trim()) : [],
            isPublished: item.isPublished ? item.isPublished.toLowerCase() === 'true' : false,
            refId: item.refId,
          };

          Object.keys(articleData).forEach(key => articleData[key] === undefined && delete articleData[key]);

          if (existingArticle) {
            Object.assign(existingArticle, articleData);
            updatePromises.push(existingArticle.save());
          } else {
            // Important: author is required
            if (!articleData.author) articleData.author = req.user._id;
            newArticlesData.push(articleData);
          }
        }

        const updatedArticles = await Promise.all(updatePromises);
        updatedArticles.forEach(a => {
            const key = a.refId ? a.refId.toString() : a.title;
            existingArticleMap.set(key, a);
        });

        if (newArticlesData.length > 0) {
          const insertedArticles = await Article.insertMany(newArticlesData);
          insertedArticles.forEach(a => {
            const key = a.refId ? a.refId.toString() : a.title;
            existingArticleMap.set(key, a);
          });
        }

        // Now handle reviews
        const reviewEmails = [...new Set(results.filter(item => item.reviewComment && item.reviewUserEmail).map(item => item.reviewUserEmail))];
        const existingUsers = await User.find({ email: { $in: reviewEmails }});
        const userMap = new Map(existingUsers.map(u => [u.email, u]));

        for (const item of articlesToProcess.values()) {
            if (item.reviews.length > 0) {
                const key = item.refId || item.title;
                const article = existingArticleMap.get(key);
                if (article) {
                    for (const review of item.reviews) {
                        if (!review.reviewUserEmail) continue;

                        let user = userMap.get(review.reviewUserEmail);
                        if (!user) {
                            // Create a new user
                            const newUser = new User({
                                name: review.reviewName || 'Anonymous',
                                email: review.reviewUserEmail,
                                password: crypto.randomBytes(16).toString('hex'), // Generate a random password
                                isCsvImported: true,
                            });
                            try {
                                user = await newUser.save();
                                userMap.set(user.email, user); // Add to map to avoid re-creating
                            } catch (error) {
                                console.error(`Failed to create new user for email ${review.reviewUserEmail}:`, error.message);
                                continue; // Skip this review if user creation fails
                            }
                        }

                        const reviewData = {
                            name: review.reviewName,
                            rating: parseInt(review.reviewRating),
                            comment: review.reviewComment,
                            user: user._id,
                            refId: article._id,
                            refModel: 'Article',
                        };
                        try {
                            await Review.create(reviewData);
                        } catch (error) {
                            console.error(`Failed to create review for article ${article.title}:`, error.message);
                        }
                    }
                }
            }
        }

        // After all reviews are processed, update ratings for all affected articles
        for (const article of existingArticleMap.values()) {
            await updateRatings(Article, article._id);
        }

        res.status(201).send({ message: `Articles and reviews imported successfully.` });
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
        const productsToProcess = new Map();
        results.forEach(item => {
          const key = item.refId || item.name;
          if (!productsToProcess.has(key)) {
            productsToProcess.set(key, { ...item, reviews: [] });
          }
          if (item.reviewComment && item.reviewUserEmail) {
            productsToProcess.get(key).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail,
            });
          }
        });

        const refIds = [];
        const names = [];
        productsToProcess.forEach((value, key) => {
          if (value.refId) {
            refIds.push(value.refId);
          } else {
            names.push(value.name);
          }
        });

        const existingProductsByRefId = refIds.length > 0 ? await Product.find({ refId: { $in: refIds } }) : [];
        const existingProductsByName = names.length > 0 ? await Product.find({ name: { $in: names } }) : [];

        const existingProductMap = new Map();
        existingProductsByRefId.forEach(p => existingProductMap.set(p.refId.toString(), p));
        existingProductsByName.forEach(p => existingProductMap.set(p.name, p));

        const newProductsData = [];
        const updatePromises = [];

        for (const item of productsToProcess.values()) {
          const key = item.refId || item.name;
          const existingProduct = existingProductMap.get(key);

          const productData = {
            name: item.name,
            description: item.description,
            price: item.price ? parseFloat(item.price) : undefined,
            comparePrice: item.comparePrice ? parseFloat(item.comparePrice) : undefined,
            category: item.category,
            subcategory: item.subcategory,
            brand: item.brand,
            image: item.image,
            images: item.images ? item.images.split(',').map(img => img.trim()) : [],
            countInStock: item.countInStock ? parseInt(item.countInStock) : undefined,
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
            refId: item.refId,
          };

          // Filter out undefined values so they don't overwrite existing data with nulls
          Object.keys(productData).forEach(key => productData[key] === undefined && delete productData[key]);


          if (existingProduct) {
            Object.assign(existingProduct, productData);
            updatePromises.push(existingProduct.save());
          } else {
            newProductsData.push(productData);
          }
        }

        const updatedProducts = await Promise.all(updatePromises);
        updatedProducts.forEach(p => {
            const key = p.refId ? p.refId.toString() : p.name;
            existingProductMap.set(key, p);
        });

        if (newProductsData.length > 0) {
          const insertedProducts = await Product.insertMany(newProductsData);
          insertedProducts.forEach(p => {
            const key = p.refId ? p.refId.toString() : p.name;
            existingProductMap.set(key, p)
          });
        }

        // Now handle reviews
        const reviewEmails = [...new Set(results.filter(item => item.reviewComment && item.reviewUserEmail).map(item => item.reviewUserEmail))];
        const existingUsers = await User.find({ email: { $in: reviewEmails }});
        const userMap = new Map(existingUsers.map(u => [u.email, u]));

        for (const item of productsToProcess.values()) {
            if (item.reviews.length > 0) {
                const key = item.refId || item.name;
                const product = existingProductMap.get(key);
                if (product) {
                    for (const review of item.reviews) {
                        if (!review.reviewUserEmail) continue;

                        let user = userMap.get(review.reviewUserEmail);
                        if (!user) {
                            // Create a new user
                            const newUser = new User({
                                name: review.reviewName || 'Anonymous',
                                email: review.reviewUserEmail,
                                password: crypto.randomBytes(16).toString('hex'), // Generate a random password
                                isCsvImported: true,
                            });
                            try {
                                user = await newUser.save();
                                userMap.set(user.email, user); // Add to map to avoid re-creating
                            } catch (error) {
                                console.error(`Failed to create new user for email ${review.reviewUserEmail}:`, error.message);
                                continue; // Skip this review if user creation fails
                            }
                        }

                        const reviewData = {
                            name: review.reviewName,
                            rating: parseInt(review.reviewRating),
                            comment: review.reviewComment,
                            user: user._id,
                            refId: product._id,
                            refModel: 'Product',
                        };
                        try {
                            await Review.create(reviewData);
                        } catch (error) {
                            console.error(`Failed to create review for product ${product.name}:`, error.message);
                        }
                    }
                }
            }
        }

        // After all reviews are processed, update ratings for all affected products
        for (const product of existingProductMap.values()) {
            await updateRatings(Product, product._id);
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
        const activitiesToProcess = new Map();
        results.forEach(item => {
          const key = item.refId || item.name;
          if (!activitiesToProcess.has(key)) {
            activitiesToProcess.set(key, { ...item, reviews: [] });
          }
          if (item.reviewComment && item.reviewUserEmail) {
            activitiesToProcess.get(key).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail,
            });
          }
        });

        const refIds = [];
        const names = [];
        activitiesToProcess.forEach((value, key) => {
          if (value.refId) {
            refIds.push(value.refId);
          } else {
            names.push(value.name);
          }
        });

        const existingActivitiesByRefId = refIds.length > 0 ? await Activity.find({ refId: { $in: refIds } }) : [];
        const existingActivitiesByName = names.length > 0 ? await Activity.find({ name: { $in: names } }) : [];

        const existingActivityMap = new Map();
        existingActivitiesByRefId.forEach(a => existingActivityMap.set(a.refId.toString(), a));
        existingActivitiesByName.forEach(a => existingActivityMap.set(a.name, a));

        const newActivitiesData = [];
        const updatePromises = [];

        for (const item of activitiesToProcess.values()) {
          const key = item.refId || item.name;
          const existingActivity = existingActivityMap.get(key);

          const activityData = {
            name: item.name,
            description: item.description,
            shortDescription: item.shortDescription,
            price: item.price ? parseFloat(item.price) : undefined,
            marketPrice: item.marketPrice ? parseFloat(item.marketPrice) : undefined,
            currency: item.currency,
            category: item.category,
            location: item.location,
            duration: item.duration,
            maxParticipants: item.maxParticipants ? parseInt(item.maxParticipants) : undefined,
            minParticipants: item.minParticipants ? parseInt(item.minParticipants) : undefined,
            image: item.image,
            images: item.images ? item.images.split(',').map(img => img.trim()) : [],
            isActive: item.isActive ? item.isActive.toLowerCase() === 'true' : true,
            isFeatured: item.isFeatured ? item.isFeatured.toLowerCase() === 'true' : false,
            tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
            difficulty: item.difficulty,
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
            seoKeywords: item.seoKeywords ? item.seoKeywords.split(',').map(kw => kw.trim()) : [],
            refId: item.refId,
          };

          Object.keys(activityData).forEach(key => activityData[key] === undefined && delete activityData[key]);

          if (existingActivity) {
            Object.assign(existingActivity, activityData);
            updatePromises.push(existingActivity.save());
          } else {
            newActivitiesData.push(activityData);
          }
        }

        const updatedActivities = await Promise.all(updatePromises);
        updatedActivities.forEach(a => {
            const key = a.refId ? a.refId.toString() : a.name;
            existingActivityMap.set(key, a);
        });

        if (newActivitiesData.length > 0) {
          const insertedActivities = await Activity.insertMany(newActivitiesData);
          insertedActivities.forEach(a => {
            const key = a.refId ? a.refId.toString() : a.name;
            existingActivityMap.set(key, a);
          });
        }

        // Now handle reviews
        const reviewEmails = [...new Set(results.filter(item => item.reviewComment && item.reviewUserEmail).map(item => item.reviewUserEmail))];
        const existingUsers = await User.find({ email: { $in: reviewEmails }});
        const userMap = new Map(existingUsers.map(u => [u.email, u]));

        for (const item of activitiesToProcess.values()) {
            if (item.reviews.length > 0) {
                const key = item.refId || item.name;
                const activity = existingActivityMap.get(key);
                if (activity) {
                    for (const review of item.reviews) {
                        if (!review.reviewUserEmail) continue;

                        let user = userMap.get(review.reviewUserEmail);
                        if (!user) {
                            // Create a new user
                            const newUser = new User({
                                name: review.reviewName || 'Anonymous',
                                email: review.reviewUserEmail,
                                password: crypto.randomBytes(16).toString('hex'), // Generate a random password
                                isCsvImported: true,
                            });
                            try {
                                user = await newUser.save();
                                userMap.set(user.email, user); // Add to map to avoid re-creating
                            } catch (error) {
                                console.error(`Failed to create new user for email ${review.reviewUserEmail}:`, error.message);
                                continue; // Skip this review if user creation fails
                            }
                        }

                        const reviewData = {
                            name: review.reviewName,
                            rating: parseInt(review.reviewRating),
                            comment: review.reviewComment,
                            user: user._id,
                            refId: activity._id,
                            refModel: 'Activity',
                        };
                        try {
                            await Review.create(reviewData);
                        } catch (error) {
                            console.error(`Failed to create review for activity ${activity.name}:`, error.message);
                        }
                    }
                }
            }
        }

        // After all reviews are processed, update ratings for all affected activities
        for (const activity of existingActivityMap.values()) {
            await updateRatings(Activity, activity._id);
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
        const travelsToProcess = new Map();
        results.forEach(item => {
          const key = item.refId || item.title;
          if (!travelsToProcess.has(key)) {
            travelsToProcess.set(key, { ...item, reviews: [] });
          }
          if (item.reviewComment && item.reviewUserEmail) {
            travelsToProcess.get(key).reviews.push({
              reviewName: item.reviewName,
              reviewRating: item.reviewRating,
              reviewComment: item.reviewComment,
              reviewUserEmail: item.reviewUserEmail,
            });
          }
        });

        const refIds = [];
        const titles = [];
        travelsToProcess.forEach((value, key) => {
          if (value.refId) {
            refIds.push(value.refId);
          } else {
            titles.push(value.title);
          }
        });

        const existingTravelsByRefId = refIds.length > 0 ? await OrganizedTravel.find({ refId: { $in: refIds } }) : [];
        const existingTravelsByTitle = titles.length > 0 ? await OrganizedTravel.find({ title: { $in: titles } }) : [];

        const existingTravelMap = new Map();
        existingTravelsByRefId.forEach(t => existingTravelMap.set(t.refId.toString(), t));
        existingTravelsByTitle.forEach(t => existingTravelMap.set(t.title, t));

        const newTravelsData = [];
        const updatePromises = [];

        for (const item of travelsToProcess.values()) {
          const key = item.refId || item.title;
          const existingTravel = existingTravelMap.get(key);

          const travelData = {
            title: item.title,
            destination: item.destination,
            description: item.description,
            price: item.price ? parseFloat(item.price) : undefined,
            duration: item.duration,
            maxGroupSize: item.maxGroupSize ? parseInt(item.maxGroupSize) : undefined,
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
            refId: item.refId,
          };

          Object.keys(travelData).forEach(key => travelData[key] === undefined && delete travelData[key]);

          if (existingTravel) {
            Object.assign(existingTravel, travelData);
            updatePromises.push(existingTravel.save());
          } else {
            newTravelsData.push(travelData);
          }
        }

        const updatedTravels = await Promise.all(updatePromises);
        updatedTravels.forEach(t => {
            const key = t.refId ? t.refId.toString() : t.title;
            existingTravelMap.set(key, t);
        });

        if (newTravelsData.length > 0) {
          const insertedTravels = await OrganizedTravel.insertMany(newTravelsData);
          insertedTravels.forEach(t => {
            const key = t.refId ? t.refId.toString() : t.title;
            existingTravelMap.set(key, t);
          });
        }

        // Now handle reviews
        const reviewEmails = [...new Set(results.filter(item => item.reviewComment && item.reviewUserEmail).map(item => item.reviewUserEmail))];
        const existingUsers = await User.find({ email: { $in: reviewEmails }});
        const userMap = new Map(existingUsers.map(u => [u.email, u]));

        for (const item of travelsToProcess.values()) {
            if (item.reviews.length > 0) {
                const key = item.refId || item.title;
                const travel = existingTravelMap.get(key);
                if (travel) {
                    for (const review of item.reviews) {
                        if (!review.reviewUserEmail) continue;

                        let user = userMap.get(review.reviewUserEmail);
                        if (!user) {
                            // Create a new user
                            const newUser = new User({
                                name: review.reviewName || 'Anonymous',
                                email: review.reviewUserEmail,
                                password: crypto.randomBytes(16).toString('hex'), // Generate a random password
                                isCsvImported: true,
                            });
                            try {
                                user = await newUser.save();
                                userMap.set(user.email, user); // Add to map to avoid re-creating
                            } catch (error) {
                                console.error(`Failed to create new user for email ${review.reviewUserEmail}:`, error.message);
                                continue; // Skip this review if user creation fails
                            }
                        }

                        const reviewData = {
                            name: review.reviewName,
                            rating: parseInt(review.reviewRating),
                            comment: review.reviewComment,
                            user: user._id,
                            refId: travel._id,
                            refModel: 'OrganizedTravel',
                        };
                        try {
                            await Review.create(reviewData);
                        } catch (error) {
                            console.error(`Failed to create review for travel ${travel.title}:`, error.message);
                        }
                    }
                }
            }
        }

        // After all reviews are processed, update ratings for all affected travels
        for (const travel of existingTravelMap.values()) {
            await updateRatings(OrganizedTravel, travel._id);
        }

        res.status(201).send({ message: `Organized travels and reviews imported successfully.` });
      } catch (error) {
        res.status(500).send({ message: 'Error importing organized travels.', error: error.message });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
};
