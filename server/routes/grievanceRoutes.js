const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param } = require('express-validator');
const { submitGrievance, listGrievances, respondToGrievance } = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { CATEGORIES, STATUSES } = require('../models/Grievance');

const router = express.Router();

// Generous enough for a genuine citizen filing a real complaint, tight
// enough to blunt scripted flooding of the grievance queue.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { message: 'Too many grievances submitted from this account. Please try again later.' },
});

router.use(protect);

router.get('/', listGrievances);

router.post('/', submitLimiter, [
  body('subject').trim().isLength({ min: 3, max: 200 }).withMessage('Subject must be 3-200 characters.'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category.'),
  body('description').trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10-3000 characters.'),
  body('relatedConsultation').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid consultation reference.'),
], validate, submitGrievance);

router.patch('/:id/respond', authorize('officer', 'admin'), [
  param('id').isMongoId(),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status.'),
  body('responseText').optional().trim().isLength({ min: 1, max: 3000 }).withMessage('Response must be 1-3000 characters.'),
], validate, respondToGrievance);

module.exports = router;
