'use client';

/**
 * Job Store - Enterprise Job Management with IndexedDB Persistence
 *
 * Provides centralized job tracking for:
 * - Transcription jobs
 * - Stem separation jobs
 * - Audio analysis jobs
 * - Export jobs
 *
 * All jobs are persisted to IndexedDB and survive page refresh.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// ============================================================================
// Types
// ============================================================================

export type JobType = 'transcription' | 'stem-separation' | 'analysis' | 'export';
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'error' | 'cancelled';

export interface JobFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface JobResult {
  downloadUrl?: string;
  blobData?: Blob;
  metadata?: Record<string, unknown>;
  outputFiles?: { name: string; size: number; type: string }[];
}

export interface ProcessingJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  progressMessage?: string;
  files: JobFile[];
  settings?: Record<string, unknown>;
  result?: JobResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface FileProcessingStatus {
  fileId: string;
  fileName: string;
  transcription?: { jobId: string; status: JobStatus; completedAt?: number };
  stemSeparation?: { jobId: string; status: JobStatus; completedAt?: number };
  analysis?: { jobId: string; status: JobStatus; completedAt?: number };
}

// ============================================================================
// Store Interface
// ============================================================================

interface JobStore {
  // State
  jobs: ProcessingJob[];
  fileStatuses: FileProcessingStatus[];

  // Job CRUD
  createJob: (type: JobType, files: JobFile[], settings?: Record<string, unknown>) => string;
  updateJobProgress: (jobId: string, progress: number, message?: string) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  completeJob: (jobId: string, result?: JobResult) => void;
  failJob: (jobId: string, error: string) => void;
  cancelJob: (jobId: string) => void;
  deleteJob: (jobId: string) => void;
  clearCompletedJobs: () => void;

  // Job Queries
  getJob: (jobId: string) => ProcessingJob | undefined;
  getJobsByType: (type: JobType) => ProcessingJob[];
  getJobsByStatus: (status: JobStatus) => ProcessingJob[];
  getActiveJobs: () => ProcessingJob[];
  getPendingJobsCount: () => number;

  // File Processing Status
  getFileStatus: (fileId: string) => FileProcessingStatus | undefined;
  updateFileStatus: (fileId: string, fileName: string, type: 'transcription' | 'stemSeparation' | 'analysis', jobId: string, status: JobStatus) => void;

  // Persistence
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Custom IndexedDB storage adapter for Zustand
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      // Initial State
      jobs: [],
      fileStatuses: [],
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // ======================================================================
      // Job CRUD Operations
      // ======================================================================

      createJob: (type, files, settings) => {
        const jobId = generateJobId();
        const now = Date.now();

        const newJob: ProcessingJob = {
          id: jobId,
          type,
          status: 'pending',
          progress: 0,
          files,
          settings,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          jobs: [newJob, ...state.jobs],
        }));

        console.log(`📋 Job created: ${jobId} (${type})`);
        return jobId;
      },

      updateJobProgress: (jobId, progress, message) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  progress: Math.min(100, Math.max(0, progress)),
                  progressMessage: message,
                  status: job.status === 'pending' ? 'processing' : job.status,
                  updatedAt: Date.now(),
                }
              : job
          ),
        }));
      },

      updateJobStatus: (jobId, status) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? { ...job, status, updatedAt: Date.now() }
              : job
          ),
        }));
      },

      completeJob: (jobId, result) => {
        const now = Date.now();
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'completed' as JobStatus,
                  progress: 100,
                  result,
                  completedAt: now,
                  updatedAt: now,
                }
              : job
          ),
        }));
        console.log(`✅ Job completed: ${jobId}`);
      },

      failJob: (jobId, error) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'error' as JobStatus,
                  error,
                  updatedAt: Date.now(),
                }
              : job
          ),
        }));
        console.error(`❌ Job failed: ${jobId} - ${error}`);
      },

      cancelJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? { ...job, status: 'cancelled' as JobStatus, updatedAt: Date.now() }
              : job
          ),
        }));
      },

      deleteJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== jobId),
        }));
      },

      clearCompletedJobs: () => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.status !== 'completed'),
        }));
      },

      // ======================================================================
      // Job Queries
      // ======================================================================

      getJob: (jobId) => {
        return get().jobs.find((job) => job.id === jobId);
      },

      getJobsByType: (type) => {
        return get().jobs.filter((job) => job.type === type);
      },

      getJobsByStatus: (status) => {
        return get().jobs.filter((job) => job.status === status);
      },

      getActiveJobs: () => {
        return get().jobs.filter(
          (job) => job.status === 'processing' || job.status === 'pending' || job.status === 'queued'
        );
      },

      getPendingJobsCount: () => {
        return get().jobs.filter(
          (job) => job.status === 'pending' || job.status === 'queued'
        ).length;
      },

      // ======================================================================
      // File Processing Status
      // ======================================================================

      getFileStatus: (fileId) => {
        return get().fileStatuses.find((fs) => fs.fileId === fileId);
      },

      updateFileStatus: (fileId, fileName, type, jobId, status) => {
        set((state) => {
          const existing = state.fileStatuses.find((fs) => fs.fileId === fileId);

          if (existing) {
            return {
              fileStatuses: state.fileStatuses.map((fs) =>
                fs.fileId === fileId
                  ? {
                      ...fs,
                      [type]: {
                        jobId,
                        status,
                        completedAt: status === 'completed' ? Date.now() : undefined,
                      },
                    }
                  : fs
              ),
            };
          } else {
            return {
              fileStatuses: [
                ...state.fileStatuses,
                {
                  fileId,
                  fileName,
                  [type]: {
                    jobId,
                    status,
                    completedAt: status === 'completed' ? Date.now() : undefined,
                  },
                },
              ],
            };
          }
        });
      },
    }),
    {
      name: 'job-store',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        jobs: state.jobs,
        fileStatuses: state.fileStatuses,
      }),
    }
  )
);

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to check if store has hydrated from IndexedDB
 */
export function useJobStoreHydrated(): boolean {
  return useJobStore((state) => state._hasHydrated);
}

/**
 * Hook to get active jobs count for UI badges
 */
export function useActiveJobsCount(): number {
  return useJobStore((state) => state.getActiveJobs().length);
}

/**
 * Hook to get jobs for a specific file
 */
export function useFileJobs(fileId: string) {
  return useJobStore((state) => state.getFileStatus(fileId));
}
