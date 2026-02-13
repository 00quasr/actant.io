"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { listMcpProviders, searchMcpProviders } from "@/services/mcp-providers";
import type { McpProvider } from "@/types/marketplace";

type Category = McpProvider["category"] | "all";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "database", label: "Database" },
  { value: "cloud", label: "Cloud" },
  { value: "devtools", label: "DevTools" },
  { value: "monitoring", label: "Monitoring" },
  { value: "ai", label: "AI" },
  { value: "general", label: "General" },
];

interface McpProviderCatalogProps {
  onSelect: (provider: McpProvider) => void;
  onCustom: () => void;
}

export function McpProviderCatalog({ onSelect, onCustom }: McpProviderCatalogProps) {
  const [providers, setProviders] = useState<McpProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

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
          {filtered.map((provider) => (
            <div
              key={provider.id}
              className={`rounded-lg border p-4 space-y-2 ${
                provider.is_featured ? "border-primary/30 bg-primary/[0.02]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {provider.name}
                    </span>
                    {provider.is_featured && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {provider.category}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onSelect(provider)}
                >
                  <PlusIcon />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {provider.description}
              </p>
            </div>
          ))}

          <div className="rounded-lg border border-dashed p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-medium text-sm">Custom Server</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure a custom MCP server manually.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={onCustom}
              >
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
