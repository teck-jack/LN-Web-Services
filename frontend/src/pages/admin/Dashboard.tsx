import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, IndianRupee, TrendingUp } from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
  primary: 'hsl(var(--primary))',
  accent: 'hsl(var(--accent))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      setDashboardData(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard");
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

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const totalUsers = dashboardData.totalUsersBySource?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  const totalCases = dashboardData.totalCasesByStatus?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Cases",
      value: totalCases.toString(),
      icon: Briefcase,
      color: "text-accent",
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData.revenue?.total?.toLocaleString() || 0}`,
      icon: IndianRupee,
      color: "text-success",
    },
    {
      title: "Monthly Revenue",
      value: `₹${dashboardData.revenue?.monthly?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header - Responsive */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 md:p-6">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid - Responsive: 1 col mobile, 2 col desktop */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Users by Source</CardTitle>
            <CardDescription className="text-sm">Distribution of users by registration source</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <PieChart>
                <Pie
                  data={dashboardData.totalUsersBySource || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(dashboardData.totalUsersBySource || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Cases by Status</CardTitle>
            <CardDescription className="text-sm">Distribution of cases by current status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <BarChart data={dashboardData.totalCasesByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Grid - Responsive: 1 col mobile, 2 col desktop */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Employee Workload</CardTitle>
            <CardDescription className="text-sm">Cases assigned to each employee</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {(dashboardData.employees || []).slice(0, 5).map((emp: any) => (
                <div key={emp._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-medium truncate">{emp.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{emp.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm sm:text-base">{emp.workload?.total || 0} cases</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.workload?.inProgress || 0} in progress
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Agent Performance</CardTitle>
            <CardDescription className="text-sm">Top performing agents</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {(dashboardData.agents || []).slice(0, 5).map((agent: any) => (
                <div key={agent._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-medium truncate">{agent.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{agent.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm sm:text-base">{agent.onboardedUsers || 0} users</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.completedCases || 0} cases completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

