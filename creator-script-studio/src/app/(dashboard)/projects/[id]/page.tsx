"use client";

import { TimelineBuilder } from "@/components/project/timeline-builder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { use } from "react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8">
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300`}>
        <div className="flex items-center gap-4 border-b bg-background px-6 py-3 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Chỉnh sửa Kịch bản</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-secondary/5 p-6">
          <div className="mx-auto max-w-4xl h-full">
            <TimelineBuilder projectId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
