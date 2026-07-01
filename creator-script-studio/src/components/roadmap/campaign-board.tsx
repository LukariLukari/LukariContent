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
import { Plus, GripVertical, Trash2, Lightbulb, ChevronRight, PenSquare, LayoutList, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Sortable Idea Item
function SortableIdeaItem({ idea, onRemove }: { idea: Idea, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idea.id,
    data: {
      type: "Idea",
      idea,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-3 mb-2 bg-background border border-l-4 border-l-orange-500 rounded-md shadow-sm group",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div 
          className="flex-1 truncate pr-2 cursor-pointer select-none group/text"
          onClick={() => window.open("/ideas", "_blank")}
          title="Đến Ngân hàng ý tưởng"
        >
          <p className="text-sm font-medium truncate group-hover/text:text-orange-500 transition-colors">
            {idea.hook || idea.content || "Ý tưởng trống"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {idea.platform} • {idea.contentType}
            </p>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
        title="Gỡ khỏi lộ trình"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Sortable Phase List
function SortablePhase({ 
  phase, 
  ideas, 
  availableIdeas, 
  onAddIdea, 
  onRemoveIdea, 
  onDeletePhase, 
  onRenamePhase 
}: { 
  phase: CampaignPhase, 
  ideas: Idea[], 
  availableIdeas: Idea[], 
  onAddIdea: (ideaId: string) => void,
  onRemoveIdea: (ideaId: string) => void,
  onDeletePhase: () => void,
  onRenamePhase: () => void
}) {
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

  const phaseIdeas = phase.ideaIds.map(id => ideas.find(i => i.id === id)).filter(Boolean) as Idea[];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-secondary/20 border border-dashed rounded-xl p-4 mb-4",
        isDragging && "opacity-50 border-primary"
      )}
    >
      <div className="flex items-center justify-between mb-4 group/header">
        <div className="flex items-center gap-2">
          <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{phase.order}. {phase.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover/header:opacity-100 transition-opacity"
              onClick={onRenamePhase}
            >
              <PenSquare className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full border-none text-xs font-semibold transition-all hover:shadow-md h-8 px-4 bg-asphalt !text-white hover:bg-[#1a1d1f] shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Thêm Ý tưởng
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] max-h-[300px] overflow-y-auto">
              {availableIdeas.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">Không còn ý tưởng nào trong Ngân hàng</div>
              ) : (
                availableIdeas.map(idea => (
                  <DropdownMenuItem key={idea.id} onClick={() => onAddIdea(idea.id)} className="flex flex-col items-start gap-1 p-2 cursor-pointer border-b last:border-0">
                    <span className="font-medium text-sm truncate w-full">{idea.hook || idea.content || "Ý tưởng trống"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{idea.platform} • {idea.contentType}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onDeletePhase}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pl-8">
        <SortableContext items={phase.ideaIds} strategy={verticalListSortingStrategy}>
          <div className="min-h-[50px]">
            {phaseIdeas.length === 0 ? (
              <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-md bg-background/50 text-center flex flex-col items-center justify-center gap-2">
                <Lightbulb className="h-5 w-5 opacity-20" />
                Chưa có ý tưởng nào trong lộ trình này.
              </div>
            ) : (
              phaseIdeas.map(idea => (
                <SortableIdeaItem 
                  key={idea.id} 
                  idea={idea} 
                  onRemove={() => onRemoveIdea(idea.id)} 
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export function CampaignBoard({ campaign, ideas, projects, useProjectsHook }: { campaign: Campaign, ideas: Idea[], projects: any[], useProjectsHook: any }) {
  const { addPhase, updatePhaseOrder, deletePhase, renamePhase, addIdeaToPhase, removeIdeaFromPhase, moveIdeaBetweenPhases } = useProjectsHook;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"Phase" | "Idea" | null>(null);

  // Dialog States
  const [isCreatePhaseOpen, setIsCreatePhaseOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  
  const [renamePhaseId, setRenamePhaseId] = useState<string | null>(null);
  const [renamePhaseName, setRenamePhaseName] = useState("");

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

  const handleRenamePhase = () => {
    if (renamePhaseId && renamePhaseName.trim()) {
      renamePhase(campaign.id, renamePhaseId, renamePhaseName.trim());
      setRenamePhaseId(null);
      setRenamePhaseName("");
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
              {phases.map(phase => (
                <SortablePhase 
                  key={phase.id} 
                  phase={phase} 
                  ideas={ideas}
                  availableIdeas={availableIdeas}
                  onAddIdea={(ideaId) => addIdeaToPhase(campaign.id, phase.id, ideaId)}
                  onRemoveIdea={(ideaId) => removeIdeaFromPhase(campaign.id, phase.id, ideaId)}
                  onDeletePhase={() => setDeletePhaseId(phase.id)}
                  onRenamePhase={() => {
                    setRenamePhaseId(phase.id);
                    setRenamePhaseName(phase.name);
                  }}
                />
              ))}
            </div>
          </SortableContext>

          {/* Optional: Drag Overlay for smoother UI */}
          <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ sideEffects: ['default'] })}>
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

      <Dialog open={!!renamePhaseId} onOpenChange={(open) => !open && setRenamePhaseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên Lộ trình</DialogTitle>
          </DialogHeader>
          <Input 
            value={renamePhaseName}
            onChange={(e) => setRenamePhaseName(e.target.value)}
            placeholder="Nhập tên mới..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenamePhase();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamePhaseId(null)}>Hủy</Button>
            <Button onClick={handleRenamePhase}>Lưu thay đổi</Button>
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
