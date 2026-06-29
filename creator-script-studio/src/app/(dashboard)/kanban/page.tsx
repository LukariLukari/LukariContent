"use client";

import { useProjects, ProjectStatus } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { cn } from "@/lib/utils";

const COLUMNS: { id: ProjectStatus; title: string; color: string }[] = [
  { id: "idea", title: "Ý tưởng", color: "bg-blue-500/10 border-blue-500/20 text-blue-500" },
  { id: "scripting", title: "Kịch bản", color: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
  { id: "pre_production", title: "Chuẩn bị", color: "bg-amber-500/10 border-amber-500/20 text-amber-500" },
  { id: "filming", title: "Đang quay", color: "bg-rose-500/10 border-rose-500/20 text-rose-500" },
  { id: "post_production", title: "Hậu kỳ", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" },
  { id: "review", title: "Chờ duyệt", color: "bg-orange-500/10 border-orange-500/20 text-orange-500" },
  { id: "published", title: "Đã đăng", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
];

function SortableItem({ id, project, onClick }: { id: string, project: any, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 cursor-pointer touch-none",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      <Card className="hover:border-primary/50 transition-colors shadow-sm">
        <CardContent className="p-3 flex items-start gap-2">
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium leading-none mb-1.5">{project.name}</h4>
            <div className="flex items-center text-[10px] text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KanbanPage() {
  const { projects, isLoaded, createProject, updateProjectStatus } = useProjects();
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  }

  const handleCreate = () => {
    const id = createProject("Ý tưởng mới");
    router.push(`/projects/${id}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    // Is it dropping on a column?
    const isColumn = COLUMNS.some(c => c.id === overId);
    
    if (isColumn) {
      updateProjectStatus(projectId, overId as ProjectStatus);
      return;
    }

    // Dropping on an item
    const overProject = projects.find(p => p.id === overId);
    if (overProject) {
      updateProjectStatus(projectId, overProject.status || "idea");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tiến độ Sản xuất</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý vòng đời nội dung.</p>
        </div>
        <Button onClick={handleCreate} className="bg-asphalt text-paper hover:bg-[#1a1d1f] hover:scale-105 hover:shadow-md transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" /> Thêm Ý tưởng
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start w-max">
            {COLUMNS.map((column) => {
              const columnProjects = projects.filter(p => (p.status || "idea") === column.id);
              
              return (
                <div key={column.id} className="flex flex-col bg-muted/30 rounded-xl border w-72 h-full">
                  <div className={cn("p-3 border-b rounded-t-xl font-medium flex justify-between items-center", column.color)}>
                    <span>{column.title}</span>
                    <span className="text-xs bg-background/50 px-2 py-0.5 rounded-full">{columnProjects.length}</span>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto">
                    <SortableContext
                      id={column.id}
                      items={columnProjects.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="min-h-[200px]" id={column.id}>
                        {columnProjects.map(project => (
                          <SortableItem 
                            key={project.id} 
                            id={project.id} 
                            project={project} 
                            onClick={() => router.push(`/projects/${project.id}`)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-80">
                <Card className="shadow-lg border-primary">
                  <CardContent className="p-3">
                    <h4 className="text-sm font-medium leading-none">{projects.find(p => p.id === activeId)?.name}</h4>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
