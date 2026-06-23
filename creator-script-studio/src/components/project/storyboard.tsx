"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Image as ImageIcon } from "lucide-react";

// Using the same mock data as timeline-builder
const initialBlocks = [
  {
    id: "block-1",
    time: "0s - 3s",
    visual: "Close up of dull/tired skin in harsh lighting at 3 PM.",
    dialogue: "Stop scrolling if your skin looks like this at 3 PM...",
    image: "https://images.unsplash.com/photo-1512496015851-a1c848b76c81?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "block-2",
    time: "3s - 8s",
    visual: "Creator applying GlowBeauty Serum. Skin instantly looks brighter.",
    dialogue: "This 15% Vitamin C serum from GlowBeauty completely changed my routine.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop"
  }
];

export function StoryboardView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold">Storyboard View</h2>
          <p className="text-sm text-muted-foreground">Preview your video structure. AI generated visuals for reference.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {initialBlocks.map((block, index) => (
          <Card key={block.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-1/3 aspect-video bg-muted border-r flex flex-col items-center justify-center text-muted-foreground overflow-hidden">
                {block.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={block.image} alt={block.visual} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs uppercase font-medium">Visual</span>
                  </>
                )}
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                  Scene {index + 1}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b bg-secondary/20 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{block.time}</span>
                </div>
                <CardContent className="flex-1 p-4 grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Visual Action</h4>
                    <div className="text-sm text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.visual }} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Dialogue / VO</h4>
                    <div className="text-sm italic font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: `&quot;${block.dialogue}&quot;` }} />
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
