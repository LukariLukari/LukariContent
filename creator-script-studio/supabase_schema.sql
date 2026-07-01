-- Bảng Ideas
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  "order" INTEGER,
  platform TEXT,
  "contentType" TEXT,
  content TEXT,
  hook TEXT,
  details TEXT,
  "createdAt" TEXT
);

-- Bảng Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  "updatedAt" TEXT,
  blocks JSONB,
  status TEXT,
  "publishDate" TEXT,
  platforms JSONB,
  tasks JSONB,
  metrics JSONB,
  "campaignId" TEXT
);

-- Bảng Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT,
  goal TEXT,
  "startDate" TEXT,
  "endDate" TEXT,
  "projectIds" JSONB,
  "ideaIds" JSONB,
  phases JSONB
);

-- Cho phép thao tác dữ liệu từ Client (Tắt Row Level Security hoặc tạo Policy cho phép Anon truy cập)
-- LƯU Ý BẢO MẬT: Cách này cho phép ai có link web của bạn cũng đọc/ghi được dữ liệu.
-- Nếu bạn có chức năng đăng nhập, hãy bật RLS và cấu hình Policy theo user ID.
ALTER TABLE ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
