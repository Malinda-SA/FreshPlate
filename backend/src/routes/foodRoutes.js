const express = require('express');
const {
  createFood,
  getFoods,
  getMyFoods,
  getFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');
const { authorize, requireApproval } = require('../middleware/roleGuard');

const router = express.Router();

// Public routes
router.get('/', getFoods);
router.get('/:id', getFood);

// Cook-only routes
router.post('/', protect, authorize('cook'), requireApproval, createFood);
router.get('/list/my-foods', protect, authorize('cook'), requireApproval, getMyFoods);
router.put('/:id', protect, authorize('cook'), requireApproval, updateFood);
router.delete('/:id', protect, authorize('cook'), requireApproval, deleteFood);

module.exports = router;
