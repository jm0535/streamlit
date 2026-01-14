'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Archive,
  FileAudio,
  Calendar,
  Clock,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Download,
  Upload,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Share,
  Copy,
  Move,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Cloud,
  Database,
  Shield,
  CheckCircle,
  AlertCircle,
  Zap,
  RefreshCw,
  ArchiveRestore,
  FileText,
  Music,
  BarChart3,
  Users,
  Settings,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ArchiveItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'project';
  size: number;
  itemCount: number;
  createdAt: Date;
  archivedAt: Date;
  lastAccessed: Date;
  format: string;
  status: 'active' | 'archived' | 'locked';
  compression: 'none' | 'zip' | 'gzip' | 'tar';
  encryption: boolean;
  tags: string[];
  metadata: {
    description?: string;
    project?: string;
    version?: string;
    retention?: string;
  };
  location: 'local' | 'cloud' | 'hybrid';
}

interface ArchiveRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    age: number; // days
    size: number; // MB
    type: string[];
    tags: string[];
  };
  actions: {
    compress: boolean;
    encrypt: boolean;
    moveTo: string;
    deleteAfter: number; // days
  };
}

export default function ArchivePage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'accessed'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'archived' | 'locked'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('browse');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Mock data
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([
    {
      id: '1',
      name: 'Classical Piano Collection',
      type: 'project',
      size: 524288000,
      itemCount: 15,
      createdAt: new Date('2024-01-10'),
      archivedAt: new Date('2024-01-15'),
      lastAccessed: new Date('2024-01-20'),
      format: 'Project',
      status: 'archived',
      compression: 'zip',
      encryption: true,
      tags: ['classical', 'piano', 'completed'],
      metadata: {
        description: 'Complete classical piano transcription project',
        project: 'Piano Transcriptions',
        version: '1.0',
        retention: '1 year'
      },
      location: 'cloud'
    },
    {
      id: '2',
      name: 'Jazz Guitar Sessions',
      type: 'folder',
      size: 1073741824,
      itemCount: 32,
      createdAt: new Date('2024-01-05'),
      archivedAt: new Date('2024-01-12'),
      lastAccessed: new Date('2024-01-18'),
      format: 'Folder',
      status: 'archived',
      compression: 'gzip',
      encryption: false,
      tags: ['jazz', 'guitar', 'sessions'],
      metadata: {
        description: 'Jazz guitar recording sessions and analysis',
        project: 'Jazz Analysis',
        retention: '6 months'
      },
      location: 'local'
    },
    {
      id: '3',
      name: 'Electronic Music Production',
      type: 'file',
      size: 2147483648,
      itemCount: 1,
      createdAt: new Date('2023-12-20'),
      archivedAt: new Date('2024-01-01'),
      lastAccessed: new Date('2024-01-10'),
      format: 'ZIP',
      status: 'locked',
      compression: 'zip',
      encryption: true,
      tags: ['electronic', 'production', 'locked'],
      metadata: {
        description: 'Electronic music production project files',
        project: 'Electronic Studio',
        version: '2.1',
        retention: 'permanent'
      },
      location: 'hybrid'
    }
  ]);

  const [archiveRules] = useState<ArchiveRule[]>([
    {
      id: '1',
      name: 'Auto-archive completed projects',
      description: 'Automatically archive projects older than 30 days',
      enabled: true,
      conditions: {
        age: 30,
        size: 100,
        type: ['project'],
        tags: ['completed']
      },
      actions: {
        compress: true,
        encrypt: false,
        moveTo: 'cloud',
        deleteAfter: 365
      }
    },
    {
      id: '2',
      name: 'Compress large files',
      description: 'Compress files larger than 500MB after 7 days',
      enabled: true,
      conditions: {
        age: 7,
        size: 500,
        type: ['file'],
        tags: []
      },
      actions: {
        compress: true,
        encrypt: false,
        moveTo: 'local',
        deleteAfter: 180
      }
    },
    {
      id: '3',
      name: 'Archive old analysis data',
      description: 'Archive analysis reports older than 90 days',
      enabled: false,
      conditions: {
        age: 90,
        size: 50,
        type: ['file'],
        tags: ['analysis', 'report']
      },
      actions: {
        compress: true,
        encrypt: true,
        moveTo: 'cloud',
        deleteAfter: 730
      }
    }
  ]);

  const handleToggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleArchiveItems = useCallback(() => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to archive",
        variant: "destructive",
      });
      return;
    }

    setArchiveItems(prev => prev.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: 'archived' as const, archivedAt: new Date() }
        : item
    ));

    setSelectedItems([]);
    toast({
      title: "Items archived",
      description: `${selectedItems.length} item(s) moved to archive`,
    });
  }, [selectedItems, toast]);

  const handleRestoreItems = useCallback(() => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to restore",
        variant: "destructive",
      });
      return;
    }

    setArchiveItems(prev => prev.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: 'active' as const }
        : item
    ));

    setSelectedItems([]);
    toast({
      title: "Items restored",
      description: `${selectedItems.length} item(s) restored from archive`,
    });
  }, [selectedItems, toast]);

  const handleDeleteItems = useCallback(() => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to delete",
        variant: "destructive",
      });
      return;
    }

    setArchiveItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    toast({
      title: "Items deleted",
      description: `${selectedItems.length} item(s) permanently deleted`,
    });
  }, [selectedItems, toast]);

  const handleToggleLock = useCallback((itemId: string) => {
    setArchiveItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: item.status === 'locked' ? 'archived' : 'locked' as const }
        : item
    ));
  }, []);

  const getFilteredItems = useCallback(() => {
    let filtered = archiveItems;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.status === filterBy);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.archivedAt.getTime() - a.archivedAt.getTime();
        case 'size':
          return b.size - a.size;
        case 'accessed':
          return b.lastAccessed.getTime() - a.lastAccessed.getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [archiveItems, searchQuery, filterBy, sortBy]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Database className="h-4 w-4" />;
      case 'folder':
        return <FolderOpen className="h-4 w-4" />;
      default:
        return <FileAudio className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Archive Management</h1>
          <p className="text-muted-foreground">
            Manage archived projects and storage optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Archive className="h-4 w-4 mr-2" />
            Archive Items
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Archive</TabsTrigger>
          <TabsTrigger value="rules">Archive Rules</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Browse Archive */}
        <TabsContent value="browse" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Archive Date</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="accessed">Last Accessed</SelectItem>
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
              {selectedItems.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleArchiveItems}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive ({selectedItems.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRestoreItems}>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore ({selectedItems.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeleteItems}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedItems.length})
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Archive Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Archive Items ({filteredItems.length})</CardTitle>
                  <CardDescription>
                    {selectedItems.length > 0 && `${selectedItems.length} selected`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={() => setSelectedItems(
                      selectedItems.length === filteredItems.length ? [] : filteredItems.map(item => item.id)
                    )}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No archived items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Archive some items to see them here'}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Archive Items
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className={`cursor-pointer transition-colors ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => setSelectedItems(prev => 
                                e.target.checked 
                                  ? [...prev, item.id]
                                  : prev.filter(id => id !== item.id)
                              )}
                              className="mt-1"
                            />
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {item.encryption && <Lock className="h-3 w-3 text-gray-500" />}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <h4 className="font-medium text-sm truncate" title={item.name}>
                              {item.name}
                            </h4>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{formatFileSize(item.size)} • {item.itemCount} items</div>
                            <div>Archived {item.archivedAt.toLocaleDateString()}</div>
                            <div>Accessed {item.lastAccessed.toLocaleDateString()}</div>
                            <div className="flex items-center gap-2">
                              <span>{item.format}</span>
                              {item.compression !== 'none' && <span>• {item.compression}</span>}
                              <span>• {item.location}</span>
                            </div>
                          </div>

                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {item.metadata.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.metadata.description}
                            </p>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleLock(item.id)}>
                                {item.status === 'locked' ? (
                                  <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unlock
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Lock
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className={`cursor-pointer transition-colors ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => setSelectedItems(prev => 
                              e.target.checked 
                                ? [...prev, item.id]
                                : prev.filter(id => id !== item.id)
                            )}
                          />
                          
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {getStatusIcon(item.status)}
                            {item.encryption && <Lock className="h-4 w-4 text-gray-500" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{item.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(item.size)}</span>
                              <span>{item.itemCount} items</span>
                              <span>{item.format}</span>
                              <span>{item.compression !== 'none' ? item.compression : 'uncompressed'}</span>
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>Created {item.createdAt.toLocaleDateString()}</span>
                              <span>Archived {item.archivedAt.toLocaleDateString()}</span>
                              <span>Accessed {item.lastAccessed.toLocaleDateString()}</span>
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                {item.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleLock(item.id)}>
                                {item.status === 'locked' ? (
                                  <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unlock
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Lock
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive Rules */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Archive Rules</h2>
              <p className="text-muted-foreground">
                Automated rules for archiving and storage management
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {archiveRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          Edit Rule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Conditions</h4>
                      <div className="space-y-2 text-sm">
                        <div>Age: {rule.conditions.age} days</div>
                        <div>Size: {rule.conditions.size} MB</div>
                        <div>Types: {rule.conditions.type.join(', ')}</div>
                        <div>Tags: {rule.conditions.tags.length > 0 ? rule.conditions.tags.join(', ') : 'Any'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Actions</h4>
                      <div className="space-y-2 text-sm">
                        <div>Compress: {rule.actions.compress ? 'Yes' : 'No'}</div>
                        <div>Encrypt: {rule.actions.encrypt ? 'Yes' : 'No'}</div>
                        <div>Move to: {rule.actions.moveTo}</div>
                        <div>Delete after: {rule.actions.deleteAfter} days</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Storage */}
        <TabsContent value="storage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Local Storage</p>
                    <p className="text-2xl font-bold">3.2 GB</p>
                    <p className="text-sm text-muted-foreground">of 10 GB used</p>
                  </div>
                </div>
                <Progress value={32} className="mt-3" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Cloud className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Cloud Storage</p>
                    <p className="text-2xl font-bold">15.7 GB</p>
                    <p className="text-sm text-muted-foreground">of 100 GB used</p>
                  </div>
                </div>
                <Progress value={15.7} className="mt-3" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Archive className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Archive Storage</p>
                    <p className="text-2xl font-bold">8.9 GB</p>
                    <p className="text-sm text-muted-foreground">compressed saved</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-green-600">
                  2.1 GB space saved
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Storage Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of your storage usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>Audio Files</span>
                  </div>
                  <span className="font-medium">12.3 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Transcriptions</span>
                  </div>
                  <span className="font-medium">2.1 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analysis Data</span>
                  </div>
                  <span className="font-medium">4.7 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                  </div>
                  <span className="font-medium">8.0 GB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Archive Settings</CardTitle>
                <CardDescription>
                  Configure default archive behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-compress">Auto-compress archived files</Label>
                  <Switch id="auto-compress" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-encrypt">Auto-encrypt sensitive data</Label>
                  <Switch id="auto-encrypt" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cloud-backup">Cloud backup for archives</Label>
                  <Switch id="cloud-backup" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-cleanup">Auto-cleanup old archives</Label>
                  <Switch id="auto-cleanup" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Policies</CardTitle>
                <CardDescription>
                  Set retention periods for different data types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="audio-retention">Audio Files</Label>
                  <Select defaultValue="365">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transcription-retention">Transcriptions</Label>
                  <Select defaultValue="180">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="analysis-retention">Analysis Data</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
