'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Network,
  Share2,
  Database,
  Wifi,
  Radio,
  FolderOpen,
  HardDrive,
  Layers,
  Repeat,
} from 'lucide-react';

const features = [
  {
    icon: Headphones,
    title: 'AI Stem Separation',
    description: 'Isolate vocals, drums, bass, and other instruments with professional-grade Demucs AI models.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Mic,
    title: 'Smart Transcription',
    description: 'Convert any audio to MIDI with precise pitch detection and rhythm analysis.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: 'Ethnomusicology',
    description: 'Advanced microtonal analysis, scale detection, and cent deviation measurement for global music research.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Radio,
    title: 'Sound Ecology',
    description: 'Calculate bioacoustic indices (ACI, NDSI) and analyze soundscapes for environmental research.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Wifi,
    title: 'Offline Fieldwork',
    description: 'Complete offline support with PWA capabilities. Capture and analyze data anywhere, no internet required.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Database,
    title: 'Research Export',
    description: 'Export to MusicXML, MIDI, JSON, CSV, and PDF reports. Compatible with Audacity, ELAN, and R/Python.',
    color: 'from-indigo-500 to-blue-600',
  },
];

const stats = [
  { value: '100%', label: 'Client-Side Privacy' },
  { value: 'Offline', label: 'Field Ready' },
  { value: '5+', label: 'Export Formats' },
  { value: '∞', label: 'Files Processed' },
];

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

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
          <a href="#research" className="hover:text-white transition-colors">Research</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 border-0">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 h-[calc(100vh-88px)] flex items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center gap-2 mb-6">
              <Badge className="px-4 py-2 bg-white/10 border-white/20 text-white/90 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-2" />
                New: Offline Mode Support
              </Badge>
              <Badge className="px-4 py-2 bg-violet-500/20 border-violet-500/30 text-violet-200 backdrop-blur-sm">
                For Researchers & Musicians
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Audio Exploration
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed">
              A complete research platform for stem separation, transcription, and ethnomusicology analysis.
              100% private. 100% offline capable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 border-0 shadow-2xl shadow-violet-500/25">
                  <Play className="mr-2 h-5 w-5" />
                  Start Researching
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Globe className="mr-2 h-5 w-5" />
                  Try Live Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-32 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-white/10 border-white/20 text-white/90">Powerful Tools</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Audio Toolkit
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Everything you need for advanced audio research, from field recording to academic publication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/10"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-lg text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative z-10 px-6 lg:px-12 py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/20 border-violet-500/30 text-violet-300">New Workflow</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Workflow Your Way
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
               Choose how you manage your research data with our new Hybrid File System.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             {/* Card 1: Hybrid Storage */}
            <div className="relative p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm overflow-hidden group hover:border-violet-500/50 transition-colors">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <HardDrive className="h-32 w-32" />
               </div>
               <div className="relative z-10">
                 <div className="inline-flex p-3 rounded-xl bg-violet-500/20 text-violet-300 mb-6">
                   <FolderOpen className="h-6 w-6" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3">Hybrid Storage</h3>
                 <p className="text-white/60 mb-6 leading-relaxed">
                   Two ways to connect your data:
                 </p>
                 <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                     <span className="mt-1 bg-white/10 p-1 rounded">
                       <Cloud className="h-3 w-3 text-blue-400" />
                     </span>
                     <div>
                       <strong className="text-white block">Browser Import</strong>
                       <span className="text-sm text-white/50">Secure, isolated copies. Perfect for quick edits.</span>
                     </div>
                   </li>
                   <li className="flex items-start gap-3">
                     <span className="mt-1 bg-white/10 p-1 rounded">
                       <Sparkles className="h-3 w-3 text-green-400" />
                     </span>
                     <div>
                       <strong className="text-white block">Local Sync</strong>
                       <span className="text-sm text-white/50">Connect real folders. Edits reflect instantly on your drive.</span>
                     </div>
                   </li>
                 </ul>
               </div>
            </div>

             {/* Card 2: Universal Library */}
            <div className="relative p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm overflow-hidden group hover:border-pink-500/50 transition-colors">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Layers className="h-32 w-32" />
               </div>
               <div className="relative z-10">
                 <div className="inline-flex p-3 rounded-xl bg-pink-500/20 text-pink-300 mb-6">
                   <Repeat className="h-6 w-6" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3">Universal Access</h3>
                 <p className="text-white/60 mb-6 leading-relaxed">
                   Your files follow you everywhere.
                 </p>
                  <ul className="space-y-4">
                   <li className="flex items-center gap-3">
                     <CheckCircle className="h-5 w-5 text-pink-500" />
                     <span className="text-white/80">Load files directly inside any tool</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle className="h-5 w-5 text-pink-500" />
                     <span className="text-white/80">No more context switching to Dashboard</span>
                   </li>
                    <li className="flex items-center gap-3">
                     <CheckCircle className="h-5 w-5 text-pink-500" />
                     <span className="text-white/80">Unified "Active Library" view</span>
                   </li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Section (Modified ID to stay unique if needed, but keeping existing structure) */}
      <section id="research" className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-6xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div>
               <Badge className="mb-4 bg-emerald-500/20 border-emerald-500/30 text-emerald-300">Field Ready</Badge>
               <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                 Research Anywhere,<br />
                 <span className="text-emerald-400">Even Offline</span>
               </h2>
               <p className="text-xl text-white/60 mb-8 leading-relaxed">
                 Designed for ethnomusicologists and field researchers. Streamlit works completely offline as a PWA, allowing you to capture, analyze, and annotate recordings in remote locations without internet access.
               </p>
               <ul className="space-y-4">
                 {[
                   'Zero-latency local processing',
                   'Automatic GPS geotagging',
                   'Battery-optimized algorithms',
                   'Secure local storage'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-lg">
                     <div className="rounded-full bg-emerald-500/20 p-1">
                       <CheckCircle className="h-5 w-5 text-emerald-400" />
                     </div>
                     <span className="text-white/80">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>
             <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-3xl opacity-20" />
               <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                 <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                   <div className="flex items-center gap-3">
                     <Wifi className="h-5 w-5 text-red-400" />
                     <span className="text-red-400 font-medium">Offline Mode</span>
                   </div>
                   <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">System Ready</Badge>
                 </div>
                 <div className="space-y-6">
                   <div className="bg-white/5 rounded-xl p-4">
                     <div className="flex justify-between mb-2">
                       <span className="text-sm text-white/60">Stem Separation</span>
                       <span className="text-sm text-emerald-400">Processing...</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[65%] bg-emerald-500 rounded-full" />
                     </div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-4">
                     <div className="flex justify-between mb-2">
                       <span className="text-sm text-white/60">Bioacoustic Index</span>
                       <span className="text-sm text-emerald-400">Completed</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-full bg-emerald-500 rounded-full" />
                     </div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-4">
                     <div className="flex justify-between mb-2">
                       <span className="text-sm text-white/60">GPS Location</span>
                       <span className="text-sm text-white/80">-15.432, 28.123</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="relative z-10 px-6 lg:px-12 py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-5 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Data Stays Yours
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            We use advanced WebAssembly technology to run powerful AI models directly within your browser.
            No sensitive audio data is ever sent to the cloud.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>No Cloud Uploads</span>
            </div>
            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>GDPR Compliant</span>
            </div>
            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>End-to-End Private</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-white/10 rounded-3xl p-12 md:p-20 text-center backdrop-blur-sm">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Start Your Research Today
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Join the community of researchers and musicians pushing the boundaries of audio analysis.
            Free during beta.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="px-10 py-7 text-lg bg-white text-black hover:bg-white/90 border-0 shadow-xl">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 p-1 rounded-md">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Streamlit</span>
          </div>
          <div className="text-sm text-white/40">
            © 2026 In4Metrix. Research-grade audio tools for the web.
          </div>
          <div className="flex items-center gap-8 text-sm text-white/50">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="mailto:contact@in4metrix.dev" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
