import api from './api';

export const associateService = {
    // Dashboard
    getDashboard: () => api.get('/associate/dashboard'),

    // Users
    getOnboardedUsers: (params?: any) => api.get('/associate/users', { params }),
    createEndUser: (userData: any) => api.post('/associate/users', userData),

    // Services
    getServices: () => api.get('/associate/services'),
    getServiceById: (id: string) => api.get(`/associate/services/${id}`),

    // Reports
    getReports: (params?: any) => api.get('/associate/reports', { params }),

    // Notifications
    getNotifications: (params?: any) => api.get('/associate/notifications', { params }),
    markNotificationAsRead: (id: string) => api.put(`/associate/notifications/${id}/read`),
    markAllNotificationsAsRead: () => api.put('/associate/notifications/read-all'),
};
