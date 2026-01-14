'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Edit,
  Copy,
  Download,
  Upload,
  Users,
  User,
  Mail,
  Phone,
  Globe,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  Database,
  Server,
  Cloud,
  HardDrive,
  FileText,
  HelpCircle,
  Info,
  ExternalLink,
  Zap,
  Ban,
  Unlock,
  Fingerprint,
  CreditCard,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  UserPlus,
  UserMinus,
  LogIn,
  LogOut,
  Camera,
  Video,
  Mic,
  MicOff,
  Bell,
  BellOff,
  MoreHorizontal,
  Filter
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

interface SecuritySession {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  status: 'active' | 'expired' | 'terminated';
  createdAt: Date;
  lastActive: Date;
  current: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'login' | 'permission' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  actions: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
}

interface TwoFactorSettings {
  enabled: boolean;
  method: 'sms' | 'email' | 'authenticator' | 'hardware';
  phoneNumber?: string;
  email?: string;
  backupCodes: string[];
  recoveryCodes: string[];
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    expiryDays: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrent: number;
    requireReauth: boolean;
    ipWhitelist: string[];
    deviceTracking: boolean;
  };
  dataProtection: {
    encryption: boolean;
    backupEncryption: boolean;
    auditLogging: boolean;
    dataRetention: number;
    gdprCompliance: boolean;
  };
  accessControl: {
    twoFactorAuth: TwoFactorSettings;
    rolesEnabled: boolean;
    ipRestrictions: boolean;
    deviceApproval: boolean;
    apiAccess: boolean;
  };
}

export default function SecurityPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [sessions, setSessions] = useState<SecuritySession[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      location: 'Cambridge, MA',
      ipAddress: '192.168.1.100',
      status: 'active',
      createdAt: new Date('2024-01-20T09:00:00'),
      lastActive: new Date(),
      current: true
    },
    {
      id: '2',
      device: 'iPhone 14',
      deviceType: 'mobile',
      browser: 'Safari 17.1',
      location: 'Cambridge, MA',
      ipAddress: '192.168.1.101',
      status: 'active',
      createdAt: new Date('2024-01-19T14:30:00'),
      lastActive: new Date('2024-01-20T08:45:00'),
      current: false
    },
    {
      id: '3',
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Firefox 121.0',
      location: 'Boston, MA',
      ipAddress: '192.168.1.102',
      status: 'expired',
      createdAt: new Date('2024-01-15T10:00:00'),
      lastActive: new Date('2024-01-18T16:20:00'),
      current: false
    }
  ]);

  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'login',
      severity: 'medium',
      title: 'Unusual login location detected',
      description: 'Login from Boston, MA detected - unusual location for this account',
      timestamp: new Date('2024-01-20T08:45:00'),
      resolved: false,
      actions: ['review', 'block', 'allow']
    },
    {
      id: '2',
      type: 'permission',
      severity: 'low',
      title: 'New API key created',
      description: 'API key "Research Tool" was created 2 hours ago',
      timestamp: new Date('2024-01-20T07:30:00'),
      resolved: true,
      actions: ['review', 'revoke']
    },
    {
      id: '3',
      type: 'data',
      severity: 'high',
      title: 'Multiple failed login attempts',
      description: '5 failed login attempts from unknown IP address',
      timestamp: new Date('2024-01-20T06:15:00'),
      resolved: false,
      actions: ['block', 'investigate', 'ignore']
    }
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Research Tool',
      key: 'ak_live_4f7c8e9d2a1b3c5d6e7f8a9b0c1d2e3',
      permissions: ['read', 'write', 'upload'],
      status: 'active',
      createdAt: new Date('2024-01-20T07:30:00'),
      lastUsed: new Date('2024-01-20T09:15:00'),
      usageCount: 147
    },
    {
      id: '2',
      name: 'Data Analysis Script',
      key: 'ak_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
      permissions: ['read', 'analysis'],
      status: 'active',
      createdAt: new Date('2024-01-15T10:00:00'),
      lastUsed: new Date('2024-01-19T14:20:00'),
      usageCount: 89
    },
    {
      id: '3',
      name: 'Legacy Integration',
      key: 'ak_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      permissions: ['read'],
      status: 'revoked',
      createdAt: new Date('2023-12-01T08:00:00'),
      usageCount: 23
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      preventReuse: 5,
      expiryDays: 90
    },
    sessionSettings: {
      timeout: 24,
      maxConcurrent: 3,
      requireReauth: true,
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      deviceTracking: true
    },
    dataProtection: {
      encryption: true,
      backupEncryption: true,
      auditLogging: true,
      dataRetention: 365,
      gdprCompliance: true
    },
    accessControl: {
      twoFactorAuth: {
        enabled: true,
        method: 'authenticator',
        backupCodes: ['123456', '789012', '345678', '901234'],
        recoveryCodes: ['abcdef', 'ghijkl', 'mnopqr', 'stuvwx']
      },
      rolesEnabled: true,
      ipRestrictions: true,
      deviceApproval: true,
      apiAccess: true
    }
  });

  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      toast({
        title: "Security settings saved",
        description: "Your security settings have been updated successfully",
      });
    }, 1500);
  }, [toast]);

  const handleTerminateSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'terminated' as const }
        : session
    ));
    
    toast({
      title: "Session terminated",
      description: "The selected session has been terminated",
    });
  }, [toast]);

  const handleResolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    
    toast({
      title: "Alert resolved",
      description: "Security alert has been marked as resolved",
    });
  }, [toast]);

  const handleRevokeApiKey = useCallback((keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, status: 'revoked' as const } : key
    ));
    
    toast({
      title: "API key revoked",
      description: "The API key has been revoked and is no longer active",
    });
  }, [toast]);

  const handleCreateApiKey = useCallback(() => {
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: 'New API Key',
      key: `ak_live_${Math.random().toString(36).substring(2, 34)}`,
      permissions: ['read'],
      status: 'active',
      createdAt: new Date(),
      usageCount: 0
    };

    setApiKeys(prev => [newKey, ...prev]);
    
    toast({
      title: "API key created",
      description: "New API key has been generated successfully",
    });
  }, [toast]);

  const updateSecuritySetting = useCallback((category: keyof SecuritySettings, key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'terminated':
      case 'revoked':
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">
            Manage your account security and access controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Security Guide
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Security Score: 92/100
              </CardTitle>
              <CardDescription>
                Your account security is excellent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={92} className="w-full mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Strong password</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">2FA enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">No recent threats</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Data encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">2 active sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API access secured</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Key className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Change Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your account password
                </p>
                <Button variant="outline" className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">2FA Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure two-factor authentication
                </p>
                <Button variant="outline" className="w-full">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Configure 2FA
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <KeyRound className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">API Keys</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage API access keys
                </p>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Keys
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold mb-2">Access Control</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review active sessions
                </p>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Sessions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>
                Latest security events and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <LogIn className="h-4 w-4 text-green-500" />
                  <span>Successful login from MacBook Pro</span>
                  <span className="text-muted-foreground ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Key className="h-4 w-4 text-blue-500" />
                  <span>API key "Research Tool" created</span>
                  <span className="text-muted-foreground ml-auto">3 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>2FA verification completed</span>
                  <span className="text-muted-foreground ml-auto">5 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Unusual login location detected</span>
                  <span className="text-muted-foreground ml-auto">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Active Sessions</h2>
              <p className="text-muted-foreground">
                Manage and monitor active login sessions
              </p>
            </div>
            <Button variant="outline">
              <Ban className="h-4 w-4 mr-2" />
              Terminate All Others
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className={session.current ? 'ring-2 ring-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.deviceType)}
                      {getStatusIcon(session.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{session.device}</h4>
                        {session.current && <Badge variant="default">Current</Badge>}
                        <Badge variant="outline" className="capitalize">
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{session.browser}</span>
                        <span>{session.location}</span>
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Started {session.createdAt.toLocaleString()}</span>
                        <span>Last active {session.lastActive.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!session.current && session.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Terminate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Security Alerts</h2>
              <p className="text-muted-foreground">
                Monitor and respond to security events
              </p>
            </div>
            <Button variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve All
            </Button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={getSeverityColor(alert.severity)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant="outline" className="capitalize">
                          {alert.severity}
                        </Badge>
                        {alert.resolved && <Badge variant="default">Resolved</Badge>}
                      </div>
                      <p className="text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{alert.timestamp.toLocaleString()}</span>
                        <span>Type: {alert.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.resolved && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {alert.actions.map((action) => (
                                <DropdownMenuItem key={action}>
                                  {action.charAt(0).toUpperCase() + action.slice(1)}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">API Keys</h2>
              <p className="text-muted-foreground">
                Manage API access keys and permissions
              </p>
            </div>
            <Button onClick={handleCreateApiKey}>
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {getStatusIcon(apiKey.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{apiKey.key.substring(0, 20)}...</span>
                        <span>Created {apiKey.createdAt.toLocaleDateString()}</span>
                        <span>Used {apiKey.usageCount} times</span>
                        {apiKey.lastUsed && (
                          <span>Last used {apiKey.lastUsed.toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      {apiKey.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>
                  Configure password requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => updateSecuritySetting('passwordPolicy', 'minLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Require Uppercase</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy', 'requireUppercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Lowercase</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy', 'requireLowercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy', 'requireNumbers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Symbols</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireSymbols}
                      onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy', 'requireSymbols', checked)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expiryDays">Password Expiry (days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    value={securitySettings.passwordPolicy.expiryDays}
                    onChange={(e) => updateSecuritySetting('passwordPolicy', 'expiryDays', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
                <CardDescription>
                  Configure session management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timeout">Session Timeout (hours)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={securitySettings.sessionSettings.timeout}
                    onChange={(e) => updateSecuritySetting('sessionSettings', 'timeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxConcurrent">Max Concurrent Sessions</Label>
                  <Input
                    id="maxConcurrent"
                    type="number"
                    value={securitySettings.sessionSettings.maxConcurrent}
                    onChange={(e) => updateSecuritySetting('sessionSettings', 'maxConcurrent', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Re-authentication</Label>
                      <p className="text-sm text-muted-foreground">Ask for password on sensitive actions</p>
                    </div>
                    <Switch
                      checked={securitySettings.sessionSettings.requireReauth}
                      onCheckedChange={(checked) => updateSecuritySetting('sessionSettings', 'requireReauth', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Device Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track and monitor devices</p>
                    </div>
                    <Switch
                      checked={securitySettings.sessionSettings.deviceTracking}
                      onCheckedChange={(checked) => updateSecuritySetting('sessionSettings', 'deviceTracking', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  Configure data security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                    </div>
                    <Switch
                      checked={securitySettings.dataProtection.encryption}
                      onCheckedChange={(checked) => updateSecuritySetting('dataProtection', 'encryption', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt backup files</p>
                    </div>
                    <Switch
                      checked={securitySettings.dataProtection.backupEncryption}
                      onCheckedChange={(checked) => updateSecuritySetting('dataProtection', 'backupEncryption', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all security events</p>
                    </div>
                    <Switch
                      checked={securitySettings.dataProtection.auditLogging}
                      onCheckedChange={(checked) => updateSecuritySetting('dataProtection', 'auditLogging', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>GDPR Compliance</Label>
                      <p className="text-sm text-muted-foreground">Comply with GDPR regulations</p>
                    </div>
                    <Switch
                      checked={securitySettings.dataProtection.gdprCompliance}
                      onCheckedChange={(checked) => updateSecuritySetting('dataProtection', 'gdprCompliance', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>
                  Configure access and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={securitySettings.accessControl.twoFactorAuth.enabled}
                      onCheckedChange={(checked) => updateSecuritySetting('accessControl', 'twoFactorAuth', {
                        ...securitySettings.accessControl.twoFactorAuth,
                        enabled: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Role-Based Access</Label>
                      <p className="text-sm text-muted-foreground">Enable role permissions</p>
                    </div>
                    <Switch
                      checked={securitySettings.accessControl.rolesEnabled}
                      onCheckedChange={(checked) => updateSecuritySetting('accessControl', 'rolesEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Restrictions</Label>
                      <p className="text-sm text-muted-foreground">Restrict access by IP</p>
                    </div>
                    <Switch
                      checked={securitySettings.accessControl.ipRestrictions}
                      onCheckedChange={(checked) => updateSecuritySetting('accessControl', 'ipRestrictions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Device Approval</Label>
                      <p className="text-sm text-muted-foreground">Require device approval</p>
                    </div>
                    <Switch
                      checked={securitySettings.accessControl.deviceApproval}
                      onCheckedChange={(checked) => updateSecuritySetting('accessControl', 'deviceApproval', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Audit Log</h2>
              <p className="text-muted-foreground">
                Complete history of security events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <LogIn className="h-4 w-4 text-green-500" />
                  <span>User login successful</span>
                  <span className="text-muted-foreground ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Key className="h-4 w-4 text-blue-500" />
                  <span>API key created</span>
                  <span className="text-muted-foreground ml-auto">3 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>2FA verification completed</span>
                  <span className="text-muted-foreground ml-auto">5 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Unusual login location detected</span>
                  <span className="text-muted-foreground ml-auto">6 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Ban className="h-4 w-4 text-red-500" />
                  <span>Failed login attempt</span>
                  <span className="text-muted-foreground ml-auto">8 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Edit className="h-4 w-4 text-purple-500" />
                  <span>Security settings updated</span>
                  <span className="text-muted-foreground ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span>New user added</span>
                  <span className="text-muted-foreground ml-auto">2 days ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Database backup completed</span>
                  <span className="text-muted-foreground ml-auto">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
