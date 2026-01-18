const express = require('express');
const {
  getDashboard,
  getAssignedCases,
  getCase,
  updateCaseStatus,
  addNote,
  uploadDocument,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getProfile,
  updateProfile,
  updateChecklistProgress,
  getRequiredDocuments,
  getTimeline,
  getEndUsers,
  getServices,
  enrollUserInService,
  createEndUser
} = require('../controllers/employeeController');
const { employeeAuth } = require('../middleware/employeeAuth');

const router = express.Router();

router.use(employeeAuth);

router.get('/dashboard', getDashboard);
router.get('/cases', getAssignedCases);
router.get('/cases/:id', getCase);
router.get('/cases/:id/required-documents', getRequiredDocuments);
router.get('/cases/:id/timeline', getTimeline);
router.put('/cases/:id/status', updateCaseStatus);
router.put('/cases/:id/checklist', updateChecklistProgress);
router.post('/cases/:id/notes', addNote);
router.post('/cases/:id/documents', uploadDocument);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// End User Management routes
router.get('/end-users', getEndUsers);
router.get('/services', getServices);
router.post('/users', createEndUser);  // Create new end user
router.post('/enroll', enrollUserInService);  // Enroll existing user

module.exports = router;