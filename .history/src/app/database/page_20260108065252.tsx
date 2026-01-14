'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Database,
  Server,
  HardDrive,
  Cloud,
  Upload,
  Download,
  RefreshCw,
  Trash2,
  Save,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Settings,
  Shield,
  Copy,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Music,
  Mic,
  Headphones,
  Users,
  Archive,
  Zap,
  Wifi,
  WifiOff,
  Globe,
  MapPin,
  Cpu,
  MemoryStick,
  HardDrive as HardDriveIcon,
  DatabaseBackup,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DatabaseInfo {
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  host: string;
  port: number;
  status: 'connected' | 'disconnected' | 'error';
  version: string;
  size: number;
  tables: number;
  records: number;
  lastBackup?: Date;
  lastSync?: Date;
}

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: number;
  createdAt: Date;
  completedAt?: Date;
  location: 'local' | 'cloud' | 'hybrid';
  compressed: boolean;
  encrypted: boolean;
}

interface Query {
  id: string;
  name: string;
  type: 'select' | 'insert' | 'update' | 'delete' | 'custom';
  status: 'executing' | 'completed' | 'error';
  duration: number;
  rowsAffected?: number;
  createdAt: Date;
  completedAt?: Date;
  sql: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export default function DatabasePage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Mock data
  const [databases] = useState<DatabaseInfo[]>([
    {
      name: 'Primary Database',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      status: 'connected',
      version: '14.5',
      size: 1572864000, // 1.5GB
      tables: 24,
      records: 1547892,
      lastBackup: new Date('2024-01-20T02:00:00'),
      lastSync: new Date('2024-01-20T08:30:00')
    },
    {
      name: 'Analytics Database',
      type: 'postgresql',
      host: 'analytics.internal',
      port: 5432,
      status: 'connected',
      version: '14.5',
      size: 524288000, // 500MB
      tables: 12,
      records: 892456,
      lastBackup: new Date('2024-01-20T01:00:00'),
      lastSync: new Date('2024-01-20T07:15:00')
    },
    {
      name: 'Archive Storage',
      type: 'mongodb',
      host: 'archive.internal',
      port: 27017,
      status: 'connected',
      version: '6.0',
      size: 3221225472, // 3GB
      tables: 8,
      records: 2345678,
      lastBackup: new Date('2024-01-19T23:00:00'),
      lastSync: new Date('2024-01-19T23:30:00')
    }
  ]);

  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Daily Full Backup',
      type: 'full',
      status: 'completed',
      size: 2147483648, // 2GB
      createdAt: new Date('2024-01-20T02:00:00'),
      completedAt: new Date('2024-01-20T02:45:00'),
      location: 'cloud',
      compressed: true,
      encrypted: true
    },
    {
      id: '2',
      name: 'Hourly Incremental',
      type: 'incremental',
      status: 'completed',
      size: 134217728, // 128MB
      createdAt: new Date('2024-01-20T08:00:00'),
      completedAt: new Date('2024-01-20T08:05:00'),
      location: 'local',
      compressed: true,
      encrypted: false
    },
    {
      id: '3',
      name: 'Scheduled Full Backup',
      type: 'full',
      status: 'scheduled',
      size: 0,
      createdAt: new Date('2024-01-21T02:00:00'),
      location: 'cloud',
      compressed: true,
      encrypted: true
    }
  ]);

  const [queries] = useState<Query[]>([
    {
      id: '1',
      name: 'User Analytics Query',
      type: 'select',
      status: 'completed',
      duration: 1250,
      rowsAffected: 1542,
      createdAt: new Date('2024-01-20T09:15:00'),
      completedAt: new Date('2024-01-20T09:15:01'),
      sql: 'SELECT * FROM user_analytics WHERE date >= \'2024-01-01\''
    },
    {
      id: '2',
      name: 'Audio File Cleanup',
      type: 'delete',
      status: 'executing',
      duration: 0,
      createdAt: new Date('2024-01-20T10:30:00'),
      sql: 'DELETE FROM audio_files WHERE created_at < \'2023-01-01\''
    },
    {
      id: '3',
      name: 'Performance Metrics Update',
      type: 'update',
      status: 'error',
      duration: 890,
      createdAt: new Date('2024-01-20T08:45:00'),
      completedAt: new Date('2024-01-20T08:45:01'),
      sql: 'UPDATE performance_metrics SET value = ? WHERE metric_name = \'response_time\''
    }
  ]);

  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Connection Pool',
      value: 85,
      unit: '%',
      status: 'warning',
      trend: 'up',
      description: 'Database connection pool utilization'
    },
    {
      name: 'Query Response Time',
      value: 125,
      unit: 'ms',
      status: 'good',
      trend: 'down',
      description: 'Average query response time'
    },
    {
      name: 'Disk Usage',
      value: 67,
      unit: '%',
      status: 'good',
      trend: 'up',
      description: 'Database disk space utilization'
    },
    {
      name: 'Memory Usage',
      value: 72,
      unit: '%',
      status: 'good',
      trend: 'stable',
      description: 'Database memory utilization'
    },
    {
      name: 'Active Connections',
      value: 45,
      unit: '',
      status: 'good',
      trend: 'stable',
      description: 'Number of active database connections'
    },
    {
      name: 'Cache Hit Rate',
      value: 94,
      unit: '%',
      status: 'good',
      trend: 'up',
      description: 'Database cache hit ratio'
    }
  ]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Database refreshed",
        description: "Database information has been updated",
      });
    }, 2000);
  }, [toast]);

  const handleBackup = useCallback((type: Backup['type']) => {
    setIsBackupRunning(true);
    
    const newBackup: Backup = {
      id: `backup-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup ${new Date().toLocaleString()}`,
      type,
      status: 'running',
      size: 0,
      createdAt: new Date(),
      location: 'cloud',
      compressed: true,
      encrypted: true
    };

    setBackups(prev => [newBackup, ...prev]);

    // Simulate backup completion
    setTimeout(() => {
      setBackups(prev => prev.map(backup => 
        backup.id === newBackup.id 
          ? { 
              ...backup, 
              status: 'completed' as const, 
              size: Math.floor(Math.random() * 1000000000) + 100000000,
              completedAt: new Date()
            }
          : backup
      ));
      
      setIsBackupRunning(false);
      toast({
        title: "Backup completed",
        description: `${type} backup has been completed successfully`,
      });
    }, 5000);

    toast({
      title: "Backup started",
      description: `${type} backup is now running`,
    });
  }, [toast]);

  const handleRestore = useCallback((backupId: string) => {
    toast({
      title: "Restore initiated",
      description: "Database restore process has started",
    });
  }, [toast]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
      case 'executing':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your database systems
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <DatabaseBackup className="h-4 w-4 mr-2" />
                Backup
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBackup('full')}>
                <DatabaseBackup className="h-4 w-4 mr-2" />
                Full Backup
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBackup('incremental')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Incremental Backup
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBackup('differential')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Differential Backup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Server className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Active Connections</p>
                    <p className="text-2xl font-bold">45</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Storage Used</p>
                    <p className="text-2xl font-bold">5.2 GB</p>
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Query Time</p>
                    <p className="text-2xl font-bold">125ms</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingDown className="h-3 w-3" />
                      <span>-8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">System Health</p>
                    <p className="text-2xl font-bold">98%</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Optimal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>
                Current status of all database connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databases.map((db) => (
                  <div key={db.name} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(db.status)}
                      <Database className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{db.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {db.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{db.host}:{db.port}</span>
                        <span>v{db.version}</span>
                        <span>{formatFileSize(db.size)}</span>
                        <span>{db.tables} tables</span>
                        <span>{db.records.toLocaleString()} records</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Last backup: {db.lastBackup?.toLocaleString()}</span>
                        <span>Last sync: {db.lastSync?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
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
                            <DatabaseBackup className="h-4 w-4 mr-2" />
                            Backup
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Databases */}
        <TabsContent value="databases" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Database Connections</h2>
              <p className="text-muted-foreground">
                Manage and configure database connections
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Database
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {databases.map((db) => (
              <Card key={db.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(db.status)}
                      <CardTitle className="text-lg">{db.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {db.type}
                    </Badge>
                  </div>
                  <CardDescription>
                    {db.host}:{db.port} • Version {db.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2 font-medium">{formatFileSize(db.size)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tables:</span>
                        <span className="ml-2 font-medium">{db.tables}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Records:</span>
                        <span className="ml-2 font-medium">{db.records.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-2 font-medium capitalize">{db.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Schema
                      </Button>
                      <Button size="sm" variant="outline">
                        <DatabaseBackup className="h-4 w-4 mr-2" />
                        Backup
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Backups */}
        <TabsContent value="backups" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Backup Management</h2>
              <p className="text-muted-foreground">
                Manage database backups and restore points
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isBackupRunning}>
                  <DatabaseBackup className="h-4 w-4 mr-2" />
                  {isBackupRunning ? 'Backing Up...' : 'Create Backup'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBackup('full')}>
                  Full Backup
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBackup('incremental')}>
                  Incremental Backup
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBackup('differential')}>
                  Differential Backup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {backups.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <DatabaseBackup className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{backup.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {backup.type}
                        </Badge>
                        {backup.compressed && <Badge variant="secondary">Compressed</Badge>}
                        {backup.encrypted && <Badge variant="secondary">Encrypted</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{backup.location}</span>
                        <span>{formatFileSize(backup.size)}</span>
                        <span>Created {backup.createdAt.toLocaleString()}</span>
                        {backup.completedAt && (
                          <span>Completed {backup.completedAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {backup.status === 'completed' && (
                        <Button size="sm" onClick={() => handleRestore(backup.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      )}
                      {backup.status === 'running' && (
                        <Button size="sm" variant="outline" disabled>
                          <Zap className="h-4 w-4 mr-2 animate-spin" />
                          Running
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Queries */}
        <TabsContent value="queries" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Query History</h2>
              <p className="text-muted-foreground">
                Recent database queries and their performance
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Query
            </Button>
          </div>

          <div className="space-y-4">
            {queries.map((query) => (
              <Card key={query.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(query.status)}
                      <FileText className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{query.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {query.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2 font-mono">
                        {query.sql}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Duration: {formatDuration(query.duration)}</span>
                        {query.rowsAffected && (
                          <span>Rows affected: {query.rowsAffected.toLocaleString()}</span>
                        )}
                        <span>Created {query.createdAt.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Run Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Performance Metrics</h2>
              <p className="text-muted-foreground">
                Real-time database performance monitoring
              </p>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Current database performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{metric.name}</span>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getStatusColor(metric.status)}`}>
                            {metric.value}{metric.unit}
                          </span>
                          <Badge variant="outline" className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={metric.unit === '%' ? metric.value : (metric.value / 100) * 100} 
                        className="w-full" 
                      />
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Charts</CardTitle>
                <CardDescription>
                  Visual representation of database performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <LineChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Query Response Time</p>
                      <p className="text-sm">Last 24 hours</p>
                    </div>
                  </div>
                  <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Connection Usage</p>
                      <p className="text-sm">Active connections over time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
