import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPayments } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { Search, Filter, Download, DollarSign, CreditCard, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const statusColors = {
  completed: "success",
  pending: "default",
  failed: "destructive",
  refunded: "secondary",
} as const;

export default function Payments() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { payments, loading, pagination } = useAppSelector((state) => state.endUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(getPayments({ page, limit }));
  }, [dispatch, page, limit]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.caseId.caseId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = payments.filter((p) => p.status === "completed").length;
  const lastPayment = payments.length > 0 ? payments[0] : null;

  const columns = [
    {
      header: "Transaction ID",
      accessor: "transactionId" as any,
      cell: (row: any) => <span className="font-medium">{row.transactionId}</span>,
    },
    {
      header: "Case ID",
      accessor: (row: any) => row.caseId.caseId,
      cell: (row: any) => (
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => navigate(`/end-user/cases/${row.caseId._id}`)}
        >
          {row.caseId.caseId}
        </Button>
      ),
    },
    {
      header: "Discount",
      accessor: (row: any) => row.discountAmount || 0,
      cell: (row: any) => (
        row.discountAmount > 0 ? (
          <div className="text-sm">
            <p className="font-medium text-green-600">-₹{row.discountAmount.toLocaleString()}</p>
            {row.couponCode && (
              <p className="text-xs text-muted-foreground font-mono">{row.couponCode}</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      header: "Amount",
      accessor: "amount" as any,
      cell: (row: any) => (
        <div className="text-sm">
          {row.originalAmount && row.originalAmount !== row.amount && (
            <p className="text-xs text-muted-foreground line-through">
              ₹{row.originalAmount.toLocaleString()}
            </p>
          )}
          <span className="font-semibold">₹{row.amount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: "Payment Method",
      accessor: "paymentMethod" as any,
      cell: (row: any) => (
        <Badge variant="outline">{row.paymentMethod.toUpperCase()}</Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status" as any,
      cell: (row: any) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors]}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Payment Date",
      accessor: "paymentDate" as any,
      cell: (row: any) => (
        <div>
          <p className="font-medium">{format(new Date(row.paymentDate), "MMM dd, yyyy")}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(row.paymentDate), { addSuffix: true })}
          </p>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "_id" as any,
      cell: (row: any) => (
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Receipt
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-2">View all your transactions and download receipts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Amount Paid</CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <Calendar className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastPayment
                ? formatDistanceToNow(new Date(lastPayment.paymentDate), { addSuffix: true })
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID or case ID..."
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        pagination={{
          page: pagination.payments.page,
          limit: pagination.payments.limit,
          total: pagination.payments.total,
        }}
        onPageChange={setPage}
      />

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No payments found</p>
        </div>
      )}
    </div>
  );
}
