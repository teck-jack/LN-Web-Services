import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCases } from "@/store/slices/endUserSlice";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { Search, Filter, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  new: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

export default function Cases() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cases, loading, pagination } = useAppSelector((state) => state.endUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const params: any = { page, limit };
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    dispatch(getCases(params));
  }, [dispatch, page, limit, statusFilter]);

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      (caseItem.caseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.serviceId?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const columns = [
    {
      header: "Case ID",
      accessor: "caseId" as any,
      cell: (row: any) => <span className="font-medium">{row.caseId}</span>,
    },
    {
      header: "Service",
      accessor: (row: any) => row.serviceId?.name || "N/A",
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.serviceId?.name || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{row.serviceId?.type?.replace("_", " ") || "N/A"}</p>
        </div>
      ),
    },
    {
      header: "Assigned Employee",
      accessor: (row: any) => row.employeeId?.name || "Not assigned",
      cell: (row: any) =>
        row.employeeId ? (
          <div>
            <p className="font-medium">{row.employeeId.name}</p>
            <p className="text-xs text-muted-foreground">{row.employeeId.email}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        ),
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
      header: "Progress",
      accessor: "currentStep" as any,
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${(row.currentStep / (row.serviceId?.processSteps?.length || 1)) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Step {row.currentStep}/{row.serviceId?.processSteps?.length || 1}
          </span>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt" as any,
      cell: (row: any) => row.createdAt ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true }) : "N/A",
    },
    {
      header: "Actions",
      accessor: "_id" as any,
      cell: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/end-user/cases/${row._id}`)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cases</h1>
          <p className="text-muted-foreground mt-2">Track all your service requests and their progress</p>
        </div>
        <Button onClick={() => navigate("/end-user/services")}>Browse Services</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by case ID or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
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

      <DataTable
        columns={columns}
        data={filteredCases}
        pagination={{
          page: pagination.cases.page,
          limit: pagination.cases.limit,
          total: pagination.cases.total,
        }}
        onPageChange={setPage}
      />

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No cases found</p>
        </div>
      )}
    </div>
  );
}
