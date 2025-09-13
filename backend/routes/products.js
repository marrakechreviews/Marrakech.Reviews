const express = require('express');
const { body, query } = require('express-validator');
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getTopProducts,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  exportProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/export', protect, admin, exportProducts);

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['name', '-name', 'price', '-price', 'rating', '-rating', 'createdAt', '-createdAt']).withMessage('Invalid sort field'),
  query('category').optional().trim(),
  query('brand').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
  query('inStock').optional().isBoolean().withMessage('In stock must be a boolean')
], getProducts);

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], searchProducts);

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
router.get('/top', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], getTopProducts);

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], getFeaturedProducts);

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['name', '-name', 'price', '-price', 'rating', '-rating']).withMessage('Invalid sort field')
], getProductsByCategory);

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
router.get('/slug/:slug', getProductBySlug);

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', getProduct);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('image')
    .notEmpty()
    .withMessage('Product image is required'),
  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer')
], createProduct);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand cannot be empty'),
  body('countInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer')
], updateProduct);

// @desc    Delete multiple products
// @route   DELETE /api/products/bulk
// @access  Private/Admin
router.delete('/bulk', protect, admin, bulkDeleteProducts);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', deleteProduct);

module.exports = router;

