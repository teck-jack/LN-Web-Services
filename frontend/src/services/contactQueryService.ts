import api from './api';

export interface ContactQuery {
    _id: string;
    name: string;
    email: string;
    phone: string;
    query: string;
    userId?: string;
    userRole: 'admin' | 'agent' | 'associate' | 'employee' | 'end_user' | 'guest' | null;
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    responses: QueryResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface QueryResponse {
    _id: string;
    responderId: string;
    responderName: string;
    responderRole: string;
    message: string;
    timestamp: string;
}

export interface SubmitQueryData {
    name: string;
    email: string;
    phone: string;
    query: string;
}

export interface QueryFilters {
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
}

const contactQueryService = {
    // Submit a new contact query (public endpoint)
    submitQuery: async (data: SubmitQueryData) => {
        const response = await api.post('/contact/submit', data);
        return response.data;
    },

    // Get all queries (admin/employee)
    getAllQueries: async (filters?: QueryFilters) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/contact/queries?${params.toString()}`);
        return response.data;
    },

    // Get user's own queries
    getMyQueries: async () => {
        const response = await api.get('/contact/queries/my-queries');
        return response.data;
    },

    // Get single query by ID
    getQueryById: async (id: string) => {
        const response = await api.get(`/contact/queries/${id}`);
        return response.data;
    },

    // Update query status
    updateQueryStatus: async (id: string, status: string, priority?: string) => {
        const response = await api.put(`/contact/queries/${id}/status`, {
            status,
            priority
        });
        return response.data;
    },

    // Assign query to employee
    assignQuery: async (id: string, employeeId: string) => {
        const response = await api.put(`/contact/queries/${id}/assign`, {
            employeeId
        });
        return response.data;
    },

    // Add response to query
    addResponse: async (id: string, message: string) => {
        const response = await api.post(`/contact/queries/${id}/response`, {
            message
        });
        return response.data;
    },

    // Delete query (admin only)
    deleteQuery: async (id: string) => {
        const response = await api.delete(`/contact/queries/${id}`);
        return response.data;
    }
};

export default contactQueryService;
