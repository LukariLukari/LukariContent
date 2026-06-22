"use client";

import { useState, useEffect } from "react";

export type ScriptBlock = {
  id: string;
  time: string;
  visual: string;
  action: string;
  dialogue: string;
  camera: string;
  caption: string;
  emotion: string;
};

export type Project = {
  id: string;
  name: string;
  updatedAt: string;
  blocks: ScriptBlock[];
};

const defaultBlocks: ScriptBlock[] = [
  {
    id: "block-1",
    time: "0s - 3s",
    visual: "Cận cảnh làn da xỉn màu/mệt mỏi dưới ánh sáng chói vào lúc 3 giờ chiều.",
    action: "Người sáng tạo trông kiệt sức, thở dài và chỉ vào màn hình.",
    dialogue: "Dừng lướt web nếu da bạn trông như thế này vào lúc 3 giờ chiều...",
    camera: "Cận cảnh, tĩnh",
    caption: "MỆT MỎI LÚC 3H CHIỀU? 😫",
    emotion: "Thất vọng, mệt mỏi"
  },
  {
    id: "block-2",
    time: "3s - 8s",
    visual: "Người sáng tạo thoa GlowBeauty Serum. Làn da lập tức trông sáng hơn.",
    action: "Thoa đều serum lên da, mỉm cười khi tinh chất thẩm thấu.",
    dialogue: "Serum Vitamin C 15% này từ GlowBeauty đã thay đổi hoàn toàn thói quen của tôi.",
    camera: "Cảnh trung, zoom nhẹ năng động",
    caption: "Bí mật: 15% Vit C Nguyên Chất ✨",
    emotion: "Hào hứng, nhẹ nhõm"
  }
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("creator-projects");
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem("creator-projects", JSON.stringify(newProjects));
  };

  const createProject = (name: string) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
      blocks: [...defaultBlocks], // start with default template
    };
    saveProjects([newProject, ...projects]);
    return newProject.id;
  };

  const deleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  const updateProjectBlocks = (id: string, blocks: ScriptBlock[]) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, blocks, updatedAt: new Date().toISOString() } : p
    ));
  };

  const getProject = (id: string) => {
    return projects.find(p => p.id === id);
  };

  return {
    projects,
    isLoaded,
    createProject,
    deleteProject,
    updateProjectBlocks,
    getProject
  };
}
