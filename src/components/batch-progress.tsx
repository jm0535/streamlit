'use client';

import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ProcessingFile {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  notes?: number;
  error?: string;
}

interface BatchProgressProps {
  files: ProcessingFile[];
  current: number;
  total: number;
  currentFile?: string;
}

export function BatchProgress({
  files,
  current,
  total,
  currentFile,
}: BatchProgressProps) {
  const completed = files.filter(f => f.status === 'completed').length;
  const errors = files.filter(f => f.status === 'error').length;
  const processing = files.filter(f => f.status === 'processing').length;
  const progress = total > 0 ? (current / total) * 100 : 0;

  const getStatusIcon = (status: ProcessingFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'pending':
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusText = (status: ProcessingFile['status'], notes?: number) => {
    switch (status) {
      case 'completed':
        return `${notes || 0} notes extracted`;
      case 'error':
        return 'Processing failed';
      case 'processing':
        return 'Analyzing...';
      case 'pending':
        return 'Waiting...';
    }
  };

  const getStatusClass = (status: ProcessingFile['status']) => {
    switch (status) {
      case 'completed':
        return 'border-l-4 border-l-green-500';
      case 'error':
        return 'border-l-4 border-l-red-500';
      case 'processing':
        return 'border-l-4 border-l-primary';
      case 'pending':
        return 'border-l-4 border-l-muted';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Batch Processing Progress
            </h3>
            <span className="text-sm text-muted-foreground">
              {current} / {total} files
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          {currentFile && (
            <p className="text-sm text-muted-foreground text-center">
              Processing: {currentFile}
            </p>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{errors}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{processing}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              File Status
            </h4>

            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`
                      flex items-center gap-3 p-3 bg-muted/50 rounded-lg
                      ${getStatusClass(file.status)}
                    `}
                  >
                    <div className="flex-shrink-0">{getStatusIcon(file.status)}</div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusText(file.status, file.notes)}
                      </p>

                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {file.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Summary */}
        {current === total && total > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-900 dark:text-green-100">
                Batch Processing Complete
              </p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {completed} of {total} files processed successfully
              {errors > 0 && ` (${errors} files had errors)`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
