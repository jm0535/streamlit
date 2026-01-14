# Streamlit - Advanced Processing Settings Guide

Comprehensive guide to all processing settings available in Streamlit for ethnomusicological research.

## Table of Contents

1. [Basic Detection Settings](#basic-detection)
2. [Frequency Detection Settings](#frequency-detection)
3. [Audio Analysis Parameters](#audio-analysis-parameters)
4. [Filtering Options](#filtering-options)
5. [MIDI Output Settings](#midi-output-settings)
6. [Tempo & Rhythm Detection](#tempo--rhythm-detection)
7. [Ethnomusicology-Specific Settings](#ethnomusicology-specific-settings)
8. [Performance Settings](#performance-settings)
9. [Recommended Settings by Use Case](#recommended-settings)

---

## Basic Detection Settings

### Amplitude Threshold
- **Range**: 0.01 - 0.30
- **Default**: 0.05
- **Description**: Minimum amplitude level required for note detection
- **Use Case**:
  - **Low (0.01-0.03)**: Quiet recordings, distant microphones
  - **Medium (0.04-0.07)**: Standard field recordings (recommended)
  - **High (0.08-0.30)**: Noisy environments, reduce false positives

### Minimum Note Duration
- **Range**: 0.05s - 0.50s
- **Default**: 0.10s
- **Description**: Shortest duration for a detected note to be included
- **Use Case**:
  - **Short (0.05-0.10s)**: Fast passages, grace notes, ornaments
  - **Medium (0.10-0.15s)**: Most music (recommended)
  - **Long (0.20-0.50s)**: Slow music, eliminate brief noise

### Pitch Smoothing
- **Range**: 0 - 100%
- **Default**: 80%
- **Description**: Amount of smoothing applied to pitch output to reduce jitter
- **Use Case**:
  - **Low (0-30%)**: Fast pitch changes, ornamental passages
  - **Medium (40-70%)**: Most instruments (recommended)
  - **High (80-100%)**: Steady pitches, drones, sustained notes

---

## Frequency Detection Settings

### Frequency Range
- **Min Frequency**: 20 - 200 Hz (Default: 50 Hz)
- **Max Frequency**: 500 - 5000 Hz (Default: 2000 Hz)
- **Description**: Detectable frequency range for pitch detection
- **Use Case**:
  - **Vocal Music**: Min 80-150 Hz, Max 1000-1500 Hz
  - **String Instruments**: Min 50-80 Hz, Max 2000-3000 Hz
  - **Wind Instruments**: Min 100-200 Hz, Max 1500-2500 Hz
  - **Percussion**: Min 20-50 Hz, Max 300-500 Hz
  - **Full Range**: Min 50 Hz, Max 2000 Hz (default)

### Confidence Threshold
- **Range**: 10% - 95%
- **Default**: 70%
- **Description**: Minimum correlation confidence for valid pitch detection
- **Use Case**:
  - **Low (10-30%)**: Include uncertain pitches, more notes, some errors
  - **Medium (50-80%)**: Balanced approach (recommended)
  - **High (85-95%)**: Only very clear pitches, fewer false positives

### Octave Correction
- **Options**: Enabled / Disabled
- **Default**: Enabled
- **Description**: Automatically fix octave jumps in pitch detection
- **Use Case**: Always enabled for most applications. Disable only if you trust raw detection.

---

## Audio Analysis Parameters

### FFT Window Size
- **Options**: 1024, 2048, 4096, 8192
- **Default**: 2048
- **Description**: Size of analysis window for frequency analysis
- **Use Case**:
  - **1024**: Fast processing, lower frequency resolution
  - **2048**: Balanced performance/accuracy (recommended)
  - **4096**: Higher accuracy, slower processing
  - **8192**: Maximum accuracy, slowest processing

### Window Function
- **Options**: Rectangular, Hann, Hamming, Blackman
- **Default**: Hann
- **Description**: Window function reduces spectral leakage during FFT
- **Use Case**:
  - **Rectangular**: No smoothing, fastest
  - **Hann**: Good frequency resolution, minimal leakage (recommended)
  - **Hamming**: Reduced side lobes, good balance
  - **Blackman**: Best side lobe suppression, slightly wider main lobe

### Channel Selection
- **Options**: Left, Right, Mix, Both
- **Default**: Mix
- **Description**: Which audio channel(s) to process
- **Use Case**:
  - **Left**: Solo on left channel
  - **Right**: Solo on right channel
  - **Mix**: Average of both channels (recommended for stereo)
  - **Both**: Process channels separately (experimental)

---

## Filtering Options

### Noise Gate
- **Options**: Enabled / Disabled
- **Threshold**: 0.01 - 0.10 (Default: 0.02)
- **Description**: Filter out low-amplitude background noise
- **Use Case**:
  - **Enabled**: Noisy recordings, outdoor recordings, background hum
  - **Disabled**: Clean recordings, very quiet passages needed
  - **Low threshold (0.01-0.03)**: Filter very quiet sounds
  - **High threshold (0.05-0.10)**: Filter moderate-level noise

### High-Pass Filter
- **Options**: Enabled / Disabled
- **Cutoff**: 40 - 200 Hz (Default: 80 Hz)
- **Description**: Remove low-frequency rumble and noise
- **Use Case**:
  - **Enabled**: Wind noise, room rumble, handling noise
  - **Cutoff 40-80 Hz**: Minimal low frequencies (e.g., vocals)
  - **Cutoff 100-200 Hz**: More aggressive low-frequency removal

### Low-Pass Filter
- **Options**: Enabled / Disabled
- **Cutoff**: 500 - 5000 Hz (Default: 2000 Hz)
- **Description**: Remove high-frequency noise and artifacts
- **Use Case**:
  - **Enabled**: High-pitched noise, digital artifacts, sibilance
  - **Cutoff 500-1000 Hz**: Darker sound, reduce harshness
  - **Cutoff 1500-2000 Hz**: Standard high-frequency limit (recommended)
  - **Cutoff 3000-5000 Hz**: Preserve most harmonics

---

## MIDI Output Settings

### MIDI Note Range
- **Min Note**: 21 (A0) - 60 (C4) (Default: 21)
- **Max Note**: 60 (C4) - 108 (C8) (Default: 108)
- **Description**: Range of MIDI notes to output
- **Use Case**:
  - **Piano Range**: 21-108 (full piano, recommended)
  - **Bass Range**: 21-48
  - **Mid Range**: 48-72
  - **High Range**: 72-108
  - **Vocal Range**: 36-84

### Timing Quantization
- **Options**: None, 32nd, 16th, 8th, Quarter
- **Default**: None
- **Description**: Snap note timings to rhythmic grid
- **Use Case**:
  - **None**: Preserve original timing (recommended for research)
  - **32nd**: Very precise quantization
  - **16th**: Standard fine quantization
  - **8th**: Medium quantization
  - **Quarter**: Coarse quantization, strong rhythmic feel

### Velocity Scaling
- **Options**: Enabled / Disabled
- **Range**: Min 0-100, Max 27-127
- **Description**: Normalize and scale velocity values
- **Use Case**:
  - **Enabled**: Consistent dynamics across recordings
  - **Min/Max**: Limit velocity range for specific instruments
  - **Disabled**: Preserve original dynamics (recommended)

---

## Tempo & Rhythm Detection

### Tempo Detection
- **Options**: Enabled / Disabled
- **Default**: Disabled
- **Description**: Automatically detect tempo from note onsets
- **Use Case**:
  - **Enabled**: Get BPM for each recording
  - **Disabled**: Use fixed tempo (faster, recommended for quantization)

### Target Tempo
- **Range**: 40 - 240 BPM
- **Default**: 120 BPM
- **Description**: Force specific tempo for quantization
- **Use Case**:
  - **40-80**: Slow music (adagio, largo)
  - **80-120**: Moderate tempo (andante, moderato)
  - **120-160**: Fast tempo (allegro)
  - **160-240**: Very fast (presto)

### Time Signature
- **Options**: 4/4, 3/4, 2/4, 6/8, 12/8
- **Default**: 4/4
- **Description**: Expected time signature for quantization
- **Use Case**:
  - **4/4**: Common time (march, rock, pop)
  - **3/4**: Waltz time
  - **2/4**: March time
  - **6/8, 12/8**: Compound time signatures

---

## Ethnomusicology-Specific Settings

### Tuning System
- **Options**: Equal, Just, Pythagorean, Meantone, Quarter-Tone
- **Default**: Equal
- **Description**: Tuning system for accurate pitch representation
- **Use Case**:
  - **Equal**: Standard modern tuning (A4=440Hz, 12-EDO)
  - **Just**: Pure intervals, historical performances
  - **Pythagorean**: Medieval/Renaissance music
  - **Meantone**: Baroque tuning, keyboard music
  - **Quarter-Tone**: Arabic, Persian, microtonal music

### Reference Frequency
- **Range**: 415 - 466 Hz
- **Default**: 440 Hz
- **Description**: Reference frequency for A4 note
- **Use Case**:
  - **440 Hz**: Modern standard (most common)
  - **415 Hz**: Baroque period
  - **432 Hz**: "Verdi tuning", some modern contexts
  - **442 Hz**: European orchestras
  - **466 Hz**: Some European traditions

### Scale Constraint
- **Options**: Enabled / Disabled
- **Scales**: Chromatic, Major, Minor, Pentatonic (Major/Minor), Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Blues, Harmonic Minor, Melodic Minor
- **Root**: C through B (Default: C4)
- **Description**: Only detect notes within specified scale
- **Use Case**:
  - **Pentatonic Major**: Chinese, Japanese, many folk traditions
  - **Pentatonic Minor**: Blues, rock, some folk
  - **Modal**: Dorian, Phrygian, etc. for medieval/modal music
  - **Major/Minor**: Western tonal music
  - **Chromatic**: All notes (default, no constraint)

### Microtone Detection
- **Options**: Enabled / Disabled
- **Sensitivity**: 10% - 80% (Default: 30%)
- **Description**: Detect quarter-tones and other micro-intervals
- **Use Case**:
  - **Enabled**: Arabic, Persian, Indian, other microtonal traditions
  - **Low sensitivity (10-30%)**: Subtle microtones
  - **High sensitivity (50-80%)**: Clear microtonal inflections

---

## Performance Settings

### Maximum Processing Duration
- **Range**: 30s - 300s or Full (null)
- **Default**: Full
- **Description**: Limit processing to first N seconds of audio
- **Use Case**:
  - **30-60s**: Quick analysis, test settings
  - **120-180s**: Longer clips, representative sections
  - **300s**: Full songs in most cases
  - **Full**: Process entire file (recommended)

### Fast Mode
- **Options**: Enabled / Disabled
- **Default**: Disabled
- **Description**: Lower quality but faster processing
- **Use Case**:
  - **Enabled**: Quick previews, batch processing many files
  - **Disabled**: Best quality, research-grade (recommended)

---

## Recommended Settings by Use Case

### Field Recordings (Ethnomusicology)
- **Amplitude Threshold**: 0.04-0.06
- **Min Note Duration**: 0.10s
- **Frequency Range**: 50-2000 Hz
- **Noise Gate**: Disabled (or 0.02)
- **Tuning**: Equal or match regional tradition
- **Scale Constraint**: Disabled (use full chromatic)

### Studio Recordings
- **Amplitude Threshold**: 0.03-0.05
- **Min Note Duration**: 0.08-0.12s
- **Frequency Range**: 50-2000 Hz
- **Noise Gate**: Disabled
- **FFT Size**: 2048 or 4096
- **Window**: Hann

### Vocal Music
- **Frequency Range**: 80-1500 Hz
- **High-Pass**: Enabled, 80-100 Hz
- **Min Note Duration**: 0.08-0.15s
- **Smoothing**: 60-80%

### String Instruments
- **Frequency Range**: 50-3000 Hz
- **Low-Pass**: Enabled, 2000-2500 Hz
- **Pitch Smoothing**: 70-90%
- **Min Note Duration**: 0.05-0.10s

### Wind Instruments
- **Frequency Range**: 100-2500 Hz
- **Pitch Smoothing**: 50-70%
- **Min Note Duration**: 0.10-0.20s

### Percussion
- **Frequency Range**: 20-500 Hz
- **Min Note Duration**: 0.05-0.08s
- **Amplitude Threshold**: 0.08-0.15

### Microtonal Music (Arabic, Persian, Indian)
- **Tuning System**: Quarter-Tone or match tradition
- **Microtone Detection**: Enabled
- **Microtone Sensitivity**: 40-60%
- **Scale Constraint**: May be appropriate for specific maqam/raga

### Modal Music (Medieval, Renaissance, Folk)
- **Tuning System**: Pythagorean or Just
- **Scale Constraint**: Enabled (use appropriate mode)
- **Octave Correction**: Enabled

### Pentatonic Traditions (Chinese, Japanese, etc.)
- **Scale Constraint**: Enabled (Pentatonic Major or Minor)
- **Tuning System**: Equal or regional
- **Frequency Range**: May be narrower based on tradition

---

## Tips for Best Results

1. **Start with defaults**, then adjust one setting at a time
2. **Use processing preview** (short clips) to find optimal settings
3. **Match settings to recording context** (indoor/outdoor, instrument type)
4. **Consider cultural context** when selecting tuning and scale options
5. **Document your settings** for reproducibility in research
6. **Test on representative samples** before processing large batches
7. **Keep processing notes** in your research documentation

---

## CSV Export Columns

When settings are applied, CSV exports include:
- Basic note data: pitchName, midiPitch, frequency, duration, startTime, velocity
- Derived data: octave, pitchClass
- Research metadata: filename, songName, province, decade, genre, cultureGroup, researcher, processedAt
- Detection metadata: detectedTempo, detectedTimeSignature

---

## Technical Notes

- **Frequency Detection**: Autocorrelation algorithm with configurable parameters
- **Window Functions**: Apply spectral leakage reduction
- **Filters**: First-order IIR filters for simplicity
- **Quantization**: Simple grid snapping based on tempo
- **Scale Matching**: MIDI note modulo arithmetic for constraint
- **Tuning**: Frequency-to-MIDI conversion with system-specific adjustments

---

For questions or support, contact: research@streamlit.com
