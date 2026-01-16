# 🎵 Streamlit - **Audio Research Platform**

A professional-grade audio transcription and analysis platform built for musicological research, featuring real-time audio processing, stem separation, and a complete mixing console powered by Web Audio API.

## ✨ Features

### 🎯 Core Audio Processing

- **🎵 Real-time Audio Transcription** - Convert audio to MIDI with advanced pitch detection
- **🎛️ Professional Audio Mixer** - Multi-channel mixing with Web Audio API
- **🔀 Stem Separation** - Isolate individual instruments from audio files
- **📊 Batch Processing** - Process up to 50 files simultaneously
- **🎼 Musical Notation** - Generate sheet music and piano roll views

### 🎨 Professional Interface

- **🎛️ Mixing Console** - Professional DAW-style interface with level meters
- **📱 Responsive Design** - Works seamlessly on desktop and tablet
- **🌈 Beautiful UI** - Modern design with shadcn/ui components
- **🎯 Real-time Visualization** - Audio waveforms and frequency analysis

### 🔐 Authentication & Collaboration

- **👥 Enterprise Auth** - Complete login/signup flows via Supabase
- **🤝 Team Collaboration** - Invite members and manage roles (Viewer/Editor/Admin)
- **📫 Email System** - Professional branded email templates with Resend SMTP
- **🛡️ Role-Based Access** - Granular permissions for project resources

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup Environment (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running or access production at [Streamlit]([https://streamlit.in4metrix.dev]() "Audio Research").

## 🎹 Piano Roll Editor

Experience the professional audio mixer by visiting `/mixer-demo`:

- **Multi-channel mixing** with volume, pan, and effects controls
- **Real-time level meters** with visual feedback
- **Mute/Solo/Record** functionality per channel
- **Master volume control** and effects routing
- **Export/import** mixer settings

## 🏗️ Technology Stack

### 🎯 Core Framework

- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Modern utility-first styling

### 🔥 Backend & Database

- **⚡ Supabase** - Open source Firebase alternative
- **🐘 PostgreSQL** - Robust relational database
- **🔐 Auth** - Enterprise-grade authentication
- **📨 Resend** - Reliable SMTP email delivery

### 🎵 Audio Processing

- **🎵 Web Audio API** - Low-latency audio processing
- **🎛️ Audio Nodes** - Gain, Panner, Analyser for professional mixing
- **📊 FFT Analysis** - Real-time frequency and time-domain analysis
- **🎼 MIDI Processing** - Complete MIDI file generation and manipulation

### 🧩 UI Components

- **🧩 shadcn/ui** - High-quality accessible components
- **🎯 Lucide React** - Beautiful icon library
- **🎨 Framer Motion** - Smooth animations and transitions
- **🌈 Next Themes** - Dark/light mode support

### 📋 Data Management

- **🎣 React Hook Form** - Performant forms with validation
- **✅ Zod** - TypeScript-first schema validation
- **🐻 Zustand** - Simple state management
- **🔄 TanStack Query** - Powerful data synchronization

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, signup, etc.)
│   ├── mixer-demo/        # Professional audio mixer demo
│   ├── stem-demo/         # Stem separation features
│   └── page.tsx          # Main transcription interface
├── components/            # Reusable React components
│   ├── audio-mixer.tsx   # Professional mixing console
│   ├── enterprise-layout.tsx # App shell with auth context
│   ├── collaboration.tsx # Team management UI
│   └── ui/               # shadcn/ui components
├── lib/                   # Audio processing utilities
│   ├── supabase.ts       # Database client & auth logic
│   ├── audio-analysis.ts # Core audio analysis algorithms
│   ├── audio-processor.ts # Audio file processing
│   ├── stem-separation.ts # Instrument separation
│   └── midi-utils.ts     # MIDI file generation
└── hooks/                 # Custom React hooks
```

## 🎵 Audio Features

### Real-time Transcription

- **Pitch Detection** - Advanced autocorrelation algorithms
- **Note Extraction** - Intelligent note onset detection
- **Rhythm Analysis** - Tempo and timing extraction
- **Confidence Scoring** - Quality metrics for transcription accuracy

### Piano Roll Editor

- **Note Grid** - DAW-style visual note display
- **Effects Processing** - Reverb, delay, EQ simulation
- **Note Editing** - Click to add, select, and delete notes
- **Automation Ready** - Parameter automation framework

### Stem Separation

- **Frequency Analysis** - Band-based instrument separation
- **AI-ready Architecture** - Prepared for TensorFlow.js integration
- **Instrument Detection** - Automatic instrument identification
- **Export Options** - Individual stem export

## 🔧 Development

### Audio Processing

```typescript
// Analyze audio file
const audioBuffer = await decodeAudioFile(file);
const analysis = await analyzeAudio(audioBuffer, options);

// Process with mixer
const gainNode = audioContext.createGain();
const pannerNode = audioContext.createStereoPanner();
const analyserNode = audioContext.createAnalyser();
```

### Mixer Integration

```typescript
<AudioMixer
  channels={channels}
  onChannelUpdate={handleChannelUpdate}
  masterVolume={masterVolume}
  onMasterVolumeChange={setMasterVolume}
  isPlaying={isPlaying}
  onPlayPause={handlePlayPause}
/>
```

## 🚀 Production Features

- **🔒 Security** - Updated dependencies, vulnerability fixes
- **⚡ Performance** - Lazy loading, optimized audio processing
- **📱 Responsive** - Mobile-first design principles
- **🎨 Accessibility** - WCAG compliant components
- **🌍 Internationalization** - Multi-language support ready

## 📚 Documentation

- **[Stem Separation Guide](./STEM_SEPARATION_GUIDE.md)** - Instrument separation features
- **[Processing Settings Guide](./PROCESSING_SETTINGS_GUIDE.md)** - Audio processing configuration
- **[Music Disciplines Guide](./MUSIC_DISCIPLINES_GUIDE.md)** - Research applications

## 🎯 Use Cases

### 🎓 Academic Research

- **Ethnomusicological Studies** - Field recording analysis
- **Music Theory Research** - Pattern and structure analysis
- **Performance Analysis** - Timing and expression study

### 🎵 Professional Audio

- **Music Production** - Demo recording and arrangement
- **Audio Engineering** - Mixing and processing tools
- **Sound Design** - Audio effect and texture creation

### 🎓 Education

- **Music Theory** - Visual learning tools
- **Audio Engineering** - Hands-on mixing experience
- **Research Methods** - Data collection and analysis

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **Web Audio API** - For powerful browser-based audio processing
- **shadcn/ui** - For beautiful and accessible UI components
- **Next.js Team** - For the excellent React framework
- **Audio Research Community** - For the algorithms and techniques that make this possible

---

Built with ❤️ for the audio and research communities. 🎵
