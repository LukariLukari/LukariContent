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
import { GripVertical, Plus, Trash2, Type, MessageSquare, MoveDown, Download, Loader2, ChevronDown, Copy, Check, ListTodo, BarChart, Wand2 } from "lucide-react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Edit2, Sparkles } from "lucide-react";

import { useProjects, ScriptBlock, ProjectTask, ProjectMetrics } from "@/hooks/use-projects";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

const stripHtml = (html: string) => {
  if (!html) return "";
  let text = html.replace(/<br\s*[\/]?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  const tmp = document.createElement("DIV");
  tmp.innerHTML = text;
  return (tmp.textContent || tmp.innerText || "").trim().replace(/\n{2,}/g, "\n");
};

function SortableBlock({ block, index, onDelete, onUpdateTime, onUpdateField, onInsertAfter, onExportScene, onCopyScene }: { block: any, index: number, onDelete: (id: string) => void, onUpdateTime: (id: string, newTime: string) => void, onUpdateField: (id: string, field: string, value: string) => void, onInsertAfter: (index: number) => void, onExportScene: (id: string, index: number) => void, onCopyScene: (id: string) => Promise<void> }) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');

  const handleCopy = async () => {
    if (copyState === 'copying') return;
    setCopyState('copying');
    await onCopyScene(block.id);
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 2000);
  };

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
      <Card id={`scene-card-${block.id}`} className={`relative h-full flex flex-col ${isDragging ? 'shadow-2xl border-primary ring-2 ring-primary/20' : 'shadow-md hover:border-border/80'}`}>
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={handleCopy} title="Copy ảnh cảnh này" disabled={copyState === 'copying'}>
                {copyState === 'copied' ? <Check className="h-5 w-5 text-green-500" /> : copyState === 'copying' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Copy className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => onExportScene(block.id, index)} title="Tải ảnh cảnh này">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => onDelete(block.id)} title="Xóa cảnh này">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
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
  const [showDescription, setShowDescription] = useState(!!project?.description);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const handleParseJSON = () => {
    if (!project?.description) return;
    
    try {
      // Try to extract JSON array from text
      const match = project.description.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        const data = JSON.parse(match[0]);
        if (Array.isArray(data) && data.length > 0) {
          const newBlocks = data.map((item, index) => ({
            id: `block-ai-${Date.now()}-${index}`,
            time: item.time || "Xs - Ys",
            camera: item.camera || "",
            action: item.action || "",
            dialogue: item.dialogue || "",
            visual: "",
            caption: "",
            emotion: ""
          }));
          
          if (confirm(`Tìm thấy ${newBlocks.length} phân cảnh. Bạn muốn ghi đè toàn bộ kịch bản hiện tại (OK) hay thêm vào cuối (Cancel)?`)) {
            setBlocks(newBlocks);
          } else {
            setBlocks([...blocks, ...newBlocks]);
          }
          setIsEditingDesc(false);
          return;
        }
      }
      alert("Không tìm thấy dữ liệu JSON hợp lệ trong đoạn văn bản. Vui lòng đảm bảo bạn copy chuẩn mảng JSON [ { ... } ].");
    } catch (e) {
      console.error(e);
      alert("Lỗi phân tích JSON. Vui lòng kiểm tra lại cú pháp.");
    }
  };

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

  const generateImageWithFonts = async (node: HTMLElement, filename: string, returnDataOnly = false) => {
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

      const dataUrl = await toPng(node, {
        backgroundColor: '#F7F3EE',
        pixelRatio: 2,
        fontEmbedCSS: fontCss,
        style: {
          fontFamily: "'Montserrat', sans-serif",
          margin: '0',
        }
      });
      if (returnDataOnly) {
        return dataUrl;
      }
      saveAs(dataUrl, filename);
      return null;
    } catch (error) {
      console.error("Lỗi xuất ảnh:", error);
      return null;
    }
  };

  const exportAsImage = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      await generateImageWithFonts(containerRef.current, `${project?.name || "kich-ban"}.png`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportSceneAsImage = async (id: string, index: number) => {
    const node = document.getElementById(`scene-card-${id}`);
    if (!node) return;
    setIsExporting(true);
    try {
      await generateImageWithFonts(node, `Scene ${index + 1} - ${project?.name || "Kịch bản"}.png`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllScenesAsImages = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const node = document.getElementById(`scene-card-${block.id}`);
        if (node) {
          const dataUrl = await generateImageWithFonts(node, "", true);
          if (dataUrl) {
            const base64Data = dataUrl.split(',')[1];
            zip.file(`Scene ${i + 1} - ${project?.name || "Kịch bản"}.png`, base64Data, {base64: true});
          }
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${project?.name || "Kịch bản"} - All Scenes.zip`);
    } catch (error) {
      console.error("Lỗi tạo zip:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const copySceneToClipboard = async (id: string) => {
    const node = document.getElementById(`scene-card-${id}`);
    if (!node) return;
    try {
      const dataUrl = await generateImageWithFonts(node, "", true);
      if (dataUrl) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      }
    } catch (error) {
      console.error("Lỗi copy:", error);
    }
  };

  const exportAsExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Kịch Bản");

      worksheet.columns = [
        { header: "SCENE", key: "scene", width: 12 },
        { header: "TIMELINE", key: "timeline", width: 15 },
        { header: "PHỤ ĐỀ & GÓC MÁY", key: "camera", width: 35 },
        { header: "HÀNH ĐỘNG & CẢM XÚC", key: "action", width: 35 },
        { header: "THOẠI", key: "dialogue", width: 65 },
      ];

      blocks.forEach((block, index) => {
        worksheet.addRow({
          scene: `SCENE ${index + 1}`,
          timeline: block.time || "",
          camera: stripHtml(block.camera || ""),
          action: stripHtml(block.action || ""),
          dialogue: stripHtml(block.dialogue || "")
        });
      });

      // Format headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      
      // Wrap text for all rows
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { wrapText: true, vertical: "top" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `${project?.name || "kich-ban"}.xlsx`);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
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
          <div className="flex items-center gap-4 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className={showDescription ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-500/50" : "bg-orange-50/50 text-orange-600 border-orange-100 hover:bg-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50 dark:hover:bg-orange-900/40"}
            >
              <Sparkles className="mr-2 h-4 w-4" /> 
              {showDescription ? "Đóng Kế Hoạch AI" : "Kế Hoạch AI / Ý tưởng"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTasks(!showTasks)}
              className={showTasks ? "bg-blue-100 text-blue-700 border-blue-200" : "text-blue-600 hover:bg-blue-50 border-blue-100"}
            >
              <ListTodo className="mr-2 h-4 w-4" /> Checklist
            </Button>

            {project.status === "published" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
                className={showMetrics ? "bg-pink-100 text-pink-700 border-pink-200" : "text-pink-600 hover:bg-pink-50 border-pink-100"}
              >
                <BarChart className="mr-2 h-4 w-4" /> Chỉ số
              </Button>
            )}

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Trạng thái:</span>
              <select 
                value={project.status || "idea"}
                onChange={(e) => updateProjectStatus(project.id, e.target.value as any)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                <option value="idea">Ý tưởng</option>
                <option value="scripting">Kịch bản</option>
                <option value="pre_production">Chuẩn bị</option>
                <option value="filming">Đang quay</option>
                <option value="post_production">Hậu kỳ</option>
                <option value="review">Chờ duyệt</option>
                <option value="published">Đã đăng</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Ngày đăng:</span>
              <input 
                type="date"
                value={project.publishDate || ""}
                onChange={(e) => updateProjectPublishDate(project.id, e.target.value || undefined)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="h-12 px-4 text-base font-medium bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            AI Trợ lý (Sắp ra mắt)
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button disabled={isExporting} variant="outline" size="lg" className="h-12 px-6 text-base font-medium" />}>
              {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
              Xuất Ảnh
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={exportAsImage}>
                <Download className="mr-2 h-4 w-4" />
                <span>Xuất toàn bộ kịch bản</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAllScenesAsImages}>
                <Download className="mr-2 h-4 w-4" />
                <span>Xuất lẻ từng phân cảnh</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportAsExcel}>
                <Download className="mr-2 h-4 w-4" />
                <span>Xuất ra Excel (.xlsx)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={addBlock} size="lg" className="h-12 px-6 text-base font-medium">
            <Plus className="mr-2 h-5 w-5" /> Thêm Phân Cảnh
          </Button>
        </div>
      </div>

      {showDescription && (
        <div className="mx-8 md:mx-12 mb-2 bg-orange-50/50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-500/60 rounded-xl p-6 shadow-md dark:shadow-orange-500/10 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center mb-4 border-b border-orange-100 dark:border-orange-500/30 pb-2">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400 drop-shadow-sm" /> Kế hoạch Kịch bản / Gợi ý từ AI
              </h3>
              <div className="flex gap-2">
                {isEditingDesc && (
                  <Button size="sm" variant="default" onClick={handleParseJSON} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Wand2 className="h-4 w-4 mr-2"/> Tạo Phân Cảnh từ JSON
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(!isEditingDesc)} className="text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-200 hover:bg-orange-100/50 dark:hover:bg-orange-900/50">
                   {isEditingDesc ? "Xem giao diện đẹp (Preview)" : <><Edit2 className="h-4 w-4 mr-2"/> Sửa thủ công</>}
                </Button>
              </div>
           </div>
           {isEditingDesc ? (
             <Textarea 
               className="min-h-[300px] font-mono text-sm bg-white dark:bg-card dark:text-foreground dark:border-border"
               value={project.description || ""}
               onChange={(e) => updateProjectDescription(project.id, e.target.value)}
             />
           ) : (
             <div className="max-h-[500px] overflow-y-auto bg-white dark:bg-[#1a1a1c] p-6 rounded-lg border border-orange-50 dark:border-border/50 shadow-inner">
               <div className="text-foreground">
                 <MarkdownRenderer content={project.description || "Chưa có nội dung"} />
               </div>
             </div>
           )}
        </div>
      )}

      {showTasks && (
        <div className="mx-8 md:mx-12 mb-2 bg-blue-50/50 border border-blue-200 rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-blue-100 pb-2">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-600" /> Checklist Triển khai
            </h3>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-600 border-blue-200"
              onClick={() => {
                const newTask = { id: `task-${Date.now()}`, title: "Công việc mới", completed: false };
                updateProjectTasks(project.id, [...(project.tasks || []), newTask]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm công việc
            </Button>
          </div>
          <div className="space-y-2">
            {(!project.tasks || project.tasks.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có công việc nào. Thêm các việc cần làm (như Quay cảnh 1, Thu âm, Dựng video...).</p>
            ) : (
              project.tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-3 bg-white p-2 rounded-md border shadow-sm">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={(e) => {
                      const newTasks = [...project.tasks!];
                      newTasks[idx].completed = e.target.checked;
                      updateProjectTasks(project.id, newTasks);
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => {
                      const newTasks = [...project.tasks!];
                      newTasks[idx].title = e.target.value;
                      updateProjectTasks(project.id, newTasks);
                    }}
                    className={`flex-1 text-sm bg-transparent border-none outline-none ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      updateProjectTasks(project.id, project.tasks!.filter(t => t.id !== task.id));
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showMetrics && project.status === "published" && (
        <div className="mx-8 md:mx-12 mb-2 bg-pink-50/50 border border-pink-200 rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-pink-100 pb-2">
            <h3 className="font-semibold text-pink-900 flex items-center gap-2">
              <BarChart className="h-5 w-5 text-pink-600" /> Cập nhật Chỉ số Video
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'views', label: 'Lượt xem (Views)' },
              { key: 'likes', label: 'Lượt thích (Likes)' },
              { key: 'comments', label: 'Bình luận' },
              { key: 'shares', label: 'Chia sẻ' },
              { key: 'conversions', label: 'Chuyển đổi/Lead' }
            ].map(metric => (
              <div key={metric.key} className="space-y-1">
                <label className="text-xs font-semibold text-pink-800">{metric.label}</label>
                <input
                  type="number"
                  value={project.metrics?.[metric.key as keyof ProjectMetrics] || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    updateProjectMetrics(project.id, {
                      ...(project.metrics || { views: 0, likes: 0, shares: 0, comments: 0, conversions: 0 }),
                      [metric.key]: val
                    });
                  }}
                  className="w-full border border-pink-200 rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
                onExportScene={exportSceneAsImage}
                onCopyScene={copySceneToClipboard}
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
