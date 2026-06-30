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

export type ProjectTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type ProjectMetrics = {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  conversions: number;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  blocks: ScriptBlock[];
  status: ProjectStatus;
  publishDate?: string;
  platforms?: string[];
  tasks?: ProjectTask[];
  metrics?: ProjectMetrics;
  campaignId?: string;
};

export type CampaignGoal = "viral" | "conversion" | "brand_awareness";

export type Campaign = {
  id: string;
  name: string;
  goal: CampaignGoal;
  startDate?: string;
  endDate?: string;
  projectIds: string[];
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProjects = localStorage.getItem("creator-projects");
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }

    const savedCampaigns = localStorage.getItem("creator-campaigns");
    if (savedCampaigns) {
      try {
        setCampaigns(JSON.parse(savedCampaigns));
      } catch (e) {
        console.error("Failed to parse campaigns", e);
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

  const saveCampaigns = (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem("creator-campaigns", JSON.stringify(newCampaigns));
  };

  const createCampaign = (name: string, goal: CampaignGoal) => {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      goal,
      projectIds: [],
    };
    saveCampaigns([newCampaign, ...campaigns]);
    return newCampaign.id;
  };

  const deleteCampaign = (id: string) => {
    saveCampaigns(campaigns.filter(c => c.id !== id));
    // Remove campaignId from projects
    const updatedProjects = projects.map(p => p.campaignId === id ? { ...p, campaignId: undefined } : p);
    saveProjects(updatedProjects, true);
  };

  const addProjectToCampaign = (campaignId: string, projectId: string) => {
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId && !c.projectIds.includes(projectId)) {
        return { ...c, projectIds: [...c.projectIds, projectId] };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
    
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, campaignId, updatedAt: new Date().toISOString() } : p
    );
    saveProjects(updatedProjects, true);
  };

  const removeProjectFromCampaign = (campaignId: string, projectId: string) => {
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, projectIds: c.projectIds.filter(id => id !== projectId) };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
    
    const updatedProjects = projects.map(p => 
      p.id === projectId && p.campaignId === campaignId ? { ...p, campaignId: undefined, updatedAt: new Date().toISOString() } : p
    );
    saveProjects(updatedProjects, true);
  };

  const updateProjectTasks = (id: string, tasks: ProjectTask[]) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, tasks, updatedAt: new Date().toISOString() } : p
    ));
  };

  const updateProjectMetrics = (id: string, metrics: ProjectMetrics) => {
    saveProjects(projects.map(p => 
      p.id === id ? { ...p, metrics, updatedAt: new Date().toISOString() } : p
    ));
  };

  return {
    projects,
    campaigns,
    isLoaded,
    createProject,
    deleteProject,
    updateProjectBlocks,
    updateProjectName,
    updateProjectDescription,
    updateProjectStatus,
    updateProjectPublishDate,
    updateProjectTasks,
    updateProjectMetrics,
    getProject,
    createCampaign,
    deleteCampaign,
    addProjectToCampaign,
    removeProjectFromCampaign
  };
}
