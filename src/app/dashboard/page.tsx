'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  useFileStore,
  type FileStatus,
  type SharedAudioFile,
} from '@/lib/file-store';
import {
  Headphones,
  Mic,
  BarChart3,
  Download,
  Upload,
  Trash2,
  FileAudio,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  FolderOpen,
  Music2,
  Activity,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusConfig: Record<
  FileStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }
> = {
  uploaded: { label: 'Uploaded', variant: 'secondary', color: 'text-slate-500 bg-slate-100' },
  processing: { label: 'Processing', variant: 'default', color: 'text-blue-600 bg-blue-50' },
  stems_extracted: { label: 'Stems Ready', variant: 'outline', color: 'text-pink-600 bg-pink-50' },
  transcribed: { label: 'Transcribed', variant: 'outline', color: 'text-blue-600 bg-blue-50' },
  analyzed: { label: 'Analyzed', variant: 'outline', color: 'text-purple-600 bg-purple-50' },
  exported: { label: 'Exported', variant: 'default', color: 'text-green-600 bg-green-50' },
  error: { label: 'Error', variant: 'destructive', color: 'text-red-600 bg-red-50' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    sharedAudioFiles,
    addFiles,
    removeFile,
    updateFileStatus,
    fileStats,
    connectLocalFolder,
    directoryHandle,
  } = useFileStore();

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith('audio/')
      );
      if (fileArray.length === 0) {
        toast({
          title: 'No audio files',
          description: 'Please select audio files (MP3, WAV, FLAC, etc.)',
          variant: 'destructive',
        });
        return;
      }
      await addFiles(fileArray);
      toast({
        title: 'Files uploaded',
        description: `${fileArray.length} audio file(s) added to queue`,
      });
    },
    [addFiles, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const getNextAction = (file: SharedAudioFile) => {
    switch (file.status) {
      case 'uploaded':
      case 'error':
        return {
          label: 'Separate Stems',
          href: '/stem-separation',
          icon: Headphones,
        };
      case 'stems_extracted':
        return {
          label: 'Transcribe',
          href: '/transcription',
          icon: Mic,
        };
      case 'transcribed':
        return {
          label: 'Analyze',
          href: '/audio-analysis',
          icon: BarChart3,
        };
      case 'analyzed':
        return {
          label: 'Export',
          href: '/export',
          icon: Download,
        };
      case 'exported':
        return {
          label: 'Download',
          href: '/export',
          icon: Download,
        };
      default:
        return null;
    }
  };

  const statCards = [
    {
      title: 'Total Files',
      value: fileStats.total,
      icon: FileAudio,
      color: 'bg-slate-500',
    },
    {
      title: 'Stems Ready',
      value: fileStats.stemsExtracted,
      icon: Headphones,
      color: 'bg-pink-500',
    },
    {
      title: 'Transcribed',
      value: fileStats.transcribed,
      icon: Music2,
      color: 'bg-blue-500',
    },
    {
      title: 'Exported',
      value: fileStats.exported,
      icon: CheckCircle2,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your audio workflow and track processing status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => connectLocalFolder()}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {directoryHandle ? 'Folder Connected' : 'Connect Folder'}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Audio
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            className="hidden"
            aria-label="Upload audio files"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${stat.color} p-2.5 rounded-lg text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Dropzone (collapsible, only shown when no files or on drag) */}
      {sharedAudioFiles.length === 0 && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drop audio files here</p>
              <p className="text-sm text-muted-foreground mt-1">
                MP3, WAV, FLAC, OGG, AAC — up to 500MB each
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
          </CardContent>
        </Card>
      )}

      {/* File Queue */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              File Queue
            </CardTitle>
            <Badge variant="outline">{sharedAudioFiles.length} files</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sharedAudioFiles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileAudio className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No files yet</p>
              <p className="text-xs mt-1">
                Upload audio files to start your workflow
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead className="w-[100px]">Size</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Progress</TableHead>
                    <TableHead className="w-[140px]">Updated</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedAudioFiles.map((file) => {
                    const action = getNextAction(file);
                    const cfg = statusConfig[file.status];
                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-muted p-2 rounded-lg">
                              <FileAudio className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">
                                {file.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatBytes(file.size)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={cfg.variant}
                            className={`text-xs ${cfg.color}`}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {file.status === 'processing' ? (
                            <Progress value={file.progress} className="h-2 w-[80px]" />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {timeAgo(
                            file.stepTimestamps.stemsExtracted ??
                              file.stepTimestamps.uploaded
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {action && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(action.href)}
                              >
                                <action.icon className="h-3.5 w-3.5 mr-1" />
                                {action.label}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-red-500"
                              onClick={() => removeFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tools */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Stem Separation',
            desc: 'Isolate instruments',
            icon: Headphones,
            href: '/stem-separation',
            color: 'bg-pink-500',
          },
          {
            title: 'Transcription',
            desc: 'Audio to MIDI',
            icon: Mic,
            href: '/transcription',
            color: 'bg-blue-500',
          },
          {
            title: 'Audio Analysis',
            desc: 'Spectral analysis',
            icon: BarChart3,
            href: '/audio-analysis',
            color: 'bg-purple-500',
          },
          {
            title: 'Export',
            desc: 'Download results',
            icon: Download,
            href: '/export',
            color: 'bg-green-500',
          },
        ].map((tool) => (
          <Link key={tool.title} href={tool.href}>
            <Card className="group hover:shadow-md transition-all cursor-pointer hover:border-primary/30 h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`${tool.color} p-2.5 rounded-lg text-white group-hover:scale-110 transition-transform`}
                >
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tool.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
