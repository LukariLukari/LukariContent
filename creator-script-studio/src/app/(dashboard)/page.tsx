"use client";

import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileVideo, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { projects, isLoaded, createProject, deleteProject } = useProjects();
  const router = useRouter();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  }

  const handleCreate = () => {
    const id = createProject("Kịch bản mới " + (projects.length + 1));
    router.push(`/projects/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Dự án</h1>
          <p className="text-muted-foreground">Tạo và lưu trữ các kịch bản video của bạn tại đây.</p>
        </div>
        <Button onClick={handleCreate} className="bg-asphalt text-paper hover:bg-[#1a1d1f] hover:scale-105 hover:shadow-md transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" /> Tạo Kịch bản Mới
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-secondary/10">
          <FileVideo className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Chưa có kịch bản nào</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Bạn chưa tạo kịch bản nào. Hãy bắt đầu bằng cách tạo mới nhé.</p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Bắt đầu tạo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm" onClick={() => router.push(`/projects/${project.id}`)}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-medium line-clamp-1" title={project.name}>{project.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" /> 
                    {new Date(project.updatedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('Bạn có chắc chắn muốn xóa kịch bản này?')) {
                      deleteProject(project.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {project.blocks.length} phân cảnh
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
