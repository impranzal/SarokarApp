const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { exportCsv, exportPdf } = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/:consultationId', protect, authorize('officer', 'admin'), getDashboard);
router.get('/:consultationId/export.csv', protect, authorize('officer', 'admin'), exportCsv);
router.get('/:consultationId/export.pdf', protect, authorize('officer', 'admin'), exportPdf);

module.exports = router;
