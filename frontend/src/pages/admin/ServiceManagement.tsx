import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/common/DataTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Service {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  documentsRequired: string[];
  processSteps: { stepNumber: number; title: string; description: string }[];
  createdAt: string;
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    price: "",
    duration: "",
    documentsRequired: [""],
    processSteps: [{ stepNumber: 1, title: "", description: "" }],
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await adminService.getServices();
      setServices(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        documentsRequired: formData.documentsRequired.filter(d => d.trim()),
      };

      if (editingService) {
        // Update existing service - optimistic update
        const response = await adminService.updateService(editingService._id, payload);
        setServices(services.map(svc =>
          svc._id === editingService._id ? { ...svc, ...response.data } : svc
        ));
        toast.success("Service updated successfully");
      } else {
        // Create new service - optimistic update
        const response = await adminService.createService(payload);
        setServices([response.data, ...services]);
        toast.success("Service created successfully");
      }

      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || (editingService ? "Failed to update service" : "Failed to create service"));
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      type: service.type,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      documentsRequired: service.documentsRequired,
      processSteps: service.processSteps,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const previousServices = [...services];

    // Optimistic update - remove from UI immediately
    setServices(services.filter(svc => svc._id !== serviceId));

    try {
      await adminService.deleteService(serviceId);
      toast.success("Service deleted successfully");
    } catch (error: any) {
      // Rollback on error
      setServices(previousServices);
      toast.error(error.message || "Failed to delete service");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      price: "",
      duration: "",
      documentsRequired: [""],
      processSteps: [{ stepNumber: 1, title: "", description: "" }],
    });
  };

  const addDocument = () => {
    setFormData({ ...formData, documentsRequired: [...formData.documentsRequired, ""] });
  };

  const removeDocument = (index: number) => {
    setFormData({
      ...formData,
      documentsRequired: formData.documentsRequired.filter((_, i) => i !== index),
    });
  };

  const updateDocument = (index: number, value: string) => {
    const newDocs = [...formData.documentsRequired];
    newDocs[index] = value;
    setFormData({ ...formData, documentsRequired: newDocs });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      processSteps: [
        ...formData.processSteps,
        { stepNumber: formData.processSteps.length + 1, title: "", description: "" },
      ],
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      processSteps: formData.processSteps.filter((_, i) => i !== index),
    });
  };

  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...formData.processSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, processSteps: newSteps });
  };

  const columns: Column<Service>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.type}
        </Badge>
      ),
    },
    {
      header: "Price",
      accessor: (row) => `₹${row.price.toLocaleString()}`,
    },
    { header: "Duration", accessor: "duration" },
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
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)} className="gap-2">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDelete(row._id)} className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground mt-2">Manage all services offered by the platform.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>View and manage all services</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={services} loading={loading} />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingService(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>{editingService ? "Update service details" : "Create a new service offering"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <Input
                label="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., trademark, copyright, patent"
                required
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (₹)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 30-45 days"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Documents Required</label>
                  <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.documentsRequired.map((doc, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={doc}
                        onChange={(e) => updateDocument(index, e.target.value)}
                        placeholder="Document name"
                      />
                      {formData.documentsRequired.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Process Steps</label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.processSteps.map((step, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Step {step.stepNumber}</span>
                          {formData.processSteps.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeStep(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Step title"
                          value={step.title}
                          onChange={(e) => updateStep(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Step description"
                          value={step.description}
                          onChange={(e) => updateStep(index, 'description', e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingService(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">{editingService ? "Update Service" : "Create Service"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
