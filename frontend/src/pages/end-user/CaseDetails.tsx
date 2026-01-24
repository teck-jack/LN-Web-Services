import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCase, addNote, uploadDocument, clearCase } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CaseProgress } from "@/components/common/CaseProgress";
import { NotesTimeline } from "@/components/common/NotesTimeline";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, MessageSquare, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// 🆕 NEW COMPONENT IMPORTS
import { SLATimer } from "@/components/case/SLATimer";
import { ActivityTimeline } from "@/components/case/ActivityTimeline";
import { DocumentVersionManager } from "@/components/document/DocumentVersionManager";
import { BulkUploadDialog } from "@/components/document/BulkUploadDialog";
import { getRequiredDocuments } from "@/services/endUserService";

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { case: caseData, loading } = useAppSelector((state) => state.endUser);
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(getCase(id));
      // Fetch required documents
      fetchRequiredDocuments();
    }
    return () => {
      dispatch(clearCase());
    };
  }, [dispatch, id]);

  const fetchRequiredDocuments = async () => {
    if (!id) return;
    try {
      setLoadingDocuments(true);
      const response = await getRequiredDocuments(id);
      setRequiredDocuments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch required documents:', error);
      toast.error('Failed to load required documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleAddNote = async () => {
    if (!id || !noteText.trim()) return;
    setIsAddingNote(true);
    try {
      await dispatch(addNote({ id, noteData: { text: noteText } })).unwrap();
      setNoteText("");
      toast.success("Note added successfully");
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  if (loading || !caseData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/end-user/cases")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{caseData.caseId}</h1>
                {/* 🆕 SLA TIMER */}
                {caseData.slaDeadline && (
                  <SLATimer
                    deadline={caseData.slaDeadline}
                    status={caseData.slaStatus || 'not_set'}
                    compact
                  />
                )}
              </div>
              <p className="text-muted-foreground mt-1">{caseData.serviceId?.name || "N/A"}</p>
              {/* 🆕 ESTIMATED RESOLUTION TIME */}
              {caseData.estimatedResolutionTime && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated resolution: {caseData.estimatedResolutionTime}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Progress</CardTitle>
              <CardDescription>Track the status of your case</CardDescription>
            </CardHeader>
            <CardContent>
              <CaseProgress
                steps={caseData.serviceId?.processSteps || []}
                currentStep={caseData.currentStep || 1}
                status={caseData.status || "new"}
              />
            </CardContent>
          </Card>

          {/* 🆕 ENHANCED TABS */}
          <Tabs defaultValue="documents">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* 🆕 ENHANCED DOCUMENTS TAB */}
            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={() => setShowBulkUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>

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
                    canVerify={false}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No required documents defined for this service
                  </CardContent>
                </Card>
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
            </TabsContent>

            {/* 🆕 TIMELINE TAB */}
            <TabsContent value="timeline" className="space-y-4">
              <ActivityTimeline
                caseId={id!}
                userView={true}
                showFilters={false}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Notes</CardTitle>
                    <CardDescription>Communication history for this case</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                          Add a note or comment about this case
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Write your note here..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={5}
                      />
                      <DialogFooter>
                        <Button
                          onClick={handleAddNote}
                          disabled={!noteText.trim() || isAddingNote}
                        >
                          {isAddingNote ? "Adding..." : "Add Note"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <NotesTimeline notes={caseData.notes || []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Case ID</p>
                <p className="font-medium">{caseData.caseId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{caseData.serviceId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={caseData.status === "completed" ? "success" : "default"}>
                  {caseData.status?.replace("_", " ") || "Unknown"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {caseData.createdAt ? formatDistanceToNow(new Date(caseData.createdAt), { addSuffix: true }) : "N/A"}
                </p>
              </div>
              {caseData.assignedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(caseData.assignedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {caseData.employeeId && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Employee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{caseData.employeeId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{caseData.employeeId?.email || "N/A"}</p>
                </div>
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Employee
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
