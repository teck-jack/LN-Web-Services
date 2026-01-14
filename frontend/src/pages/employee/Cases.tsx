import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCases, setLoading, setCasesPagination } from "@/store/slices/employeeSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Case {
  _id: string;
  caseId: string;
  endUserId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  serviceId: {
    _id: string;
    name: string;
    type: string;
  };
  status: string;
  currentStep?: number;
  createdAt: string;
}

const statusColors = {
  new: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

export default function EmployeeCases() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cases, loading, pagination } = useAppSelector((state) => state.employee);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCases();
  }, [pagination.cases.page, pagination.cases.limit, statusFilter, searchQuery]);

  const loadCases = async () => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getAssignedCases({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: pagination.cases.page,
        limit: pagination.cases.limit,
        search: searchQuery || undefined,
      });
      dispatch(setCases({ data: response.data, total: response.count }));
    } catch (error) {
      toast.error("Failed to load cases");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(setCasesPagination({ page: 1, limit: pagination.cases.limit }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCasesPagination({ page, limit: pagination.cases.limit }));
  };

  const columns: Column<Case>[] = [
    {
      header: "Case ID",
      accessor: "caseId",
    },
    {
      header: "End User",
      accessor: (row) => row.endUserId?.name || "N/A",
    },
    {
      header: "Contact",
      accessor: (row) => row.endUserId?.email || "N/A",
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
      header: "Progress",
      accessor: "currentStep",
      cell: (row) => {
        if (!row.currentStep) return <span className="text-muted-foreground">Not started</span>;
        const percentage = row.status === "completed" ? 100 : (row.currentStep / 4) * 100;
        return (
          <div className="space-y-1">
            <Progress value={percentage} className="h-2 w-24" />
            <span className="text-xs text-muted-foreground">Step {row.currentStep}</span>
          </div>
        );
      },
    },
    {
      header: "Created",
      accessor: (row) => row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "N/A",
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/employee/cases/${row._id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assigned Cases</h1>
        <p className="text-muted-foreground mt-2">Manage and track all your assigned cases.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Cases</CardTitle>
              <CardDescription>All cases assigned to you</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={cases as Case[]}
              onSearch={handleSearch}
              pagination={{
                page: pagination.cases.page,
                limit: pagination.cases.limit,
                total: pagination.cases.total,
              }}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
