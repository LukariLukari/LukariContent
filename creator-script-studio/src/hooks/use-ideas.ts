"use client";

import { useState, useEffect, useRef } from "react";

export type PlatformType = "Gốc (TikTok/FB/Rednote)" | "Reup (YT/Insta)" | "Tất cả";
export type ContentType = "Storytelling" | "Review" | "Tutorial" | "Drama" | "Giải trí" | "Khác";

export type Idea = {
  id: string;
  order: number;
  platform: PlatformType;
  contentType: ContentType | string;
  content: string; // Nội dung
  hook: string;
  details: string;
  createdAt: string;
};

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const saved = localStorage.getItem("creator-ideas");
    if (saved) {
      try {
        setIdeas(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse ideas", e);
      }
    } else {
      // Create some default ideas
      setIdeas([
        {
          id: `idea-${Date.now()}-1`,
          order: 1,
          platform: "Gốc (TikTok/FB/Rednote)",
          contentType: "Review",
          content: "Review bộ màu nước Mijello 36 màu",
          hook: "Đừng mua bộ màu này nếu bạn sợ... nghiện!",
          details: "Tập trung quay macro chất màu, swatches trên giấy vân lạnh.",
          createdAt: new Date().toISOString()
        }
      ]);
    }
    setIsLoaded(true);
  }, []);

  const saveIdeas = (newIdeas: Idea[], immediate = false) => {
    setIdeas(newIdeas);
    
    if (immediate) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      localStorage.setItem("creator-ideas", JSON.stringify(newIdeas));
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem("creator-ideas", JSON.stringify(newIdeas));
    }, 500);
  };

  const addIdea = () => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      order: ideas.length > 0 ? Math.max(...ideas.map(i => i.order)) + 1 : 1,
      platform: "Gốc (TikTok/FB/Rednote)",
      contentType: "Khác",
      content: "",
      hook: "",
      details: "",
      createdAt: new Date().toISOString()
    };
    saveIdeas([...ideas, newIdea], true);
    return newIdea;
  };

  const deleteIdea = (id: string) => {
    const filtered = ideas.filter(i => i.id !== id);
    // Re-order
    const reordered = filtered.map((idea, index) => ({ ...idea, order: index + 1 }));
    saveIdeas(reordered, true);
  };

  const updateIdea = (id: string, field: keyof Idea, value: string | number) => {
    saveIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, [field]: value } : idea
    ));
  };

  const reorderIdeas = (reorderedIdeas: Idea[]) => {
    const updated = reorderedIdeas.map((idea, index) => ({ ...idea, order: index + 1 }));
    saveIdeas(updated, true);
  };

  return {
    ideas,
    isLoaded,
    addIdea,
    deleteIdea,
    updateIdea,
    reorderIdeas
  };
}
