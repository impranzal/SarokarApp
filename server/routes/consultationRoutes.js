const express = require('express');
const {
  createConsultation,
  listConsultations,
  getConsultation,
  updateConsultation,
  changeStatus,
  postGovernmentResponse,
  getTransparencyView,
} = require('../controllers/consultationController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', optionalAuth, listConsultations);
router.get('/:id', optionalAuth, getConsultation);
router.get('/:id/transparency', getTransparencyView);

const consultationId = param('id').isMongoId();
router.post('/', protect, authorize('officer', 'admin'), [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 10000 }),
  body('department').optional().trim().isLength({ min: 2, max: 120 }),
  body('openDate').isISO8601(),
  body('closeDate').isISO8601(),
], validate, createConsultation);
router.patch('/:id', protect, authorize('officer', 'admin'), [
  consultationId, body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 10000 }),
  body('openDate').optional().isISO8601(), body('closeDate').optional().isISO8601(),
], validate, updateConsultation);
router.patch('/:id/status', protect, authorize('officer', 'admin'), [
  consultationId, body('status').isIn(['open', 'closed', 'archived']),
], validate, changeStatus);
router.post('/:id/response', protect, authorize('officer', 'admin'), [
  consultationId, body('summaryText').trim().isLength({ min: 5, max: 10000 }),
  body('actionTaken').optional().trim().isLength({ max: 10000 }),
], validate, postGovernmentResponse);

module.exports = router;
