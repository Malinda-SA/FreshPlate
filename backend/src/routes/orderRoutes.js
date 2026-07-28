const express = require('express');
const {
  createOrder,
  getOrders,
  getAvailableOrders,
  getOrder,
  updateOrderStatus,
  assignDriver,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize, requireApproval } = require('../middleware/roleGuard');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.post('/', authorize('customer'), createOrder);
router.get('/', requireApproval, getOrders);
router.get('/available', authorize('driver'), requireApproval, getAvailableOrders);
router.get('/:id', requireApproval, getOrder);
router.put('/:id/status', authorize('cook', 'driver', 'admin'), requireApproval, updateOrderStatus);
router.put('/:id/assign-driver', authorize('driver', 'admin'), requireApproval, assignDriver);

module.exports = router;
