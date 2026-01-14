'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
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
import { AnimatedWaveBackground } from '@/components/animated-wave-background';

export default function HomePage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      title: 'Audio Transcription',
      description: 'Convert audio to MIDI with advanced pitch detection algorithms',
      icon: Mic,
      href: '/transcription',
      color: 'from-blue-500 to-blue-600',
      stats: '94.2% accuracy'
    },
    {
      title: 'Piano Roll',
      description: 'Visual note editor with DAW-style music composition',
      icon: Sliders,
      href: '/piano-roll',
      color: 'from-purple-500 to-purple-600',
      stats: 'NEW',
      badge: 'NEW'
    },
    {
      title: 'Stem Separation',
      description: 'Isolate individual instruments from audio files',
      icon: Headphones,
      href: '/stem-separation',
      color: 'from-green-500 to-green-600',
      stats: 'AI-powered'
    },
    {
      title: 'Batch Processing',
      description: 'Process up to 50 files simultaneously',
      icon: Upload,
      href: '/batch-processing',
      color: 'from-orange-500 to-orange-600',
      stats: '50 files',
      badge: 'PRO'
    }
  ];

  const stats = [
    { label: 'Files Processed', value: '1,247+', icon: FileAudio },
    { label: 'Accuracy Rate', value: '94.2%', icon: Target },
    { label: 'Active Users', value: '2.3k', icon: Users },
    { label: 'Uptime', value: '99.9%', icon: Shield }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <AnimatedWaveBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Badge variant="secondary">Enterprise Grade</Badge>
              <span className="text-sm text-muted-foreground">Professional Audio Processing</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Audio Transcription,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Reimagined for Research
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Professional-grade audio transcription and mixing platform built for ethnomusicological research. 
              Powered by Web Audio API with real-time processing capabilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/transcription">
                <Button size="lg" className="text-lg px-8">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Transcribing
                </Button>
              </Link>
              <Link href="/piano-roll">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Sliders className="mr-2 h-5 w-5" />
                  Try Piano Roll
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-16 bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Professional Audio Work
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed for professional audio processing and research
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Link key={index} href={feature.href}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 h-full">
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      {feature.badge && (
                        <Badge variant="secondary" className="mb-2">
                          {feature.badge}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="mb-4">
                        {feature.description}
                      </CardDescription>
                      <div className="flex items-center justify-center text-primary text-sm group-hover:translate-x-1 transition-transform">
                        {feature.stats} <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Upload Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Ready to Get Started?</CardTitle>
                <CardDescription>
                  Upload your audio files and start transcribing immediately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioFileUpload 
                  files={uploadedFiles}
                  onFilesChange={(files) => {
                    setUploadedFiles(files);
                    toast({
                      title: "Files uploaded successfully",
                      description: `Processing ${files.length} file(s) for transcription`,
                    });
                    setTimeout(() => {
                      window.location.href = '/transcription';
                    }, 1000);
                  }}
                  maxFiles={10}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-12">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Transform Your Audio Research Today
                </h2>
                <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                  Join thousands of researchers and audio professionals using Streamlit for accurate, 
                  efficient audio transcription and analysis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary" className="text-lg px-8">
                      View Dashboard
                    </Button>
                  </Link>
                  <Link href="/piano-roll">
                    <Button size="lg" variant="outline" className="text-lg px-8 border-white/20 text-white hover:bg-white/10">
                      Try Piano Roll
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
