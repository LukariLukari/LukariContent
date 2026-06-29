"use client";

import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const { projects, isLoaded } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 is Monday, 6 is Sunday (for VN locale)
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const dateStr = isCurrentMonth 
      ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}` 
      : "";
    
    return {
      dayNumber: isCurrentMonth ? dayNumber : null,
      dateStr,
      isCurrentMonth,
      isToday: isCurrentMonth && 
        new Date().getDate() === dayNumber && 
        new Date().getMonth() === currentDate.getMonth() && 
        new Date().getFullYear() === currentDate.getFullYear()
    };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lịch Nội dung</h1>
          <p className="text-muted-foreground">Lên kế hoạch đăng bài theo ngày.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg font-medium w-40 text-center capitalize">{monthName}</div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {days.map((day, i) => {
            // Find projects for this day
            const dayProjects = day.isCurrentMonth && day.dateStr 
              ? projects.filter(p => p.publishDate && p.publishDate.startsWith(day.dateStr))
              : [];

            return (
              <div 
                key={i} 
                className={cn(
                  "border-r border-b p-2 min-h-24 transition-colors hover:bg-secondary/20",
                  !day.isCurrentMonth && "bg-secondary/30",
                  i % 7 === 6 && "border-r-0"
                )}
              >
                {day.dayNumber && (
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                      day.isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {day.dayNumber}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                      {dayProjects.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => router.push(`/projects/${p.id}`)}
                          className="text-xs truncate bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded px-1.5 py-1 cursor-pointer hover:bg-blue-500/20"
                          title={p.name}
                        >
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
