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
  Settings,
  FileAudio,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Download,
  Headphones,
  Package,
  FolderOpen,
  Search,
  Upload,
  PlayCircle,
  Piano,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

// Simplified, research-focused navigation
const sidebarSections: SidebarSection[] = [
  {
    title: "Workflow",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Overview and quick upload",
      },
      {
        title: "Transcription",
        href: "/transcription",
        icon: Mic,
        description: "Analyze audio and extract notes",
      },
      {
        title: "Piano Roll",
        href: "/piano-roll",
        icon: Piano,
        description: "View and edit musical notes",
      },
    ],
  },
  {
    title: "Processing",
    items: [
      {
        title: "Batch Processing",
        href: "/batch-processing",
        icon: Package,
        description: "Process multiple files at once",
      },
      {
        title: "Stem Separation",
        href: "/stem-separation",
        icon: Headphones,
        description: "Isolate instruments from audio",
      },
      {
        title: "Audio Analysis",
        href: "/audio-analysis",
        icon: BarChart3,
        description: "Detailed frequency analysis",
      },
    ],
  },
  {
    title: "Output",
    items: [
      {
        title: "Export",
        href: "/export",
        icon: Download,
        description: "Export to MIDI, PDF, CSV",
      },
      {
        title: "Files",
        href: "/files",
        icon: FolderOpen,
        description: "Manage your local files",
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
        description: "App preferences",
      },
      {
        title: "Help",
        href: "/help",
        icon: HelpCircle,
        description: "Documentation and guides",
      },
    ],
  },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const SidebarMenuItem = ({ item }: { item: SidebarItem }) => {
    const isActive = pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(item.href));

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent",
                isActive
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
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
        isCollapsed ? "w-16" : "w-60",
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
            <div className="ml-1">
              <h1 className="text-lg font-bold">Streamlit</h1>
              <p className="text-[10px] text-muted-foreground">Audio Research</p>
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
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href} item={item} />
                ))}
              </div>
              {index < sidebarSections.length - 1 && !isCollapsed && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Privacy Note */}
      {!isCollapsed && (
        <div className="border-t p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <Shield className="h-3 w-3 text-green-500" />
            <span>Files stay on your device</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground">v1.0</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files or help..."
                className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
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

// Export both for backward compatibility
export { AppLayout as EnterpriseLayout };
export { AppSidebar as EnterpriseSidebar };
