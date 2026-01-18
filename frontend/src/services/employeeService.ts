import api from './api';

export const employeeService = {
  getDashboard: async () => {
    const response = await api.get('/employee/dashboard');
    return response.data;
  },

  getAssignedCases: async (params: { status?: string; page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/employee/cases', { params });
    return response.data;
  },

  getCase: async (id: string) => {
    const response = await api.get(`/employee/cases/${id}`);
    return response.data;
  },

  updateCaseStatus: async (id: string, statusData: { status: string; currentStep?: number; note?: string }) => {
    const response = await api.put(`/employee/cases/${id}/status`, statusData);
    return response.data;
  },

  addNote: async (id: string, noteData: { text: string }) => {
    const response = await api.post(`/employee/cases/${id}/notes`, noteData);
    return response.data;
  },

  uploadDocument: async (id: string, documentData: { name: string; url: string; file?: File }) => {
    const response = await api.post(`/employee/cases/${id}/documents`, documentData);
    return response.data;
  },

  getNotifications: async (params: { page?: number; limit?: number; isRead?: boolean }) => {
    const response = await api.get('/employee/notifications', { params });
    return response.data;
  },

  markNotificationAsRead: async (id: string) => {
    const response = await api.put(`/employee/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/employee/notifications/read-all');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/employee/profile');
    return response.data;
  },

  updateProfile: async (profileData: { name?: string; email?: string; phone?: string }) => {
    const response = await api.put('/employee/profile', profileData);
    return response.data;
  },

  getRequiredDocuments: async (caseId: string) => {
    const response = await api.get(`/employee/cases/${caseId}/required-documents`);
    return response.data;
  },

  getTimeline: async (caseId: string, params?: any) => {
    const response = await api.get(`/employee/cases/${caseId}/timeline`, { params });
    return response.data;
  },

  // End User Management
  getEndUsers: async (params: { page?: number; limit?: number; search?: string; sourceTag?: string }) => {
    const response = await api.get('/employee/end-users', { params });
    return response.data;
  },

  getServices: async () => {
    const response = await api.get('/employee/services');
    return response.data;
  },

  enrollUserInService: async (data: { userId: string; serviceId: string; notes?: string }) => {
    const response = await api.post('/employee/enroll', data);
    return response.data;
  },

  // Create new end user (with optional service enrollment)
  createEndUser: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    serviceId?: string
  }) => {
    const response = await api.post('/employee/users', data);
    return response.data;
  },
};
