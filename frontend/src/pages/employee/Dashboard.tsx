import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/common/StatsCard";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, CheckCircle2, FileText, Bell, User, Eye } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface DashboardData {
  workload: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
  };
  recentCases: Array<{
    _id: string;
    caseId: string;
    endUserId: {
      _id: string;
      name: string;
      email: string;
    };
    serviceId: {
      _id: string;
      name: string;
      type: string;
    };
    status: string;
    lastActivityAt: string;
  }>;
  unreadNotifications: number;
}

const statusColors = {
  new: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getDashboard();
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Cases",
      value: data?.workload.total || 0,
      icon: Briefcase,
      iconColor: "text-primary",
    },
    {
      title: "New Cases",
      value: data?.workload.new || 0,
      icon: FileText,
      iconColor: "text-blue-500",
    },
    {
      title: "In Progress",
      value: data?.workload.inProgress || 0,
      icon: Clock,
      iconColor: "text-warning",
    },
    {
      title: "Completed",
      value: data?.workload.completed || 0,
      icon: CheckCircle2,
      iconColor: "text-success",
    },
  ];

  const columns: Column<DashboardData["recentCases"][0]>[] = [
    {
      header: "Case ID",
      accessor: "caseId",
      mobileLabel: "ID",
    },
    {
      header: "End User",
      accessor: (row) => row.endUserId?.name || "N/A",
      mobileLabel: "User",
    },
    {
      header: "Service",
      accessor: (row) => row.serviceId?.name || "N/A",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors] || "default"}>
          {row.status?.replace("_", " ") || "Unknown"}
        </Badge>
      ),
    },
    {
      header: "Last Updated",
      accessor: (row) => row.lastActivityAt ? format(new Date(row.lastActivityAt), "MMM dd, yyyy") : "N/A",
      mobileLabel: "Updated",
      hideOnMobile: true,
    },
    {
      header: "Actions",
      accessor: "_id",
      mobileLabel: "Action",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/employee/cases/${row._id}`)}
          className="w-full md:w-auto"
        >
          <Eye className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">View</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header - Responsive */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Employee Dashboard</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage your assigned cases and track progress.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate("/employee/notifications")}
            className="w-full sm:w-auto"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {data && data.unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {data.unreadNotifications}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/employee/profile")}
            className="w-full sm:w-auto"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Recent Cases Card */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">Recent Cases</CardTitle>
              <CardDescription className="text-sm">Your recently updated cases</CardDescription>
            </div>
            <Button
              onClick={() => navigate("/employee/cases")}
              className="w-full sm:w-auto"
            >
              View All Cases
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {data?.recentCases && data.recentCases.length > 0 ? (
            <DataTable columns={columns} data={data.recentCases} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No cases assigned yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

