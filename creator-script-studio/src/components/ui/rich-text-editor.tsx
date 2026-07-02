"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Strikethrough, Palette, Type } from "lucide-react"
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

const FONT_SIZES = [
  { name: 'Mặc định (16px)', value: '' },
  { name: '12px', value: '12px' },
  { name: '14px', value: '14px' },
  { name: '16px', value: '16px' },
  { name: '18px', value: '18px' },
  { name: '20px', value: '20px' },
  { name: '24px', value: '24px' },
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
      FontSize,
      Placeholder.configure({
        placeholder: placeholder || 'Nhập nội dung...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[24px] text-[16px] leading-relaxed",
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
      // Only sync if not focused to prevent cursor jumping and typing lag
      if (!editor.isFocused) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("flex flex-col border border-transparent rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-all", className)}>
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-1 bg-background border border-border shadow-md rounded-md z-50"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("h-8 w-8 p-0 rounded-sm hover:bg-secondary", editor.isActive('bold') && "bg-secondary text-foreground")}
            title="In đậm"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("h-8 w-8 p-0 rounded-sm hover:bg-secondary", editor.isActive('italic') && "bg-secondary text-foreground")}
            title="In nghiêng"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn("h-8 w-8 p-0 rounded-sm hover:bg-secondary", editor.isActive('strike') && "bg-secondary text-foreground")}
            title="Gạch ngang"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
  
          <div className="w-px h-4 bg-border/50 mx-1" />

          <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-sm hover:bg-secondary" title="Cỡ chữ" />}>
              <Type className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1 z-[60]" align="center" side="top">
              <div className="flex flex-col gap-1 min-w-[100px]">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.name}
                    className={cn(
                      "text-left px-3 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors focus:outline-none focus:bg-secondary",
                      editor.isActive('textStyle', { fontSize: size.value }) && "bg-secondary font-medium"
                    )}
                    onClick={() => {
                      if (size.value) {
                        editor.chain().focus().setFontSize(size.value).run();
                      } else {
                        editor.chain().focus().unsetFontSize().run();
                      }
                    }}
                  >
                    <span style={{ fontSize: size.value || 'inherit' }}>{size.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
  
          <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-sm hover:bg-secondary" title="Màu chữ" />}>
              <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 z-[60]" align="center" side="top">
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
        </BubbleMenu>
      )}

      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
