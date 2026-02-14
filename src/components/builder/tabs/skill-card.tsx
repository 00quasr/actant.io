"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { Skill } from "@/types/marketplace";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "@/types/config";

const SOURCE_LABELS: Record<string, string> = {
  builtin: "Official",
  anthropic: "Anthropic",
  "skills.sh": "skills.sh",
  custom: "Community",
};

interface SkillCardProps {
  skill: Skill;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SkillCard({ skill, enabled, onToggle }: SkillCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{skill.name}</span>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {SKILL_CATEGORY_LABELS[skill.category as SkillCategory] ?? skill.category}
            </Badge>
            {skill.source && skill.source !== "custom" && (
              <Badge variant="outline" className="text-[10px] shrink-0">
                {SOURCE_LABELS[skill.source] ?? skill.source}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {skill.description}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="shrink-0"
        />
      </CardContent>
    </Card>
  );
}
