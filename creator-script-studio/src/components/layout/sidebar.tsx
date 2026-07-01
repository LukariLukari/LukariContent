"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderGit2, Video, BookOpen, Settings, Sparkles, Target, Lightbulb, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Ngân hàng ý tưởng", href: "/ideas", icon: Lightbulb },
  { name: "Lộ trình (Roadmap)", href: "/roadmap", icon: Target },
  { name: "Tiến độ (Kanban)", href: "/kanban", icon: FolderGit2 },
  { name: "Lịch nội dung", href: "/calendar", icon: Video },
  { name: "Báo cáo", href: "/analytics", icon: BookOpen },
  { name: "AI content", href: "/copilot", icon: Sparkles },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return <div className="flex h-full w-64 flex-col border-r bg-card px-3 py-4" />;
  }

  return (
    <div 
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300 relative",
        isCollapsed ? "w-20 px-2 py-4" : "w-64 px-3 py-4"
      )}
    >
      <div className={cn("mb-8 flex items-center h-10", isCollapsed ? "justify-center px-0" : "justify-between px-3")}>
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
            Creator<span className="text-muted-foreground">Studio</span>
          </h1>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn("text-muted-foreground hover:text-foreground", isCollapsed ? "h-10 w-10" : "h-8 w-8")}
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeft className="h-6 w-6" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const exactActive = item.href === "/" ? pathname === "/" : isActive;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group flex items-center rounded-md font-medium transition-all duration-300 relative",
                isCollapsed ? "justify-center py-3 px-0 mx-2" : "px-3 py-2.5 text-sm mx-1",
                exactActive
                  ? isCollapsed ? "bg-transparent" : "bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-500"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5",
                  exactActive 
                    ? cn("text-orange-500 dark:text-orange-400 drop-shadow-sm", isCollapsed && "scale-[1.35]") 
                    : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto transition-all", isCollapsed ? "px-0 flex justify-center pb-4" : "px-3")}>
        {isCollapsed ? (
          <div 
            className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white cursor-pointer shadow-md hover:scale-110 transition-transform" 
            title="Upgrade to Pro"
          >
            <Sparkles className="h-5 w-5" />
          </div>
        ) : (
          <div className="rounded-xl bg-gradient-to-tr from-yellow-500/10 to-orange-500/10 border border-orange-200/50 dark:border-orange-900/50 p-4">
            <h3 className="text-sm font-medium text-orange-600 dark:text-orange-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Get unlimited AI generations and custom templates.</p>
            <button className="mt-3 w-full rounded-md bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
