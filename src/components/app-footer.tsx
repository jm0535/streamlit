'use client';

import Link from 'next/link';
import { Music2, Shield, Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-primary/60 p-2 rounded-lg">
                <Music2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Streamlit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Audio research platform for transcription and analysis.
              Built for researchers and musicians.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 w-fit">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Your files never leave your device</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/transcription" className="hover:text-foreground transition-colors">
                  Transcription
                </Link>
              </li>
              <li>
                <Link href="/piano-roll" className="hover:text-foreground transition-colors">
                  Piano Roll
                </Link>
              </li>
              <li>
                <Link href="/batch-processing" className="hover:text-foreground transition-colors">
                  Batch Processing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-medium">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-foreground transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/jm0535/streamlit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Streamlit. Open source audio research.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Made with <Heart className="h-3 w-3 text-red-500" /> for researchers
          </p>
        </div>
      </div>
    </footer>
  );
}
