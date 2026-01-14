# Ethnomusicology Audio-to-MIDI Transcriber

A modern Next.js web application for batch audio transcription to MIDI, designed for ethnomusicological research on music patterns.

## Features

- **Batch Processing**: Process 10-50 audio files simultaneously with real-time progress tracking
- **Client-Side Analysis**: Uses Web Audio API for pitch detection and audio analysis directly in the browser
- **Multiple Audio Formats**: Support for MP3, WAV, M4A, FLAC, OGG, AAC, and more
- **Intelligent Transcription**: Detects musical notes with configurable sensitivity thresholds
- **Multiple Export Formats**:
  - MIDI (.mid) - Standard MIDI files compatible with DAWs and notation software
  - CSV - Spreadsheet with detailed note features for statistical analysis
  - ZIP Archive - Download all results at once
- **Research Metadata**: Tag files with song name, province, decade, genre, culture group, and researcher name
- **Audio Visualization**: Interactive waveform visualization with note overlay
- **Note Details**: View extracted notes with pitch, timing, duration, and velocity
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Audio Processing**: Web Audio API
- **MIDI Generation**: midi-writer-js
- **File Upload**: react-dropzone with drag-and-drop
- **ZIP Generation**: jszip
- **Language**: TypeScript

## Installation

### Prerequisites

- Node.js 18+ 
- Bun or npm package manager

### Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Run development server**:
   ```bash
   bun run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Workflow

1. **Upload Audio Files**:
   - Drag and drop audio files onto the upload area
   - Or click to browse and select files
   - Supports up to 50 files at once

2. **Configure Settings** (optional):
   - Adjust sensitivity threshold (lower = more sensitive)
   - Set minimum note duration

3. **Add Research Metadata**:
   - Song name
   - Province/Region
   - Decade
   - Genre/Style
   - Culture/Ethnic Group
   - Researcher name

4. **Start Processing**:
   - Click "Start Transcription"
   - Monitor progress in real-time
   - View file-by-file status

5. **Download Results**:
   - Download individual MIDI/CSV files
   - Or download all results as a ZIP archive

### Understanding the Results

#### MIDI Files
- Standard MIDI files (.mid)
- Can be opened in any DAW (Ableton, Logic, FL Studio)
- Compatible with notation software (MuseScore, Sibelius, Finale)

#### CSV Files
- Detailed note-by-note analysis
- Includes metadata and research tags
- Columns: filename, note name, MIDI pitch, frequency, duration, start time, velocity, octave, pitch class, and metadata fields

### Processing Settings

- **Sensitivity Threshold**: Controls how sensitive the pitch detection is
  - Lower values (0.01-0.05): Detects quieter notes, but may include noise
  - Higher values (0.10-0.20): Only detects louder, clearer notes
  - Recommended: 0.05 for most recordings

- **Minimum Note Duration**: Shortest note that will be extracted
  - Lower values (0.05-0.10): Captures fast passages, but may split notes
  - Higher values (0.20-0.50): Only extracts longer notes
  - Recommended: 0.10 for most music

### Tips for Best Results

- Use clear, monophonic or lightly polyphonic audio
- Avoid recordings with heavy background noise
- Start with shorter clips (30-60 seconds) to test settings
- Solo instruments and vocals work best
- Adjust threshold based on recording quality

## Audio Analysis

The application uses the Web Audio API to:

1. **Decode Audio Files**: Converts uploaded files to AudioBuffers
2. **Frequency Analysis**: Uses autocorrelation to detect pitch
3. **Amplitude Detection**: Measures signal strength to identify notes
4. **Note Segmentation**: Groups detected frequencies into musical notes
5. **MIDI Conversion**: Converts detected notes to MIDI format

### How Pitch Detection Works

1. **Chunk Processing**: Audio is processed in 2048-sample windows
2. **RMS Calculation**: Root Mean Square determines amplitude
3. **Autocorrelation**: Finds repeating patterns to determine frequency
4. **Frequency to MIDI**: Converts Hz to MIDI note numbers
5. **Note Merging**: Consecutive same-pitch notes are merged

## CSV Format

The CSV export includes these columns:

| Column | Description |
|--------|-------------|
| filename | Source audio file name |
| songName | Song name from metadata |
| pitchName | Note name (e.g., C4, F#5) |
| midiPitch | MIDI note number (21-108) |
| frequency | Detected frequency in Hz |
| duration | Note duration in seconds |
| startTime | Note start time in seconds |
| velocity | Note velocity/amplitude (0-127) |
| octave | Octave number |
| pitchClass | Pitch class (0-11 for C-B) |
| province | Province/region from metadata |
| decade | Decade from metadata |
| genre | Genre/style from metadata |
| cultureGroup | Culture/ethnic group from metadata |
| researcher | Researcher name from metadata |
| processedAt | Timestamp of processing |

## Research Use Cases

- **Pattern Analysis**: CSV data can be analyzed in statistical software (R, Python, SPSS)
- **Music Transcription**: Export MIDI for notation and editing
- **Comparative Studies**: Compare note patterns across cultures or regions
- **Melodic Analysis**: Study scales, intervals, and melodic contours
- **Database Building**: Create searchable databases of musical examples

## Research Ethics

⚠️ **Important**: Please ensure you:

- Have the right to use audio files for research purposes
- Respect copyright and intellectual property laws
- Obtain proper permissions for field recordings
- Acknowledge cultural rights and sources
- Use results responsibly and ethically
- Consider the implications of indigenous music research

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Supported but may have limitations with large files

## Performance

- **Processing Speed**: ~1-3 seconds per second of audio
- **File Size Limit**: 50MB per file
- **Batch Size**: Up to 50 files
- **Note Detection Range**: C1 (21) to C8 (108) - full piano range

## Troubleshooting

### Files won't upload
- Check file size (max 50MB)
- Verify file format is supported
- Check browser console for errors

### No notes detected
- Lower the sensitivity threshold
- Check audio quality and clarity
- Try with a different, clearer audio file
- Ensure audio has musical content

### Too many false notes
- Increase the sensitivity threshold
- Increase minimum note duration
- Use cleaner audio with less background noise

### Poor transcription quality
- Use monophonic or lightly polyphonic audio
- Reduce background noise
- Try with shorter clips to test settings
- Adjust threshold based on recording quality

## Development

### Project Structure

```
src/
├── app/
│   └── page.tsx              # Main application page
├── components/
│   ├── audio-file-upload.tsx    # File upload component
│   ├── audio-visualizer.tsx     # Waveform visualization
│   ├── batch-progress.tsx        # Progress tracking
│   ├── metadata-form.tsx         # Research metadata form
│   └── ui/                       # shadcn/ui components
└── lib/
    ├── audio-analysis.ts         # Audio processing algorithms
    ├── audio-processor.ts        # Main processing logic
    ├── csv-utils.ts              # CSV export utilities
    ├── midi-utils.ts             # MIDI generation
    └── zip-utils.ts              # ZIP archive utilities
```

### Adding New Features

The application is modular and extensible:

1. **Add new export formats**: Extend the utilities in `lib/`
2. **Add metadata fields**: Update `MetadataForm` component
3. **Enhance pitch detection**: Modify algorithms in `audio-analysis.ts`
4. **Improve visualization**: Update `AudioVisualizer` component

## Limitations

- **Polyphonic Detection**: Works best with monophonic audio; polyphonic transcription is experimental
- **Complex Rhythms**: May struggle with very fast or irregular rhythms
- **Chords**: Detects single notes; complex chords may be misrepresented
- **Background Noise**: Can cause false detections in noisy recordings
- **No MusicXML Export**: Currently only supports MIDI and CSV formats

## Future Enhancements

Potential improvements:

- Chord detection and labeling
- Tempo and time signature detection
- Polyphonic transcription improvements
- MusicXML export support
- Database integration
- User authentication and project management
- Advanced filtering and search
- Comparative analysis tools
- AI-powered pattern recognition

## Citation

If you use this tool in your research, please cite:

> Ethnomusicology Audio-to-MIDI Transcriber. (2024). Web-based tool for batch audio transcription and note extraction. Built with Next.js and Web Audio API.

## License

This project is provided as-is for research and educational purposes. Please respect the licenses of all underlying libraries.

## Acknowledgments

- **Web Audio API** - Browser audio processing
- **midi-writer-js** - MIDI file generation
- **shadcn/ui** - Beautiful UI components
- **react-dropzone** - Drag-and-drop file upload
- **Next.js** - React framework

## Support

For issues, questions, or contributions:

1. Check the troubleshooting section above
2. Review the code comments in `/src/lib/` for implementation details
3. Test with different audio files and settings

---

Built for ethnomusicology research with ❤️
