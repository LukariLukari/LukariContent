"use client";

import { useIdeas, Idea, PlatformType, ContentType } from "@/hooks/use-ideas";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  placeholder,
  className 
}: { 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string,
  className?: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly measure the new scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight + a little padding
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none bg-transparent border-transparent focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-2 text-sm rounded-md overflow-hidden min-h-[40px]",
        className
      )}
      rows={1}
    />
  );
};

const PLATFORMS: PlatformType[] = ["Gốc (TikTok/FB/Rednote)", "Reup (YT/Insta)", "Tất cả"];
const CONTENT_TYPES: ContentType[] = ["Storytelling", "Review", "Tutorial", "Drama", "Giải trí", "Khác"];

function SortableIdeaRow({ idea, index, onDeleteRequest, onUpdate }: { idea: Idea, index: number, onDeleteRequest: (id: string) => void, onUpdate: (id: string, field: keyof Idea, value: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "grid grid-cols-[40px_100px_120px_1fr_40px] divide-x divide-dashed divide-border/50 border-b items-stretch bg-card transition-colors group hover:bg-secondary/20",
        isDragging && "shadow-lg border-primary/50 bg-secondary"
      )}
    >
      <div className="flex flex-col items-center justify-start pt-4 px-2 text-muted-foreground gap-2">
        <button className="cursor-grab active:cursor-grabbing hover:text-foreground" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium">{index + 1}</span>
      </div>

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className={cn(
              "text-xs px-2 py-1.5 rounded-md border text-left flex justify-between items-center transition-colors hover:bg-secondary",
              idea.platform === "Gốc (TikTok/FB/Rednote)" ? "bg-blue-50/50 border-blue-200 text-blue-700" :
              idea.platform === "Reup (YT/Insta)" ? "bg-orange-50/50 border-orange-200 text-orange-700" :
              "bg-secondary/50 border-border text-foreground"
            )}>
              <span className="truncate pr-1">{idea.platform.split(' ')[0]}</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {PLATFORMS.map(p => (
              <DropdownMenuItem key={p} onClick={() => onUpdate(idea.id, "platform", p)}>
                {p}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="text-xs px-2 py-1.5 rounded-md border bg-background text-left flex justify-between items-center transition-colors hover:bg-secondary">
              <span className="truncate pr-1">{idea.contentType}</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[150px]">
            {CONTENT_TYPES.map(c => (
              <DropdownMenuItem key={c} onClick={() => onUpdate(idea.id, "contentType", c)}>
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-3">
        <div className="flex flex-col bg-background/50 rounded-lg border shadow-sm divide-y">
          {/* Hook */}
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400/80 uppercase px-2 py-1">Hook (3s đầu)</span>
            <AutoResizeTextarea 
              value={idea.hook} 
              onChange={(val) => onUpdate(idea.id, "hook", val)}
              placeholder="Câu hook thu hút..."
            />
          </div>

          {/* Nội dung */}
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400/80 uppercase px-2 py-1">Nội dung (Core)</span>
            <AutoResizeTextarea 
              value={idea.content} 
              onChange={(val) => onUpdate(idea.id, "content", val)}
              placeholder="Ý tưởng cốt lõi..."
              className="font-medium min-h-[60px]"
            />
          </div>

          {/* Kết (CTA) */}
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400/80 uppercase px-2 py-1">Kết (Lời kêu gọi - CTA) & Ghi chú</span>
            <AutoResizeTextarea 
              value={idea.details} 
              onChange={(val) => onUpdate(idea.id, "details", val)}
              placeholder="Chi tiết triển khai, góc máy, âm thanh..."
              className="text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDeleteRequest(idea.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function IdeasPage() {
  const { ideas, isLoaded, addIdea, deleteIdea, updateIdea, reorderIdeas } = useIdeas();
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = ideas.findIndex(i => i.id === active.id);
      const newIndex = ideas.findIndex(i => i.id === over?.id);
      reorderIdeas(arrayMove(ideas, oldIndex, newIndex));
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Ngân hàng ý tưởng
          </h1>
          <p className="text-muted-foreground mt-1">Lên ý tưởng và quản lý nội dung đa nền tảng (Gốc & Reup).</p>
        </div>
        <Button onClick={() => addIdea()} className="bg-asphalt text-paper hover:bg-[#1a1d1f] hover:scale-105 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Thêm Ý tưởng
        </Button>
      </div>

      <div className="flex-1 bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Scrollable Container */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[900px] flex flex-col h-full">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_100px_120px_1fr_40px] divide-x divide-dashed divide-border/50 bg-secondary/30 border-b text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-500 items-center sticky top-0 z-10">
              <div className="text-center p-3">STT</div>
              <div className="p-3">Nền tảng</div>
              <div className="p-3">Dạng Content</div>
              <div className="p-3">Chi tiết (Hook, Nội dung, Kết)</div>
              <div className="p-3"></div>
            </div>

            {/* Table Body */}
            <div className="flex-1">
              {ideas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mb-2 opacity-20" />
                  <p>Chưa có ý tưởng nào. Hãy tạo ý tưởng đầu tiên!</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={ideas} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col pb-12">
                      {ideas.map((idea, index) => (
                        <SortableIdeaRow 
                          key={idea.id} 
                          idea={idea} 
                          index={index} 
                          onDeleteRequest={setIdeaToDelete} 
                          onUpdate={updateIdea} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Add footer */}
        {ideas.length > 0 && (
          <div className="p-2 bg-secondary/20 border-t border-dashed">
            <Button variant="ghost" onClick={() => addIdea()} className="w-full text-muted-foreground hover:text-foreground">
              <Plus className="h-4 w-4 mr-2" /> Nhấn để thêm dòng mới
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!ideaToDelete} onOpenChange={(open) => !open && setIdeaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa ý tưởng này?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ý tưởng này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIdeaToDelete(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => {
              if (ideaToDelete) deleteIdea(ideaToDelete);
              setIdeaToDelete(null);
            }}>
              Xóa vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
