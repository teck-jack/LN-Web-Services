import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/store/slices/endUserSlice";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { NotificationItem } from "@/components/common/NotificationItem";
import { CheckCheck, Filter } from "lucide-react";
import { toast } from "sonner";

export default function Notifications() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notifications, loading, pagination } = useAppSelector((state) => state.endUser);
  const [readFilter, setReadFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const params: any = { page, limit };
    if (readFilter !== "all") {
      params.isRead = readFilter === "read";
    }
    dispatch(getNotifications(params));
  }, [dispatch, page, limit, readFilter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/end-user/cases/${caseId}`);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

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

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notifications found</p>
        </div>
      )}

      {pagination.notifications.total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page * limit >= pagination.notifications.total}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
