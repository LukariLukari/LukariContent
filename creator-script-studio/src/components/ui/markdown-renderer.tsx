import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm md:prose-base dark:prose-invert max-w-none prose-indigo", className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-primary" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-primary border-b pb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-primary" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 dark:text-indigo-400" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-foreground" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-foreground leading-relaxed" {...props} />,
          code: ({node, ...props}) => <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-foreground my-4 bg-indigo-500/5 py-2 pr-4 rounded-r-lg" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
