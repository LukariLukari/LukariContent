"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function CopilotSidebar({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi! I'm your AI Copilot. I can help you write dialogue, rewrite hooks, or generate new ideas for your timeline. What do you need help with?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages([...messages, newMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: "I've rewritten the dialogue in block 2 to sound more like Gen Z. I also added a stronger CTA. Check out the changes in the timeline!"
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Copilot</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-max max-w-[85%] flex-col gap-2 rounded-xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === "user" ? (
                  <User className="h-3 w-3 opacity-70" />
                ) : (
                  <Bot className="h-3 w-3 opacity-70" />
                )}
                <span className="text-[10px] uppercase font-bold opacity-70">
                  {msg.role === "user" ? "You" : "Copilot"}
                </span>
              </div>
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          ))}
          {isTyping && (
            <div className="flex w-max max-w-[85%] flex-col gap-2 rounded-xl px-4 py-3 text-sm bg-secondary text-secondary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-3 w-3 opacity-70" />
                <span className="text-[10px] uppercase font-bold opacity-70">Copilot is thinking...</span>
              </div>
              <div className="flex gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to rewrite..."
            className="flex-1 rounded-full bg-secondary/30"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
