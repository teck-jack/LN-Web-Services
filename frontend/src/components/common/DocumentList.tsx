import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, File } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Document {
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: {
    _id: string;
    name: string;
  };
}

interface DocumentListProps {
  documents: Document[];
  onDownload?: (url: string, name: string) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
    return Image;
  }
  if (["pdf", "doc", "docx"].includes(ext || "")) {
    return FileText;
  }
  return File;
};

export function DocumentList({ documents, onDownload }: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  const handleDownload = (url: string, name: string) => {
    if (onDownload) {
      onDownload(url, name);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc, index) => {
        const Icon = getFileIcon(doc.name);
        return (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.name}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    <p>Uploaded by {doc.uploadedBy.name}</p>
                    <p>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc.url, doc.name)}
                  title="Download document"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
