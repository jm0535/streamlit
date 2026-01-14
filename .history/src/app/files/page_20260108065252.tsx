'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  FileAudio,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Clock,
  Calendar,
  Music,
  Play,
  Pause,
  MoreHorizontal,
  FolderOpen,
  Star,
  Tag,
  Eye,
  Edit,
  Share,
  Archive,
  DownloadCloud,
  HardDrive,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { AudioVisualizer } from '@/components/audio-visualizer';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  uploadDate: Date;
  lastModified: Date;
  tags: string[];
  starred: boolean;
  processed: boolean;
  transcription?: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
  };
  stemSeparation?: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
  };
  analysis?: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
  };
}

export default function FilesPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'duration'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'processed' | 'unprocessed' | 'starred'>('all');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // Mock data
  React.useEffect(() => {
    const mockFiles: AudioFile[] = [
      {
        id: '1',
        name: 'Classical Piano Sonata.mp3',
        size: 15728640,
        duration: 245.5,
        format: 'MP3',
        sampleRate: 44100,
        bitDepth: 16,
        channels: 2,
        uploadDate: new Date('2024-01-15'),
        lastModified: new Date('2024-01-16'),
        tags: ['classical', 'piano', 'sonata'],
        starred: true,
        processed: true,
        transcription: {
          id: 't1',
          status: 'completed',
          progress: 100
        },
        stemSeparation: {
          id: 's1',
          status: 'completed',
          progress: 100
        },
        analysis: {
          id: 'a1',
          status: 'completed',
          progress: 100
        }
      },
      {
        id: '2',
        name: 'Jazz Guitar Solo.wav',
        size: 31457280,
        duration: 180.3,
        format: 'WAV',
        sampleRate: 48000,
        bitDepth: 24,
        channels: 2,
        uploadDate: new Date('2024-01-14'),
        lastModified: new Date('2024-01-14'),
        tags: ['jazz', 'guitar', 'solo'],
        starred: false,
        processed: false,
        transcription: {
          id: 't2',
          status: 'processing',
          progress: 65
        }
      },
      {
        id: '3',
        name: 'Electronic Music Production.flac',
        size: 52428800,
        duration: 320.7,
        format: 'FLAC',
        sampleRate: 96000,
        bitDepth: 24,
        channels: 2,
        uploadDate: new Date('2024-01-13'),
        lastModified: new Date('2024-01-15'),
        tags: ['electronic', 'production', 'flac'],
        starred: false,
        processed: true,
        transcription: {
          id: 't3',
          status: 'completed',
          progress: 100
        },
        stemSeparation: {
          id: 's3',
          status: 'pending',
          progress: 0
        }
      }
    ];
    setAudioFiles(mockFiles);
  }, []);

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
    
    // Convert to AudioFile format
    const newAudioFiles: AudioFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      duration: Math.random() * 300 + 60, // Mock duration
      format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
      uploadDate: new Date(),
      lastModified: new Date(),
      tags: [],
      starred: false,
      processed: false
    }));
    
    setAudioFiles(prev => [...prev, ...newAudioFiles]);
    
    toast({
      title: "Files uploaded successfully",
      description: `${files.length} file(s) added to your library`,
    });
  }, [toast]);

  const handleFileSelect = useCallback((fileId: string, selected: boolean) => {
    setSelectedFiles(prev => 
      selected 
        ? [...prev, fileId]
        : prev.filter(id => id !== fileId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const filteredFiles = getFilteredFiles();
    setSelectedFiles(
      selectedFiles.length === filteredFiles.length 
        ? [] 
        : filteredFiles.map(f => f.id)
    );
  }, [selectedFiles]);

  const handleDeleteFiles = useCallback(() => {
    setAudioFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
    toast({
      title: "Files deleted",
      description: `${selectedFiles.length} file(s) removed`,
    });
  }, [selectedFiles, toast]);

  const handleStarFile = useCallback((fileId: string) => {
    setAudioFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, starred: !f.starred } : f
    ));
  }, []);

  const handleProcessFiles = useCallback((processType: 'transcription' | 'stem-separation' | 'analysis') => {
    setSelectedFiles(prev => {
      const filesToProcess = prev.length > 0 ? prev : getFilteredFiles().map(f => f.id);
      
      setAudioFiles(audioFiles => audioFiles.map(file => {
        if (filesToProcess.includes(file.id)) {
          const processKey = processType === 'transcription' ? 'transcription' : 
                           processType === 'stem-separation' ? 'stemSeparation' : 'analysis';
          
          return {
            ...file,
            [processKey]: {
              id: `${processType}-${file.id}`,
              status: 'processing' as const,
              progress: 0
            }
          };
        }
        return file;
      }));
      
      return prev;
    });
    
    toast({
      title: "Processing started",
      description: `${processType} initiated for selected files`,
    });
  }, [toast]);

  const getFilteredFiles = useCallback(() => {
    let filtered = audioFiles;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterBy === 'processed') {
      filtered = filtered.filter(file => file.processed);
    } else if (filterBy === 'unprocessed') {
      filtered = filtered.filter(file => !file.processed);
    } else if (filterBy === 'starred') {
      filtered = filtered.filter(file => file.starred);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case 'size':
          return b.size - a.size;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [audioFiles, searchQuery, filterBy, sortBy]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const filteredFiles = getFilteredFiles();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Management</h1>
          <p className="text-muted-foreground">
            Manage and organize your audio files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Audio Files</CardTitle>
          <CardDescription>
            Add new audio files to your library for processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioFileUpload 
            files={uploadedFiles}
            onFilesChange={handleFileUpload}
            maxFiles={50}
            accept={['audio/*']}
          />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterBy === 'all' ? 'All Files' : 
                 filterBy === 'processed' ? 'Processed' :
                 filterBy === 'unprocessed' ? 'Unprocessed' : 'Starred'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                All Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('processed')}>
                Processed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('unprocessed')}>
                Unprocessed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('starred')}>
                Starred
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                {sortBy === 'name' ? 'Name' :
                 sortBy === 'date' ? 'Date' :
                 sortBy === 'size' ? 'Size' : 'Duration'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('date')}>
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size')}>
                Sort by Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('duration')}>
                Sort by Duration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          {selectedFiles.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleDeleteFiles}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedFiles.length})
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Process
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleProcessFiles('transcription')}>
                    Transcription
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProcessFiles('stem-separation')}>
                    Stem Separation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProcessFiles('analysis')}>
                    Audio Analysis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audio Files ({filteredFiles.length})</CardTitle>
              <CardDescription>
                {selectedFiles.length > 0 && `${selectedFiles.length} selected`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload some audio files to get started'}
              </p>
              <Button onClick={() => document.querySelector('input[type="file"]')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className={`cursor-pointer transition-colors ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => handleFileSelect(file.id, e.target.checked)}
                          className="mt-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStarFile(file.id)}
                          className="p-1"
                        >
                          <Star className={`h-4 w-4 ${file.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>{formatFileSize(file.size)} • {formatDuration(file.duration)}</div>
                          <div>{file.format} • {file.sampleRate}Hz • {file.bitDepth}bit</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getStatusIcon(file.transcription?.status || 'pending')}
                          <span>Transcription</span>
                          {file.transcription?.status === 'processing' && (
                            <Progress value={file.transcription.progress} className="flex-1 h-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {getStatusIcon(file.stemSeparation?.status || 'pending')}
                          <span>Stems</span>
                          {file.stemSeparation?.status === 'processing' && (
                            <Progress value={file.stemSeparation.progress} className="flex-1 h-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {getStatusIcon(file.analysis?.status || 'pending')}
                          <span>Analysis</span>
                          {file.analysis?.status === 'processing' && (
                            <Progress value={file.analysis.progress} className="flex-1 h-1" />
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Metadata
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <Card key={file.id} className={`cursor-pointer transition-colors ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => handleFileSelect(file.id, e.target.checked)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          {file.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{formatDuration(file.duration)}</span>
                          <span>{file.format}</span>
                          <span>{file.sampleRate}Hz</span>
                          <span>{file.bitDepth}bit</span>
                          <span>{file.channels}ch</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {file.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            {getStatusIcon(file.transcription?.status || 'pending')}
                            <span>Transcription</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs mb-1">
                            {getStatusIcon(file.stemSeparation?.status || 'pending')}
                            <span>Stems</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {getStatusIcon(file.analysis?.status || 'pending')}
                            <span>Analysis</span>
                          </div>
                        </div>

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
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Metadata
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-lg font-bold">2.4 GB / 10 GB</p>
              </div>
            </div>
            <Progress value={24} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileAudio className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-lg font-bold">{audioFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Processed</p>
                <p className="text-lg font-bold">
                  {audioFiles.filter(f => f.processed).length} / {audioFiles.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
