const express = require('express');
const {
    createCoupon,
    getCoupons,
    getCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponStats
} = require('../controllers/couponController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(adminAuth);

router.post('/', createCoupon);
router.get('/', getCoupons);
router.get('/:id', getCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.get('/:id/stats', getCouponStats);

module.exports = router;
