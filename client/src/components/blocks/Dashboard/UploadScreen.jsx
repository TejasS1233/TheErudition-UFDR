import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadScreen({ onUpload, onBack }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caseNumber, setCaseNumber] = useState("");
  const [officerName, setOfficerName] = useState("");

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) =>
        file.name.toLowerCase().includes("ufdr") ||
        file.type === "application/zip" ||
        file.type === "application/json" ||
        file.name.endsWith(".xml")
    );

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async () => {
    if (!caseNumber || !officerName || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Simulate processing and create mock data structure
    const mockData = {
      caseNumber,
      officerName,
      uploadDate: new Date().toISOString(),
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      structure: {
        chats: {
          whatsapp: 1250,
          telegram: 890,
          sms: 2100,
          signal: 340,
        },
        calls: {
          incoming: 450,
          outgoing: 380,
          missed: 120,
        },
        media: {
          images: 3200,
          videos: 180,
          audio: 95,
          documents: 240,
        },
        contacts: 890,
        locations: 1200,
        applications: 45,
        browserHistory: 2800,
      },
      totalRecords: 14985,
    };

    setUploading(false);
    onUpload(mockData);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upload UFDR Files</h1>
        <p className="text-muted-foreground">
          Upload Universal Forensic Extraction Device Report files for analysis. Supported formats:
          ZIP, JSON, XML
        </p>
      </div>

      {/* Case Information */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>Enter the case details for this investigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                placeholder="e.g., 2024-DFU-001"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officerName">Investigating Officer</Label>
              <Input
                id="officerName"
                placeholder="Officer Name"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>Drag and drop UFDR files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop UFDR files here</p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  browse files
                </Button>
              </p>
              <input
                id="fileInput"
                type="file"
                multiple
                accept=".zip,.json,.xml"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading and processing files...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All uploaded files are processed securely and in compliance with digital forensic
          standards. Files are encrypted during transfer and processing.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={uploading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Welcome
        </Button>
        <Button
          onClick={simulateUpload}
          disabled={!caseNumber || !officerName || files.length === 0 || uploading}
        >
          {uploading ? "Processing..." : "Process Files"}
          {!uploading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
