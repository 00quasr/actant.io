/**
 * Agent pass — existing configs for all 7 agents + quality heuristic.
 */

import type { ProjectDataSource } from "../source.js";
import type { AgentAnalysis, AgentConfigDetection, AgentConfigQuality } from "../types.js";
import { AGENT_CONFIG_FILES, AGENT_CONFIG_DIRS } from "../detection-maps.js";

export async function analyzeAgents(source: ProjectDataSource): Promise<AgentAnalysis> {
  const existingConfigs: AgentConfigDetection[] = [];

  // Check single-file agent configs
  for (const [filePath, agent] of Object.entries(AGENT_CONFIG_FILES)) {
    const content = await source.readFile(filePath);
    if (content !== null) {
      const { quality, wordCount, sectionCount } = assessQuality(content, filePath);
      existingConfigs.push({
        agent,
        filePath,
        exists: true,
        quality,
        wordCount,
        sectionCount,
      });
    } else {
      existingConfigs.push({
        agent,
        filePath,
        exists: false,
        quality: "none",
        wordCount: 0,
        sectionCount: 0,
      });
    }
  }

  // Check directory-based agent configs
  for (const [dirPath, agent] of Object.entries(AGENT_CONFIG_DIRS)) {
    // Skip if we already detected this agent from single-file check
    if (existingConfigs.some((c) => c.agent === agent && c.exists)) continue;

    const dirFiles = await source.listDirectory(dirPath);
    const relevantFiles = dirFiles.filter(
      (f) => f.endsWith(".md") || f.endsWith(".mdc") || f.endsWith(".json"),
    );

    if (relevantFiles.length > 0) {
      // Read the first file to assess quality
      const firstFile = relevantFiles[0];
      const content = await source.readFile(`${dirPath}/${firstFile}`);
      const { quality, wordCount, sectionCount } = assessQuality(content ?? "", firstFile);

      existingConfigs.push({
        agent,
        filePath: dirPath,
        exists: true,
        quality,
        wordCount,
        sectionCount,
      });
    }
  }

  const hasAnyConfig = existingConfigs.some((c) => c.exists);

  // Find the best existing config
  let bestConfigAgent: string | null = null;
  let bestScore = 0;
  for (const config of existingConfigs) {
    if (!config.exists) continue;
    const score = qualityScore(config.quality);
    if (score > bestScore) {
      bestScore = score;
      bestConfigAgent = config.agent;
    }
  }

  return {
    existingConfigs,
    hasAnyConfig,
    bestConfigAgent,
  };
}

function assessQuality(
  content: string,
  filePath: string,
): { quality: AgentConfigQuality; wordCount: number; sectionCount: number } {
  // JSON files get a different assessment
  if (filePath.endsWith(".json")) {
    try {
      const parsed = JSON.parse(content);
      const jsonStr = JSON.stringify(parsed);
      const wordCount = jsonStr.split(/\s+/).length;
      const keyCount = Object.keys(parsed).length;
      return {
        quality: keyCount > 5 ? "comprehensive" : keyCount > 2 ? "adequate" : "minimal",
        wordCount,
        sectionCount: keyCount,
      };
    } catch {
      return { quality: "stub", wordCount: 0, sectionCount: 0 };
    }
  }

  // Markdown/text files
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const sectionCount = (content.match(/^#{1,3}\s/gm) ?? []).length;

  let quality: AgentConfigQuality;
  if (wordCount > 1000 && sectionCount >= 5) {
    quality = "comprehensive";
  } else if (wordCount >= 300 && wordCount <= 1000) {
    quality = "adequate";
  } else if (wordCount >= 50 && wordCount < 300) {
    quality = "minimal";
  } else if (wordCount > 0) {
    quality = "stub";
  } else {
    quality = "none";
  }

  return { quality, wordCount, sectionCount };
}

function qualityScore(quality: AgentConfigQuality): number {
  switch (quality) {
    case "comprehensive":
      return 4;
    case "adequate":
      return 3;
    case "minimal":
      return 2;
    case "stub":
      return 1;
    case "none":
      return 0;
  }
}
