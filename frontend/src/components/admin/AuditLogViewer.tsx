import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { getAuditLogs, exportAuditLogs, AuditLog } from '@/services/auditLogService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AuditLogViewerProps {
    className?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ className }) => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        severity: '',
        searchQuery: '',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['auditLogs', page, filters],
        queryFn: () =>
            getAuditLogs({
                action: filters.action || undefined,
                entityType: filters.entityType || undefined,
                severity: filters.severity || undefined,
                page,
                limit: 50,
            }),
    });

    const logs: AuditLog[] = data?.data || [];
    const totalPages = data?.pagination?.total
        ? Math.ceil(data.pagination.total / 50)
        : 1;

    const handleExport = async () => {
        try {
            await exportAuditLogs({
                action: filters.action || undefined,
                entityType: filters.entityType || undefined,
                severity: filters.severity || undefined,
                format: 'csv',
            });
            toast.success('Audit logs exported successfully');
        } catch (error) {
            toast.error('Failed to export audit logs');
        }
    };

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, any> = {
            low: 'secondary',
            medium: 'default',
            high: 'warning',
            critical: 'destructive',
        };
        return (
            <Badge variant={variants[severity] || 'secondary'}>
                {severity.toUpperCase()}
            </Badge>
        );
    };

    const filteredLogs = logs.filter((log) =>
        filters.searchQuery
            ? log.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            log.user.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
            : true
    );

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Audit Logs</CardTitle>
                    <Button size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
                <div className="flex gap-2 mt-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search logs..."
                            value={filters.searchQuery}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                            }
                            className="w-full"
                        />
                    </div>
                    <Select
                        value={filters.action}
                        onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, action: value }))
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Actions</SelectItem>
                            <SelectItem value="create">Create</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="upload">Upload</SelectItem>
                            <SelectItem value="download">Download</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.entityType}
                        onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, entityType: value }))
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Entities</SelectItem>
                            <SelectItem value="Case">Case</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="DocumentVersion">Document</SelectItem>
                            <SelectItem value="WorkflowTemplate">Workflow</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.severity}
                        onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, severity: value }))
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Severities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log._id}>
                                        <TableCell className="text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{log.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{log.user.role}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>{log.entityType}</TableCell>
                                        <TableCell className="max-w-md">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" className="p-0 h-auto text-left">
                                                        <p className="text-sm line-clamp-2">{log.description}</p>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Audit Log Details</DialogTitle>
                                                        <DialogDescription>
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm font-medium mb-1">Description</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {log.description}
                                                            </p>
                                                        </div>
                                                        {log.metadata && (
                                                            <div>
                                                                <p className="text-sm font-medium mb-1">Metadata</p>
                                                                <div className="text-xs space-y-1">
                                                                    {log.metadata.ipAddress && (
                                                                        <p>IP: {log.metadata.ipAddress}</p>
                                                                    )}
                                                                    {log.metadata.deviceType && (
                                                                        <p>Device: {log.metadata.deviceType}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {log.changes && (
                                                            <div>
                                                                <p className="text-sm font-medium mb-1">Changes</p>
                                                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
                                                                    {JSON.stringify(log.changes, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={log.status === 'success' ? 'default' : 'destructive'}
                                            >
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
