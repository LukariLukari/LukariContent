"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      let localProjects: Project[] = [];
      let localCampaigns: Campaign[] = [];

      // 1. Read Local Storage
      const savedProjects = localStorage.getItem("creator-projects");
      if (savedProjects) {
        try {
          localProjects = JSON.parse(savedProjects);
        } catch (e) {
          console.error("Failed to parse local projects", e);
        }
      }

      const savedCampaigns = localStorage.getItem("creator-campaigns");
      if (savedCampaigns) {
        try {
          localCampaigns = JSON.parse(savedCampaigns);
        } catch (e) {
          console.error("Failed to parse local campaigns", e);
        }
      }

      // We immediately set local data to not block the UI
      setProjects(localProjects);
      setCampaigns(localCampaigns);
      setIsLoaded(true);

      // 2. Try to fetch from Cloud (Supabase) and merge
      if (supabase) {
        try {
          const { data: cloudProjects, error } = await supabase.from('projects').select('*');
          if (!error && cloudProjects && cloudProjects.length > 0) {
            console.log("Cloud projects:", cloudProjects.length);
          } else if (!error && cloudProjects?.length === 0 && localProjects.length > 0) {
            console.log("Cloud is empty. Pushing local data to Supabase...");
            await supabase.from('projects').upsert(localProjects);
          }
        } catch (err) {
          console.error("Supabase sync error:", err);
        }
      } else {
        console.warn("Supabase keys missing. Running in local-only mode.");
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveProjects = async (newProjects: Project[], immediate = false) => {
    // Optimistic UI update
    setProjects(newProjects);
    
    // Save to LocalStorage
    if (immediate) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      localStorage.setItem("creator-projects", JSON.stringify(newProjects));
      
      // Push to Supabase
      if (supabase) {
        try {
          await supabase.from('projects').upsert(newProjects);
        } catch (e) {
          console.error("Failed to save to Supabase", e);
        }
      }
      return;
    }

    // Debounce localStorage & Supabase to prevent extreme lag and API spam on keystrokes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      localStorage.setItem("creator-projects", JSON.stringify(newProjects));
      if (supabase) {
        try {
          await supabase.from('projects').upsert(newProjects);
        } catch (e) {
          console.error("Failed to sync with Supabase", e);
        }
      }
    }, 1000); // Increased debounce to 1s for API calls
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
