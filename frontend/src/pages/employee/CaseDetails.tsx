import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CaseProgress } from "@/components/common/CaseProgress";
import { NotesTimeline } from "@/components/common/NotesTimeline";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ArrowLeft, Mail, Phone, Plus, Upload } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCase, setLoading, updateCase } from "@/store/slices/employeeSlice";
import { format } from "date-fns";
import { ChecklistPanel } from "@/components/employee/ChecklistPanel";
import { updateChecklistProgress } from "@/services/workflowService";
import { DocumentVersionManager } from "@/components/document/DocumentVersionManager";
import { BulkUploadDialog } from "@/components/document/BulkUploadDialog";
import { ActivityTimeline } from "@/components/case/ActivityTimeline";

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { case: caseData, loading } = useAppSelector((state) => state.employee);

  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newStep, setNewStep] = useState(1);
  const [statusNote, setStatusNote] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    if (id) {
      loadCase();
      fetchRequiredDocuments();
    }
  }, [id]);

  const loadCase = async () => {
    if (!id) return;
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getCase(id);
      dispatch(setCase(response.data));
      setNewStatus(response.data.status);
      setNewStep(response.data.currentStep || 1);
    } catch (error) {
      toast.error("Failed to load case details");
      navigate("/employee/cases");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchRequiredDocuments = async () => {
    if (!id) return;
    try {
      setLoadingDocuments(true);
      const response = await employeeService.getRequiredDocuments(id);
      setRequiredDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch required documents:', error);
      toast.error('Failed to load required documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !id) return;
    try {
      setIsAddingNote(true);
      const response = await employeeService.addNote(id, { text: noteText });
      // Optimistic update - add note to Redux state
      if (caseData) {
        dispatch(updateCase({
          ...caseData,
          notes: [...(caseData.notes || []), response.data.note]
        }));
      }
      setNoteText("");
      setShowNoteDialog(false);
      toast.success("Note added successfully");
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !documentName.trim() || !id) return;
    try {
      setIsUploadingDoc(true);
      // In a real app, you would upload the file to storage first and get a URL
      const mockUrl = `https://example.com/documents/${selectedFile.name}`;
      await employeeService.uploadDocument(id, {
        name: documentName,
        url: mockUrl,
      });
      loadCase();
      setSelectedFile(null);
      setDocumentName("");
      setShowDocDialog(false);
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      setIsUpdatingStatus(true);
      await employeeService.updateCaseStatus(id, {
        status: newStatus,
        currentStep: newStep,
        note: statusNote.trim() || undefined,
      });
      // Optimistic update - update Redux state
      if (caseData) {
        dispatch(updateCase({
          ...caseData,
          status: newStatus,
          currentStep: newStep
        }));
      }
      setStatusNote("");
      setShowStatusDialog(false);
      toast.success("Case status updated successfully");
    } catch (error) {
      toast.error("Failed to update case status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/employee/cases")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{caseData.caseId}</h1>
          <p className="text-muted-foreground mt-1">
            Created on {caseData.createdAt ? format(new Date(caseData.createdAt), "MMMM dd, yyyy") : "N/A"}
          </p>
        </div>
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogTrigger asChild>
            <Button>Update Status</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Case Status</DialogTitle>
              <DialogDescription>Change the status and current step of this case</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newStatus === "in_progress" && (
                <div className="space-y-2">
                  <Label>Current Step</Label>
                  <Input
                    type="number"
                    min="1"
                    max={caseData.serviceId?.processSteps?.length || 4}
                    value={newStep}
                    onChange={(e) => setNewStep(parseInt(e.target.value))}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Textarea
                  placeholder="Add a note about this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>End User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{caseData.endUserId?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{caseData.endUserId?.email || "N/A"}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {caseData.endUserId?.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{caseData.endUserId.phone}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Phone className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{caseData.serviceId?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <Badge variant="outline">{caseData.serviceId?.type || "N/A"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {caseData.employeeId && (
              <div>
                <p className="text-sm font-medium">Assigned To</p>
                <p className="text-sm text-muted-foreground">{caseData.employeeId.name || "N/A"}</p>
              </div>
            )}
            {caseData.assignedAt && (
              <div>
                <p className="text-sm font-medium">Assigned On</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(caseData.assignedAt), "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          {caseData.workflowTemplate ? (
            <ChecklistPanel
              caseId={caseData._id}
              workflowTemplateId={caseData.workflowTemplate._id}
              steps={caseData.workflowTemplate.steps}
              progress={caseData.checklistProgress || []}
              onUpdate={async (itemId, completed) => {
                // Find which step this item belongs to. 
                // Note: The logic here assumes itemId is unique across all steps.
                const step = caseData.workflowTemplate?.steps.find((s) =>
                  s.checklistItems.some((i) => i._id === itemId)
                );
                if (!step) return;

                await updateChecklistProgress(caseData._id, {
                  stepId: step._id,
                  itemId,
                  isCompleted: completed,
                });
                loadCase();
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Case Progress</CardTitle>
                <CardDescription>Track the progress of this case through each step</CardDescription>
              </CardHeader>
              <CardContent>
                <CaseProgress
                  steps={caseData.serviceId?.processSteps || []}
                  currentStep={caseData.currentStep || 1}
                  status={caseData.status || "new"}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>All documents related to this case</CardDescription>
                </div>
                <Button onClick={() => setShowBulkUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dynamic Document Version Managers */}
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

              {/* Bulk Upload Dialog */}
              <BulkUploadDialog
                caseId={id!}
                open={showBulkUploadDialog}
                onOpenChange={setShowBulkUploadDialog}
                onComplete={(results) => {
                  console.log('Bulk upload complete:', results);
                  // Optimistic - DocumentVersionManager components will reload themselves
                  // No need to refetch everything
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
                        <p className="text-xs text-muted-foreground text-right">
                          {noteText.length} characters
                        </p>
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
              <NotesTimeline notes={caseData.notes || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
