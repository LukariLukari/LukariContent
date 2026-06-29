"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground">Theo dõi hiệu suất của các video trên các nền tảng.</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" /> Xuất Báo Cáo
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center border-2 border-dashed rounded-xl bg-secondary/10 p-12 text-center">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <BarChart3 className="h-10 w-10 text-primary opacity-80" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Chưa có dữ liệu báo cáo</h3>
          <p className="text-muted-foreground mb-6">
            Bạn chưa kết nối tài khoản nền tảng hoặc chưa nhập số liệu báo cáo thủ công. Hãy bắt đầu cập nhật số liệu để xem biểu đồ phân tích.
          </p>
          <Button className="bg-asphalt text-paper hover:bg-[#1a1d1f] hover:scale-105 transition-all">
            Nhập số liệu thủ công
          </Button>
        </div>
      </div>
    </div>
  );
}
