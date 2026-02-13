"use client";

import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { McpServer } from "@/types/config";

interface McpServerListProps {
  servers: McpServer[];
  onEdit: (server: McpServer) => void;
  onRemove: (name: string) => void;
}

export function McpServerList({ servers, onEdit, onRemove }: McpServerListProps) {
  return (
    <div className="space-y-2">
      {servers.map((server) => (
        <div
          key={server.name}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{server.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {server.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {server.type === "stdio"
                ? `${server.command} ${server.args?.join(" ") ?? ""}`
                : server.url}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(server)}
            >
              <Pencil1Icon />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemove(server.name)}
            >
              <TrashIcon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
