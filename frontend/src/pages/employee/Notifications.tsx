import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/common/NotificationItem";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CheckCheck, Filter } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setNotifications,
  setLoading,
  markNotificationRead,
  markAllNotificationsRead,
  setNotificationsPagination,
  setUnreadCount,
} from "@/store/slices/employeeSlice";
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

export default function EmployeeNotifications() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notifications, loading, pagination, unreadCount } = useAppSelector((state) => state.employee);
  const [readFilter, setReadFilter] = useState<string>("all");

  useEffect(() => {
    loadNotifications();
  }, [pagination.notifications.page, pagination.notifications.limit, readFilter]);

  const loadNotifications = async () => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getNotifications({
        page: pagination.notifications.page,
        limit: pagination.notifications.limit,
        isRead: readFilter === "all" ? undefined : readFilter === "read",
      });
      dispatch(setNotifications({ data: response.data, total: response.count }));
      
      // Count unread notifications
      const unread = response.data.filter((n: any) => !n.isRead).length;
      dispatch(setUnreadCount(unread));
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await employeeService.markNotificationAsRead(id);
      dispatch(markNotificationRead(id));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await employeeService.markAllNotificationsAsRead();
      dispatch(markAllNotificationsRead());
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/employee/cases/${caseId}`);
  };

  const handlePageChange = (page: number) => {
    dispatch(setNotificationsPagination({ page, limit: pagination.notifications.limit }));
  };

  const totalPages = Math.ceil(pagination.notifications.total / pagination.notifications.limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your case activities and system alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                {unreadCount > 0 && `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`}
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
                          onClick={() => handlePageChange(Math.max(1, pagination.notifications.page - 1))}
                          className={
                            pagination.notifications.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === pagination.notifications.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(Math.min(totalPages, pagination.notifications.page + 1))
                          }
                          className={
                            pagination.notifications.page === totalPages
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
