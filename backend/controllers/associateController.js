const User = require('../models/User');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const constants = require('../utils/constants');
const agentController = require('./agentController');

// Associate controller reuses most agent controller functions
// but overrides createEndUser to use 'associate' sourceTag

// @desc    Get associate dashboard
// @route   GET /api/associate/dashboard
// @access  Private/Associate
exports.getDashboard = agentController.getDashboard;

// @desc    Get onboarded users
// @route   GET /api/associate/users
// @access  Private/Associate
exports.getOnboardedUsers = agentController.getOnboardedUsers;

// @desc    Create end user (OVERRIDDEN for associate-specific sourceTag)
// @route   POST /api/associate/users
// @access  Private/Associate
exports.createEndUser = async (req, res, next) => {
    try {
        const associateId = req.user.id;
        const { name, email, password, phone, serviceId } = req.body;

        // Create end user with ASSOCIATE sourceTag
        const endUser = await User.create({
            name,
            email,
            password,
            phone,
            role: constants.USER_ROLES.END_USER,
            sourceTag: constants.SOURCE_TAGS.ASSOCIATE,
            agentId: associateId,
            leadStatus: 'converted'
        });

        // Create notification for admin
        const admins = await User.find({ role: constants.USER_ROLES.ADMIN });

        for (const admin of admins) {
            await Notification.create({
                recipientId: admin._id,
                type: constants.NOTIFICATION_TYPES.IN_APP,
                title: 'New User Registration',
                message: `A new user ${name} has been registered by associate ${req.user.name}.`,
                relatedCaseId: null
            });
        }

        // If serviceId provided, return service details for payment processing
        let service = null;
        if (serviceId) {
            service = await Service.findById(serviceId);
        }

        res.status(201).json({
            success: true,
            data: {
                user: endUser,
                service: service,
                // Frontend should redirect to payment page if service is provided
                requiresPayment: !!service
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get services for onboarding
// @route   GET /api/associate/services
// @access  Private/Associate
exports.getServices = agentController.getServices;

// @desc    Get single service details by ID
// @route   GET /api/associate/services/:id
// @access  Private/Associate
exports.getServiceById = agentController.getServiceById;

// @desc    Get reports
// @route   GET /api/associate/reports
// @access  Private/Associate
exports.getReports = agentController.getReports;

// @desc    Get notifications
// @route   GET /api/associate/notifications
// @access  Private/Associate
exports.getNotifications = agentController.getNotifications;

// @desc    Mark notification as read
// @route   PUT /api/associate/notifications/:id/read
// @access  Private/Associate
exports.markNotificationAsRead = agentController.markNotificationAsRead;

// @desc    Mark all notifications as read
// @route   PUT /api/associate/notifications/read-all
// @access  Private/Associate
exports.markAllNotificationsAsRead = agentController.markAllNotificationsAsRead;

// @desc    Get enrollment history
// @route   GET /api/associate/enrollments
// @access  Private/Associate
exports.getEnrollmentHistory = agentController.getEnrollmentHistory;

// @desc    Get enrollment receipt
// @route   GET /api/associate/enrollments/:id/receipt
// @access  Private/Associate
exports.getEnrollmentReceipt = agentController.getEnrollmentReceipt;
