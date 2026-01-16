'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  UserPlus,
  Users,
  Mail,
  Check,
  X,
  Crown,
  Edit3,
  Eye,
  Clock,
  Loader2,
  Send,
  Copy,
  Link,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types
export interface Collaborator {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: string;
  acceptedAt?: string;
}

export interface CollaborationInvite {
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

// ============================================
// Collaborator Invite Dialog
// ============================================

interface InviteDialogProps {
  projectId: string;
  projectName: string;
  onInvite: (invite: CollaborationInvite) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CollaboratorInviteDialog({
  projectId,
  projectName,
  onInvite,
  trigger
}: InviteDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onInvite({ email, role });
      toast({
        title: 'Invitation sent',
        description: `Invited ${email} as ${role}`,
      });
      setEmail('');
      setRole('viewer');
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/projects/${projectId}/join`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied',
      description: 'Invite link copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Collaborator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite to Project
          </DialogTitle>
          <DialogDescription>
            Invite collaborators to &quot;{projectName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">Can view and download</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Editor</div>
                      <div className="text-xs text-muted-foreground">Can edit and annotate</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">Full access</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or share link</span>
            </div>
          </div>

          <Button variant="outline" onClick={copyInviteLink}>
            <Link className="h-4 w-4 mr-2" />
            Copy Invite Link
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Collaborator List
// ============================================

interface CollaboratorListProps {
  collaborators: Collaborator[];
  currentUserId: string;
  isOwner: boolean;
  onUpdateRole: (collaboratorId: string, role: 'viewer' | 'editor' | 'admin') => Promise<void>;
  onRemove: (collaboratorId: string) => Promise<void>;
}

export function CollaboratorList({
  collaborators,
  currentUserId,
  isOwner,
  onUpdateRole,
  onRemove,
}: CollaboratorListProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-amber-500" />;
      case 'editor': return <Edit3 className="h-4 w-4 text-blue-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3 mr-1" />Active</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600"><X className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return null;
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    setLoadingId(collaboratorId);
    try {
      await onUpdateRole(collaboratorId, newRole);
      toast({
        title: 'Role updated',
        description: `Changed role to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (collaboratorId: string, name: string) => {
    setLoadingId(collaboratorId);
    try {
      await onRemove(collaboratorId);
      toast({
        title: 'Collaborator removed',
        description: `${name} has been removed from the project`,
      });
    } catch (error) {
      toast({
        title: 'Failed to remove collaborator',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No collaborators yet</p>
        <p className="text-sm">Invite team members to start collaborating</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {collaborators.map((collaborator) => (
        <div
          key={collaborator.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={collaborator.avatarUrl} />
              <AvatarFallback>
                {collaborator.name?.charAt(0)?.toUpperCase() || collaborator.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{collaborator.name || 'Invited User'}</span>
                {getRoleIcon(collaborator.role)}
                {collaborator.userId === currentUserId && (
                  <Badge variant="secondary" className="text-xs">You</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{collaborator.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(collaborator.status)}

            {isOwner && collaborator.userId !== currentUserId && (
              <>
                <Select
                  value={collaborator.role}
                  onValueChange={(v) => handleRoleChange(collaborator.id, v as 'viewer' | 'editor' | 'admin')}
                  disabled={loadingId === collaborator.id}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(collaborator.id, collaborator.name)}
                  disabled={loadingId === collaborator.id}
                >
                  {loadingId === collaborator.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Project Sharing Card
// ============================================

interface ProjectSharingCardProps {
  projectId: string;
  projectName: string;
  collaborators: Collaborator[];
  currentUserId: string;
  isOwner: boolean;
  onInvite: (invite: CollaborationInvite) => Promise<void>;
  onUpdateRole: (collaboratorId: string, role: 'viewer' | 'editor' | 'admin') => Promise<void>;
  onRemove: (collaboratorId: string) => Promise<void>;
}

export function ProjectSharingCard({
  projectId,
  projectName,
  collaborators,
  currentUserId,
  isOwner,
  onInvite,
  onUpdateRole,
  onRemove,
}: ProjectSharingCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaborators
            </CardTitle>
            <CardDescription>
              {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          {isOwner && (
            <CollaboratorInviteDialog
              projectId={projectId}
              projectName={projectName}
              onInvite={onInvite}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CollaboratorList
          collaborators={collaborators}
          currentUserId={currentUserId}
          isOwner={isOwner}
          onUpdateRole={onUpdateRole}
          onRemove={onRemove}
        />
      </CardContent>
    </Card>
  );
}

// ============================================
// Collaboration Status Indicator
// ============================================

interface CollaborationStatusProps {
  activeCollaborators: { id: string; name: string; avatarUrl?: string; status: 'online' | 'away' | 'offline' }[];
  maxDisplay?: number;
}

export function CollaborationStatus({ activeCollaborators, maxDisplay = 4 }: CollaborationStatusProps) {
  const displayed = activeCollaborators.slice(0, maxDisplay);
  const remaining = activeCollaborators.length - maxDisplay;

  if (activeCollaborators.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {displayed.map((collaborator) => (
          <div key={collaborator.id} className="relative">
            <Avatar className="border-2 border-background h-8 w-8">
              <AvatarImage src={collaborator.avatarUrl} />
              <AvatarFallback className="text-xs">
                {collaborator.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(collaborator.status)}`}
            />
          </div>
        ))}
        {remaining > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
            +{remaining}
          </div>
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {activeCollaborators.filter(c => c.status === 'online').length} online
      </span>
    </div>
  );
}

const collaborationComponents = {
  CollaboratorInviteDialog,
  CollaboratorList,
  ProjectSharingCard,
  CollaborationStatus,
};

export default collaborationComponents;
