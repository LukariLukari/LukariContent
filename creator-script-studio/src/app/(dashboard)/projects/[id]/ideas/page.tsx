"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Zap, Shuffle, ChevronRight, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const initialIdeas = [
  {
    id: 1,
    title: "The 'Secret' Skincare Routine",
    hook: "Stop scrolling if your skin looks like this at 3 PM...",
    main: "Show the midday oily/dull skin problem. Transition to applying GlowBeauty Serum. Fast forward 7 days to show radiant, glowing skin. Emphasize the 15% Vitamin C without naming competitors.",
    cta: "Click the yellow basket to get your glow back before it sells out!",
    virality: 92,
    brandFit: 98,
    tags: ["TikTok Review", "Problem/Solution"],
  },
  {
    id: 2,
    title: "GRWM: First Date Prep",
    hook: "Get ready with me for a first date using only 3 products...",
    main: "Lifestyle vlog style. Apply the serum while talking about date nerves. Highlight how quickly it absorbs and leaves a perfect base for makeup.",
    cta: "Grab the GlowBeauty Serum in my bio for that first-date glow.",
    virality: 85,
    brandFit: 90,
    tags: ["Vlog", "Lifestyle"],
  },
  {
    id: 3,
    title: "Debunking Skincare Myths",
    hook: "Everything you know about Vitamin C is wrong...",
    main: "Educational hook. Explain why most Vitamin C serums irritate sensitive skin. Introduce GlowBeauty as the gentle alternative. Show texture shots.",
    cta: "Upgrade your routine today. Link in bio.",
    virality: 88,
    brandFit: 95,
    tags: ["Educational", "UGC"],
  }
];

export default function IdeasPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState(initialIdeas);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would fetch new ideas
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Viral Ideas</h1>
          <p className="text-muted-foreground">Generated 10 ideas based on the GlowBeauty brief.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRegenerate} disabled={isGenerating}>
            <Shuffle className="mr-2 h-4 w-4" /> Mix Ideas
          </Button>
          <Button onClick={handleRegenerate} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Regenerate 10 Ideas
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <Card key={idea.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Zap className="mr-1 h-3 w-3 fill-primary" />
                  {idea.virality}%
                </Badge>
              </div>
              <CardDescription className="flex gap-2 mt-2">
                {idea.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs font-normal">{tag}</Badge>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Hook</p>
                <p className="text-sm font-medium leading-relaxed italic text-foreground/90">&quot;{idea.hook}&quot;</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Core Concept</p>
                <p className="text-sm text-foreground/80 line-clamp-4">{idea.main}</p>
              </div>
              
              <div className="pt-4 border-t border-border mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Brand Fit Score</span>
                  <span className="font-medium text-success">{idea.brandFit}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-success transition-all duration-500" style={{ width: `${idea.brandFit}%` }} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/20 border-t border-border p-4">
              <Link href={`/projects/1/script`} className="w-full">
                <Button className="w-full shadow-sm" variant="default">
                  <Play className="mr-2 h-4 w-4 fill-current" /> Build Script Timeline
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
