import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, User, Settings, LogOut, MessageSquare, Check, Search } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import * as endUserService from "@/services/endUserService";
import { adminService } from "@/services/adminService";
import { agentService } from "@/services/agentService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data;
      if (user.role === 'employee') {
        data = await employeeService.getNotifications({ limit: 5 });
      } else if (user.role === 'end_user') {
        const response = await endUserService.getNotifications({ limit: 5 });
        data = response.data;
      } else if (user.role === 'admin') {
        data = await adminService.getNotifications({ limit: 5 });
      } else if (user.role === 'agent') {
        data = await agentService.getNotifications({ limit: 5 });
      }

      if (data) {
        setNotifications(data.data || []);
        // Calculate unread count if not provided directly
        const count = data.data?.filter((n: any) => !n.isRead).length || 0;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (user?.role === 'employee') {
        await employeeService.markNotificationAsRead(id);
      } else if (user?.role === 'end_user') {
        await endUserService.markNotificationAsRead(id);
      } else if (user?.role === 'admin') {
        await adminService.markNotificationAsRead(id);
      } else if (user?.role === 'agent') {
        await agentService.markNotificationAsRead(id);
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationRoute = () => {
    if (!user) return "#";
    if (user.role === 'employee') return "/employee/notifications";
    if (user.role === 'end_user') return "/end-user/notifications";
    if (user.role === 'admin') return "/admin/notifications";
    if (user.role === 'agent') return "/agent/notifications";
    return "#";
  };

  const getProfileRoute = () => {
    if (!user) return "#";
    if (user.role === 'employee') return "/employee/profile";
    if (user.role === 'end_user') return "/end-user/profile";
    if (user.role === 'admin') return "/admin/profile";
    if (user.role === 'agent') return "/agent/profile";
    if (user.role === 'associate') return "/associate/profile";
    return "#";
  };

  const getSettingsRoute = () => {
    if (!user) return "#";
    if (user.role === 'employee') return "/employee/settings";
    if (user.role === 'end_user') return "/end-user/settings";
    if (user.role === 'admin') return "/admin/settings";
    if (user.role === 'agent') return "/agent/settings";
    if (user.role === 'associate') return "/associate/settings";
    return "#";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex justify-center mx-4">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-muted/40 pl-10 h-10 rounded-lg border-muted-foreground/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to="/contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Contact Us</span>
            </Link>
          </Button>
          <ModeToggle />

          {(user?.role === 'employee' || user?.role === 'end_user' || user?.role === 'admin' || user?.role === 'agent') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto  custom-scrollbar">
                  {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className={cn(
                          "group flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent focus:text-accent-foreground",
                          !notification.isRead && "bg-muted/50"
                        )}
                        onClick={() => navigate(getNotificationRoute())}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <span className={cn(
                            "text-sm font-medium leading-none transition-colors",
                            !notification.isRead ? "text-primary group-hover:text-accent-foreground group-focus:text-accent-foreground" : "group-hover:text-accent-foreground group-focus:text-accent-foreground"
                          )}>
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:bg-transparent hover:text-primary group-hover:text-accent-foreground group-focus:text-accent-foreground"
                              onClick={(e) => markAsRead(notification._id, e)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-accent-foreground/90 group-focus:text-accent-foreground/90 transition-colors">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground self-end mt-1 group-hover:text-accent-foreground/80 group-focus:text-accent-foreground/80 transition-colors">
                          {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-2 cursor-pointer justify-center text-primary font-medium">
                  <Link to={getNotificationRoute()}>
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 px-2 gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={getProfileRoute()} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={getSettingsRoute()} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
