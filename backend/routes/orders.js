const express = require('express');
const { body, query } = require('express-validator');
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderStats,
  createPayPalOrder,
  capturePayPalOrder,
  createOrderFromReservation,
  sendPaymentReminderEmail,
  getOrderByPaymentToken,
  createPayPalOrderByToken,
  capturePayPalOrderByToken
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get PayPal Client ID
// @route   GET /api/orders/config/paypal
// @access  Public
router.get('/config/paypal', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' });
});

// @desc    Create order from reservation
// @route   POST /api/orders/from-reservation
// @access  Private
router.post('/from-reservation', protect, createOrderFromReservation);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('orderItems.*.name')
    .notEmpty()
    .withMessage('Item name is required'),
  body('orderItems.*.qty')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1'),
  body('orderItems.*.price')
    .isFloat({ min: 0 })
    .withMessage('Item price must be non-negative'),
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentMethod')
    .isIn(['PayPal', 'Stripe', 'CreditCard', 'Cash'])
    .withMessage('Invalid payment method')
], createOrder);

// @desc    Get order stats (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
router.get('/stats', getOrderStats);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], getMyOrders);

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('isPaid').optional().isBoolean().withMessage('isPaid must be a boolean'),
  query('isDelivered').optional().isBoolean().withMessage('isDelivered must be a boolean')
], getOrders);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', getOrderById);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', [
  body('id').notEmpty().withMessage('Payment ID is required'),
  body('status').notEmpty().withMessage('Payment status is required'),
  body('update_time').notEmpty().withMessage('Update time is required'),
  body('email_address').optional().isEmail().withMessage('Valid email is required')
], updateOrderToPaid);

// @desc    Create PayPal order
// @route   POST /api/orders/:id/create-paypal-order
// @access  Private
router.post('/:id/create-paypal-order', protect, createPayPalOrder);

// @desc    Capture PayPal order
// @route   PUT /api/orders/:id/capture-paypal-order
// @access  Private
router.put('/:id/capture-paypal-order', protect, capturePayPalOrder);

const { generateInvoice } = require('../controllers/orderController');

// @desc    Get order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
router.get('/:id/invoice', protect, generateInvoice);

// @desc    Update order to delivered (Admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', updateOrderToDelivered);

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('trackingNumber').optional().trim(),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateOrderStatus);

// @desc    Send payment reminder (Admin only)
// @route   POST /api/orders/:id/remind
// @access  Private/Admin
router.post('/:id/remind', protect, admin, sendPaymentReminderEmail);

// @desc    Get order by payment token
// @route   GET /api/orders/payment/:token
// @access  Public
router.get('/payment/:token', getOrderByPaymentToken);

// @desc    Create PayPal order by token
// @route   POST /api/orders/payment/:token/create-paypal-order
// @access  Public
router.post('/payment/:token/create-paypal-order', createPayPalOrderByToken);

// @desc    Capture PayPal order by token
// @route   PUT /api/orders/payment/:token/capture-paypal-order
// @access  Public
router.put('/payment/:token/capture-paypal-order', capturePayPalOrderByToken);

module.exports = router;

