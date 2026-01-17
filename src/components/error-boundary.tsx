'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays
 * a fallback UI instead of crashing the whole page.
 *
 * Critical for:
 * - Audio processing errors (WebGPU/WASM failures)
 * - Analysis computation errors
 * - File handling errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-destructive/50 bg-destructive/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>
                An error occurred while processing your request. This could be due to:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Browser memory limitations</li>
                <li>Unsupported audio format</li>
                <li>Network connectivity issues</li>
                <li>Processing timeout</li>
              </ul>

              {this.state.error && (
                <details className="text-xs bg-muted/50 rounded p-3">
                  <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
                  <pre className="overflow-auto whitespace-pre-wrap text-destructive/80">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={this.handleReset}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for easier use with hooks
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
