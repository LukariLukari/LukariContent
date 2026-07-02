"use client";

import { useState } from "react";
import { Campaign, CampaignPhase, useProjects } from "@/hooks/use-projects";
import { Idea } from "@/hooks/use-ideas";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2, Lightbulb, PenSquare, LayoutList, ChevronRight, ChevronDown, ArrowDown, Edit2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

const toRoman = (num: number): string => {
  const roman: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let str = '';
  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
};

const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
};

// Sortable Idea Item
function SortableIdeaItem({ idea, index, onRemove, onUpdateCustomIdea }: { idea: Idea, index: number, onRemove: () => void, onUpdateCustomIdea?: (oldId: string, newText: string) => void }) {
  const isCustom = idea.id.startsWith("custom:");
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editText, setEditText] = useState(stripHtml(idea.hook) || stripHtml(idea.content) || "");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idea.id,
    data: {
      type: "Idea",
      idea
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && onUpdateCustomIdea && isCustom) {
      onUpdateCustomIdea(idea.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-stretch gap-2 mb-2 group relative", isDragging && "opacity-50")}
    >
      <div className="flex items-center justify-center w-6 shrink-0 relative">
        {index > 0 && (
          <ArrowDown className="h-4 w-4 text-muted-foreground absolute -top-2 left-1/2 -translate-x-1/2" />
        )}
        <span className="text-base font-bold text-foreground/80">
          {index + 1}.
        </span>
      </div>
      <div
        className={cn(
          "flex flex-col p-3 rounded-md shadow-sm flex-1 overflow-hidden border",
          isCustom 
            ? "bg-muted/30 border-dashed border-muted-foreground/30 text-foreground" 
            : "bg-background border-l-[4px] !border-l-orange-500"
        )}
      >
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex items-start gap-2 overflow-hidden flex-1">
        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1 mr-2 bg-background border rounded-md p-1 shadow-sm mt-1 mb-1">
            <RichTextEditor 
              value={editText}
              onChange={setEditText}
              placeholder="Nhập nội dung..."
            />
            <div className="flex items-center justify-end gap-2 p-1 border-t">
              <Button type="button" variant="ghost" size="sm" className="h-7 px-3 text-xs" onClick={() => { setIsEditing(false); setEditText(idea.hook || idea.content || ""); }}>Hủy</Button>
              <Button type="button" size="sm" className="h-7 px-4 text-xs bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        ) : (
          <div 
            className={cn("flex-1 select-none group/text", !isCustom && "cursor-pointer")}
            onClick={() => { if (!isCustom) setIsExpanded(!isExpanded); }}
            title={isCustom ? undefined : "Nhấn để xem chi tiết"}
          >
            <div 
              className={cn(
                "text-sm break-words whitespace-pre-wrap transition-colors prose dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-sm", 
                isCustom ? "font-normal italic" : "group-hover/text:text-orange-500",
                !isExpanded && "line-clamp-2"
              )}
              dangerouslySetInnerHTML={{ __html: idea.hook || idea.content || "Ý tưởng trống" }}
            />
            {!isCustom && (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {idea.platform} • {idea.contentType}
                </p>
              </div>
            )}
          </div>
        )}
          </div>
          <div className="flex items-start gap-1 shrink-0 mt-0.5 pt-0.5">
            {isCustom && !isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
                onClick={() => setIsEditing(true)}
                title="Chỉnh sửa nội dung"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
              title="Gỡ khỏi lộ trình"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 p-1 rounded-md hover:bg-secondary" {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* EXPANDED SECTION */}
        {isExpanded && !isCustom && (
          <div className="flex flex-col mt-4 pt-4 border-t border-dashed gap-4 w-full cursor-default animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Hook (3s đầu)</span>
              <div 
                className="text-sm prose dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: idea.hook || "Chưa có nội dung" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Nội dung (Core)</span>
              <div 
                className="text-sm prose dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: idea.content || "Chưa có nội dung" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Kết (Lời kêu gọi - CTA) & Ghi chú</span>
              <div 
                className="text-sm prose dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-sm text-muted-foreground italic"
                dangerouslySetInnerHTML={{ __html: idea.details || "Chưa có ghi chú" }}
              />
            </div>
            
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" onClick={(e) => { e.stopPropagation(); window.open(`/ideas#idea-${idea.id}`, "_blank"); }}>
                Mở trong Ngân hàng ý tưởng
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable Phase List
function SortablePhase({ 
  phase, 
  index,
  ideas, 
  availableIdeas, 
  onAddIdea, 
  onRemoveIdea, 
  onDeletePhase, 
  onRenamePhase,
  onQuickAddIdea,
  onUpdateCustomIdea
}: { 
  phase: CampaignPhase, 
  index: number,
  ideas: Idea[], 
  availableIdeas: Idea[], 
  onAddIdea: (ideaId: string) => void,
  onRemoveIdea: (ideaId: string) => void,
  onDeletePhase: () => void,
  onRenamePhase: (name: string) => void,
  onQuickAddIdea: (text: string) => void,
  onUpdateCustomIdea: (oldId: string, newText: string) => void
}) {
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState(phase.name);
  const [isExpanded, setIsExpanded] = useState(true);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phase.id,
    data: {
      type: "Phase",
      phase,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameText.trim()) {
      onRenamePhase(renameText.trim());
      setIsRenaming(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-secondary/10 border rounded-lg overflow-hidden mb-4 group/phase transition-colors hover:border-orange-500/30",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      <div className="flex items-center justify-between py-2 px-3 bg-background border-b group/header">
        <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground shrink-0 -ml-1" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {isRenaming ? (
            <form onSubmit={handleRename} className="flex items-center gap-2 flex-1">
              <Input 
                autoFocus
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                className="h-7 text-sm"
              />
              <Button type="submit" size="sm" className="h-7 px-2 bg-orange-500 hover:bg-orange-600 text-white">Lưu</Button>
            </form>
          ) : (
            <h4 
              className="font-semibold text-sm truncate flex-1 cursor-pointer hover:text-orange-500 transition-colors"
              onClick={() => setIsRenaming(true)}
            >
              {toRoman(index + 1)}. {phase.name}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-xs font-semibold rounded-full bg-background hover:bg-secondary border-dashed"
            onClick={() => { setIsQuickAdding(true); setQuickAddText(""); }}
          >
            <PenSquare className="h-3 w-3 mr-1" /> Thêm nhanh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full border-none text-xs font-semibold transition-all hover:shadow-md h-7 px-3 bg-asphalt !text-white hover:bg-[#1a1d1f] shadow-sm">
              <Plus className="h-3 w-3 mr-1" /> Ý tưởng
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] max-h-[300px] overflow-y-auto">
              {availableIdeas.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Không còn ý tưởng trong ngân hàng.</div>
              ) : (
                availableIdeas.map(idea => (
                  <DropdownMenuItem key={idea.id} onClick={() => onAddIdea(idea.id)} className="flex flex-col items-start gap-1 p-2 cursor-pointer border-b last:border-0">
                    <span className="font-medium text-sm truncate w-full">{stripHtml(idea.hook) || stripHtml(idea.content) || "Ý tưởng trống"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{idea.platform} • {idea.contentType}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover/header:opacity-100 transition-opacity"
            onClick={onDeletePhase}
            title="Xóa lộ trình"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary shrink-0" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-2.5">
          <SortableContext items={phase.ideaIds} strategy={verticalListSortingStrategy}>
            <div className="min-h-[40px]">
              {phase.ideaIds.length === 0 ? (
                <div className="text-center py-4 border border-dashed rounded bg-background/50 text-muted-foreground">
                  <p className="text-xs">Trống</p>
                </div>
              ) : (
                phase.ideaIds.map((id, ideaIndex) => {
                  let idea: Idea;
                  if (id.startsWith("custom:")) {
                    const separatorIndex = id.indexOf("::");
                    idea = {
                      id,
                      hook: id.substring(separatorIndex + 2),
                      content: "",
                      platform: "Tất cả",
                      contentType: "Khác",
                      order: 0,
                      details: "",
                      createdAt: new Date().toISOString()
                    };
                  } else {
                    const found = ideas.find(i => i.id === id);
                    if (!found) return null;
                    idea = found;
                  }
                  return <SortableIdeaItem key={idea.id} idea={idea} index={ideaIndex} onRemove={() => onRemoveIdea(idea.id)} onUpdateCustomIdea={onUpdateCustomIdea} />;
                })
              )}
            </div>
          </SortableContext>
          
          {isQuickAdding && (
            <div className="mt-2 p-2 bg-background border border-orange-500/50 rounded shadow-sm">
              <Input 
                autoFocus
                placeholder="Nhập tiêu đề ý tưởng (Hook)..."
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickAddText.trim()) {
                    onQuickAddIdea(quickAddText.trim());
                    setIsQuickAdding(false);
                    setQuickAddText("");
                  } else if (e.key === "Escape") {
                    setIsQuickAdding(false);
                  }
                }}
                className="h-8 text-sm mb-2"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsQuickAdding(false)}>Hủy</Button>
                <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {
                  if (quickAddText.trim()) {
                    onQuickAddIdea(quickAddText.trim());
                    setIsQuickAdding(false);
                    setQuickAddText("");
                  }
                }}>Lưu</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CampaignBoard({ campaign, ideas, projects, useProjectsHook, useIdeasHook }: { campaign: Campaign, ideas: Idea[], projects: any[], useProjectsHook: any, useIdeasHook?: any }) {
  const { 
    addPhase, 
    updatePhaseOrder, 
    deletePhase, 
    renamePhase, 
    addIdeaToPhase, 
    removeIdeaFromPhase, 
    updateIdeaInPhase,
    moveIdeaBetweenPhases 
  } = useProjectsHook;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"Phase" | "Idea" | null>(null);

  // Dialog States
  const [isCreatePhaseOpen, setIsCreatePhaseOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");

  const [deletePhaseId, setDeletePhaseId] = useState<string | null>(null);

  const phases = campaign.phases || [];
  // Phục vụ UI kéo thả mượt mà, chúng ta nên clone phases ra một state local, nhưng ở đây có thể dùng trực tiếp nếu performance tốt.
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveType(event.active.data.current?.type);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (activeType === "Idea") {
      const activeId = String(active.id);
      const overId = String(over.id);

      // Find the containers
      const activePhase = phases.find(p => p.ideaIds.includes(activeId));
      const overPhase = phases.find(p => p.id === overId) || phases.find(p => p.ideaIds.includes(overId));

      if (!activePhase || !overPhase || activePhase.id === overPhase.id) {
        return; // Same phase, handled by dragEnd
      }

      // Move across phases (optimistic update needed for DndKit to show smooth cross-list drag, but for simplicity we rely on DragEnd or implement moveIdeaBetweenPhases here).
      // However, dragOver is fired constantly. Doing state updates here can cause flickering if not careful.
      // DndKit's official multi-list example updates state in DragOver.
      
      const activeIndex = activePhase.ideaIds.indexOf(activeId);
      let overIndex = overPhase.ideaIds.length;
      
      if (overPhase.ideaIds.includes(overId)) {
        overIndex = overPhase.ideaIds.indexOf(overId);
        // adjust index based on position
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        overIndex = overIndex >= 0 ? overIndex + modifier : overPhase.ideaIds.length + 1;
      }

      moveIdeaBetweenPhases(campaign.id, activePhase.id, overPhase.id, activeId, overIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (activeType === "Phase" && active.id !== over.id) {
      const oldIndex = phases.findIndex(p => p.id === active.id);
      const newIndex = phases.findIndex(p => p.id === over.id);
      updatePhaseOrder(campaign.id, arrayMove(phases, oldIndex, newIndex).map((p, i) => ({ ...p, order: i + 1 })));
      return;
    }

    if (activeType === "Idea") {
      const activeId = String(active.id);
      const overId = String(over.id);

      const activePhase = phases.find(p => p.ideaIds.includes(activeId));
      const overPhase = phases.find(p => p.id === overId) || phases.find(p => p.ideaIds.includes(overId));

      if (activePhase && overPhase && activePhase.id === overPhase.id) {
        const oldIndex = activePhase.ideaIds.indexOf(activeId);
        const newIndex = activePhase.ideaIds.indexOf(overId);
        if (oldIndex !== newIndex) {
          // It's just reordering within the same phase
          const newIdeaIds = arrayMove(activePhase.ideaIds, oldIndex, newIndex);
          // We need a function to update idea order in a phase. 
          // Re-using moveIdeaBetweenPhases for same phase works if we just modify it or we can add updatePhaseIdeaOrder.
          // For now, let's implement updatePhaseOrder directly:
          const updatedPhases = phases.map(p => p.id === activePhase.id ? { ...p, ideaIds: newIdeaIds } : p);
          updatePhaseOrder(campaign.id, updatedPhases);
        }
      }
    }
  };

  const handleCreatePhase = () => {
    if (newPhaseName.trim()) {
      addPhase(campaign.id, newPhaseName.trim());
      setIsCreatePhaseOpen(false);
      setNewPhaseName("");
    }
  };

  const handleDeletePhase = () => {
    if (deletePhaseId) {
      deletePhase(campaign.id, deletePhaseId);
      setDeletePhaseId(null);
    }
  };

  const campaignIdeaIds = phases.flatMap(p => p.ideaIds);
  const availableIdeas = ideas.filter(i => !campaignIdeaIds.includes(i.id));

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <LayoutList className="h-5 w-5 text-primary" /> Lộ trình chi tiết
        </h4>
        <Button onClick={() => setIsCreatePhaseOpen(true)} className="h-8 px-4 text-xs font-semibold rounded-full bg-orange-500 !text-white hover:bg-orange-600 border-none shadow-sm transition-all hover:shadow-md">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm Lộ trình
        </Button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed rounded-xl bg-secondary/10">
          <p className="text-muted-foreground mb-4">Chưa có lộ trình nào. Hãy phân chia chiến dịch thành các giai đoạn nhỏ.</p>
          <Button onClick={() => setIsCreatePhaseOpen(true)}>Tạo Lộ trình đầu tiên</Button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {phases.map((phase, index) => (
                <SortablePhase 
                  key={phase.id} 
                  phase={phase} 
                  index={index}
                  ideas={ideas}
                  availableIdeas={availableIdeas}
                  onAddIdea={(ideaId) => addIdeaToPhase(campaign.id, phase.id, ideaId)}
                  onRemoveIdea={(ideaId) => removeIdeaFromPhase(campaign.id, phase.id, ideaId)}
                  onDeletePhase={() => setDeletePhaseId(phase.id)}
                  onRenamePhase={(newName) => {
                    renamePhase(campaign.id, phase.id, newName);
                  }}
                  onQuickAddIdea={(text) => {
                    const customId = `custom:${Date.now()}::${text}`;
                    addIdeaToPhase(campaign.id, phase.id, customId);
                  }}
                  onUpdateCustomIdea={(oldId, newText) => {
                    const customId = `custom:${Date.now()}::${newText}`;
                    updateIdeaInPhase(campaign.id, phase.id, oldId, customId);
                  }}
                />
              ))}
            </div>
          </SortableContext>

          {/* Optional: Drag Overlay for smoother UI */}
          <DragOverlay>
            {activeId && activeType === "Phase" && (
              <div className="bg-secondary border border-primary rounded-xl p-4 opacity-80 shadow-2xl">
                <p className="font-bold">Đang di chuyển lộ trình...</p>
              </div>
            )}
            {activeId && activeType === "Idea" && (
              <div className="bg-background border-2 border-orange-500 rounded-md p-3 opacity-90 shadow-2xl">
                <p className="font-medium text-sm">Đang di chuyển ý tưởng...</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Dialogs */}
      <Dialog open={isCreatePhaseOpen} onOpenChange={setIsCreatePhaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Lộ trình mới</DialogTitle>
            <DialogDescription>
              Tạo một giai đoạn mới để phân loại ý tưởng (VD: Quay thử nghiệm, Đăng TikTok).
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={newPhaseName}
            onChange={(e) => setNewPhaseName(e.target.value)}
            placeholder="Nhập tên lộ trình..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreatePhase();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePhaseOpen(false)}>Hủy</Button>
            <Button onClick={handleCreatePhase}>Tạo Lộ trình</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletePhaseId} onOpenChange={(open) => !open && setDeletePhaseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Lộ trình</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa lộ trình này? Các ý tưởng bên trong sẽ KHÔNG bị xóa khỏi Ngân hàng ý tưởng, nhưng sẽ bị gỡ khỏi chiến dịch này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePhaseId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeletePhase}>Xóa Lộ trình</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
