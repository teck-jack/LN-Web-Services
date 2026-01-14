import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/common/NotificationItem";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CheckCheck } from "lucide-react";
import { associateService } from "@/services/associateService";
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

export default function AgentNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [readFilter, setReadFilter] = useState<string>("all");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });

    useEffect(() => {
        loadNotifications();
    }, [pagination.page, readFilter]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await associateService.getNotifications({
                page: pagination.page,
                limit: pagination.limit,
                isRead: readFilter === "all" ? undefined : readFilter === "read",
            });
            setNotifications(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await associateService.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            toast.success("Notification marked as read");
        } catch (error) {
            toast.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await associateService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all notifications as read");
        }
    };

    const handleViewCase = (caseId: string) => {
        // Agents don't have direct access to cases yet in the route structure I recall, 
        // or maybe they do? Re-checking agentService and sidebar...
        // Agent sidebar has: Onboarded Users, Services, Reports. No "Cases" link directly.
        // However, they can see case details via user details potentially?
        // User requested "Agents... excluded... make sure complete".
        // I will assume for now they might not have a direct case view or it's limited.
        // Checking routes: /agent/users exists. Maybe navigate there?
        // Or simpler: disable View Case for agents if they don't have a route.
        // BUT! Notification types usually link to cases.
        // Let's safe-guard: if we don't have a case route, just show info.
        // Wait, agentController.js has no `getCaseById`.
        // So Agents CANNOT view cases directly.
        // I will disable the View Case button functionality or redirect to Users page.
        navigate("/agent/users");
        toast.info("Redirecting to User list. Find the user to view case details.");
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
                        Updates on your onboarded users
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
                                Manage your alerts
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
                                        onViewCase={undefined} // Agents can't view cases directly
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
