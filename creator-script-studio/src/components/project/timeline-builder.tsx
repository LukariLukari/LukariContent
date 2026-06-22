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

function SortableBlock({ block, index, onDelete, onUpdateTime }: { block: any, index: number, onDelete: (id: string) => void, onUpdateTime: (id: string, newTime: string) => void }) {
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
      className={`mb-4 relative group ${isDragging ? 'shadow-xl border-primary ring-1 ring-primary/20' : 'shadow-sm hover:border-border/80'}`}
    >
      <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-asphalt text-paper h-6 w-6 rounded-full text-xs font-bold">
              {index + 1}
            </div>
            <input
              type="text"
              value={block.time}
              onChange={(e) => onUpdateTime(block.id, e.target.value)}
              className="text-xs font-semibold bg-secondary/50 text-foreground px-2.5 py-1 rounded-md border border-border/50 shadow-sm w-24 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => onDelete(block.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 tracking-wider"><Eye className="h-3.5 w-3.5"/> Hình ảnh</label>
                <Textarea defaultValue={block.visual} className="min-h-[60px] text-sm resize-none bg-transparent" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 tracking-wider"><MessageSquare className="h-3.5 w-3.5"/> Thoại / Lồng tiếng</label>
                <Textarea defaultValue={block.dialogue} className="min-h-[60px] text-sm resize-none bg-primary/5 border-primary/20 focus-visible:ring-primary/30" />
             </div>
          </div>
          <div className="space-y-3">
             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 tracking-wider"><MoveDown className="h-3.5 w-3.5"/> Hành động & Cảm xúc</label>
                <Textarea defaultValue={`${block.action} (${block.emotion})`} className="min-h-[60px] text-sm resize-none bg-transparent" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 tracking-wider"><Type className="h-3.5 w-3.5"/> Phụ đề & Góc máy</label>
                <Textarea defaultValue={`[${block.camera}]\n"${block.caption}"`} className="min-h-[60px] text-sm resize-none bg-transparent" />
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TimelineBuilder({ projectId }: { projectId: string }) {
  const { getProject, updateProjectBlocks, isLoaded } = useProjects();
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

  if (!isLoaded || !project) {
    return <div className="text-muted-foreground p-8 text-center">Đang tải kịch bản...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold">{project.name}</h2>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp lại phân cảnh. Yêu cầu AI Copilot tạo hoặc viết lại các khối.</p>
        </div>
        <Button onClick={addBlock}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Phân Cảnh
        </Button>
      </div>

      <div className="pl-6 py-4">
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
              <SortableBlock key={block.id} block={block} index={index} onDelete={deleteBlock} onUpdateTime={updateTime} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
