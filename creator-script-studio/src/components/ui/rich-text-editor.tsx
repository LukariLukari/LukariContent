"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Strikethrough, Palette } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useEffect } from 'react'
import { cn } from "@/lib/utils"

const COLORS = [
  { name: 'Mặc định', value: '' }, // Renders standard text color
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Cam', value: '#f97316' },
  { name: 'Vàng', value: '#eab308' },
  { name: 'Xanh lá', value: '#22c55e' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Tím', value: '#a855f7' },
  { name: 'Hồng', value: '#ec4899' },
]

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || 'Nhập nội dung...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px]",
      },
      transformPastedHTML(html) {
        // Xử lý đặc biệt khi copy từ Excel/Google Sheets (chứa thẻ table)
        if (html.includes('<table') || html.includes('<tr')) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const rows = doc.querySelectorAll('tr');
            if (rows.length > 0) {
              let result = '';
              rows.forEach(row => {
                // Lấy nội dung của từng cell, nối với nhau bằng khoảng trắng
                const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.innerHTML).join(' ');
                if (cells.trim()) {
                  result += `<p>${cells}</p>`;
                }
              });
              return result || html;
            }
          } catch (e) {
            // Bỏ qua nếu lỗi parse
          }
        }
        return html.replace(/<\/div>/gi, '<br>');
      },
    },
    onUpdate: ({ editor }) => {
      // Export as HTML to keep formatting
      onChange(editor.getHTML());
    },
  });

  // Sync value if it changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("flex flex-col border border-border/50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all", className)}>
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-border/50 bg-secondary/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0 rounded-sm", editor.isActive('bold') && "bg-secondary text-foreground")}
          title="In đậm"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0 rounded-sm", editor.isActive('italic') && "bg-secondary text-foreground")}
          title="In nghiêng"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("h-8 w-8 p-0 rounded-sm", editor.isActive('strike') && "bg-secondary text-foreground")}
          title="Gạch ngang"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-border/50 mx-1" />

        <Popover>
          <PopoverTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-sm" title="Màu chữ" />}>
            <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-wrap gap-1 max-w-[120px]">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  className={cn(
                    "w-6 h-6 rounded-md border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                    editor.isActive('textStyle', { color: color.value }) && "ring-2 ring-primary"
                  )}
                  style={{ backgroundColor: color.value || 'var(--foreground)' }}
                  onClick={() => {
                    if (color.value) {
                      editor.chain().focus().setColor(color.value).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
