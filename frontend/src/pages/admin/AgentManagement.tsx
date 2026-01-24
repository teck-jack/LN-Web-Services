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

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; agent: Agent | null }>({
    open: false,
    agent: null,
  });

  useEffect(() => {
    fetchAgents();
  }, [pagination.page]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        role: 'agent',
        page: pagination.page,
        limit: pagination.limit,
      });
      setAgents(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        // Update existing agent - optimistic update
        const response = await adminService.updateAgent(editingAgent._id, formData);
        setAgents(agents.map(agent =>
          agent._id === editingAgent._id ? { ...agent, ...response.data } : agent
        ));
        toast.success("Agent updated successfully");
      } else {
        // Create new agent - optimistic update
        const response = await adminService.createAgent(formData);
        setAgents([response.data, ...agents]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        toast.success("Agent created successfully");
      }
      setIsDialogOpen(false);
      setEditingAgent(null);
      setFormData({ name: "", email: "", password: "", phone: "" });
    } catch (error: any) {
      toast.error(error.message || (editingAgent ? "Failed to update agent" : "Failed to create agent"));
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      password: "",
      phone: agent.phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (agent: Agent) => {
    const previousAgents = [...agents];

    // Optimistic update - toggle status immediately
    setAgents(agents.map(a =>
      a._id === agent._id ? { ...a, isActive: !a.isActive } : a
    ));

    try {
      if (agent.isActive) {
        await adminService.deactivateUser(agent._id);
        toast.success("Agent deactivated successfully");
      } else {
        await adminService.activateUser(agent._id);
        toast.success("Agent activated successfully");
      }
    } catch (error: any) {
      // Rollback on error
      setAgents(previousAgents);
      toast.error(error.message || "Failed to update agent status");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.agent) return;
    const deletedAgentId = deleteConfirm.agent._id;
    const previousAgents = [...agents];

    // Optimistic update - remove from UI immediately
    setAgents(agents.filter(a => a._id !== deletedAgentId));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    setDeleteConfirm({ open: false, agent: null });

    try {
      await adminService.deleteAgent(deletedAgentId);
      toast.success("Agent deleted successfully");
    } catch (error: any) {
      // Rollback on error
      setAgents(previousAgents);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      toast.error(error.message || "Failed to delete agent");
    }
  };

  const columns: Column<Agent>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: (row) => row.phone || "N/A" },
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
            onClick={() => setDeleteConfirm({ open: true, agent: row })}
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
          <h1 className="text-3xl font-bold tracking-tight">Agent Management</h1>
          <p className="text-muted-foreground mt-2">Manage agents who onboard new users.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>View and manage all agents</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={agents}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingAgent(null);
          setFormData({ name: "", email: "", password: "", phone: "" });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
            <DialogDescription>{editingAgent ? "Update agent details" : "Create a new agent account"}</DialogDescription>
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
                required={!editingAgent}
                placeholder={editingAgent ? "Leave blank to keep current password" : ""}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingAgent(null); }}>
                Cancel
              </Button>
              <Button type="submit">{editingAgent ? "Update Agent" : "Create Agent"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, agent: open ? deleteConfirm.agent : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteConfirm.agent?.name}</strong>? This action will remove the agent from the database and cannot be undone.
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
