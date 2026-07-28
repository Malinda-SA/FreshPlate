const Food = require('../models/Food');

// @desc    Create a food item
// @route   POST /api/foods
// @access  Private/Cook
const createFood = async (req, res, next) => {
  try {
    req.body.cook = req.user.id;

    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available foods (for customers)
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      isVegetarian,
      isVegan,
      spiceLevel,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { isAvailable: true };

    if (category) query.category = category;
    if (isVegetarian === 'true') query.isVegetarian = true;
    if (isVegan === 'true') query.isVegan = true;
    if (spiceLevel) query.spiceLevel = spiceLevel;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Food.countDocuments(query);
    const foods = await Food.find(query)
      .populate('cook', 'name kitchenName address profileImage rating')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cook's own food items
// @route   GET /api/foods/my-foods
// @access  Private/Cook
const getMyFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ cook: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
const getFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      'cook',
      'name kitchenName address profileImage rating phone'
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Cook
const updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    // Make sure the cook owns this food item
    if (food.cook.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this food item',
      });
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Cook
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    // Make sure the cook owns this food item
    if (food.cook.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this food item',
      });
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFood,
  getFoods,
  getMyFoods,
  getFood,
  updateFood,
  deleteFood,
};
