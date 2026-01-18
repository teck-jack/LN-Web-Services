const express = require('express');
const { createPaymentOrder, verifyEnrollment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication (any role)
router.use(protect);

// Unified payment routes for all roles
router.post('/create-order', createPaymentOrder);
router.post('/verify-enrollment', verifyEnrollment);

module.exports = router;
