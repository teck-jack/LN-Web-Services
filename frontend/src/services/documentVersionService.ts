import api from './api';

export interface DocumentVersion {
    _id: string;
    caseId: string;
    documentType: string;
    version: number;
    fileUrl: string;
    cloudinaryPublicId: string;
    uploadedBy: {
        userId: string;
        userRole: string;
    };
    status: 'active' | 'superseded' | 'deleted';
    metadata: {
        originalFileName: string;
        fileSize: number;
        mimeType: string;
        format?: string;
    };
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Upload new document version
export const uploadVersion = async (
    caseId: string,
    documentType: string,
    file: File,
    notes?: string,
    onProgress?: (progress: number) => void
) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('documentType', documentType);
    if (notes) formData.append('notes', notes);

    const response = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            }
        },
    });

    return response.data;
};

// Get version history for a document
export const getVersionHistory = async (caseId: string, documentType: string) => {
    const response = await api.get(`/documents/${caseId}/${documentType}/versions`);
    return response.data;
};

// Download specific version
export const downloadVersion = async (versionId: string) => {
    const response = await api.get(`/documents/version/${versionId}/download`);
    return response.data;
};

// Delete version
export const deleteVersion = async (versionId: string) => {
    const response = await api.delete(`/documents/version/${versionId}`);
    return response.data;
};

// Restore previous version
export const restoreVersion = async (versionId: string) => {
    const response = await api.post(`/documents/version/${versionId}/restore`);
    return response.data;
};

// Verify document
export const verifyDocument = async (
    versionId: string,
    verificationStatus: 'verified' | 'rejected',
    rejectionReason?: string
) => {
    const response = await api.put(`/documents/version/${versionId}/verify`, {
        verificationStatus,
        rejectionReason,
    });
    return response.data;
};

// Bulk upload documents
export const bulkUpload = async (
    caseId: string,
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
) => {
    const uploadPromises = files.map((file, index) => {
        return uploadVersion(
            caseId,
            'supporting_document', // Default type for bulk uploads
            file,
            undefined,
            (progress) => onProgress?.(index, progress)
        );
    });

    const results = await Promise.allSettled(uploadPromises);
    return results;
};
