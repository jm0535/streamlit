'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Headphones,
  Mic,
  BarChart3,
  Download,
  Upload,
  ArrowRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type WorkflowStep =
  | 'upload'
  | 'stem-separation'
  | 'transcription'
  | 'audio-analysis'
  | 'export';

interface WorkflowPageShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  currentStep: WorkflowStep;
  actions?: React.ReactNode;
}

const STEPS: { id: WorkflowStep; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'upload', label: 'Upload', href: '/dashboard', icon: Upload },
  { id: 'stem-separation', label: 'Separate', href: '/stem-separation', icon: Headphones },
  { id: 'transcription', label: 'Transcribe', href: '/transcription', icon: Mic },
  { id: 'audio-analysis', label: 'Analyze', href: '/audio-analysis', icon: BarChart3 },
  { id: 'export', label: 'Export', href: '/export', icon: Download },
];

export function WorkflowPageShell({
  children,
  title,
  description,
  currentStep,
  actions,
}: WorkflowPageShellProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Step Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <Link
                  href={step.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                    isActive && 'bg-primary/10 text-primary',
                    isCompleted && 'text-muted-foreground',
                    !isActive && !isCompleted && 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : isActive ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </Link>
                {index < STEPS.length - 1 && (
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 shrink-0 hidden sm:block',
                      index < currentIndex ? 'text-green-500' : 'text-muted-foreground/30'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Page Content */}
      {children}
    </div>
  );
}
