const express = require('express');
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getAllOrders,
  getStats,
  deactivateUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/pending-users', getPendingUsers);
router.put('/approve/:userId', approveUser);
router.put('/reject/:userId', rejectUser);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/stats', getStats);
router.delete('/users/:userId', deactivateUser);

module.exports = router;
