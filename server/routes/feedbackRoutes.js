const express = require('express');
const rateLimit = require('express-rate-limit');
const { submitFeedback, listFeedback, reviewFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Deter bulk/bot submission - generous enough for a genuine citizen, tight
// enough to blunt scripted flooding of a comment window.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'Too many submissions from this account. Please try again later.' },
});

router.get('/', protect, listFeedback);
router.post('/', protect, submitLimiter, [
  body('consultationId').isMongoId(),
  body('clauseId').optional().isString().trim().isLength({ max: 50 }),
  body('stance').isIn(['support', 'oppose', 'neutral']),
  body('manualCategory').optional().isString().trim().isLength({ max: 80 }),
  body('text').isString().trim().isLength({ min: 1, max: 2000 }),
  body('evidenceLink').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }),
], validate, submitFeedback);
router.patch('/:id/review', protect, authorize('officer', 'admin'), [
  param('id').isMongoId(),
  body('isFlaggedDuplicate').isBoolean(),
], validate, reviewFeedback);

module.exports = router;
