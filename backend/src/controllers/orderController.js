const Order = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private/Customer
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item',
      });
    }

    // Verify all food items exist and are available
    const foodIds = items.map((item) => item.food);
    const foods = await Food.find({ _id: { $in: foodIds }, isAvailable: true });

    if (foods.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'Some food items are not available',
      });
    }

    // All items must be from the same cook
    const cookId = foods[0].cook.toString();
    const allSameCook = foods.every((f) => f.cook.toString() === cookId);
    if (!allSameCook) {
      return res.status(400).json({
        success: false,
        message: 'All items in an order must be from the same cook',
      });
    }

    // Get cook's address for pickup
    const cook = await User.findById(cookId);

    // Calculate total and build order items
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const food = foods.find((f) => f._id.toString() === item.food);
      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;
      return {
        food: food._id,
        name: food.name,
        quantity: item.quantity,
        price: food.price,
      };
    });

    const deliveryFee = 150; // Fixed delivery fee (can be made dynamic later)
    totalAmount += deliveryFee;

    const order = await Order.create({
      customer: req.user.id,
      cook: cookId,
      items: orderItems,
      totalAmount,
      deliveryFee,
      deliveryAddress,
      pickupAddress: cook.address || {},
      paymentMethod: paymentMethod || 'cash',
      specialInstructions: specialInstructions || '',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('cook', 'name kitchenName phone');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (filtered by role)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    // Filter by user role
    switch (req.user.role) {
      case 'customer':
        query.customer = req.user.id;
        break;
      case 'cook':
        query.cook = req.user.id;
        break;
      case 'driver':
        query.driver = req.user.id;
        break;
      // Admin can see all orders (no filter)
    }

    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('cook', 'name kitchenName phone address')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available orders for drivers
// @route   GET /api/orders/available
// @access  Private/Driver
const getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: 'ready',
      driver: null,
    })
      .populate('customer', 'name phone address')
      .populate('cook', 'name kitchenName phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('cook', 'name kitchenName phone address')
      .populate('driver', 'name phone vehicleType vehicleNumber')
      .populate('items.food', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization (only involved parties or admin can view)
    const isAuthorized =
      req.user.role === 'admin' ||
      order.customer._id.toString() === req.user.id ||
      order.cook._id.toString() === req.user.id ||
      (order.driver && order.driver._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Cook/Driver/Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Define valid status transitions per role
    const validTransitions = {
      cook: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing'],
        preparing: ['ready'],
      },
      driver: {
        ready: ['picked_up'],
        picked_up: ['delivered'],
      },
      admin: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['picked_up', 'cancelled'],
        picked_up: ['delivered', 'cancelled'],
      },
    };

    const userTransitions = validTransitions[req.user.role];
    if (!userTransitions) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update order status',
      });
    }

    const allowedStatuses = userTransitions[order.status] || [];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${order.status}' to '${status}'`,
      });
    }

    order.status = status;

    // Set actual delivery time when delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      order.paymentStatus = 'paid';
    }

    // Set cancel reason if cancelling
    if (status === 'cancelled' && req.body.cancelReason) {
      order.cancelReason = req.body.cancelReason;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('cook', 'name kitchenName phone')
      .populate('driver', 'name phone');

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign driver to order / Driver accepts order
// @route   PUT /api/orders/:id/assign-driver
// @access  Private (Driver/Admin)
const assignDriver = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.driver) {
      return res.status(400).json({
        success: false,
        message: 'A driver is already assigned to this order',
      });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order is not ready for pickup',
      });
    }

    // Driver assigns themselves, or admin assigns a specific driver
    const driverId =
      req.user.role === 'admin' ? req.body.driverId : req.user.id;

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'Invalid driver',
      });
    }

    order.driver = driverId;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('cook', 'name kitchenName phone address')
      .populate('driver', 'name phone vehicleType vehicleNumber');

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getAvailableOrders,
  getOrder,
  updateOrderStatus,
  assignDriver,
};
