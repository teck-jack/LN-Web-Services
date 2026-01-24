import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Eye, Briefcase, Filter, UserCheck, Building2, CreditCard, Trash2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { PaymentDialog } from "@/components/common/PaymentDialog";
import { StatsCard } from "@/components/common/StatsCard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface EndUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    sourceTag: string;
    agentId?: { _id: string; name: string };
    casesCount: number;
    activeCasesCount: number;
    hasActiveCase: boolean;
}

interface Service {
    _id: string;
    name: string;
    type: string;
    description: string;
    price: number;
    duration: string;
    isActive: boolean;
}

interface Employee {
    _id: string;
    name: string;
    email: string;
}

interface Stats {
    totalEndUsers: number;
    activeEndUsers: number;
    sourceStats: Array<{ _id: string; count: number }>;
}

export default function EndUsers() {
    const [users, setUsers] = useState<EndUser[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceTagFilter, setSourceTagFilter] = useState("all");
    const [hasCaseFilter, setHasCaseFilter] = useState("all");

    // Enroll Dialog State
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<EndUser | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [enrollNotes, setEnrollNotes] = useState("");
    const [enrollmentWarning, setEnrollmentWarning] = useState<string | null>(null);

    // Payment Dialog State
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    // Delete Dialog State
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: EndUser | null }>({
        open: false,
        user: null,
    });

    useEffect(() => {
        loadUsers();
        loadServices();
        loadEmployees();
    }, [page, searchQuery, sourceTagFilter, hasCaseFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getEndUsers({
                page,
                limit,
                search: searchQuery || undefined,
                sourceTag: sourceTagFilter !== "all" ? sourceTagFilter : undefined,
                hasCase: hasCaseFilter !== "all" ? hasCaseFilter : undefined,
            });
            setUsers(response.data);
            setTotal(response.pagination.total);
            setStats(response.stats);
        } catch (error) {
            toast.error("Failed to load end users");
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await adminService.getServices();
            // Only show active services
            setServices(response.data.filter((s: Service) => s.isActive));
        } catch (error) {
            console.error("Failed to load services:", error);
        }
    };

    const loadEmployees = async () => {
        try {
            const response = await adminService.getUsers({ role: 'employee' });
            setEmployees(response.data.filter((e: any) => e.isActive));
        } catch (error) {
            console.error("Failed to load employees:", error);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const openEnrollDialog = (user: EndUser) => {
        setSelectedUser(user);
        setSelectedServiceId("");
        setSelectedEmployeeId("");
        setEnrollNotes("");
        setEnrollmentWarning(null);
        setEnrollDialogOpen(true);
    };

    const handleServiceChange = async (serviceId: string) => {
        setSelectedServiceId(serviceId);
        setEnrollmentWarning(null);

        if (selectedUser && serviceId) {
            try {
                const result = await adminService.checkActiveEnrollment(selectedUser._id, serviceId);
                if (result.hasActiveEnrollment) {
                    setEnrollmentWarning(
                        `Warning: User already has an active case (${result.existingCase.caseId}) for ${result.existingCase.serviceName}`
                    );
                }
            } catch (error) {
                // Ignore error, just means we can't check
            }
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedUser || !selectedServiceId) {
            toast.error("Please select a service");
            return;
        }
        // Close enroll dialog and open payment dialog
        setEnrollDialogOpen(false);
        setPaymentDialogOpen(true);
    };

    const handlePaymentSuccess = (data: { case: any; payment: any }) => {
        toast.success(`${selectedUser?.name} has been enrolled successfully!`);
        setPaymentDialogOpen(false);
        loadUsers(); // Refresh to update case counts
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirm.user) return;
        try {
            await adminService.deleteUser(deleteConfirm.user._id);
            toast.success("End user deleted successfully");
            setDeleteConfirm({ open: false, user: null });
            loadUsers();
        } catch (error) {
            toast.error("Failed to delete end user");
        }
    };

    const getSourceBadge = (sourceTag: string, agentName?: string) => {
        switch (sourceTag) {
            case "self":
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" className="gap-1">
                                    <UserCheck className="h-3 w-3" />
                                    Self
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Self-registered user</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case "agent":
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="secondary" className="gap-1">
                                    <Users className="h-3 w-3" />
                                    Agent
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Onboarded by agent: {agentName || "Unknown"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case "admin_direct":
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="default" className="gap-1">
                                    <Building2 className="h-3 w-3" />
                                    Admin
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Registered by Admin</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            case "employee":
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="secondary" className="gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    Employee
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Enrolled by Employee</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            default:
                return <Badge variant="outline">{sourceTag}</Badge>;
        }
    };

    const selectedService = services.find(s => s._id === selectedServiceId);

    const columns: Column<EndUser>[] = [
        {
            header: "Name",
            accessor: "name",
            mobileLabel: "Name",
        },
        {
            header: "Email",
            accessor: "email",
            mobileLabel: "Email",
            hideOnMobile: true,
        },
        {
            header: "Phone",
            accessor: "phone",
            mobileLabel: "Phone",
            hideOnMobile: true,
        },
        {
            header: "Source",
            accessor: "sourceTag",
            cell: (row) => getSourceBadge(row.sourceTag, row.agentId?.name),
        },
        {
            header: "Status",
            accessor: "isActive",
            cell: (row) => (
                <Badge variant={row.isActive ? "success" : "destructive"}>
                    {row.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            header: "Cases",
            accessor: "casesCount",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline">
                        {row.casesCount} {row.casesCount === 1 ? "case" : "cases"}
                    </Badge>
                    {row.hasActiveCase && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                </div>
            ),
        },
        {
            header: "Registered",
            accessor: (row) => row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "N/A",
            hideOnMobile: true,
        },
        {
            header: "Actions",
            accessor: "_id",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => openEnrollDialog(row)}
                    >
                        <UserPlus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Enroll</span>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ open: true, user: row })}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Delete</span>
                    </Button>
                </div>
            ),
        },
    ];

    // Calculate stats from response
    const totalUsers = stats?.totalEndUsers || 0;
    const activeUsers = stats?.activeEndUsers || 0;
    const usersWithCases = users.filter(u => u.casesCount > 0).length;

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
            {/* Page Header */}
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">End Users</h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        Manage all end users and enroll them in services directly.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
                <StatsCard
                    title="Total End Users"
                    value={totalUsers}
                    icon={Users}
                    iconColor="text-primary"
                />
                <StatsCard
                    title="Active Users"
                    value={activeUsers}
                    icon={Eye}
                    iconColor="text-success"
                />
                <StatsCard
                    title="Users with Active Cases"
                    value={usersWithCases}
                    icon={Briefcase}
                    iconColor="text-warning"
                />
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base md:text-lg">All End Users</CardTitle>
                            <CardDescription className="text-sm">
                                View and enroll end users in services
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={sourceTagFilter} onValueChange={(val) => { setSourceTagFilter(val); setPage(1); }}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="self">Self Registered</SelectItem>
                                    <SelectItem value="agent">By Agent</SelectItem>
                                    <SelectItem value="admin_direct">By Admin</SelectItem>
                                    <SelectItem value="employee">By Employee</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={hasCaseFilter} onValueChange={(val) => { setHasCaseFilter(val); setPage(1); }}>
                                <SelectTrigger className="w-[140px]">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Cases" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="true">Has Cases</SelectItem>
                                    <SelectItem value="false">No Cases</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No End Users Found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery
                                    ? "No users match your search criteria."
                                    : "No end users have been registered yet."}
                            </p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={users}
                            onSearch={handleSearch}
                            pagination={{
                                page,
                                limit,
                                total,
                            }}
                            onPageChange={handlePageChange}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Enroll Dialog */}
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Enroll User in Service</DialogTitle>
                        <DialogDescription>
                            Select a service to enroll {selectedUser?.name} and create a new case.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* User Info */}
                        <div className="p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{selectedUser?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                                </div>
                                {selectedUser && getSourceBadge(selectedUser.sourceTag, selectedUser.agentId?.name)}
                            </div>
                        </div>

                        {/* Service Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="service">Select Service *</Label>
                            <Select value={selectedServiceId} onValueChange={handleServiceChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a service..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No services available
                                        </div>
                                    ) : (
                                        services
                                            .filter(service => service._id && service._id.trim() !== '')
                                            .map((service) => (
                                                <SelectItem key={service._id} value={service._id}>
                                                    {service.name} - ₹{service.price.toLocaleString()}
                                                </SelectItem>
                                            ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Enrollment Warning */}
                        {enrollmentWarning && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {enrollmentWarning}
                            </div>
                        )}

                        {/* Selected Service Details */}
                        {selectedService && (
                            <div className="p-4 rounded-lg border bg-card">
                                <h4 className="font-medium mb-2">{selectedService.name}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{selectedService.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Price:</span>
                                    <span className="font-semibold text-primary">₹{selectedService.price.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span>{selectedService.duration}</span>
                                </div>
                            </div>
                        )}

                        {/* Employee Assignment (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="employee">Assign to Employee (Optional)</Label>
                            <Select
                                value={selectedEmployeeId || "none"}
                                onValueChange={(val) => setSelectedEmployeeId(val === "none" ? "" : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Auto-assign later..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Auto-assign later</SelectItem>
                                    {employees
                                        .filter(employee => employee._id && employee._id.trim() !== '')
                                        .map((employee) => (
                                            <SelectItem key={employee._id} value={employee._id}>
                                                {employee.name}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any initial notes for this case..."
                                value={enrollNotes}
                                onChange={(e) => setEnrollNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEnrollDialogOpen(false)}
                            disabled={enrolling}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleProceedToPayment}
                            disabled={!selectedServiceId || !!enrollmentWarning}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <PaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                service={selectedService || null}
                endUserId={selectedUser?._id || ""}
                endUserName={selectedUser?.name}
                endUserEmail={selectedUser?.email}
                endUserPhone={selectedUser?.phone}
                onSuccess={handlePaymentSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, user: open ? deleteConfirm.user : null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete End User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete <strong>{deleteConfirm.user?.name}</strong>? This action will remove the user from the database and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
