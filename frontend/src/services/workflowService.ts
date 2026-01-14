import api from './api';

export interface WorkflowTemplate {
    _id: string;
    name: string;
    description?: string;
    serviceType: string;
    steps: WorkflowStep[];
    totalEstimatedDuration: number;
    isActive: boolean;
    createdBy: string;
    metadata?: {
        version?: string;
        tags?: string[];
        complexity?: 'simple' | 'medium' | 'complex';
    };
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowStep {
    _id: string;
    stepName: string;
    description?: string;
    order: number;
    estimatedDuration: number;
    checklistItems: ChecklistItem[];
    requiredDocuments?: string[];
}

export interface ChecklistItem {
    _id: string;
    title: string;
    description?: string;
    isOptional: boolean;
    order: number;
}

// Get all workflow templates
export const getTemplates = async (params?: {
    serviceType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/admin/workflow-templates', { params });
    return response.data;
};

// Get single workflow template
export const getTemplateById = async (id: string) => {
    const response = await api.get(`/admin/workflow-templates/${id}`);
    return response.data;
};

// Create workflow template
export const createTemplate = async (data: Partial<WorkflowTemplate>) => {
    const response = await api.post('/admin/workflow-templates', data);
    return response.data;
};

// Update workflow template
export const updateTemplate = async (id: string, data: Partial<WorkflowTemplate>) => {
    const response = await api.put(`/admin/workflow-templates/${id}`, data);
    return response.data;
};

// Delete workflow template
export const deleteTemplate = async (id: string) => {
    const response = await api.delete(`/admin/workflow-templates/${id}`);
    return response.data;
};

// Clone workflow template
export const cloneTemplate = async (id: string) => {
    const response = await api.post(`/admin/workflow-templates/${id}/clone`);
    return response.data;
};

// Update checklist progress (Employee)
export const updateChecklistProgress = async (
    caseId: string,
    data: { stepId: string; itemId: string; isCompleted: boolean }
) => {
    const response = await api.put(`/employee/cases/${caseId}/checklist`, data);
    return response.data;
};
