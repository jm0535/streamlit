'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Eye,
  EyeOff,
  Zap,
  CheckCircle,
  AlertCircle,
  FileText,
  Database,
  Music,
  Mic,
  Headphones,
  Volume2,
  Radio,
  Globe,
  Users,
  MapPin,
  Tag,
  Target,
  Award,
  GitBranch,
  MoreHorizontal,
  Grid,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Statistic {
  id: string;
  name: string;
  description: string;
  type: 'counter' | 'chart' | 'metric' | 'comparison';
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status: 'active' | 'calculating' | 'error';
  lastUpdated: Date;
  category: 'usage' | 'performance' | 'quality' | 'research';
}

interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'comparative' | 'trend';
  status: 'generating' | 'completed' | 'error';
  createdAt: Date;
  completedAt?: Date;
  size?: number;
  downloadUrl?: string;
  parameters: {
    dateRange: string;
    metrics: string[];
    filters: Record<string, any>;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export default function StatisticsPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedStats, setExpandedStats] = useState<Set<string>>(new Set());

  // Mock data
  const [statistics, setStatistics] = useState<Statistic[]>([
    {
      id: '1',
      name: 'Total Files Processed',
      description: 'Total number of audio files processed',
      type: 'counter',
      value: 1547,
      unit: 'files',
      trend: 'up',
      trendValue: 12.5,
      status: 'active',
      lastUpdated: new Date(),
      category: 'usage'
    },
    {
      id: '2',
      name: 'Processing Success Rate',
      description: 'Percentage of successful processing operations',
      type: 'metric',
      value: 94.7,
      unit: '%',
      trend: 'up',
      trendValue: 2.3,
      status: 'active',
      lastUpdated: new Date(),
      category: 'performance'
    },
    {
      id: '3',
      name: 'Average Processing Time',
      description: 'Average time to process a single file',
      type: 'metric',
      value: 45.2,
      unit: 'seconds',
      trend: 'down',
      trendValue: 8.1,
      status: 'active',
      lastUpdated: new Date(),
      category: 'performance'
    },
    {
      id: '4',
      name: 'Storage Usage',
      description: 'Total storage space used',
      type: 'chart',
      value: '8.7 GB',
      trend: 'up',
      trendValue: 15.2,
      status: 'active',
      lastUpdated: new Date(),
      category: 'usage'
    },
    {
      id: '5',
      name: 'Active Researchers',
      description: 'Number of active research projects',
      type: 'counter',
      value: 23,
      unit: 'projects',
      trend: 'stable',
      trendValue: 0,
      status: 'active',
      lastUpdated: new Date(),
      category: 'research'
    },
    {
      id: '6',
      name: 'Transcription Accuracy',
      description: 'Average accuracy of transcriptions',
      type: 'metric',
      value: 87.3,
      unit: '%',
      trend: 'up',
      trendValue: 3.7,
      status: 'calculating',
      lastUpdated: new Date(),
      category: 'quality'
    }
  ]);

  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Weekly Performance Report',
      type: 'summary',
      status: 'completed',
      createdAt: new Date('2024-01-20'),
      completedAt: new Date('2024-01-20T10:30:00'),
      size: 245760,
      downloadUrl: '/reports/weekly-performance.pdf',
      parameters: {
        dateRange: '7d',
        metrics: ['performance', 'usage', 'quality'],
        filters: {}
      }
    },
    {
      id: '2',
      name: 'Monthly Usage Analysis',
      type: 'detailed',
      status: 'generating',
      createdAt: new Date('2024-01-20T09:00:00'),
      parameters: {
        dateRange: '30d',
        metrics: ['usage', 'storage'],
        filters: { fileType: 'audio' }
      }
    },
    {
      id: '3',
      name: 'Research Project Comparison',
      type: 'comparative',
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-15T14:20:00'),
      size: 524288,
      downloadUrl: '/reports/research-comparison.xlsx',
      parameters: {
        dateRange: '90d',
        metrics: ['research', 'analysis'],
        filters: { discipline: 'all' }
      }
    }
  ]);

  const [chartData] = useState<ChartData>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Files Processed',
        data: [45, 52, 38, 65, 48, 72, 58],
        color: '#3b82f6'
      },
      {
        label: 'Transcriptions',
        data: [12, 18, 15, 22, 19, 25, 21],
        color: '#10b981'
      },
      {
        label: 'Analyses',
        data: [8, 12, 10, 15, 13, 18, 14],
        color: '#f59e0b'
      }
    ]
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setStatistics(prev => prev.map(stat => ({
        ...stat,
        lastUpdated: new Date(),
        value: typeof stat.value === 'number' 
          ? stat.value + Math.floor(Math.random() * 10 - 5)
          : stat.value
      })));
      
      setIsRefreshing(false);
      toast({
        title: "Statistics refreshed",
        description: "All statistics have been updated",
      });
    }, 2000);
  }, [toast]);

  const handleGenerateReport = useCallback((type: Report['type']) => {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report ${new Date().toLocaleDateString()}`,
      type,
      status: 'generating',
      createdAt: new Date(),
      parameters: {
        dateRange: selectedTimeRange,
        metrics: ['usage', 'performance', 'quality'],
        filters: {}
      }
    };

    toast({
      title: "Report generation started",
      description: `${type} report is being generated`,
    });
  }, [selectedTimeRange, toast]);

  const handleToggleStat = useCallback((statId: string) => {
    setExpandedStats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(statId)) {
        newSet.delete(statId);
      } else {
        newSet.add(statId);
      }
      return newSet;
    });
  }, []);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'calculating':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'usage':
        return <Database className="h-4 w-4" />;
      case 'performance':
        return <Activity className="h-4 w-4" />;
      case 'quality':
        return <Award className="h-4 w-4" />;
      case 'research':
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
          <p className="text-muted-foreground">
            Monitor system performance and usage metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Files Processed</p>
                    <p className="text-2xl font-bold">1,547</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold">94.7%</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+2.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Avg. Processing</p>
                    <p className="text-2xl font-bold">45.2s</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingDown className="h-3 w-3" />
                      <span>-8.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Active Projects</p>
                    <p className="text-2xl font-bold">23</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Activity className="h-3 w-3" />
                      <span>0%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Trends</CardTitle>
                <CardDescription>
                  Daily processing activity over the last week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Line chart visualization</p>
                    <p className="text-sm">Files processed over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Types</CardTitle>
                <CardDescription>
                  Distribution of different processing types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Pie chart visualization</p>
                    <p className="text-sm">Processing type distribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system events and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Batch processing completed for 12 files</span>
                  <span className="text-muted-foreground ml-auto">2 minutes ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Transcription analysis started for jazz_guitar.mp3</span>
                  <span className="text-muted-foreground ml-auto">5 minutes ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <span>5 new files uploaded by Dr. Sarah Johnson</span>
                  <span className="text-muted-foreground ml-auto">10 minutes ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Processing failed for corrupted file</span>
                  <span className="text-muted-foreground ml-auto">15 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Detailed Metrics</h2>
              <p className="text-muted-foreground">
                Comprehensive system performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {statistics.map((stat) => (
              <Card key={stat.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(stat.category)}
                      {getStatusIcon(stat.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{stat.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {stat.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-lg font-bold">
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                          {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(stat.trend)}
                          {stat.trendValue && (
                            <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                              {stat.trend === 'up' ? '+' : ''}{stat.trendValue}%
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          Updated {stat.lastUpdated.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStat(stat.id)}
                      >
                        {expandedStats.has(stat.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <Collapsible open={expandedStats.has(stat.id)}>
                    <CollapsibleContent className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Category</Label>
                          <p className="font-medium capitalize">{stat.category}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Type</Label>
                          <p className="font-medium capitalize">{stat.type}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <p className="font-medium capitalize">{stat.status}</p>
                        </div>
                      </div>
                      
                      {stat.type === 'chart' && (
                        <div className="mt-4 h-32 flex items-center justify-center border rounded-lg bg-muted/20">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-8 w-8 mx-auto mb-1" />
                            <p className="text-xs">Chart visualization</p>
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Generated Reports</h2>
              <p className="text-muted-foreground">
                System-generated reports and analyses
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleGenerateReport('summary')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Summary Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateReport('detailed')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Detailed Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateReport('comparative')}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Comparative Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateReport('trend')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trend Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {report.type}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created {report.createdAt.toLocaleDateString()}
                    {report.completedAt && ` • Completed ${report.completedAt.toLocaleString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Date Range</span>
                        <span className="font-medium">{report.parameters.dateRange}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Metrics</span>
                        <span className="font-medium">{report.parameters.metrics.join(', ')}</span>
                      </div>
                      {report.size && (
                        <div className="flex items-center justify-between">
                          <span>File Size</span>
                          <span className="font-medium">{formatFileSize(report.size)}</span>
                        </div>
                      )}
                    </div>

                    {report.status === 'generating' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Status</span>
                          <span className="capitalize">Generating...</span>
                        </div>
                        <Progress value={75} className="w-full" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {report.status === 'completed' && report.downloadUrl && (
                        <>
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </>
                      )}
                      {report.status === 'generating' && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      {report.status === 'error' && (
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

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  System performance trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance over time</p>
                    <p className="text-sm">Processing speed and accuracy trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>
                  User behavior and feature utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Feature usage patterns</p>
                    <p className="text-sm">Most used features and tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>
                  Output quality and accuracy measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2" />
                    <p>Quality analysis</p>
                    <p className="text-sm">Transcription and analysis accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Impact</CardTitle>
                <CardDescription>
                  Research outcomes and contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2" />
                    <p>Research analytics</p>
                    <p className="text-sm">Project success and impact metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Tools</CardTitle>
              <CardDescription>
                Advanced analytics and data exploration tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Trend Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <GitBranch className="h-6 w-6 mb-2" />
                  <span>Comparative Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="h-6 w-6 mb-2" />
                  <span>Predictive Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
