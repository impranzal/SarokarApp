const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { submitContactMessage, listContactMessages } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public form, so a tighter limiter than authenticated endpoints to deter abuse.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many messages sent. Please try again later.' },
});

router.post('/', contactLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('subject').trim().isLength({ min: 3, max: 200 }).withMessage('Subject must be 3-200 characters.'),
  body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Message must be 10-3000 characters.'),
], validate, submitContactMessage);

router.get('/', protect, authorize('admin'), listContactMessages);

module.exports = router;
