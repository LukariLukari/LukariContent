"use client";

import { useState, useRef } from "react";
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
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Type, MessageSquare, MoveDown, Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

import { useProjects, ScriptBlock } from "@/hooks/use-projects";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

function SortableBlock({ block, index, onDelete, onUpdateTime, onUpdateField, onInsertAfter }: { block: any, index: number, onDelete: (id: string) => void, onUpdateTime: (id: string, newTime: string) => void, onUpdateField: (id: string, field: string, value: string) => void, onInsertAfter: (index: number) => void }) {
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
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group h-full"
    >
      <Card className={`relative h-full flex flex-col ${isDragging ? 'shadow-2xl border-primary ring-2 ring-primary/20' : 'shadow-md hover:border-border/80'}`}>
        <div className="absolute left-[-36px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-10 w-10 cursor-grab" {...attributes} {...listeners}>
            <GripVertical className="h-6 w-6 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="p-6 flex flex-col flex-1 gap-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center bg-asphalt text-paper h-10 px-3 rounded-full text-base font-bold shadow-sm whitespace-nowrap">
                Scene {index + 1}
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
                <RichTextEditor 
                  value={block.camera} 
                  onChange={(value) => onUpdateField(block.id, 'camera', value)}
                  placeholder="Nhập góc máy và phụ đề..."
                  className="text-base bg-transparent min-h-[80px]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2 tracking-wider"><MoveDown className="h-4 w-4"/> Hành động & Cảm xúc</label>
                <RichTextEditor 
                  value={block.action} 
                  onChange={(value) => onUpdateField(block.id, 'action', value)}
                  placeholder="Nhập hành động và cảm xúc..."
                  className="text-base bg-transparent min-h-[80px]" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2 tracking-wider"><MessageSquare className="h-4 w-4"/> Thoại / Lồng tiếng</label>
              <RichTextEditor 
                value={block.dialogue} 
                onChange={(value) => onUpdateField(block.id, 'dialogue', value)}
                placeholder="Nhập lời thoại hoặc kịch bản lồng tiếng..."
                className="min-h-[140px] text-base lg:text-lg bg-primary/5 border-primary/20 focus-within:ring-primary/30" 
              />
            </div>
          </div>
        </div>
      </Card>

      <div 
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50" 
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button 
          variant="secondary" 
          size="sm" 
          className="rounded-full shadow-lg border border-border flex items-center gap-1 hover:scale-110 hover:bg-secondary transition-transform duration-200 text-xs h-8 px-4 font-semibold"
          onClick={(e) => {
            e.preventDefault();
            onInsertAfter(index);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Thêm cảnh dưới
        </Button>
      </div>
    </div>
  );
}

export function TimelineBuilder({ projectId }: { projectId: string }) {
  const { getProject, updateProjectBlocks, updateProjectName, updateProjectDescription, isLoaded } = useProjects();
  const project = getProject(projectId);
  const blocks = project?.blocks || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const insertBlockAfter = (index: number) => {
    const newId = `block-${Date.now()}`;
    const newBlock = {
      id: newId,
      time: "Xs - Ys",
      visual: "",
      action: "",
      dialogue: "",
      camera: "",
      caption: "",
      emotion: ""
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const updateTime = (id: string, newTime: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, time: newTime } : b));
  };

  const updateField = (id: string, field: string, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const exportAsImage = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      // Step 1: Fetch Google Fonts CSS (must use browser-like User-Agent to get woff2 URLs)
      const cssUrl = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
      const cssResponse = await fetch(cssUrl);
      let fontCss = await cssResponse.text();

      // Step 2: Find ALL woff2 font file URLs in the CSS (each subset has its own file)
      const fontUrlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
      const fontUrls = new Set<string>();
      let match;
      while ((match = fontUrlRegex.exec(fontCss)) !== null) {
        fontUrls.add(match[1]);
      }

      // Step 3: Download each font file and convert to base64 data URL
      for (const url of fontUrls) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        // Replace the external URL with inline base64 data URL
        fontCss = fontCss.replaceAll(url, `data:font/woff2;base64,${base64}`);
      }

      // Step 4: Add a global override to force Montserrat on all elements
      fontCss += `\n* { font-family: 'Montserrat', sans-serif !important; }`;

      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: '#F7F3EE',
        pixelRatio: 2,
        fontEmbedCSS: fontCss,
        style: {
          fontFamily: "'Montserrat', sans-serif",
        }
      });
      const link = document.createElement("a");
      link.download = `${project?.name || "kich-ban"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Lỗi xuất ảnh:", error);
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex items-center gap-3">
          <Button onClick={exportAsImage} disabled={isExporting} variant="outline" size="lg" className="h-12 px-6 text-base font-medium">
            {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            Xuất Ảnh
          </Button>
          <Button onClick={addBlock} size="lg" className="h-12 px-6 text-base font-medium">
            <Plus className="mr-2 h-5 w-5" /> Thêm Phân Cảnh
          </Button>
        </div>
      </div>

      <div className={`px-8 py-8 md:px-12 md:py-10 ${montserrat.className}`} ref={containerRef}>
        <div className="bg-paper p-6 md:p-8 rounded-2xl border border-border/40 shadow-sm">
          <DndContext 
          id="dnd-context"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={blocks}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-12 gap-x-12 pb-8">
              {blocks.map((block, index) => (
                <SortableBlock 
                  key={block.id} 
                block={block} 
                index={index} 
                onDelete={deleteBlock} 
                onUpdateTime={updateTime} 
                onUpdateField={updateField} 
                onInsertAfter={insertBlockAfter}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        </div>
      </div>
    </div>
  );
}
