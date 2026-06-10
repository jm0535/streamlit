/**
 * WorkflowEngine — enforces the audio research pipeline
 *
 * Pipeline: Upload → Stem Separation → Transcription → Analysis → Export
 * Each step validates that previous steps are complete before allowing progress.
 */

export type WorkflowStep =
  | 'upload'
  | 'stem-separation'
  | 'transcription'
  | 'audio-analysis'
  | 'export';

export interface WorkflowState {
  uploaded: boolean;
  stemsExtracted: boolean;
  transcribed: boolean;
  analyzed: boolean;
  exported: boolean;
}

const STEP_ORDER: WorkflowStep[] = [
  'upload',
  'stem-separation',
  'transcription',
  'audio-analysis',
  'export',
];

export function getStepIndex(step: WorkflowStep): number {
  return STEP_ORDER.indexOf(step);
}

export function canAccessStep(
  targetStep: WorkflowStep,
  state: WorkflowState
): boolean {
  const idx = getStepIndex(targetStep);
  if (idx === 0) return true;

  const required: Partial<Record<WorkflowStep, keyof WorkflowState>> = {
    'stem-separation': 'uploaded',
    'transcription': 'stemsExtracted',
    'audio-analysis': 'transcribed',
    'export': 'analyzed',
  };

  const requiredKey = required[targetStep];
  if (!requiredKey) return false;
  return state[requiredKey] === true;
}

export function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const idx = getStepIndex(currentStep);
  return STEP_ORDER[idx + 1] ?? null;
}

export function getPrevStep(currentStep: WorkflowStep): WorkflowStep | null {
  const idx = getStepIndex(currentStep);
  return STEP_ORDER[idx - 1] ?? null;
}

export function getStepLabel(step: WorkflowStep): string {
  const labels: Record<WorkflowStep, string> = {
    upload: 'Upload',
    'stem-separation': 'Separate',
    transcription: 'Transcribe',
    'audio-analysis': 'Analyze',
    export: 'Export',
  };
  return labels[step];
}

export function getStepHref(step: WorkflowStep): string {
  const hrefs: Record<WorkflowStep, string> = {
    upload: '/dashboard',
    'stem-separation': '/stem-separation',
    transcription: '/transcription',
    'audio-analysis': '/audio-analysis',
    export: '/export',
  };
  return hrefs[step];
}

export function buildWorkflowState(
  fileId: string,
  fileStore: {
    getFileStatus: (id: string) => string | undefined;
  }
): WorkflowState {
  const status = fileStore.getFileStatus(fileId);
  return {
    uploaded: true,
    stemsExtracted: status === 'stems_extracted' || status === 'transcribed' || status === 'analyzed' || status === 'exported',
    transcribed: status === 'transcribed' || status === 'analyzed' || status === 'exported',
    analyzed: status === 'analyzed' || status === 'exported',
    exported: status === 'exported',
  };
}
