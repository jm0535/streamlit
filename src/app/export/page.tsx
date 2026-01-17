'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  FileAudio,
  FileText,
  Music,
  Settings,
  Play,
  Pause,
  Upload,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  Globe,
  Share,
  Lock,
  Eye,
  EyeOff,
  Copy,
  FolderOpen,
  Archive,
  HardDrive,
  Cloud,
  Wifi,
  WifiOff,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  DownloadCloud,
  FileDown,
  FileUp,
  FileSpreadsheet,
  FileJson,
  FileCode,
  FileImage,
  Layers,
  X,
  Loader2,
} from 'lucide-react';

import { FileSelectorDialog } from '@/components/file-selector-dialog';
import { useJobStore, useJobStoreHydrated, ProcessingJob, JobStatus } from '@/lib/job-store';
import { runExportJob, quickDownloadTranscriptions, quickDownloadStems, quickDownloadAll } from '@/lib/export-service';
import { loadTranscriptionResults } from '@/lib/transcription-store';
import { loadStemResults } from '@/lib/stem-store';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  settings: {
    includeMetadata: boolean;
    includeAudio: boolean;
    compression: 'none' | 'zip' | 'tar';
    quality: 'low' | 'medium' | 'high';
  };
}

export default function ExportPage() {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentTab, setCurrentTab] = useState('quick');
  const [isCreatingExport, setIsCreatingExport] = useState(false);
  const [hasData, setHasData] = useState({ transcriptions: false, stems: false });

  // Connect to real job store with IndexedDB persistence
  const isHydrated = useJobStoreHydrated();
  const { jobs, createJob, deleteJob, clearCompletedJobs, getJobsByType } = useJobStore();

  // Get export jobs only
  const exportJobs = jobs.filter(job => job.type === 'export');

  // Check for available data on mount
  useEffect(() => {
    const checkData = async () => {
      const [transcriptions, stems] = await Promise.all([
        loadTranscriptionResults(),
        loadStemResults(),
      ]);
      setHasData({
        transcriptions: transcriptions.length > 0,
        stems: stems.length > 0,
      });
    };
    checkData();
  }, []);

  // Export settings
  const [exportSettings, setExportSettings] = useState({
    format: 'midi',
    includeMetadata: true,
    includeAudio: false,
    compression: 'zip' as 'none' | 'zip' | 'tar',
    quality: 'high' as 'low' | 'medium' | 'high',
    destination: 'local'
  });


  const handleCreateExport = useCallback(async (type: 'transcription' | 'stems' | 'analysis' | 'batch') => {
    // Check for available data
    if (type === 'transcription' && !hasData.transcriptions) {
      toast({
        title: "No transcription data",
        description: "Process some audio files in Transcription first",
        variant: "destructive",
      });
      return;
    }

    if (type === 'stems' && !hasData.stems) {
      toast({
        title: "No stem separation data",
        description: "Process some audio files in Stem Separation first",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingExport(true);

    try {
      // Create real job in persistent store
      const jobId = createJob(
        'export',
        selectedFiles.map((f, i) => ({
          id: `file-${i}`,
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        { exportType: type, ...exportSettings }
      );

      toast({
        title: "Export started",
        description: `Processing ${type} export...`,
      });

      // Run real export with job tracking
      await runExportJob(jobId, type, {
        format: exportSettings.format as 'midi' | 'musicxml' | 'json' | 'csv' | 'pdf' | 'wav' | 'mp3' | 'zip',
        includeMetadata: exportSettings.includeMetadata,
        includeAudio: exportSettings.includeAudio,
        quality: exportSettings.quality,
        includeTranscriptions: true,
        includeStems: true,
        includeAnalysis: true,
      });

      toast({
        title: "Export completed",
        description: "Your download should start automatically",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingExport(false);
    }
  }, [selectedFiles, exportSettings, hasData, createJob, toast]);

  const handleDownloadJob = useCallback((job: ProcessingJob) => {
    if (job.result?.downloadUrl) {
      // Re-trigger download from stored blob
      if (job.result.blobData) {
        const url = URL.createObjectURL(job.result.blobData);
        const link = document.createElement('a');
        link.href = url;
        link.download = (job.result.metadata?.filename as string) || 'export.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Fallback to stored URL
        window.open(job.result.downloadUrl, '_blank');
      }
      toast({
        title: "Download started",
        description: `Downloading export...`,
      });
    }
  }, [toast]);

  const handleDeleteJob = useCallback((jobId: string) => {
    deleteJob(jobId);
    toast({
      title: "Export deleted",
      description: "Export job removed from history",
    });
  }, [deleteJob, toast]);

  const handleRetryJob = useCallback(async (job: ProcessingJob) => {
    // Re-run the export with the same settings
    const settings = job.settings as { exportType?: string } | undefined;
    const exportType = settings?.exportType as 'transcription' | 'stems' | 'analysis' | 'batch' || 'transcription';

    setIsCreatingExport(true);
    try {
      const newJobId = createJob('export', job.files, job.settings);
      await runExportJob(newJobId, exportType, {
        format: 'midi',
        includeMetadata: true,
      });
      toast({
        title: "Export completed",
        description: "Your download should start automatically",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingExport(false);
    }
  }, [createJob, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'midi':
        return <Music className="h-4 w-4" />;
      case 'wav':
      case 'mp3':
      case 'flac':
        return <FileAudio className="h-4 w-4" />;
      case 'json':
        return <FileJson className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileDown className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper functions for ProcessingJob display
  const getJobName = (job: ProcessingJob) => {
    const settings = job.settings as { exportType?: string } | undefined;
    const exportType = settings?.exportType || 'export';
    return `${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Export`;
  };

  const getJobFormat = (job: ProcessingJob) => {
    const settings = job.settings as { format?: string } | undefined;
    return (settings?.format || 'ZIP').toUpperCase();
  };

  const getJobFileCount = (job: ProcessingJob) => {
    return job.files?.length || 0;
  };

  const getJobSize = (job: ProcessingJob) => {
    const size = job.result?.blobData?.size || job.result?.metadata?.size as number;
    return size ? formatFileSize(size) : null;
  };


  const exportTemplates: ExportTemplate[] = [
    {
      id: 'midi-high-quality',
      name: 'High Quality MIDI',
      description: 'Export transcriptions as high-fidelity MIDI files',
      format: 'MIDI',
      settings: {
        includeMetadata: true,
        includeAudio: false,
        compression: 'none',
        quality: 'high'
      }
    },
    {
      id: 'stems-wav',
      name: 'Stem Separation (WAV)',
      description: 'Export separated stems as uncompressed WAV files',
      format: 'WAV',
      settings: {
        includeMetadata: true,
        includeAudio: true,
        compression: 'zip',
        quality: 'high'
      }
    },
    {
      id: 'analysis-json',
      name: 'Analysis Report (JSON)',
      description: 'Export detailed analysis data in JSON format',
      format: 'JSON',
      settings: {
        includeMetadata: true,
        includeAudio: false,
        compression: 'none',
        quality: 'medium'
      }
    },
    {
      id: 'batch-complete',
      name: 'Complete Batch Export',
      description: 'Export all processed data in a comprehensive package',
      format: 'ZIP',
      settings: {
        includeMetadata: true,
        includeAudio: true,
        compression: 'zip',
        quality: 'high'
      }
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Export Center</h1>
          <p className="text-muted-foreground">
            Export your processed audio data in various formats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Quick Export
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick">Quick Export</TabsTrigger>
          <TabsTrigger value="custom">Custom Export</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Quick Export */}
        <TabsContent value="quick" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateExport('transcription')}>
              <CardContent className="p-6 text-center">
                <Music className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Transcription</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export MIDI files of transcribed music
                </p>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export MIDI
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateExport('stems')}>
              <CardContent className="p-6 text-center">
                <FileAudio className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Stem Separation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export separated audio tracks
                </p>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Stems
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateExport('analysis')}>
              <CardContent className="p-6 text-center">
                <FileJson className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Analysis Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export analysis results and metadata
                </p>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateExport('batch')}>
              <CardContent className="p-6 text-center">
                <Archive className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold mb-2">Batch Export</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all data in comprehensive package
                </p>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>
                Your latest export jobs and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(getJobFormat(job))}
                      <div>
                        <p className="font-medium">{getJobName(job)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getJobFileCount(job)} files • {getJobFormat(job)} • {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(job.status)}
                        <span className="text-sm capitalize">{job.status}</span>
                      </div>
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="w-full" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {job.status === 'completed' && (
                        <Button size="sm" onClick={() => handleDownloadJob(job)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'error' && (
                        <Button size="sm" variant="outline" onClick={() => handleRetryJob(job)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Export */}
        <TabsContent value="custom" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
                <CardDescription>
                  Configure your export parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportSettings.format} onValueChange={(value) =>
                    setExportSettings(prev => ({ ...prev, format: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midi">MIDI</SelectItem>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="flac">FLAC</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality">Quality</Label>
                  <Select value={exportSettings.quality} onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setExportSettings(prev => ({ ...prev, quality: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fast)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Slow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="compression">Compression</Label>
                  <Select value={exportSettings.compression} onValueChange={(value: 'none' | 'zip' | 'tar') =>
                    setExportSettings(prev => ({ ...prev, compression: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="zip">ZIP</SelectItem>
                      <SelectItem value="tar">TAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Select value={exportSettings.destination} onValueChange={(value) =>
                    setExportSettings(prev => ({ ...prev, destination: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Download</SelectItem>
                      <SelectItem value="cloud">Cloud Storage</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="metadata">Include Metadata</Label>
                    <Switch
                      id="metadata"
                      checked={exportSettings.includeMetadata}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({ ...prev, includeMetadata: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio">Include Audio Files</Label>
                    <Switch
                      id="audio"
                      checked={exportSettings.includeAudio}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({ ...prev, includeAudio: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Selection */}
            <Card>
              <CardHeader>
                <CardTitle>File Selection</CardTitle>
                <CardDescription>
                  Choose which files to include in the export
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Files
                    </Button>
                    <FileSelectorDialog
                      onFilesSelected={(files) => setSelectedFiles(prev => [...prev, ...files])}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Layers className="h-4 w-4 mr-2" />
                          Select from Library
                        </Button>
                      }
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {selectedFiles.length} file(s) selected
                  </div>

                  <div className="border rounded-lg p-4 min-h-[200px]">
                    {selectedFiles.length === 0 ? (
                      <div className="text-center text-muted-foreground pt-12">
                        <FileAudio className="h-8 w-8 mx-auto mb-2" />
                        <p>No files selected</p>
                        <p className="text-sm">Add files to include in export</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedFiles.map((file, i) => (
                           <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md group">
                             <div className="flex items-center gap-2 truncate">
                               <FileAudio className="h-4 w-4 text-primary" />
                               <span className="text-sm truncate">{file.name}</span>
                             </div>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                               onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                             >
                               <X className="h-3 w-3" />
                             </Button>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleCreateExport('transcription')}
                    disabled={isCreatingExport}
                  >
                    {isCreatingExport ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Start Export
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(template.format)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{template.format}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Metadata: {template.settings.includeMetadata ? 'Included' : 'Excluded'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileAudio className="h-4 w-4 text-blue-500" />
                      <span>Audio: {template.settings.includeAudio ? 'Included' : 'Excluded'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Archive className="h-4 w-4 text-purple-500" />
                      <span>Compression: {template.settings.compression}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Settings className="h-4 w-4 text-orange-500" />
                      <span>Quality: {template.settings.quality}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Export History</CardTitle>
                  <CardDescription>
                    All your past and current export jobs
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Completed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFormatIcon(getJobFormat(job))}
                      <div>
                        <p className="font-medium">{getJobName(job)}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(job.createdAt).toLocaleString()}
                          {job.completedAt && ` • Completed ${new Date(job.completedAt).toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(job.status)}
                        <span className="text-sm capitalize">{job.status}</span>
                        <span className="text-sm text-muted-foreground">
                          • {getJobFileCount(job)} files • {getJobFormat(job)}
                        </span>
                        {getJobSize(job) && (
                          <span className="text-sm text-muted-foreground">
                            • {getJobSize(job)}
                          </span>
                        )}
                      </div>
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="w-full" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {job.status === 'completed' && job.result?.downloadUrl && (
                        <Button size="sm" onClick={() => handleDownloadJob(job)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'error' && (
                        <Button size="sm" variant="outline" onClick={() => handleRetryJob(job)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
