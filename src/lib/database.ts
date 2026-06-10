// Local-only database stub — no external dependencies
// All data operations return empty arrays or no-op promises

// ======================
// Type Definitions
// ======================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  tags: string[];
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AudioFile {
  id: string;
  project_id?: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  duration_seconds?: number;
  sample_rate?: number;
  bit_depth?: number;
  channels?: number;
  format?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TranscriptionResult {
  id: string;
  audio_file_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  engine: string;
  confidence_score?: number;
  notes: Note[];
  note_count: number;
  detected_key?: string;
  detected_tempo?: number;
  time_signature?: string;
  detected_instruments: string[];
  processing_time_seconds?: number;
  error_message?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Note {
  pitch: number;
  velocity: number;
  start_time: number;
  duration: number;
  instrument?: string;
}

export interface AudioAnalysis {
  id: string;
  audio_file_id: string;
  user_id: string;
  fundamental_frequency?: number;
  frequency_range_low?: number;
  frequency_range_high?: number;
  spectral_centroid?: number;
  spectral_bandwidth?: number;
  spectral_rolloff?: number;
  peak_amplitude?: number;
  rms_amplitude?: number;
  dynamic_range_db?: number;
  detected_key?: string;
  detected_tempo?: number;
  beat_positions: number[];
  frequency_histogram: Record<string, number>;
  spectral_data: Record<string, unknown>;
  temporal_data: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Annotation {
  id: string;
  audio_file_id: string;
  user_id: string;
  start_time_seconds: number;
  end_time_seconds?: number;
  annotation_type: 'note' | 'marker' | 'segment' | 'region' | 'label';
  title?: string;
  content?: string;
  color: string;
  pitch?: string;
  frequency?: number;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Collaboration {
  id: string;
  project_id: string;
  owner_id: string;
  collaborator_id: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  invited_at: string;
  accepted_at?: string;
}

export interface ExportJob {
  id: string;
  user_id: string;
  job_type: 'midi' | 'csv' | 'json' | 'pdf' | 'musicxml' | 'wav' | 'mp3';
  source_type: 'transcription' | 'analysis' | 'audio_file';
  source_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  output_filename?: string;
  output_path?: string;
  file_size?: number;
  error_message?: string;
  settings: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

// ======================
// Projects API (local stub)
// ======================

export async function getProjects(): Promise<Project[]> {
  return [];
}

export async function getProject(id: string): Promise<Project | null> {
  return null;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  return project as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  return updates as Project;
}

export async function deleteProject(id: string): Promise<void> {
}

// ======================
// Audio Files API (local stub)
// ======================

export async function getAudioFiles(projectId?: string): Promise<AudioFile[]> {
  return [];
}

export async function createAudioFile(audioFile: Partial<AudioFile>): Promise<AudioFile> {
  return audioFile as AudioFile;
}

export async function deleteAudioFile(id: string): Promise<void> {
}

// ======================
// Transcription Results API (local stub)
// ======================

export async function getTranscriptionResults(audioFileId?: string): Promise<TranscriptionResult[]> {
  return [];
}

export async function createTranscriptionResult(result: Partial<TranscriptionResult>): Promise<TranscriptionResult> {
  return result as TranscriptionResult;
}

export async function updateTranscriptionResult(id: string, updates: Partial<TranscriptionResult>): Promise<TranscriptionResult> {
  return updates as TranscriptionResult;
}

// ======================
// Audio Analysis API (local stub)
// ======================

export async function getAudioAnalysis(audioFileId: string): Promise<AudioAnalysis | null> {
  return null;
}

export async function createAudioAnalysis(analysis: Partial<AudioAnalysis>): Promise<AudioAnalysis> {
  return analysis as AudioAnalysis;
}

// ======================
// Annotations API (local stub)
// ======================

export async function getAnnotations(audioFileId: string): Promise<Annotation[]> {
  return [];
}

export async function createAnnotation(annotation: Partial<Annotation>): Promise<Annotation> {
  return annotation as Annotation;
}

export async function updateAnnotation(id: string, updates: Partial<Annotation>): Promise<Annotation> {
  return updates as Annotation;
}

export async function deleteAnnotation(id: string): Promise<void> {
}

// ======================
// Collaborations API (local stub)
// ======================

export async function getProjectCollaborations(projectId: string): Promise<Collaboration[]> {
  return [];
}

export async function inviteCollaborator(projectId: string, collaboratorId: string, role: 'viewer' | 'editor' | 'admin' = 'viewer'): Promise<Collaboration> {
  return { id: '', project_id: projectId, owner_id: '', collaborator_id: collaboratorId, role, status: 'pending', invited_at: new Date().toISOString() };
}

export async function updateCollaborationStatus(id: string, status: 'accepted' | 'declined' | 'revoked'): Promise<Collaboration> {
  return { id, project_id: '', owner_id: '', collaborator_id: '', role: 'viewer', status, invited_at: new Date().toISOString() };
}

// ======================
// Export Jobs API (local stub)
// ======================

export async function getExportJobs(): Promise<ExportJob[]> {
  return [];
}

export async function createExportJob(job: Partial<ExportJob>): Promise<ExportJob> {
  return job as ExportJob;
}

export async function updateExportJobProgress(id: string, progress: number, status?: 'processing' | 'completed' | 'failed'): Promise<ExportJob> {
  return { id, user_id: '', job_type: 'midi', source_type: 'transcription', source_id: '', status: status || 'pending', progress, created_at: new Date().toISOString(), settings: {} };
}

// ======================
// File Storage Helpers (local stub)
// ======================

export async function uploadAudioFile(file: File, projectId?: string): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  return projectId ? `${projectId}/${fileName}` : fileName;
}

export async function getAudioFileUrl(path: string): Promise<string> {
  return path;
}

export async function deleteStoredAudioFile(path: string): Promise<void> {
}
