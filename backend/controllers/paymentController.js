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

// @desc    Get payment history for current user (role-based)
// @route   GET /api/payment/history
// @access  Private (All authenticated users)
exports.getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            paymentMethod,
            searchQuery,
            serviceType
        } = req.query;

        // Build base query based on role
        let query = {};

        switch (userRole) {
            case constants.USER_ROLES.ADMIN:
                // Admin can see all payments - no filter needed
                break;

            case constants.USER_ROLES.EMPLOYEE:
                // Employee sees payments for cases they enrolled
                query['paymentMetadata.enrolledBy'] = userId;
                query['paymentMetadata.enrollerRole'] = constants.USER_ROLES.EMPLOYEE;
                break;

            case constants.USER_ROLES.AGENT:
                // Agent sees payments from their onboarded users
                // First, find all users onboarded by this agent
                const agentUsers = await User.find({ agentId: userId }).select('_id');
                const agentUserIds = agentUsers.map(u => u._id);

                // Find all cases for these users
                const agentCases = await Case.find({ endUserId: { $in: agentUserIds } }).select('_id');
                const agentCaseIds = agentCases.map(c => c._id);

                query.caseId = { $in: agentCaseIds };
                break;

            case constants.USER_ROLES.ASSOCIATE:
                // Associate sees payments for cases they enrolled
                query['paymentMetadata.enrolledBy'] = userId;
                query['paymentMetadata.enrollerRole'] = constants.USER_ROLES.ASSOCIATE;
                break;

            case constants.USER_ROLES.END_USER:
                // End user sees only their own payments
                const endUserCases = await Case.find({ endUserId: userId }).select('_id');
                const endUserCaseIds = endUserCases.map(c => c._id);
                query.caseId = { $in: endUserCaseIds };
                break;

            default:
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized access'
                });
        }

        // Apply additional filters
        if (status) {
            query.status = status;
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            query.paymentDate = {};
            if (startDate) {
                query.paymentDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.paymentDate.$lte = new Date(endDate);
            }
        }

        // Search query (transaction ID, case ID, or service name)
        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, 'i');

            // Find matching cases by caseId
            const matchingCases = await Case.find({
                caseId: searchRegex
            }).select('_id');

            const matchingCaseIds = matchingCases.map(c => c._id);

            query.$or = [
                { transactionId: searchRegex },
                { invoiceNumber: searchRegex },
                { caseId: { $in: matchingCaseIds } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Payment.countDocuments(query);

        // Fetch payments with populated fields
        let payments = await Payment.find(query)
            .populate({
                path: 'caseId',
                select: 'caseId endUserId serviceId enrolledBy enrollmentType',
                populate: [
                    {
                        path: 'endUserId',
                        select: 'name email phone'
                    },
                    {
                        path: 'serviceId',
                        select: 'name type price description duration'
                    },
                    {
                        path: 'enrolledBy',
                        select: 'name email role'
                    }
                ]
            })
            .populate({
                path: 'paymentMetadata.enrolledBy',
                select: 'name email role'
            })
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Filter by service type if provided
        if (serviceType) {
            payments = payments.filter(payment =>
                payment.caseId?.serviceId?.type === serviceType
            );
        }

        res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get payment analytics/statistics
// @route   GET /api/payment/analytics
// @access  Private (All authenticated users)
exports.getPaymentAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Build base query based on role (same logic as getPaymentHistory)
        let query = {};

        switch (userRole) {
            case constants.USER_ROLES.ADMIN:
                // Admin can see all payments
                break;

            case constants.USER_ROLES.EMPLOYEE:
                query['paymentMetadata.enrolledBy'] = userId;
                query['paymentMetadata.enrollerRole'] = constants.USER_ROLES.EMPLOYEE;
                break;

            case constants.USER_ROLES.AGENT:
                const agentUsers = await User.find({ agentId: userId }).select('_id');
                const agentUserIds = agentUsers.map(u => u._id);
                const agentCases = await Case.find({ endUserId: { $in: agentUserIds } }).select('_id');
                const agentCaseIds = agentCases.map(c => c._id);
                query.caseId = { $in: agentCaseIds };
                break;

            case constants.USER_ROLES.ASSOCIATE:
                query['paymentMetadata.enrolledBy'] = userId;
                query['paymentMetadata.enrollerRole'] = constants.USER_ROLES.ASSOCIATE;
                break;

            case constants.USER_ROLES.END_USER:
                const endUserCases = await Case.find({ endUserId: userId }).select('_id');
                const endUserCaseIds = endUserCases.map(c => c._id);
                query.caseId = { $in: endUserCaseIds };
                break;

            default:
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized access'
                });
        }

        // Aggregate statistics
        const totalPayments = await Payment.countDocuments(query);

        const completedQuery = { ...query, status: 'completed' };
        const completedPayments = await Payment.find(completedQuery);
        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalDiscount = completedPayments.reduce((sum, p) => sum + (p.discountAmount || 0), 0);

        const statusBreakdown = await Payment.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const methodBreakdown = await Payment.aggregate([
            { $match: query },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);

        // Role-specific analytics
        let roleSpecificData = {};

        if (userRole === constants.USER_ROLES.AGENT) {
            // Calculate commission (assuming 10% commission rate from User model)
            const agent = await User.findById(userId).select('commissionRate totalCommissionEarned');
            const commissionRate = agent.commissionRate || 10;
            const estimatedCommission = (totalRevenue * commissionRate) / 100;

            roleSpecificData = {
                commissionRate,
                estimatedCommission,
                totalCommissionEarned: agent.totalCommissionEarned || 0,
                onboardedUsersCount: (await User.countDocuments({ agentId: userId }))
            };
        }

        if (userRole === constants.USER_ROLES.EMPLOYEE || userRole === constants.USER_ROLES.ASSOCIATE) {
            // Count unique end users enrolled
            const payments = await Payment.find(query).populate('caseId');
            const uniqueEndUsers = new Set(payments.map(p => p.caseId?.endUserId?.toString()).filter(Boolean));

            roleSpecificData = {
                enrolledUsersCount: uniqueEndUsers.size,
                averageRevenuePerUser: uniqueEndUsers.size > 0 ? totalRevenue / uniqueEndUsers.size : 0
            };
        }

        res.status(200).json({
            success: true,
            data: {
                totalPayments,
                totalRevenue,
                totalDiscount,
                averageTransaction: totalPayments > 0 ? totalRevenue / totalPayments : 0,
                statusBreakdown: statusBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                methodBreakdown: methodBreakdown.map(item => ({
                    method: item._id,
                    count: item.count,
                    total: item.total
                })),
                ...roleSpecificData
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Export payment history as CSV
// @route   GET /api/payment/export
// @access  Private (All authenticated users)
exports.exportPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Build base query based on role (same logic as getPaymentHistory)
        let query = {};

        switch (userRole) {
            case constants.USER_ROLES.ADMIN:
                break;

            case constants.USER_ROLES.EMPLOYEE:
                query['paymentMetadata.enrolledBy'] = userId;
                query['paymentMetadata.enrollerRole'] = constants.USER_ROLES.EMPLOYEE;
                break;

            case constants.USER_ROLES.AGENT:
                const agentUsers = await User.find({ agentId: userId }).select('_id');
                const agentUserIds = agentUsers.map(u => u._id);
                const agentCases = await Case.find({ endUserId: { $in: agentUserIds } }).select('_id');
                const agentCaseIds = agentCases.map(c => c._id);
                query.caseId = { $in: agentCaseIds };
                break;

            case constants.USER_ROLES.ASSOCIATE:
                query['paymentMetadata.enrolledBy'] = userId;
                query['paymentMetadata.enrollerRole'] = constants.USER_ROLES.ASSOCIATE;
                break;

            case constants.USER_ROLES.END_USER:
                const endUserCases = await Case.find({ endUserId: userId }).select('_id');
                const endUserCaseIds = endUserCases.map(c => c._id);
                query.caseId = { $in: endUserCaseIds };
                break;

            default:
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized access'
                });
        }

        // Fetch all payments matching query
        const payments = await Payment.find(query)
            .populate({
                path: 'caseId',
                select: 'caseId endUserId serviceId',
                populate: [
                    { path: 'endUserId', select: 'name email phone' },
                    { path: 'serviceId', select: 'name type price' }
                ]
            })
            .populate({
                path: 'paymentMetadata.enrolledBy',
                select: 'name email role'
            })
            .sort({ paymentDate: -1 });

        // Generate CSV
        const csvHeaders = [
            'Invoice Number',
            'Transaction ID',
            'Case ID',
            'End User Name',
            'End User Email',
            'Service Name',
            'Service Type',
            'Original Amount',
            'Discount Amount',
            'Coupon Code',
            'Final Amount',
            'Payment Method',
            'Status',
            'Payment Date',
            'Enrolled By',
            'Enroller Role'
        ];

        const csvRows = payments.map(payment => [
            payment.invoiceNumber || 'N/A',
            payment.transactionId,
            payment.caseId?.caseId || 'N/A',
            payment.caseId?.endUserId?.name || 'N/A',
            payment.caseId?.endUserId?.email || 'N/A',
            payment.caseId?.serviceId?.name || 'N/A',
            payment.caseId?.serviceId?.type || 'N/A',
            payment.originalAmount || payment.amount,
            payment.discountAmount || 0,
            payment.couponCode || 'N/A',
            payment.amount,
            payment.paymentMethod,
            payment.status,
            new Date(payment.paymentDate).toLocaleDateString(),
            payment.paymentMetadata?.enrolledBy?.name || 'N/A',
            payment.paymentMetadata?.enrollerRole || 'N/A'
        ]);

        // Create CSV content
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payment-history-${Date.now()}.csv`);
        res.status(200).send(csvContent);
    } catch (err) {
        next(err);
    }
};
