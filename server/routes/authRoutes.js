const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Stricter limiter on auth endpoints to slow down credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters.'),
], validate, register);
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Password is required.'),
], validate, login);
router.get('/me', protect, me);

module.exports = router;
