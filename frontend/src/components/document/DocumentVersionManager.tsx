import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Download,
    Upload,
    CheckCircle,
    XCircle,
    RotateCcw,
    Trash2,
    FileText,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    getVersionHistory,
    uploadVersion,
    downloadVersion,
    deleteVersion,
    restoreVersion,
    verifyDocument,
    DocumentVersion,
} from '@/services/documentVersionService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DocumentVersionManagerProps {
    caseId: string;
    documentType: string;
    canUpload: boolean;
    canVerify: boolean;
    className?: string;
}

export const DocumentVersionManager: React.FC<DocumentVersionManagerProps> = ({
    caseId,
    documentType,
    canUpload,
    canVerify,
    className,
}) => {
    const queryClient = useQueryClient();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadNotes, setUploadNotes] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data, isLoading } = useQuery({
        queryKey: ['documentVersions', caseId, documentType],
        queryFn: () => getVersionHistory(caseId, documentType),
    });

    const versions: DocumentVersion[] = data?.data || [];

    const uploadMutation = useMutation({
        mutationFn: () =>
            uploadVersion(caseId, documentType, selectedFile!, uploadNotes, setUploadProgress),
        onSuccess: () => {
            toast.success('Document uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['documentVersions', caseId, documentType] });
            setUploadDialogOpen(false);
            setSelectedFile(null);
            setUploadNotes('');
            setUploadProgress(0);
        },
        onError: () => {
            toast.error('Failed to upload document');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (versionId: string) => deleteVersion(versionId),
        onSuccess: () => {
            toast.success('Document version deleted');
            queryClient.invalidateQueries({ queryKey: ['documentVersions', caseId, documentType] });
        },
        onError: () => {
            toast.error('Failed to delete document');
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (versionId: string) => restoreVersion(versionId),
        onSuccess: () => {
            toast.success('Document version restored');
            queryClient.invalidateQueries({ queryKey: ['documentVersions', caseId, documentType] });
        },
        onError: () => {
            toast.error('Failed to restore document');
        },
    });

    const verifyMutation = useMutation({
        mutationFn: ({
            versionId,
            status,
            reason,
        }: {
            versionId: string;
            status: 'verified' | 'rejected';
            reason?: string;
        }) => verifyDocument(versionId, status, reason),
        onSuccess: () => {
            toast.success('Document verification updated');
            queryClient.invalidateQueries({ queryKey: ['documentVersions', caseId, documentType] });
        },
        onError: () => {
            toast.error('Failed to update verification');
        },
    });

    const handleDownload = async (versionId: string, fileName: string) => {
        try {
            const response = await downloadVersion(versionId);
            const link = document.createElement('a');
            link.href = response.data.fileUrl;
            link.download = fileName;
            link.click();
            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default">Active</Badge>;
            case 'superseded':
                return <Badge variant="secondary">Superseded</Badge>;
            case 'deleted':
                return <Badge variant="destructive">Deleted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                        {documentType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </CardTitle>
                    {canUpload && (
                        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload New Version
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload New Version</DialogTitle>
                                    <DialogDescription>
                                        Upload a new version of this document. Previous versions will be marked as
                                        superseded.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="file">File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            value={uploadNotes}
                                            onChange={(e) => setUploadNotes(e.target.value)}
                                            placeholder="Add any notes about this version..."
                                        />
                                    </div>
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Uploading...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setUploadDialogOpen(false)}
                                        disabled={uploadMutation.isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => uploadMutation.mutate()}
                                        disabled={!selectedFile || uploadMutation.isPending}
                                    >
                                        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {versions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Version</TableHead>
                                <TableHead>File Name</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {versions.map((version) => (
                                <TableRow key={version._id}>
                                    <TableCell className="font-medium">v{version.version}</TableCell>
                                    <TableCell>{version.metadata.originalFileName}</TableCell>
                                    <TableCell>{formatFileSize(version.metadata.fileSize)}</TableCell>
                                    <TableCell>{new Date(version.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{getStatusBadge(version.status)}</TableCell>
                                    <TableCell>{getVerificationBadge(version.verificationStatus)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDownload(version._id, version.metadata.originalFileName)
                                                }
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            {canVerify && version.verificationStatus === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            verifyMutation.mutate({
                                                                versionId: version._id,
                                                                status: 'verified',
                                                            })
                                                        }
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            verifyMutation.mutate({
                                                                versionId: version._id,
                                                                status: 'rejected',
                                                                reason: 'Document quality issue',
                                                            })
                                                        }
                                                    >
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </>
                                            )}
                                            {canVerify && version.status === 'superseded' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => restoreMutation.mutate(version._id)}
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canVerify && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteMutation.mutate(version._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
