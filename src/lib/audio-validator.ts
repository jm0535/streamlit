'use client';

/**
 * Audio File Validation Service
 *
 * Validates audio files before processing:
 * - File format checking
 * - Size limits
 * - Duration estimation
 * - MIME type verification
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    format: string;
    size: number;
    sizeFormatted: string;
    estimatedDuration?: number;
  };
}

export interface ValidationOptions {
  maxSizeMB?: number;
  maxDurationSeconds?: number;
  allowedFormats?: string[];
  requireAudio?: boolean;
}

const DEFAULT_OPTIONS: ValidationOptions = {
  maxSizeMB: 100,
  maxDurationSeconds: 600, // 10 minutes
  allowedFormats: ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'aac', 'webm'],
  requireAudio: true,
};

const MIME_TYPES: Record<string, string[]> = {
  mp3: ['audio/mpeg', 'audio/mp3'],
  wav: ['audio/wav', 'audio/wave', 'audio/x-wav'],
  flac: ['audio/flac', 'audio/x-flac'],
  m4a: ['audio/mp4', 'audio/x-m4a', 'audio/aac'],
  ogg: ['audio/ogg', 'application/ogg'],
  aac: ['audio/aac'],
  webm: ['audio/webm'],
};

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file extension
 */
function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Estimate audio duration from file size (rough approximation)
 */
function estimateDuration(file: File): number | undefined {
  const ext = getExtension(file.name);
  const sizeMB = file.size / (1024 * 1024);

  // Rough bitrate estimates (kbps)
  const bitrates: Record<string, number> = {
    mp3: 192,
    wav: 1411, // 16-bit 44.1kHz stereo
    flac: 900,
    m4a: 256,
    ogg: 160,
    aac: 256,
    webm: 128,
  };

  const bitrateKbps = bitrates[ext];
  if (!bitrateKbps) return undefined;

  // Duration in seconds = (size in bits) / (bitrate in bits per second)
  return (sizeMB * 8 * 1024) / bitrateKbps;
}

/**
 * Validate audio file
 */
export function validateAudioFile(
  file: File,
  options: ValidationOptions = {}
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if file exists
  if (!file) {
    return { valid: false, errors: ['No file provided'], warnings: [] };
  }

  // Get file info
  const extension = getExtension(file.name);
  const sizeMB = file.size / (1024 * 1024);

  // Check format
  if (opts.allowedFormats && !opts.allowedFormats.includes(extension)) {
    errors.push(
      `Unsupported format: .${extension}. Allowed: ${opts.allowedFormats.join(', ')}`
    );
  }

  // Check MIME type
  const expectedMimes = MIME_TYPES[extension];
  if (expectedMimes && !expectedMimes.includes(file.type)) {
    warnings.push(
      `File extension doesn't match MIME type. Expected ${expectedMimes[0]}, got ${file.type || 'unknown'}`
    );
  }

  // Check if it's an audio file
  if (opts.requireAudio && !file.type.startsWith('audio/') && !file.type.includes('ogg')) {
    errors.push(`File doesn't appear to be an audio file (type: ${file.type || 'unknown'})`);
  }

  // Check size
  if (opts.maxSizeMB && sizeMB > opts.maxSizeMB) {
    errors.push(
      `File too large: ${formatFileSize(file.size)}. Maximum: ${opts.maxSizeMB}MB`
    );
  }

  // Estimate and check duration
  const estimatedDuration = estimateDuration(file);
  if (opts.maxDurationSeconds && estimatedDuration && estimatedDuration > opts.maxDurationSeconds) {
    warnings.push(
      `File may be too long (~${Math.round(estimatedDuration / 60)} min). Processing large files may be slow.`
    );
  }

  // Size warnings
  if (sizeMB > 50) {
    warnings.push(
      `Large file (${formatFileSize(file.size)}). Consider using smaller files for faster processing.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      format: extension,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      estimatedDuration,
    },
  };
}

/**
 * Validate multiple files
 */
export function validateAudioFiles(
  files: File[],
  options: ValidationOptions = {}
): ValidationResult[] {
  return files.map((file) => validateAudioFile(file, options));
}

/**
 * Check if file can be processed in browser
 */
export function canProcessInBrowser(file: File): boolean {
  const sizeMB = file.size / (1024 * 1024);

  // Check available memory (rough estimate)
  if ('deviceMemory' in navigator) {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    // Need roughly 10x file size in memory for processing
    if (sizeMB * 10 > memory * 1024) {
      return false;
    }
  }

  // General limit for browser processing
  return sizeMB < 200;
}

/**
 * Suggest processing mode based on file
 */
export function suggestProcessingMode(file: File): 'browser' | 'cloud' | 'chunked' {
  const sizeMB = file.size / (1024 * 1024);

  if (sizeMB < 30) return 'browser';
  if (sizeMB < 100) return 'chunked';
  return 'cloud';
}

const audioValidator = {
  validateAudioFile,
  validateAudioFiles,
  canProcessInBrowser,
  suggestProcessingMode,
  formatFileSize,
};

export default audioValidator;
