'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFileStore } from '@/lib/file-store';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mic,
  FileAudio,
  Download,
  Piano,
  Headphones,
  Package,
  ArrowRight,
  Shield,
  Clock,
  Upload,
  PlayCircle,
  FolderOpen,
  Zap,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioFileUpload } from '@/components/audio-file-upload';

import { preloadAudioAssets } from '@/lib/audio-playback';

export default function Dashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Zustand store for persisting files
  const { addFiles } = useFileStore();

  useEffect(() => {
    // Preload audio assets for instant playback experience later
    preloadAudioAssets();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Use a loading state while checking auth
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Simulated recent files (in real app, would come from IndexedDB or local storage)
  const recentFiles = [
    { name: 'Symphony_No_9.mp3', duration: '4:32', date: 'Today', notes: 156 },
    { name: 'Jazz_Improvisation.wav', duration: '3:18', date: 'Yesterday', notes: 89 },
    { name: 'Folk_Song.flac', duration: '5:45', date: '3 days ago', notes: 234 },
  ];

  const quickActions = [
    { title: 'Stem Separation', description: 'Isolate instruments', icon: Headphones, href: '/stem-separation', color: 'bg-pink-500' },
    { title: 'Transcription', description: 'Analyze audio files', icon: Mic, href: '/transcription', color: 'bg-blue-500' },
    { title: 'Notes', description: 'View and edit notes', icon: Piano, href: '/notes', color: 'bg-purple-500' },
    { title: 'Batch Processing', description: 'Process multiple files', icon: Package, href: '/batch-processing', color: 'bg-orange-500' },
  ];

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      toast({
        title: 'Files ready',
        description: `${files.length} file(s) selected. Click "Start Workflow" to begin.`,
      });
    }
  };

  const handleQuickTranscribe = async () => {
    if (uploadedFiles.length > 0) {
      setIsNavigating(true);

      toast({
        title: 'Processing files...',
        description: `Persisting ${uploadedFiles.length} file(s) for workflow`,
      });

      // Store files in Zustand store (handles persistence to IDB)
      await addFiles(uploadedFiles);

      toast({
        title: 'Ready for processing',
        description: `Files saved to session`,
      });

      // Navigate to stem separation page (start of workflow)
      router.push('/stem-separation');
    } else {
      toast({
        title: 'No files selected',
        description: 'Please upload audio files first',
        variant: 'destructive',
      });
    }
  };

  const handleBatchProcess = async () => {
    if (uploadedFiles.length > 0) {
      toast({
        title: 'Processing files...',
        description: `Persisting ${uploadedFiles.length} file(s) for batch processing`,
      });
      await addFiles(uploadedFiles);
      router.push('/batch-processing');
    } else {
      router.push('/batch-processing');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Upload audio files and start your research workflow
          </p>
        </div>
      </div>

      {/* Quick Upload */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Drop files here to start transcription immediately
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AudioFileUpload
            files={uploadedFiles}
            onFilesChange={handleFilesChange}
            maxFiles={10}
          />
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              {/* Selected Files Preview */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">
                  Selected Files ({uploadedFiles.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileAudio className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleQuickTranscribe}
                  className="flex-1"
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  )}
                  Start Workflow ({uploadedFiles.length})
                </Button>
                <Button variant="outline" onClick={handleBatchProcess}>
                  <Package className="h-4 w-4 mr-2" />
                  Batch Process
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid - Equal columns */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Tools</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="group hover:shadow-md transition-all cursor-pointer hover:border-primary/30 h-full">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`${action.color} p-2.5 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Files</h2>
            <Link href="/files" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              {recentFiles.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent files</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentFiles.map((file, index) => (
                    <div key={index} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                          <FileAudio className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{file.duration}</span>
                            <span>•</span>
                            <span>{file.notes} notes</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.date}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow Guide */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm font-medium">Upload</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm font-medium">Transcribe</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm font-medium">Export</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/help">
                Learn more
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
