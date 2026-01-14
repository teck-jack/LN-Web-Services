import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, accept = "*", maxSize = 10, disabled = false }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setUploadProgress(100);
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect, maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging && "border-primary bg-primary/5",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drag and drop your file here, or{" "}
                <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
                  browse
                </label>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Maximum file size: {maxSize}MB</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleInputChange}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      {file && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="h-1 mt-2" />
                )}
                {uploadProgress === 100 && (
                  <div className="flex items-center gap-1 text-xs text-success mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Ready to upload
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemove} disabled={disabled}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
