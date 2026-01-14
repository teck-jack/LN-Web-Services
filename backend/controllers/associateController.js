const agentController = require('./agentController');

// Associate controller reuses all agent controller functions
// This ensures DRY principles while maintaining separate role-based access

// @desc    Get associate dashboard
// @route   GET /api/associate/dashboard
// @access  Private/Associate
exports.getDashboard = agentController.getDashboard;

// @desc    Get onboarded users
// @route   GET /api/associate/users
// @access  Private/Associate
exports.getOnboardedUsers = agentController.getOnboardedUsers;

// @desc    Create end user
// @route   POST /api/associate/users
// @access  Private/Associate
exports.createEndUser = agentController.createEndUser;

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
