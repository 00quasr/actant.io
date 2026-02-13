import { Badge } from "@/components/ui/badge";
import { AGENT_LABELS, type AgentType } from "@/types/config";

interface AgentBadgeProps {
  agent: AgentType;
  className?: string;
}

export function AgentBadge({ agent, className }: AgentBadgeProps) {
  return (
    <Badge variant="secondary" className={className}>
      {AGENT_LABELS[agent]}
    </Badge>
  );
}
