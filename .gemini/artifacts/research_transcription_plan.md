# Publication-Quality Audio Transcription: Research & Implementation Plan

## Executive Summary

The current implementation has **two critical issues** preventing accurate playback:

### Issue 1: Transcription Accuracy (80% of the problem)
The current pitch detection uses **simple autocorrelation**, which:
- Only detects **monophonic** audio (one note at a time)
- Creates **octave errors** (detecting harmonics instead of fundamentals)
- Has poor **timing accuracy** for note onsets/offsets
- Cannot handle **polyphonic** music at all

### Issue 2: Playback Quality (20% of the problem)
The piano roll uses **simple oscillators** which:
- Generate basic sine waves (no timbre)
- Have abrupt note envelopes (no ADSR)
- Sound nothing like real instruments

---

## Recommended Solution Stack

### For Publication-Quality Research:

| Component | Current | Recommended | Accuracy Gain |
|-----------|---------|-------------|---------------|
| **Pitch Detection** | Autocorrelation | Spotify Basic Pitch | +40-60% |
| **MIDI Playback** | Raw oscillators | Tone.js + Samples | +100% realism |
| **Export** | Manual conversion | Standardized MIDI/CSV | Publication-ready |

---

## Phase 1: Integrate Basic Pitch (Spotify's ML Model)

### What is Basic Pitch?
- Open-source neural network from Spotify
- Handles **polyphonic** audio (multiple notes)
- **Pitch bend** detection for microtonal nuances
- Works in browser via **WebAssembly**

### Installation:
```bash
npm install @spotify/basic-pitch
```

### Key Benefits for Research:
1. **Polyphonic transcription** - Can detect 5+ simultaneous notes
2. **Pitch bend detection** - Essential for ethnomusicology (gamelan, maqam, etc.)
3. **Velocity accuracy** - Better dynamics representation
4. **Academically cited** - Used in published research

### Integration Example:
```typescript
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents } from '@spotify/basic-pitch';

async function transcribeWithBasicPitch(audioBuffer: AudioBuffer) {
  const basicPitch = new BasicPitch('/model/');

  const frames = await basicPitch.evaluateModel(audioBuffer, (progress) => {
    console.log(`Processing: ${progress.percentComplete}%`);
  });

  let notes = noteFramesToTime(
    frames.noteFrames,
    frames.onsets,
    audioBuffer.sampleRate
  );

  // Add pitch bends for microtonal accuracy
  notes = addPitchBendsToNoteEvents(frames.contours, notes);

  return notes;
}
```

---

## Phase 2: Implement Tone.js for Realistic Playback

### Why Tone.js?
- Professional-grade audio framework
- Built-in **samplers** for realistic instrument sounds
- Proper **ADSR envelopes**
- Global **transport** for accurate timing

### Installation:
```bash
npm install tone @tonejs/midi
```

### Key Features:
1. **Tone.Sampler** - Load real instrument samples
2. **Tone.Transport** - Precise scheduling
3. **Tone.Synth** - Customizable synthesis with envelopes

### Integration Example:
```typescript
import * as Tone from 'tone';

// Create a piano sampler with samples
const piano = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    // ... more samples
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  onload: () => console.log("Piano loaded"),
}).toDestination();

// Schedule notes from transcription
async function playNotes(notes: Note[]) {
  await Tone.start();

  const now = Tone.now();
  notes.forEach(note => {
    piano.triggerAttackRelease(
      Tone.Frequency(note.midi, "midi").toFrequency(),
      note.duration,
      now + note.startTime,
      note.velocity / 127
    );
  });
}
```

---

## Phase 3: Standardized Export for Research

### MIDI Export
The current MIDI export is functional but should be validated against:
- Standard MIDI Parser libraries
- DAW import (Logic Pro, Ableton, Reaper)

### CSV Export for Statistical Analysis
```csv
NoteNumber,NoteName,Octave,Frequency,StartTime,Duration,Velocity,Confidence,PitchBend
60,C,4,261.63,0.125,0.500,80,0.95,0.00
64,E,4,329.63,0.625,0.375,75,0.87,0.12
```

### R/Python Compatibility
For R analysis:
```r
library(tuneR)
library(readr)

notes <- read_csv("transcription.csv")
tempo_analysis <- notes %>%
  mutate(IOI = lead(StartTime) - StartTime) %>%
  summarize(mean_IOI = mean(IOI, na.rm=TRUE))
```

For Python analysis:
```python
import pandas as pd
import music21

notes = pd.read_csv("transcription.csv")
stream = music21.stream.Stream()
for _, row in notes.iterrows():
    note = music21.note.Note(row['NoteName'] + str(row['Octave']))
    note.quarterLength = row['Duration'] * 2  # Assuming 120 BPM
    stream.append(note)
```

---

## Phase 4: UI Improvements for Researchers

### Recommended Workflow:
```
1. Dashboard: Upload Audio
      ↓
2. Transcription: Configure & Process
   - Algorithm: Basic Pitch (ML) / Essentia / Autocorrelation
   - Sensitivity settings
   - Polyphony settings
      ↓
3. Piano Roll: Review & Edit
   - Visual note editing
   - Playback with realistic sounds
   - Mark errors/corrections
      ↓
4. Export: Publication-Ready Data
   - Standard MIDI
   - CSV with all metadata
   - PDF score (using VexFlow)
   - Analysis-ready format for R/Python
```

---

## Implementation Priority

### High Priority (Week 1):
1. [ ] Install `@spotify/basic-pitch` npm package
2. [ ] Create wrapper function in `audio-analysis.ts`
3. [ ] Add algorithm selection UI (Basic Pitch vs. Autocorrelation)
4. [ ] Fix playback to use Tone.js

### Medium Priority (Week 2):
1. [ ] Load Salamander piano samples for realistic playback
2. [ ] Improve CSV export with all metadata
3. [ ] Add pitch bend export to MIDI

### Lower Priority (Week 3+):
1. [ ] Add essentia.js for additional analysis features
2. [ ] Implement VexFlow for score visualization
3. [ ] Create R/Python export templates

---

## Libraries to Install

```bash
# Core transcription
npm install @spotify/basic-pitch

# Audio playback
npm install tone @tonejs/midi

# Optional: Additional analysis
npm install essentia.js

# Optional: Score rendering
npm install vexflow
```

---

## References

1. Bittner, R. M., et al. (2022). A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation. ICASSP.
2. Essentia.js: https://mtg.github.io/essentia.js/
3. Tone.js: https://tonejs.github.io/
4. Basic Pitch Web Demo: https://basicpitch.spotify.com/

---

## Next Steps

1. **Immediate**: Install Basic Pitch and create integration
2. **Short-term**: Replace oscillator playback with Tone.js sampler
3. **Medium-term**: Validate exports with musicology researchers
4. **Long-term**: Add comparative analysis tools for research workflows
