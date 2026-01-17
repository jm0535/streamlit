'use client';

/**
 * Annotation Service
 *
 * Manages time-based annotations for audio files:
 * - Time-region labels (start/end times)
 * - Category tags
 * - Field notes
 * - Export to JSON/CSV sidecar files
 *
 * Designed for research documentation in ethnomusicology
 * and sound ecology (e.g., labeling bird calls, ritual segments)
 */

import { GeolocationResult } from './geolocation';

export interface Annotation {
  id: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  label: string;
  category: AnnotationCategory;
  notes?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: AnnotationMetadata;
}

export type AnnotationCategory =
  | 'speech'
  | 'music'
  | 'environment'
  | 'bird'
  | 'insect'
  | 'mammal'
  | 'water'
  | 'weather'
  | 'human'
  | 'instrument'
  | 'vocal'
  | 'ritual'
  | 'other';

export interface AnnotationMetadata {
  species?: string;         // For ecology: bird/animal species
  instrument?: string;      // For ethnomusicology: instrument type
  performer?: string;       // Performer name
  culture?: string;         // Cultural context
  language?: string;        // Language spoken
  event?: string;           // Event or ceremony name
  tags?: string[];          // Additional tags
}

export interface AnnotationProject {
  id: string;
  name: string;
  fileId: string;
  fileName: string;
  duration: number;
  sampleRate: number;
  annotations: Annotation[];
  geolocation?: GeolocationResult;
  recordedAt?: Date;
  fieldNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Color palette for categories
export const CATEGORY_COLORS: Record<AnnotationCategory, string> = {
  speech: '#3b82f6',      // Blue
  music: '#8b5cf6',       // Purple
  environment: '#22c55e', // Green
  bird: '#eab308',        // Yellow
  insect: '#f97316',      // Orange
  mammal: '#ef4444',      // Red
  water: '#06b6d4',       // Cyan
  weather: '#64748b',     // Gray
  human: '#ec4899',       // Pink
  instrument: '#a855f7',  // Violet
  vocal: '#14b8a6',       // Teal
  ritual: '#f59e0b',      // Amber
  other: '#6b7280',       // Gray
};

/**
 * Generate unique ID
 */
function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new annotation
 */
export function createAnnotation(
  startTime: number,
  endTime: number,
  label: string,
  category: AnnotationCategory = 'other',
  options: Partial<Annotation> = {}
): Annotation {
  return {
    id: generateId(),
    startTime,
    endTime,
    label,
    category,
    color: options.color || CATEGORY_COLORS[category],
    notes: options.notes,
    metadata: options.metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new annotation project
 */
export function createAnnotationProject(
  name: string,
  fileId: string,
  fileName: string,
  duration: number,
  sampleRate: number
): AnnotationProject {
  return {
    id: generateId(),
    name,
    fileId,
    fileName,
    duration,
    sampleRate,
    annotations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Format time as HH:MM:SS.mmm
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  }
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
}

/**
 * Parse time string to seconds
 */
export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':').map(parseFloat);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

/**
 * Export annotations to JSON
 */
export function exportToJSON(project: AnnotationProject): string {
  const exportData = {
    ...project,
    exportedAt: new Date().toISOString(),
    format: 'streamlit-annotations-v1',
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export annotations to CSV
 */
export function exportToCSV(project: AnnotationProject): string {
  const headers = [
    'start_time',
    'end_time',
    'duration',
    'label',
    'category',
    'notes',
    'species',
    'instrument',
    'performer',
    'culture',
    'tags',
  ];

  const rows = project.annotations.map(ann => [
    ann.startTime.toFixed(3),
    ann.endTime.toFixed(3),
    (ann.endTime - ann.startTime).toFixed(3),
    `"${ann.label.replace(/"/g, '""')}"`,
    ann.category,
    `"${(ann.notes || '').replace(/"/g, '""')}"`,
    ann.metadata?.species || '',
    ann.metadata?.instrument || '',
    ann.metadata?.performer || '',
    ann.metadata?.culture || '',
    `"${(ann.metadata?.tags || []).join('; ')}"`,
  ]);

  // Add metadata header
  const metaLines = [
    `# File: ${project.fileName}`,
    `# Duration: ${project.duration.toFixed(3)}s`,
    `# Sample Rate: ${project.sampleRate}Hz`,
    project.geolocation ? `# Location: ${project.geolocation.latitude}, ${project.geolocation.longitude}` : '',
    project.recordedAt ? `# Recorded: ${project.recordedAt.toISOString()}` : '',
    `# Exported: ${new Date().toISOString()}`,
    '',
  ].filter(Boolean);

  return metaLines.join('\n') + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
}

/**
 * Export annotations to Audacity label format
 */
export function exportToAudacityLabels(annotations: Annotation[]): string {
  return annotations
    .map(ann => `${ann.startTime.toFixed(6)}\t${ann.endTime.toFixed(6)}\t${ann.label}`)
    .join('\n');
}

/**
 * Export annotations to ELAN format (simplified EAF XML)
 */
export function exportToELAN(project: AnnotationProject): string {
  const now = new Date().toISOString();
  const timeslots: string[] = [];
  const annotations: string[] = [];

  // Generate time slots
  let tsId = 1;
  const tsMap = new Map<number, string>();

  project.annotations.forEach(ann => {
    if (!tsMap.has(ann.startTime)) {
      tsMap.set(ann.startTime, `ts${tsId++}`);
    }
    if (!tsMap.has(ann.endTime)) {
      tsMap.set(ann.endTime, `ts${tsId++}`);
    }
  });

  tsMap.forEach((id, time) => {
    timeslots.push(`      <TIME_SLOT TIME_SLOT_ID="${id}" TIME_VALUE="${Math.round(time * 1000)}"/>`);
  });

  // Generate annotations
  project.annotations.forEach((ann, idx) => {
    annotations.push(`      <ANNOTATION>
        <ALIGNABLE_ANNOTATION ANNOTATION_ID="a${idx + 1}" TIME_SLOT_REF1="${tsMap.get(ann.startTime)}" TIME_SLOT_REF2="${tsMap.get(ann.endTime)}">
          <ANNOTATION_VALUE>${escapeXML(ann.label)}</ANNOTATION_VALUE>
        </ALIGNABLE_ANNOTATION>
      </ANNOTATION>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<ANNOTATION_DOCUMENT DATE="${now}" AUTHOR="Streamlit Audio Research" VERSION="3.0" FORMAT="3.0">
  <HEADER MEDIA_FILE="${project.fileName}" TIME_UNITS="milliseconds">
    <MEDIA_DESCRIPTOR MEDIA_URL="${project.fileName}" MIME_TYPE="audio/*"/>
  </HEADER>
  <TIME_ORDER>
${timeslots.join('\n')}
  </TIME_ORDER>
  <TIER TIER_ID="Annotations" LINGUISTIC_TYPE_REF="default-lt" DEFAULT_LOCALE="en">
${annotations.join('\n')}
  </TIER>
  <LINGUISTIC_TYPE LINGUISTIC_TYPE_ID="default-lt" TIME_ALIGNABLE="true"/>
</ANNOTATION_DOCUMENT>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Download file helper
 */
export function downloadAnnotations(
  project: AnnotationProject,
  format: 'json' | 'csv' | 'audacity' | 'elan'
): void {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'json':
      content = exportToJSON(project);
      mimeType = 'application/json';
      extension = 'json';
      break;
    case 'csv':
      content = exportToCSV(project);
      mimeType = 'text/csv';
      extension = 'csv';
      break;
    case 'audacity':
      content = exportToAudacityLabels(project.annotations);
      mimeType = 'text/plain';
      extension = 'txt';
      break;
    case 'elan':
      content = exportToELAN(project);
      mimeType = 'application/xml';
      extension = 'eaf';
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name}_annotations.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import annotations from JSON
 */
export function importFromJSON(jsonString: string): AnnotationProject | null {
  try {
    const data = JSON.parse(jsonString);
    if (data.format !== 'streamlit-annotations-v1') {
      console.warn('Unknown annotation format, attempting import anyway');
    }
    return data as AnnotationProject;
  } catch {
    return null;
  }
}

/**
 * Import annotations from Audacity labels
 */
export function importFromAudacityLabels(content: string): Annotation[] {
  const lines = content.trim().split('\n');
  return lines.map(line => {
    const parts = line.split('\t');
    const startTime = parseFloat(parts[0]) || 0;
    const endTime = parseFloat(parts[1]) || startTime;
    const label = parts[2] || 'Unlabeled';

    return createAnnotation(startTime, endTime, label);
  });
}

/**
 * Get annotation statistics
 */
export function getAnnotationStats(annotations: Annotation[]): Record<string, number> {
  const stats: Record<string, number> = {
    total: annotations.length,
    totalDuration: 0,
  };

  annotations.forEach(ann => {
    stats.totalDuration += ann.endTime - ann.startTime;
    stats[ann.category] = (stats[ann.category] || 0) + 1;
  });

  return stats;
}

const annotationsService = {
  createAnnotation,
  createAnnotationProject,
  formatTime,
  parseTime,
  exportToJSON,
  exportToCSV,
  exportToAudacityLabels,
  exportToELAN,
  downloadAnnotations,
  importFromJSON,
  importFromAudacityLabels,
  getAnnotationStats,
  CATEGORY_COLORS,
};

export default annotationsService;
