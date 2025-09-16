const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Product = require('../../models/Product');
const bulkRoutes = require('../../routes/bulk');

// Mock the auth middleware
jest.mock('../../middleware/authMiddleware', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011' };
    next();
  }),
  admin: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());
app.use('/api/bulk', bulkRoutes);

describe('Bulk Controller - Products', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/testdb';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  it('should import a new product with an empty refId and generate a new one', async () => {
    const products = [
      {
        name: 'Test Product 1',
        refId: '',
        description: 'Test Description',
        price: 10,
        category: 'Test Category',
        brand: 'Test Brand',
        image: 'test.jpg',
        countInStock: 100,
      },
    ];

    const response = await request(app)
      .post('/api/bulk/products/chunk')
      .send({ products });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('products processed successfully');

    const importedProduct = await Product.findOne({ name: 'Test Product 1' });
    expect(importedProduct).not.toBeNull();
    expect(importedProduct.refId).not.toBe('');
    expect(importedProduct.refId).toBeDefined();
  });

  it('should update an existing product that has an empty refId', async () => {
    // First, create a product with an empty refId
    await Product.create({
      name: 'Existing Product',
      refId: '',
      description: 'Initial Description',
      price: 20,
      category: 'Test Category',
      brand: 'Test Brand',
      image: 'test.jpg',
      countInStock: 50,
      slug: 'existing-product'
    });

    const products = [
      {
        name: 'Existing Product',
        refId: '',
        description: 'Updated Description',
        price: 25,
        image: 'test.jpg',
        countInStock: 40,
        category: 'Test Category',
        brand: 'Test Brand',
      },
    ];

    const response = await request(app)
      .post('/api/bulk/products/chunk')
      .send({ products });

    expect(response.status).toBe(201);
    const updatedProduct = await Product.findOne({ name: 'Existing Product' });
    expect(updatedProduct).not.toBeNull();
    expect(updatedProduct.description).toBe('Updated Description');
    expect(updatedProduct.price).toBe(25);
    expect(updatedProduct.countInStock).toBe(40);
    expect(updatedProduct.refId).toBe('');
  });

  it('should import two new products with empty refIds and generate unique refIds for both', async () => {
    const products = [
      {
        name: 'Product A',
        refId: '',
        description: 'Desc A',
        price: 10,
        category: 'Cat A',
        brand: 'Brand A',
        image: 'a.jpg',
        countInStock: 10,
      },
      {
        name: 'Product B',
        refId: '',
        description: 'Desc B',
        price: 20,
        category: 'Cat B',
        brand: 'Brand B',
        image: 'b.jpg',
        countInStock: 20,
      },
    ];

    await request(app)
      .post('/api/bulk/products/chunk')
      .send({ products });

    const productA = await Product.findOne({ name: 'Product A' });
    const productB = await Product.findOne({ name: 'Product B' });

    expect(productA).not.toBeNull();
    expect(productA.refId).not.toBe('');
    expect(productB).not.toBeNull();
    expect(productB.refId).not.toBe('');
    expect(productA.refId).not.toEqual(productB.refId);
  });
});
