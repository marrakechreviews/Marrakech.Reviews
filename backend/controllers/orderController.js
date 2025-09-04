const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ActivityReservation = require('../models/ActivityReservation');
const TravelReservation = require('../models/TravelReservation');
const crypto = require('crypto');
const { sendOrderConfirmation, sendOrderNotification, sendReservationConfirmationWithInvoice, sendOrderStatusUpdate, sendPaymentReminder } = require('../utils/emailService');
const { getPayPalAccessToken, capturePayPalOrder: capturePayPalOrderUtil } = require('../utils/paypal');
const axios = require('axios');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Verify products exist and get current prices
    const productIds = orderItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== orderItems.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found'
      });
    }

    // Check stock availability and update order items with current data
    const updatedOrderItems = [];
    for (const item of orderItems) {
      const product = products.find(p => p._id.toString() === item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      if (product.countInStock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}`
        });
      }

      updatedOrderItems.push({
        name: product.name,
        qty: item.qty,
        image: product.image,
        price: product.price, // Use current price from database
        product: product._id
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentMethod
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of updatedOrderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -item.qty } }
      );
    }

    // Populate user information
    await createdOrder.populate('user', 'name email');

    // Send email notifications
    try {
      // Send confirmation email to customer
      const confirmationResult = await sendOrderConfirmation(createdOrder);
      if (confirmationResult.success) {
        console.log('Order confirmation email sent successfully');
      }

      // Send notification email to admin
      await sendOrderNotification(createdOrder);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    // Update order status to processing if it was pending
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order marked as paid',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order to paid error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating order'
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order must be paid before marking as delivered'
      });
    }

    if (order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: 'Order is already delivered'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order marked as delivered',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order to delivered error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating order'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.isPaid !== undefined) {
      filter.isPaid = req.query.isPaid === 'true';
    }
    if (req.query.isDelivered !== undefined) {
      filter.isDelivered = req.query.isDelivered === 'true';
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order fields
    order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (notes !== undefined) order.notes = notes;

    // Auto-update delivery status based on status
    if (status === 'delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status !== 'delivered' && order.isDelivered) {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    const updatedOrder = await order.save();

    // Send email notification
    try {
      await sendOrderStatusUpdate(updatedOrder);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    const statusStats = await Order.getOrdersByStatus();
    const recentOrders = await Order.getRecentOrders(5);

    res.json({
      success: true,
      data: {
        overview: stats,
        byStatus: statusStats,
        recent: recentOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

const createPayPalOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const accessToken = await getPayPalAccessToken();
    const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.totalPrice.toFixed(2),
        },
        payee: {
          email_address: process.env.PAYPAL_RECEIVER_EMAIL,
        },
      }],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    res.json({ orderID: response.data.id });

  } catch (error) {
    console.error('Error creating PayPal order:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Server error while creating PayPal order' });
  }
};

const capturePayPalOrder = async (req, res) => {
  try {
    const { paypalOrderID } = req.body;
    const result = await capturePayPalOrderUtil(paypalOrderID);

    if (!result.success || !result.capture) {
      return res.status(500).json({ message: result.error || 'Failed to capture PayPal payment.' });
    }

    const captureData = result.capture;
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'PayPal payment not completed.' });
    }

    const order = await Order.findById(req.params.id).populate('reservation');
    if (!order) {
      return res.status(404).json({ message: 'Order Not Found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      update_time: captureData.update_time,
      email_address: captureData.payer.email_address,
      pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    };

    if (order.status === 'pending') {
      order.status = 'processing';
    }

    const updatedOrder = await order.save();

    if (order.reservation) {
      const reservation = await ActivityReservation.findById(order.reservation._id);
      if(reservation) {
        reservation.status = 'confirmed';
        reservation.paymentStatus = 'paid';
        await reservation.save();
        await sendReservationConfirmationWithInvoice(updatedOrder, reservation);
      }
    } else {
      await updatedOrder.populate('user', 'name email');
      await sendOrderConfirmation(updatedOrder);
    }

    res.json({ message: 'Order Paid', order: updatedOrder });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ message: 'Server error while capturing PayPal order' });
  }
};

const createOrderFromReservation = async (req, res) => {
  const { reservationId, isPartial } = req.body;
  const reservation = await ActivityReservation.findById(reservationId).populate('activity');

  if (reservation) {
    let orderItems;
    let price;

    if (isPartial) {
      price = 10;
      orderItems = [{
        name: `${reservation.activity.name} (Partial Payment)`,
        qty: 1,
        image: reservation.activity.image,
        price: price,
        product: reservation.activity._id,
      }];
    } else {
      price = reservation.totalPrice;
      orderItems = [{
        name: reservation.activity.name,
        qty: reservation.numberOfPersons,
        image: reservation.activity.image,
        price: reservation.totalPrice / reservation.numberOfPersons,
        product: reservation.activity._id,
      }];
    }

    const order = new Order({
      user: req.user._id,
      reservation: reservation._id,
      orderItems: orderItems,
      shippingAddress: {
        fullName: reservation.customerInfo.name,
        address: 'N/A',
        city: 'N/A',
        postalCode: 'N/A',
        country: 'N/A',
      },
      paymentMethod: 'PayPal',
      itemsPrice: price,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: price,
      isPartial: !!isPartial,
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, data: createdOrder });
  } else {
    res.status(404).send({ message: 'Reservation Not Found' });
  }
};

const PDFDocument = require('pdfkit');

const generateInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Order details
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        // Customer details
        doc.text('Bill to:');
        doc.text(order.user.name);
        doc.text(order.user.email);
        doc.moveDown();

        // Table header
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 250, tableTop, { width: 100, align: 'right' });
        doc.text('Price', 350, tableTop, { width: 100, align: 'right' });
        doc.text('Total', 450, tableTop, { width: 100, align: 'right' });
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table rows
        let y = tableTop + 25;
        order.orderItems.forEach(item => {
            doc.text(item.name, 50, y);
            doc.text(item.qty, 250, y, { width: 100, align: 'right' });
            doc.text(`$${item.price.toFixed(2)}`, 350, y, { width: 100, align: 'right' });
            doc.text(`$${(item.qty * item.price).toFixed(2)}`, 450, y, { width: 100, align: 'right' });
            y += 20;
        });
        doc.moveTo(50, y).lineTo(550, y).stroke();
        doc.moveDown();

        // Total
        doc.fontSize(12).text(`Total: $${order.totalPrice.toFixed(2)}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({ success: false, message: 'Server error while generating invoice' });
    }
};

const sendPaymentReminderEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    // Generate token
    const paymentToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set expiration
    order.paymentToken = crypto
      .createHash('sha256')
      .update(paymentToken)
      .digest('hex');

    order.paymentTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await order.save();

    const paymentLink = `${process.env.WEBSITE_URL}/payment/order/token/${paymentToken}`;

    await sendPaymentReminder(order, paymentLink);

    res.json({ success: true, message: 'Payment reminder sent successfully' });
  } catch (error) {
    console.error('Send payment reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending payment reminder' });
  }
};

const getOrderByPaymentToken = async (req, res) => {
  try {
    const paymentToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const order = await Order.findOne({
      paymentToken,
      paymentTokenExpires: { $gt: Date.now() },
    });

    if (!order) {
      return res.status(400).json({ success: false, message: 'Payment token is invalid or has expired.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order by payment token error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching order' });
  }
};

const createPayPalOrderByToken = async (req, res) => {
  try {
    const paymentToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const order = await Order.findOne({
      paymentToken,
      paymentTokenExpires: { $gt: Date.now() },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order Not Found or payment token invalid/expired' });
    }

    const accessToken = await getPayPalAccessToken();
    const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.totalPrice.toFixed(2),
        },
        payee: {
          email_address: process.env.PAYPAL_RECEIVER_EMAIL,
        },
      }],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    res.json({ orderID: response.data.id });
  } catch (error) {
    console.error('Error creating PayPal order by token:', error);
    res.status(500).json({ message: 'Server error while creating PayPal order' });
  }
};

const capturePayPalOrderByToken = async (req, res) => {
  try {
    const { paypalOrderID } = req.body;
    const paymentToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const order = await Order.findOne({
      paymentToken,
      paymentTokenExpires: { $gt: Date.now() },
    }).populate('reservation');

    if (!order) {
      return res.status(404).json({ message: 'Order Not Found or payment token invalid/expired' });
    }

    const result = await capturePayPalOrderUtil(paypalOrderID);
    if (!result.success || !result.capture) {
      return res.status(500).json({ message: result.error || 'Failed to capture PayPal payment.' });
    }

    const captureData = result.capture;
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'PayPal payment not completed.' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      update_time: captureData.update_time,
      email_address: captureData.payer.email_address,
      pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    };
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    order.paymentToken = undefined;
    order.paymentTokenExpires = undefined;

    const updatedOrder = await order.save();

    if (order.reservation) {
      const reservation = await ActivityReservation.findById(order.reservation._id);
      if(reservation){
        reservation.status = 'confirmed';
        reservation.paymentStatus = 'paid';
        await reservation.save();
        await sendReservationConfirmationWithInvoice(updatedOrder, reservation);
      }
    } else {
      await sendOrderConfirmation(updatedOrder);
    }

    res.json({ message: 'Order Paid', order: updatedOrder });

  } catch (error) {
    console.error('Error capturing PayPal order by token:', error);
    res.status(500).json({ message: 'Server error while capturing PayPal order' });
  }
};


const createOrderFromTravelReservation = async (req, res) => {
  const { travelReservationId, isPartial } = req.body;
  const reservation = await TravelReservation.findById(travelReservationId).populate('programId');

  if (reservation) {
    let orderItems;
    let price;

    if (isPartial) {
      price = 15;
      orderItems = [{
        name: `${reservation.programId.title} (Partial Payment)`,
        qty: 1,
        image: reservation.programId.heroImage,
        price: price,
        product: reservation.programId._id,
      }];
    } else {
      price = reservation.totalPrice;
      orderItems = [{
        name: reservation.programId.title,
        qty: reservation.numberOfTravelers,
        image: reservation.programId.heroImage,
        price: reservation.totalPrice / reservation.numberOfTravelers,
        product: reservation.programId._id,
      }];
    }

    const order = new Order({
      user: req.user._id,
      travelReservation: reservation._id,
      orderItems: orderItems,
      shippingAddress: {
        fullName: `${reservation.firstName} ${reservation.lastName}`,
        address: 'N/A',
        city: 'N/A',
        postalCode: 'N/A',
        country: 'N/A',
      },
      paymentMethod: 'PayPal',
      itemsPrice: price,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: price,
      isPartial: !!isPartial,
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, data: createdOrder });
  } else {
    res.status(404).send({ message: 'Travel Reservation Not Found' });
  }
};

module.exports = {
  createOrderFromTravelReservation,
  createPayPalOrderByToken,
  capturePayPalOrderByToken,
  getOrderByPaymentToken,
  sendPaymentReminderEmail,
  createOrderFromReservation,
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
  generateInvoice,
};

