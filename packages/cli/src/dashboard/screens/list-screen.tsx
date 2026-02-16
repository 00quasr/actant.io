import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { getConfigs } from "../../lib/api.js";
import type { ConfigListItem } from "../../types.js";

interface ListScreenProps {
  onBack: () => void;
}

export function ListScreen({ onBack }: ListScreenProps) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [configs, setConfigs] = useState<ConfigListItem[]>([]);
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (key.escape || input === "q") {
      onBack();
    }
  });

  useEffect(() => {
    getConfigs()
      .then((result) => {
        setConfigs(result);
        setStatus("done");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to fetch configs");
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Fetching configs..." />
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    );
  }

  if (configs.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>My Configs</Text>
        <Box marginTop={1}>
          <Text dimColor>No configs found. Use "Push Config" to create one.</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>My Configs ({configs.length})</Text>
      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text bold>{"  Name".padEnd(28)}</Text>
          <Text bold>{"Agent".padEnd(16)}</Text>
          <Text bold>Updated</Text>
        </Text>
        {configs.map((config) => {
          const name = config.name.length > 24
            ? config.name.slice(0, 21) + "..."
            : config.name;
          const date = new Date(config.updated_at).toLocaleDateString();

          return (
            <Text key={config.id}>
              <Text>{"  "}{name.padEnd(26)}</Text>
              <Text dimColor>{config.target_agent.padEnd(16)}</Text>
              <Text dimColor>{date}</Text>
            </Text>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    </Box>
  );
}
