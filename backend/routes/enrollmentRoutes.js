const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getPaymentMethods,
    createEnrollment
} = require('../controllers/enrollmentController');

// @route   GET /api/enrollment/payment-methods
// @desc    Get available payment methods for current user
// @access  Private
router.get('/payment-methods', protect, getPaymentMethods);

// @route   POST /api/enrollment/create
// @desc    Create enrollment with selected payment method
// @access  Private (All authenticated users)
router.post('/create', protect, createEnrollment);

module.exports = router;
