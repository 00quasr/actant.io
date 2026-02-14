"use client";

import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const COMMON_DOC_FILES = [
  "README.md",
  "CONTRIBUTING.md",
  "ARCHITECTURE.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
] as const;

interface DocsTabProps {
  docs: Record<string, string>;
  setDoc: (filename: string, content: string) => void;
  removeDoc: (filename: string) => void;
}

export function DocsTab({ docs, setDoc, removeDoc }: DocsTabProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(
    Object.keys(docs)[0] ?? null
  );
  const [newFilename, setNewFilename] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const docEntries = Object.entries(docs);
  const existingFilenames = new Set(Object.keys(docs));

  const suggestedFiles = COMMON_DOC_FILES.filter(
    (f) => !existingFilenames.has(f)
  );

  function handleAddDoc() {
    const trimmed = newFilename.trim();
    if (!trimmed) return;
    const filename = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
    if (existingFilenames.has(filename)) return;
    setDoc(filename, "");
    setExpandedDoc(filename);
    setNewFilename("");
    setShowAddForm(false);
  }

  function handleAddSuggested(filename: string) {
    setDoc(filename, "");
    setExpandedDoc(filename);
  }

  function toggleDoc(filename: string) {
    setExpandedDoc((prev) => (prev === filename ? null : filename));
  }

  if (docEntries.length === 0 && !showAddForm) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 space-y-3">
          <FileTextIcon className="size-8 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">
            No documentation files yet. Generate with AI or add manually.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {suggestedFiles.slice(0, 3).map((filename) => (
              <Button
                key={filename}
                variant="outline"
                size="sm"
                onClick={() => handleAddSuggested(filename)}
              >
                <PlusIcon className="size-3.5" />
                {filename}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {docEntries.map(([filename, content]) => {
        const isExpanded = expandedDoc === filename;
        return (
          <div key={filename} className="rounded-lg border">
            <button
              onClick={() => toggleDoc(filename)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDownIcon className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                )}
                <FileTextIcon className="size-3.5 text-muted-foreground" />
                <span>{filename}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {content.length > 0
                    ? `${content.length} chars`
                    : "Empty"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDoc(filename);
                    if (expandedDoc === filename) setExpandedDoc(null);
                  }}
                >
                  <TrashIcon className="size-3.5" />
                </Button>
              </div>
            </button>
            {isExpanded && (
              <div className="border-t px-4 py-3">
                <Textarea
                  value={content}
                  onChange={(e) => setDoc(filename, e.target.value)}
                  placeholder={`Write ${filename} content in markdown...`}
                  className="min-h-64 resize-y font-mono text-xs"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Add document */}
      {showAddForm ? (
        <div className="flex items-center gap-2">
          <Input
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            placeholder="FILENAME.md"
            className="max-w-xs text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddDoc();
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleAddDoc} disabled={!newFilename.trim()}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowAddForm(false);
              setNewFilename("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <PlusIcon className="size-3.5" />
            Add Document
          </Button>
          {suggestedFiles.length > 0 && (
            <div className="flex gap-1.5">
              {suggestedFiles.slice(0, 2).map((filename) => (
                <Button
                  key={filename}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => handleAddSuggested(filename)}
                >
                  <PlusIcon className="size-3" />
                  {filename}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
