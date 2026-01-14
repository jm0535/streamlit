'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Upload,
  Play,
  Pause,
  Download,
  Settings,
  FileAudio,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Headphones,
  Sliders,
  Save,
  Mic,
  Piano,
  Guitar,
  Drum,
  Music,
  Waves,
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  FileText,
  Database,
  Radio
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { AudioVisualizer } from '@/components/audio-visualizer';

interface AnalysisResult {
  id: string;
  fileName: string;
  duration: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  fileSize: string;
  
  // Frequency Analysis
  frequencySpectrum: number[];
  dominantFrequency: number;
  frequencyPeaks: Array<{ frequency: number; amplitude: number }>;
  
  // Temporal Analysis
  amplitudeEnvelope: number[];
  rmsLevel: number;
  peakLevel: number;
  dynamicRange: number;
  
  // Musical Analysis
  tempo: number;
  keySignature: string;
  mode: string;
  timeSignature: string;
  
  // Harmonic Analysis
  harmonicContent: number[];
  fundamentalFrequency: number;
  overtones: number[];
  
  // Spectral Analysis
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlux: number;
  zeroCrossingRate: number;
  
  // Instrument Detection
  detectedInstruments: Array<{
    instrument: string;
    confidence: number;
    characteristics: string[];
  }>;
  
  // Quality Metrics
  signalToNoiseRatio: number;
  totalHarmonicDistortion: number;
  dynamicRangeDb: number;
  
  // Metadata
  format: string;
  codec: string;
  bitrate: number;
  metadata: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
  };
}

interface AnalysisSettings {
  enableFrequencyAnalysis: boolean;
  enableTemporalAnalysis: boolean;
  enableMusicalAnalysis: boolean;
  enableHarmonicAnalysis: boolean;
  enableSpectralAnalysis: boolean;
  enableInstrumentDetection: boolean;
  enableQualityMetrics: boolean;
  fftSize: number;
  windowSize: number;
  overlapRatio: number;
}

export default function AudioAnalysisPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    enableFrequencyAnalysis: true,
    enableTemporalAnalysis: true,
    enableMusicalAnalysis: true,
    enableHarmonicAnalysis: true,
    enableSpectralAnalysis: true,
    enableInstrumentDetection: true,
    enableQualityMetrics: true,
    fftSize: 2048,
    windowSize: 1024,
    overlapRatio: 0.5
  });

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
    setResults([]);
    setSelectedResult(null);
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready for analysis`,
    });
  }, [toast]);

  const startAnalysis = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const newResults: AnalysisResult[] = [];
      
      for (const file of uploadedFiles) {
        // Simulate analysis time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResult: AnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: Math.random() * 300 + 60,
          sampleRate: 44100,
          bitDepth: 16,
          channels: 2,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          
          frequencySpectrum: Array.from({ length: 256 }, () => Math.random()),
          dominantFrequency: Math.random() * 2000 + 100,
          frequencyPeaks: Array.from({ length: 10 }, (_, i) => ({
            frequency: Math.random() * 5000 + 50,
            amplitude: Math.random()
          })),
          
          amplitudeEnvelope: Array.from({ length: 100 }, () => Math.random()),
          rmsLevel: Math.random() * 0.5 + 0.1,
          peakLevel: Math.random() * 0.9 + 0.1,
          dynamicRange: Math.random() * 40 + 20,
          
          tempo: Math.floor(Math.random() * 60) + 80,
          keySignature: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'][Math.floor(Math.random() * 8)],
          mode: ['Major', 'Minor'][Math.floor(Math.random() * 2)],
          timeSignature: ['4/4', '3/4', '6/8', '2/4'][Math.floor(Math.random() * 4)],
          
          harmonicContent: Array.from({ length: 12 }, () => Math.random()),
          fundamentalFrequency: Math.random() * 500 + 50,
          overtones: Array.from({ length: 8 }, (_, i) => (i + 2) * (Math.random() * 500 + 50)),
          
          spectralCentroid: Math.random() * 3000 + 500,
          spectralRolloff: Math.random() * 4000 + 1000,
          spectralFlux: Math.random() * 0.1,
          zeroCrossingRate: Math.random() * 0.1,
          
          detectedInstruments: [
            {
              instrument: 'Piano',
              confidence: Math.random() * 0.3 + 0.7,
              characteristics: ['Harmonic', 'Melodic', 'Wide dynamic range']
            },
            {
              instrument: 'Violin',
              confidence: Math.random() * 0.3 + 0.6,
              characteristics: ['High frequency', 'Sustained notes', 'Expressive']
            }
          ].slice(0, Math.floor(Math.random() * 2) + 1),
          
          signalToNoiseRatio: Math.random() * 40 + 40,
          totalHarmonicDistortion: Math.random() * 2 + 0.5,
          dynamicRangeDb: Math.random() * 30 + 40,
          
          format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          codec: 'PCM',
          bitrate: Math.floor(Math.random() * 500) + 128,
          metadata: {
            title: 'Sample Title',
            artist: 'Sample Artist',
            album: 'Sample Album',
            genre: 'Classical',
            year: 2024
          }
        };
        
        newResults.push(mockResult);
      }
      
      setResults(newResults);
      setSelectedResult(newResults[0]);
      
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${newResults.length} file(s)`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedFiles, toast]);

  const exportAnalysis = useCallback((result: AnalysisResult) => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analysis exported",
      description: `Exported analysis for ${result.fileName}`,
    });
  }, [toast]);

  const exportCSV = useCallback((result: AnalysisResult) => {
    const csv = [
      'Metric,Value,Unit',
      `Duration,${result.duration},seconds`,
      `Sample Rate,${result.sampleRate},Hz`,
      `Bit Depth,${result.bitDepth},bits`,
      `Channels,${result.channels},`,
      `Tempo,${result.tempo},BPM`,
      `Dominant Frequency,${result.dominantFrequency},Hz`,
      `Fundamental Frequency,${result.fundamentalFrequency},Hz`,
      `Spectral Centroid,${result.spectralCentroid},Hz`,
      `Signal to Noise Ratio,${result.signalToNoiseRatio},dB`,
      `Total Harmonic Distortion,${result.totalHarmonicDistortion},%`,
      `Dynamic Range,${result.dynamicRangeDb},dB`
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}_analysis.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV exported",
      description: `Exported analysis summary as CSV`,
    });
  }, [toast]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Audio Analysis
          </h1>
          <p className="text-muted-foreground">
            Comprehensive audio analysis including frequency, temporal, and spectral characteristics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Analysis Settings
          </Button>
          <Button 
            onClick={startAnalysis}
            disabled={isAnalyzing || uploadedFiles.length === 0}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Upload & Settings */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Audio Files
              </CardTitle>
              <CardDescription>
                Supported formats: MP3, WAV, FLAC, M4A
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioFileUpload 
                files={uploadedFiles}
                onFilesChange={handleFileUpload}
                maxFiles={10}
              />
            </CardContent>
          </Card>

          {/* Analysis Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Analysis Modules</label>
                <div className="space-y-2">
                  {[
                    { key: 'enableFrequencyAnalysis', label: 'Frequency Analysis' },
                    { key: 'enableTemporalAnalysis', label: 'Temporal Analysis' },
                    { key: 'enableMusicalAnalysis', label: 'Musical Analysis' },
                    { key: 'enableHarmonicAnalysis', label: 'Harmonic Analysis' },
                    { key: 'enableSpectralAnalysis', label: 'Spectral Analysis' },
                    { key: 'enableInstrumentDetection', label: 'Instrument Detection' },
                    { key: 'enableQualityMetrics', label: 'Quality Metrics' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={analysisSettings[key as keyof AnalysisSettings]}
                        onCheckedChange={(checked) => setAnalysisSettings(prev => ({
                          ...prev,
                          [key]: checked
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="fft-size">FFT Size</Label>
                <select
                  id="fft-size"
                  value={analysisSettings.fftSize}
                  onChange={(e) => setAnalysisSettings(prev => ({
                    ...prev,
                    fftSize: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border rounded-md"
                  aria-label="Select FFT size for frequency analysis"
                  title="Choose the FFT size for spectral analysis"
                >
                  <option value={256}>256</option>
                  <option value={512}>512</option>
                  <option value={1024}>1024</option>
                  <option value={2048}>2048</option>
                  <option value={4096}>4096</option>
                  <option value={8192}>8192</option>
                </select>
              </div>

              <div>
                <Label htmlFor="window-size">Window Size</Label>
                <select
                  id="window-size"
                  value={analysisSettings.windowSize}
                  onChange={(e) => setAnalysisSettings(prev => ({
                    ...prev,
                    windowSize: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border rounded-md"
                  aria-label="Select window size for analysis"
                  title="Choose the window size for signal processing"
                >
                  <option value={256}>256</option>
                  <option value={512}>512</option>
                  <option value={1024}>1024</option>
                  <option value={2048}>2048</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Overlap Ratio</label>
                <Slider
                  value={[analysisSettings.overlapRatio]}
                  onValueChange={([value]) => setAnalysisSettings(prev => ({
                    ...prev,
                    overlapRatio: value
                  }))}
                  max={0.9}
                  min={0}
                  step={0.1}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {(analysisSettings.overlapRatio * 100).toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                {results.length} file(s) analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">Upload files and start analysis</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedResult?.id === result.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.fileName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {Math.floor(result.duration / 60)}:{(result.duration % 60).toFixed(0).padStart(2, '0')}
                            <Activity className="h-3 w-3" />
                            {result.sampleRate} Hz
                            <Volume2 className="h-3 w-3" />
                            {result.bitDepth} bit
                            <TrendingUp className="h-3 w-3" />
                            {result.tempo} BPM
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {result.detectedInstruments.map((instrument, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {instrument.instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          {selectedResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Detailed Analysis
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportCSV(selectedResult)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportAnalysis(selectedResult)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedResult.fileName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="frequency">Frequency</TabsTrigger>
                    <TabsTrigger value="temporal">Temporal</TabsTrigger>
                    <TabsTrigger value="musical">Musical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-lg font-bold">
                                {Math.floor(selectedResult.duration / 60)}:{(selectedResult.duration % 60).toFixed(0).padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Sample Rate</p>
                              <p className="text-lg font-bold">{selectedResult.sampleRate} Hz</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">Bit Depth</p>
                              <p className="text-lg font-bold">{selectedResult.bitDepth} bit</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">Channels</p>
                              <p className="text-lg font-bold">{selectedResult.channels}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">File Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Format:</span>
                            <span>{selectedResult.format}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Codec:</span>
                            <span>{selectedResult.codec}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bitrate:</span>
                            <span>{selectedResult.bitrate} kbps</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>File Size:</span>
                            <span>{selectedResult.fileSize}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Quality Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>SNR:</span>
                            <span>{selectedResult.signalToNoiseRatio.toFixed(1)} dB</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>THD:</span>
                            <span>{selectedResult.totalHarmonicDistortion.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Dynamic Range:</span>
                            <span>{selectedResult.dynamicRangeDb.toFixed(1)} dB</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>RMS Level:</span>
                            <span>{(selectedResult.rmsLevel * 100).toFixed(1)}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="frequency" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Frequency Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Dominant Frequency:</span>
                            <span>{selectedResult.dominantFrequency.toFixed(1)} Hz</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Fundamental:</span>
                            <span>{selectedResult.fundamentalFrequency.toFixed(1)} Hz</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Centroid:</span>
                            <span>{selectedResult.spectralCentroid.toFixed(1)} Hz</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Rolloff:</span>
                            <span>{selectedResult.spectralRolloff.toFixed(1)} Hz</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Harmonic Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Overtones:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedResult.overtones.slice(0, 6).map((freq, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {freq.toFixed(0)} Hz
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Frequency Spectrum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                          <Radio className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="temporal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Amplitude Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>RMS Level:</span>
                            <span>{(selectedResult.rmsLevel * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Peak Level:</span>
                            <span>{(selectedResult.peakLevel * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Dynamic Range:</span>
                            <span>{selectedResult.dynamicRange.toFixed(1)} dB</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Zero Crossing Rate:</span>
                            <span>{selectedResult.zeroCrossingRate.toFixed(4)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Spectral Features</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Spectral Flux:</span>
                            <span>{selectedResult.spectralFlux.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Centroid:</span>
                            <span>{selectedResult.spectralCentroid.toFixed(1)} Hz</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Rolloff:</span>
                            <span>{selectedResult.spectralRolloff.toFixed(1)} Hz</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Amplitude Envelope</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                          <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="musical" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Musical Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Tempo:</span>
                            <span>{selectedResult.tempo} BPM</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Key Signature:</span>
                            <span>{selectedResult.keySignature} {selectedResult.mode}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Time Signature:</span>
                            <span>{selectedResult.timeSignature}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Detected Instruments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedResult.detectedInstruments.map((instrument, idx) => (
                              <div key={idx} className="p-2 border rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{instrument.instrument}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {(instrument.confidence * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {instrument.characteristics.map((char, charIdx) => (
                                    <Badge key={charIdx} variant="secondary" className="text-xs">
                                      {char}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Analyzing audio files...</p>
                <Progress value={undefined} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
