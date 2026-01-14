'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Video,
  FileText,
  Download,
  Upload,
  Settings,
  Users,
  Shield,
  Database,
  Music,
  Mic,
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquareQuote,
  Send,
  ChevronRight,
  ChevronDown,
  Grid,
  List,
  Zap,
  Target,
  Award,
  Lightbulb,
  BookMarked,
  GraduationCap,
  Code,
  Terminal,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Map,
  Navigation,
  Compass,
  Flag,
  Tag,
  Archive,
  Trash2,
  Edit,
  Copy,
  Share,
  Heart,
  Bookmark,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: Date;
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  thumbnail: string;
  views: number;
  rating: number;
  author: string;
  createdAt: Date;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  lastUpdated: Date;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  responses: number;
}

export default function HelpPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  const [articles] = useState<HelpArticle[]>([
    {
      id: '1',
      title: 'Getting Started with Audio Transcription',
      category: 'getting-started',
      description: 'Learn the basics of audio transcription and how to use the transcription tools',
      content: `# Getting Started with Audio Transcription

Audio transcription is the process of converting spoken language into written text. Our platform provides powerful tools to help you transcribe audio files accurately and efficiently.

## What You'll Need

Before you start, make sure you have:
- Audio files in supported formats (MP3, WAV, FLAC, etc.)
- A stable internet connection
- Basic understanding of music notation (for music transcription)

## Step 1: Upload Your Audio

1. Navigate to the Transcription page
2. Click "Upload Files" or drag and drop your audio files
3. Wait for the upload to complete

## Step 2: Configure Settings

- Choose the transcription type (speech, music, or mixed)
- Select the output format (MIDI, MusicXML, PDF, etc.)
- Adjust quality settings as needed

## Step 3: Start Transcription

Click "Start Transcription" and wait for the process to complete. This may take several minutes depending on file length and quality.

## Step 4: Review and Edit

Once complete, review the transcription and make any necessary edits using our built-in editor.

## Tips for Best Results

- Use high-quality audio recordings
- Ensure clear audio with minimal background noise
- For music, use recordings with clear instrument separation
- Save your work frequently`,
      tags: ['transcription', 'beginner', 'audio'],
      views: 1234,
      helpful: 89,
      notHelpful: 3,
      lastUpdated: new Date('2024-01-15'),
      featured: true,
      difficulty: 'beginner',
      readTime: 5
    },
    {
      id: '2',
      title: 'Advanced Stem Separation Techniques',
      category: 'advanced',
      description: 'Master the art of separating audio stems using AI-powered tools',
      content: `# Advanced Stem Separation Techniques

Stem separation allows you to isolate individual instruments or vocal tracks from a mixed audio recording. This guide covers advanced techniques for achieving the best results.

## Understanding Stem Separation

Our AI models analyze the frequency spectrum and temporal characteristics of audio to separate it into distinct stems:
- Vocals
- Drums
- Bass
- Other instruments

## Advanced Configuration

### Quality Settings
- **High Quality**: Best results, slower processing
- **Balanced**: Good balance of speed and quality
- **Fast**: Quick processing, lower quality

### Model Selection
Different models work better for different genres:
- **Pop/Rock**: General purpose model
- **Classical**: Optimized for orchestral music
- **Electronic**: Best for synthesized sounds
- **Jazz**: Handles complex harmonies well

## Pro Tips

1. **Source Material Matters**: Start with the highest quality audio available
2. **Genre-Specific Settings**: Choose models optimized for your music genre
3. **Post-Processing**: Use EQ and compression after separation
4. **Batch Processing**: Process multiple files for consistency

## Troubleshooting

- **Bleeding**: Some instruments may bleed into other stems
- **Artifacts**: Listen for digital artifacts in separated tracks
- **Phase Issues**: Check for phase cancellation when recombining stems`,
      tags: ['stem-separation', 'advanced', 'audio-processing'],
      views: 567,
      helpful: 45,
      notHelpful: 2,
      lastUpdated: new Date('2024-01-18'),
      featured: false,
      difficulty: 'advanced',
      readTime: 8
    },
    {
      id: '3',
      title: 'Collaboration Best Practices',
      category: 'collaboration',
      description: 'Learn how to effectively collaborate with other researchers and musicians',
      content: `# Collaboration Best Practices

Effective collaboration is key to successful music research projects. This guide covers best practices for working with teams.

## Setting Up Collaboration

### Project Organization
- Create clear project structures
- Use consistent naming conventions
- Establish version control workflows
- Define roles and responsibilities

### Communication Guidelines
- Use the built-in messaging system for project discussions
- Schedule regular check-ins
- Document decisions and changes
- Provide constructive feedback

## Sharing and Permissions

### Access Levels
- **Viewer**: Can view and download files
- **Collaborator**: Can upload and edit content
- **Admin**: Full project control

### Security Considerations
- Review access permissions regularly
- Use secure sharing methods
- Backup important work
- Follow data protection guidelines

## Workflow Integration

### Research Teams
- Establish clear research objectives
- Divide work according to expertise
- Use shared annotation tools
- Maintain comprehensive documentation

### Music Production
- Share stems and project files
- Use compatible file formats
- Document processing settings
- Version control arrangements`,
      tags: ['collaboration', 'teams', 'research'],
      views: 892,
      helpful: 67,
      notHelpful: 5,
      lastUpdated: new Date('2024-01-12'),
      featured: true,
      difficulty: 'intermediate',
      readTime: 6
    }
  ]);

  const [tutorials] = useState<VideoTutorial[]>([
    {
      id: '1',
      title: 'Complete Transcription Workflow',
      description: 'Step-by-step guide to transcribing audio files',
      duration: 480, // 8 minutes
      category: 'transcription',
      thumbnail: '/api/placeholder/320/180',
      views: 3421,
      rating: 4.8,
      author: 'Dr. Sarah Johnson',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      title: 'Stem Separation Masterclass',
      description: 'Advanced techniques for separating audio stems',
      duration: 720, // 12 minutes
      category: 'stem-separation',
      thumbnail: '/api/placeholder/320/180',
      views: 2156,
      rating: 4.9,
      author: 'Prof. Michael Chen',
      createdAt: new Date('2024-01-08')
    },
    {
      id: '3',
      title: 'Musicology Research Tools',
      description: 'Using research tools for music analysis',
      duration: 600, // 10 minutes
      category: 'research',
      thumbnail: '/api/placeholder/320/180',
      views: 1876,
      rating: 4.7,
      author: 'Dr. Amara Diallo',
      createdAt: new Date('2024-01-05')
    }
  ]);

  const [faqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'What audio formats are supported?',
      answer: 'We support a wide range of audio formats including MP3, WAV, FLAC, AAC, OGG, M4A, and WMA. For best results, we recommend using lossless formats like WAV or FLAC for transcription work.',
      category: 'general',
      helpful: 234,
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2',
      question: 'How accurate is the transcription?',
      answer: 'Transcription accuracy depends on audio quality and complexity. Generally, you can expect 85-95% accuracy for clear speech and 70-85% for complex music. Using high-quality recordings and appropriate settings improves accuracy significantly.',
      category: 'transcription',
      helpful: 189,
      lastUpdated: new Date('2024-01-14')
    },
    {
      id: '3',
      question: 'Can I collaborate with other researchers?',
      answer: 'Yes! Our platform includes comprehensive collaboration tools. You can share projects, invite team members, assign roles, and work together in real-time. See our Collaboration guide for detailed instructions.',
      category: 'collaboration',
      helpful: 156,
      lastUpdated: new Date('2024-01-13')
    }
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      subject: 'Transcription quality issues',
      description: 'The transcription results seem to have poor accuracy for my audio files.',
      status: 'in-progress',
      priority: 'medium',
      category: 'transcription',
      createdAt: new Date('2024-01-19T10:30:00'),
      updatedAt: new Date('2024-01-20T09:15:00'),
      responses: 2
    },
    {
      id: '2',
      subject: 'Cannot upload large files',
      description: 'I\'m trying to upload a 500MB audio file but it keeps failing.',
      status: 'resolved',
      priority: 'high',
      category: 'technical',
      createdAt: new Date('2024-01-18T14:20:00'),
      updatedAt: new Date('2024-01-19T11:30:00'),
      responses: 3
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const handleToggleArticle = useCallback((articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  }, []);

  const handleRateArticle = useCallback((articleId: string, helpful: boolean) => {
    toast({
      title: "Thank you for your feedback",
      description: helpful ? "Glad this was helpful!" : "We'll work on improving this article",
    });
  }, [toast]);

  const handleCreateTicket = useCallback(() => {
    if (!newTicket.subject || !newTicket.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject: newTicket.subject,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority,
      category: newTicket.category,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: 0
    };

    setSupportTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
    
    toast({
      title: "Support ticket created",
      description: "We'll respond to your request within 24 hours",
    });
  }, [newTicket, toast]);

  const getFilteredArticles = useCallback(() => {
    let filtered = articles;
    
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    return filtered;
  }, [articles, searchQuery, selectedCategory]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'in-progress':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers, learn new skills, and get support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        {/* Guides */}
        <TabsContent value="guides" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="getting-started">Getting Started</SelectItem>
                  <SelectItem value="transcription">Transcription</SelectItem>
                  <SelectItem value="stem-separation">Stem Separation</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Featured Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Guides
              </CardTitle>
              <CardDescription>
                Essential guides to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.filter(article => article.featured).map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                          <Badge variant="outline">{article.readTime} min read</Badge>
                        </div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{article.views} views</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{article.helpful} found helpful</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Articles */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No guides found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse All Categories
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                          <Badge variant="outline">{article.readTime} min read</Badge>
                        </div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{article.views} views</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{article.helpful} found helpful</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <Collapsible key={article.id} open={expandedArticles.has(article.id)}>
                    <CollapsibleTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Badge className={getDifficultyColor(article.difficulty)}>
                                {article.difficulty}
                              </Badge>
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                expandedArticles.has(article.id) ? 'rotate-180' : ''
                              }`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{article.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {article.readTime} min read
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{article.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {article.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{article.views} views</span>
                              <span>•</span>
                              <span>{article.helpful} helpful</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="mt-2">
                        <CardContent className="p-6">
                          <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }} />
                          </div>
                          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                            <span className="text-sm text-muted-foreground">
                              Was this helpful?
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRateArticle(article.id, true)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Yes ({article.helpful})
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRateArticle(article.id, false)}
                              >
                                <ThumbsDown className="h-4 w-4 mr-2" />
                                No ({article.notHelpful})
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tutorials */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Video Tutorials</h2>
              <p className="text-muted-foreground">
                Step-by-step video guides for all features
              </p>
            </div>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{tutorial.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(tutorial.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{tutorial.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                        <span>{tutorial.views.toLocaleString()} views</span>
                        <span>{tutorial.author}</span>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All FAQ
            </Button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <Collapsible key={faq.id}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <HelpCircle className="h-5 w-5 text-blue-500" />
                        <ChevronDown className="h-4 w-4 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-left">{faq.question}</h4>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {faq.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="p-6">
                      <p className="text-sm leading-relaxed">{faq.answer}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <span>{faq.helpful} found this helpful</span>
                        <span>•</span>
                        <span>Updated {faq.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="transcription">Transcription</SelectItem>
                      <SelectItem value="stem-separation">Stem Separation</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of your issue or question"
                    rows={4}
                  />
                </div>
                <Button onClick={handleCreateTicket} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Options</CardTitle>
                <CardDescription>
                  Different ways to get help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Live Chat</h4>
                    <p className="text-sm text-muted-foreground">Chat with support team</p>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Start Chat
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Email Support</h4>
                    <p className="text-sm text-muted-foreground">support@example.com</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto">
                    Send Email
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Phone Support</h4>
                    <p className="text-sm text-muted-foreground">Mon-Fri 9AM-5PM EST</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto">
                    Call Now
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Help Center</h4>
                    <p className="text-sm text-muted-foreground">Browse documentation</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto">
                    Browse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Tickets</CardTitle>
              <CardDescription>
                Track your support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {getStatusIcon(ticket.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <Badge variant="outline" className="capitalize">
                          {ticket.category}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Status: {ticket.status.replace('-', ' ')}</span>
                        <span>•</span>
                        <span>{ticket.responses} responses</span>
                        <span>•</span>
                        <span>Updated {ticket.updatedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community */}
        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Community Forum</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with other users and researchers
                </p>
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Forum
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Learning Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Courses, workshops, and training materials
                </p>
                <Button className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Research Network</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find collaborators and research opportunities
                </p>
                <Button className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Explore Network
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Highlights</CardTitle>
              <CardDescription>
                Latest from our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquareQuote className="h-4 w-4 text-blue-500" />
                  <span>New discussion: "Best practices for stem separation"</span>
                  <span className="text-muted-foreground ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-4 w-4 text-green-500" />
                  <span>Research collaboration opportunity in ethnomusicology</span>
                  <span className="text-muted-foreground ml-auto">5 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span>Tip: Improve transcription quality with noise reduction</span>
                  <span className="text-muted-foreground ml-auto">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
