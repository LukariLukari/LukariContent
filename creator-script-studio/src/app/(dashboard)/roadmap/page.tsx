"use client";

import { useProjects, CampaignGoal, Campaign } from "@/hooks/use-projects";
import { useIdeas } from "@/hooks/use-ideas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CampaignBoard } from "@/components/roadmap/campaign-board";
import { Plus, Target, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function RoadmapPage() {
  const useProjectsHook = useProjects();
  const { campaigns, projects, isLoaded: isProjectsLoaded, createCampaign, deleteCampaign, addProjectToCampaign, removeProjectFromCampaign, addIdeaToCampaign, removeIdeaFromCampaign } = useProjectsHook;
  const useIdeasHook = useIdeas();
  const { ideas, isLoaded: isIdeasLoaded } = useIdeasHook;
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignGoal, setNewCampaignGoal] = useState<CampaignGoal>("viral");
  
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  if (!isProjectsLoaded || !isIdeasLoaded) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  }

  const handleCreate = () => {
    if (!newCampaignName.trim()) return;
    createCampaign(newCampaignName, newCampaignGoal);
    setNewCampaignName("");
    setIsCreating(false);
  };

  const goalColors = {
    viral: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    conversion: "bg-green-500/10 text-green-500 border-green-500/20",
    brand_awareness: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  const goalLabels = {
    viral: "Viral / Tăng lượt tiếp cận",
    conversion: "Chuyển đổi / Bán hàng",
    brand_awareness: "Nhận diện thương hiệu",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lộ trình (Roadmap)</h1>
          <p className="text-muted-foreground">Quản lý các chiến dịch và theo dõi mục tiêu dài hạn.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-asphalt text-paper hover:bg-[#1a1d1f] transition-all">
          <Plus className="mr-2 h-4 w-4" /> Tạo Chiến dịch
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tạo Chiến dịch mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên chiến dịch</label>
              <input 
                type="text" 
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="VD: Chuỗi video Tóp Tóp tháng 7"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mục tiêu</label>
              <select 
                value={newCampaignGoal}
                onChange={(e) => setNewCampaignGoal(e.target.value as CampaignGoal)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="viral">Viral / Tăng lượt tiếp cận</option>
                <option value="conversion">Chuyển đổi / Bán hàng</option>
                <option value="brand_awareness">Nhận diện thương hiệu</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Hủy</Button>
              <Button onClick={handleCreate}>Tạo mới</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {campaigns.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-secondary/10">
          <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Chưa có chiến dịch nào</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Hãy tạo một chiến dịch để nhóm các video theo mục tiêu cụ thể.</p>
          <Button onClick={() => setIsCreating(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Bắt đầu tạo
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => {
            const campaignProjects = projects.filter(p => campaign.projectIds.includes(p.id));
            const campaignIdeaIds = new Set([
              ...(campaign.ideaIds || []),
              ...(campaign.phases?.flatMap(p => p.ideaIds) || [])
            ]);

            const publishedCount = campaignProjects.filter(p => p.status === "published").length;
            const totalItems = campaignProjects.length + campaignIdeaIds.size;
            const progress = totalItems === 0 ? 0 : Math.round((publishedCount / totalItems) * 100);

            return (
              <Card key={campaign.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", goalColors[campaign.goal])}>
                          <Target className="inline h-3 w-3 mr-1" />
                          {goalLabels[campaign.goal]}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          Tạo ngày: {new Date(parseInt(campaign.id.split('-')[1])).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteCampaignId(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mb-6 bg-secondary/50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-muted-foreground">Tiến độ xuất bản</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Đã đăng {publishedCount} / {totalItems} video & ý tưởng
                    </div>
                  </div>

                  <CampaignBoard 
                    campaign={campaign} 
                    ideas={ideas} 
                    projects={projects} 
                    useProjectsHook={useProjectsHook} 
                    useIdeasHook={useIdeasHook}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!deleteCampaignId} onOpenChange={(open) => !open && setDeleteCampaignId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Chiến dịch</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa chiến dịch này? Các dự án và ý tưởng bên trong sẽ KHÔNG bị xóa khỏi ứng dụng, nhưng sẽ bị gỡ khỏi nhóm chiến dịch này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCampaignId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteCampaignId) {
                deleteCampaign(deleteCampaignId);
                setDeleteCampaignId(null);
              }
            }}>Xóa Chiến dịch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
