"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { McpProvider } from "@/types/marketplace";
import type { McpServer } from "@/types/config";

interface McpSetupPanelProps {
  provider: McpProvider;
  onConfirm: (server: McpServer) => void;
  onCancel: () => void;
}

export function McpSetupPanel({ provider, onConfirm, onCancel }: McpSetupPanelProps) {
  const [envValues, setEnvValues] = useState<Record<string, string>>(
    provider.required_env_keys.reduce<Record<string, string>>(
      (acc, key) => ({ ...acc, [key]: "" }),
      {}
    )
  );
  const [guideOpen, setGuideOpen] = useState(false);

  const descriptions = provider.env_key_descriptions ?? {};

  function handleConfirm() {
    const env: Record<string, string> = {};
    for (const key of provider.required_env_keys) {
      env[key] = envValues[key] ?? "";
    }

    const server: McpServer = {
      name: provider.slug,
      type: provider.type,
      command: provider.default_command ?? undefined,
      args: provider.default_args.length > 0 ? provider.default_args : undefined,
      url: provider.default_url ?? undefined,
      env: Object.keys(env).length > 0 ? env : undefined,
      enabled: true,
    };

    onConfirm(server);
  }

  return (
    <div className="border-t mt-3 pt-3 space-y-3">
      {provider.required_env_keys.map((key) => (
        <div key={key} className="space-y-1">
          <Label className="text-xs font-medium font-mono">{key}</Label>
          <Input
            type="password"
            placeholder={`Enter ${key}`}
            value={envValues[key] ?? ""}
            onChange={(e) =>
              setEnvValues((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="text-sm h-8"
          />
          {descriptions[key] && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {descriptions[key]}
            </p>
          )}
        </div>
      ))}

      {provider.setup_guide && (
        <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDownIcon
                className={`size-3 transition-transform ${guideOpen ? "rotate-180" : ""}`}
              />
              Setup help
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded-md border bg-muted/30 p-3">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                {provider.setup_guide}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={handleConfirm} className="flex-1">
          Add to Config
        </Button>
      </div>
    </div>
  );
}
