'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Music2,
  Mic,
  Upload,
  PlayCircle,
  FileAudio,
  Download,
  Piano,
  Headphones,
  Package,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioFileUpload } from '@/components/audio-file-upload';

export default function HomePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const workflow = [
    {
      step: 1,
      title: 'Upload Audio',
      description: 'Drop your audio files (MP3, WAV, FLAC)',
      icon: Upload,
    },
    {
      step: 2,
      title: 'Separate Stems',
      description: 'Isolate vocals, drums, bass, and other instruments',
      icon: Headphones,
    },
    {
      step: 3,
      title: 'Analyze & Transcribe',
      description: 'Extract notes, tempo, and musical data',
      icon: BarChart3,
    },
    {
      step: 4,
      title: 'Export Results',
      description: 'Download MIDI, PDF, or CSV files',
      icon: Download,
    },
  ];

  const features = [
    {
      title: 'Transcription',
      description: 'Convert audio to musical notes with pitch detection',
      icon: Mic,
      href: '/transcription',
      color: 'bg-blue-500',
    },
    {
      title: 'Notes',
      description: 'View and edit notes in DAW-style grid',
      icon: Piano,
      href: '/notes',
      color: 'bg-purple-500',
    },
    {
      title: 'Batch Processing',
      description: 'Process multiple files at once',
      icon: Package,
      href: '/batch-processing',
      color: 'bg-orange-500',
    },
    {
      title: 'Stem Separation',
      description: 'Isolate individual instruments',
      icon: Headphones,
      href: '/stem-separation',
      color: 'bg-green-500',
    },
  ];

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      toast({
        title: 'Files ready',
        description: `${files.length} file(s) selected. Click "Start Workflow" to analyze.`,
      });
    }
  };

  const handleStartTranscription = () => {
    if (uploadedFiles.length > 0) {
      // Store files in session storage for workflow
      sessionStorage.setItem('pendingFiles', JSON.stringify(uploadedFiles.map(f => f.name)));
      router.push('/stem-separation');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Audio Research Made Simple
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transcribe audio to musical notes, analyze frequencies, and export research data.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>All files stay on your device - 100% private</span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {workflow.map((step, index) => (
          <div key={step.step} className="relative">
            <Card className="text-center h-full">
              <CardHeader className="pb-2">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="w-fit mx-auto mb-2">
                  Step {step.step}
                </Badge>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
            {index < workflow.length - 1 && (
              <ArrowRight className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Upload */}
      <Card className="max-w-3xl mx-auto border-2 border-dashed border-primary/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Drop your audio files here to begin transcription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AudioFileUpload
            files={uploadedFiles}
            onFilesChange={handleFilesChange}
            maxFiles={10}
          />
          {uploadedFiles.length > 0 && (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleStartTranscription}>
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Workflow
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Research Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="group hover:shadow-lg transition-all cursor-pointer h-full hover:border-primary/30">
                <CardHeader className="pb-2">
                  <div className={`${feature.color} p-2.5 rounded-lg w-fit text-white group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
