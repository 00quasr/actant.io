import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { analyzeProject } from "../../lib/project-analyzer.js";
import { generateDocs } from "../../lib/api.js";
import { writeExportFiles } from "../../lib/writer.js";
import type { ProjectAnalysis, DocsGenerateResult } from "../../types.js";

type Step = "analyzing" | "generating" | "preview" | "writing" | "done" | "error";

interface DocsScreenProps {
  onBack: () => void;
}

export function DocsScreen({ onBack }: DocsScreenProps) {
  const [step, setStep] = useState<Step>("analyzing");
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [docs, setDocs] = useState<DocsGenerateResult | null>(null);
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (key.escape) {
      onBack();
      return;
    }
    if (step === "preview" && key.return) {
      writeDocs();
      return;
    }
    if (step === "preview" && input === "q") {
      onBack();
    }
  });

  const writeDocs = useCallback(() => {
    if (!docs) return;
    setStep("writing");
    try {
      const files = Object.entries(docs.docs).map(([filePath, content]) => ({
        path: filePath,
        content,
      }));
      writeExportFiles(files, process.cwd());
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to write files");
      setStep("error");
    }
  }, [docs]);

  useEffect(() => {
    const cwd = process.cwd();

    analyzeProject(cwd)
      .then((result) => {
        setAnalysis(result);
        setStep("generating");

        const repoContext = {
          name: result.name,
          language: result.language,
          framework: result.framework,
          fileTree: result.fileTree.slice(0, 100),
          packageScripts: result.packageScripts,
          dependencies: result.dependencies,
          ciPlatform: result.ciPlatform,
          testFramework: result.testFramework,
          hasDocker: result.hasDocker,
          envVars: result.envVars,
        };

        return generateDocs({ repoContext });
      })
      .then((result) => {
        setDocs(result);
        setStep("preview");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to generate docs");
        setStep("error");
      });
  }, []);

  if (step === "analyzing") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Generate Docs</Text>
        <Box marginTop={1}>
          <Spinner label="Analyzing project..." />
        </Box>
      </Box>
    );
  }

  if (step === "generating") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Generate Docs</Text>
        {analysis && (
          <Text dimColor>
            Project: {analysis.name} ({analysis.framework ?? analysis.language ?? "unknown"})
          </Text>
        )}
        <Box marginTop={1}>
          <Spinner label="Generating documentation with AI..." />
        </Box>
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

  if (step === "preview" && docs) {
    const files = Object.entries(docs.docs);
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Generate Docs</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            Generated {files.length} file{files.length !== 1 ? "s" : ""}:
          </Text>
          {files.map(([filePath, content]) => (
            <Text key={filePath}>
              <Text dimColor> {filePath}</Text>
              <Text dimColor> ({content.split("\n").length} lines)</Text>
            </Text>
          ))}
        </Box>
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

  if (step === "done" && docs) {
    const fileCount = Object.keys(docs.docs).length;
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green">
          Wrote {fileCount} file{fileCount !== 1 ? "s" : ""} successfully.
        </Text>
        <Box marginTop={1}>
          <Text dimColor>Press ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
