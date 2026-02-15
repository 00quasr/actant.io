"use client";

import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDocsGeneration } from "@/hooks/use-docs-generation";

const COMMON_DOC_FILES = [
  "README.md",
  "DEVELOPMENT.md",
  "CONTRIBUTING.md",
  "ARCHITECTURE.md",
  "TESTING.md",
  "DEPLOYMENT.md",
  "API_REFERENCE.md",
  "SECURITY.md",
  "CHANGELOG.md",
] as const;

const DOC_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  "README.md": { label: "Overview", className: "bg-blue-500/10 text-blue-700" },
  "DEVELOPMENT.md": { label: "Setup", className: "bg-green-500/10 text-green-700" },
  "CONTRIBUTING.md": { label: "Contributing", className: "bg-purple-500/10 text-purple-700" },
  "ARCHITECTURE.md": { label: "Architecture", className: "bg-orange-500/10 text-orange-700" },
  "TESTING.md": { label: "Testing", className: "bg-cyan-500/10 text-cyan-700" },
  "DEPLOYMENT.md": { label: "Deploy", className: "bg-rose-500/10 text-rose-700" },
  "API_REFERENCE.md": { label: "API", className: "bg-amber-500/10 text-amber-700" },
  "SECURITY.md": { label: "Security", className: "bg-red-500/10 text-red-700" },
};

interface DocsTabProps {
  docs: Record<string, string>;
  setDoc: (filename: string, content: string) => void;
  removeDoc: (filename: string) => void;
  configName?: string;
  configDescription?: string;
  techStack?: string[];
}

export function DocsTab({ docs, setDoc, removeDoc, configName, configDescription, techStack }: DocsTabProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(
    Object.keys(docs)[0] ?? null
  );
  const [newFilename, setNewFilename] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { status: genStatus, error: genError, generateDocs } = useDocsGeneration();

  async function handleGenerate() {
    const result = await generateDocs({
      configName,
      configDescription,
      techStack,
      existingDocs: Object.keys(docs).length > 0 ? docs : undefined,
    });
    if (result) {
      for (const [filename, content] of Object.entries(result)) {
        setDoc(filename, content);
      }
    }
  }

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
            No documentation files yet.
          </p>
          {genStatus === "generating" ? (
            <div className="flex items-center justify-center gap-2 pt-2">
              <ReloadIcon className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Generating documentation...</span>
            </div>
          ) : (
            <Button onClick={handleGenerate} size="sm" className="mt-1">
              Generate Docs with AI
            </Button>
          )}
          {genError && (
            <p className="text-xs text-destructive/80">{genError}</p>
          )}
          <div className="space-y-1.5 pt-2">
            <p className="text-xs text-muted-foreground">Or add manually:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedFiles.slice(0, 3).map((filename) => (
                <Button
                  key={filename}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSuggested(filename)}
                  disabled={genStatus === "generating"}
                >
                  <PlusIcon className="size-3.5" />
                  {filename}
                </Button>
              ))}
            </div>
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
                {DOC_TYPE_BADGES[filename] && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DOC_TYPE_BADGES[filename].className}`}>
                    {DOC_TYPE_BADGES[filename].label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {content.length > 0
                    ? `${content.split(/\s+/).filter(Boolean).length} words`
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
          <div className="ml-auto">
            {genStatus === "generating" ? (
              <div className="flex items-center gap-2">
                <ReloadIcon className="size-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Generating...</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
              >
                <ReloadIcon className="size-3.5" />
                Regenerate All Docs
              </Button>
            )}
          </div>
        </div>
      )}
      {genError && (
        <p className="text-xs text-destructive/80">{genError}</p>
      )}
    </div>
  );
}
