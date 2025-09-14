const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Activity = require('../../models/Activity');
const bulkRoutes = require('../../routes/bulk');

// Mock the auth middleware
jest.mock('../../middleware/authMiddleware', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = {
      _id: '507f1f77bcf86cd799439011', // Using a hardcoded valid ObjectId string
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      isActive: true,
    };
    next();
  }),
  admin: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());
app.use('/api/bulk', bulkRoutes);

describe('Bulk Controller', () => {
  // No need for beforeAll, afterAll with jest-mongodb in-memory setup from jest.setup.js

  afterEach(async () => {
    await Activity.deleteMany({});
  });

  it('should import activities from a CSV file and generate slugs', async () => {
    const csvContent = `name,description,shortDescription,price,marketPrice,category,location,duration,maxParticipants,image
Test Import Activity,"A description for the test import","Short desc",150,180,City Tours,Test City,"3 hours",5,import-image.jpg`;

    const response = await request(app)
      .post('/api/bulk/activities')
      .attach('file', Buffer.from(csvContent), 'activities.csv');

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Activities and reviews imported successfully.');

    const importedActivity = await Activity.findOne({ name: 'Test Import Activity' });
    expect(importedActivity).not.toBeNull();
    expect(importedActivity.slug).toBe('test-import-activity');
  });
});
