"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderGit2, Video, BookOpen, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Tiến độ (Kanban)", href: "/kanban", icon: FolderGit2 },
  { name: "Lịch nội dung", href: "/calendar", icon: Video },
  { name: "Báo cáo", href: "/analytics", icon: BookOpen },
  { name: "AI content", href: "/copilot", icon: Sparkles },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-3 py-4">
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Creator<span className="text-muted-foreground">Studio</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const exactActive = item.href === "/" ? pathname === "/" : isActive;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                exactActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  exactActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3">
        <div className="rounded-xl bg-secondary/50 p-4">
          <h3 className="text-sm font-medium text-foreground">Upgrade to Pro</h3>
          <p className="mt-1 text-xs text-muted-foreground">Get unlimited AI generations and custom templates.</p>
          <button className="mt-3 w-full rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
