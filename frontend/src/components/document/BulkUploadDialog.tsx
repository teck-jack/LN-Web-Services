import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { bulkUpload } from '@/services/documentVersionService';

interface BulkUploadDialogProps {
    caseId: string;
    onComplete: (results: any[]) => void;
    maxFiles?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FileUploadState {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
    caseId,
    onComplete,
    maxFiles = 10,
    open,
    onOpenChange,
}) => {
    const [files, setFiles] = useState<FileUploadState[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles).slice(0, maxFiles - files.length);
        const fileStates: FileUploadState[] = newFiles.map((file) => ({
            file,
            progress: 0,
            status: 'pending',
        }));

        setFiles((prev) => [...prev, ...fileStates]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            const fileList = files.map((f) => f.file);

            const results = await bulkUpload(caseId, fileList, (fileIndex, progress) => {
                setFiles((prev) =>
                    prev.map((f, i) =>
                        i === fileIndex
                            ? { ...f, progress, status: progress === 100 ? 'success' : 'uploading' }
                            : f
                    )
                );
            });

            // Update status based on results
            setFiles((prev) =>
                prev.map((f, i) => ({
                    ...f,
                    status: results[i].status === 'fulfilled' ? 'success' : 'error',
                    error: results[i].status === 'rejected' ? 'Upload failed' : undefined,
                }))
            );

            const successCount = results.filter((r) => r.status === 'fulfilled').length;
            const failCount = results.filter((r) => r.status === 'rejected').length;

            if (successCount > 0) {
                toast.success(`${successCount} file(s) uploaded successfully`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} file(s) failed to upload`);
            }

            onComplete(results);

            // Close dialog after 2 seconds if all successful
            if (failCount === 0) {
                setTimeout(() => {
                    onOpenChange(false);
                    setFiles([]);
                }, 2000);
            }
        } catch (error) {
            toast.error('Bulk upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const overallProgress =
        files.length > 0
            ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
            : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Documents</DialogTitle>
                    <DialogDescription>
                        Upload multiple documents at once. Maximum {maxFiles} files.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drag and drop zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                        )}
                    >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium mb-2">
                            Drag and drop files here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Supported formats: PDF, JPG, PNG, DOC, DOCX
                        </p>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                            id="file-input"
                            disabled={files.length >= maxFiles}
                        />
                        <label htmlFor="file-input">
                            <Button variant="outline" asChild disabled={files.length >= maxFiles}>
                                <span>Select Files</span>
                            </Button>
                        </label>
                    </div>

                    {/* File list */}
                    {files.length > 0 && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {files.map((fileState, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                    <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium truncate">
                                                {fileState.file.name}
                                            </p>
                                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                                {formatFileSize(fileState.file.size)}
                                            </span>
                                        </div>
                                        {fileState.status === 'uploading' && (
                                            <div className="space-y-1">
                                                <Progress value={fileState.progress} className="h-1" />
                                                <p className="text-xs text-muted-foreground">
                                                    {fileState.progress}%
                                                </p>
                                            </div>
                                        )}
                                        {fileState.status === 'success' && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-xs">Uploaded</span>
                                            </div>
                                        )}
                                        {fileState.status === 'error' && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-xs">{fileState.error}</span>
                                            </div>
                                        )}
                                    </div>
                                    {!isUploading && fileState.status === 'pending' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Overall progress */}
                    {isUploading && (
                        <div className="space-y-2 p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Overall Progress</span>
                                <span>{Math.round(overallProgress)}%</span>
                            </div>
                            <Progress value={overallProgress} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setFiles([]);
                        }}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={files.length === 0 || isUploading}
                    >
                        {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
