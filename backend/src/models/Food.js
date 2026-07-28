const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cook reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [100, 'Food name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Sri Lankan',
        'Indian',
        'Chinese',
        'Western',
        'Italian',
        'Japanese',
        'Thai',
        'Mexican',
        'Desserts',
        'Beverages',
        'Other',
      ],
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number, // in minutes
      required: [true, 'Preparation time is required'],
      min: [1, 'Preparation time must be at least 1 minute'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra-hot'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
foodSchema.index({ cook: 1, isAvailable: 1 });
foodSchema.index({ category: 1, isAvailable: 1 });
foodSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Food', foodSchema);
