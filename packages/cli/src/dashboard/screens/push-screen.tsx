import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { scanForConfigs } from "../../lib/scanner.js";
import { parseFiles } from "../../lib/parser.js";
import { pushConfig } from "../../lib/api.js";
import type { ParsedConfig } from "../../lib/parser.js";
import type { PushConfigResult } from "../../types.js";
import path from "node:path";

type Step = "scanning" | "preview" | "pushing" | "done" | "error";

interface PushScreenProps {
  onBack: () => void;
}

export function PushScreen({ onBack }: PushScreenProps) {
  const [step, setStep] = useState<Step>("scanning");
  const [parsed, setParsed] = useState<ParsedConfig | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const [result, setResult] = useState<PushConfigResult | null>(null);
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (key.escape || (input === "q" && step !== "pushing")) {
      onBack();
      return;
    }
    if (step === "preview" && key.return) {
      doPush();
    }
  });

  const doPush = useCallback(() => {
    if (!parsed) return;
    setStep("pushing");

    const data = {
      targetAgent: parsed.targetAgent,
      name: parsed.name,
      description: parsed.description,
      files: [
        {
          path: `${parsed.targetAgent}-config`,
          content: JSON.stringify(parsed, null, 2),
        },
      ],
    };

    pushConfig(data)
      .then((res) => {
        setResult(res);
        setStep("done");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Push failed");
        setStep("error");
      });
  }, [parsed]);

  useEffect(() => {
    const cwd = process.cwd();
    const scanResult = scanForConfigs(cwd);

    if (!scanResult) {
      setError("No agent config files found in this directory.");
      setStep("error");
      return;
    }

    const name = path.basename(cwd);
    const config = parseFiles(scanResult.agentType, scanResult.files, name);
    setParsed(config);
    setFileCount(scanResult.files.length);
    setStep("preview");
  }, []);

  if (step === "scanning") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Scanning for config files..." />
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

  if (step === "preview" && parsed) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Push Config — Preview</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            <Text dimColor>{"Agent:".padEnd(16)}</Text>
            <Text>{parsed.targetAgent}</Text>
          </Text>
          <Text>
            <Text dimColor>{"Name:".padEnd(16)}</Text>
            <Text>{parsed.name}</Text>
          </Text>
          <Text>
            <Text dimColor>{"Files scanned:".padEnd(16)}</Text>
            <Text>{fileCount}</Text>
          </Text>
          {parsed.instructions.content && (
            <Text>
              <Text dimColor>{"Instructions:".padEnd(16)}</Text>
              <Text>{parsed.instructions.content.split("\n").length} lines</Text>
            </Text>
          )}
          {parsed.mcpServers.length > 0 && (
            <Text>
              <Text dimColor>{"MCP Servers:".padEnd(16)}</Text>
              <Text>{parsed.mcpServers.length}</Text>
            </Text>
          )}
          {parsed.rules.length > 0 && (
            <Text>
              <Text dimColor>{"Rules:".padEnd(16)}</Text>
              <Text>{parsed.rules.length}</Text>
            </Text>
          )}
          {parsed.skills.length > 0 && (
            <Text>
              <Text dimColor>{"Skills:".padEnd(16)}</Text>
              <Text>{parsed.skills.length}</Text>
            </Text>
          )}
          {parsed.commands.length > 0 && (
            <Text>
              <Text dimColor>{"Commands:".padEnd(16)}</Text>
              <Text>{parsed.commands.length}</Text>
            </Text>
          )}
          {parsed.agentDefinitions.length > 0 && (
            <Text>
              <Text dimColor>{"Agents:".padEnd(16)}</Text>
              <Text>{parsed.agentDefinitions.length}</Text>
            </Text>
          )}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press ↵ to push, ESC to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (step === "pushing") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Pushing config to Actant..." />
      </Box>
    );
  }

  if (step === "done" && result) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green">Config pushed successfully.</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            <Text dimColor>{"ID:".padEnd(8)}</Text>
            <Text>{result.id}</Text>
          </Text>
          <Text>
            <Text dimColor>{"URL:".padEnd(8)}</Text>
            <Text>{result.url}</Text>
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
