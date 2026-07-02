"use client";

import { useIdeas, Idea, PlatformType, ContentType } from "@/hooks/use-ideas";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
      id={`idea-${idea.id}`}
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "grid grid-cols-[40px_140px_1fr_40px] divide-x divide-dashed divide-border/50 border rounded-xl shadow-md items-stretch bg-card transition-all group hover:border-orange-500/30 hover:shadow-lg overflow-hidden",
        isDragging && "shadow-2xl border-primary/50 bg-secondary ring-2 ring-primary/20 scale-[1.01]"
      )}
    >
      <div className="flex flex-col items-center justify-start pt-4 px-2 text-muted-foreground gap-2">
        <button className="cursor-grab active:cursor-grabbing hover:text-foreground" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium">{index + 1}</span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className={cn(
              "text-xs px-2 py-1.5 rounded-md border text-left flex justify-between items-center transition-colors hover:bg-secondary",
              idea.platform === "Gốc (TikTok/FB/Rednote)" ? "bg-blue-50/50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" :
              idea.platform === "Reup (YT/Insta)" ? "bg-orange-50/50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400" :
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
            <RichTextEditor 
              value={idea.hook} 
              onChange={(val) => onUpdate(idea.id, "hook", val)}
              placeholder="Câu hook thu hút..."
              className="border-none shadow-none rounded-none bg-transparent mt-1"
            />
          </div>

          {/* Nội dung */}
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400/80 uppercase px-2 py-1">Nội dung (Core)</span>
            <RichTextEditor 
              value={idea.content} 
              onChange={(val) => onUpdate(idea.id, "content", val)}
              placeholder="Ý tưởng cốt lõi..."
              className="border-none shadow-none rounded-none bg-transparent mt-1"
            />
          </div>

          {/* Kết (CTA) */}
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400/80 uppercase px-2 py-1">Kết (Lời kêu gọi - CTA) & Ghi chú</span>
            <RichTextEditor 
              value={idea.details} 
              onChange={(val) => onUpdate(idea.id, "details", val)}
              placeholder="Chi tiết triển khai, góc máy, âm thanh..."
              className="border-none shadow-none rounded-none bg-transparent mt-1"
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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.max(1, Math.ceil(ideas.length / ITEMS_PER_PAGE));
  const currentIdeas = ideas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [ideas.length, currentPage, totalPages]);

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

  useEffect(() => {
    if (isLoaded && ideas.length > 0) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#idea-')) {
        const id = hash.substring(1);
        // Find which page the idea is on
        const ideaIndex = ideas.findIndex(i => `idea-${i.id}` === id);
        if (ideaIndex !== -1) {
          const targetPage = Math.floor(ideaIndex / ITEMS_PER_PAGE) + 1;
          if (currentPage !== targetPage) {
            setCurrentPage(targetPage);
          }
        }
        
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-orange-500', 'ring-offset-2', 'transition-all');
            setTimeout(() => el.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-2'), 2500);
          }
        }, 300);
      }
    }
  }, [isLoaded, ideas.length, currentPage]);

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
            {/* Table Header */}
            <div className="grid grid-cols-[40px_140px_1fr_40px] divide-x divide-dashed divide-border/50 bg-secondary/30 border-b text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-500 items-center sticky top-0 z-10 mx-2 mt-2 rounded-t-xl border-x border-t">
              <div className="text-center p-3">STT</div>
              <div className="p-3">Nền tảng & Content</div>
              <div className="p-3">Chi tiết (Hook, Nội dung, Kết)</div>
              <div className="p-3"></div>
            </div>

            {/* Quick Add Top */}
            <div className="p-2 bg-secondary/5 border-b">
              <Button variant="ghost" onClick={() => { addIdea(); setCurrentPage(1); }} className="w-full text-muted-foreground hover:text-foreground border border-dashed hover:border-solid hover:bg-secondary">
                <Plus className="h-4 w-4 mr-2" /> Nhấn để thêm dòng mới
              </Button>
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
                  <SortableContext items={currentIdeas} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col pb-4 gap-4 pt-4 bg-secondary/5 px-2">
                      {currentIdeas.map((idea, index) => (
                        <SortableIdeaRow 
                          key={idea.id} 
                          idea={idea} 
                          index={(currentPage - 1) * ITEMS_PER_PAGE + index} 
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
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 bg-card border-t text-sm">
            <span className="text-muted-foreground">Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, ideas.length)} trên tổng {ideas.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Trước
              </Button>
              <span className="px-3 py-1 font-medium bg-secondary rounded-md text-foreground">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Sau
              </Button>
            </div>
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
