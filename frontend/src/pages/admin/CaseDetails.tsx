import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { ArrowLeft, Plus, Upload } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Timeline } from "@/components/common/Timeline";
import { DocumentVersionManager } from "@/components/document/DocumentVersionManager";
import { BulkUploadDialog } from "@/components/document/BulkUploadDialog";
import { ActivityTimeline } from "@/components/case/ActivityTimeline";

interface CaseDetails {
  _id: string;
  caseId: string;
  endUserId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  employeeId?: {
    _id: string;
    name: string;
    email: string;
  };
  serviceId: {
    _id: string;
    name: string;
    type: string;
    processSteps: Array<{
      stepNumber: number;
      title: string;
      description: string;
    }>;
  };
  status: string;
  currentStep: number;
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
  }>;
  notes: Array<{
    text: string;
    createdBy: {
      _id: string;
      name: string;
      role: string;
    };
    createdAt: string;
  }>;
  assignedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseDetails(id);
      fetchEmployees();
      fetchRequiredDocuments();
    }
  }, [id]);

  const fetchCaseDetails = async (caseId: string) => {
    try {
      setLoading(true);
      const response = await adminService.getCase(caseId);
      setCaseDetails(response.data);
    } catch (error) {
      toast.error("Failed to fetch case details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequiredDocuments = async () => {
    if (!id) return;
    try {
      setLoadingDocuments(true);
      const response = await adminService.getRequiredDocuments(id);
      setRequiredDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch required documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await adminService.getUsers({ role: 'employee' });
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const handleAssignCase = async (employeeId: string) => {
    if (!id) return;

    try {
      setAssigning(true);
      await adminService.assignCase(id, employeeId);
      toast.success("Case assigned successfully");
      fetchCaseDetails(id);
    } catch (error: any) {
      toast.error(error.message || "Failed to assign case");
    } finally {
      setAssigning(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !id) return;
    try {
      setIsAddingNote(true);
      await adminService.addNote(id, { text: noteText });
      setNoteText("");
      setShowNoteDialog(false);
      toast.success("Note added successfully");
      fetchCaseDetails(id);
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Case not found</p>
      </div>
    );
  }

  const timelineSteps =
    caseDetails?.serviceId?.processSteps?.map((step) => ({
      ...step,
      status:
        step.stepNumber < caseDetails.currentStep
          ? "completed"
          : step.stepNumber === caseDetails.currentStep
            ? "current"
            : "upcoming",
    })) || [];


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/cases")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{caseDetails.caseId}</h1>
              <p className="text-muted-foreground mt-2">Case details and management</p>
            </div>
            <Badge variant={
              caseDetails.status === 'completed' ? 'success' :
                caseDetails.status === 'in_progress' ? 'default' :
                  caseDetails.status === 'cancelled' ? 'destructive' :
                    'secondary'
            } className="capitalize">
              {caseDetails.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
              <CardDescription>Basic details about this case</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service</h4>
                <div>
                  <p className="font-medium">{caseDetails.serviceId?.name || "N/A"}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {caseDetails.serviceId?.type || "N/A"}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">End User</h4>
                <div>
                  <p className="font-medium">{caseDetails.endUserId.name}</p>
                  <p className="text-sm text-muted-foreground">{caseDetails.endUserId.email}</p>
                  {caseDetails.endUserId.phone && (
                    <p className="text-sm text-muted-foreground">{caseDetails.endUserId.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Assigned Employee</h4>
                {caseDetails.employeeId ? (
                  <div>
                    <p className="font-medium">{caseDetails.employeeId.name}</p>
                    <p className="text-sm text-muted-foreground">{caseDetails.employeeId.email}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Not assigned yet</p>
                    <Select onValueChange={handleAssignCase} disabled={assigning}>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select an employee to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.name} ({employee.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Created</h4>
                  <p className="text-muted-foreground">{new Date(caseDetails.createdAt).toLocaleString()}</p>
                </div>
                {caseDetails.assignedAt && (
                  <div>
                    <h4 className="font-semibold mb-2">Assigned</h4>
                    <p className="text-muted-foreground">{new Date(caseDetails.assignedAt).toLocaleString()}</p>
                  </div>
                )}
                {caseDetails.completedAt && (
                  <div>
                    <h4 className="font-semibold mb-2">Completed</h4>
                    <p className="text-muted-foreground">{new Date(caseDetails.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process Timeline</CardTitle>
              <CardDescription>Current progress through the service steps</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline steps={timelineSteps} />
            </CardContent>
          </Card>

          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Manage and verify case documents</CardDescription>
                    </div>
                    <Button onClick={() => setShowBulkUploadDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingDocuments ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : requiredDocuments.length > 0 ? (
                    requiredDocuments.map((doc) => (
                      <DocumentVersionManager
                        key={doc.documentName}
                        caseId={id!}
                        documentType={doc.documentName}
                        canUpload={true}
                        canVerify={true}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No required documents defined for this service
                    </div>
                  )}

                  <BulkUploadDialog
                    caseId={id!}
                    open={showBulkUploadDialog}
                    onOpenChange={setShowBulkUploadDialog}
                    onComplete={(results) => {
                      console.log('Bulk upload complete:', results);
                      fetchCaseDetails(id!);
                      fetchRequiredDocuments();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Complete history of all activities for this case</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline
                    caseId={id!}
                    userView={false}
                    showFilters={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Notes</CardTitle>
                      <CardDescription>Communication and updates about this case</CardDescription>
                    </div>
                    <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Note</DialogTitle>
                          <DialogDescription>Add a new note to this case</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Note</Label>
                            <Textarea
                              placeholder="Enter your note..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={5}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddNote}
                              disabled={!noteText.trim() || isAddingNote}
                            >
                              {isAddingNote ? "Adding..." : "Add Note"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {caseDetails.notes && caseDetails.notes.length > 0 ? (
                    <div className="space-y-4">
                      {caseDetails.notes.map((note, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4 py-2">
                          <p className="text-sm">{note.text}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{note.createdBy?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{note.createdBy?.role || 'N/A'}</span>
                            <span>•</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No notes yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
