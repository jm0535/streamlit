"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Music2,
  Mic,
  Sliders,
  Settings,
  FileAudio,
  BarChart3,
  Users,
  Database,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Upload,
  Download,
  PlayCircle,
  Headphones,
  Piano,
  Guitar,
  Drum,
  Volume2,
  Activity,
  FileText,
  Layers,
  Zap,
  Globe,
  Clock,
  Star,
  TrendingUp,
  Package,
  Archive,
  FolderOpen,
  Search,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
  isActive?: boolean;
  children?: SidebarItem[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: Home,
        description: "Overview and quick actions",
      },
      {
        title: "Audio Transcription",
        href: "/transcription",
        icon: Mic,
        description: "Convert audio to MIDI",
      },
      {
        title: "Professional Mixer",
        href: "/mixer-demo",
        icon: Sliders,
        description: "Multi-channel audio mixing",
        badge: "NEW",
      },
    ],
  },
  {
    title: "Audio Processing",
    items: [
      {
        title: "Stem Separation",
        href: "/stem-separation",
        icon: Layers,
        description: "Isolate individual instruments",
      },
      {
        title: "Batch Processing",
        href: "/batch-processing",
        icon: Package,
        description: "Process multiple files",
        badge: "PRO",
      },
      {
        title: "Audio Analysis",
        href: "/audio-analysis",
        icon: BarChart3,
        description: "Detailed audio analytics",
      },
    ],
  },
  {
    title: "Instruments",
    items: [
      {
        title: "Piano & Keys",
        href: "/instruments/piano",
        icon: Piano,
        description: "Piano transcription tools",
      },
      {
        title: "Guitar & Strings",
        href: "/instruments/guitar",
        icon: Guitar,
        description: "Guitar and string instruments",
      },
      {
        title: "Drums & Percussion",
        href: "/instruments/drums",
        icon: Drum,
        description: "Drum transcription and analysis",
      },
    ],
  },
  {
    title: "Data & Export",
    items: [
      {
        title: "File Manager",
        href: "/files",
        icon: FolderOpen,
        description: "Manage audio files",
      },
      {
        title: "Export Center",
        href: "/export",
        icon: Download,
        description: "Export MIDI, CSV, ZIP",
      },
      {
        title: "Archive",
        href: "/archive",
        icon: Archive,
        description: "Historical data and backups",
      },
    ],
  },
  {
    title: "Research Tools",
    items: [
      {
        title: "Statistics",
        href: "/statistics",
        icon: TrendingUp,
        description: "Usage and performance metrics",
      },
      {
        title: "Collaboration",
        href: "/collaboration",
        icon: Users,
        description: "Team projects and sharing",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Application preferences",
      },
      {
        title: "Database",
        href: "/database",
        icon: Database,
        description: "Data management",
      },
      {
        title: "Security",
        href: "/security",
        icon: Shield,
        description: "Security and permissions",
      },
      {
        title: "Help & Support",
        href: "/help",
        icon: HelpCircle,
        description: "Documentation and support",
      },
    ],
  },
];

interface EnterpriseSidebarProps {
  className?: string;
}

export function EnterpriseSidebar({ className }: EnterpriseSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const SidebarItem = ({
    item,
    level = 0,
  }: {
    item: SidebarItem;
    level?: number;
  }) => {
    const isActive =
      pathname === item.href ||
      item.children?.some((child) => pathname === child.href);

    if (level > 0) {
      return (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent nav-link",
            isActive
              ? "bg-accent text-accent-foreground font-medium nav-link active"
              : "nav-link"
          )}
        >
          <item.icon className="h-4 w-4 audio-icon" />
          <span className="truncate">{item.title}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="ml-auto text-xs badge-secondary"
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      );
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent nav-link",
                isActive
                  ? "bg-accent text-accent-foreground font-medium nav-link active"
                  : "nav-link"
              )}
            >
              <item.icon className="h-4 w-4 audio-icon" />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs badge-secondary"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="flex items-center gap-4">
              <div>
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-primary/60 p-2 rounded-xl shadow-lg shadow-primary/20">
              <Music2 className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-2">
              <h1 className="text-lg font-bold">Streamlit</h1>
              <p className="text-xs text-muted-foreground">Enterprise Audio</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 w-8 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-6">
          {sidebarSections.map((section, index) => (
            <div key={section.title} className="space-y-2">
              {!isCollapsed && (
                <div className="px-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem key={item.href} item={item} />
                ))}
              </div>
              {index < sidebarSections.length - 1 && !isCollapsed && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/user.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">
                john@example.com
              </p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EnterpriseLayoutProps {
  children: React.ReactNode;
}

export function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <EnterpriseSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search files, settings, or help..."
                  className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button size="sm">
              <PlayCircle className="h-4 w-4 mr-2" />
              Quick Transcribe
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
