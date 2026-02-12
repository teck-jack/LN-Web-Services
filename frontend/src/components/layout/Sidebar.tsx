import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  BarChart3,
  Shield,
  UserCog,
  X,
  Package,
  Bell,
  User,
  IndianRupee,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  // Admin nav items
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "End Users",
    href: "/admin/end-users",
    icon: User,
    roles: ["admin"],
  },
  {
    title: "Cases",
    href: "/admin/cases",
    icon: Briefcase,
    roles: ["admin"],
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: FileText,
    roles: ["admin"],
  },
  {
    title: "Employees",
    href: "/admin/employees",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Agents",
    href: "/admin/agents",
    icon: Shield,
    roles: ["admin"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Contact Queries",
    href: "/admin/contact-queries",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    title: "Payment History",
    href: "/admin/payment-history",
    icon: IndianRupee,
    roles: ["admin"],
  },
  {
    title: "Enrollment",
    href: "/admin/enroll",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    roles: ["admin"],
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: User,
    roles: ["admin"],
  },
  // Agent nav items
  {
    title: "Onboarded Users",
    href: "/agent/users",
    icon: Users,
    roles: ["agent"],
  },
  {
    title: "Services",
    href: "/agent/services",
    icon: Package,
    roles: ["agent"],
  },
  {
    title: "Reports",
    href: "/agent/reports",
    icon: BarChart3,
    roles: ["agent"],
  },
  {
    title: "Payment History",
    href: "/agent/payment-history",
    icon: IndianRupee,
    roles: ["agent"],
  },
  {
    title: "Enrollment History",
    href: "/agent/enrollment-history",
    icon: FileText,
    roles: ["agent"],
  },
  {
    title: "Notifications",
    href: "/agent/notifications",
    icon: Bell,
    roles: ["agent"],
  },
  {
    title: "Profile",
    href: "/agent/profile",
    icon: User,
    roles: ["agent"],
  },
  // Associate nav items
  {
    title: "Onboarded Users",
    href: "/associate/users",
    icon: Users,
    roles: ["associate"],
  },
  {
    title: "Services",
    href: "/associate/services",
    icon: Package,
    roles: ["associate"],
  },
  {
    title: "Reports",
    href: "/associate/reports",
    icon: BarChart3,
    roles: ["associate"],
  },
  {
    title: "Payment History",
    href: "/associate/payment-history",
    icon: IndianRupee,
    roles: ["associate"],
  },
  {
    title: "Enrollment History",
    href: "/associate/enrollment-history",
    icon: FileText,
    roles: ["associate"],
  },
  {
    title: "Notifications",
    href: "/associate/notifications",
    icon: Bell,
    roles: ["associate"],
  },
  {
    title: "Profile",
    href: "/associate/profile",
    icon: User,
    roles: ["associate"],
  },
  // Employee nav items
  {
    title: "My Cases",
    href: "/employee/cases",
    icon: Briefcase,
    roles: ["employee"],
  },
  {
    title: "Notifications",
    href: "/employee/notifications",
    icon: Bell,
    roles: ["employee"],
  },
  {
    title: "Contact Queries",
    href: "/employee/contact-queries",
    icon: MessageSquare,
    roles: ["employee"],
  },
  {
    title: "Payment History",
    href: "/employee/payment-history",
    icon: IndianRupee,
    roles: ["employee"],
  },
  {
    title: "Enrollment",
    href: "/admin/enroll",
    icon: UserCog,
    roles: ["employee"],
  },
  {
    title: "Profile",
    href: "/employee/profile",
    icon: User,
    roles: ["employee"],
  },
  {
    title: "End Users",
    href: "/employee/end-users",
    icon: Users,
    roles: ["employee"],
  },
  // End User nav items
  {
    title: "Services",
    href: "/end-user/services",
    icon: ShoppingBag,
    roles: ["end_user"],
  },
  {
    title: "My Cases",
    href: "/end-user/cases",
    icon: Briefcase,
    roles: ["end_user"],
  },
  {
    title: "Payments",
    href: "/end-user/payments",
    icon: IndianRupee,
    roles: ["end_user"],
  },
  {
    title: "Notifications",
    href: "/end-user/notifications",
    icon: Bell,
    roles: ["end_user"],
  },
  {
    title: "My Queries",
    href: "/end-user/my-queries",
    icon: MessageSquare,
    roles: ["end_user"],
  },
  {
    title: "Profile",
    href: "/end-user/profile",
    icon: User,
    roles: ["end_user"],
  },
  // Settings - Role specific
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/agent/settings",
    icon: Settings,
    roles: ["agent"],
  },
  {
    title: "Settings",
    href: "/associate/settings",
    icon: Settings,
    roles: ["associate"],
  },
  {
    title: "Settings",
    href: "/employee/settings",
    icon: Settings,
    roles: ["employee"],
  },
  {
    title: "Settings",
    href: "/end-user/settings",
    icon: Settings,
    roles: ["end_user"],
  },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const canAccessRoute = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  };

  const filteredNavItems = navItems.filter(canAccessRoute);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:sticky md:translate-x-0 flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center space-x-1" onClick={onClose}>
              <div className="h-10 w-auto flex items-center justify-center">
                <img src="/Logo.webp.png" alt="LN Services" className="h-full w-auto object-contain drop-shadow-sm" />
              </div>
              <span className="font-bold text-lg tracking-tight text-sidebar-foreground">LN Services</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation - Scrollable only if content overflows */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar custom-scrollbar">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link key={item.href} to={item.href} onClick={onClose}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 transition-smooth",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 text-center">
              <p>LN Services v1.0</p>
              <p>© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
