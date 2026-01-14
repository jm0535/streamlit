"use client";

import React, { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Music2,
  BookOpen,
  Globe,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Share,
  Star,
  Tag,
  MapPin,
  Mic,
  Music as MusicIcon,
  TrendingUp,
  BarChart3,
  FileText,
  Database,
  Settings,
  Play,
  Pause,
  Volume2,
  Headphones,
  Radio,
  Award,
  GitBranch,
  Target,
  Factory,
  Zap,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Grid,
  List,
  Archive,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MusicologyMetadataForm,
  DEFAULT_HISTORICAL,
} from "@/components/musicology-metadata-form";
import { DisciplineConfig } from "@/lib/musicology-metadata";

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  discipline: "historical" | "ethnomusicology" | "systematic" | "popular";
  status: "planning" | "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
  researchers: string[];
  files: number;
  analyses: number;
  tags: string[];
  metadata: DisciplineConfig;
  progress: number;
}

interface Analysis {
  id: string;
  name: string;
  type: "transcription" | "cultural" | "comparative" | "statistical";
  status: "pending" | "running" | "completed" | "error";
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  results?: {
    keyFindings: string[];
    confidence: number;
    dataPoints: number;
  };
}

export default function MusicologyPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<
    "all" | "historical" | "ethnomusicology" | "systematic" | "popular"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] =
    useState<ResearchProject | null>(null);
  const [musicologyConfig, setMusicologyConfig] = useState(DEFAULT_HISTORICAL);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([
    {
      id: "1",
      title: "Baroque Keyboard Performance Practices",
      description:
        "Analysis of historical performance practices in Baroque keyboard music",
      discipline: "historical",
      status: "active",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-20"),
      researchers: ["Dr. Sarah Johnson", "Prof. Michael Chen"],
      files: 45,
      analyses: 12,
      tags: ["baroque", "keyboard", "performance", "historical"],
      metadata: {
        discipline: "historical" as const,
        historical: DEFAULT_HISTORICAL,
      },
      progress: 65,
    },
    {
      id: "2",
      title: "West African Drumming Traditions",
      description:
        "Ethnomusicological study of traditional drumming patterns in West Africa",
      discipline: "ethnomusicology",
      status: "active",
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-18"),
      researchers: ["Dr. Amara Diallo"],
      files: 32,
      analyses: 8,
      tags: ["african", "drumming", "ethnomusicology", "cultural"],
      metadata: {
        discipline: "ethnomusicology",
        ethnomusicology: {
          songName: "Traditional Rhythms",
          culturalContext: "Ceremonial and social gatherings",
          fieldLocation: "Ghana, Mali, Senegal",
          transmissionMethod: "oral",
          instrumentClassification: "percussion",
        },
      },
      progress: 40,
    },
    {
      id: "3",
      title: "Spectral Analysis of Contemporary Electronic Music",
      description:
        "Systematic analysis of frequency content in electronic music production",
      discipline: "systematic",
      status: "completed",
      createdAt: new Date("2023-12-15"),
      updatedAt: new Date("2024-01-10"),
      researchers: ["Dr. Alex Rivera"],
      files: 28,
      analyses: 15,
      tags: ["electronic", "spectral", "analysis", "systematic"],
      metadata: {
        discipline: "systematic",
        systematic: {
          songName: "Electronic Spectra",
          acousticsFocus: "timbre",
          theoreticalFocus: "frequency analysis",
          harmonicLanguage: "electronic",
        },
      },
      progress: 100,
    },
  ]);

  const [analyses] = useState<Analysis[]>([
    {
      id: "1",
      name: "Cultural Pattern Analysis",
      type: "cultural",
      status: "completed",
      progress: 100,
      createdAt: new Date("2024-01-15"),
      completedAt: new Date("2024-01-18"),
      results: {
        keyFindings: [
          "Identified 3 distinct rhythmic patterns",
          "Found correlation with social context",
          "Discovered regional variations",
        ],
        confidence: 0.87,
        dataPoints: 1250,
      },
    },
    {
      id: "2",
      name: "Comparative Style Analysis",
      type: "comparative",
      status: "running",
      progress: 45,
      createdAt: new Date("2024-01-18"),
    },
    {
      id: "3",
      name: "Statistical Trend Analysis",
      type: "statistical",
      status: "pending",
      progress: 0,
      createdAt: new Date("2024-01-20"),
    },
  ]);

  const handleCreateProject = useCallback(() => {
    const newProject: ResearchProject = {
      id: `project-${Date.now()}`,
      title: "New Research Project",
      description: "Project description to be added",
      discipline: "historical",
      status: "planning",
      createdAt: new Date(),
      updatedAt: new Date(),
      researchers: [],
      files: 0,
      analyses: 0,
      tags: [],
      metadata: DEFAULT_HISTORICAL,
      progress: 0,
    };

    setResearchProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
    setCurrentTab("project-detail");

    toast({
      title: "Project created",
      description: "New research project has been created",
    });
  }, [toast]);

  const handleUpdateProject = useCallback(
    (projectId: string, updates: Partial<ResearchProject>) => {
      setResearchProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        )
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject((prev) =>
          prev ? { ...prev, ...updates, updatedAt: new Date() } : null
        );
      }

      toast({
        title: "Project updated",
        description: "Project details have been saved",
      });
    },
    [selectedProject, toast]
  );

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      setResearchProjects((prev) =>
        prev.filter((project) => project.id !== projectId)
      );
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }

      toast({
        title: "Project deleted",
        description: "Research project has been removed",
      });
    },
    [selectedProject, toast]
  );

  const handleStartAnalysis = useCallback(
    (type: Analysis["type"]) => {
      const newAnalysis: Analysis = {
        id: `analysis-${Date.now()}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`,
        type,
        status: "running",
        progress: 0,
        createdAt: new Date(),
      };

      toast({
        title: "Analysis started",
        description: `${type} analysis is now running`,
      });
    },
    [toast]
  );

  const getFilteredProjects = useCallback(() => {
    let filtered = researchProjects;

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (filterBy !== "all") {
      filtered = filtered.filter((project) => project.discipline === filterBy);
    }

    return filtered;
  }, [researchProjects, searchQuery, filterBy]);

  const getDisciplineIcon = (discipline: string) => {
    switch (discipline) {
      case "historical":
        return <Clock className="h-4 w-4" />;
      case "ethnomusicology":
        return <Globe className="h-4 w-4" />;
      case "systematic":
        return <BarChart3 className="h-4 w-4" />;
      case "popular":
        return <Radio className="h-4 w-4" />;
      default:
        return <Music2 className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "active":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "planning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "archived":
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredProjects = getFilteredProjects();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Musicology Research</h1>
          <p className="text-muted-foreground">
            Advanced music research and analysis tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Research Projects</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="project-detail">Project Details</TabsTrigger>
          <TabsTrigger value="tools">Research Tools</TabsTrigger>
        </TabsList>

        {/* Research Projects */}
        <TabsContent value="projects" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterBy}
                onValueChange={(value: any) => setFilterBy(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="ethnomusicology">
                    Ethnomusicology
                  </SelectItem>
                  <SelectItem value="systematic">Systematic</SelectItem>
                  <SelectItem value="popular">Popular Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Projects Grid/List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    No research projects found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search or filters"
                      : "Create your first research project to get started"}
                  </p>
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentTab("project-detail");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getDisciplineIcon(project.discipline)}
                            <Badge variant="outline" className="text-xs">
                              {project.discipline}
                            </Badge>
                          </div>
                          {getStatusIcon(project.status)}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-1">
                            {project.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.researchers.length}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {project.files}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {project.analyses}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Updated {project.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentTab("project-detail");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getDisciplineIcon(project.discipline)}
                          {getStatusIcon(project.status)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{project.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {project.discipline}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {project.researchers.length} researchers
                            </span>
                            <span>{project.files} files</span>
                            <span>{project.analyses} analyses</span>
                            <span>
                              Updated {project.updatedAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {project.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {project.progress}%
                          </div>
                          <Progress
                            value={project.progress}
                            className="w-20 h-2 mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analyses */}
        <TabsContent value="analyses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Research Analyses</h2>
              <p className="text-muted-foreground">
                Running and completed music analyses
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Analysis
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleStartAnalysis("transcription")}
                >
                  <MusicIcon className="h-4 w-4 mr-2" />
                  Transcription Analysis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStartAnalysis("cultural")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Cultural Analysis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStartAnalysis("comparative")}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Comparative Analysis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStartAnalysis("statistical")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistical Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      <CardTitle className="text-lg">{analysis.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {analysis.type}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created {analysis.createdAt.toLocaleDateString()}
                    {analysis.completedAt &&
                      ` • Completed ${analysis.completedAt.toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Status</span>
                        <span className="capitalize">{analysis.status}</span>
                      </div>
                      {analysis.status === "running" && (
                        <Progress
                          value={analysis.progress}
                          className="w-full"
                        />
                      )}
                      {analysis.status === "completed" && analysis.results && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Confidence</span>
                            <span>
                              {(analysis.results.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Data Points</span>
                            <span>
                              {analysis.results.dataPoints.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {analysis.results?.keyFindings && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Key Findings
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysis.results.keyFindings.map(
                            (finding, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{finding}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {analysis.status === "completed" && (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Results
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </>
                      )}
                      {analysis.status === "running" && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {analysis.status === "error" && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Project Details */}
        <TabsContent value="project-detail" className="space-y-6">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDisciplineIcon(selectedProject.discipline)}
                      <div>
                        <CardTitle>{selectedProject.title}</CardTitle>
                        <CardDescription>
                          {selectedProject.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {selectedProject.discipline}
                      </Badge>
                      {getStatusIcon(selectedProject.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDeleteProject(selectedProject.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedProject.files}
                      </div>
                      <div className="text-sm text-muted-foreground">Files</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedProject.analyses}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Analyses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedProject.researchers.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Researchers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedProject.progress}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Progress
                      </div>
                    </div>
                  </div>
                  <Progress value={selectedProject.progress} className="mt-4" />
                </CardContent>
              </Card>

              {/* Musicology Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Metadata</CardTitle>
                  <CardDescription>
                    Detailed musicological research information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MusicologyMetadataForm
                    config={musicologyConfig}
                    onChange={setMusicologyConfig}
                  />
                </CardContent>
              </Card>

              {/* Project Files */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Project Files</CardTitle>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>No files uploaded yet</p>
                    <p className="text-sm">
                      Upload audio files and documents to get started
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  No Project Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select a project to view details or create a new one
                </p>
                <Button onClick={handleCreateProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Research Tools */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Mic className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Field Recording</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tools for ethnomusicological field research
                </p>
                <Button className="w-full">
                  <Radio className="h-4 w-4 mr-2" />
                  Open Recorder
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Statistical Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced statistical tools for music research
                </p>
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Open Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Cultural Mapping</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Geographic and cultural analysis tools
                </p>
                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Open Mapper
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <MusicIcon className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold mb-2">Comparative Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compare musical styles and traditions
                </p>
                <Button className="w-full">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Open Comparator
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="font-semibold mb-2">Pattern Recognition</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered pattern detection in music
                </p>
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Open Detector
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-cyan-500" />
                <h3 className="font-semibold mb-2">Data Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Organize and manage research data
                </p>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Open Manager
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
