import { supabase } from './supabase';

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
// Projects API
// ======================

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ======================
// Audio Files API
// ======================

export async function getAudioFiles(projectId?: string): Promise<AudioFile[]> {
  let query = supabase
    .from('audio_files')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAudioFile(audioFile: Partial<AudioFile>): Promise<AudioFile> {
  const { data, error } = await supabase
    .from('audio_files')
    .insert(audioFile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAudioFile(id: string): Promise<void> {
  const { error } = await supabase
    .from('audio_files')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ======================
// Transcription Results API
// ======================

export async function getTranscriptionResults(audioFileId?: string): Promise<TranscriptionResult[]> {
  let query = supabase
    .from('transcription_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (audioFileId) {
    query = query.eq('audio_file_id', audioFileId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createTranscriptionResult(result: Partial<TranscriptionResult>): Promise<TranscriptionResult> {
  const { data, error } = await supabase
    .from('transcription_results')
    .insert(result)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTranscriptionResult(id: string, updates: Partial<TranscriptionResult>): Promise<TranscriptionResult> {
  const { data, error } = await supabase
    .from('transcription_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ======================
// Audio Analysis API
// ======================

export async function getAudioAnalysis(audioFileId: string): Promise<AudioAnalysis | null> {
  const { data, error } = await supabase
    .from('audio_analysis')
    .select('*')
    .eq('audio_file_id', audioFileId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createAudioAnalysis(analysis: Partial<AudioAnalysis>): Promise<AudioAnalysis> {
  const { data, error } = await supabase
    .from('audio_analysis')
    .insert(analysis)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ======================
// Annotations API
// ======================

export async function getAnnotations(audioFileId: string): Promise<Annotation[]> {
  const { data, error } = await supabase
    .from('annotations')
    .select('*')
    .eq('audio_file_id', audioFileId)
    .order('start_time_seconds', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createAnnotation(annotation: Partial<Annotation>): Promise<Annotation> {
  const { data, error } = await supabase
    .from('annotations')
    .insert(annotation)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAnnotation(id: string, updates: Partial<Annotation>): Promise<Annotation> {
  const { data, error } = await supabase
    .from('annotations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnnotation(id: string): Promise<void> {
  const { error } = await supabase
    .from('annotations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ======================
// Collaborations API
// ======================

export async function getProjectCollaborations(projectId: string): Promise<Collaboration[]> {
  const { data, error } = await supabase
    .from('collaborations')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data || [];
}

export async function inviteCollaborator(projectId: string, collaboratorId: string, role: 'viewer' | 'editor' | 'admin' = 'viewer'): Promise<Collaboration> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('collaborations')
    .insert({
      project_id: projectId,
      owner_id: user?.id,
      collaborator_id: collaboratorId,
      role,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollaborationStatus(id: string, status: 'accepted' | 'declined' | 'revoked'): Promise<Collaboration> {
  const updates: Partial<Collaboration> = { status };
  if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('collaborations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ======================
// Export Jobs API
// ======================

export async function getExportJobs(): Promise<ExportJob[]> {
  const { data, error } = await supabase
    .from('export_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function createExportJob(job: Partial<ExportJob>): Promise<ExportJob> {
  const { data, error } = await supabase
    .from('export_jobs')
    .insert(job)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExportJobProgress(id: string, progress: number, status?: 'processing' | 'completed' | 'failed'): Promise<ExportJob> {
  const updates: Partial<ExportJob> = { progress };
  if (status) {
    updates.status = status;
    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('export_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ======================
// File Storage Helpers
// ======================

export async function uploadAudioFile(file: File, projectId?: string): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = projectId ? `${projectId}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(filePath, file);

  if (error) throw error;
  return data.path;
}

export async function getAudioFileUrl(path: string): Promise<string> {
  const { data } = supabase.storage
    .from('audio-files')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteStoredAudioFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('audio-files')
    .remove([path]);

  if (error) throw error;
}
