"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listTemplates } from "@/services/templates";
import type { AgentType } from "@/types/config";
import type { Template } from "@/types/marketplace";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAgent: AgentType;
  onSelect: (template: Template) => void;
}

export function TemplatePicker({
  open,
  onOpenChange,
  targetAgent,
  onSelect,
}: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const data = await listTemplates(targetAgent);
        if (!cancelled) {
          setTemplates(data);
        }
      } catch {
        if (!cancelled) {
          setTemplates([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [open, targetAgent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Start with a template and customize it for your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No templates available for this agent type.
            </p>
          ) : (
            templates.map((template) => (
              <button
                key={template.id}
                className="w-full text-left rounded-lg border p-4 hover:bg-accent transition-colors"
                onClick={() => onSelect(template)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{template.name}</span>
                  {template.is_featured && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {template.use_case}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
