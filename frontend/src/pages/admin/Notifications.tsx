import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/common/NotificationItem";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CheckCheck } from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [readFilter, setReadFilter] = useState<string>("all");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, [pagination.page, readFilter]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await adminService.getNotifications({
                page: pagination.page,
                limit: pagination.limit,
                isRead: readFilter === "all" ? undefined : readFilter === "read",
            });
            setNotifications(response.data);
            setPagination(prev => ({ ...prev, total: response.pagination.total }));

            // Calculate unread count (approximate based on current page, or fetch separately if needed)
            // For now, we'll just track unread on current page or update when actions happen
            const unread = response.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await adminService.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success("Notification marked as read");
        } catch (error) {
            toast.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await adminService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all notifications as read");
        }
    };

    const handleViewCase = (caseId: string) => {
        navigate(`/admin/cases/${caseId}`);
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground mt-2">
                        System alerts and activity updates
                    </p>
                </div>
                <Button onClick={handleMarkAllAsRead} disabled={loading || notifications.length === 0}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All as Read
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Notifications</CardTitle>
                            <CardDescription>
                                Manage your system updates
                            </CardDescription>
                        </div>
                        <Select value={readFilter} onValueChange={setReadFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter notifications" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Notifications</SelectItem>
                                <SelectItem value="unread">Unread Only</SelectItem>
                                <SelectItem value="read">Read Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onViewCase={handleViewCase}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                                                    className={
                                                        pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(page)}
                                                        isActive={page === pagination.page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        handlePageChange(Math.min(totalPages, pagination.page + 1))
                                                    }
                                                    className={
                                                        pagination.page === totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
