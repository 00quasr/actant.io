"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";
import { USE_CASE_LABELS, type UseCase } from "@/types/config";

const USE_CASES: UseCase[] = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "general",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rated", label: "Highest Rated" },
];

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedAgents = searchParams.get("agent")?.split(",").filter(Boolean) ?? [];
  const selectedUseCases = searchParams.get("use_case")?.split(",").filter(Boolean) ?? [];
  const currentSort = searchParams.get("sort") ?? "newest";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/marketplace?${params.toString()}`);
  }

  function toggleFilter(key: string, value: string, current: string[]) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateParams(key, next.join(","));
  }

  return (
    <aside className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Sort By</h3>
        <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Agent Type</h3>
        <div className="space-y-2">
          {AGENT_TYPES.map((agent) => (
            <div key={agent} className="flex items-center gap-2">
              <Checkbox
                id={`agent-${agent}`}
                checked={selectedAgents.includes(agent)}
                onCheckedChange={() => toggleFilter("agent", agent, selectedAgents)}
              />
              <Label htmlFor={`agent-${agent}`} className="text-sm font-normal">
                {AGENT_LABELS[agent as AgentType]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Use Case</h3>
        <div className="space-y-2">
          {USE_CASES.map((uc) => (
            <div key={uc} className="flex items-center gap-2">
              <Checkbox
                id={`uc-${uc}`}
                checked={selectedUseCases.includes(uc)}
                onCheckedChange={() => toggleFilter("use_case", uc, selectedUseCases)}
              />
              <Label htmlFor={`uc-${uc}`} className="text-sm font-normal">
                {USE_CASE_LABELS[uc]}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
