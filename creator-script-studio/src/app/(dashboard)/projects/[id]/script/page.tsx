"use client";

import { useState } from "react";
import { TimelineBuilder } from "@/components/project/timeline-builder";
import { StoryboardView } from "@/components/project/storyboard";
import { CopilotSidebar } from "@/components/project/copilot";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, FileDown, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { use } from "react";

export default function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const [copilotOpen, setCopilotOpen] = useState(true);
  const { id } = use(params);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8">
      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300`}>
        <Tabs defaultValue="timeline" className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b bg-background px-6 py-3 shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">GlowBeauty Skincare - Script</h1>
              <TabsList className="h-8 hidden sm:flex">
                <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                <TabsTrigger value="storyboard" className="text-xs">Storyboard</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 hidden sm:flex">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCopilotOpen(!copilotOpen)}
                className="ml-2"
                title="Toggle Copilot"
              >
                {copilotOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-secondary/5 p-6">
            <div className="mx-auto max-w-4xl h-full">
              <TabsContent value="timeline" className="m-0 h-full outline-none">
                <TimelineBuilder projectId={id || "default"} />
              </TabsContent>
              <TabsContent value="storyboard" className="m-0 h-full outline-none">
                <StoryboardView />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Copilot Sidebar Area */}
      {copilotOpen && (
        <div className="w-80 shrink-0 border-l bg-background hidden md:block">
          <CopilotSidebar onClose={() => setCopilotOpen(false)} />
        </div>
      )}
    </div>
  );
}
