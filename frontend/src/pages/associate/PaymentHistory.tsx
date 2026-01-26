import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { Search, Filter, Download, IndianRupee, Users, TrendingUp, FileText } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { paymentHistoryService } from "@/services/paymentService";

const statusColors = {
    completed: "success",
    pending: "default",
    failed: "destructive",
    refunded: "secondary",
} as const;

export default function PaymentHistory() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    useEffect(() => {
        fetchPaymentHistory();
        fetchAnalytics();
    }, [page, statusFilter]);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit };

            if (statusFilter !== "all") params.status = statusFilter;
            if (searchQuery) params.searchQuery = searchQuery;

            const response = await paymentHistoryService.getPaymentHistory(params);
            setPayments(response.data.payments);
            setPagination(response.data.pagination);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch payment history");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await paymentHistoryService.getPaymentAnalytics();
            setAnalytics(response.data);
        } catch (error: any) {
            console.error("Failed to fetch analytics:", error);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchPaymentHistory();
    };

    const handleExport = async () => {
        try {
            toast.loading("Generating CSV...");
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;

            const blob = await paymentHistoryService.exportPaymentHistory(params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-payment-history-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success("Payment history exported successfully");
        } catch (error: any) {
            toast.dismiss();
            toast.error("Failed to export payment history");
        }
    };

    const columns = [
        {
            header: "Invoice",
            accessor: "invoiceNumber" as any,
            cell: (row: any) => (
                <div>
                    <span className="font-medium text-primary">{row.invoiceNumber || 'N/A'}</span>
                </div>
            ),
        },
        {
            header: "End User",
            accessor: (row: any) => row.caseId?.endUserId?.name || 'N/A',
            cell: (row: any) => (
                <div>
                    <p className="font-medium">{row.caseId?.endUserId?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{row.caseId?.endUserId?.email || ''}</p>
                </div>
            ),
        },
        {
            header: "Service",
            accessor: (row: any) => row.caseId?.serviceId?.name || 'N/A',
            cell: (row: any) => (
                <div>
                    <p className="font-medium">{row.caseId?.serviceId?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{row.caseId?.serviceId?.type || ''}</p>
                </div>
            ),
        },
        {
            header: "Case ID",
            accessor: (row: any) => row.caseId?.caseId,
            cell: (row: any) => (
                <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate(`/associate/cases/${row.caseId?._id}`)}
                >
                    {row.caseId?.caseId}
                </Button>
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
                    {row.discountAmount > 0 && (
                        <p className="text-xs text-green-600">-₹{row.discountAmount.toLocaleString()}</p>
                    )}
                </div>
            ),
        },
        {
            header: "Method",
            accessor: "paymentMethod" as any,
            cell: (row: any) => {
                const methodLabels: Record<string, { label: string; variant: string }> = {
                    'razorpay': { label: 'Razorpay', variant: 'default' },
                    'cash': { label: 'Cash', variant: 'secondary' },
                    'test_payment': { label: 'Test', variant: 'outline' },
                };
                const method = methodLabels[row.paymentMethod] || { label: row.paymentMethod, variant: 'outline' };
                return (
                    <Badge variant={method.variant as any} className="capitalize">
                        {method.label}
                    </Badge>
                );
            },
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
            header: "Date",
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
    ];

    if (loading && !analytics) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Payment History</h1>
                    <p className="text-muted-foreground mt-2">Track payments from users you enrolled</p>
                </div>
                <Button onClick={handleExport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Revenue Generated</CardTitle>
                            <IndianRupee className="h-5 w-5 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                From {analytics.totalPayments} enrollments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Users Enrolled</CardTitle>
                            <Users className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.enrolledUsersCount || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Unique end users
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
                            <TrendingUp className="h-5 w-5 text-info" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{Math.round(analytics.averageRevenuePerUser || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Per enrolled user
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by transaction ID, case ID, invoice..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleSearch} variant="secondary">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                </Button>
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

            {/* Payment Table */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={payments}
                        pagination={pagination}
                        onPageChange={setPage}
                    />

                    {payments.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No payments found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Payments from users you enroll will appear here
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
