'use client';

import { Music2, Github, Twitter, Mail, Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="mt-auto border-t bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-primary/60 p-2 rounded-xl">
                <Music2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Streamlit</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Enterprise-grade audio transcription platform for ethnomusicological research.
              Built with cutting-edge technology to deliver accurate, reliable results.
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Made for researchers</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Integration Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Release Notes
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Research Papers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community Forum
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support Center
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Connect
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Stay updated with our latest features and research insights.
              </p>

              <div className="flex gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-accent hover:bg-accent/80 transition-all hover:scale-105 group"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-accent hover:bg-accent/80 transition-all hover:scale-105 group"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </a>
                <a
                  href="mailto:support@streamlit.com"
                  className="p-3 rounded-lg bg-accent hover:bg-accent/80 transition-all hover:scale-105 group"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>

              <div className="pt-4 border-t">
                <a
                  href="mailto:enterprise@streamlit.com"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Enterprise Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Streamlit. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
