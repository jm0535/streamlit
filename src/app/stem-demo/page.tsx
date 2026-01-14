'use client';

import { useState } from 'react';

export default function StemDemoPage() {
  const [stems] = useState([
    { type: 'bass', notes: [], color: '#8B5CF', icon: '🎸' },
    { type: 'drums', notes: [], color: '#EF4444', icon: '🥁' },
    { type: 'guitar', notes: [], color: '#F59E0B', icon: '🎸' },
    { type: 'vocals', notes: [], color: '#3B82F6', icon: '🎤' },
    { type: 'other', notes: [], color: '#6B7280', icon: '🎵' },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Stem Separation & Musical Notation
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stems.map((stem, index) => (
            <div key={index} className="border-2 p-6 rounded-lg" style={{ borderColor: stem.color }}>
              <div className="text-5xl mb-2">{stem.icon}</div>
              <h2 className="text-2xl font-bold" style={{ color: stem.color }}>{stem.type.toUpperCase()}</h2>
              <p className="text-muted-foreground">{stem.notes.length} notes</p>
              <div className="text-sm mt-2">
                <strong>Example Notes:</strong><br />
                C4 - 0.5s - vel 80<br />
                G4 - 1.0s - vel 75<br />
                A4 - 0.25s - vel 90
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">How Stem Separation Works</h2>
          <p className="mb-2">1. Upload audio file to main page</p>
          <p className="mb-2">2. Click "Stems" tab (between Results and Settings)</p>
          <p className="mb-2">3. Click "Separate into Stems" button</p>
          <p>4. View 5 instrument stems with different colors</p>
          <p>5. See notes with musical symbols (𝅝, 𝅘, ♯, ♭)</p>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <strong>Stem Tab Location:</strong> Should be visible in main app between Results and Settings tabs.
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
