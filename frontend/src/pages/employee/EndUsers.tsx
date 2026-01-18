import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Eye, Briefcase, Filter, UserCheck, Building2, CheckCircle, Plus, CreditCard } from "lucide-react";
import { employeeService } from "@/services/employeeService";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/common/Input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

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
}

export default function EndUsers() {
    const [users, setUsers] = useState<EndUser[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceTagFilter, setSourceTagFilter] = useState("all");

    // Enroll Dialog State
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<EndUser | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");
    const [enrollNotes, setEnrollNotes] = useState("");

    // Create User Dialog State
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        serviceId: "",
    });

    // Payment Dialog State
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentEndUser, setPaymentEndUser] = useState<{ _id: string; name: string; email: string; phone: string } | null>(null);
    const [paymentService, setPaymentService] = useState<Service | null>(null);

    useEffect(() => {
        loadUsers();
        loadServices();
    }, [page, searchQuery, sourceTagFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getEndUsers({
                page,
                limit,
                search: searchQuery || undefined,
                sourceTag: sourceTagFilter !== "all" ? sourceTagFilter : undefined,
            });
            setUsers(response.data);
            setTotal(response.pagination.total);
        } catch (error) {
            toast.error("Failed to load end users");
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await employeeService.getServices();
            setServices(response.data);
        } catch (error) {
            console.error("Failed to load services:", error);
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
        setEnrollNotes("");
        setEnrollDialogOpen(true);
    };

    const handleProceedToPayment = () => {
        if (!selectedUser || !selectedServiceId) {
            toast.error("Please select a service");
            return;
        }
        const service = services.find(s => s._id === selectedServiceId);
        if (!service) return;

        setEnrollDialogOpen(false);
        setPaymentEndUser(selectedUser);
        setPaymentService(service);
        setPaymentDialogOpen(true);
    };

    const handlePaymentSuccess = (data: { case: any; payment: any }) => {
        toast.success(`${paymentEndUser?.name || 'User'} has been enrolled successfully!`);
        setPaymentDialogOpen(false);
        setPaymentEndUser(null);
        setPaymentService(null);
        setNewUserData({ name: "", email: "", password: "", phone: "", serviceId: "" });
        loadUsers();
    };

    const handleCreateUser = async () => {
        if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setCreating(true);
            // Create user without service first
            const response = await employeeService.createEndUser({
                name: newUserData.name,
                email: newUserData.email,
                password: newUserData.password,
                phone: newUserData.phone,
            });

            const createdUser = response.data.user;

            // If service selected, open payment dialog
            if (newUserData.serviceId) {
                const service = services.find(s => s._id === newUserData.serviceId);
                if (service) {
                    setCreateDialogOpen(false);
                    setPaymentEndUser({
                        _id: createdUser._id,
                        name: createdUser.name,
                        email: createdUser.email,
                        phone: createdUser.phone
                    });
                    setPaymentService(service);
                    setPaymentDialogOpen(true);
                    toast.success(`User ${newUserData.name} created! Complete payment to enroll.`);
                    return;
                }
            }

            // No service - just show success
            toast.success(`User ${newUserData.name} created successfully!`);
            setCreateDialogOpen(false);
            setNewUserData({ name: "", email: "", password: "", phone: "", serviceId: "" });
            loadUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create user");
        } finally {
            setCreating(false);
        }
    };

    const selectedCreateService = services.find(s => s._id === newUserData.serviceId);

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
                </div>
            ),
        },
    ];

    // Calculate stats
    const totalUsers = total;
    const activeUsers = users.filter(u => u.isActive).length;
    const usersWithCases = users.filter(u => u.casesCount > 0).length;

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
            {/* Page Header */}
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">End Users</h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        View all end users and enroll them in services.
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New User
                </Button>
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
                    title="Users with Cases"
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
                <DialogContent className="sm:max-w-[500px]">
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
                                <div className="flex-1">
                                    <p className="font-medium">{selectedUser?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                                </div>
                                {selectedUser && getSourceBadge(selectedUser.sourceTag, selectedUser.agentId?.name)}
                            </div>
                        </div>

                        {/* Service Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="service">Select Service *</Label>
                            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
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
                            disabled={!selectedServiceId}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New End User</DialogTitle>
                        <DialogDescription>
                            Register a new end user and optionally enroll them in a service.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={newUserData.name}
                                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    placeholder="9876543210"
                                    value={newUserData.phone}
                                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={newUserData.email}
                                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={newUserData.password}
                                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="createService">Enroll in Service (Optional)</Label>
                            <Select
                                value={newUserData.serviceId}
                                onValueChange={(val) => setNewUserData({ ...newUserData, serviceId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {services
                                        .filter(service => service._id && service._id.trim() !== '')
                                        .map((service) => (
                                            <SelectItem key={service._id} value={service._id}>
                                                {service.name} - ₹{service.price.toLocaleString()}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Confirmation */}
                        {selectedCreateService && (
                            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-700 dark:text-green-400">Payment will be recorded</AlertTitle>
                                <AlertDescription className="text-green-600 dark:text-green-300">
                                    A payment of ₹{selectedCreateService.price.toLocaleString()} will be automatically recorded.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateUser}
                            disabled={creating || !newUserData.name || !newUserData.email || !newUserData.password || !newUserData.phone}
                        >
                            {creating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <PaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                service={paymentService}
                endUserId={paymentEndUser?._id || ""}
                endUserName={paymentEndUser?.name}
                endUserEmail={paymentEndUser?.email}
                endUserPhone={paymentEndUser?.phone}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
