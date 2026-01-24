const express = require('express');
const {
  getDashboard,
  getUsers,
  getUser,
  createUser,
  activateUser,
  deactivateUser,
  deleteUser,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createAgent,
  updateAgent,
  deleteAgent,
  deleteAssociate,
  getCases,
  getCase,
  assignCase,
  autoAssignCases,
  deleteCase,
  createService,
  updateService,
  getServices,
  getReports,
  getRequiredDocuments,
  addNote,
  getTimeline,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getEndUsers,
  enrollUserInService,
  checkActiveEnrollment
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(adminAuth);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);
router.post('/agents', createAgent);
router.put('/agents/:id', updateAgent);
router.delete('/agents/:id', deleteAgent);
router.delete('/associates/:id', deleteAssociate);
router.get('/cases', getCases);
router.get('/cases/:id', getCase);
router.get('/cases/:id/required-documents', getRequiredDocuments);
router.post('/cases/:id/notes', addNote);
router.get('/cases/:id/timeline', getTimeline);
router.put('/cases/:id/assign', assignCase);
router.delete('/cases/:id', deleteCase);
router.post('/cases/auto-assign', autoAssignCases);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.get('/services', getServices);
router.get('/reports', getReports);

// Notification routes
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);

// End User Enrollment routes
router.get('/end-users', getEndUsers);
router.post('/enroll', enrollUserInService);
router.get('/check-enrollment/:userId/:serviceId', checkActiveEnrollment);

module.exports = router;