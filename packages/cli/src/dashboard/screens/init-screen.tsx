import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { getConfigs, exportConfig } from "../../lib/api.js";
import { writeExportFiles, getExistingFiles } from "../../lib/writer.js";
import type { ConfigListItem, AgentType, ExportResult } from "../../types.js";

type Step = "loading" | "select-config" | "select-agent" | "exporting" | "preview" | "writing" | "done" | "error";

const AGENT_OPTIONS: { id: AgentType; label: string }[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "windsurf", label: "Windsurf" },
  { id: "cline", label: "Cline" },
  { id: "opencode", label: "OpenCode" },
];

interface InitScreenProps {
  onBack: () => void;
}

export function InitScreen({ onBack }: InitScreenProps) {
  const [step, setStep] = useState<Step>("loading");
  const [configs, setConfigs] = useState<ConfigListItem[]>([]);
  const [configCursor, setConfigCursor] = useState(0);
  const [agentCursor, setAgentCursor] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState<ConfigListItem | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (key.escape) {
      if (step === "select-agent") {
        setStep("select-config");
        return;
      }
      onBack();
      return;
    }

    if (step === "select-config") {
      if (input === "k" || key.upArrow) {
        setConfigCursor((p) => (p > 0 ? p - 1 : configs.length - 1));
      } else if (input === "j" || key.downArrow) {
        setConfigCursor((p) => (p < configs.length - 1 ? p + 1 : 0));
      } else if (key.return && configs[configCursor]) {
        setSelectedConfig(configs[configCursor]);
        setStep("select-agent");
      }
      return;
    }

    if (step === "select-agent") {
      if (input === "k" || key.upArrow) {
        setAgentCursor((p) => (p > 0 ? p - 1 : AGENT_OPTIONS.length - 1));
      } else if (input === "j" || key.downArrow) {
        setAgentCursor((p) => (p < AGENT_OPTIONS.length - 1 ? p + 1 : 0));
      } else if (key.return) {
        doExport();
      }
      return;
    }

    if (step === "preview" && key.return) {
      writeFiles();
    }
  });

  const doExport = useCallback(() => {
    if (!selectedConfig) return;
    const agent = AGENT_OPTIONS[agentCursor];
    if (!agent) return;

    setStep("exporting");
    exportConfig(selectedConfig.id, agent.id)
      .then((result) => {
        setExportResult(result);
        const existing = getExistingFiles(result.files, process.cwd());
        setConflicts(existing);
        setStep("preview");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Export failed");
        setStep("error");
      });
  }, [selectedConfig, agentCursor]);

  const writeFiles = useCallback(() => {
    if (!exportResult) return;
    setStep("writing");
    try {
      writeExportFiles(exportResult.files, process.cwd());
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to write files");
      setStep("error");
    }
  }, [exportResult]);

  useEffect(() => {
    getConfigs()
      .then((result) => {
        setConfigs(result);
        setStep(result.length > 0 ? "select-config" : "error");
        if (result.length === 0) setError("No configs found.");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to fetch configs");
        setStep("error");
      });
  }, []);

  if (step === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Fetching configs..." />
      </Box>
    );
  }

  if (step === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    );
  }

  if (step === "select-config") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Pull Config — Select a config</Text>
        <Box marginTop={1} flexDirection="column">
          {configs.map((config, i) => {
            const selected = i === configCursor;
            const name = config.name.length > 30
              ? config.name.slice(0, 27) + "..."
              : config.name;
            return (
              <Box key={config.id}>
                <Text color={selected ? "cyan" : undefined}>
                  {selected ? " > " : "   "}
                </Text>
                <Text bold={selected} color={selected ? "cyan" : undefined}>
                  {name}
                </Text>
                <Text dimColor> ({config.target_agent})</Text>
              </Box>
            );
          })}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>↑↓ select  ↵ confirm  ESC back</Text>
        </Box>
      </Box>
    );
  }

  if (step === "select-agent") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Pull Config — Select target agent</Text>
        <Text dimColor>Config: {selectedConfig?.name}</Text>
        <Box marginTop={1} flexDirection="column">
          {AGENT_OPTIONS.map((agent, i) => {
            const selected = i === agentCursor;
            return (
              <Box key={agent.id}>
                <Text color={selected ? "cyan" : undefined}>
                  {selected ? " > " : "   "}
                </Text>
                <Text bold={selected} color={selected ? "cyan" : undefined}>
                  {agent.label}
                </Text>
              </Box>
            );
          })}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>↑↓ select  ↵ confirm  ESC back</Text>
        </Box>
      </Box>
    );
  }

  if (step === "exporting") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Exporting config..." />
      </Box>
    );
  }

  if (step === "preview" && exportResult) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Pull Config — Preview</Text>
        <Box marginTop={1} flexDirection="column">
          {exportResult.files.map((file) => {
            const isConflict = conflicts.includes(file.path);
            return (
              <Text key={file.path}>
                <Text dimColor>  {file.path}</Text>
                {isConflict && <Text color="yellow"> (overwrite)</Text>}
              </Text>
            );
          })}
        </Box>
        {exportResult.warnings.length > 0 && (
          <Box marginTop={1} flexDirection="column">
            {exportResult.warnings.map((w, i) => (
              <Text key={i} color="yellow">  {w}</Text>
            ))}
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>Press ↵ to write files, ESC to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (step === "writing") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Writing files..." />
      </Box>
    );
  }

  if (step === "done" && exportResult) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green">
          Wrote {exportResult.files.length} file{exportResult.files.length !== 1 ? "s" : ""} successfully.
        </Text>
        <Box marginTop={1}>
          <Text dimColor>Press ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
