'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Monitor,
  Volume2,
  Mic,
  Headphones,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  CheckCircle,
  AlertCircle,
  Zap,
  Wifi,
  WifiOff,
  HardDrive,
  Cloud,
  Moon,
  Sun,
  Palette,
  Type,
  Layout,
  Grid,
  List,
  Sliders,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Radio,
  FileText,
  HelpCircle,
  Info,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Video,
  MessageSquare,
  Users,
  Archive,
  Activity,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart
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
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    avatar?: string;
    bio: string;
    location: string;
    website: string;
    institution: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    processing: boolean;
    sharing: boolean;
    updates: boolean;
    security: boolean;
    weekly: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'restricted';
    showEmail: boolean;
    showLocation: boolean;
    showInstitution: boolean;
    allowMessages: boolean;
    allowCollaboration: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  audio: {
    sampleRate: number;
    bitDepth: number;
    channels: number;
    bufferSize: number;
    inputDevice: string;
    outputDevice: string;
    autoGain: boolean;
    noiseReduction: boolean;
    echoCancellation: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    showGrid: boolean;
    animations: boolean;
    reducedMotion: boolean;
  };
  processing: {
    defaultQuality: 'low' | 'medium' | 'high';
    parallelProcessing: boolean;
    maxConcurrentJobs: number;
    autoSave: boolean;
    cacheSize: number;
    tempCleanup: boolean;
    compression: boolean;
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      bio: 'Musicologist specializing in Baroque performance practices and historical analysis.',
      location: 'Cambridge, MA',
      website: 'https://sarahjohnson.music.edu',
      institution: 'Harvard University',
      timezone: 'America/New_York',
      language: 'en'
    },
    notifications: {
      email: true,
      push: true,
      desktop: false,
      processing: true,
      sharing: true,
      updates: false,
      security: true,
      weekly: true
    },
    privacy: {
      profileVisibility: 'restricted',
      showEmail: false,
      showLocation: true,
      showInstitution: true,
      allowMessages: true,
      allowCollaboration: true,
      dataSharing: false,
      analytics: true
    },
    audio: {
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
      bufferSize: 512,
      inputDevice: 'default',
      outputDevice: 'default',
      autoGain: true,
      noiseReduction: true,
      echoCancellation: false
    },
    appearance: {
      theme: 'system',
      accentColor: 'blue',
      fontSize: 'medium',
      compactMode: false,
      showGrid: true,
      animations: true,
      reducedMotion: false
    },
    processing: {
      defaultQuality: 'high',
      parallelProcessing: true,
      maxConcurrentJobs: 3,
      autoSave: true,
      cacheSize: 1024,
      tempCleanup: true,
      compression: true
    }
  });

  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
      });
    }, 1500);
  }, [toast]);

  const handleResetSettings = useCallback(() => {
    // Reset to default values
    setSettings({
      profile: {
        name: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        institution: '',
        timezone: 'UTC',
        language: 'en'
      },
      notifications: {
        email: true,
        push: true,
        desktop: false,
        processing: true,
        sharing: true,
        updates: false,
        security: true,
        weekly: false
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showLocation: false,
        showInstitution: false,
        allowMessages: false,
        allowCollaboration: false,
        dataSharing: false,
        analytics: false
      },
      audio: {
        sampleRate: 44100,
        bitDepth: 16,
        channels: 2,
        bufferSize: 512,
        inputDevice: 'default',
        outputDevice: 'default',
        autoGain: false,
        noiseReduction: false,
        echoCancellation: false
      },
      appearance: {
        theme: 'system',
        accentColor: 'blue',
        fontSize: 'medium',
        compactMode: false,
        showGrid: false,
        animations: true,
        reducedMotion: false
      },
      processing: {
        defaultQuality: 'medium',
        parallelProcessing: false,
        maxConcurrentJobs: 1,
        autoSave: true,
        cacheSize: 512,
        tempCleanup: false,
        compression: false
      }
    });
    
    setHasChanges(true);
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  }, [toast]);

  const updateSetting = useCallback((category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  }, []);

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <div className="form-container form-container-lg">
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Personal Information</h2>
                <p className="form-section-description">Update your personal details and contact information</p>
              </div>
              
              <div className="form-grid form-grid-2">
                <div className="form-field">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="location" className="form-label">Location</label>
                  <Input
                    id="location"
                    value={settings.profile.location}
                    onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="website" className="form-label">Website</label>
                  <Input
                    id="website"
                    type="url"
                    value={settings.profile.website}
                    onChange={(e) => updateSetting('profile', 'website', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="institution" className="form-label">Institution</label>
                  <Input
                    id="institution"
                    value={settings.profile.institution}
                    onChange={(e) => updateSetting('profile', 'institution', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="timezone" className="form-label">Timezone</label>
                  <Select value={settings.profile.timezone} onValueChange={(value) => updateSetting('profile', 'timezone', value)}>
                    <SelectTrigger className="form-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <label htmlFor="language" className="form-label">Language</label>
                  <Select value={settings.profile.language} onValueChange={(value) => updateSetting('profile', 'language', value)}>
                    <SelectTrigger className="form-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="form-field form-field-lg">
                <label htmlFor="bio" className="form-label">Bio</label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                  rows={4}
                  className="form-textarea"
                />
                <p className="form-helper-text">Tell us about yourself and your work in musicology.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="form-container form-container-md">
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Notification Preferences</h2>
                <p className="form-section-description">Choose how you want to receive notifications</p>
              </div>
              
              <div className="form-field form-field-lg">
                <h3 className="form-label">Delivery Methods</h3>
                <div className="form-grid form-grid-3">
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Email Notifications</div>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Push Notifications</div>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Desktop Notifications</div>
                        <p className="text-sm text-muted-foreground">System desktop alerts</p>
                      </div>
                      <Switch
                        checked={settings.notifications.desktop}
                        onCheckedChange={(checked) => updateSetting('notifications', 'desktop', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-field form-field-lg">
                <h3 className="form-label">Notification Types</h3>
                <div className="form-grid form-grid-2">
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Processing Complete</div>
                        <p className="text-sm text-muted-foreground">When audio processing finishes</p>
                      </div>
                      <Switch
                        checked={settings.notifications.processing}
                        onCheckedChange={(checked) => updateSetting('notifications', 'processing', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">File Sharing</div>
                        <p className="text-sm text-muted-foreground">When files are shared with you</p>
                      </div>
                      <Switch
                        checked={settings.notifications.sharing}
                        onCheckedChange={(checked) => updateSetting('notifications', 'sharing', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">System Updates</div>
                        <p className="text-sm text-muted-foreground">Platform updates and news</p>
                      </div>
                      <Switch
                        checked={settings.notifications.updates}
                        onCheckedChange={(checked) => updateSetting('notifications', 'updates', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Security Alerts</div>
                        <p className="text-sm text-muted-foreground">Security and login notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.security}
                        onCheckedChange={(checked) => updateSetting('notifications', 'security', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Weekly Summary</div>
                        <p className="text-sm text-muted-foreground">Weekly activity digest</p>
                      </div>
                      <Switch
                        checked={settings.notifications.weekly}
                        onCheckedChange={(checked) => updateSetting('notifications', 'weekly', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Privacy</CardTitle>
                <CardDescription>
                  Control who can see your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select value={settings.privacy.profileVisibility} onValueChange={(value: any) => updateSetting('privacy', 'profileVisibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Show Email</Label>
                    <Switch
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => updateSetting('privacy', 'showEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Location</Label>
                    <Switch
                      checked={settings.privacy.showLocation}
                      onCheckedChange={(checked) => updateSetting('privacy', 'showLocation', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Institution</Label>
                    <Switch
                      checked={settings.privacy.showInstitution}
                      onCheckedChange={(checked) => updateSetting('privacy', 'showInstitution', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interaction Settings</CardTitle>
                <CardDescription>
                  Manage how others can interact with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Messages</Label>
                      <p className="text-sm text-muted-foreground">Others can send you messages</p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onCheckedChange={(checked) => updateSetting('privacy', 'allowMessages', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Collaboration Requests</Label>
                      <p className="text-sm text-muted-foreground">Receive collaboration invitations</p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowCollaboration}
                      onCheckedChange={(checked) => updateSetting('privacy', 'allowCollaboration', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Analytics</CardTitle>
                <CardDescription>
                  Control your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share data for research purposes</p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve the platform</p>
                    </div>
                    <Switch
                      checked={settings.privacy.analytics}
                      onCheckedChange={(checked) => updateSetting('privacy', 'analytics', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audio */}
        <TabsContent value="audio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>
                  Configure audio input and output preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sampleRate">Sample Rate</Label>
                  <Select value={settings.audio.sampleRate.toString()} onValueChange={(value) => updateSetting('audio', 'sampleRate', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22050">22.05 kHz</SelectItem>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                      <SelectItem value="96000">96 kHz</SelectItem>
                      <SelectItem value="192000">192 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bitDepth">Bit Depth</Label>
                  <Select value={settings.audio.bitDepth.toString()} onValueChange={(value) => updateSetting('audio', 'bitDepth', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16 bit</SelectItem>
                      <SelectItem value="24">24 bit</SelectItem>
                      <SelectItem value="32">32 bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="channels">Channels</Label>
                  <Select value={settings.audio.channels.toString()} onValueChange={(value) => updateSetting('audio', 'channels', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mono</SelectItem>
                      <SelectItem value="2">Stereo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bufferSize">Buffer Size</Label>
                  <Select value={settings.audio.bufferSize.toString()} onValueChange={(value) => updateSetting('audio', 'bufferSize', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">128</SelectItem>
                      <SelectItem value="256">256</SelectItem>
                      <SelectItem value="512">512</SelectItem>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="2048">2048</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Devices</CardTitle>
                <CardDescription>
                  Select your audio input and output devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inputDevice">Input Device</Label>
                  <Select value={settings.audio.inputDevice} onValueChange={(value) => updateSetting('audio', 'inputDevice', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="microphone">Built-in Microphone</SelectItem>
                      <SelectItem value="usb-mic">USB Microphone</SelectItem>
                      <SelectItem value="interface">Audio Interface</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="outputDevice">Output Device</Label>
                  <Select value={settings.audio.outputDevice} onValueChange={(value) => updateSetting('audio', 'outputDevice', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="speakers">Built-in Speakers</SelectItem>
                      <SelectItem value="headphones">Headphones</SelectItem>
                      <SelectItem value="interface">Audio Interface</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audio Processing</CardTitle>
                <CardDescription>
                  Configure audio enhancement settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Gain Control</Label>
                      <p className="text-sm text-muted-foreground">Automatically adjust input levels</p>
                    </div>
                    <Switch
                      checked={settings.audio.autoGain}
                      onCheckedChange={(checked) => updateSetting('audio', 'autoGain', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Noise Reduction</Label>
                      <p className="text-sm text-muted-foreground">Reduce background noise</p>
                    </div>
                    <Switch
                      checked={settings.audio.noiseReduction}
                      onCheckedChange={(checked) => updateSetting('audio', 'noiseReduction', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Echo Cancellation</Label>
                      <p className="text-sm text-muted-foreground">Remove echo from recordings</p>
                    </div>
                    <Switch
                      checked={settings.audio.echoCancellation}
                      onCheckedChange={(checked) => updateSetting('audio', 'echoCancellation', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Customize the visual appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.appearance.theme} onValueChange={(value: any) => updateSetting('appearance', 'theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Select value={settings.appearance.accentColor} onValueChange={(value) => updateSetting('appearance', 'accentColor', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={settings.appearance.fontSize} onValueChange={(value: any) => updateSetting('appearance', 'fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
                <CardDescription>
                  Configure display and layout preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use more compact layout</p>
                    </div>
                    <Switch
                      checked={settings.appearance.compactMode}
                      onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Grid</Label>
                      <p className="text-sm text-muted-foreground">Display background grid</p>
                    </div>
                    <Switch
                      checked={settings.appearance.showGrid}
                      onCheckedChange={(checked) => updateSetting('appearance', 'showGrid', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable UI animations</p>
                    </div>
                    <Switch
                      checked={settings.appearance.animations}
                      onCheckedChange={(checked) => updateSetting('appearance', 'animations', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">Minimize motion effects</p>
                    </div>
                    <Switch
                      checked={settings.appearance.reducedMotion}
                      onCheckedChange={(checked) => updateSetting('appearance', 'reducedMotion', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Processing */}
        <TabsContent value="processing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Settings</CardTitle>
                <CardDescription>
                  Configure audio processing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultQuality">Default Quality</Label>
                  <Select value={settings.processing.defaultQuality} onValueChange={(value: any) => updateSetting('processing', 'defaultQuality', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fast)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Slow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxConcurrentJobs">Max Concurrent Jobs</Label>
                  <Select value={settings.processing.maxConcurrentJobs.toString()} onValueChange={(value) => updateSetting('processing', 'maxConcurrentJobs', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Parallel Processing</Label>
                      <p className="text-sm text-muted-foreground">Process multiple files simultaneously</p>
                    </div>
                    <Switch
                      checked={settings.processing.parallelProcessing}
                      onCheckedChange={(checked) => updateSetting('processing', 'parallelProcessing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Save</Label>
                      <p className="text-sm text-muted-foreground">Automatically save progress</p>
                    </div>
                    <Switch
                      checked={settings.processing.autoSave}
                      onCheckedChange={(checked) => updateSetting('processing', 'autoSave', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Temporary Cleanup</Label>
                      <p className="text-sm text-muted-foreground">Auto-cleanup temporary files</p>
                    </div>
                    <Switch
                      checked={settings.processing.tempCleanup}
                      onCheckedChange={(checked) => updateSetting('processing', 'tempCleanup', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compression</Label>
                      <p className="text-sm text-muted-foreground">Compress output files</p>
                    </div>
                    <Switch
                      checked={settings.processing.compression}
                      onCheckedChange={(checked) => updateSetting('processing', 'compression', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Management</CardTitle>
                <CardDescription>
                  Manage cache and storage settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cacheSize">Cache Size: {formatFileSize(settings.processing.cacheSize)}</Label>
                  <Slider
                    value={[settings.processing.cacheSize]}
                    onValueChange={([value]) => updateSetting('processing', 'cacheSize', value)}
                    max={4096}
                    step={128}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>128 MB</span>
                    <span>4 GB</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Current Usage</Label>
                      <p className="text-sm text-muted-foreground">Storage space used</p>
                    </div>
                    <span className="font-medium">2.3 GB</span>
                  </div>
                  <Progress value={57} className="w-full" />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Optimize
                    </Button>
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
