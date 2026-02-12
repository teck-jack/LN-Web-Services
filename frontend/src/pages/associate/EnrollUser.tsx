import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Column } from "@/components/common/DataTable";
import { ArrowLeft, CreditCard, User, Mail, Phone, CheckCircle2, Clock, XCircle } from "lucide-react";
import { associateService } from "@/services/associateService";
import { PaymentDialog } from "@/components/common/PaymentDialog";
import { toast } from "sonner";

interface UserDetails {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface Service {
    _id: string;
    name: string;
    type: string;
    description: string;
    price: number;
    duration: string;
}

interface EnrolledService {
    _id: string;
    caseId: string;
    service: {
        _id: string;
        name: string;
        type: string;
    };
    status: string;
    createdAt: string;
    payment: {
        amount: number;
        invoiceNumber: string;
        transactionId?: string;
    };
}

export default function EnrollUser() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    // User and services state
    const [user, setUser] = useState<UserDetails | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [enrolledServices, setEnrolledServices] = useState<EnrolledService[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
            fetchServices();
            fetchEnrolledServices();
        }
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            // Using the existing getOnboardedUsers endpoint with search
            const response = await associateService.getOnboardedUsers({ search: userId });
            if (response.data.data && response.data.data.length > 0) {
                setUser(response.data.data[0]);
            } else {
                toast.error("User not found");
                navigate("/associate/users");
            }
        } catch (error) {
            toast.error("Failed to fetch user details");
            navigate("/associate/users");
        }
    };

    const fetchServices = async () => {
        try {
            const response = await associateService.getServices();
            setServices(response.data.data || response.data);
        } catch (error) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolledServices = async () => {
        try {
            // This would need a new backend endpoint
            // For now, we'll use a placeholder
            // const response = await associateService.getUserEnrollments(userId);
            // setEnrolledServices(response.data);
            setEnrolledServices([]);
        } catch (error) {
            console.error("Failed to fetch enrolled services:", error);
        }
    };

    const handleServiceSelect = (serviceId: string) => {
        const service = services.find(s => s._id === serviceId);
        setSelectedService(service || null);
    };

    const handleEnrollClick = () => {
        if (!selectedService) {
            toast.error("Please select a service");
            return;
        }
        setPaymentDialogOpen(true);
    };

    const handlePaymentSuccess = (data: { case: any; payment: any }) => {
        toast.success(`${user?.name} enrolled successfully!`);
        setPaymentDialogOpen(false);
        setSelectedService(null);
        fetchEnrolledServices(); // Refresh enrollment history
    };

    const handlePaymentCancel = () => {
        setPaymentDialogOpen(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
            case "in_progress":
                return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
            case "new":
                return <Badge variant="secondary">New</Badge>;
            case "cancelled":
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const enrollmentColumns: Column<EnrolledService>[] = [
        {
            header: "Service Name",
            accessor: (row) => row.service.name,
        },
        {
            header: "Type",
            accessor: (row) => row.service.type,
        },
        {
            header: "Status",
            accessor: "status",
            cell: (row) => getStatusBadge(row.status),
        },
        {
            header: "Enrollment Date",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Amount Paid",
            accessor: (row) => `₹${row.payment.amount.toLocaleString()}`,
        },
        {
            header: "Case ID",
            accessor: "caseId",
            cell: (row) => (
                <span className="font-mono text-sm">{row.caseId}</span>
            ),
        },
    ];

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/associate/users")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Enroll User in Service</h1>
                    <p className="text-muted-foreground mt-2">Select a service and process payment to enroll the user</p>
                </div>
            </div>

            {/* User Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-semibold">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-semibold">{user.phone}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Service Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Enroll in New Service</CardTitle>
                    <CardDescription>Select a service to enroll this user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Service</label>
                        <Select value={selectedService?._id} onValueChange={handleServiceSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service._id} value={service._id}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <span>{service.name}</span>
                                            <Badge variant="secondary">₹{service.price.toLocaleString()}</Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedService && (
                        <div className="p-4 bg-muted rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg">{selectedService.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedService.description}</p>
                                </div>
                                <Badge variant="outline">{selectedService.type}</Badge>
                            </div>
                            <div className="flex gap-6 text-sm pt-2 border-t">
                                <div>
                                    <span className="text-muted-foreground">Price: </span>
                                    <span className="font-semibold text-lg">₹{selectedService.price.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Duration: </span>
                                    <span className="font-semibold">{selectedService.duration}</span>
                                </div>
                            </div>
                            <Button onClick={handleEnrollClick} className="w-full mt-4">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Proceed to Payment
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enrolled Services History */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Services History</CardTitle>
                    <CardDescription>All services this user is enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                    {enrolledServices.length > 0 ? (
                        <DataTable
                            columns={enrollmentColumns}
                            data={enrolledServices}
                            loading={false}
                            emptyMessage="No enrolled services yet"
                        />
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No enrolled services yet</p>
                            <p className="text-sm mt-2">Enroll this user in a service to see the history here</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <PaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                service={selectedService}
                endUserId={user._id}
                endUserName={user.name}
                endUserEmail={user.email}
                endUserPhone={user.phone}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
            />
        </div>
    );
}
