const express = require('express');
const { listUsers, createUser, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', [query('role').optional().isIn(['citizen', 'officer', 'admin'])], validate, listUsers);
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
  body('role').isIn(['citizen', 'officer', 'admin']),
  body('department').optional({ values: 'null' }).trim().isLength({ min: 2, max: 120 }),
], validate, createUser);
router.patch('/:id/role', [
  param('id').isMongoId(),
  body('role').optional().isIn(['citizen', 'officer', 'admin']),
  body('department').optional({ values: 'null' }).trim().isLength({ min: 2, max: 120 }),
  body('isActive').optional().isBoolean(),
], validate, updateUserRole);

module.exports = router;
