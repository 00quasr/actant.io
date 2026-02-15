"use client";

import { useState } from "react";
import { FileIcon } from "@radix-ui/react-icons";
import { FilePreview } from "@/components/builder/preview/file-preview";
import type { ExportFile } from "@/lib/exporters";

interface ExportPreviewProps {
  files: ExportFile[];
}

export function ExportPreview({ files }: ExportPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No files to preview.</p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex border-b bg-muted/50 overflow-x-auto">
        {files.map((file, i) => (
          <button
            key={file.path}
            onClick={() => setSelectedIndex(i)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono whitespace-nowrap border-r transition-colors ${
              i === selectedIndex
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileIcon className="size-3" />
            {file.path}
          </button>
        ))}
      </div>
      <FilePreview content={files[selectedIndex].content} filename={files[selectedIndex].path} />
    </div>
  );
}
