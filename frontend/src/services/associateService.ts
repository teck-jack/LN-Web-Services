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
    markAllNotificationsAsRead: async () => {
        const response = await api.put("/associate/notifications/read-all");
        return response.data;
    },

    // Enrollment History
    getEnrollmentHistory: async (params: {
        page?: number;
        limit?: number;
        serviceId?: string;
        paymentStatus?: string;
        search?: string;
    }) => {
        const response = await api.get("/associate/enrollments", { params });
        return response.data;
    },

    getEnrollmentReceipt: async (caseId: string) => {
        const response = await api.get(`/associate/enrollments/${caseId}/receipt`);
        return response.data;
    },
};
