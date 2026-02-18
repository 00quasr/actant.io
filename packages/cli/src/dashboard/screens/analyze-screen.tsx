import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { analyzeProject } from "../../lib/project-analyzer.js";
import type { ProjectAnalysis } from "../../types.js";

interface AnalyzeScreenProps {
  onBack: () => void;
}

export function AnalyzeScreen({ onBack }: AnalyzeScreenProps) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (key.escape || input === "q") {
      onBack();
    }
  });

  useEffect(() => {
    analyzeProject(process.cwd())
      .then((result) => {
        setAnalysis(result);
        setStatus("done");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Analysis failed");
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Analyzing project..." />
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

  if (!analysis) return null;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Project Analysis</Text>
      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text dimColor>{"Name:".padEnd(16)}</Text>
          <Text>{analysis.name}</Text>
        </Text>
        {analysis.framework && (
          <Text>
            <Text dimColor>{"Framework:".padEnd(16)}</Text>
            <Text>{analysis.framework}</Text>
          </Text>
        )}
        {analysis.language && (
          <Text>
            <Text dimColor>{"Language:".padEnd(16)}</Text>
            <Text>{analysis.language}</Text>
          </Text>
        )}
        {analysis.testFramework && (
          <Text>
            <Text dimColor>{"Tests:".padEnd(16)}</Text>
            <Text>{analysis.testFramework}</Text>
          </Text>
        )}
        {analysis.ciPlatform && (
          <Text>
            <Text dimColor>{"CI:".padEnd(16)}</Text>
            <Text>{analysis.ciPlatform}</Text>
          </Text>
        )}
        <Text>
          <Text dimColor>{"Docker:".padEnd(16)}</Text>
          <Text>{analysis.hasDocker ? "yes" : "no"}</Text>
        </Text>
        <Text>
          <Text dimColor>{"Files:".padEnd(16)}</Text>
          <Text>{analysis.fileTree.length}</Text>
        </Text>
        <Text>
          <Text dimColor>{"Key files:".padEnd(16)}</Text>
          <Text>{analysis.keyFiles.length}</Text>
        </Text>
      </Box>

      {analysis.envVars.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold dimColor>
            Environment Variables
          </Text>
          {analysis.envVars.slice(0, 10).map((v, i) => (
            <Text key={`${i}-${v}`} dimColor>
              {" "}
              {v}
            </Text>
          ))}
          {analysis.envVars.length > 10 && (
            <Text dimColor> ...and {analysis.envVars.length - 10} more</Text>
          )}
        </Box>
      )}

      {analysis.packageScripts && (
        <Box marginTop={1} flexDirection="column">
          <Text bold dimColor>
            Scripts
          </Text>
          {Object.entries(analysis.packageScripts)
            .slice(0, 8)
            .map(([name, cmd]) => (
              <Text key={name}>
                <Text dimColor> {name.padEnd(16)}</Text>
                <Text>{cmd.length > 50 ? cmd.slice(0, 47) + "..." : cmd}</Text>
              </Text>
            ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    </Box>
  );
}
