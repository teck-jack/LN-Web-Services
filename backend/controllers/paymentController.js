const User = require('../models/User');
const Case = require('../models/Case');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { createOrder, verifyPayment } = require('../services/paymentService');
const constants = require('../utils/constants');

/**
 * Unified Payment Controller
 * Used by all roles (Agent, Associate, Employee, Admin) for enrollment payments
 */

// @desc    Create payment order for enrollment
// @route   POST /api/payment/create-order
// @access  Private (All authenticated users)
exports.createPaymentOrder = async (req, res, next) => {
    try {
        const { serviceId, endUserId, isTestMode, couponCode } = req.body;
        const enrollerId = req.user.id;
        const enrollerRole = req.user.role;

        // Validate service
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        if (!service.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Service is not active'
            });
        }

        // Validate end user if provided (for agent/employee enrolling someone else)
        let targetUserId = enrollerId;
        if (endUserId) {
            const endUser = await User.findById(endUserId);
            if (!endUser) {
                return res.status(404).json({
                    success: false,
                    error: 'End user not found'
                });
            }
            targetUserId = endUserId;
        }

        let finalAmount = service.price;
        let discountInfo = null;
        let coupon = null;

        // If coupon code is provided, validate and apply discount
        if (couponCode) {
            const Coupon = require('../models/Coupon');
            coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

            if (coupon) {
                const validityCheck = coupon.isValid();
                if (validityCheck.valid) {
                    const userCheck = coupon.canUserUse(targetUserId);
                    if (userCheck.canUse) {
                        discountInfo = coupon.calculateDiscount(service.price);
                        finalAmount = discountInfo.finalAmount;
                    }
                }
            }
        }

        // Create order
        const order = await createOrder(finalAmount, isTestMode);

        res.status(200).json({
            success: true,
            data: {
                order,
                service,
                discount: discountInfo,
                coupon: coupon ? {
                    code: coupon.code,
                    discountPercentage: coupon.discountPercentage,
                    id: coupon._id
                } : null,
                endUserId: targetUserId,
                enrollerId,
                enrollerRole
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify payment and create case for enrollment
// @route   POST /api/payment/verify-enrollment
// @access  Private (All authenticated users)
exports.verifyEnrollment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            serviceId,
            endUserId,
            enrollmentType,
            couponCode,
            couponId,
            discountInfo,
            isTestMode
        } = req.body;

        const enrollerId = req.user.id;

        // Validate service
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Determine target user (self or someone else)
        const targetUserId = endUserId || enrollerId;

        // Validate end user exists
        const endUser = await User.findById(targetUserId);
        if (!endUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify payment
        const isValid = await verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }, isTestMode);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment'
            });
        }

        // Determine enrollment type based on enroller role
        let enrollType = enrollmentType || constants.ENROLLMENT_TYPES.SELF;
        const enrollerRole = req.user.role;

        if (enrollerRole === constants.USER_ROLES.AGENT) {
            enrollType = constants.ENROLLMENT_TYPES.AGENT;
        } else if (enrollerRole === constants.USER_ROLES.ASSOCIATE) {
            enrollType = constants.ENROLLMENT_TYPES.ASSOCIATE;
        } else if (enrollerRole === constants.USER_ROLES.EMPLOYEE) {
            enrollType = constants.ENROLLMENT_TYPES.EMPLOYEE;
        } else if (enrollerRole === constants.USER_ROLES.ADMIN) {
            enrollType = constants.ENROLLMENT_TYPES.ADMIN;
        }

        // Determine payment method
        let paymentMethod = 'razorpay';
        if (isTestMode) {
            paymentMethod = 'test_payment';
        }

        // Generate unique case ID using timestamp and counter
        const caseCount = await Case.countDocuments();
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        const caseId = `CASE-${timestamp}-${String(caseCount + 1).padStart(4, '0')}-${randomSuffix}`;

        // Create case with audit trail
        const caseItem = await Case.create({
            caseId,
            endUserId: targetUserId,
            serviceId,
            status: constants.CASE_STATUS.NEW,
            deadline: new Date(Date.now() + (service.slaHours || 24) * 60 * 60 * 1000),
            // Audit trail
            enrolledBy: enrollerId,
            enrollmentType: enrollType,
            enrolledAt: new Date()
        });

        // Prepare payment data
        const paymentData = {
            caseId: caseItem._id,
            transactionId: razorpay_payment_id,
            paymentMethod,
            status: 'completed',
            paymentDate: new Date()
        };

        // If coupon was used, add discount information
        if (couponCode && discountInfo) {
            paymentData.couponCode = couponCode;
            paymentData.couponId = couponId;
            paymentData.originalAmount = discountInfo.originalAmount;
            paymentData.discountPercentage = discountInfo.discountPercentage;
            paymentData.discountAmount = discountInfo.discountAmount;
            paymentData.amount = discountInfo.finalAmount;

            // Record coupon usage
            if (couponId) {
                const Coupon = require('../models/Coupon');
                const coupon = await Coupon.findById(couponId);
                if (coupon) {
                    await coupon.recordUsage(targetUserId, caseItem._id, null, discountInfo.discountAmount);
                }
            }
        } else {
            paymentData.amount = service.price;
            paymentData.originalAmount = service.price;
            paymentData.discountAmount = 0;
        }

        // Add payment metadata for audit trail
        paymentData.paymentMetadata = {
            enrolledBy: enrollerId,
            enrollerRole: req.user.role,
            paymentInitiatedFrom: req.user.role === 'end_user' ? 'end_user_portal' :
                req.user.role === 'employee' ? 'employee_panel' :
                    req.user.role === 'admin' ? 'admin_panel' :
                        req.user.role === 'agent' ? 'agent_portal' : 'unknown'
        };

        // Create payment record
        const payment = await Payment.create(paymentData);

        // Update coupon with payment ID if coupon was used
        if (couponId && payment) {
            const Coupon = require('../models/Coupon');
            const coupon = await Coupon.findById(couponId);
            if (coupon && coupon.usageHistory.length > 0) {
                const lastUsage = coupon.usageHistory[coupon.usageHistory.length - 1];
                lastUsage.paymentId = payment._id;
                await coupon.save();
            }
        }

        // Create notification for admin
        const admins = await User.find({ role: constants.USER_ROLES.ADMIN });
        for (const admin of admins) {
            await Notification.create({
                recipientId: admin._id,
                type: constants.NOTIFICATION_TYPES.IN_APP,
                title: 'New Case Created',
                message: `A new case (${caseItem.caseId}) has been created for service ${service.name}.`,
                relatedCaseId: caseItem._id
            });
        }

        // Create notification for end user
        await Notification.create({
            recipientId: targetUserId,
            type: constants.NOTIFICATION_TYPES.IN_APP,
            title: 'Service Enrollment',
            message: `You have been enrolled in ${service.name}. Our team will start processing your case shortly.`,
            relatedCaseId: caseItem._id
        });

        // Return response
        res.status(201).json({
            success: true,
            data: {
                case: caseItem,
                payment,
                service: {
                    id: service._id,
                    name: service.name,
                    type: service.type,
                    price: service.price
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
