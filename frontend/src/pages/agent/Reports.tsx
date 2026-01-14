import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/common/StatsCard";
import { agentService } from "@/services/agentService";
import { toast } from "sonner";
import { Users, CheckCircle2, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportsData {
  summary: {
    onboardedUsers: number;
    completedCases: number;
    conversionRate: number;
  };
  monthlyStats: Array<{
    month: string;
    onboarded: number;
    completed: number;
  }>;
}

export default function Reports() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await agentService.getReports({});
      setReports(response.data);
    } catch (error) {
      toast.error("Failed to fetch reports");
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

  if (!reports) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Reports</h1>
        <p className="text-muted-foreground mt-2">View your performance metrics and statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Onboarded Users"
          value={reports.summary.onboardedUsers}
          icon={Users}
          iconColor="text-primary"
        />
        <StatsCard
          title="Completed Cases"
          value={reports.summary.completedCases}
          icon={CheckCircle2}
          iconColor="text-success"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${reports.summary.conversionRate}%`}
          icon={TrendingUp}
          iconColor="text-warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
          <CardDescription>Performance breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Users Onboarded</TableHead>
                <TableHead>Cases Completed</TableHead>
                <TableHead>Conversion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.monthlyStats.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{stat.month}</TableCell>
                  <TableCell>{stat.onboarded}</TableCell>
                  <TableCell>{stat.completed}</TableCell>
                  <TableCell>
                    {stat.onboarded > 0
                      ? `${Math.round((stat.completed / stat.onboarded) * 100)}%`
                      : "0%"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
