import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/common/StatsCard";
import { Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { agentService } from "@/services/agentService";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function AgentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await agentService.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header - Responsive */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">Track your performance and manage user onboarding.</p>
      </div>

      {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        <StatsCard
          title="Users Onboarded"
          value={dashboard.performance.onboardedUsers}
          icon={Users}
          iconColor="text-primary"
        />
        <StatsCard
          title="Completed Cases"
          value={dashboard.performance.completedCases}
          icon={CheckCircle2}
          iconColor="text-success"
        />
        <StatsCard
          title="In Progress Cases"
          value={dashboard.performance.inProgressCases}
          icon={Clock}
          iconColor="text-warning"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${dashboard.performance.conversionRate}%`}
          icon={TrendingUp}
          iconColor="text-primary"
        />
      </div>

      {/* Cards Grid - Responsive: 1 col mobile, 2 col desktop */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Monthly Statistics</CardTitle>
            <CardDescription className="text-sm">This month's performance</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Users Onboarded</span>
                <span className="text-xl font-bold sm:text-2xl">{dashboard.monthlyStats.onboarded}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cases Completed</span>
                <span className="text-xl font-bold sm:text-2xl">{dashboard.monthlyStats.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-sm">Commonly used actions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-sm text-muted-foreground">Quick action buttons will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

