"use client";

import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { McpServerList } from "@/components/builder/tabs/mcp-server-list";
import { McpServerForm } from "@/components/builder/tabs/mcp-server-form";
import type { McpServer } from "@/types/config";

interface McpTabProps {
  servers: McpServer[];
  addServer: (server: McpServer) => void;
  removeServer: (name: string) => void;
  updateServer: (name: string, server: McpServer) => void;
}

export function McpTab({ servers, addServer, removeServer, updateServer }: McpTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);

  const handleSubmit = (server: McpServer) => {
    if (editingServer) {
      updateServer(editingServer.name, server);
      setEditingServer(null);
    } else {
      addServer(server);
    }
    setShowForm(false);
  };

  const handleEdit = (server: McpServer) => {
    setEditingServer(server);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingServer(null);
  };

  return (
    <div className="space-y-6">
      {servers.length > 0 && (
        <McpServerList
          servers={servers}
          onEdit={handleEdit}
          onRemove={removeServer}
        />
      )}

      {showForm ? (
        <McpServerForm
          initial={editingServer ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          {servers.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              No MCP servers configured. Add a server to extend your agent with external tools.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <PlusIcon />
            Add Server
          </Button>
        </div>
      )}
    </div>
  );
}
