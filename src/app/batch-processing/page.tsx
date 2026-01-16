"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFileStore } from "@/lib/file-store";
import {
  Upload,
  Play,
  Pause,
  Download,
  Settings,
  FileAudio,
  FolderOpen,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  List,
  Grid,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Database,
  Archive,
  Trash2,
  Eye,
  Edit,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AudioFileUpload } from "@/components/audio-file-upload";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BatchFile {
  id: string;
  file: File;
  name: string;
  size: string;
  duration?: number;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: {
    confidence: number;
    notesCount: number;
    instruments: string[];
    processingTime: number;
    error?: string;
  };
  selected: boolean;
}

interface BatchSettings {
  maxConcurrent: number;
  outputFormat: "mid" | "csv" | "both";
  quality: "fast" | "balanced" | "high";
  enableTranscription: boolean;
  enableStemSeparation: boolean;
  enableAnalysis: boolean;
  autoExport: boolean;
  organizeByFolder: boolean;
}

export default function BatchProcessingPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Get pending files from file store (set by Dashboard)
  const { pendingFiles, clearPendingFiles } = useFileStore();

  const [batchSettings, setBatchSettings] = useState<BatchSettings>({
    maxConcurrent: 3,
    outputFormat: "both",
    quality: "balanced",
    enableTranscription: true,
    enableStemSeparation: false,
    enableAnalysis: true,
    autoExport: false,
    organizeByFolder: true,
  });

  // Load files from store on mount (when navigating from Dashboard)
  useEffect(() => {
    if (pendingFiles.length > 0) {
      const newBatchFiles: BatchFile[] = pendingFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "pending" as const,
        progress: 0,
        selected: true,
      }));

      setBatchFiles((prev) => [...prev, ...newBatchFiles]);
      clearPendingFiles();

      toast({
        title: 'Files loaded from dashboard',
        description: `${pendingFiles.length} file(s) added to batch queue`,
      });
    }
  }, [pendingFiles, clearPendingFiles, toast]);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      const newBatchFiles: BatchFile[] = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "pending",
        progress: 0,
        selected: true,
      }));

      setBatchFiles((prev) => [...prev, ...newBatchFiles]);
      setUploadedFiles(files);

      toast({
        title: "Files added to batch",
        description: `${files.length} file(s) queued for processing`,
      });
    },
    [toast]
  );

  const startBatchProcessing = useCallback(async () => {
    const filesToProcess = batchFiles.filter(
      (f) => f.selected && f.status === "pending"
    );

    if (filesToProcess.length === 0) {
      toast({
        title: "No files to process",
        description: "Please select files to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process files in batches
      const chunks: BatchFile[][] = [];
      for (
        let i = 0;
        i < filesToProcess.length;
        i += batchSettings.maxConcurrent
      ) {
        chunks.push(filesToProcess.slice(i, i + batchSettings.maxConcurrent));
      }

      for (const chunk of chunks) {
        const promises = chunk.map(async (batchFile) => {
          // Update status to processing
          setBatchFiles((prev) =>
            prev.map((f) =>
              f.id === batchFile.id
                ? { ...f, status: "processing", progress: 0 }
                : f
            )
          );

          // Simulate processing
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            setBatchFiles((prev) =>
              prev.map((f) => (f.id === batchFile.id ? { ...f, progress } : f))
            );
          }

          // Simulate result
          const result = {
            confidence: Math.random() * 0.2 + 0.8,
            notesCount: Math.floor(Math.random() * 500) + 100,
            instruments: ["Piano", "Violin", "Guitar"].slice(
              0,
              Math.floor(Math.random() * 3) + 1
            ),
            processingTime: Math.random() * 5 + 2,
          };

          setBatchFiles((prev) =>
            prev.map((f) =>
              f.id === batchFile.id
                ? { ...f, status: "completed", progress: 100, result }
                : f
            )
          );
        });

        await Promise.all(promises);
      }

      toast({
        title: "Batch processing complete",
        description: `Successfully processed ${filesToProcess.length} files`,
      });
    } catch (error) {
      toast({
        title: "Batch processing failed",
        description: "An error occurred during processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentProcessing(0);
    }
  }, [batchFiles, batchSettings.maxConcurrent, toast]);

  const stopBatchProcessing = useCallback(() => {
    setIsProcessing(false);
    toast({
      title: "Processing stopped",
      description: "Batch processing has been stopped",
    });
  }, [toast]);

  const toggleFileSelection = useCallback((fileId: string) => {
    setBatchFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f))
    );
  }, []);

  const toggleAllSelection = useCallback(() => {
    const allSelected = batchFiles.every((f) => f.selected);
    setBatchFiles((prev) =>
      prev.map((f) => ({ ...f, selected: !allSelected }))
    );
  }, [batchFiles]);

  const removeFile = useCallback((fileId: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearCompleted = useCallback(() => {
    setBatchFiles((prev) => prev.filter((f) => f.status !== "completed"));
  }, []);

  const exportResults = useCallback(() => {
    const completedFiles = batchFiles.filter(
      (f) => f.status === "completed" && f.selected
    );

    if (completedFiles.length === 0) {
      toast({
        title: "No files to export",
        description: "Please select completed files to export",
        variant: "destructive",
      });
      return;
    }

    // Simulate export
    completedFiles.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(file.result, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(/\.[^/.]+$/, "")}_results.json`;
        a.click();
        URL.revokeObjectURL(url);
      }, index * 100);
    });

    toast({
      title: "Export started",
      description: `Exporting ${completedFiles.length} file(s)`,
    });
  }, [batchFiles, toast]);

  const filteredFiles = batchFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: batchFiles.length,
    pending: batchFiles.filter((f) => f.status === "pending").length,
    processing: batchFiles.filter((f) => f.status === "processing").length,
    completed: batchFiles.filter((f) => f.status === "completed").length,
    error: batchFiles.filter((f) => f.status === "error").length,
    selected: batchFiles.filter((f) => f.selected).length,
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            Batch Processing
          </h1>
          <p className="text-muted-foreground">
            Process multiple audio files simultaneously with automated workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Batch Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Batch Processing Settings</DialogTitle>
                <DialogDescription>
                  Configure batch processing parameters for optimal workflow.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Max Concurrent Jobs</Label>
                  <select
                    value={batchSettings.maxConcurrent}
                    onChange={(e) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        maxConcurrent: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={1}>1 (Sequential)</option>
                    <option value={2}>2</option>
                    <option value={3}>3 (Recommended)</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <select
                    value={batchSettings.outputFormat}
                    onChange={(e) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        outputFormat: e.target.value as "mid" | "csv" | "both",
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="mid">MIDI Only</option>
                    <option value="csv">CSV Only</option>
                    <option value="both">Both MIDI & CSV</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Processing Quality</Label>
                  <select
                    value={batchSettings.quality}
                    onChange={(e) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        quality: e.target.value as "fast" | "balanced" | "high",
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="fast">Fast (Lower quality)</option>
                    <option value="balanced">Balanced</option>
                    <option value="high">High (Slower)</option>
                  </select>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <Label className="font-semibold">Processing Options</Label>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Enable Transcription</Label>
                    <Switch
                      checked={batchSettings.enableTranscription}
                      onCheckedChange={(checked) =>
                        setBatchSettings((prev) => ({ ...prev, enableTranscription: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Enable Stem Separation</Label>
                    <Switch
                      checked={batchSettings.enableStemSeparation}
                      onCheckedChange={(checked) =>
                        setBatchSettings((prev) => ({ ...prev, enableStemSeparation: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Enable Analysis</Label>
                    <Switch
                      checked={batchSettings.enableAnalysis}
                      onCheckedChange={(checked) =>
                        setBatchSettings((prev) => ({ ...prev, enableAnalysis: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Auto Export</Label>
                    <Switch
                      checked={batchSettings.autoExport}
                      onCheckedChange={(checked) =>
                        setBatchSettings((prev) => ({ ...prev, autoExport: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Organize by Folder</Label>
                    <Switch
                      checked={batchSettings.organizeByFolder}
                      onCheckedChange={(checked) =>
                        setBatchSettings((prev) => ({ ...prev, organizeByFolder: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={isProcessing ? stopBatchProcessing : startBatchProcessing}
            disabled={!isProcessing && stats.selected === 0}
          >
            {isProcessing ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Processing
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Process {stats.selected} Files
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium">Processing</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold">{stats.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Upload & Settings */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Add Files
              </CardTitle>
              <CardDescription>
                Add up to 50 files for batch processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioFileUpload
                files={[]}
                onFilesChange={handleFileUpload}
                maxFiles={50}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Queue size</span>
                  <span>{batchFiles.length}/50</span>
                </div>
                <Progress
                  value={(batchFiles.length / 50) * 100}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Batch Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Batch Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Concurrent Processing
                </label>
                <Select
                  value={batchSettings.maxConcurrent.toString()}
                  onValueChange={(value) =>
                    setBatchSettings((prev) => ({
                      ...prev,
                      maxConcurrent: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 File</SelectItem>
                    <SelectItem value="3">3 Files</SelectItem>
                    <SelectItem value="5">5 Files</SelectItem>
                    <SelectItem value="10">10 Files</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Quality</label>
                <Select
                  value={batchSettings.quality}
                  onValueChange={(value) =>
                    setBatchSettings((prev) => ({
                      ...prev,
                      quality: value as "fast" | "balanced" | "high",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (Lower Quality)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="high">High (Slower)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Output Format</label>
                <Select
                  value={batchSettings.outputFormat}
                  onValueChange={(value) =>
                    setBatchSettings((prev) => ({
                      ...prev,
                      outputFormat: value as "mid" | "csv" | "both",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mid">MIDI Only</SelectItem>
                    <SelectItem value="csv">CSV Only</SelectItem>
                    <SelectItem value="both">Both Formats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audio Transcription</span>
                  <Checkbox
                    checked={batchSettings.enableTranscription}
                    onCheckedChange={(checked) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        enableTranscription: checked as boolean,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stem Separation</span>
                  <Checkbox
                    checked={batchSettings.enableStemSeparation}
                    onCheckedChange={(checked) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        enableStemSeparation: checked as boolean,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audio Analysis</span>
                  <Checkbox
                    checked={batchSettings.enableAnalysis}
                    onCheckedChange={(checked) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        enableAnalysis: checked as boolean,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Export</span>
                  <Checkbox
                    checked={batchSettings.autoExport}
                    onCheckedChange={(checked) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        autoExport: checked as boolean,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Organize by Folder</span>
                  <Checkbox
                    checked={batchSettings.organizeByFolder}
                    onCheckedChange={(checked) =>
                      setBatchSettings((prev) => ({
                        ...prev,
                        organizeByFolder: checked as boolean,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - File List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setViewMode(viewMode === "list" ? "grid" : "list")
                    }
                  >
                    {viewMode === "list" ? (
                      <Grid className="h-4 w-4" />
                    ) : (
                      <List className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllSelection}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompleted}
                    disabled={stats.completed === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                    disabled={stats.completed === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>File Queue ({filteredFiles.length})</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{stats.selected} selected</Badge>
                  {isProcessing && (
                    <Badge variant="default">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing...
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files in queue</p>
                  <p className="text-sm">
                    Upload files to start batch processing
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((batchFile) => (
                    <div
                      key={batchFile.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        batchFile.selected
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={batchFile.selected}
                          onCheckedChange={() =>
                            toggleFileSelection(batchFile.id)
                          }
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">
                              {batchFile.name}
                            </p>
                            <Badge
                              variant={
                                batchFile.status === "completed"
                                  ? "default"
                                  : batchFile.status === "processing"
                                  ? "secondary"
                                  : batchFile.status === "error"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {batchFile.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{batchFile.size}</span>
                            {batchFile.result && (
                              <>
                                <span>•</span>
                                <span>{batchFile.result.notesCount} notes</span>
                                <span>•</span>
                                <span>
                                  {(batchFile.result.confidence * 100).toFixed(
                                    1
                                  )}
                                  % confidence
                                </span>
                                <span>•</span>
                                <span>
                                  {batchFile.result.processingTime.toFixed(1)}s
                                </span>
                              </>
                            )}
                          </div>
                          {batchFile.status === "processing" && (
                            <div className="mt-2">
                              <Progress
                                value={batchFile.progress}
                                className="w-full h-1"
                              />
                            </div>
                          )}
                          {batchFile.status === "error" &&
                            batchFile.result?.error && (
                              <p className="text-xs text-red-500 mt-1">
                                {batchFile.result.error}
                              </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                          {batchFile.status === "completed" && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(batchFile.id)}
                            disabled={batchFile.status === "processing"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overall Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  Processing batch... ({stats.processing}/{stats.selected})
                </p>
                <Progress
                  value={(stats.completed / stats.selected) * 100}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.completed}/{stats.selected} completed
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
