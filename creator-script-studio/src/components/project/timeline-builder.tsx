"use client";

import { useState } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Eye, Type, MessageSquare, MoveDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useProjects, ScriptBlock } from "@/hooks/use-projects";

function SortableBlock({ block, index, onDelete, onUpdateTime, onUpdateField }: { block: any, index: number, onDelete: (id: string) => void, onUpdateTime: (id: string, newTime: string) => void, onUpdateField: (id: string, field: string, value: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`mb-6 relative group ${isDragging ? 'shadow-2xl border-primary ring-2 ring-primary/20' : 'shadow-md hover:border-border/80'}`}
    >
      <div className="absolute left-[-36px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-10 w-10 cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-6 w-6 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center bg-asphalt text-paper h-10 w-10 rounded-full text-base font-bold shadow-sm">
              {index + 1}
            </div>
            <input
              type="text"
              value={block.time}
              onChange={(e) => onUpdateTime(block.id, e.target.value)}
              className="text-base font-semibold bg-secondary/50 text-foreground px-4 py-2 rounded-md border border-border/50 shadow-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => onDelete(block.id)}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2 tracking-wider"><Type className="h-4 w-4"/> Phụ đề & Góc máy</label>
              <Textarea 
                value={block.camera} 
                onChange={(e) => onUpdateField(block.id, 'camera', e.target.value)}
                placeholder="Nhập góc máy và phụ đề..."
                className="min-h-[80px] text-base resize-none bg-transparent" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2 tracking-wider"><MoveDown className="h-4 w-4"/> Hành động & Cảm xúc</label>
              <Textarea 
                value={block.action} 
                onChange={(e) => onUpdateField(block.id, 'action', e.target.value)}
                placeholder="Nhập hành động và cảm xúc..."
                className="min-h-[80px] text-base resize-none bg-transparent" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2 tracking-wider"><MessageSquare className="h-4 w-4"/> Thoại / Lồng tiếng</label>
            <Textarea 
              value={block.dialogue} 
              onChange={(e) => onUpdateField(block.id, 'dialogue', e.target.value)}
              placeholder="Nhập lời thoại hoặc kịch bản lồng tiếng..."
              className="min-h-[140px] text-base lg:text-lg resize-none bg-primary/5 border-primary/20 focus-visible:ring-primary/30" 
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TimelineBuilder({ projectId }: { projectId: string }) {
  const { getProject, updateProjectBlocks, updateProjectName, updateProjectDescription, isLoaded } = useProjects();
  const project = getProject(projectId);
  const blocks = project?.blocks || [];

  const setBlocks = (newBlocks: ScriptBlock[] | ((prev: ScriptBlock[]) => ScriptBlock[])) => {
    if (typeof newBlocks === "function") {
      updateProjectBlocks(projectId, newBlocks(blocks));
    } else {
      updateProjectBlocks(projectId, newBlocks);
    }
  };

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = () => {
    const newId = `block-${Date.now()}`;
    setBlocks([...blocks, {
      id: newId,
      time: "Xs - Ys",
      visual: "",
      action: "",
      dialogue: "",
      camera: "",
      caption: "",
      emotion: ""
    }]);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateTime = (id: string, newTime: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, time: newTime } : b));
  };

  const updateField = (id: string, field: string, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  if (!isLoaded || !project) {
    return <div className="text-muted-foreground p-8 text-center">Đang tải kịch bản...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b">
        <div>
          <input 
            type="text"
            value={project.name}
            onChange={(e) => updateProjectName(project.id, e.target.value)}
            className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 -ml-1 w-full max-w-2xl tracking-tight"
            placeholder="Tên kịch bản..."
          />
          <input 
            type="text"
            value={project.description ?? "Kéo thả để sắp xếp lại phân cảnh. Yêu cầu AI Copilot tạo hoặc viết lại các khối."}
            onChange={(e) => updateProjectDescription(project.id, e.target.value)}
            className="text-base lg:text-lg text-muted-foreground mt-2 bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 -ml-1 w-full max-w-3xl block"
            placeholder="Mô tả kịch bản..."
          />
        </div>
        <Button onClick={addBlock} size="lg" className="h-12 px-6 text-base font-medium">
          <Plus className="mr-2 h-5 w-5" /> Thêm Phân Cảnh
        </Button>
      </div>

      <div className="pl-8 py-6">
        <DndContext 
          id="dnd-context"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={blocks}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, index) => (
              <SortableBlock 
                key={block.id} 
                block={block} 
                index={index} 
                onDelete={deleteBlock} 
                onUpdateTime={updateTime} 
                onUpdateField={updateField} 
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
