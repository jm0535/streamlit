"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Music2,
  MapPin,
  Calendar,
  Tag,
  Users,
  User,
  Clock,
  BookOpen,
  Globe,
  FileText,
  Mic,
  Music as MusicIcon,
  Waves,
  TrendingUp,
  BarChart3,
  Radio,
  Award,
  GitBranch,
  Factory,
  Target,
} from "lucide-react";

import {
  MusicologyDiscipline,
  HistoricalMetadata,
  EthnomusicologyMetadata,
  SystematicMetadata,
  PopularMusicMetadata,
  DisciplineConfig,
  DEFAULT_HISTORICAL,
  DEFAULT_ETHNOMUSICOLOGY,
  DEFAULT_SYSTEMATIC,
  DEFAULT_POPULAR,
  RESEARCH_PRESETS,
  getDisciplineLabel,
  getDisciplineDescription,
} from "@/lib/musicology-metadata";

interface MusicologyMetadataFormProps {
  config: DisciplineConfig;
  onChange: (config: DisciplineConfig) => void;
  disabled?: boolean;
}

export function MusicologyMetadataForm({
  config,
  onChange,
  disabled = false,
}: MusicologyMetadataFormProps) {
  const [activePreset, setActivePreset] = useState<string>("");

  // Ensure config has all required properties
  const safeConfig = {
    discipline: config.discipline || "historical",
    historical: config.historical || {},
    ethnomusicology: config.ethnomusicology || {},
    systematic: config.systematic || {},
    popular: config.popular || {},
  };

  const handlePresetSelect = (presetKey: string) => {
    setActivePreset(presetKey);
    const preset = RESEARCH_PRESETS[presetKey];
    if (preset) {
      onChange({
        ...config,
        discipline: preset.discipline,
        historical: { ...config.historical, ...preset.historical },
        ethnomusicology: {
          ...config.ethnomusicology,
          ...preset.ethnomusicology,
        },
        systematic: { ...config.systematic, ...preset.systematic },
        popular: { ...config.popular, ...preset.popular },
      });
    }
  };

  const updateHistorical = (field: keyof HistoricalMetadata, value: any) => {
    onChange({
      ...config,
      historical: { ...(config.historical || {}), [field]: value },
    });
  };

  const updateEthnomusicology = (
    field: keyof EthnomusicologyMetadata,
    value: any
  ) => {
    onChange({
      ...config,
      ethnomusicology: { ...(config.ethnomusicology || {}), [field]: value },
    });
  };

  const updateSystematic = (field: keyof SystematicMetadata, value: any) => {
    onChange({
      ...config,
      systematic: { ...(config.systematic || {}), [field]: value },
    });
  };

  const updatePopular = (field: keyof PopularMusicMetadata, value: any) => {
    onChange({
      ...config,
      popular: { ...(config.popular || {}), [field]: value },
    });
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Research Metadata
            </CardTitle>
            <CardDescription>
              Discipline-specific metadata for comprehensive musicological
              analysis
            </CardDescription>
          </div>
          <Badge
            variant={config.discipline === "general" ? "secondary" : "default"}
          >
            {getDisciplineLabel(config.discipline)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Discipline Selection */}
        <div className="space-y-3">
          <Label htmlFor="discipline">Research Discipline</Label>
          <Select
            value={config.discipline}
            onValueChange={(value) =>
              onChange({ ...config, discipline: value as any })
            }
            disabled={disabled}
          >
            <SelectTrigger id="discipline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General - Basic Metadata</SelectItem>
              <SelectItem value="historical">Historical Musicology</SelectItem>
              <SelectItem value="ethnomusicology">Ethnomusicology</SelectItem>
              <SelectItem value="systematic">Systematic Musicology</SelectItem>
              <SelectItem value="popular">Popular Music Studies</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {getDisciplineDescription(config.discipline)}
          </p>
        </div>

        {/* Research Presets */}
        {config.discipline !== "general" && (
          <div className="space-y-3">
            <Label htmlFor="preset">Research Presets</Label>
            <Select
              value={activePreset}
              onValueChange={handlePresetSelect}
              disabled={disabled}
            >
              <SelectTrigger id="preset">
                <SelectValue placeholder="Quick-start with a preset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baroque_composition">
                  Baroque Composition Study
                </SelectItem>
                <SelectItem value="romantic_orchestra">
                  Romantic Orchestra
                </SelectItem>
                <SelectItem value="field_recording">Field Recording</SelectItem>
                <SelectItem value="ceremonial_music">
                  Ceremonial Music
                </SelectItem>
                <SelectItem value="traditional_ensemble">
                  Traditional Ensemble
                </SelectItem>
                <SelectItem value="acoustic_analysis">
                  Acoustic Analysis
                </SelectItem>
                <SelectItem value="harmonic_analysis">
                  Harmonic Analysis
                </SelectItem>
                <SelectItem value="psychoacoustics">
                  Psychoacoustics Study
                </SelectItem>
                <SelectItem value="pop_production">
                  Pop Production Analysis
                </SelectItem>
                <SelectItem value="subculture_analysis">
                  Subculture Analysis
                </SelectItem>
                <SelectItem value="cultural_movement">
                  Cultural Movement
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Pre-configured settings for common research scenarios
            </p>
          </div>
        )}

        {/* Discipline-Specific Metadata Forms */}
        <ScrollArea className="h-[600px]">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger
                value="advanced"
                disabled={config.discipline === "general"}
              >
                {config.discipline === "historical" && "Historical"}
                {config.discipline === "ethnomusicology" && "Cultural"}
                {config.discipline === "systematic" && "Analytical"}
                {config.discipline === "popular" && "Cultural/Social"}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Song Name */}
                <div className="space-y-2">
                  <Label>Song Name</Label>
                  <Input
                    placeholder="Enter song or piece name"
                    value={
                      safeConfig.historical?.songName ||
                      safeConfig.ethnomusicology?.songName ||
                      safeConfig.systematic?.songName ||
                      safeConfig.popular?.songName ||
                      ""
                    }
                    onChange={(e) => {
                      if (safeConfig.discipline === "historical")
                        updateHistorical("songName", e.target.value);
                      else if (safeConfig.discipline === "ethnomusicology")
                        updateEthnomusicology("songName", e.target.value);
                      else if (safeConfig.discipline === "systematic")
                        updateSystematic("songName", e.target.value);
                      else if (safeConfig.discipline === "popular")
                        updatePopular("songName", e.target.value);
                    }}
                    disabled={disabled}
                  />
                </div>

                {/* Researcher */}
                <div className="space-y-2">
                  <Label>Researcher Name</Label>
                  <Input
                    placeholder="Your name or institution"
                    value={
                      safeConfig.historical?.researcher ||
                      safeConfig.ethnomusicology?.researcher ||
                      safeConfig.systematic?.researcher ||
                      safeConfig.popular?.researcher ||
                      ""
                    }
                    onChange={(e) => {
                      if (safeConfig.discipline === "historical")
                        updateHistorical("researcher", e.target.value);
                      else if (safeConfig.discipline === "ethnomusicology")
                        updateEthnomusicology("researcher", e.target.value);
                      else if (safeConfig.discipline === "systematic")
                        updateSystematic("researcher", e.target.value);
                      else if (safeConfig.discipline === "popular")
                        updatePopular("researcher", e.target.value);
                    }}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Research Notes</Label>
                <Textarea
                  placeholder="Additional context, observations, or analysis notes..."
                  rows={4}
                  value={
                    safeConfig.historical?.notes ||
                    safeConfig.ethnomusicology?.notes ||
                    safeConfig.systematic?.notes ||
                    safeConfig.popular?.notes ||
                    ""
                  }
                  onChange={(e) => {
                    if (safeConfig.discipline === "historical")
                      updateHistorical("notes", e.target.value);
                    else if (safeConfig.discipline === "ethnomusicology")
                      updateEthnomusicology("notes", e.target.value);
                    else if (safeConfig.discipline === "systematic")
                      updateSystematic("notes", e.target.value);
                    else if (safeConfig.discipline === "popular")
                      updatePopular("notes", e.target.value);
                  }}
                  disabled={disabled}
                />
              </div>
            </TabsContent>

            {/* Discipline-Specific Advanced Tab */}
            {config.discipline === "historical" && (
              <TabsContent value="advanced" className="space-y-6 mt-4">
                <Accordion
                  type="multiple"
                  defaultValue={["period", "composer"]}
                  className="w-full"
                >
                  {/* Historical Period */}
                  <AccordionItem value="period">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Historical Period & Style
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Period</Label>
                          <Select
                            value={config.historical?.period}
                            onValueChange={(value) =>
                              updateHistorical("period", value)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ancient">Ancient</SelectItem>
                              <SelectItem value="medieval">Medieval</SelectItem>
                              <SelectItem value="renaissance">
                                Renaissance
                              </SelectItem>
                              <SelectItem value="baroque">
                                Baroque (1600-1750)
                              </SelectItem>
                              <SelectItem value="classical">
                                Classical (1750-1820)
                              </SelectItem>
                              <SelectItem value="romantic">
                                Romantic (1820-1900)
                              </SelectItem>
                              <SelectItem value="modern">
                                Modern (1900-1975)
                              </SelectItem>
                              <SelectItem value="contemporary">
                                Contemporary (1975-2000)
                              </SelectItem>
                              <SelectItem value="postmodern">
                                Postmodern (2000-present)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Year Range</Label>
                          <Input
                            placeholder="e.g., 1750-1820"
                            value={config.historical?.yearRange || ""}
                            onChange={(e) =>
                              updateHistorical("yearRange", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Historical Context</Label>
                        <Textarea
                          placeholder="Style development, influences, historical significance..."
                          rows={2}
                          value={config.historical?.historicalContext || ""}
                          onChange={(e) =>
                            updateHistorical(
                              "historicalContext",
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Composer */}
                  <AccordionItem value="composer">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <MusicIcon className="h-4 w-4" />
                      Composer Information
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Composer Name</Label>
                          <Input
                            placeholder="Composer or arranger"
                            value={config.historical?.composer || ""}
                            onChange={(e) =>
                              updateHistorical("composer", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Nationality</Label>
                          <Input
                            placeholder="National origin"
                            value={config.historical?.nationality || ""}
                            onChange={(e) =>
                              updateHistorical("nationality", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Composer Life Dates</Label>
                        <Input
                          placeholder="e.g., 1756-1791"
                          value={config.historical?.composerLifeDates || ""}
                          onChange={(e) =>
                            updateHistorical(
                              "composerLifeDates",
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Style Evolution</Label>
                        <Input
                          placeholder="Development of style over time..."
                          value={config.historical?.styleEvolution || ""}
                          onChange={(e) =>
                            updateHistorical("styleEvolution", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Manuscript/Source */}
                  <AccordionItem value="manuscript">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Manuscript & Source
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Manuscript Source</Label>
                          <Input
                            placeholder="Original source..."
                            value={config.historical?.manuscriptSource || ""}
                            onChange={(e) =>
                              updateHistorical(
                                "manuscriptSource",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Catalog Number</Label>
                          <Input
                            placeholder="e.g., BWV 988, K. 545"
                            value={config.historical?.catalogNumber || ""}
                            onChange={(e) =>
                              updateHistorical("catalogNumber", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Original Key</Label>
                          <Input
                            placeholder="e.g., D major"
                            value={config.historical?.originalKey || ""}
                            onChange={(e) =>
                              updateHistorical("originalKey", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Instrumentation</Label>
                          <Input
                            placeholder="Performing forces..."
                            value={config.historical?.instrumentation || ""}
                            onChange={(e) =>
                              updateHistorical(
                                "instrumentation",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Scholarly Edition</Label>
                        <Input
                          placeholder="e.g., Urtext, Breitkopf..."
                          value={config.historical?.scholarlyEdition || ""}
                          onChange={(e) =>
                            updateHistorical("scholarlyEdition", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )}

            {config.discipline === "ethnomusicology" && (
              <TabsContent value="advanced" className="space-y-6 mt-4">
                <Accordion
                  type="multiple"
                  defaultValue={["cultural", "fieldwork"]}
                  className="w-full"
                >
                  {/* Cultural Context */}
                  <AccordionItem value="cultural">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Cultural Context
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Cultural Context</Label>
                        <Textarea
                          placeholder="Cultural significance, function, meaning..."
                          rows={2}
                          value={config.ethnomusicology?.culturalContext || ""}
                          onChange={(e) =>
                            updateEthnomusicology(
                              "culturalContext",
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Social Function</Label>
                          <Select
                            value={config.ethnomusicology?.socialFunction}
                            onValueChange={(value) =>
                              updateEthnomusicology("socialFunction", value)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entertainment">
                                Entertainment
                              </SelectItem>
                              <SelectItem value="ritual">
                                Ritual/Ceremonial
                              </SelectItem>
                              <SelectItem value="work">Work/Labor</SelectItem>
                              <SelectItem value="education">
                                Education/Teaching
                              </SelectItem>
                              <SelectItem value="storytelling">
                                Storytelling
                              </SelectItem>
                              <SelectItem value="healing">
                                Healing/Medicine
                              </SelectItem>
                              <SelectItem value="courtship">
                                Courtship
                              </SelectItem>
                              <SelectItem value="protest">
                                Protest/Political
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Transmission Method</Label>
                          <Select
                            value={config.ethnomusicology?.transmissionMethod}
                            onValueChange={(value) =>
                              updateEthnomusicology("transmissionMethod", value)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oral">
                                Oral tradition
                              </SelectItem>
                              <SelectItem value="written">
                                Written notation
                              </SelectItem>
                              <SelectItem value="apprenticeship">
                                Apprenticeship/Mentorship
                              </SelectItem>
                              <SelectItem value="recording">
                                Audio/Video recording
                              </SelectItem>
                              <SelectItem value="mixed">
                                Mixed methods
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={
                            config.ethnomusicology?.oralTradition || false
                          }
                          onCheckedChange={(checked) =>
                            updateEthnomusicology("oralTradition", checked)
                          }
                          disabled={disabled}
                        />
                        <Label>Part of oral tradition</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Fieldwork Details */}
                  <AccordionItem value="fieldwork">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Fieldwork Information
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Field Location</Label>
                          <Input
                            placeholder="Village, region, venue..."
                            value={config.ethnomusicology?.fieldLocation || ""}
                            onChange={(e) =>
                              updateEthnomusicology(
                                "fieldLocation",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Field Date</Label>
                          <Input
                            type="date"
                            value={config.ethnomusicology?.fieldDate || ""}
                            onChange={(e) =>
                              updateEthnomusicology("fieldDate", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Recorder</Label>
                          <Input
                            placeholder="Who recorded..."
                            value={config.ethnomusicology?.recorder || ""}
                            onChange={(e) =>
                              updateEthnomusicology("recorder", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Informant</Label>
                          <Input
                            placeholder="Performer/informant name..."
                            value={config.ethnomusicology?.informant || ""}
                            onChange={(e) =>
                              updateEthnomusicology("informant", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Recording Circumstances</Label>
                        <Textarea
                          placeholder="Context of recording..."
                          rows={2}
                          value={
                            config.ethnomusicology?.recordingCircumstances || ""
                          }
                          onChange={(e) =>
                            updateEthnomusicology(
                              "recordingCircumstances",
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Instrument Classification */}
                  <AccordionItem value="instrument">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <MusicIcon className="h-4 w-4" />
                      Instrument Classification
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Instrument Type</Label>
                          <Select
                            value={
                              config.ethnomusicology?.instrumentClassification
                            }
                            onValueChange={(value) =>
                              updateEthnomusicology(
                                "instrumentClassification",
                                value
                              )
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chordophone">
                                Chordophone (strings)
                              </SelectItem>
                              <SelectItem value="aerophone">
                                Aerophone (winds)
                              </SelectItem>
                              <SelectItem value="membranophone">
                                Membranophone (drums)
                              </SelectItem>
                              <SelectItem value="idiophone">
                                Idiophone (percussion)
                              </SelectItem>
                              <SelectItem value="electrophone">
                                Electrophone (electronic)
                              </SelectItem>
                              <SelectItem value="vocal">Vocal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Instrument Family</Label>
                          <Input
                            placeholder="e.g., Flute, Violin, Gong..."
                            value={
                              config.ethnomusicology?.instrumentFamily || ""
                            }
                            onChange={(e) =>
                              updateEthnomusicology(
                                "instrumentFamily",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Playing Technique</Label>
                        <Textarea
                          placeholder="Performance technique description..."
                          rows={2}
                          value={config.ethnomusicology?.playingTechnique || ""}
                          onChange={(e) =>
                            updateEthnomusicology(
                              "playingTechnique",
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )}

            {config.discipline === "systematic" && (
              <TabsContent value="advanced" className="space-y-6 mt-4">
                <Accordion
                  type="multiple"
                  defaultValue={["acoustic", "theoretical"]}
                  className="w-full"
                >
                  {/* Acoustic Analysis */}
                  <AccordionItem value="acoustic">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      Acoustic Analysis
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Acoustics Focus</Label>
                        <Select
                          value={config.systematic?.acousticsFocus}
                          onValueChange={(value) =>
                            updateSystematic("acousticsFocus", value)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="timbre">
                              Timbre (tone color)
                            </SelectItem>
                            <SelectItem value="harmony">Harmony</SelectItem>
                            <SelectItem value="rhythm">Rhythm</SelectItem>
                            <SelectItem value="form">
                              Form and structure
                            </SelectItem>
                            <SelectItem value="psychoacoustics">
                              Psychoacoustics
                            </SelectItem>
                            <SelectItem value="physiology">
                              Physiology of voice
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Frequency Range</Label>
                        <Input
                          placeholder="e.g., 50-4000 Hz"
                          value={config.systematic?.frequencyRange || ""}
                          onChange={(e) =>
                            updateSystematic("frequencyRange", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Spectral Characteristics</Label>
                        <Textarea
                          placeholder="Spectral envelope, harmonics..."
                          rows={2}
                          value={
                            config.systematic?.spectralCharacteristics || ""
                          }
                          onChange={(e) =>
                            updateSystematic(
                              "spectralCharacteristics",
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Theoretical Analysis */}
                  <AccordionItem value="theoretical">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Music Theory
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Theoretical Focus</Label>
                          <Select
                            value={config.systematic?.theoreticalFocus}
                            onValueChange={(value) =>
                              updateSystematic("theoreticalFocus", value)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pitch organization">
                                Pitch organization
                              </SelectItem>
                              <SelectItem value="tonal harmony">
                                Tonal harmony
                              </SelectItem>
                              <SelectItem value="atonal">
                                Atonal/12-tone
                              </SelectItem>
                              <SelectItem value="set theory">
                                Set theory
                              </SelectItem>
                              <SelectItem value="transformational">
                                Transformational theory
                              </SelectItem>
                              <SelectItem value="neo-Riemannian">
                                Neo-Riemannian theory
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Harmonic Language</Label>
                          <Input
                            placeholder="e.g., Functional harmony, Roman numerals..."
                            value={config.systematic?.harmonicLanguage || ""}
                            onChange={(e) =>
                              updateSystematic(
                                "harmonicLanguage",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tonal Center</Label>
                        <Input
                          placeholder="Tonal center or pitch class set"
                          value={config.systematic?.tonalCenter || ""}
                          onChange={(e) =>
                            updateSystematic("tonalCenter", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Scale Structure</Label>
                        <Textarea
                          placeholder="Scale type, interval patterns..."
                          rows={2}
                          value={config.systematic?.scaleStructure || ""}
                          onChange={(e) =>
                            updateSystematic("scaleStructure", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Experimental Design */}
                  <AccordionItem value="experimental">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Experimental Design
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Experimental Condition</Label>
                          <Input
                            placeholder="Condition being tested..."
                            value={
                              config.systematic?.experimentalCondition || ""
                            }
                            onChange={(e) =>
                              updateSystematic(
                                "experimentalCondition",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Control Condition</Label>
                          <Input
                            placeholder="Control condition..."
                            value={config.systematic?.controlCondition || ""}
                            onChange={(e) =>
                              updateSystematic(
                                "controlCondition",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Participant Info</Label>
                        <Textarea
                          placeholder="Number, demographics, conditions..."
                          rows={2}
                          value={config.systematic?.participantInfo || ""}
                          onChange={(e) =>
                            updateSystematic("participantInfo", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )}

            {config.discipline === "popular" && (
              <TabsContent value="advanced" className="space-y-6 mt-4">
                <Accordion
                  type="multiple"
                  defaultValue={["genre", "cultural"]}
                  className="w-full"
                >
                  {/* Genre and Style */}
                  <AccordionItem value="genre">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Genre & Style
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Popular Genre</Label>
                          <Select
                            value={config.popular?.popularGenre}
                            onValueChange={(value) =>
                              updatePopular("popularGenre", value)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pop">Pop</SelectItem>
                              <SelectItem value="Rock">Rock</SelectItem>
                              <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                              <SelectItem value="R&B">R&B</SelectItem>
                              <SelectItem value="Country">Country</SelectItem>
                              <SelectItem value="Jazz">Jazz</SelectItem>
                              <SelectItem value="Electronic">
                                Electronic/EDM
                              </SelectItem>
                              <SelectItem value="Folk">Folk</SelectItem>
                              <SelectItem value="Indie">Indie</SelectItem>
                              <SelectItem value="Alternative">
                                Alternative
                              </SelectItem>
                              <SelectItem value="Metal">Metal</SelectItem>
                              <SelectItem value="Punk">Punk</SelectItem>
                              <SelectItem value="Reggae">Reggae</SelectItem>
                              <SelectItem value="Latin">Latin</SelectItem>
                              <SelectItem value="World">World Music</SelectItem>
                              <SelectItem value="K-Pop">K-Pop</SelectItem>
                              <SelectItem value="J-Pop">J-Pop</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Subgenre</Label>
                          <Input
                            placeholder="Additional genre classifications..."
                            value={config.popular?.subgenre?.join(", ") || ""}
                            onChange={(e) =>
                              updatePopular(
                                "subgenre",
                                e.target.value.split(", ")
                              )
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Stylistic Origins</Label>
                        <Textarea
                          placeholder="Influences, historical roots..."
                          rows={2}
                          value={
                            config.popular?.stylisticOrigins?.join(", ") || ""
                          }
                          onChange={(e) =>
                            updatePopular(
                              "stylisticOrigins",
                              e.target.value.split(", ")
                            )
                          }
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cultural Movement</Label>
                        <Input
                          placeholder="e.g., countercultural, punk, grunge..."
                          value={config.popular?.culturalMovement || ""}
                          onChange={(e) =>
                            updatePopular("culturalMovement", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Production Context */}
                  <AccordionItem value="production">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Production & Industry
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Production Era</Label>
                          <Input
                            placeholder="e.g., 1990s, 2000s..."
                            value={config.popular?.productionEra || ""}
                            onChange={(e) =>
                              updatePopular("productionEra", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Production Location</Label>
                          <Input
                            placeholder="Studio, city, country..."
                            value={config.popular?.productionLocation || ""}
                            onChange={(e) =>
                              updatePopular(
                                "productionLocation",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Record Label</Label>
                          <Input
                            placeholder="Label name..."
                            value={config.popular?.recordLabel || ""}
                            onChange={(e) =>
                              updatePopular("recordLabel", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Producer</Label>
                          <Input
                            placeholder="Producer name..."
                            value={config.popular?.producer || ""}
                            onChange={(e) =>
                              updatePopular("producer", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Technological Context</Label>
                        <Select
                          value={config.popular?.technologicalContext}
                          onValueChange={(value) =>
                            updatePopular("technologicalContext", value)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="analog">
                              Analog recording
                            </SelectItem>
                            <SelectItem value="digital">
                              Digital production
                            </SelectItem>
                            <SelectItem value="electronic">
                              Electronic music
                            </SelectItem>
                            <SelectItem value="hybrid">
                              Analog + Digital
                            </SelectItem>
                            <SelectItem value="lo-fi">
                              Lo-fi aesthetics
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cultural and Social Impact */}
                  <AccordionItem value="cultural">
                    <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Cultural Impact
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Cultural Impact</Label>
                        <Textarea
                          placeholder="Social, cultural, or political significance..."
                          rows={3}
                          value={config.popular?.culturalImpact || ""}
                          onChange={(e) =>
                            updatePopular("culturalImpact", e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Fan Community</Label>
                          <Input
                            placeholder="Dedicated fanbase description..."
                            value={config.popular?.fanCommunity || ""}
                            onChange={(e) =>
                              updatePopular("fanCommunity", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Subculture</Label>
                          <Input
                            placeholder="Subculture identity..."
                            value={config.popular?.subculture || ""}
                            onChange={(e) =>
                              updatePopular("subculture", e.target.value)
                            }
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={
                              config.popular?.participatoryCulture || false
                            }
                            onCheckedChange={(checked) =>
                              updatePopular("participatoryCulture", checked)
                            }
                            disabled={disabled}
                          />
                          <Label>Participatory Culture</Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )}
          </Tabs>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Export constants for use in other components
export {
  DEFAULT_HISTORICAL,
  DEFAULT_ETHNOMUSICOLOGY,
  DEFAULT_SYSTEMATIC,
  DEFAULT_POPULAR,
  RESEARCH_PRESETS,
};
export type {
  MusicologyDiscipline,
  HistoricalMetadata,
  EthnomusicologyMetadata,
  SystematicMetadata,
  PopularMusicMetadata,
  DisciplineConfig,
};
