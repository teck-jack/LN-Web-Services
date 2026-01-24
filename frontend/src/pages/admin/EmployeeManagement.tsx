import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/common/DataTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/common/Input";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { UserPlus, Edit, Trash2, Shield, ShieldOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  assignedModules?: string[];
  isActive: boolean;
  createdAt: string;
}

const modules = ["trademark", "copyright", "patent", "design", "gst"];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    assignedModules: [] as string[],
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        role: 'employee',
        page: pagination.page,
        limit: pagination.limit,
      });
      setEmployees(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Update existing employee - optimistic update
        const response = await adminService.updateEmployee(editingEmployee._id, formData);
        setEmployees(employees.map(emp =>
          emp._id === editingEmployee._id ? { ...emp, ...response.data } : emp
        ));
        toast.success("Employee updated successfully");
      } else {
        // Create new employee - optimistic update
        const response = await adminService.createEmployee(formData);
        setEmployees([response.data, ...employees]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        toast.success("Employee created successfully");
      }
      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({ name: "", email: "", password: "", phone: "", assignedModules: [] });
    } catch (error: any) {
      toast.error(error.message || (editingEmployee ? "Failed to update employee" : "Failed to create employee"));
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      phone: employee.phone || "",
      assignedModules: employee.assignedModules || [],
    });
    setIsDialogOpen(true);
  };

  const toggleModule = (module: string) => {
    setFormData(prev => ({
      ...prev,
      assignedModules: prev.assignedModules.includes(module)
        ? prev.assignedModules.filter(m => m !== module)
        : [...prev.assignedModules, module]
    }));
  };

  const handleToggleStatus = async (employee: Employee) => {
    const previousEmployees = [...employees];

    // Optimistic update - toggle status immediately
    setEmployees(employees.map(emp =>
      emp._id === employee._id ? { ...emp, isActive: !emp.isActive } : emp
    ));

    try {
      if (employee.isActive) {
        await adminService.deactivateUser(employee._id);
        toast.success("Employee deactivated successfully");
      } else {
        await adminService.activateUser(employee._id);
        toast.success("Employee activated successfully");
      }
    } catch (error: any) {
      // Rollback on error
      setEmployees(previousEmployees);
      toast.error(error.message || "Failed to update employee status");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.employee) return;
    const deletedEmployeeId = deleteConfirm.employee._id;
    const previousEmployees = [...employees];

    // Optimistic update - remove from UI immediately
    setEmployees(employees.filter(emp => emp._id !== deletedEmployeeId));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    setDeleteConfirm({ open: false, employee: null });

    try {
      await adminService.deleteEmployee(deletedEmployeeId);
      toast.success("Employee deleted successfully");
    } catch (error: any) {
      // Rollback on error
      setEmployees(previousEmployees);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      toast.error(error.message || "Failed to delete employee");
    }
  };

  const columns: Column<Employee>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: (row) => row.phone || "N/A" },
    {
      header: "Assigned Modules",
      accessor: (row) => row.assignedModules?.join(", ") || "None",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.assignedModules?.map((module) => (
            <Badge key={module} variant="secondary" className="capitalize">
              {module}
            </Badge>
          )) || <span className="text-muted-foreground">None</span>}
        </div>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)} className="gap-1">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row)}
            className="gap-1"
          >
            {row.isActive ? (
              <>
                <ShieldOff className="h-4 w-4" />
                <span className="hidden sm:inline">Deactivate</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Activate</span>
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirm({ open: true, employee: row })}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground mt-2">Manage employees and their module assignments.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>View and manage all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={employees}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingEmployee(null);
          setFormData({ name: "", email: "", password: "", phone: "", assignedModules: [] });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>{editingEmployee ? "Update employee details" : "Create a new employee account with module assignments"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingEmployee}
                placeholder={editingEmployee ? "Leave blank to keep current password" : ""}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Assigned Modules
                </label>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module} className="flex items-center space-x-2">
                      <Checkbox
                        id={module}
                        checked={formData.assignedModules.includes(module)}
                        onCheckedChange={() => toggleModule(module)}
                      />
                      <label
                        htmlFor={module}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {module}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingEmployee(null); }}>
                Cancel
              </Button>
              <Button type="submit">{editingEmployee ? "Update Employee" : "Create Employee"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, employee: open ? deleteConfirm.employee : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteConfirm.employee?.name}</strong>? This will unassign all their cases and remove the employee from the database. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
