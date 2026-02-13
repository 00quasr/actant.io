"use client";

import { useState } from "react";
import { PlusIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { McpServerList } from "@/components/builder/tabs/mcp-server-list";
import { McpServerForm } from "@/components/builder/tabs/mcp-server-form";
import { McpProviderCatalog } from "@/components/builder/tabs/mcp-provider-catalog";
import { MCP_BUNDLES } from "@/lib/presets";
import type { McpServer } from "@/types/config";
import type { McpProvider } from "@/types/marketplace";

type Mode = "idle" | "catalog" | "form";

interface McpTabProps {
  servers: McpServer[];
  addServer: (server: McpServer) => void;
  removeServer: (name: string) => void;
  updateServer: (name: string, server: McpServer) => void;
}

export function McpTab({ servers, addServer, removeServer, updateServer }: McpTabProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);
  const [prefilledServer, setPrefilledServer] = useState<McpServer | undefined>(undefined);

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

  const handleProviderSelect = (provider: McpProvider) => {
    const prefilled: McpServer = {
      name: provider.slug,
      type: provider.type,
      command: provider.default_command ?? undefined,
      args: provider.default_args.length > 0 ? provider.default_args : undefined,
      url: provider.default_url ?? undefined,
      env: provider.required_env_keys.reduce<Record<string, string>>(
        (acc, key) => ({ ...acc, [key]: "" }),
        {},
      ),
      enabled: true,
    };
    setPrefilledServer(prefilled);
    setEditingServer(null);
    setMode("form");
  };

  const handleCustom = () => {
    setPrefilledServer(undefined);
    setEditingServer(null);
    setMode("form");
  };

  const handleAddBundle = (bundleId: string) => {
    const bundle = MCP_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;
    const existingNames = new Set(servers.map((s) => s.name));
    for (const server of bundle.servers) {
      if (!existingNames.has(server.name)) {
        addServer(server);
      }
    }
  };

  if (mode === "catalog") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeftIcon />
          Back
        </Button>
        <McpProviderCatalog
          onSelect={handleProviderSelect}
          onCustom={handleCustom}
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

  return (
    <div className="space-y-6">
      {servers.length > 0 && (
        <McpServerList
          servers={servers}
          onEdit={handleEdit}
          onRemove={removeServer}
        />
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

        {servers.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No MCP servers configured. Add a server to extend your agent with external tools.
          </p>
        )}
        <Button variant="outline" size="sm" onClick={() => setMode("catalog")}>
          <PlusIcon />
          Add Server
        </Button>
      </div>
    </div>
  );
}
