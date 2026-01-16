-- Streamlit Audio Research Platform - Database Schema
-- This schema extends Supabase Auth with research-specific tables

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================
-- Projects Table
-- Stores research projects/workspaces
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  tags TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Audio Files Table
-- Stores metadata for uploaded audio files
-- ============================================
CREATE TABLE IF NOT EXISTS audio_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  duration_seconds DECIMAL(10, 3),
  sample_rate INTEGER,
  bit_depth INTEGER,
  channels INTEGER,
  format VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_project_id ON audio_files(project_id);

ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audio files" ON audio_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audio files" ON audio_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audio files" ON audio_files
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Transcription Results Table
-- Stores transcription/analysis results
-- ============================================
CREATE TABLE IF NOT EXISTS transcription_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  engine VARCHAR(100) DEFAULT 'default',
  confidence_score DECIMAL(5, 4),

  -- Note data (JSONB for flexibility)
  notes JSONB DEFAULT '[]',
  note_count INTEGER DEFAULT 0,

  -- Musical analysis
  detected_key VARCHAR(20),
  detected_tempo DECIMAL(6, 2),
  time_signature VARCHAR(10),
  detected_instruments TEXT[] DEFAULT '{}',

  -- Quality metrics
  processing_time_seconds DECIMAL(10, 3),
  error_message TEXT,

  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcription_results_audio_file_id ON transcription_results(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_transcription_results_user_id ON transcription_results(user_id);

ALTER TABLE transcription_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transcription results" ON transcription_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transcription results" ON transcription_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcription results" ON transcription_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcription results" ON transcription_results
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Audio Analysis Table
-- Stores frequency/spectral/temporal analysis
-- ============================================
CREATE TABLE IF NOT EXISTS audio_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Frequency Analysis
  fundamental_frequency DECIMAL(10, 4),
  frequency_range_low DECIMAL(10, 4),
  frequency_range_high DECIMAL(10, 4),
  spectral_centroid DECIMAL(10, 4),
  spectral_bandwidth DECIMAL(10, 4),
  spectral_rolloff DECIMAL(10, 4),

  -- Amplitude Analysis
  peak_amplitude DECIMAL(10, 6),
  rms_amplitude DECIMAL(10, 6),
  dynamic_range_db DECIMAL(6, 2),

  -- Musical Analysis
  detected_key VARCHAR(20),
  detected_tempo DECIMAL(6, 2),
  beat_positions DECIMAL[] DEFAULT '{}',

  -- Raw data (stored as JSONB for flexibility)
  frequency_histogram JSONB DEFAULT '{}',
  spectral_data JSONB DEFAULT '{}',
  temporal_data JSONB DEFAULT '{}',

  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_analysis_audio_file_id ON audio_analysis(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_audio_analysis_user_id ON audio_analysis(user_id);

ALTER TABLE audio_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis" ON audio_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analysis" ON audio_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis" ON audio_analysis
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Annotations Table
-- For research notes and markers on audio
-- ============================================
CREATE TABLE IF NOT EXISTS annotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Position in audio
  start_time_seconds DECIMAL(10, 3) NOT NULL,
  end_time_seconds DECIMAL(10, 3),

  -- Content
  annotation_type VARCHAR(50) DEFAULT 'note' CHECK (annotation_type IN ('note', 'marker', 'segment', 'region', 'label')),
  title VARCHAR(255),
  content TEXT,
  color VARCHAR(20) DEFAULT '#8b5cf6',

  -- Musical context
  pitch VARCHAR(10),
  frequency DECIMAL(10, 4),

  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annotations_audio_file_id ON annotations(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id);

ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own annotations" ON annotations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own annotations" ON annotations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own annotations" ON annotations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own annotations" ON annotations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Collaborations Table
-- For sharing projects with other researchers
-- ============================================
CREATE TABLE IF NOT EXISTS collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collaborator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),

  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(project_id, collaborator_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborations_project_id ON collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_collaborator_id ON collaborations(collaborator_id);

ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

-- Owner can manage collaborations
CREATE POLICY "Owners can view project collaborations" ON collaborations
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = collaborator_id);

CREATE POLICY "Owners can create collaborations" ON collaborations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update collaborations" ON collaborations
  FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = collaborator_id);

CREATE POLICY "Owners can delete collaborations" ON collaborations
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- Export Jobs Table
-- Tracks export/processing jobs
-- ============================================
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('midi', 'csv', 'json', 'pdf', 'musicxml', 'wav', 'mp3')),
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('transcription', 'analysis', 'audio_file')),
  source_id UUID NOT NULL,

  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  output_filename VARCHAR(255),
  output_path VARCHAR(500),
  file_size BIGINT,

  error_message TEXT,
  settings JSONB DEFAULT '{}',

  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);

ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own export jobs" ON export_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own export jobs" ON export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- User Profiles Table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  institution VARCHAR(255),
  research_focus TEXT,
  bio TEXT,
  website VARCHAR(500),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (true);

-- ============================================
-- Trigger to create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Updated_at Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcription_results_updated_at
  BEFORE UPDATE ON transcription_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Storage Buckets (configured via Supabase dashboard)
-- ============================================
-- audio-files: For original uploaded audio files
-- exports: For generated exports (MIDI, PDF, etc.)
-- avatars: For user profile pictures
