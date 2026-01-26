const User = require('../models/User');
const Case = require('../models/Case');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { createOrder, verifyPayment } = require('../services/paymentService');
const constants = require('../utils/constants');
const mongoose = require('mongoose');

/**
 * Unified Enrollment Controller
 * Handles all enrollment scenarios with ACID compliance
 * Supports: Razorpay, Cash, Test Mode payments
 */

// @desc    Get available payment methods for current user
// @route   GET /api/enrollment/payment-methods
// @access  Private
const getPaymentMethods = async (req, res, next) => {
    try {
        const userRole = req.user.role;

        let availableMethods = [
            {
                value: 'razorpay',
                label: 'Online Payment (Razorpay)',
                icon: '💳',
                description: 'Secure online payment via Razorpay'
            },
            {
                value: 'test_payment',
                label: 'Test Mode',
                icon: '🧪',
                description: 'Test payment for development'
            }
        ];

        // Cash payment only for Admin and Employee
        if (userRole === constants.USER_ROLES.ADMIN || userRole === constants.USER_ROLES.EMPLOYEE) {
            availableMethods.splice(1, 0, {
                value: 'cash',
                label: 'Cash Payment',
                icon: '💵',
                description: 'Record cash payment received from user'
            });
        }

        res.status(200).json({
            success: true,
            data: availableMethods
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create enrollment with payment method selection
// @route   POST /api/enrollment/create
// @access  Private (All authenticated users)
const createEnrollment = async (req, res, next) => {
    try {
        const {
            endUserId,        // Target user (can be self or someone else)
            serviceId,
            paymentMethod,    // 'razorpay', 'cash', 'test_payment'
            cashDetails,      // If payment method is cash
            couponCode,
            isTestMode
        } = req.body;

        const enrollerId = req.user.id;
        const enrollerRole = req.user.role;

        // Validation: Cash payment only for Admin/Employee
        if (paymentMethod === 'cash') {
            if (enrollerRole !== constants.USER_ROLES.ADMIN && enrollerRole !== constants.USER_ROLES.EMPLOYEE) {
                return res.status(403).json({
                    success: false,
                    error: 'Cash payment is only available for Admin and Employee roles'
                });
            }
        }

        // Determine target user
        const targetUserId = endUserId || enrollerId;

        // Validate end user exists
        const endUser = await User.findById(targetUserId);
        if (!endUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

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

        // Calculate final amount (with coupon if provided)
        let finalAmount = service.price;
        let discountInfo = null;
        let coupon = null;

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

        // Handle different payment methods
        switch (paymentMethod) {
            case 'razorpay':
                // Create Razorpay order
                const order = await createOrder(finalAmount, isTestMode || false);

                return res.status(200).json({
                    success: true,
                    requiresPaymentVerification: true,
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

            case 'test_payment':
                // Create test order
                const testOrder = await createOrder(finalAmount, true);

                return res.status(200).json({
                    success: true,
                    requiresPaymentVerification: true,
                    data: {
                        order: testOrder,
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

            case 'cash':
                // Direct enrollment with cash payment (ACID transaction)
                return await completeCashEnrollment({
                    targetUserId,
                    serviceId,
                    service,
                    enrollerId,
                    enrollerRole,
                    cashDetails,
                    finalAmount,
                    discountInfo,
                    coupon,
                    res,
                    next
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid payment method'
                });
        }
    } catch (err) {
        next(err);
    }
};

// Helper: Complete cash enrollment with ACID transaction
const completeCashEnrollment = async (params) => {
    const {
        targetUserId,
        serviceId,
        service,
        enrollerId,
        enrollerRole,
        cashDetails,
        finalAmount,
        discountInfo,
        coupon,
        res,
        next
    } = params;

    // Start MongoDB session for ACID transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Generate unique case ID using timestamp, counter, and random suffix
        const caseCount = await Case.countDocuments();
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        const caseId = `CASE-${timestamp}-${String(caseCount + 1).padStart(4, '0')}-${randomSuffix}`;

        // Create case
        const caseItem = await Case.create([{
            caseId,
            endUserId: targetUserId,
            serviceId,
            status: constants.CASE_STATUS.NEW,
            deadline: new Date(Date.now() + (service.slaHours || 24) * 60 * 60 * 1000),
            enrolledBy: enrollerId,
            enrollmentType: enrollerRole,
            enrolledAt: new Date()
        }], { session });

        // Generate unique transaction ID for cash
        const transactionId = `CASH-${timestamp}-${randomSuffix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Prepare payment data
        const paymentData = {
            caseId: caseItem[0]._id,
            amount: finalAmount,
            originalAmount: service.price,
            transactionId,
            paymentMethod: 'cash',
            status: 'completed',
            paymentDate: new Date(),
            cashPaymentDetails: {
                receivedBy: enrollerId,
                receivedAt: new Date(),
                receiptNumber: cashDetails?.receiptNumber || null,
                notes: cashDetails?.notes || 'Cash payment received'
            },
            paymentMetadata: {
                enrolledBy: enrollerId,
                enrollerRole: enrollerRole,
                paymentInitiatedFrom: enrollerRole === constants.USER_ROLES.ADMIN ? 'admin_panel' : 'employee_panel'
            }
        };

        // Add discount info if coupon was used
        if (discountInfo && coupon) {
            paymentData.couponCode = coupon.code;
            paymentData.couponId = coupon._id;
            paymentData.discountPercentage = discountInfo.discountPercentage;
            paymentData.discountAmount = discountInfo.discountAmount;
        } else {
            paymentData.discountAmount = 0;
        }

        // Create payment record
        const payment = await Payment.create([paymentData], { session });

        // Record coupon usage if applicable
        if (coupon) {
            const Coupon = require('../models/Coupon');
            await Coupon.findByIdAndUpdate(
                coupon._id,
                {
                    $push: {
                        usageHistory: {
                            userId: targetUserId,
                            caseId: caseItem[0]._id,
                            paymentId: payment[0]._id,
                            discountAmount: discountInfo.discountAmount,
                            usedAt: new Date()
                        }
                    },
                    $inc: { usageCount: 1 }
                },
                { session }
            );
        }

        // Create notifications
        await Notification.create([{
            recipientId: targetUserId,
            type: constants.NOTIFICATION_TYPES.IN_APP,
            title: 'Service Enrollment',
            message: `You have been enrolled in ${service.name}. Payment received via cash.`,
            relatedCaseId: caseItem[0]._id
        }], { session });

        // Notify admins (if enrolled by employee)
        if (enrollerRole === constants.USER_ROLES.EMPLOYEE) {
            const admins = await User.find({ role: constants.USER_ROLES.ADMIN });
            for (const admin of admins) {
                await Notification.create([{
                    recipientId: admin._id,
                    type: constants.NOTIFICATION_TYPES.IN_APP,
                    title: 'New Cash Enrollment',
                    message: `A new case (${caseId}) has been created with cash payment.`,
                    relatedCaseId: caseItem[0]._id
                }], { session });
            }
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Enrollment completed with cash payment',
            data: {
                case: caseItem[0],
                payment: payment[0],
                service: {
                    id: service._id,
                    name: service.name,
                    type: service.type,
                    price: service.price
                }
            }
        });

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();

        next(error);
    }
};

module.exports = {
    getPaymentMethods,
    createEnrollment
};
