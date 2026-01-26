const express = require('express');
const {
    createPaymentOrder,
    verifyEnrollment,
    getPaymentHistory,
    getPaymentAnalytics,
    exportPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication (any role)
router.use(protect);

// Unified payment routes for all roles
router.post('/create-order', createPaymentOrder);
router.post('/verify-enrollment', verifyEnrollment);

// Payment history routes (role-based access)
router.get('/history', getPaymentHistory);
router.get('/analytics', getPaymentAnalytics);
router.get('/export', exportPaymentHistory);

module.exports = router;
