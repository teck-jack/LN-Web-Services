import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/common/DataTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { UserPlus, Shield, ShieldOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'associate' | 'employee' | 'end_user';
  sourceTag?: 'self' | 'agent' | 'admin_direct';
  isActive: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ role: 'all', sourceTag: 'all', search: '' });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'end_user',
    phone: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role === 'all' ? undefined : filters.role,
        sourceTag: filters.sourceTag === 'all' ? undefined : filters.sourceTag,
        search: filters.search,
      });
      setUsers(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await adminService.deactivateUser(userId);
        toast.success("User deactivated successfully");
      } else {
        await adminService.activateUser(userId);
        toast.success("User activated successfully");
      }
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await adminService.createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phone: newUser.phone || undefined,
      });
      toast.success("User created successfully");
      setShowAddDialog(false);
      setNewUser({ name: '', email: '', password: '', role: 'end_user', phone: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setSubmitting(false);
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
      accessor: (row) => row.phone || "N/A",
    },
    {
      header: "Role",
      accessor: "role",
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: "Source",
      accessor: (row) => row.sourceTag || "N/A",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.sourceTag?.replace('_', ' ') || "N/A"}
        </Badge>
      ),
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
          onClick={() => handleToggleStatus(row._id, row.isActive)}
          className="gap-2"
        >
          {row.isActive ? (
            <>
              <ShieldOff className="h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Activate
            </>
          )}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage all users in the system.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage all registered users</CardDescription>
          <div className="flex gap-4 mt-4">
            {/* Role Filter */}
            <Select
              value={filters.role ?? "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, role: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="end_user">End User</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select
              value={filters.sourceTag ?? "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, sourceTag: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin_direct">Admin Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onSearch={(query) => setFilters({ ...filters, search: query })}
            searchPlaceholder="Search by name or email..."
          />
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end_user">End User</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
