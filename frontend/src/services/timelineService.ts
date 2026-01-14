import api from './api';

export interface TimelineEvent {
    _id: string;
    caseId: string;
    eventType: string;
    title: string;
    description: string;
    performedBy: {
        userId?: string;
        name: string;
        role: string;
    };
    metadata?: any;
    isVisibleToUser: boolean;
    icon: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
}

// Get activity timeline for a case
export const getTimeline = async (
    caseId: string,
    userView: boolean = false,
    page: number = 1,
    limit: number = 50,
    eventType?: string
) => {
    // This would be called from employee or end user service
    // For now, we'll create a generic endpoint
    const endpoint = userView ? `/enduser/cases/${caseId}/timeline` : `/employee/cases/${caseId}/timeline`;

    const params: any = { page, limit };
    if (eventType) params.eventType = eventType;

    const response = await api.get(endpoint, { params });

    // Handle the case where response.data is an object with numeric keys (0, 1, etc.)
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && !response.data.data) {
        const events: TimelineEvent[] = [];
        Object.keys(response.data).forEach(key => {
            if (!isNaN(Number(key))) {
                events.push(response.data[key]);
            }
        });
        return { data: events, pagination: { total: events.length, page, limit } };
    }

    return response.data;
};

// Get timeline by event type
export const getTimelineByEventType = async (
    caseId: string,
    eventType: string,
    userView: boolean = false
) => {
    return getTimeline(caseId, userView, 1, 100, eventType);
};
