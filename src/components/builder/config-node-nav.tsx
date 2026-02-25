"use client";

import { Fragment } from "react";
import {
  FileTextIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
  LockClosedIcon,
  ListBulletIcon,
  CodeIcon,
  PersonIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { cn } from "@/lib/utils";

interface ConfigNodeNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  instructionsLength: number;
  skillsCount: number;
  mcpCount: number;
  permissionsCount: number;
  rulesCount: number;
  commandsCount: number;
  agentsCount: number;
  docsCount: number;
}

interface NodeDef {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
}

const NODES: NodeDef[] = [
  { id: "instructions", label: "Instructions", icon: FileTextIcon },
  { id: "skills", label: "Skills", icon: LightningBoltIcon },
  { id: "mcp", label: "MCP Servers", icon: MixerHorizontalIcon },
  { id: "permissions", label: "Permissions", icon: LockClosedIcon },
  { id: "rules", label: "Rules", icon: ListBulletIcon },
  { id: "commands", label: "Commands", icon: CodeIcon },
  { id: "agents", label: "Agents", icon: PersonIcon },
  { id: "docs", label: "Docs", icon: ReaderIcon },
];

export function ConfigNodeNav({
  activeTab,
  onTabChange,
  instructionsLength,
  skillsCount,
  mcpCount,
  permissionsCount,
  rulesCount,
  commandsCount,
  agentsCount,
  docsCount,
}: ConfigNodeNavProps) {
  function getNodeCount(id: string): number {
    switch (id) {
      case "instructions":
        return instructionsLength;
      case "skills":
        return skillsCount;
      case "mcp":
        return mcpCount;
      case "permissions":
        return permissionsCount;
      case "rules":
        return rulesCount;
      case "commands":
        return commandsCount;
      case "agents":
        return agentsCount;
      case "docs":
        return docsCount;
      default:
        return 0;
    }
  }

  return (
    <div className="flex items-end gap-0 px-2 py-4 overflow-x-auto">
      {NODES.map((node, index) => {
        const count = getNodeCount(node.id);
        const isSelected = node.id === activeTab;
        const hasContent = count > 0;
        const Icon = node.icon;

        return (
          <Fragment key={node.id}>
            {index > 0 && (
              <div className="flex-1 min-w-3 max-w-12 h-px bg-border self-center mb-5" />
            )}

            <button
              onClick={() => onTabChange(node.id)}
              className="flex flex-col items-center gap-1 shrink-0 group animate-[nodeIn_300ms_ease_both]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="h-3.5 text-[9px] font-mono text-muted-foreground tabular-nums">
                {count > 0 ? count : ""}
              </span>

              <div
                className={cn(
                  "size-9 sm:size-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isSelected &&
                    "border-foreground/50 bg-foreground/5 shadow-[0_0_12px_rgba(0,0,0,0.05)]",
                  !isSelected &&
                    hasContent &&
                    "border-border bg-background hover:border-foreground/30 hover:scale-105",
                  !isSelected &&
                    !hasContent &&
                    "border-dashed border-border bg-muted/30 hover:border-foreground/20 hover:scale-105"
                )}
              >
                <Icon
                  className={cn(
                    "size-4",
                    isSelected && "text-foreground",
                    !isSelected && hasContent && "text-muted-foreground",
                    !isSelected && !hasContent && "text-muted-foreground/30"
                  )}
                />
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {node.label}
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
