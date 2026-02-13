"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Extension } from "@codemirror/state";
import { Button } from "@/components/ui/button";
import { TemplatePicker } from "@/components/builder/tabs/template-picker";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-md border bg-muted animate-pulse" />
  ),
});

interface InstructionsTabProps {
  content: string;
  templateId?: string;
  setInstructions: (content: string) => void;
  setTemplateId: (id: string | undefined) => void;
}

export function InstructionsTab({
  content,
  setInstructions,
  setTemplateId,
}: InstructionsTabProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [extensionsLoaded, setExtensionsLoaded] = useState(false);

  const loadExtensions = useCallback(async () => {
    if (extensionsLoaded) return;
    const { markdown } = await import("@codemirror/lang-markdown");
    setExtensions([markdown()]);
    setExtensionsLoaded(true);
  }, [extensionsLoaded]);

  useEffect(() => {
    loadExtensions();
  }, [loadExtensions]);

  const handleTemplateSelect = (templateContent: string, id: string) => {
    setInstructions(templateContent);
    setTemplateId(id);
    setTemplateOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? "outline" : "secondary"}
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            Edit
          </Button>
          <Button
            variant={showPreview ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}>
          Templates
        </Button>
      </div>

      {showPreview ? (
        <div className="prose prose-sm max-w-none rounded-md border p-4 min-h-96">
          <pre className="whitespace-pre-wrap font-sans text-sm">{content || "No instructions yet."}</pre>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          {extensionsLoaded ? (
            <CodeMirror
              value={content}
              onChange={setInstructions}
              extensions={extensions}
              height="384px"
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
              }}
              className="text-sm"
            />
          ) : (
            <div className="h-96 bg-muted animate-pulse" />
          )}
        </div>
      )}

      <TemplatePicker
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
