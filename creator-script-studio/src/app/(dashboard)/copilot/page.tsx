"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Sparkles, Check, FileText, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useProjects } from "@/hooks/use-projects";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const JSON_INSTRUCTION = `
Ở PHẦN CUỐI CÙNG của câu trả lời, BẮT BUỘC bạn phải trả về cho tôi một mảng JSON (chuẩn cú pháp) chứa chi tiết các phân cảnh (scene) của Concept mà bạn cho là xuất sắc nhất.
Cấu trúc JSON PHẢI TUÂN THỦ NGHIÊM NGẶT như sau (chỉ trả về array, bọc trong block code \`\`\`json):
\`\`\`json
[
  {
    "time": "0s - 3s",
    "camera": "Ghi chi tiết góc máy và phụ đề trên màn hình (nếu có)",
    "action": "Ghi chi tiết hành động và biểu cảm",
    "dialogue": "Lời thoại hoặc Voice-over"
  },
  ...
]
\`\`\`
`;

const PROMPT_TEMPLATES = [
  {
    id: "idea",
    title: "Ý tưởng Video Viral & Tự động tạo Kịch bản",
    description: "Nhờ AI phân tích trend và TỰ ĐỘNG sinh ra các phân cảnh (Scenes) có sẵn.",
    template: (product: string) => `Đóng vai là một chuyên gia sáng tạo nội dung (Content Creator) hàng đầu trên TikTok, Douyin và Instagram Reels chuyên về mảng họa cụ. 

Tôi vừa nhận được sản phẩm họa cụ sau: "${product || '[Tên sản phẩm họa cụ]'}".

Nhiệm vụ của bạn:
1. Gợi ý 3 concept video (ngắn dưới 60s) độc đáo, mang phong cách trending, aesthetic và thu hút người xem ngay từ 3 giây đầu.
2. Với mỗi concept, trình bày rõ: Hook, Setup, Hành động, Hashtag và Nhạc nền.
3. ${JSON_INSTRUCTION}`
  },
  {
    id: "script",
    title: "Chuyển ý tưởng thành Kịch bản",
    description: "Chuyển ý tưởng thô thành kịch bản phân cảnh chi tiết (Có hỗ trợ tự tạo Scene).",
    template: (idea: string) => `Đóng vai là một đạo diễn và biên kịch video ngắn chuyên nghiệp.

Dựa trên ý tưởng cốt lõi sau: "${idea || '[Nhập ý tưởng của bạn vào đây]'}"

Hãy giúp tôi triển khai thành một kịch bản phân cảnh chi tiết (Storyboard) để tôi có thể quay ngay. Trình bày dưới dạng bảng/danh sách để tôi đọc hiểu.

ĐẶC BIỆT LƯU Ý:
${JSON_INSTRUCTION}`
  },
  {
    id: "review",
    title: "Kịch bản Review Chân thực",
    description: "Viết kịch bản review họa cụ không bị mang tính quảng cáo lố.",
    template: (product: string) => `Hãy viết cho tôi một kịch bản video review sản phẩm họa cụ: "${product || '[Tên sản phẩm]'}" dành cho TikTok.

Yêu cầu:
- Phong cách chân thực, review từ góc nhìn của người vẽ tranh, không lố (seeding).
- Có sự so sánh nhẹ nhàng, nêu ưu/nhược điểm và đối tượng phù hợp.
- Cung cấp Call-to-action tự nhiên ở cuối video.

ĐẶC BIỆT LƯU Ý:
${JSON_INSTRUCTION}`
  }
];

export default function CopilotPage() {
  const [activeTab, setActiveTab] = useState<"prompt" | "parser">("prompt");
  const [productName, setProductName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Parser state
  const [geminiResult, setGeminiResult] = useState("");
  const { createProject, updateProjectDescription } = useProjects();
  const router = useRouter();

  const handleCopyAndOpen = async (templateId: string, promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedId(templateId);
      setTimeout(() => setCopiedId(null), 2000);
      window.open("https://gemini.google.com/", "_blank");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const parsedScenes = useMemo(() => {
    if (!geminiResult) return null;
    try {
      const match = geminiResult.match(/```json\n([\s\S]*?)\n```/);
      if (match && match[1]) {
        const data = JSON.parse(match[1]);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item, index) => ({
            id: `scene-ai-${Date.now()}-${index}`,
            time: item.time || "",
            camera: item.camera || "",
            action: item.action || "",
            dialogue: item.dialogue || "",
            visual: "",
            caption: "",
            emotion: ""
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON from AI", e);
    }
    return null;
  }, [geminiResult]);

  const handleCreateProject = () => {
    if (!geminiResult.trim()) return;
    
    // Clean the gemini result to remove the JSON block from the description text
    const cleanDescription = geminiResult.replace(/```json\n[\s\S]*?\n```/g, '').trim();

    // Create new project and pass parsed scenes directly
    const projectId = createProject(
      productName ? `Ý tưởng: ${productName}` : "Ý tưởng từ Gemini",
      cleanDescription,
      parsedScenes || undefined
    );
    
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            Trợ lý AI Copilot
          </h1>
          <p className="text-muted-foreground mt-1">
            Bộ công cụ tạo Prompt và phân tích kết quả trả về từ Google Gemini.
          </p>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("prompt")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === "prompt" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            1. Tạo Lệnh (Prompt)
          </button>
          <button 
            onClick={() => setActiveTab("parser")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === "parser" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            2. Xử lý Kết quả
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {activeTab === "prompt" ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-primary/5 border-primary/20 shadow-none">
              <CardContent className="pt-6">
                <label className="text-sm font-medium mb-2 block">Tên sản phẩm / Chủ đề bạn muốn làm:</label>
                <Textarea 
                  placeholder="VD: Bộ màu nước Mijello 36 màu, Giấy vẽ phác thảo..." 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="bg-background min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Nhập thông tin vào đây, các Prompt mẫu bên dưới sẽ tự động được điền thông tin của bạn.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-lg font-semibold">Thư viện Prompt Mẫu</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open("https://gemini.google.com/", "_blank")}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Mở Web Gemini thủ công
                </Button>
              </div>
              
              {PROMPT_TEMPLATES.map((template) => {
                const promptContent = template.template(productName);
                return (
                  <Card key={template.id} className="overflow-hidden border-border/50 hover:border-indigo-500/30 transition-colors">
                    <CardHeader className="bg-secondary/20 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base text-primary">{template.title}</CardTitle>
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleCopyAndOpen(template.id, promptContent)}
                          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                          {copiedId === template.id ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          Copy & Mở Gemini
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-muted/10 p-5 text-sm font-mono whitespace-pre-wrap text-muted-foreground max-h-[250px] overflow-y-auto leading-relaxed">
                        {promptContent}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            {/* Input Column */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm">
                <div className="p-4 border-b bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Dán kết quả từ Gemini vào đây
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Copy toàn bộ văn bản trả lời của Gemini (bao gồm cả đoạn mã ở cuối) và paste vào ô bên dưới.</p>
                </div>
                <Textarea 
                  placeholder="Paste đoạn chat của Gemini vào đây..." 
                  value={geminiResult}
                  onChange={(e) => setGeminiResult(e.target.value)}
                  className="flex-1 border-0 rounded-none rounded-b-xl focus-visible:ring-0 resize-none p-4 min-h-[400px]"
                />
              </div>
            </div>

            {/* Preview Column */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-indigo-500/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 text-indigo-700">
                        <Sparkles className="h-4 w-4" />
                        Bảng Phân Tích (Preview)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Xem trước kết quả đã được format gọn gàng.</p>
                    </div>
                    
                    <Button 
                      onClick={handleCreateProject}
                      disabled={!geminiResult.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                      Tạo Kịch Bản <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {parsedScenes && parsedScenes.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-md flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Tìm thấy và sẽ tự động tạo <strong>{parsedScenes.length} phân cảnh (scenes)</strong> từ kết quả này.
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-[#FDFCFB]">
                  {geminiResult.trim() ? (
                    <MarkdownRenderer content={geminiResult} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm">Chưa có dữ liệu.</p>
                      <p className="text-xs mt-1 max-w-[250px]">Hãy dán kết quả từ Gemini sang ô bên trái để xem giao diện siêu mượt ở đây.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
