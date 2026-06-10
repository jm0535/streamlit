'use client';

import { useMemo } from 'react';
import { useFileStore } from '@/lib/file-store';
import {
  type WorkflowStep,
  type WorkflowState,
  canAccessStep,
  getNextStep,
  getStepLabel,
  getStepHref,
} from '@/services/workflow-engine';

export function useWorkflow(fileId?: string) {
  const sharedAudioFiles = useFileStore((s) => s.sharedAudioFiles);

  const state: WorkflowState = useMemo(() => {
    if (!fileId) {
      return {
        uploaded: false,
        stemsExtracted: false,
        transcribed: false,
        analyzed: false,
        exported: false,
      };
    }
    const file = sharedAudioFiles.find((f) => f.id === fileId);
    const status = file?.status || 'uploaded';
    return {
      uploaded: true,
      stemsExtracted: status === 'stems_extracted' || status === 'transcribed' || status === 'analyzed' || status === 'exported',
      transcribed: status === 'transcribed' || status === 'analyzed' || status === 'exported',
      analyzed: status === 'analyzed' || status === 'exported',
      exported: status === 'exported',
    };
  }, [fileId, sharedAudioFiles]);

  return {
    state,
    canAccess: (step: WorkflowStep) => canAccessStep(step, state),
    nextStep: (current: WorkflowStep) => getNextStep(current),
    stepLabel: getStepLabel,
    stepHref: getStepHref,
    isComplete: state.exported,
  };
}
