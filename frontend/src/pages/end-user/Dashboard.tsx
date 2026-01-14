import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getDashboard } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { Briefcase, Plus, Clock, CheckCircle2, Bell, ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  new: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

const paymentStatusColors = {
  completed: "success",
  pending: "default",
  failed: "destructive",
  refunded: "secondary",
} as const;

export default function EndUserDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cases, payments, unreadCount, loading } = useAppSelector((state) => state.endUser);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "in_progress").length;
  const completedCases = cases.filter((c) => c.status === "completed").length;

  const stats = [
    {
      title: "Total Cases",
      value: totalCases.toString(),
      icon: Briefcase,
      color: "text-primary",
    },
    {
      title: "Active Cases",
      value: activeCases.toString(),
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Completed",
      value: completedCases.toString(),
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Notifications",
      value: unreadCount.toString(),
      icon: Bell,
      color: "text-info",
    },
  ];

  const casesColumns = [
    {
      header: "Case ID",
      accessor: "caseId" as any,
      mobileLabel: "ID",
      cell: (row: any) => (
        <span className="font-medium">{row.caseId}</span>
      ),
    },
    {
      header: "Service",
      accessor: (row: any) => row.serviceId?.name || "N/A",
    },
    {
      header: "Status",
      accessor: "status" as any,
      cell: (row: any) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors] || "default"}>
          {row.status?.replace("_", " ") || "Unknown"}
        </Badge>
      ),
    },
    {
      header: "Last Updated",
      accessor: "lastActivityAt" as any,
      mobileLabel: "Updated",
      hideOnMobile: true,
      cell: (row: any) => row.lastActivityAt ? formatDistanceToNow(new Date(row.lastActivityAt), { addSuffix: true }) : "N/A",
    },
    {
      header: "Actions",
      accessor: "_id" as any,
      mobileLabel: "Action",
      cell: (row: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/end-user/cases/${row._id}`)}
          className="w-full md:w-auto"
        >
          View Details
        </Button>
      ),
    },
  ];

  const paymentsColumns = [
    {
      header: "Case ID",
      accessor: "caseId" as any,
      mobileLabel: "Case",
      cell: (row: any) => (
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => navigate(`/end-user/cases/${row.caseId}`)}
        >
          {row.caseId}
        </Button>
      ),
    },

    {
      header: "Amount",
      accessor: "amount" as any,
      cell: (row: any) => `₹${(row.amount || 0).toLocaleString()}`,
    },
    {
      header: "Payment Method",
      accessor: "paymentMethod" as any,
      mobileLabel: "Method",
      hideOnMobile: true,
      cell: (row: any) => row.paymentMethod?.toUpperCase() || "N/A",
    },
    {
      header: "Payment Date",
      accessor: "paymentDate" as any,
      mobileLabel: "Date",
      hideOnMobile: true,
      cell: (row: any) => row.paymentDate ? formatDistanceToNow(new Date(row.paymentDate), { addSuffix: true }) : "N/A",
    },
    {
      header: "Status",
      accessor: "status" as any,
      cell: (row: any) => (
        <Badge variant={paymentStatusColors[row.status as keyof typeof paymentStatusColors] || "default"}>
          {row.status || "Unknown"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header - Responsive */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">Track your service requests and case progress.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate("/end-user/services")}
            className="w-full sm:w-auto"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Browse Services
          </Button>
          <Button
            onClick={() => navigate("/end-user/services")}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
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

      {/* Data Cards Grid - Responsive: 1 col mobile, 2 col large desktop */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 md:p-6">
            <div>
              <CardTitle className="text-base md:text-lg">Recent Cases</CardTitle>
              <CardDescription className="text-sm">Your latest service requests</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/end-user/cases")}
              className="w-full sm:w-auto"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {cases.length > 0 ? (
              <DataTable columns={casesColumns} data={cases.slice(0, 5)} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No cases yet. Browse services to get started!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 md:p-6">
            <div>
              <CardTitle className="text-base md:text-lg">Recent Payments</CardTitle>
              <CardDescription className="text-sm">Your latest transactions</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/end-user/payments")}
              className="w-full sm:w-auto"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {payments.length > 0 ? (
              <DataTable columns={paymentsColumns} data={payments.slice(0, 5)} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payments yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

