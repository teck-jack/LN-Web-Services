import api from './api';

export interface CannedResponse {
    _id: string;
    title: string;
    content: string;
    category: 'greeting' | 'document_request' | 'status_update' | 'clarification' | 'approval' | 'rejection' | 'closing' | 'follow_up' | 'general';
    variables?: Array<{
        name: string;
        placeholder: string;
        description?: string;
    }>;
    createdBy: {
        userId: string;
        name: string;
        role: string;
    };
    isGlobal: boolean;
    isActive: boolean;
    usageCount: number;
    lastUsedAt?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

// Get canned responses
export const getResponses = async (category?: string, isGlobal?: boolean) => {
    const params: any = {};
    if (category) params.category = category;
    if (isGlobal !== undefined) params.isGlobal = isGlobal;

    const response = await api.get('/employee/canned-responses', { params });
    return response.data;
};

// Get popular canned responses
export const getPopularResponses = async (limit: number = 10) => {
    const response = await api.get('/employee/canned-responses/popular', {
        params: { limit },
    });
    return response.data;
};

// Get canned responses by category
export const getByCategory = async (category: string) => {
    const response = await api.get(`/employee/canned-responses/category/${category}`);
    return response.data;
};

// Create canned response
export const createResponse = async (data: Partial<CannedResponse>) => {
    const response = await api.post('/employee/canned-responses', data);
    return response.data;
};

// Update canned response
export const updateResponse = async (id: string, data: Partial<CannedResponse>) => {
    const response = await api.put(`/employee/canned-responses/${id}`, data);
    return response.data;
};

// Delete canned response
export const deleteResponse = async (id: string) => {
    const response = await api.delete(`/employee/canned-responses/${id}`);
    return response.data;
};

// Use canned response (increment usage count)
export const useResponse = async (id: string) => {
    const response = await api.post(`/employee/canned-responses/${id}/use`);
    return response.data;
};
