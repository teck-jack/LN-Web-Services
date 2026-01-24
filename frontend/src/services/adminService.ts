import api from "./api";

export const adminService = {
  // Dashboard
  async getDashboard() {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch dashboard data");
    }
  },

  // Users
  async getUsers(params?: any) {
    try {
      const response = await api.get("/admin/users", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    }
  },

  async getUser(id: string) {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch user");
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update user");
    }
  },

  async deactivateUser(id: string) {
    try {
      const response = await api.patch(`/admin/users/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to deactivate user");
    }
  },

  async activateUser(id: string) {
    try {
      const response = await api.patch(`/admin/users/${id}/activate`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to activate user");
    }
  },

  async createUser(userData: { name: string; email: string; password: string; role: string; phone?: string }) {
    try {
      const response = await api.post("/admin/users", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create user");
    }
  },

  // Employees
  async createEmployee(userData: any) {
    try {
      const response = await api.post("/admin/employees", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create employee");
    }
  },

  async getAllEmployees() {
    try {
      const response = await api.get("/admin/employees");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch employees");
    }
  },

  async updateEmployee(id: string, userData: any) {
    try {
      const response = await api.put(`/admin/employees/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update employee");
    }
  },

  // Agents
  async createAgent(userData: any) {
    try {
      const response = await api.post("/admin/agents", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create agent");
    }
  },

  async updateAgent(id: string, userData: any) {
    try {
      const response = await api.put(`/admin/agents/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update agent");
    }
  },

  // Cases
  async getCases(params?: any) {
    try {
      const response = await api.get("/admin/cases", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch cases");
    }
  },

  async getCase(id: string) {
    try {
      const response = await api.get(`/admin/cases/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch case");
    }
  },

  async assignCase(id: string, employeeId: string) {
    try {
      const response = await api.put(`/admin/cases/${id}/assign`, { employeeId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to assign case");
    }
  },

  async autoAssignCases() {
    try {
      const response = await api.post("/admin/cases/auto-assign");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to auto-assign cases");
    }
  },

  // Services
  async getServices() {
    try {
      const response = await api.get("/admin/services");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch services");
    }
  },

  async getService(id: string) {
    try {
      const response = await api.get(`/admin/services/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch service");
    }
  },

  async createService(serviceData: any) {
    try {
      const response = await api.post("/admin/services", serviceData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create service");
    }
  },

  async updateService(id: string, serviceData: any) {
    try {
      const response = await api.put(`/admin/services/${id}`, serviceData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update service");
    }
  },

  async deleteService(id: string) {
    try {
      const response = await api.delete(`/admin/services/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete service");
    }
  },

  // Reports
  async getReports(params?: any) {
    try {
      const response = await api.get("/admin/reports", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch reports");
    }
  },

  // Documents
  async getRequiredDocuments(caseId: string) {
    try {
      const response = await api.get(`/admin/cases/${caseId}/required-documents`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch required documents");
    }
  },

  // Notes
  async addNote(caseId: string, noteData: { text: string }) {
    try {
      const response = await api.post(`/admin/cases/${caseId}/notes`, noteData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to add note");
    }
  },

  // Timeline
  async getTimeline(caseId: string, params?: any) {
    try {
      const response = await api.get(`/admin/cases/${caseId}/timeline`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch timeline");
    }
  },

  // Notifications
  async getNotifications(params: { page?: number; limit?: number; isRead?: boolean }) {
    try {
      const response = await api.get('/admin/notifications', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch notifications");
    }
  },

  async markNotificationAsRead(id: string) {
    try {
      const response = await api.put(`/admin/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to mark notification as read");
    }
  },

  async markAllNotificationsAsRead() {
    try {
      const response = await api.put('/admin/notifications/read-all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to mark all notifications as read");
    }
  },

  // End User Management
  async getEndUsers(params: { page?: number; limit?: number; search?: string; sourceTag?: string; hasCase?: string }) {
    try {
      const response = await api.get('/admin/end-users', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch end users");
    }
  },

  async enrollUserInService(data: { userId: string; serviceId: string; notes?: string; employeeId?: string }) {
    try {
      const response = await api.post('/admin/enroll', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to enroll user");
    }
  },

  async checkActiveEnrollment(userId: string, serviceId: string) {
    try {
      const response = await api.get(`/admin/check-enrollment/${userId}/${serviceId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to check enrollment status");
    }
  },

  // Delete operations
  async deleteUser(id: string) {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete user");
    }
  },

  async deleteAgent(id: string) {
    try {
      const response = await api.delete(`/admin/agents/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete agent");
    }
  },

  async deleteEmployee(id: string) {
    try {
      const response = await api.delete(`/admin/employees/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete employee");
    }
  },

  async deleteAssociate(id: string) {
    try {
      const response = await api.delete(`/admin/associates/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete associate");
    }
  },

  async deleteCase(id: string) {
    try {
      const response = await api.delete(`/admin/cases/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete case");
    }
  },
};
