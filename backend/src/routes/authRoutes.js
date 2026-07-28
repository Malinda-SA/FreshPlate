const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Register validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role')
    .optional()
    .isIn(['customer', 'cook', 'driver'])
    .withMessage('Invalid role'),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
