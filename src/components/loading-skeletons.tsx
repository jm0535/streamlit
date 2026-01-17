'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading Skeleton Components
 *
 * Provides visual feedback while pages/components are loading.
 * Improves perceived performance for heavy pages like Research sections.
 */

/**
 * Page skeleton with sidebar and main content area
 */
export function PageSkeleton() {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r p-4 space-y-4 hidden md:block">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Card skeleton for dashboard/grid layouts
 */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Analysis result skeleton for research pages
 */
export function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      {/* Upload area skeleton */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>

      {/* Results area skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Audio waveform skeleton
 */
export function WaveformSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

/**
 * Table skeleton for file lists
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 p-3 border-b">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Mixer skeleton for audio mixer view
 */
export function MixerSkeleton() {
  return (
    <div className="flex gap-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-3 p-4 border rounded-lg">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-32 w-4" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Notes/Piano roll skeleton
 */
export function NotesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Piano roll */}
      <div className="border rounded-lg p-4">
        <div className="flex gap-2">
          <div className="space-y-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-12" />
            ))}
          </div>
          <Skeleton className="h-[300px] flex-1" />
        </div>
      </div>
    </div>
  );
}

export default {
  PageSkeleton,
  CardSkeleton,
  AnalysisSkeleton,
  WaveformSkeleton,
  TableSkeleton,
  MixerSkeleton,
  NotesSkeleton,
};
