const Coupon = require('../models/Coupon');
const constants = require('../utils/constants');

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
    try {
        const {
            code,
            description,
            discountPercentage,
            validFrom,
            validTo,
            maxTotalUses,
            maxUsesPerUser,
            isActive
        } = req.body;

        // Validate dates
        if (new Date(validTo) <= new Date(validFrom)) {
            return res.status(400).json({
                success: false,
                error: 'Valid to date must be after valid from date'
            });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                error: 'Coupon code already exists'
            });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            discountPercentage,
            validFrom,
            validTo,
            maxTotalUses,
            maxUsesPerUser,
            isActive,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: coupon
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};

        // Filter by status
        if (status === 'active') {
            query.isActive = true;
            query.validTo = { $gte: new Date() };
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'expired') {
            query.validTo = { $lt: new Date() };
        }

        const coupons = await Coupon.find(query)
            .populate('createdBy', 'name email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Coupon.countDocuments(query);

        res.status(200).json({
            success: true,
            count: coupons.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total
            },
            data: coupons
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single coupon
// @route   GET /api/admin/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('usageHistory.userId', 'name email')
            .populate('usageHistory.caseId', 'caseId')
            .populate('usageHistory.paymentId', 'transactionId amount');

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found'
            });
        }

        res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
    try {
        let coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found'
            });
        }

        const {
            description,
            discountPercentage,
            validFrom,
            validTo,
            maxTotalUses,
            maxUsesPerUser,
            isActive
        } = req.body;

        // Validate dates if both are provided
        if (validFrom && validTo && new Date(validTo) <= new Date(validFrom)) {
            return res.status(400).json({
                success: false,
                error: 'Valid to date must be after valid from date'
            });
        }

        // Update fields
        if (description !== undefined) coupon.description = description;
        if (discountPercentage !== undefined) coupon.discountPercentage = discountPercentage;
        if (validFrom !== undefined) coupon.validFrom = validFrom;
        if (validTo !== undefined) coupon.validTo = validTo;
        if (maxTotalUses !== undefined) coupon.maxTotalUses = maxTotalUses;
        if (maxUsesPerUser !== undefined) coupon.maxUsesPerUser = maxUsesPerUser;
        if (isActive !== undefined) coupon.isActive = isActive;

        await coupon.save();

        res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found'
            });
        }

        // Soft delete by deactivating instead of removing
        coupon.isActive = false;
        await coupon.save();

        res.status(200).json({
            success: true,
            message: 'Coupon deactivated successfully'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get coupon usage statistics
// @route   GET /api/admin/coupons/:id/stats
// @access  Private/Admin
exports.getCouponStats = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate('usageHistory.userId', 'name email')
            .populate('usageHistory.caseId', 'caseId')
            .populate('usageHistory.paymentId', 'transactionId amount');

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found'
            });
        }

        // Calculate total discount given
        const totalDiscountGiven = coupon.usageHistory.reduce(
            (sum, usage) => sum + usage.discountAmount,
            0
        );

        // Get unique users
        const uniqueUsers = [...new Set(coupon.usageHistory.map(u => u.userId._id.toString()))];

        const stats = {
            code: coupon.code,
            totalUses: coupon.currentUses,
            maxTotalUses: coupon.maxTotalUses,
            remainingUses: coupon.remainingUses,
            totalDiscountGiven,
            uniqueUsersCount: uniqueUsers.length,
            isActive: coupon.isActive,
            isExpired: coupon.isExpired,
            recentUsage: coupon.usageHistory.slice(-10).reverse() // Last 10 uses
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Validate coupon for end user
// @route   POST /api/enduser/payment/validate-coupon
// @access  Private/End User
exports.validateCoupon = async (req, res, next) => {
    try {
        const { code, serviceId } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a coupon code'
            });
        }

        // Find coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                error: 'Invalid coupon code'
            });
        }

        // Check if coupon is valid
        const validityCheck = coupon.isValid();
        if (!validityCheck.valid) {
            return res.status(400).json({
                success: false,
                error: validityCheck.reason
            });
        }

        // Check if user can use this coupon
        const userCheck = coupon.canUserUse(req.user.id);
        if (!userCheck.canUse) {
            return res.status(400).json({
                success: false,
                error: userCheck.reason
            });
        }

        // Get service to calculate discount
        const Service = require('../models/Service');
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Calculate discount
        const discountInfo = coupon.calculateDiscount(service.price);

        res.status(200).json({
            success: true,
            data: {
                coupon: {
                    code: coupon.code,
                    discountPercentage: coupon.discountPercentage,
                    description: coupon.description
                },
                discount: discountInfo
            }
        });
    } catch (err) {
        next(err);
    }
};
