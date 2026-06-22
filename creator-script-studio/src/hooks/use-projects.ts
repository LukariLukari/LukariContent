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
  description?: string;
  updatedAt: string;
  blocks: ScriptBlock[];
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
    getProject
  };
}
