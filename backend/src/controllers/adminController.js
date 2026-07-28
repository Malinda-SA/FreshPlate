const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');

// @desc    Get pending users (cooks/drivers awaiting approval)
// @route   GET /api/admin/pending-users
// @access  Private/Admin
const getPendingUsers = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({
      isApproved: false,
      role: { $in: ['cook', 'driver'] },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a cook/driver
// @route   PUT /api/admin/approve/:userId
// @access  Private/Admin
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved',
      });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.name} has been approved as a ${user.role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a cook/driver
// @route   PUT /api/admin/reject/:userId
// @access  Private/Admin
const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.name}'s registration has been rejected`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with optional role filter)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('cook', 'name email phone kitchenName')
      .populate('driver', 'name email phone')
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

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalCooks,
      totalDrivers,
      pendingApprovals,
      totalOrders,
      totalFoods,
      activeOrders,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({ role: 'cook', isActive: true, isApproved: true }),
      User.countDocuments({ role: 'driver', isActive: true, isApproved: true }),
      User.countDocuments({ isApproved: false, isActive: true }),
      Order.countDocuments(),
      Food.countDocuments(),
      Order.countDocuments({
        status: { $nin: ['delivered', 'cancelled'] },
      }),
    ]);

    // Calculate revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalCooks,
        totalDrivers,
        pendingApprovals,
        totalOrders,
        totalFoods,
        activeOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate a user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate an admin account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getAllOrders,
  getStats,
  deactivateUser,
};
