"use client";

import { useState, useCallback } from "react";
import {
  GitHubLogoIcon,
  CheckIcon,
  ReloadIcon,
  GlobeIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRepoImport } from "@/hooks/use-repo-import";
import type { AgentConfig, AgentType } from "@/types/config";

const GITHUB_URL_REGEX =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

type RepoVisibility = "public" | "private";

interface RepoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAgent: AgentType;
  onAccept: (config: AgentConfig) => void;
}

export function RepoImportDialog({
  open,
  onOpenChange,
  targetAgent,
  onAccept,
}: RepoImportDialogProps) {
  const { status, result, error, importRepo, reset } = useRepoImport();
  const [repoUrl, setRepoUrl] = useState("");
  const [visibility, setVisibility] = useState<RepoVisibility>("public");
  const [accessToken, setAccessToken] = useState("");
  const [tokenVisible, setTokenVisible] = useState(false);

  const resetForm = useCallback(() => {
    setRepoUrl("");
    setVisibility("public");
    setAccessToken("");
    setTokenVisible(false);
    reset();
  }, [reset]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  const isValidUrl = GITHUB_URL_REGEX.test(repoUrl.trim());

  async function handleImport() {
    await importRepo({
      repoUrl: repoUrl.trim(),
      targetAgent,
      accessToken: visibility === "private" ? accessToken.trim() || undefined : undefined,
    });
  }

  function handleAccept() {
    if (result) {
      onAccept(result);
      handleOpenChange(false);
    }
  }

  function handleRegenerate() {
    reset();
    handleImport();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitHubLogoIcon className="size-4" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Analyze a GitHub repository to generate a tailored configuration.
          </DialogDescription>
        </DialogHeader>

        {status === "idle" || status === "error" ? (
          <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
            {/* Repository type toggle */}
            <div className="space-y-2">
              <Label>Repository type</Label>
              <div className="grid grid-cols-2 gap-3">
                <VisibilityCard
                  type="public"
                  selected={visibility === "public"}
                  onSelect={() => setVisibility("public")}
                />
                <VisibilityCard
                  type="private"
                  selected={visibility === "private"}
                  onSelect={() => setVisibility("private")}
                />
              </div>
            </div>

            {/* Access token field (private repos only) */}
            {visibility === "private" && (
              <div className="space-y-2">
                <Label htmlFor="access-token">Personal access token</Label>
                <div className="relative">
                  <Input
                    id="access-token"
                    type={tokenVisible ? "text" : "password"}
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setTokenVisible(!tokenVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tokenVisible ? (
                      <EyeNoneIcon className="size-4" />
                    ) : (
                      <EyeOpenIcon className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for accessing private repositories.{" "}
                  <a
                    href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    How to get an access token?
                  </a>
                </p>
              </div>
            )}

            {/* Repository URL */}
            <div className="space-y-2">
              <Label htmlFor="repo-url">Git repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              {repoUrl && !isValidUrl ? (
                <p className="text-xs text-muted-foreground">
                  Enter a valid GitHub repository URL
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter a GitHub repository URL to analyze
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={
                !isValidUrl ||
                (visibility === "private" && !accessToken.trim())
              }
              className="w-full"
            >
              Analyze Repository
            </Button>
          </div>
        ) : status === "importing" ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <ReloadIcon className="size-6 animate-spin text-muted-foreground" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                Analyzing repository...
              </p>
              <p className="text-xs text-muted-foreground">
                Fetching README, dependencies, and project structure.
              </p>
            </div>
          </div>
        ) : status === "done" && result ? (
          <ImportPreview
            result={result}
            onAccept={handleAccept}
            onRegenerate={handleRegenerate}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Visibility Card                                                     */
/* ------------------------------------------------------------------ */

function VisibilityCard({
  type,
  selected,
  onSelect,
}: {
  type: RepoVisibility;
  selected: boolean;
  onSelect: () => void;
}) {
  const isPublic = type === "public";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors ${
        selected
          ? "border-foreground bg-muted/50"
          : "border-border hover:border-foreground/30"
      }`}
    >
      {isPublic ? (
        <GlobeIcon className="size-5" />
      ) : (
        <LockClosedIcon className="size-5" />
      )}
      <div>
        <p className="text-sm font-medium">
          {isPublic ? "Public" : "Private"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isPublic
            ? "No access token required"
            : "Access token required"}
        </p>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Import Preview                                                      */
/* ------------------------------------------------------------------ */

interface ImportPreviewProps {
  result: AgentConfig;
  onAccept: () => void;
  onRegenerate: () => void;
}

function ImportPreview({
  result,
  onAccept,
  onRegenerate,
}: ImportPreviewProps) {
  return (
    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">{result.name}</p>
          <p className="text-xs text-muted-foreground">
            {result.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SummaryBadge
            label="Instructions"
            value={`${result.instructions.content.length} chars`}
          />
          <SummaryBadge
            label="Rules"
            value={String(result.rules.length)}
          />
          <SummaryBadge
            label="MCP Servers"
            value={String(result.mcpServers.length)}
          />
          <SummaryBadge
            label="Permissions"
            value={String(Object.keys(result.permissions).length)}
          />
          {result.docs && Object.keys(result.docs).length > 0 && (
            <SummaryBadge
              label="Docs"
              value={`${Object.keys(result.docs).length} files`}
            />
          )}
        </div>

        {result.instructions.content && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Instructions preview
            </p>
            <div className="rounded-md border bg-muted/30 p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                {result.instructions.content.slice(0, 800)}
                {result.instructions.content.length > 800 && "..."}
              </pre>
            </div>
          </div>
        )}

        {result.rules.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Rules</p>
            <div className="space-y-1">
              {result.rules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                >
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>{rule.title}</span>
                  {rule.glob && (
                    <span className="text-muted-foreground font-mono">
                      {rule.glob}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.mcpServers.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              MCP Servers
            </p>
            <div className="space-y-1">
              {result.mcpServers.map((server, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                >
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span className="font-medium">{server.name}</span>
                  <span className="text-muted-foreground">
                    ({server.type})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.docs && Object.keys(result.docs).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Documentation</p>
            <div className="space-y-1">
              {Object.entries(result.docs).map(([filename, content]) => (
                <div key={filename} className="flex items-center justify-between text-xs text-foreground/80">
                  <div className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                    <span className="font-medium">{filename}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onRegenerate} className="flex-1">
          <ReloadIcon className="size-4" />
          Regenerate
        </Button>
        <Button onClick={onAccept} className="flex-1">
          <CheckIcon className="size-4" />
          Accept
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Summary Badge                                                       */
/* ------------------------------------------------------------------ */

function SummaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
