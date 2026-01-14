import api from './api';

export interface InternalNote {
    _id: string;
    caseId: string;
    author: {
        userId: string;
        name: string;
        role: string;
    };
    content: string;
    isEdited: boolean;
    editHistory: Array<{
        editedAt: string;
        previousContent: string;
    }>;
    isPinned: boolean;
    tags: string[];
    mentions: string[];
    createdAt: string;
    updatedAt: string;
}

// Add internal note
export const addNote = async (
    caseId: string,
    content: string,
    tags?: string[],
    mentions?: string[]
) => {
    const response = await api.post(`/employee/cases/${caseId}/internal-notes`, {
        content,
        tags,
        mentions,
    });
    return response.data;
};

// Get internal notes for a case
export const getNotes = async (caseId: string, isPinned?: boolean) => {
    const params = isPinned !== undefined ? { isPinned } : {};
    const response = await api.get(`/employee/cases/${caseId}/internal-notes`, { params });
    return response.data;
};

// Update internal note
export const updateNote = async (
    noteId: string,
    content?: string,
    tags?: string[],
    mentions?: string[],
    isPinned?: boolean
) => {
    const response = await api.put(`/employee/internal-notes/${noteId}`, {
        content,
        tags,
        mentions,
        isPinned,
    });
    return response.data;
};

// Delete internal note
export const deleteNote = async (noteId: string) => {
    const response = await api.delete(`/employee/internal-notes/${noteId}`);
    return response.data;
};
