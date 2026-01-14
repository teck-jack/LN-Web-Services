import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { associateService } from "@/services/associateService";
import { toast } from "sonner";

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    caseStatus?: string;
    createdAt: string;
}

export default function OnboardedUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });

    const fetchUsers = async (page = 1, status = statusFilter, search = "") => {
        try {
            setLoading(true);
            const params: any = { page, limit: 10 };
            if (status !== "all") params.status = status;
            if (search) params.search = search;

            const response = await associateService.getOnboardedUsers(params);
            setUsers(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePageChange = (page: number) => {
        fetchUsers(page, statusFilter);
    };

    const handleSearch = (query: string) => {
        fetchUsers(1, statusFilter, query);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        fetchUsers(1, value);
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="success">Completed</Badge>;
            case "in_progress":
                return <Badge variant="default">In Progress</Badge>;
            case "new":
                return <Badge variant="secondary">New</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">No Case</Badge>;
        }
    };

    const columns: Column<User>[] = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header: "Email",
            accessor: "email",
        },
        {
            header: "Phone",
            accessor: "phone",
        },
        {
            header: "Case Status",
            accessor: "caseStatus",
            cell: (row) => getStatusBadge(row.caseStatus),
        },
        {
            header: "Created Date",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboarded Users</h1>
                    <p className="text-muted-foreground mt-2">Manage users you've onboarded</p>
                </div>
                <Button onClick={() => navigate("/associate/users/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                    <CardDescription>View and manage all users you've onboarded</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="no_case">No Case</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DataTable
                        columns={columns}
                        data={users}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        searchPlaceholder="Search by name or email..."
                        emptyMessage="No users found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
