const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

// Submit a risk report
router.post('/report', riskController.submitRiskReport);

// Get all risk reports
router.get('/all', riskController.getAllRiskReports);

// Get risk reports by city
router.get('/city/:city', riskController.getRiskReportsByCity);

// Get risk reports by type
router.get('/type/:type', riskController.getRiskReportsByType);

// Update risk report status
router.patch('/:id/status', riskController.updateRiskStatus);

// Get risk statistics
router.get('/stats', riskController.getRiskStatistics);

// Verify a risk report (admin)
router.post('/:id/verify', riskController.verifyRiskReport);

// Get user's risk reports
router.get('/user/:userId', riskController.getUserRiskReports);

module.exports = router;