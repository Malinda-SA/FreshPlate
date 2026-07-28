const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cook is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must have at least one item'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    pickupAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },
    specialInstructions: {
      type: String,
      default: '',
      maxlength: [300, 'Special instructions cannot exceed 300 characters'],
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    actualDeliveryTime: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `FP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes for efficient querying
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ cook: 1, status: 1 });
orderSchema.index({ driver: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
