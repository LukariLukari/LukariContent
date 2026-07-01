"use client";

import { useState } from "react";
import { UploadCloud, Link as LinkIcon, FileText, ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function NewProjectPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI processing delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowSummary(true);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground">Import your brief to get started. AI will analyze and extract the key information.</p>
      </div>

      {!showSummary ? (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon className="mr-2 h-4 w-4" />
              Paste Link
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="mr-2 h-4 w-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Brief Document</CardTitle>
                <CardDescription>Support PDF, DOCX, XLSX, CSV, TXT files up to 10MB.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-secondary/20 transition-colors hover:bg-secondary/40">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="rounded-full bg-secondary p-4">
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, Word, or Excel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="ghost">Cancel</Button>
                <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <Bot className="mr-2 h-4 w-4 animate-pulse" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Analyze Brief <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="link">
            <Card>
              <CardHeader>
                <CardTitle>Paste Document Link</CardTitle>
                <CardDescription>Paste a link to Google Docs, Google Sheets, or Notion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Document URL</Label>
                  <Input id="link" placeholder="https://docs.google.com/document/d/..." />
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="ghost">Cancel</Button>
                <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "Analyze Brief"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>Paste Text</CardTitle>
                <CardDescription>Directly paste the brief content here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Brief Content</Label>
                  <Textarea id="text" placeholder="Type or paste brief here..." className="min-h-[200px]" />
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="ghost">Cancel</Button>
                <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "Analyze Brief"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          <Card className="border-success/20 bg-success/5 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-success">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Brief Analyzed Successfully
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    AI has extracted the following information from your brief.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowSummary(false)}>
                  Edit Brief
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Brand</h4>
                  <p className="font-medium text-foreground">GlowBeauty Skincare</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product</h4>
                  <p className="font-medium text-foreground">Vitamin C Brightening Serum</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Campaign Goal</h4>
                  <p className="font-medium text-foreground">Increase awareness and drive sales via TikTok shop.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Target Audience</h4>
                  <p className="font-medium text-foreground">Gen Z & Millennials (18-35), skincare enthusiasts.</p>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Messages</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Brightens skin in just 7 days.</li>
                  <li>Contains 15% pure Vitamin C.</li>
                  <li>Gentle on sensitive skin.</li>
                </ul>
              </div>

              <div className="space-y-1 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-danger mb-2">Do Not&apos;s</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-danger/80">
                  <li>Do not mention competitors (e.g., The Ordinary, Paula&apos;s Choice).</li>
                  <li>Do not use the word &quot;miracle&quot;.</li>
                </ul>
              </div>

            </CardContent>
            <CardFooter className="border-t border-border bg-background/50 px-6 py-4 flex justify-between">
              <Button variant="ghost">Cancel</Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Generate Ideas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}


