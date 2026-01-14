import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/common/DataTable";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Case {
  _id: string;
  caseId: string;
  endUserId: {
    name: string;
    email: string;
  };
  employeeId?: {
    name: string;
  };
  serviceId: {
    name: string;
    type: string;
  };
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  currentStep: number;
  createdAt: string;
}

export default function CaseManagement() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: 'all', search: '' });

  useEffect(() => {
    fetchCases();
  }, [pagination.page, filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCases({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.search,
      });
      setCases(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    try {
      await adminService.autoAssignCases();
      toast.success("Cases auto-assigned successfully");
      fetchCases();
    } catch (error: any) {
      toast.error(error.message || "Failed to auto-assign cases");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const columns: Column<Case>[] = [
    {
      header: "Case ID",
      accessor: "caseId",
      mobileLabel: "ID"
    },
    {
      header: "End User",
      accessor: (row) => row.endUserId?.name || "N/A",
      mobileLabel: "User",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.endUserId?.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground hidden md:block">{row.endUserId?.email || "N/A"}</div>
        </div>
      ),
    },

    {
      header: "Service",
      accessor: (row) => row.serviceId?.name || "N/A",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.serviceId?.name || "N/A"}</div>
          <Badge variant="outline" className="capitalize mt-1">
            {row.serviceId?.type || "N/A"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Assigned To",
      accessor: (row) => row.employeeId?.name || "Unassigned",
      mobileLabel: "Assigned",
      cell: (row) => (
        <span className={!row.employeeId ? "text-muted-foreground" : ""}>
          {row.employeeId?.name || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <Badge variant={getStatusColor(row.status) as any} className="capitalize">
          {row.status?.replace('_', ' ') || "Unknown"}
        </Badge>
      ),
    },
    {
      header: "Step",
      accessor: "currentStep",
      hideOnMobile: true, // Hide on mobile to reduce clutter
    },
    {
      header: "Created",
      accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
      hideOnMobile: true, // Hide on mobile to reduce clutter
    },
    {
      header: "Actions",
      accessor: "_id",
      mobileLabel: "Action",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/cases/${row._id}`)}
          className="w-full md:w-auto"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header - Responsive */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Case Management</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage all service cases and assignments.</p>
        </div>
        <Button
          onClick={handleAutoAssign}
          className="w-full gap-2 sm:w-auto"
          size="default"
        >
          <Zap className="h-4 w-4" />
          <span>Auto Assign Cases</span>
        </Button>
      </div>

      {/* Card Container */}
      <Card>
        <CardHeader className="space-y-1 p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">All Cases</CardTitle>
          <CardDescription className="text-sm">View and manage all service cases</CardDescription>

          {/* Filters - Responsive */}
          <div className="pt-4">
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-full sm:w-[200px] h-11 md:h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <DataTable
            columns={columns}
            data={cases}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onSearch={(query) => setFilters({ ...filters, search: query })}
            searchPlaceholder="Search by case ID or user name..."

          />
        </CardContent>
      </Card>
    </div>
  );
}

