"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MagnifyingGlassIcon, PlusIcon, CheckIcon } from "@radix-ui/react-icons";
import { listMcpProviders, searchMcpProviders } from "@/services/mcp-providers";
import { McpSetupPanel } from "@/components/builder/tabs/mcp-setup-panel";
import type { McpProvider } from "@/types/marketplace";
import type { McpServer } from "@/types/config";

type Category = McpProvider["category"] | "all";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "database", label: "Database" },
  { value: "cloud", label: "Cloud" },
  { value: "devtools", label: "DevTools" },
  { value: "monitoring", label: "Monitoring" },
  { value: "ai", label: "AI" },
  { value: "general", label: "General" },
  { value: "search", label: "Search" },
  { value: "communication", label: "Communication" },
  { value: "design", label: "Design" },
];

const AGENT_SHORT_LABELS: Record<string, string> = {
  "claude-code": "CC",
  cursor: "Cu",
  windsurf: "WS",
  cline: "Cl",
  opencode: "OC",
};

interface McpProviderCatalogProps {
  onDirectAdd: (server: McpServer) => void;
  onCustom: () => void;
  existingServerNames: string[];
}

export function McpProviderCatalog({
  onDirectAdd,
  onCustom,
  existingServerNames,
}: McpProviderCatalogProps) {
  const [providers, setProviders] = useState<McpProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const data = searchQuery.trim()
          ? await searchMcpProviders(searchQuery.trim())
          : await listMcpProviders();
        if (!cancelled) {
          setProviders(data);
        }
      } catch {
        if (!cancelled) {
          setProviders([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(fetch, searchQuery ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return providers;
    return providers.filter((p) => p.category === selectedCategory);
  }, [providers, selectedCategory]);

  const existingSet = useMemo(() => new Set(existingServerNames), [existingServerNames]);

  function handleAddClick(provider: McpProvider) {
    if (existingSet.has(provider.slug)) return;

    if (provider.required_env_keys.length === 0) {
      // One-click add for providers with no env vars
      const server: McpServer = {
        name: provider.slug,
        type: provider.type,
        command: provider.default_command ?? undefined,
        args: provider.default_args.length > 0 ? provider.default_args : undefined,
        url: provider.default_url ?? undefined,
        enabled: true,
      };
      onDirectAdd(server);
    } else {
      // Expand inline setup panel
      setExpandedId(expandedId === provider.id ? null : provider.id);
    }
  }

  function handleSetupConfirm(server: McpServer) {
    onDirectAdd(server);
    setExpandedId(null);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((provider) => {
            const isAdded = existingSet.has(provider.slug);
            const isExpanded = expandedId === provider.id;

            return (
              <div
                key={provider.id}
                className={`rounded-lg border p-4 space-y-2 transition-colors ${
                  isAdded
                    ? "border-primary/20 bg-primary/[0.02] opacity-70"
                    : provider.is_featured
                      ? "border-primary/30 bg-primary/[0.02]"
                      : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{provider.name}</span>
                      {provider.is_featured && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Featured
                        </Badge>
                      )}
                    </div>
                    {provider.tagline && (
                      <p className="text-xs text-muted-foreground mt-0.5">{provider.tagline}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {provider.category}
                      </Badge>
                      {provider.compatible_agents && provider.compatible_agents.length > 0 && (
                        <div className="flex gap-0.5">
                          {provider.compatible_agents.map((agent) => (
                            <span
                              key={agent}
                              className="inline-flex items-center justify-center size-4 rounded-sm bg-muted text-[8px] font-medium text-muted-foreground"
                              title={agent}
                            >
                              {AGENT_SHORT_LABELS[agent] ?? agent.slice(0, 2)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {isAdded ? (
                    <div className="shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                      <CheckIcon className="size-3" />
                      Added
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleAddClick(provider)}
                    >
                      <PlusIcon />
                      Add
                    </Button>
                  )}
                </div>

                {provider.tags && provider.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {provider.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-muted px-1.5 py-0 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {!provider.tagline && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {provider.description}
                  </p>
                )}

                {isExpanded && !isAdded && (
                  <McpSetupPanel
                    provider={provider}
                    onConfirm={handleSetupConfirm}
                    onCancel={() => setExpandedId(null)}
                  />
                )}
              </div>
            );
          })}

          <div className="rounded-lg border border-dashed p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-medium text-sm">Custom Server</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure a custom MCP server manually.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={onCustom}>
                <PlusIcon />
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
