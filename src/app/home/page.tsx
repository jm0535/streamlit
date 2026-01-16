'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SoundWaveBackground } from '@/components/ui/sound-wave-background';
import {
  Music2,
  Mic,
  Headphones,
  Piano,
  FileAudio,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  Download,
  Cloud,
} from 'lucide-react';

const features = [
  {
    icon: Headphones,
    title: 'AI Stem Separation',
    description: 'Isolate drums, bass, vocals, and melody using state-of-the-art Demucs ML model',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Mic,
    title: 'Music Transcription',
    description: 'Convert audio to MIDI with precise note detection powered by Basic Pitch AI',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Piano,
    title: 'Score Visualization',
    description: 'View your music in traditional notation or piano roll with playback',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: FileAudio,
    title: 'Audio Analysis',
    description: 'Spectral analysis, tempo detection, key signature identification and more',
    color: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { value: '4', label: 'Isolated Stems' },
  { value: '99%', label: 'Accuracy' },
  { value: '100%', label: 'Local Processing' },
  { value: '∞', label: 'Files Free' },
];

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <SoundWaveBackground className="text-primary/20" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg blur-lg opacity-50" />
            <div className="relative bg-gradient-to-r from-violet-500 to-pink-500 p-2 rounded-lg">
              <Music2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Streamlit
          </span>
          <span className="text-xs text-white/40 hidden sm:inline">by In4Metrix</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 border-0">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Full viewport centered */}
      <section className="relative z-10 px-6 lg:px-12 h-[100vh] -mt-[88px] pt-[88px] flex items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 px-4 py-2 bg-white/10 border-white/20 text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-2" />
              Powered by Demucs AI
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Audio Experience
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed">
              Separate stems, transcribe music to MIDI, and analyze audio with
              enterprise-grade AI — all running locally on your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 border-0 shadow-2xl shadow-violet-500/25">
                  <Play className="mr-2 h-5 w-5" />
                  Start for Free
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Globe className="mr-2 h-5 w-5" />
                  Live Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 border-white/20 text-white/90">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Professional audio tools that run entirely in your browser
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 border-white/20 text-white/90">How it Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              From upload to export in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Upload</h3>
              <p className="text-white/60">Drag and drop your audio files. Supports MP3, WAV, FLAC, and more.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Process</h3>
              <p className="text-white/60">AI separates stems, transcribes notes, or analyzes your audio locally.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Export</h3>
              <p className="text-white/60">Download stems, MIDI files, PDFs, or sheet music in any format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/20 border-amber-500/30 text-amber-300">🚀 Beta</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Free During Beta
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Enjoy full access to all features while we&apos;re in beta
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">$0</div>
            <p className="text-white/60 mb-6">during beta</p>
            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> Unlimited file processing</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> All AI features included</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> Export in any format</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> 100% local processing</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> No account required</li>
            </ul>
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 border-0">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-500/20 mb-6">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            100% Local Processing
          </h2>
          <p className="text-xl text-white/50 mb-8 max-w-2xl mx-auto">
            Your audio files never leave your device. All processing happens locally using
            WebAssembly technology — no uploads, no cloud, no compromise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="px-4 py-2 bg-white/10 border-white/20">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
              No Server Upload
            </Badge>
            <Badge className="px-4 py-2 bg-white/10 border-white/20">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
              GDPR Compliant
            </Badge>
            <Badge className="px-4 py-2 bg-white/10 border-white/20">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
              Offline Capable
            </Badge>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Music?
          </h2>
          <p className="text-xl text-white/50 mb-10">
            Join thousands of musicians, producers, and researchers using Streamlit.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-12 py-6 text-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 border-0 shadow-2xl shadow-violet-500/25">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-violet-400" />
            <span className="font-semibold">Streamlit</span>
          </div>
          <div className="text-sm text-white/40">
            © 2026 <a href="https://www.in4metrix.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">In4Metrix</a>. Built with Next.js and Demucs AI.
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
