"use client";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-transparent border rounded-lg p-4">
        {content}
      </pre>
    </div>
  );
}
