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

export type CampaignPhase = {
  id: string;
  name: string;
  order: number;
  ideaIds: string[];
};

export type Campaign = {
  id: string;
  name: string;
  goal: CampaignGoal;
  startDate?: string;
  endDate?: string;
  projectIds: string[];
  ideaIds?: string[]; // Legacy
  phases?: CampaignPhase[];
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
          const parsed = JSON.parse(savedCampaigns);
          // Migrate legacy campaigns
          localCampaigns = parsed.map((c: any) => {
            if (!c.phases) {
              return {
                ...c,
                phases: [
                  {
                    id: `phase-legacy-${Date.now()}`,
                    name: "Lộ trình chung",
                    order: 1,
                    ideaIds: c.ideaIds || []
                  }
                ]
              };
            }
            return c;
          });
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
            console.log("Cloud projects is empty. Pushing local data to Supabase...");
            await supabase.from('projects').upsert(localProjects);
          }

          const { data: cloudCampaigns, error: campError } = await supabase.from('campaigns').select('*');
          if (!campError && cloudCampaigns && cloudCampaigns.length > 0) {
            console.log("Cloud campaigns:", cloudCampaigns.length);
          } else if (!campError && cloudCampaigns?.length === 0 && localCampaigns.length > 0) {
            console.log("Cloud campaigns is empty. Pushing local data to Supabase...");
            await supabase.from('campaigns').upsert(localCampaigns);
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

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  const saveCampaigns = async (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem("creator-campaigns", JSON.stringify(newCampaigns));
    if (supabase) {
      try {
        await supabase.from('campaigns').upsert(newCampaigns);
      } catch (e) {
        console.error("Failed to save campaigns to Supabase", e);
      }
    }
  };

  const createCampaign = (name: string, goal: CampaignGoal) => {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      goal,
      projectIds: [],
      ideaIds: [],
      phases: [
        {
          id: `phase-${Date.now()}`,
          name: "Lộ trình chung",
          order: 1,
          ideaIds: []
        }
      ]
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

  // Legacy (Keep for compatibility or migrate)
  const addIdeaToCampaign = (campaignId: string, ideaId: string) => {
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        const ideaIds = c.ideaIds || [];
        if (!ideaIds.includes(ideaId)) {
          return { ...c, ideaIds: [...ideaIds, ideaId] };
        }
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
  };

  const removeIdeaFromCampaign = (campaignId: string, ideaId: string) => {
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId && c.ideaIds) {
        return { ...c, ideaIds: c.ideaIds.filter(id => id !== ideaId) };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
  };

  // Phase Management
  const addPhase = (campaignId: string, name: string) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId) {
        const phases = c.phases || [];
        const newPhase: CampaignPhase = {
          id: `phase-${Date.now()}`,
          name,
          order: phases.length > 0 ? Math.max(...phases.map(p => p.order)) + 1 : 1,
          ideaIds: []
        };
        return { ...c, phases: [...phases, newPhase] };
      }
      return c;
    }));
  };

  const updatePhaseOrder = (campaignId: string, phases: CampaignPhase[]) => {
    saveCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, phases } : c
    ));
  };

  const deletePhase = (campaignId: string, phaseId: string) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId && c.phases) {
        return { ...c, phases: c.phases.filter(p => p.id !== phaseId) };
      }
      return c;
    }));
  };

  const renamePhase = (campaignId: string, phaseId: string, newName: string) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId && c.phases) {
        return {
          ...c,
          phases: c.phases.map(p => p.id === phaseId ? { ...p, name: newName } : p)
        };
      }
      return c;
    }));
  };

  const addIdeaToPhase = (campaignId: string, phaseId: string, ideaId: string) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId && c.phases) {
        return {
          ...c,
          phases: c.phases.map(p => {
            if (p.id === phaseId && !p.ideaIds.includes(ideaId)) {
              return { ...p, ideaIds: [...p.ideaIds, ideaId] };
            }
            return p;
          })
        };
      }
      return c;
    }));
  };

  const removeIdeaFromPhase = (campaignId: string, phaseId: string, ideaId: string) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId && c.phases) {
        return {
          ...c,
          phases: c.phases.map(p => {
            if (p.id === phaseId) {
              return { ...p, ideaIds: p.ideaIds.filter(id => id !== ideaId) };
            }
            return p;
          })
        };
      }
      return c;
    }));
  };

  const updateIdeaInPhase = (campaignId: string, phaseId: string, oldIdeaId: string, newIdeaId: string) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId && c.phases) {
        return {
          ...c,
          phases: c.phases.map(p => {
            if (p.id === phaseId) {
              return { 
                ...p, 
                ideaIds: p.ideaIds.map(id => id === oldIdeaId ? newIdeaId : id) 
              };
            }
            return p;
          })
        };
      }
      return c;
    }));
  };

  const moveIdeaBetweenPhases = (campaignId: string, fromPhaseId: string, toPhaseId: string, ideaId: string, newIndex: number) => {
    saveCampaigns(campaigns.map(c => {
      if (c.id === campaignId && c.phases) {
        const newPhases = [...c.phases];
        const fromPhaseIndex = newPhases.findIndex(p => p.id === fromPhaseId);
        const toPhaseIndex = newPhases.findIndex(p => p.id === toPhaseId);
        
        if (fromPhaseIndex === -1 || toPhaseIndex === -1) return c;

        // Remove from source
        newPhases[fromPhaseIndex] = {
          ...newPhases[fromPhaseIndex],
          ideaIds: newPhases[fromPhaseIndex].ideaIds.filter(id => id !== ideaId)
        };

        // Insert into destination
        const newIdeaIds = [...newPhases[toPhaseIndex].ideaIds];
        newIdeaIds.splice(newIndex, 0, ideaId);
        newPhases[toPhaseIndex] = {
          ...newPhases[toPhaseIndex],
          ideaIds: newIdeaIds
        };

        return { ...c, phases: newPhases };
      }
      return c;
    }));
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
    removeProjectFromCampaign,
    addIdeaToCampaign,
    removeIdeaFromCampaign,
    addPhase,
    updatePhaseOrder,
    deletePhase,
    renamePhase,
    addIdeaToPhase,
    removeIdeaFromPhase,
    updateIdeaInPhase,
    moveIdeaBetweenPhases
  };
}
