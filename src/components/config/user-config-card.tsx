"use client";

import Link from "next/link";
import { TrashIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentBadge } from "@/components/config/agent-badge";
import type { Config } from "@/types/marketplace";
import { useState } from "react";
import { deleteConfig } from "@/services/configs";
import { useRouter } from "next/navigation";

interface UserConfigCardProps {
  config: Config;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function UserConfigCard({ config }: UserConfigCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this config? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteConfig(config.id);
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/builder/${config.id}`}>
      <Card className="h-full transition-colors hover:border-foreground/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm truncate">{config.name}</CardTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <AgentBadge agent={config.target_agent} />
            </div>
          </div>
          {config.description && (
            <CardDescription className="line-clamp-2">
              {config.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {timeAgo(config.updated_at)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <TrashIcon className="size-3.5" />
              <span className="sr-only">Delete config</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
