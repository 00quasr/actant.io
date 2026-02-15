"use client";

import { MarkdownPreview } from "@/components/markdown/markdown-preview";

interface FilePreviewProps {
  content: string;
  filename?: string;
}

export function FilePreview({ content, filename }: FilePreviewProps) {
  const isMarkdown = filename?.endsWith(".md");

  if (isMarkdown) {
    return (
      <div className="overflow-auto p-4 max-h-80">
        <MarkdownPreview content={content} />
      </div>
    );
  }

  return (
    <pre className="overflow-auto bg-muted/30 p-4 text-xs font-mono leading-relaxed max-h-80">
      <code>{content}</code>
    </pre>
  );
}
