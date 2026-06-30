"use client";

import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, BarChart3, Eye, ThumbsUp, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const { projects, isLoaded } = useProjects();
  const router = useRouter();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  }

  // Filter only published projects for analytics
  const publishedProjects = projects.filter(p => p.status === "published");

  // Calculate totals
  const totals = publishedProjects.reduce((acc, project) => {
    const metrics = project.metrics || { views: 0, likes: 0, shares: 0, comments: 0, conversions: 0 };
    return {
      views: acc.views + (Number(metrics.views) || 0),
      likes: acc.likes + (Number(metrics.likes) || 0),
      shares: acc.shares + (Number(metrics.shares) || 0),
      comments: acc.comments + (Number(metrics.comments) || 0),
      conversions: acc.conversions + (Number(metrics.conversions) || 0),
    };
  }, { views: 0, likes: 0, shares: 0, comments: 0, conversions: 0 });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground">Theo dõi hiệu suất của các video đã đăng.</p>
        </div>
        <Button variant="outline" disabled={publishedProjects.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Xuất Báo Cáo
        </Button>
      </div>

      {publishedProjects.length === 0 ? (
        <div className="flex flex-1 items-center justify-center border-2 border-dashed rounded-xl bg-secondary/10 p-12 text-center mt-6">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
              <BarChart3 className="h-10 w-10 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có dữ liệu báo cáo</h3>
            <p className="text-muted-foreground mb-6">
              Bạn chưa có video nào ở trạng thái "Đã đăng". Hãy chuyển trạng thái kịch bản thành "Đã đăng" và nhập số liệu để xem báo cáo.
            </p>
            <Button onClick={() => router.push('/kanban')} className="bg-asphalt text-paper hover:bg-[#1a1d1f] hover:scale-105 transition-all">
              Tới bảng Tiến độ
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.views)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lượt Thích (Likes)</CardTitle>
                <ThumbsUp className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.likes)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bình luận</CardTitle>
                <MessageCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.comments)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chia sẻ</CardTitle>
                <Share2 className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.shares)}</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Chuyển đổi / Lead</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatNumber(totals.conversions)}</div>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-4">Hiệu suất chi tiết từng video</h3>
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Tên Kịch bản / Video</th>
                    <th className="px-6 py-3 font-medium text-right">Lượt xem</th>
                    <th className="px-6 py-3 font-medium text-right">Lượt thích</th>
                    <th className="px-6 py-3 font-medium text-right">Bình luận</th>
                    <th className="px-6 py-3 font-medium text-right">Chia sẻ</th>
                    <th className="px-6 py-3 font-medium text-right text-primary">Chuyển đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {publishedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-secondary/20 cursor-pointer transition-colors" onClick={() => router.push(`/projects/${project.id}`)}>
                      <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate" title={project.name}>
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-right">{formatNumber(project.metrics?.views || 0)}</td>
                      <td className="px-6 py-4 text-right">{formatNumber(project.metrics?.likes || 0)}</td>
                      <td className="px-6 py-4 text-right">{formatNumber(project.metrics?.comments || 0)}</td>
                      <td className="px-6 py-4 text-right">{formatNumber(project.metrics?.shares || 0)}</td>
                      <td className="px-6 py-4 text-right font-medium text-primary">{formatNumber(project.metrics?.conversions || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
