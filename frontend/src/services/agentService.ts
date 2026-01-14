import api from "./api";

export const agentService = {
  // Get agent dashboard data
  getDashboard: async () => {
    const response = await api.get("/agent/dashboard");
    return response.data;
  },

  // Get onboarded users with pagination
  getOnboardedUsers: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get("/agent/users", { params });
    return response.data;
  },

  // Create end user
  createEndUser: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    serviceId?: string;
  }) => {
    const response = await api.post("/agent/users", userData);
    return response.data;
  },

  // Get services
  getServices: async () => {
    const response = await api.get("/agent/services");
    return response.data;
  },

  // Get single service
  getService: async (id: string) => {
    const response = await api.get(`/agent/services/${id}`);
    return response.data;
  },

  // Get reports
  getReports: async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get("/agent/reports", { params });
    return response.data;
  },

  // Notifications
  getNotifications: async (params: { page?: number; limit?: number; isRead?: boolean }) => {
    const response = await api.get("/agent/notifications", { params });
    return response.data;
  },

  markNotificationAsRead: async (id: string) => {
    const response = await api.put(`/agent/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put("/agent/notifications/read-all");
    return response.data;
  },
};
