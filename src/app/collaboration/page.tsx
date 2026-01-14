'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserPlus,
  MessageSquare,
  Share,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Award,
  GitBranch,
  Database,
  FileText,
  Music,
  Mic,
  Headphones,
  Activity,
  TrendingUp,
  Grid,
  List,
  Video,
  Monitor,
  Wifi,
  WifiOff,
  Shield,
  Key,
  Copy,
  ExternalLink,
  Bell,
  BellOff,
  RefreshCw
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'collaborator' | 'viewer';
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  joinedAt: Date;
  projects: number;
  contributions: number;
  permissions: {
    canUpload: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
    canManageUsers: boolean;
  };
  expertise: string[];
  location?: string;
  institution?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  collaborators: string[];
  privacy: 'public' | 'private' | 'restricted';
  tags: string[];
  progress: number;
}

interface Activity {
  id: string;
  type: 'upload' | 'edit' | 'comment' | 'share' | 'join' | 'leave';
  user: string;
  target: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface Invitation {
  id: string;
  email: string;
  role: 'researcher' | 'collaborator' | 'viewer';
  project?: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  invitedBy: string;
}

export default function CollaborationPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      role: 'admin',
      status: 'active',
      lastActive: new Date(Date.now() - 1000 * 60 * 15),
      joinedAt: new Date('2023-06-15'),
      projects: 8,
      contributions: 156,
      permissions: {
        canUpload: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canManageUsers: true
      },
      expertise: ['Musicology', 'Historical Analysis', 'Performance Practice'],
      location: 'Cambridge, MA',
      institution: 'Harvard University'
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      email: 'm.chen@music.edu',
      role: 'researcher',
      status: 'active',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      joinedAt: new Date('2023-08-20'),
      projects: 5,
      contributions: 89,
      permissions: {
        canUpload: true,
        canEdit: true,
        canDelete: false,
        canShare: true,
        canManageUsers: false
      },
      expertise: ['Ethnomusicology', 'Field Recording', 'Cultural Analysis'],
      location: 'Berkeley, CA',
      institution: 'UC Berkeley'
    },
    {
      id: '3',
      name: 'Dr. Amara Diallo',
      email: 'amara.diallo@research.org',
      role: 'collaborator',
      status: 'active',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
      joinedAt: new Date('2023-10-10'),
      projects: 3,
      contributions: 45,
      permissions: {
        canUpload: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canManageUsers: false
      },
      expertise: ['African Music', 'Percussion Studies', 'Oral Traditions'],
      location: 'Accra, Ghana',
      institution: 'University of Ghana'
    },
    {
      id: '4',
      name: 'Alex Rivera',
      email: 'alex.rivera@tech.com',
      role: 'collaborator',
      status: 'inactive',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      joinedAt: new Date('2023-11-05'),
      projects: 2,
      contributions: 23,
      permissions: {
        canUpload: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canManageUsers: false
      },
      expertise: ['Electronic Music', 'Audio Engineering', 'Signal Processing'],
      location: 'Austin, TX',
      institution: 'Audio Tech Labs'
    }
  ]);

  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Baroque Performance Practices',
      description: 'Historical analysis of Baroque keyboard performance',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
      owner: 'Dr. Sarah Johnson',
      collaborators: ['Prof. Michael Chen', 'Dr. Amara Diallo'],
      privacy: 'private',
      tags: ['baroque', 'performance', 'historical'],
      progress: 65
    },
    {
      id: '2',
      name: 'West African Drumming Traditions',
      description: 'Ethnomusicological study of traditional drumming',
      status: 'active',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-18'),
      owner: 'Dr. Amara Diallo',
      collaborators: ['Dr. Sarah Johnson'],
      privacy: 'restricted',
      tags: ['african', 'drumming', 'ethnomusicology'],
      progress: 40
    },
    {
      id: '3',
      name: 'Electronic Music Analysis',
      description: 'Systematic analysis of electronic music production',
      status: 'completed',
      createdAt: new Date('2023-12-15'),
      updatedAt: new Date('2024-01-10'),
      owner: 'Alex Rivera',
      collaborators: [],
      privacy: 'public',
      tags: ['electronic', 'analysis', 'systematic'],
      progress: 100
    }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'upload',
      user: 'Dr. Sarah Johnson',
      target: 'Baroque Performance Practices',
      description: 'Uploaded 5 new audio files for analysis',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '2',
      type: 'comment',
      user: 'Prof. Michael Chen',
      target: 'West African Drumming Traditions',
      description: 'Added comments on rhythmic patterns analysis',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: '3',
      type: 'share',
      user: 'Dr. Amara Diallo',
      target: 'African Music Collection',
      description: 'Shared project with external collaborators',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
    },
    {
      id: '4',
      type: 'join',
      user: 'Alex Rivera',
      target: 'Electronic Music Analysis',
      description: 'Joined project as collaborator',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
  ]);

  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: '1',
      email: 'new.researcher@university.edu',
      role: 'researcher',
      project: 'Baroque Performance Practices',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      invitedBy: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      email: 'collaborator@music.org',
      role: 'collaborator',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      invitedBy: 'Prof. Michael Chen'
    }
  ]);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'collaborator' as 'researcher' | 'collaborator' | 'viewer',
    project: '',
    message: ''
  });

  const handleInviteUser = useCallback(() => {
    if (!inviteForm.email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const newInvitation: Invitation = {
      id: `invite-${Date.now()}`,
      email: inviteForm.email,
      role: inviteForm.role,
      project: inviteForm.project || undefined,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      invitedBy: 'Current User'
    };

    setInvitations(prev => [newInvitation, ...prev]);
    setInviteForm({ email: '', role: 'collaborator', project: '', message: '' });
    setIsInviting(false);
    
    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${inviteForm.email}`,
    });
  }, [inviteForm, toast]);

  const handleUpdateUserRole = useCallback((userId: string, newRole: User['role']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    toast({
      title: "Role updated",
      description: "User role has been updated successfully",
    });
  }, [toast]);

  const handleToggleUserStatus = useCallback((userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : user
    ));
    
    toast({
      title: "Status updated",
      description: "User status has been updated",
    });
  }, [toast]);

  const handleRemoveUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    toast({
      title: "User removed",
      description: "User has been removed from the system",
    });
  }, [toast]);

  const handleResendInvitation = useCallback((invitationId: string) => {
    toast({
      title: "Invitation resent",
      description: "Invitation has been resent successfully",
    });
  }, [toast]);

  const handleCancelInvitation = useCallback((invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    
    toast({
      title: "Invitation cancelled",
      description: "Invitation has been cancelled",
    });
  }, [toast]);

  const getFilteredUsers = useCallback(() => {
    let filtered = users;
    
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (filterBy !== 'all') {
      filtered = filtered.filter(user => user.status === filterBy);
    }
    
    return filtered;
  }, [users, searchQuery, filterBy]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'researcher':
        return <Award className="h-4 w-4" />;
      case 'collaborator':
        return <Users className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'edit':
        return <Edit className="h-4 w-4 text-green-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'share':
        return <Share className="h-4 w-4 text-orange-500" />;
      case 'join':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'leave':
        return <Users className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'private':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'restricted':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collaboration Center</h1>
          <p className="text-muted-foreground">
            Manage users, projects, and collaborative research
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setIsInviting(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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

          {/* Users Grid/List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No users found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Invite users to get started'}
                  </p>
                  <Button onClick={() => setIsInviting(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              {getStatusIcon(user.status)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                                {user.status === 'active' ? (
                                  <>
                                    <BellOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {user.institution}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {user.joinedAt.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active {user.lastActive.toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold">{user.projects}</div>
                            <div className="text-muted-foreground">Projects</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{user.contributions}</div>
                            <div className="text-muted-foreground">Contributions</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Expertise</div>
                          <div className="flex flex-wrap gap-1">
                            {user.expertise.slice(0, 2).map((exp) => (
                              <Badge key={exp} variant="secondary" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                            {user.expertise.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.expertise.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          {getStatusIcon(user.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{user.location}</span>
                            <span>{user.institution}</span>
                            <span>{user.projects} projects</span>
                            <span>{user.contributions} contributions</span>
                            <span>Last active {user.lastActive.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {user.expertise.map((exp) => (
                              <Badge key={exp} variant="secondary" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                              {user.status === 'active' ? (
                                <>
                                  <BellOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Bell className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Collaborative Projects</h2>
              <p className="text-muted-foreground">
                Projects with multiple collaborators
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPrivacyIcon(project.privacy)}
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Owner</span>
                      <span className="font-medium">{project.owner}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Collaborators</span>
                      <span className="font-medium">{project.collaborators.length}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="w-full" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <p className="text-muted-foreground">
                Latest actions and updates from collaborators
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex items-center gap-2 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground capitalize">
                          {activity.type}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.timestamp.toLocaleString()}</span>
                        <span>•</span>
                        <span>{activity.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations */}
        <TabsContent value="invitations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pending Invitations</h2>
              <p className="text-muted-foreground">
                Manage user invitations and access requests
              </p>
            </div>
            <Button onClick={() => setIsInviting(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>

          <div className="space-y-4">
            {invitations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                  <p className="text-muted-foreground mb-4">
                    Send invitations to collaborate with others
                  </p>
                  <Button onClick={() => setIsInviting(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              invitations.map((invitation) => (
                <Card key={invitation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Mail className="h-8 w-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{invitation.email}</h4>
                          <Badge variant="outline" className="capitalize">
                            {invitation.role}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Invited by {invitation.invitedBy} • 
                          Expires {invitation.expiresAt.toLocaleDateString()}
                          {invitation.project && ` • For ${invitation.project}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleResendInvitation(invitation.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCancelInvitation(invitation.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Permission Management</h2>
              <p className="text-muted-foreground">
                Configure access controls and permissions
              </p>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  Default permissions for each user role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['admin', 'researcher', 'collaborator', 'viewer'].map((role) => (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      <h4 className="font-medium capitalize">{role}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={role === 'admin' || role === 'researcher'} />
                        <span>Upload Files</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={role === 'admin' || role === 'researcher'} />
                        <span>Edit Content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={role === 'admin'} />
                        <span>Delete Files</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={role === 'admin' || role === 'researcher'} />
                        <span>Share Projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={role === 'admin'} />
                        <span>Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={role === 'admin'} />
                        <span>System Settings</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Require email verification</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-factor authentication</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Session timeout (hours)</Label>
                    <Select defaultValue="24">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1h</SelectItem>
                        <SelectItem value="8">8h</SelectItem>
                        <SelectItem value="24">24h</SelectItem>
                        <SelectItem value="168">1w</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Maximum failed attempts</Label>
                    <Select defaultValue="5">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      {isInviting && (
        <Card className="fixed inset-4 z-50 bg-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invite User</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsInviting(false)}>
                ×
              </Button>
            </div>
            <CardDescription>
              Send an invitation to collaborate on your research
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@university.edu"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="collaborator">Collaborator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={inviteForm.project} onValueChange={(value) => setInviteForm(prev => ({ ...prev, project: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation..."
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleInviteUser}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
              <Button variant="outline" onClick={() => setIsInviting(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
