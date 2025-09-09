const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env' });

// Import models
const Article = require('../models/Article');
const Activity = require('../models/Activity');
const OrganizedTravel = require('../models/OrganizedTravel');
const Product = require('../models/Product');

const models = [
  { name: 'Article', model: Article },
  { name: 'Activity', model: Activity },
  { name: 'OrganizedTravel', model: OrganizedTravel },
  { name: 'Product', model: Product },
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const addRefIds = async () => {
  await connectDB();

  for (const { name, model } of models) {
    console.log(`Processing ${name}s...`);
    const documents = await model.find({ refId: { $exists: false } });
    let updatedCount = 0;

    for (const doc of documents) {
      doc.refId = crypto.randomBytes(8).toString('hex');
      await doc.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} ${name}(s) with a new refId.`);
  }

  mongoose.connection.close();
  console.log('Database connection closed.');
};

// Run the script
addRefIds();
