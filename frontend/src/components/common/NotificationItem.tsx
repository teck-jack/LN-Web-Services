import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedCaseId?: {
    _id: string;
    caseId: string;
  };
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onViewCase?: (caseId: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onViewCase }: NotificationItemProps) {
  return (
    <Card className={cn("card-hover", !notification.isRead && "border-primary/50 bg-primary/5")}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={cn("p-2 rounded-lg", notification.isRead ? "bg-muted" : "bg-primary/10")}>
            <Bell className={cn("h-5 w-5", notification.isRead ? "text-muted-foreground" : "text-primary")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
              {!notification.isRead && <Badge variant="default">New</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              {notification.relatedCaseId && (
                <Badge variant="outline" className="text-xs">
                  {notification.relatedCaseId.caseId}
                </Badge>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {!notification.isRead && onMarkAsRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsRead(notification._id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark as Read
                </Button>
              )}
              {notification.relatedCaseId && onViewCase && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onViewCase(notification.relatedCaseId!._id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Case
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
