import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/common/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Column } from "@/components/common/DataTable";
import { FileText, Download, Search, Calendar, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { agentService } from "@/services/agentService";
import { toast } from "sonner";

interface Enrollment {
    _id: string;
    caseId: string;
    endUser: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    service: {
        _id: string;
        name: string;
        type: string;
    };
    payment: {
        amount: number;
        status: string;
        method: string;
        transactionId?: string;
        invoiceNumber: string;
    };
    createdAt: string;
    status: string;
}

interface Statistics {
    totalEnrollments: number;
    totalRevenue: number;
    thisMonthEnrollments: number;
    pendingPayments: number;
}

export default function EnrollmentHistory() {
    const navigate = useNavigate();

    // Data state
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [statistics, setStatistics] = useState<Statistics>({
        totalEnrollments: 0,
        totalRevenue: 0,
        thisMonthEnrollments: 0,
        pendingPayments: 0,
    });

    // Filter state
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        fetchEnrollments();
    }, [pagination.page, serviceFilter, statusFilter]);

    const fetchServices = async () => {
        try {
            const response = await agentService.getServices();
            if (response.success) {
                setServices(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch services");
        }
    };

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await agentService.getEnrollmentHistory({
                page: pagination.page,
                limit: pagination.limit,
                serviceId: serviceFilter !== 'all' ? serviceFilter : undefined,
                paymentStatus: statusFilter !== 'all' ? statusFilter : undefined,
                search: search,
            });

            if (response.success) {
                setEnrollments(response.data.enrollments);
                setStatistics(response.data.statistics);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total
                }));
            }
        } catch (error) {
            toast.error("Failed to fetch enrollment history");
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        fetchEnrollments();
    };

    const handleViewReceipt = (caseId: string) => {
        navigate(`/agent/receipt/${caseId}`);
    };

    const handleExport = () => {
        if (!enrollments.length) {
            toast.error("No data to export");
            return;
        }

        const headers = ["Case ID", "User Name", "Service", "Enrollment Date", "Amount", "Payment Status", "Payment Method"];
        const csvContent = [
            headers.join(","),
            ...enrollments.map(row => [
                row.caseId,
                `"${row.endUser.name}"`,
                `"${row.service.name}"`,
                new Date(row.createdAt).toLocaleDateString(),
                row.payment.amount,
                row.payment.status,
                row.payment.method
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `enrollment_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export completed successfully");
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="success">Paid</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: Column<Enrollment>[] = [
        {
            header: "User Name",
            accessor: (row) => row.endUser.name,
        },
        {
            header: "Service",
            accessor: (row) => row.service.name,
            cell: (row) => (
                <div>
                    <p className="font-medium">{row.service.name}</p>
                    <p className="text-xs text-muted-foreground">{row.service.type}</p>
                </div>
            ),
        },
        {
            header: "Enrollment Date",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Amount",
            accessor: (row) => `₹${row.payment.amount.toLocaleString()}`,
        },
        {
            header: "Payment Status",
            accessor: (row) => row.payment.status,
            cell: (row) => getPaymentStatusBadge(row.payment.status),
        },
        {
            header: "Payment Method",
            accessor: (row) => row.payment.method,
            cell: (row) => (
                <span className="capitalize">{row.payment.method}</span>
            ),
        },
        {
            header: "Actions",
            accessor: "_id",
            cell: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(row.caseId)}
                    >
                        <FileText className="h-4 w-4 mr-1" />
                        Receipt
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Enrollment History</h1>
                <p className="text-muted-foreground mt-2">
                    View all service enrollments and generate receipts
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">All time enrollments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{statistics.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total earnings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.thisMonthEnrollments}</div>
                        <p className="text-xs text-muted-foreground">Enrollments this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.pendingPayments}</div>
                        <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter enrollments by various criteria</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search User</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch} size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Service</label>
                            <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Services" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    {services.map((service) => (
                                        <SelectItem key={service._id} value={service._id}>
                                            {service.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Actions</label>
                            <Button variant="outline" className="w-full" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enrollments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Enrollments</CardTitle>
                    <CardDescription>Complete list of service enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={enrollments}
                        loading={loading}
                        emptyMessage="No enrollments found"
                        pagination={{
                            page: pagination.page,
                            limit: pagination.limit,
                            total: pagination.total,
                        }}
                        onPageChange={(page) => setPagination({ ...pagination, page })}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
