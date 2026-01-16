'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Music2 } from 'lucide-react';
import { SoundWaveBackground } from '@/components/ui/sound-wave-background';

export default function PrivacyPage() {
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
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>

        <p className="text-lg text-white/50 mb-12">Last updated: January 2026</p>

        <div className="space-y-10">
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
            <p className="text-white/70 leading-relaxed">Streamlit is designed with privacy at its core. All audio processing happens locally on your device using WebAssembly technology. We do not upload, store, or access your audio files.</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
            <div className="space-y-4">
              <div>
                <p className="text-emerald-400 font-medium mb-2">We do NOT collect:</p>
                <ul className="list-disc pl-6 text-white/70 space-y-1">
                  <li>Your audio files</li>
                  <li>Transcription results</li>
                  <li>Separated stems</li>
                  <li>Any content you process</li>
                </ul>
              </div>
              <div>
                <p className="text-amber-400 font-medium mb-2">We may collect:</p>
                <ul className="list-disc pl-6 text-white/70 space-y-1">
                  <li>Basic analytics (page views, feature usage)</li>
                  <li>Account information if you sign up (email)</li>
                  <li>Crash reports for debugging</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Local Processing</h2>
            <p className="text-white/70 leading-relaxed">All AI models (Demucs for stem separation, Basic Pitch for transcription) run entirely in your browser using WebAssembly. Your files never leave your device.</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-white/70">Questions about privacy? Contact us at <a href="mailto:privacy@in4metrix.dev" className="text-violet-400 hover:underline">privacy@in4metrix.dev</a></p>
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
