'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Film, 
  Calendar, 
  Users, 
  FolderKanban,
  Settings,
  ChevronLeft,
  Clapperboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const mainNavItems = [
  {
    title: '프로젝트',
    href: '/projects',
    icon: FolderKanban,
  },
];

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  
  // URL에서 현재 프로젝트 ID 추출
  const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/);
  const currentProjectId = projectIdMatch ? projectIdMatch[1] : null;
  
  // 프로젝트가 선택된 경우에만 표시할 메뉴
  const projectNavItems = currentProjectId ? [
    {
      title: '프로젝트 홈',
      href: `/projects/${currentProjectId}`,
      icon: FolderKanban,
    },
    {
      title: '일촬표',
      href: `/projects/${currentProjectId}/schedules`,
      icon: Calendar,
    },
    {
      title: '스태프',
      href: `/projects/${currentProjectId}/staff`,
      icon: Users,
    },
    {
      title: '캐스트',
      href: `/projects/${currentProjectId}/cast`,
      icon: Film,
    },
  ] : [];
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link href="/projects" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Clapperboard className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              FilmSheet
            </span>
          )}
        </Link>
        {!isCollapsed && onToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={onToggle}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && !currentProjectId);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* 프로젝트가 선택된 경우에만 프로젝트 메뉴 표시 */}
        {!isCollapsed && currentProjectId && (
          <>
            <Separator className="my-4 mx-4" />
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                현재 프로젝트
              </p>
            </div>
            <nav className="px-2 space-y-1">
              {projectNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>설정</span>}
        </Link>
      </div>
    </div>
  );
}
