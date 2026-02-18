"use client";

import { useEffect, useState } from "react";
import { listSkills } from "@/services/skills";
import { SkillCard } from "@/components/builder/tabs/skill-card";
import type { Skill } from "@/types/marketplace";
import type { AgentType, SkillEntry } from "@/types/config";

interface SkillsTabProps {
  skills: SkillEntry[];
  targetAgent: AgentType;
  addSkill: (skill: SkillEntry) => void;
  removeSkill: (skillId: string) => void;
}

export function SkillsTab({ skills, targetAgent, addSkill, removeSkill }: SkillsTabProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSkills()
      .then(setAvailableSkills)
      .catch(() => setAvailableSkills([]))
      .finally(() => setLoading(false));
  }, []);

  const enabledIds = new Set(skills.filter((s) => s.enabled).map((s) => s.skillId));

  const handleToggle = (skillId: string, enabled: boolean) => {
    if (enabled) {
      const skill = availableSkills.find((s) => s.id === skillId);
      addSkill({
        skillId,
        enabled: true,
        params: skill?.content ? { content: skill.content } : {},
      });
    } else {
      removeSkill(skillId);
    }
  };

  const compatibleSkills = availableSkills.filter(
    (s) => s.compatible_agents.length === 0 || s.compatible_agents.includes(targetAgent),
  );

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (compatibleSkills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">
          No skills available yet. Skills will appear here as they are added to the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {compatibleSkills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          enabled={enabledIds.has(skill.id)}
          onToggle={(enabled) => handleToggle(skill.id, enabled)}
        />
      ))}
    </div>
  );
}
