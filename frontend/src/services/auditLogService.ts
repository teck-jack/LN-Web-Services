import api from './api';

export interface AuditLog {
    _id: string;
    user: {
        userId: string;
        name: string;
        email: string;
        role: string;
    };
    action: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    description: string;
    changes?: {
        before?: any;
        after?: any;
        fields?: Array<{
            field: string;
            oldValue: any;
            newValue: any;
        }>;
    };
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        location?: string;
        deviceType?: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'success' | 'failure' | 'pending';
    errorMessage?: string;
    createdAt: string;
}

// Get audit logs with filters
export const getAuditLogs = async (filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    severity?: string;
    role?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/admin/audit-logs', { params: filters });
    return response.data;
};

// Export audit logs to CSV
export const exportAuditLogs = async (filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    severity?: string;
    role?: string;
    format?: 'csv' | 'json';
}) => {
    const response = await api.get('/admin/audit-logs/export', {
        params: { ...filters, format: filters?.format || 'csv' },
        responseType: filters?.format === 'csv' ? 'blob' : 'json',
    });

    if (filters?.format === 'csv') {
        // Create download link for CSV
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    return response.data;
};

// Get entity history
export const getEntityHistory = async (entityType: string, entityId: string) => {
    const response = await api.get(`/admin/audit-logs/entity/${entityType}/${entityId}`);
    return response.data;
};
