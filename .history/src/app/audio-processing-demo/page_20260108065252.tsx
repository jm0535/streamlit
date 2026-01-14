'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AudioProcessor, 
  AudioVisualizer, 
  SpectrumAnalyzer 
} from '@/components/audio-processor';
import { 
  AudioEffectsProcessor, 
  AdvancedAudioAnalyzer 
} from '@/components/audio-effects-processor';
import { AudioMixer } from '@/components/audio-mixer';
import {
  Settings,
  Mic,
  Music,
  Headphones,
  Activity,
  Zap,
  Waveform,
  BarChart3,
  Sliders,
  Radio,
  Piano,
  Guitar,
  Drum,
  Volume2,
  Play,
  Pause,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Target,
  Layers,
  Filter
} from 'lucide-react';

export default function AudioProcessingDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'low' | 'medium' | 'high'>('high');

  const demoStats = {
    totalComponents: 6,
    activeProcessors: 2,
    sampleRate: '44.1 kHz',
    bitDepth: '24-bit',
    latency: '2.3ms',
    cpuUsage: '12%'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-500" />
            Audio Processing & Visualization Suite
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive audio processing, effects, and visualization tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {demoStats.totalComponents} Components
          </Badge>
          <Badge variant="default">
            {demoStats.activeProcessors} Active
          </Badge>
          <Badge variant="secondary">
            {demoStats.sampleRate}
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{demoStats.totalComponents}</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{demoStats.activeProcessors}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Radio className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{demoStats.sampleRate}</div>
            <div className="text-sm text-muted-foreground">Sample Rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Volume2 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{demoStats.bitDepth}</div>
            <div className="text-sm text-muted-foreground">Bit Depth</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{demoStats.latency}</div>
            <div className="text-sm text-muted-foreground">Latency</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{demoStats.cpuUsage}</div>
            <div className="text-sm text-muted-foreground">CPU Usage</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processors">Processors</TabsTrigger>
          <TabsTrigger value="visualizers">Visualizers</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="mixer">Mixer</TabsTrigger>
          <TabsTrigger value="analyzers">Analyzers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Audio Processing Features
                </CardTitle>
                <CardDescription>
                  Comprehensive audio processing capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Real-time Processing</div>
                      <div className="text-sm text-muted-foreground">Low-latency audio processing</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Waveform className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Multi-format Support</div>
                      <div className="text-sm text-muted-foreground">MP3, WAV, FLAC, AAC</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sliders className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Advanced Effects</div>
                      <div className="text-sm text-muted-foreground">Reverb, delay, EQ, more</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Visual Analysis</div>
                      <div className="text-sm text-muted-foreground">Spectrum, waveform, 3D</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Technical Specifications
                </CardTitle>
                <CardDescription>
                  Advanced audio processing capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Web Audio API</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sample Rates</span>
                    <Badge variant="outline">22.1kHz - 192kHz</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bit Depths</span>
                    <Badge variant="outline">16-bit - 32-bit</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Channels</span>
                    <Badge variant="outline">Mono - 7.1 Surround</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Buffer Sizes</span>
                    <Badge variant="outline">64 - 4096 samples</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Latency</span>
                    <Badge variant="outline">&lt; 5ms</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Quick Demo
              </CardTitle>
              <CardDescription>
                Try out the audio processing features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col" onClick={() => setActiveTab('processors')}>
                  <Activity className="h-6 w-6 mb-2" />
                  <span>Audio Processor</span>
                </Button>
                <Button className="h-20 flex-col" variant="outline" onClick={() => setActiveTab('visualizers')}>
                  <Waveform className="h-6 w-6 mb-2" />
                  <span>Visualizers</span>
                </Button>
                <Button className="h-20 flex-col" variant="outline" onClick={() => setActiveTab('effects')}>
                  <Sliders className="h-6 w-6 mb-2" />
                  <span>Audio Effects</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processors Tab */}
        <TabsContent value="processors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudioProcessor
              title="Audio Processor"
              description="Real-time audio processing with effects"
              icon={<Activity className="h-5 w-5" />}
            />
            <AudioProcessor
              title="Noise Reduction"
              description="Advanced noise reduction algorithms"
              icon={<Filter className="h-5 w-5" />}
            />
          </div>
        </TabsContent>

        {/* Visualizers Tab */}
        <TabsContent value="visualizers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudioVisualizer type="waveform" height={300} color="#3b82f6" />
            <AudioVisualizer type="bars" height={300} color="#10b981" />
            <AudioVisualizer type="circular" height={300} color="#f59e0b" />
            <SpectrumAnalyzer />
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-6">
          <AudioEffectsProcessor />
        </TabsContent>

        {/* Mixer Tab */}
        <TabsContent value="mixer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Professional Audio Mixer
              </CardTitle>
              <CardDescription>
                Multi-channel audio mixing console
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Start Mixer
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Load Project
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Mix
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Full mixer functionality available in the dedicated mixer page
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyzers Tab */}
        <TabsContent value="analyzers" className="space-y-6">
          <AdvancedAudioAnalyzer />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Audio Processing Suite
          </CardTitle>
          <CardDescription>
            Professional-grade audio processing and visualization tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">6+</div>
              <div className="text-sm text-muted-foreground">Processing Components</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24-bit</div>
              <div className="text-sm text-muted-foreground">Audio Quality</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">&lt;5ms</div>
              <div className="text-sm text-muted-foreground">Latency</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
