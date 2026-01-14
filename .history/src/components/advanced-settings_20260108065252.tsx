'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Info, Music2, Sliders, Filter, Clock, Zap, Globe } from 'lucide-react';
import { AudioProcessingOptions } from '@/lib/audio-analysis';

interface AdvancedSettingsProps {
  settings: AudioProcessingOptions;
  onChange: (settings: AudioProcessingOptions) => void;
  disabled?: boolean;
}

export function AdvancedSettings({ settings, onChange, disabled = false }: AdvancedSettingsProps) {
  const updateSetting = <K extends keyof AudioProcessingOptions>(
    key: K,
    value: AudioProcessingOptions[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Advanced Processing Settings
        </CardTitle>
        <CardDescription>
          Research-grade configuration for accurate audio transcription
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            These advanced settings are designed for ethnomusicological research.
            Use default values for most recordings, or customize for specific analysis needs.
          </AlertDescription>
        </Alert>

        <Accordion type="multiple" defaultValue={['basic', 'frequency']} className="w-full">
          {/* Basic Detection */}
          <AccordionItem value="basic">
            <AccordionTrigger className="text-base font-semibold">
              <Music2 className="h-4 w-4 mr-2" />
              Basic Detection
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="threshold" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Amplitude Threshold
                  </Label>
                  <Badge variant="secondary">{(settings.threshold || 0.05).toFixed(3)}</Badge>
                </div>
                <Slider
                  id="threshold"
                  value={[settings.threshold || 0.05]}
                  onValueChange={(value) => updateSetting('threshold', value[0])}
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum amplitude for note detection. Lower values detect quieter notes but may include noise.
                </p>
              </div>

              <Separator />

              {/* Minimum Note Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minNoteDuration">
                    Minimum Note Duration
                  </Label>
                  <Badge variant="secondary">{(settings.minNoteDuration || 0.1).toFixed(2)}s</Badge>
                </div>
                <Slider
                  id="minNoteDuration"
                  value={[settings.minNoteDuration || 0.1]}
                  onValueChange={(value) => updateSetting('minNoteDuration', value[0])}
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Shortest note duration to extract. Higher values filter out brief sounds.
                </p>
              </div>

              <Separator />

              {/* Smoothing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smoothing">Pitch Smoothing</Label>
                  <Badge variant="secondary">{((settings.smoothing || 0.8) * 100).toFixed(0)}%</Badge>
                </div>
                <Slider
                  id="smoothing"
                  value={[settings.smoothing || 0.8]}
                  onValueChange={(value) => updateSetting('smoothing', value[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Reduces jitter in pitch detection. Higher values smooth more but may lose detail.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Frequency Detection */}
          <AccordionItem value="frequency">
            <AccordionTrigger className="text-base font-semibold">
              <Music2 className="h-4 w-4 mr-2" />
              Frequency Detection
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Frequency Range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Frequency Range</Label>
                  <Badge variant="secondary">
                    {settings.frequencyMin || 50} - {settings.frequencyMax || 2000} Hz
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freqMin" className="text-xs">Minimum</Label>
                    <Slider
                      id="freqMin"
                      value={[settings.frequencyMin || 50]}
                      onValueChange={(value) => updateSetting('frequencyMin', value[0])}
                      min={20}
                      max={200}
                      step={10}
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freqMax" className="text-xs">Maximum</Label>
                    <Slider
                      id="freqMax"
                      value={[settings.frequencyMax || 2000]}
                      onValueChange={(value) => updateSetting('frequencyMax', value[0])}
                      min={500}
                      max={5000}
                      step={100}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detectable frequency range. Narrow to focus on specific instrument ranges.
                </p>
              </div>

              <Separator />

              {/* Confidence Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confidence">Confidence Threshold</Label>
                  <Badge variant="secondary">{((settings.confidenceThreshold || 0.7) * 100).toFixed(0)}%</Badge>
                </div>
                <Slider
                  id="confidence"
                  value={[settings.confidenceThreshold || 0.7]}
                  onValueChange={(value) => updateSetting('confidenceThreshold', value[0])}
                  min={0.1}
                  max={0.95}
                  step={0.05}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum correlation confidence for note detection. Higher values reduce false positives.
                </p>
              </div>

              <Separator />

              {/* Octave Correction */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="octaveCorrect" className="cursor-pointer">
                    Octave Correction
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Fix octave jumps in pitch detection
                  </p>
                </div>
                <Switch
                  id="octaveCorrect"
                  checked={settings.enableOctaveCorrection}
                  onCheckedChange={(checked) => updateSetting('enableOctaveCorrection', checked)}
                  disabled={disabled}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Audio Analysis */}
          <AccordionItem value="analysis">
            <AccordionTrigger className="text-base font-semibold">
              <Sliders className="h-4 w-4 mr-2" />
              Audio Analysis
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* FFT Size */}
              <div className="space-y-3">
                <Label>FFT Window Size</Label>
                <Select
                  value={String(settings.fftSize || 2048)}
                  onValueChange={(value) => updateSetting('fftSize', parseInt(value))}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024">1024 - Fast, less accurate</SelectItem>
                    <SelectItem value="2048">2048 - Balanced (recommended)</SelectItem>
                    <SelectItem value="4096">4096 - More accurate</SelectItem>
                    <SelectItem value="8192">8192 - Most accurate, slower</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Larger windows provide better frequency resolution but slower processing.
                </p>
              </div>

              <Separator />

              {/* Window Type */}
              <div className="space-y-3">
                <Label>Window Function</Label>
                <Select
                  value={settings.windowType || 'hann'}
                  onValueChange={(value) => updateSetting('windowType', value as any)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangular">Rectangular - No smoothing</SelectItem>
                    <SelectItem value="hann">Hann - Good balance (recommended)</SelectItem>
                    <SelectItem value="hamming">Hamming - Reduced side lobes</SelectItem>
                    <SelectItem value="blackman">Blackman - Best side lobe suppression</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Window function reduces spectral leakage during FFT.
                </p>
              </div>

              <Separator />

              {/* Channel Selection */}
              <div className="space-y-3">
                <Label>Channel Selection</Label>
                <Select
                  value={settings.channelSelection || 'mix'}
                  onValueChange={(value) => updateSetting('channelSelection', value as any)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Channel Only</SelectItem>
                    <SelectItem value="right">Right Channel Only</SelectItem>
                    <SelectItem value="mix">Stereo Mix (recommended)</SelectItem>
                    <SelectItem value="both">Process Both Separately</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Filtering */}
          <AccordionItem value="filtering">
            <AccordionTrigger className="text-base font-semibold">
              <Filter className="h-4 w-4 mr-2" />
              Audio Filtering
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Noise Gate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="noiseGate" className="cursor-pointer">
                      Enable Noise Gate
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Filter out low-amplitude background noise
                    </p>
                  </div>
                  <Switch
                    id="noiseGate"
                    checked={settings.enableNoiseGate}
                    onCheckedChange={(checked) => updateSetting('enableNoiseGate', checked)}
                    disabled={disabled}
                  />
                </div>

                {settings.enableNoiseGate && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="noiseGateThreshold" className="text-xs">Noise Gate Threshold</Label>
                    <Slider
                      id="noiseGateThreshold"
                      value={[settings.noiseGateThreshold || 0.02]}
                      onValueChange={(value) => updateSetting('noiseGateThreshold', value[0])}
                      min={0.01}
                      max={0.1}
                      step={0.01}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* High Pass Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="highPass" className="cursor-pointer">
                      Enable High-Pass Filter
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Remove low-frequency rumble and noise
                    </p>
                  </div>
                  <Switch
                    id="highPass"
                    checked={settings.enableHighPassFilter}
                    onCheckedChange={(checked) => updateSetting('enableHighPassFilter', checked)}
                    disabled={disabled}
                  />
                </div>

                {settings.enableHighPassFilter && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="highPassFreq" className="text-xs">Cutoff Frequency</Label>
                    <Slider
                      id="highPassFreq"
                      value={[settings.highPassFrequency || 80]}
                      onValueChange={(value) => updateSetting('highPassFrequency', value[0])}
                      min={40}
                      max={200}
                      step={10}
                      disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(settings.highPassFrequency || 80)} Hz
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Low Pass Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="lowPass" className="cursor-pointer">
                      Enable Low-Pass Filter
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Remove high-frequency noise and artifacts
                    </p>
                  </div>
                  <Switch
                    id="lowPass"
                    checked={settings.enableLowPassFilter}
                    onCheckedChange={(checked) => updateSetting('enableLowPassFilter', checked)}
                    disabled={disabled}
                  />
                </div>

                {settings.enableLowPassFilter && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="lowPassFreq" className="text-xs">Cutoff Frequency</Label>
                    <Slider
                      id="lowPassFreq"
                      value={[settings.lowPassFrequency || 2000]}
                      onValueChange={(value) => updateSetting('lowPassFrequency', value[0])}
                      min={500}
                      max={5000}
                      step={100}
                      disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(settings.lowPassFrequency || 2000)} Hz
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MIDI Output */}
          <AccordionItem value="midi">
            <AccordionTrigger className="text-base font-semibold">
              <Music2 className="h-4 w-4 mr-2" />
              MIDI Output Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* MIDI Range */}
              <div className="space-y-3">
                <Label>MIDI Note Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="midiMin" className="text-xs">Minimum Note</Label>
                    <Slider
                      id="midiMin"
                      value={[settings.midiMinNote || 21]}
                      onValueChange={(value) => updateSetting('midiMinNote', value[0])}
                      min={21}
                      max={60}
                      step={1}
                      disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      MIDI {settings.midiMinNote || 21} ({21 === (settings.midiMinNote || 21) ? 'A0' : ''})
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="midiMax" className="text-xs">Maximum Note</Label>
                    <Slider
                      id="midiMax"
                      value={[settings.midiMaxNote || 108]}
                      onValueChange={(value) => updateSetting('midiMaxNote', value[0])}
                      min={60}
                      max={108}
                      step={1}
                      disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      MIDI {settings.midiMaxNote || 108} ({108 === (settings.midiMaxNote || 108) ? 'C8' : ''})
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quantization */}
              <div className="space-y-3">
                <Label>Timing Quantization</Label>
                <Select
                  value={settings.quantization || 'none'}
                  onValueChange={(value) => updateSetting('quantization', value as any)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Preserve original timing</SelectItem>
                    <SelectItem value="thirty-second">32nd Notes</SelectItem>
                    <SelectItem value="sixteenth">16th Notes</SelectItem>
                    <SelectItem value="eighth">8th Notes</SelectItem>
                    <SelectItem value="quarter">Quarter Notes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Snap note timings to rhythmic grid for cleaner output.
                </p>
              </div>

              <Separator />

              {/* Velocity Scaling */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="velocityScale" className="cursor-pointer">
                      Enable Velocity Scaling
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Normalize and scale velocity values
                    </p>
                  </div>
                  <Switch
                    id="velocityScale"
                    checked={settings.enableVelocityScaling}
                    onCheckedChange={(checked) => updateSetting('enableVelocityScaling', checked)}
                    disabled={disabled}
                  />
                </div>

                {settings.enableVelocityScaling && (
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="velMin" className="text-xs">Minimum</Label>
                      <Slider
                        id="velMin"
                        value={[settings.velocityMin || 0]}
                        onValueChange={(value) => updateSetting('velocityMin', value[0])}
                        min={0}
                        max={100}
                        step={5}
                        disabled={disabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="velMax" className="text-xs">Maximum</Label>
                      <Slider
                        id="velMax"
                        value={[settings.velocityMax || 127]}
                        onValueChange={(value) => updateSetting('velocityMax', value[0])}
                        min={27}
                        max={127}
                        step={5}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tempo & Rhythm */}
          <AccordionItem value="tempo">
            <AccordionTrigger className="text-base font-semibold">
              <Clock className="h-4 w-4 mr-2" />
              Tempo & Rhythm
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Tempo Detection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="tempoDetect" className="cursor-pointer">
                      Enable Tempo Detection
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically detect tempo from audio
                    </p>
                  </div>
                  <Switch
                    id="tempoDetect"
                    checked={settings.enableTempoDetection}
                    onCheckedChange={(checked) => updateSetting('enableTempoDetection', checked)}
                    disabled={disabled}
                  />
                </div>
              </div>

              <Separator />

              {/* Target Tempo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="targetTempo">Target Tempo (BPM)</Label>
                  <Badge variant="secondary">{settings.targetTempo || 120}</Badge>
                </div>
                <Slider
                  id="targetTempo"
                  value={[settings.targetTempo || 120]}
                  onValueChange={(value) => updateSetting('targetTempo', value[0])}
                  min={40}
                  max={240}
                  step={5}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Force quantization to specific tempo (used when quantization is enabled).
                </p>
              </div>

              <Separator />

              {/* Time Signature */}
              <div className="space-y-3">
                <Label>Time Signature</Label>
                <Select
                  value={settings.targetTimeSignature || '4/4'}
                  onValueChange={(value) => updateSetting('targetTimeSignature', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4/4">4/4 - Common Time</SelectItem>
                    <SelectItem value="3/4">3/4 - Waltz</SelectItem>
                    <SelectItem value="2/4">2/4 - March</SelectItem>
                    <SelectItem value="6/8">6/8 - Compound</SelectItem>
                    <SelectItem value="12/8">12/8 - Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ethnomusicology */}
          <AccordionItem value="ethno">
            <AccordionTrigger className="text-base font-semibold">
              <Globe className="h-4 w-4 mr-2" />
              Ethnomusicology Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Tuning System */}
              <div className="space-y-3">
                <Label>Tuning System</Label>
                <Select
                  value={settings.tuningSystem || 'equal'}
                  onValueChange={(value) => updateSetting('tuningSystem', value as any)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal Temperament (standard)</SelectItem>
                    <SelectItem value="just">Just Intonation</SelectItem>
                    <SelectItem value="pythagorean">Pythagorean Tuning</SelectItem>
                    <SelectItem value="meantone">Meantone Temperament</SelectItem>
                    <SelectItem value="quarter_tone">Quarter-Tone System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose tuning system for accurate pitch representation in different cultural contexts.
                </p>
              </div>

              <Separator />

              {/* Reference Frequency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="refFreq">Reference A4 Frequency</Label>
                  <Badge variant="secondary">{settings.referenceFrequency || 440} Hz</Badge>
                </div>
                <Slider
                  id="refFreq"
                  value={[settings.referenceFrequency || 440]}
                  onValueChange={(value) => updateSetting('referenceFrequency', value[0])}
                  min={415}
                  max={466}
                  step={1}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Standard is 440 Hz. Historical or regional tunings may vary (415-466 Hz).
                </p>
              </div>

              <Separator />

              {/* Scale Constraint */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="scaleConstrain" className="cursor-pointer">
                      Constrain to Scale
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Only detect notes within selected scale
                    </p>
                  </div>
                  <Switch
                    id="scaleConstrain"
                    checked={settings.enableScaleConstrain}
                    onCheckedChange={(checked) => updateSetting('enableScaleConstrain', checked)}
                    disabled={disabled}
                  />
                </div>

                {settings.enableScaleConstrain && (
                  <div className="space-y-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="scaleType">Scale Type</Label>
                      <Select
                        value={settings.scaleType || 'chromatic'}
                        onValueChange={(value) => updateSetting('scaleType', value as any)}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chromatic">Chromatic (all notes)</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="minor">Natural Minor</SelectItem>
                          <SelectItem value="pentatonic_major">Pentatonic Major</SelectItem>
                          <SelectItem value="pentatonic_minor">Pentatonic Minor</SelectItem>
                          <SelectItem value="dorian">Dorian Mode</SelectItem>
                          <SelectItem value="phrygian">Phrygian Mode</SelectItem>
                          <SelectItem value="lydian">Lydian Mode</SelectItem>
                          <SelectItem value="mixolydian">Mixolydian Mode</SelectItem>
                          <SelectItem value="aeolian">Aeolian Mode</SelectItem>
                          <SelectItem value="blues">Blues Scale</SelectItem>
                          <SelectItem value="harmonic_minor">Harmonic Minor</SelectItem>
                          <SelectItem value="melodic_minor">Melodic Minor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scaleRoot">Scale Root Note</Label>
                      <Select
                        value={String(settings.scaleRoot || 60)}
                        onValueChange={(value) => updateSetting('scaleRoot', parseInt(value))}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => {
                            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                            const noteName = noteNames[i];
                            return (
                              <SelectItem key={i} value={String(60 + i)}>
                                {noteName}4
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Microtone Detection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="microtones" className="cursor-pointer">
                      Enable Microtone Detection
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Detect quarter tones and other micro-intervals
                    </p>
                  </div>
                  <Switch
                    id="microtones"
                    checked={settings.enableMicrotoneDetection}
                    onCheckedChange={(checked) => updateSetting('enableMicrotoneDetection', checked)}
                    disabled={disabled}
                  />
                </div>

                {settings.enableMicrotoneDetection && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="microtoneSense" className="text-xs">Microtone Sensitivity</Label>
                    <Slider
                      id="microtoneSense"
                      value={[settings.microtoneSensitivity || 0.3]}
                      onValueChange={(value) => updateSetting('microtoneSensitivity', value[0])}
                      min={0.1}
                      max={0.8}
                      step={0.1}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Performance */}
          <AccordionItem value="performance">
            <AccordionTrigger className="text-base font-semibold">
              <Zap className="h-4 w-4 mr-2" />
              Performance
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Max Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxDuration">Maximum Processing Duration</Label>
                  <Badge variant="secondary">
                    {settings.maxProcessingDuration ? `${settings.maxProcessingDuration}s` : 'Full File'}
                  </Badge>
                </div>
                <Slider
                  id="maxDuration"
                  value={[settings.maxProcessingDuration || 300]}
                  onValueChange={(value) => updateSetting('maxProcessingDuration', value[0])}
                  min={30}
                  max={300}
                  step={30}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Limit processing to first N seconds. Set to max for full file.
                </p>
              </div>

              <Separator />

              {/* Fast Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="fastMode" className="cursor-pointer">
                    Enable Fast Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Lower quality but faster processing
                  </p>
                </div>
                <Switch
                  id="fastMode"
                  checked={settings.enableFastMode}
                  onCheckedChange={(checked) => updateSetting('enableFastMode', checked)}
                  disabled={disabled}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm flex items-center justify-between gap-4">
              <span>Reset all settings to research-grade defaults optimized for most recordings.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Import and use default options
                  import('@/lib/audio-analysis').then(({ getDefaultOptions }) => {
                    onChange(getDefaultOptions());
                  });
                }}
                disabled={disabled}
              >
                Reset to Defaults
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
