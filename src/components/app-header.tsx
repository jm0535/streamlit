'use client';

import { Music2 } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';
import { Badge } from './ui/badge';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-primary/60 p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <Music2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Streamlit
                </h1>
                <Badge variant="secondary" className="text-[10px] h-4 px-1 text-muted-foreground">
                  BETA
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Audio Research Platform
              </p>
            </div>
          </Link>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 mr-4">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/transcription"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Transcription
              </Link>
              <Link
                href="/notes"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Notes
              </Link>
              <Link
                href="/help"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </Link>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

