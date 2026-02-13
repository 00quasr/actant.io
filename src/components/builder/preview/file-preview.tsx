"use client";

interface FilePreviewProps {
  content: string;
}

export function FilePreview({ content }: FilePreviewProps) {
  return (
    <pre className="overflow-auto bg-muted/30 p-4 text-xs font-mono leading-relaxed max-h-80">
      <code>{content}</code>
    </pre>
  );
}
