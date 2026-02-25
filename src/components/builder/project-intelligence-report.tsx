"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import type { ProjectProfile, TechStackItem, Confidence } from "@/lib/analysis/types";

interface ProjectIntelligenceReportProps {
  profile: ProjectProfile;
}

export function ProjectIntelligenceReport({ profile }: ProjectIntelligenceReportProps) {
  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Project Analysis</p>
          <span className="text-xs text-muted-foreground">
            {profile.summary.detectionCount} detections
          </span>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap gap-1.5">
          {profile.summary.techStack.map((item) => (
            <TechBadge key={`${item.category}-${item.name}`} item={item} />
          ))}
        </div>
      </div>

      {/* Collapsible sections */}
      <CollapsibleSection title="Structure" defaultOpen={false}>
        <div className="space-y-1.5 text-xs">
          <InfoRow
            label="Architecture"
            value={profile.structure.architecture.value}
            confidence={profile.structure.architecture.confidence}
          />
          <InfoRow label="Files" value={String(profile.structure.totalFiles)} />
          <InfoRow label="Directories" value={String(profile.structure.totalDirectories)} />
          {profile.structure.modules.length > 0 && (
            <div className="mt-1">
              <span className="text-muted-foreground">Modules:</span>{" "}
              {profile.structure.modules.map((m) => m.name).join(", ")}
            </div>
          )}
          {profile.structure.entryPoints.length > 0 && (
            <div>
              <span className="text-muted-foreground">Entry points:</span>{" "}
              {profile.structure.entryPoints.join(", ")}
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Dependencies" defaultOpen={false}>
        <div className="space-y-1.5 text-xs">
          <DetectionRow label="Package manager" detection={profile.dependencies.packageManager} />
          <DetectionRow label="Framework" detection={profile.dependencies.framework} />
          <DetectionRow label="Language" detection={profile.dependencies.language} />
          <DetectionRow label="Runtime" detection={profile.dependencies.runtime} />
          <DetectionRow label="ORM" detection={profile.dependencies.orm} />
          <DetectionRow label="State mgmt" detection={profile.dependencies.stateManagement} />
          <DetectionRow label="UI library" detection={profile.dependencies.componentLibrary} />
          <DetectionRow label="API style" detection={profile.dependencies.apiStyle} />
          <DetectionRow label="Build tool" detection={profile.dependencies.buildTool} />
          <DetectionRow label="Test framework" detection={profile.dependencies.testFramework} />
          <InfoRow
            label="Dependencies"
            value={`${profile.dependencies.dependencyCount} prod, ${profile.dependencies.devDependencyCount} dev`}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Conventions" defaultOpen={false}>
        <div className="space-y-1.5 text-xs">
          <DetectionRow label="File naming" detection={profile.conventions.fileNaming} />
          <DetectionRow label="Import style" detection={profile.conventions.importStyle} />
          <DetectionRow label="Test pattern" detection={profile.conventions.testPattern} />
          <DetectionRow label="Linter" detection={profile.conventions.linter} />
          <DetectionRow label="Formatter" detection={profile.conventions.formatter} />
          <DetectionRow label="Git hooks" detection={profile.conventions.gitHooks} />
          <BoolRow label="EditorConfig" value={profile.conventions.hasEditorConfig} />
          <BoolRow label="CommitLint" value={profile.conventions.hasCommitLint} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Integrations" defaultOpen={false}>
        <div className="space-y-1.5 text-xs">
          <IntegrationList label="Databases" items={profile.integrations.databases} />
          <IntegrationList label="Auth" items={profile.integrations.auth} />
          <IntegrationList label="CI/CD" items={profile.integrations.ci} />
          <IntegrationList label="Deployment" items={profile.integrations.deployment} />
          <IntegrationList label="Monitoring" items={profile.integrations.monitoring} />
          <IntegrationList label="Payments" items={profile.integrations.payments} />
          {profile.integrations.envVarGroups.length > 0 && (
            <div className="mt-1">
              <span className="text-muted-foreground">Env var groups:</span>{" "}
              {profile.integrations.envVarGroups
                .map((g) => `${g.category} (${g.vars.length})`)
                .join(", ")}
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Existing Agent Configs" defaultOpen={false}>
        <div className="space-y-1.5 text-xs">
          {profile.agents.existingConfigs
            .filter((c) => c.exists)
            .map((c) => (
              <div key={c.agent} className="flex items-center justify-between">
                <span>
                  <span className="font-medium">{c.agent}</span>{" "}
                  <span className="text-muted-foreground">({c.filePath})</span>
                </span>
                <QualityBadge quality={c.quality} />
              </div>
            ))}
          {!profile.agents.hasAnyConfig && (
            <p className="text-muted-foreground">No existing agent configs found</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Gaps */}
      {profile.summary.gaps.length > 0 && (
        <CollapsibleSection title={`Gaps (${profile.summary.gaps.length})`} defaultOpen={false}>
          <div className="space-y-1.5 text-xs">
            {profile.summary.gaps.map((gap) => (
              <div key={gap.area} className="flex items-start gap-1.5">
                <InfoCircledIcon className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span>
                  <span className="font-medium">{gap.area}:</span>{" "}
                  <span className="text-muted-foreground">{gap.suggestion}</span>
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TechBadge({ item }: { item: TechStackItem }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs ${
        item.confidence === "high"
          ? "border-foreground/20 text-foreground"
          : item.confidence === "medium"
            ? "border-foreground/10 text-foreground/80"
            : "border-border text-muted-foreground"
      }`}
    >
      <ConfidenceDot confidence={item.confidence} />
      {item.name}
    </span>
  );
}

function ConfidenceDot({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`size-1.5 rounded-full ${
        confidence === "high"
          ? "bg-foreground"
          : confidence === "medium"
            ? "bg-foreground/50"
            : "bg-foreground/20"
      }`}
    />
  );
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors"
      >
        {title}
        {open ? (
          <ChevronDownIcon className="size-3.5" />
        ) : (
          <ChevronRightIcon className="size-3.5" />
        )}
      </button>
      {open && <div className="px-3 pb-2.5">{children}</div>}
    </div>
  );
}

function InfoRow({
  label,
  value,
  confidence,
}: {
  label: string;
  value: string;
  confidence?: Confidence;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1">
        {confidence && <ConfidenceDot confidence={confidence} />}
        {value}
      </span>
    </div>
  );
}

function DetectionRow<T>({
  label,
  detection,
}: {
  label: string;
  detection: { value: T; confidence: Confidence; evidence: string } | null;
}) {
  if (!detection) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/50">—</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1" title={detection.evidence}>
        <ConfidenceDot confidence={detection.confidence} />
        {String(detection.value)}
      </span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        <CheckCircledIcon className="size-3.5 text-foreground/70" />
      ) : (
        <CrossCircledIcon className="size-3.5 text-muted-foreground/30" />
      )}
    </div>
  );
}

function IntegrationList({
  label,
  items,
}: {
  label: string;
  items: Array<{ name: string; confidence: Confidence; evidence: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      {items.map((item, i) => (
        <span key={item.name}>
          {i > 0 && ", "}
          <span title={item.evidence} className="inline-flex items-center gap-0.5">
            <ConfidenceDot confidence={item.confidence} />
            {item.name}
          </span>
        </span>
      ))}
    </div>
  );
}

function QualityBadge({ quality }: { quality: string }) {
  const colors: Record<string, string> = {
    comprehensive: "text-foreground",
    adequate: "text-foreground/70",
    minimal: "text-muted-foreground",
    stub: "text-muted-foreground/50",
  };
  return <span className={`${colors[quality] ?? "text-muted-foreground"}`}>{quality}</span>;
}
