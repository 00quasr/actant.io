"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface PermissionRowProps {
  tool: string;
  value: "allow" | "ask" | "deny";
  onChange: (value: "allow" | "ask" | "deny") => void;
  onRemove: () => void;
}

const OPTIONS: { value: "allow" | "ask" | "deny"; label: string }[] = [
  { value: "allow", label: "Allow" },
  { value: "ask", label: "Ask" },
  { value: "deny", label: "Deny" },
];

export function PermissionRow({ tool, value, onChange, onRemove }: PermissionRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center rounded-lg border px-3 py-2">
      <span className="text-sm font-mono truncate">{tool}</span>
      <div className="flex items-center gap-1 w-48" role="group" aria-label={`Permission for ${tool}`}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-label={`Set ${tool} permission to ${opt.label}`}
            aria-pressed={value === opt.value}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Button variant="ghost" size="icon-xs" onClick={onRemove}>
        <Cross2Icon />
      </Button>
    </div>
  );
}
