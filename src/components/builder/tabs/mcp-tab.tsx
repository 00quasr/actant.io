"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { McpServerList } from "@/components/builder/tabs/mcp-server-list";
import { McpServerForm } from "@/components/builder/tabs/mcp-server-form";
import { McpProviderCatalog } from "@/components/builder/tabs/mcp-provider-catalog";
import { MCP_BUNDLES } from "@/lib/presets";
import { getRecommendedProviders } from "@/services/mcp-providers";
import type { McpServer } from "@/types/config";
import type { McpProvider } from "@/types/marketplace";

type Mode = "idle" | "catalog" | "form";

interface McpTabProps {
  servers: McpServer[];
  addServer: (server: McpServer) => void;
  removeServer: (name: string) => void;
  updateServer: (name: string, server: McpServer) => void;
  techStack?: string[];
}

export function McpTab({ servers, addServer, removeServer, updateServer, techStack = [] }: McpTabProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);
  const [prefilledServer, setPrefilledServer] = useState<McpServer | undefined>(undefined);
  const [recommended, setRecommended] = useState<McpProvider[]>([]);

  const existingServerNames = useMemo(() => servers.map((s) => s.name), [servers]);
  const existingSet = useMemo(() => new Set(existingServerNames), [existingServerNames]);

  useEffect(() => {
    if (techStack.length === 0) return;
    let cancelled = false;
    getRecommendedProviders(techStack).then((data) => {
      if (!cancelled) setRecommended(data);
    }).catch(() => {
      if (!cancelled) setRecommended([]);
    });
    return () => { cancelled = true; };
  }, [techStack]);

  const handleSubmit = (server: McpServer) => {
    if (editingServer) {
      updateServer(editingServer.name, server);
      setEditingServer(null);
    } else {
      addServer(server);
    }
    setMode("idle");
    setPrefilledServer(undefined);
  };

  const handleEdit = (server: McpServer) => {
    setEditingServer(server);
    setPrefilledServer(undefined);
    setMode("form");
  };

  const handleCancel = () => {
    setMode("idle");
    setEditingServer(null);
    setPrefilledServer(undefined);
  };

  const handleDirectAdd = (server: McpServer) => {
    if (!existingSet.has(server.name)) {
      addServer(server);
    }
  };

  const handleCustom = () => {
    setPrefilledServer(undefined);
    setEditingServer(null);
    setMode("form");
  };

  const handleAddBundle = (bundleId: string) => {
    const bundle = MCP_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;
    for (const server of bundle.servers) {
      if (!existingSet.has(server.name)) {
        addServer(server);
      }
    }
  };

  const handleQuickAdd = (provider: McpProvider) => {
    if (existingSet.has(provider.slug)) return;
    const server: McpServer = {
      name: provider.slug,
      type: provider.type,
      command: provider.default_command ?? undefined,
      args: provider.default_args.length > 0 ? provider.default_args : undefined,
      url: provider.default_url ?? undefined,
      env: provider.required_env_keys.length > 0
        ? provider.required_env_keys.reduce<Record<string, string>>((acc, key) => ({ ...acc, [key]: "" }), {})
        : undefined,
      enabled: true,
    };
    addServer(server);
  };

  if (mode === "catalog") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeftIcon />
          Back
        </Button>
        <McpProviderCatalog
          onDirectAdd={handleDirectAdd}
          onCustom={handleCustom}
          existingServerNames={existingServerNames}
        />
      </div>
    );
  }

  if (mode === "form") {
    return (
      <div className="space-y-6">
        {servers.length > 0 && (
          <McpServerList
            servers={servers}
            onEdit={handleEdit}
            onRemove={removeServer}
          />
        )}
        <McpServerForm
          initial={editingServer ?? prefilledServer}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  const filteredRecommended = recommended.filter((p) => !existingSet.has(p.slug));

  return (
    <div className="space-y-6">
      {servers.length > 0 && (
        <McpServerList
          servers={servers}
          onEdit={handleEdit}
          onRemove={removeServer}
        />
      )}

      {filteredRecommended.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Suggested for your stack</p>
          <div className="flex flex-wrap gap-2">
            {filteredRecommended.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleQuickAdd(provider)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:border-foreground/30 hover:bg-muted/50"
              >
                <PlusIcon className="size-3" />
                {provider.name}
                {provider.tagline && (
                  <span className="text-muted-foreground font-normal hidden sm:inline">
                    — {provider.tagline}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">Bundles:</span>
          {MCP_BUNDLES.map((bundle) => (
            <Button
              key={bundle.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddBundle(bundle.id)}
              title={bundle.description}
            >
              {bundle.label}
            </Button>
          ))}
        </div>

        {servers.length === 0 && filteredRecommended.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No MCP servers configured. Add a server to extend your agent with external tools.
          </p>
        )}
        <Button variant="outline" size="sm" onClick={() => setMode("catalog")}>
          <PlusIcon />
          Browse Catalog
        </Button>
      </div>
    </div>
  );
}
