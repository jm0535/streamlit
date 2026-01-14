'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AudioFileUploadProps {
  files?: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
}

export function AudioFileUpload({
  files = [],
  onFilesChange,
  maxFiles = 50,
  maxSize = 50 * 1024 * 1024, // 50MB default
  accept = ['audio/*'],
}: AudioFileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);
    },
    [files, onFilesChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept.length > 0 ? { 'audio/*': [] } : undefined,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const clearAll = () => {
    onFilesChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={`
          relative cursor-pointer border-2 border-dashed p-12
          transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            {isDragActive ? (
              <Upload className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              <FileAudio className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragActive
                ? 'Drop audio files here'
                : 'Drag and drop audio files'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse your computer
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded">MP3</span>
            <span className="px-2 py-1 bg-muted rounded">WAV</span>
            <span className="px-2 py-1 bg-muted rounded">M4A</span>
            <span className="px-2 py-1 bg-muted rounded">FLAC</span>
            <span className="px-2 py-1 bg-muted rounded">OGG</span>
            <span className="px-2 py-1 bg-muted rounded">AAC</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files • Up to {Math.round(maxSize / 1024 / 1024)}MB each
          </p>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">
                Selected Files ({files.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                Ready for transcription
              </p>
            </div>
            {files.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                >
                  <FileAudio className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
