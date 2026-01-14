'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Music2,
  Mic,
  Sliders,
  Upload,
  PlayCircle,
  BarChart3,
  Users,
  Clock,
  Star,
  TrendingUp,
  Activity,
  FileAudio,
  Download,
  Settings,
  Headphones,
  Piano,
  Guitar,
  Drum,
  Volume2,
  Zap,
  Shield,
  ArrowRight,
  Plus,
  Search,
  Bell,
  User,
  Calendar,
  Target,
  Award,
  Radio
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AudioFileUpload } from '@/components/audio-file-upload';

export default function Dashboard() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [recentFiles] = useState([
    { name: 'Symphony_No_9.mp3', size: '12.4 MB', date: '2024-01-15', status: 'completed', duration: '4:32' },
    { name: 'Jazz_Improvisation.wav', size: '8.7 MB', date: '2024-01-14', status: 'processing', duration: '3:18' },
    { name: 'Folk_Song_Analysis.flac', size: '15.2 MB', date: '2024-01-13', status: 'completed', duration: '5:45' },
    { name: 'Piano_Sonata.m4a', size: '6.8 MB', date: '2024-01-12', status: 'completed', duration: '6:12' }
  ]);

  const [stats] = useState({
    totalFiles: 1247,
    totalDuration: '48h 32m',
    processedToday: 23,
    accuracy: 94.2,
    storageUsed: '2.4 GB',
    activeProjects: 8
  });

  const quickActions = [
    {
      title: 'Quick Transcribe',
      description: 'Convert audio to MIDI instantly',
      icon: PlayCircle,
      href: '/transcription',
      color: 'bg-blue-500',
      badge: 'FAST'
    },
    {
      title: 'Piano Roll',
      description: 'Visual note editor',
      icon: Sliders,
      href: '/piano-roll',
      color: 'bg-purple-500',
      badge: 'NEW'
    },
    {
      title: 'Batch Processing',
      description: 'Process multiple files',
      icon: Upload,
      href: '/batch-processing',
      color: 'bg-green-500',
      badge: 'PRO'
    },
    {
      title: 'Stem Separation',
      description: 'Isolate individual instruments',
      icon: Headphones,
      href: '/stem-separation',
      color: 'bg-orange-500'
    }
  ];

  const recentProjects = [
    {
      name: 'Classical Music Archive',
      files: 234,
      progress: 78,
      lastModified: '2 hours ago',
      status: 'active'
    },
    {
      name: 'Jazz Transcription Study',
      files: 156,
      progress: 92,
      lastModified: '1 day ago',
      status: 'active'
    },
    {
      name: 'Folk Music Research',
      files: 89,
      progress: 100,
      lastModified: '3 days ago',
      status: 'completed'
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your audio projects today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDuration}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              2 completed this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
                <div className="flex items-center text-primary text-sm mt-3 group-hover:translate-x-1 transition-transform">
                  Get started <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Files */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Files</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileAudio className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.duration} • {file.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={file.status === 'completed' ? 'default' : 'secondary'}>
                      {file.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your active transcription projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.files} files • {project.lastModified}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {project.progress}%
                    </Badge>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Upload</CardTitle>
          <CardDescription>
            Drop audio files here to start transcription immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioFileUpload 
            files={uploadedFiles}
            onFilesChange={(files) => {
              setUploadedFiles(files);
              toast({
                title: "Files uploaded",
                description: `Successfully uploaded ${files.length} file(s)`,
              });
            }}
            maxFiles={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
