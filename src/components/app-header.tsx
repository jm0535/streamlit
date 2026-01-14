'use client';

import { Music2, Github, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-primary/60 p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <Music2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Streamlit
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Audio Research Platform
              </p>
            </div>
          </div>

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
                href="/piano-roll"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Piano Roll
              </Link>
              <Link
                href="/help"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </Link>
            </div>

            <ThemeToggle />

            <div className="h-6 w-px bg-border hidden md:block" />

            <a
              href="https://github.com/jm0535/streamlit"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-accent transition-colors group"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
