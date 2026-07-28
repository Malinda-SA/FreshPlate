const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, address, kitchenName, specialties, vehicleType, vehicleNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Prevent self-registration as admin
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be created through registration',
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      address: address || {},
    };

    // Add cook-specific fields
    if (role === 'cook') {
      userData.kitchenName = kitchenName || '';
      userData.specialties = specialties || [];
    }

    // Add driver-specific fields
    if (role === 'driver') {
      userData.vehicleType = vehicleType || '';
      userData.vehicleNumber = vehicleNumber || '';
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message:
        user.role === 'cook' || user.role === 'driver'
          ? 'Registration successful! Your account is pending admin approval.'
          : 'Registration successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          address: user.address,
          profileImage: user.profileImage,
          kitchenName: user.kitchenName,
          specialties: user.specialties,
          vehicleType: user.vehicleType,
          vehicleNumber: user.vehicleNumber,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          isActive: user.isActive,
          address: user.address,
          profileImage: user.profileImage,
          kitchenName: user.kitchenName,
          specialties: user.specialties,
          vehicleType: user.vehicleType,
          vehicleNumber: user.vehicleNumber,
          isAvailable: user.isAvailable,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          isActive: user.isActive,
          address: user.address,
          profileImage: user.profileImage,
          kitchenName: user.kitchenName,
          specialties: user.specialties,
          vehicleType: user.vehicleType,
          vehicleNumber: user.vehicleNumber,
          isAvailable: user.isAvailable,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'address',
      'profileImage',
      'kitchenName',
      'specialties',
      'vehicleType',
      'vehicleNumber',
      'isAvailable',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          isActive: user.isActive,
          address: user.address,
          profileImage: user.profileImage,
          kitchenName: user.kitchenName,
          specialties: user.specialties,
          vehicleType: user.vehicleType,
          vehicleNumber: user.vehicleNumber,
          isAvailable: user.isAvailable,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
