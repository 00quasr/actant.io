import { Badge } from "@/components/ui/badge";

interface PlanBadgeProps {
  plan: "free" | "pro";
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === "pro") {
    return (
      <Badge variant="default" className="text-xs">
        Pro
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Free
    </Badge>
  );
}
