const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityReservation',
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    phone: {
      type: String
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['PayPal', 'Stripe', 'CreditCard', 'Cash']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Items price cannot be negative']
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Tax price cannot be negative']
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Shipping price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Total price cannot be negative']
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  isPartial: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  paymentToken: {
    type: String,
  },
  paymentTokenExpires: {
    type: Date,
  },
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentToken: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order number (using _id)
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware to calculate prices
orderSchema.pre('save', function(next) {
  // Calculate items price
  this.itemsPrice = this.orderItems.reduce((acc, item) => {
    return acc + (item.price * item.qty);
  }, 0);

  // Calculate tax (assuming 10% tax rate, can be made configurable)
  this.taxPrice = Number((this.itemsPrice * 0.1).toFixed(2));

  // Calculate shipping (free shipping for orders over $100, otherwise $10)
  this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;

  // Calculate total price
  this.totalPrice = Number((
    this.itemsPrice + 
    this.taxPrice + 
    this.shippingPrice
  ).toFixed(2));

  next();
});

// Static method to get order stats
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        paidOrders: {
          $sum: {
            $cond: [{ $eq: ['$isPaid', true] }, 1, 0]
          }
        },
        deliveredOrders: {
          $sum: {
            $cond: [{ $eq: ['$isDelivered', true] }, 1, 0]
          }
        },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    averageOrderValue: 0
  };
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get recent orders
orderSchema.statics.getRecentOrders = async function(limit = 10) {
  return await this.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('orderNumber user totalPrice status isPaid isDelivered createdAt');
};

module.exports = mongoose.model('Order', orderSchema);

