'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Music2 } from 'lucide-react';
import { SoundWaveBackground } from '@/components/ui/sound-wave-background';

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <SoundWaveBackground className="text-primary/20" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/home" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-violet-500 to-pink-500 p-2 rounded-lg">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">Streamlit</span>
        </Link>
        <Link href="/home">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
        </div>

        <p className="text-lg text-white/50 mb-12">Last updated: January 2026</p>

        <div className="space-y-10">
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-white/70 leading-relaxed">By using Streamlit, you agree to these terms. Streamlit is provided as-is during the beta period.</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Use of Service</h2>
            <p className="text-white/70 mb-4">You may use Streamlit to:</p>
            <ul className="list-disc pl-6 text-white/70 space-y-1 mb-4">
              <li>Separate audio into stems</li>
              <li>Transcribe audio to MIDI</li>
              <li>Analyze audio files</li>
              <li>Export in various formats</li>
            </ul>
            <p className="text-white/70">You are responsible for ensuring you have rights to any audio you process.</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed">You retain all rights to your audio files and any outputs generated. We claim no ownership over your content.</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Beta Service</h2>
            <p className="text-white/70 leading-relaxed">Streamlit is currently in beta. Features may change, and the service is provided without warranty. We are not liable for any issues arising from use of the service.</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-white/70">Questions about terms? Contact us at <a href="mailto:legal@in4metrix.dev" className="text-violet-400 hover:underline">legal@in4metrix.dev</a></p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 mt-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-white/40">
          © 2026 <a href="https://www.in4metrix.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white">In4Metrix</a>
        </div>
      </footer>
    </div>
  );
}
