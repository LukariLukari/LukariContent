"use client";

import { useState, useEffect, useRef } from "react";

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

export type ProjectStatus = "idea" | "scripting" | "pre_production" | "filming" | "post_production" | "review" | "published";

export type Project = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  blocks: ScriptBlock[];
  status: ProjectStatus;
  publishDate?: string;
  platforms?: string[];
};

const defaultBlocks: ScriptBlock[] = [
  {
    id: "block-1",
    time: "0s - 5s",
    visual: "",
    action: "",
    dialogue: "",
    camera: "",
    caption: "",
    emotion: ""
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

  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveProjects = (newProjects: Project[], immediate = false) => {
    setProjects(newProjects);
    
    if (immediate) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      localStorage.setItem("creator-projects", JSON.stringify(newProjects));
      return;
    }

    // Debounce localStorage to prevent extreme lag on keystrokes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem("creator-projects", JSON.stringify(newProjects));
    }, 500);
  };

  const createProject = (name: string, description?: string, blocks?: ScriptBlock[]) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      updatedAt: new Date().toISOString(),
      blocks: blocks && blocks.length > 0 ? blocks : [...defaultBlocks],
      status: "idea",
      platforms: [],
    };
    saveProjects([newProject, ...projects], true);
    return newProject.id;
  };

  const deleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id), true);
  };

  const updateProjectBlocks = (id: string, blocks: ScriptBlock[]) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, blocks, updatedAt: new Date().toISOString() } : p
    ));
  };

  const updateProjectName = (id: string, name: string) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
    ));
  };

  const updateProjectDescription = (id: string, description: string) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, description, updatedAt: new Date().toISOString() } : p
    ));
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    ));
  };

  const updateProjectPublishDate = (id: string, publishDate: string | undefined) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, publishDate, updatedAt: new Date().toISOString() } : p
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
    updateProjectName,
    updateProjectDescription,
    updateProjectStatus,
    updateProjectPublishDate,
    getProject
  };
}
