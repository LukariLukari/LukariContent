"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      let localIdeas: Idea[] = [];
      const saved = localStorage.getItem("creator-ideas");
      
      if (saved) {
        try {
          localIdeas = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse ideas", e);
        }
      } else {
        localIdeas = [
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
        ];
      }
      
      setIdeas(localIdeas);
      setIsLoaded(true);

      if (supabase) {
        try {
          const { data: cloudIdeas, error } = await supabase.from('ideas').select('*');
          if (!error && cloudIdeas) {
            // Hợp nhất dữ liệu: Ưu tiên dữ liệu local nếu nó chưa có trên cloud, 
            // hoặc gộp cả hai lại. Ở đây ta gộp theo ID để không bị trùng.
            const mergedIdeas = [...localIdeas];
            const localIds = new Set(localIdeas.map(i => i.id));
            
            let hasNewCloudData = false;
            for (const cIdea of cloudIdeas) {
              if (!localIds.has(cIdea.id)) {
                mergedIdeas.push(cIdea);
                hasNewCloudData = true;
              }
            }

            // Nếu Cloud trống hoặc ít dữ liệu hơn Local, ta đẩy toàn bộ lên Cloud
            if (cloudIdeas.length < localIdeas.length || cloudIdeas.length === 0) {
              console.log("Pushing missing local ideas to Cloud...");
              await supabase.from('ideas').upsert(mergedIdeas);
            }

            setIdeas(mergedIdeas);
            localStorage.setItem("creator-ideas", JSON.stringify(mergedIdeas));
          }
        } catch (err) {
          console.error("Supabase sync error for ideas:", err);
        }
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveIdeas = async (newIdeas: Idea[], immediate = false) => {
    setIdeas(newIdeas);
    
    if (immediate) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      localStorage.setItem("creator-ideas", JSON.stringify(newIdeas));
      if (supabase) {
        try {
          await supabase.from('ideas').upsert(newIdeas);
        } catch (e) {
          console.error("Failed to save ideas to Supabase", e);
        }
      }
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      localStorage.setItem("creator-ideas", JSON.stringify(newIdeas));
      if (supabase) {
        try {
          await supabase.from('ideas').upsert(newIdeas);
        } catch (e) {
          console.error("Failed to save ideas to Supabase", e);
        }
      }
    }, 1000);
  };

  const addIdea = (initialData?: Partial<Idea>) => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      order: ideas.length > 0 ? Math.max(...ideas.map(i => i.order)) + 1 : 1,
      platform: "Gốc (TikTok/FB/Rednote)",
      contentType: "Khác",
      content: "",
      hook: "",
      details: "",
      createdAt: new Date().toISOString(),
      ...initialData
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
