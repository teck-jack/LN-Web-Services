import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/common/DataTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { couponService, Coupon, CreateCouponData } from "@/services/couponService";
import { toast } from "sonner";
import { Plus, Percent, Calendar, Users, TrendingUp, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function CouponManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newCoupon, setNewCoupon] = useState<CreateCouponData>({
        code: "",
        description: "",
        discountPercentage: 10,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxTotalUses: null,
        maxUsesPerUser: 1,
        isActive: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, [pagination.page, statusFilter]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await couponService.getCoupons({
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter === "all" ? undefined : statusFilter,
            });
            setCoupons(response.data || []);
            setPagination({
                page: response.pagination?.page || 1,
                limit: response.pagination?.limit || 10,
                total: response.pagination?.total || 0,
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discountPercentage) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (newCoupon.discountPercentage < 1 || newCoupon.discountPercentage > 100) {
            toast.error("Discount percentage must be between 1 and 100");
            return;
        }

        if (new Date(newCoupon.validTo) <= new Date(newCoupon.validFrom)) {
            toast.error("End date must be after start date");
            return;
        }

        try {
            setSubmitting(true);
            const response = await couponService.createCoupon(newCoupon);
            // Optimistic update - add new coupon to list
            setCoupons([response.data, ...coupons]);
            setPagination(prev => ({ ...prev, total: prev.total + 1 }));
            toast.success("Coupon created successfully");
            setShowCreateDialog(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to create coupon");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCoupon = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to deactivate coupon "${code}"?`)) {
            return;
        }
        const previousCoupons = [...coupons];

        // Optimistic update - mark as inactive immediately
        setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: false } : c));

        try {
            await couponService.deleteCoupon(id);
            toast.success("Coupon deactivated successfully");
        } catch (error: any) {
            // Rollback on error
            setCoupons(previousCoupons);
            toast.error(error.message || "Failed to deactivate coupon");
        }
    };

    const resetForm = () => {
        setNewCoupon({
            code: "",
            description: "",
            discountPercentage: 10,
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            maxTotalUses: null,
            maxUsesPerUser: 1,
            isActive: true,
        });
    };

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewCoupon({ ...newCoupon, code });
    };

    const columns: Column<Coupon>[] = [
        {
            header: "Code",
            accessor: "code",
            cell: (row) => (
                <span className="font-mono font-semibold text-primary">{row.code}</span>
            ),
        },
        {
            header: "Discount",
            accessor: "discountPercentage",
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{row.discountPercentage}%</span>
                </div>
            ),
        },
        {
            header: "Valid Period",
            accessor: (row) => `${new Date(row.validFrom).toLocaleDateString()} - ${new Date(row.validTo).toLocaleDateString()}`,
            cell: (row) => (
                <div className="text-sm">
                    <div>{new Date(row.validFrom).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">to {new Date(row.validTo).toLocaleDateString()}</div>
                </div>
            ),
        },
        {
            header: "Usage",
            accessor: "currentUses",
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {row.currentUses} / {row.maxTotalUses === null ? "∞" : row.maxTotalUses}
                    </span>
                </div>
            ),
        },
        {
            header: "Status",
            accessor: "isActive",
            cell: (row) => {
                const isExpired = new Date(row.validTo) < new Date();
                if (isExpired) {
                    return <Badge variant="secondary">Expired</Badge>;
                }
                return (
                    <Badge variant={row.isActive ? "success" : "destructive"}>
                        {row.isActive ? "Active" : "Inactive"}
                    </Badge>
                );
            },
        },
        {
            header: "Created",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Actions",
            accessor: "_id",
            cell: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCoupon(row._id, row.code)}
                    className="gap-2 text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    Deactivate
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
                    <p className="text-muted-foreground mt-2">Create and manage discount coupons for services.</p>
                </div>
                <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                    <CardDescription>View and manage discount coupons</CardDescription>
                    <div className="flex gap-4 mt-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Coupons</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={coupons}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page) => setPagination({ ...pagination, page })}
                    />
                </CardContent>
            </Card>

            {/* Create Coupon Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                        <DialogDescription>
                            Create a discount coupon that users can apply during payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Coupon Code *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    placeholder="SAVE20"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    className="font-mono"
                                />
                                <Button type="button" variant="outline" onClick={generateCode}>
                                    Generate
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="20% off on all services"
                                value={newCoupon.description}
                                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="discount">Discount Percentage * (1-100)</Label>
                            <Input
                                id="discount"
                                type="number"
                                min="1"
                                max="100"
                                placeholder="10"
                                value={newCoupon.discountPercentage}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="validFrom">Valid From *</Label>
                                <Input
                                    id="validFrom"
                                    type="date"
                                    value={newCoupon.validFrom as string}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="validTo">Valid To *</Label>
                                <Input
                                    id="validTo"
                                    type="date"
                                    value={newCoupon.validTo as string}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, validTo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="maxTotal">Max Total Uses (leave empty for unlimited)</Label>
                                <Input
                                    id="maxTotal"
                                    type="number"
                                    min="1"
                                    placeholder="100"
                                    value={newCoupon.maxTotalUses || ""}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, maxTotalUses: e.target.value ? parseInt(e.target.value) : null })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxPerUser">Max Uses Per User *</Label>
                                <Input
                                    id="maxPerUser"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={newCoupon.maxUsesPerUser}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUsesPerUser: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="active">Active</Label>
                            <Switch
                                id="active"
                                checked={newCoupon.isActive}
                                onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCoupon} disabled={submitting}>
                            {submitting ? "Creating..." : "Create Coupon"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
