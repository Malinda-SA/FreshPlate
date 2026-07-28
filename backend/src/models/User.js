const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'cook', 'driver', 'admin'],
      default: 'customer',
    },
    isApproved: {
      type: Boolean,
      default: true, // Overridden to false for cook/driver in pre-save
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    profileImage: {
      type: String,
      default: '',
    },
    // Cook-specific fields
    kitchenName: {
      type: String,
      default: '',
    },
    specialties: {
      type: [String],
      default: [],
    },
    // Driver-specific fields
    vehicleType: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: false, // Driver availability toggle
    },
  },
  {
    timestamps: true,
  }
);

// Set isApproved to false for cooks and drivers before saving
userSchema.pre('save', async function (next) {
  // Set approval status based on role (only on new documents)
  if (this.isNew) {
    if (this.role === 'cook' || this.role === 'driver') {
      this.isApproved = false;
    }
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
