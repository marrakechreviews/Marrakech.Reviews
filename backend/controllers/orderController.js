const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ActivityReservation = require('../models/ActivityReservation');
const { sendOrderConfirmation, sendOrderNotification, sendReservationConfirmationWithInvoice } = require('../utils/emailService');
const paypal = require('@paypal/paypal-server-sdk');
const { client } = require('../utils/paypal');

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

    const order = await Order.findById(req.params.id);

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
  const order = await Order.findById(req.params.id);

  if (order) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.totalPrice,
        },
      }],
    });

    try {
      const payPalOrder = await client().execute(request);
      res.json({ orderID: payPalOrder.result.id });
    } catch (e) {
      res.status(500).send({ message: "Something went wrong", error: e.message });
    }
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
};

const capturePayPalOrder = async (req, res) => {
  const { paypalOrderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    const order = await Order.findById(req.params.id).populate('reservation');
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: capture.result.id,
        status: capture.result.status,
        update_time: capture.result.update_time,
        email_address: capture.result.payer.email_address,
      };
      if (order.status === 'pending') {
        order.status = 'processing';
      }
      const updatedOrder = await order.save();

      if (order.reservation) {
        const reservation = await ActivityReservation.findById(order.reservation._id);
        reservation.status = 'confirmed';
        reservation.paymentStatus = 'paid';
        await reservation.save();
        await sendReservationConfirmationWithInvoice(updatedOrder, reservation);
      } else {
        await sendOrderConfirmation(updatedOrder);
      }

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  } catch (e) {
    res.status(500).send({ message: "Something went wrong", error: e.message });
  }
};

const createOrderFromReservation = async (req, res) => {
  const { reservationId } = req.body;
  const reservation = await ActivityReservation.findById(reservationId);

  if (reservation) {
    const order = new Order({
      user: req.user._id, // This assumes the user is logged in. This might need to be adjusted.
      reservation: reservation._id,
      orderItems: [{
        name: reservation.activity.name,
        qty: reservation.numberOfPersons,
        image: reservation.activity.image, // This needs to be added to the activity model
        price: reservation.totalPrice / reservation.numberOfPersons,
        product: reservation.activity._id, // Using activity as a product
      }],
      shippingAddress: { // This is a bit of a hack, as reservations don't have shipping addresses.
        fullName: reservation.customerInfo.name,
        address: 'N/A',
        city: 'N/A',
        postalCode: 'N/A',
        country: 'N/A',
      },
      paymentMethod: 'PayPal',
      itemsPrice: reservation.totalPrice,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: reservation.totalPrice,
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

module.exports = {
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

