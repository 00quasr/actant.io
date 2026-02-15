import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import ora from "ora";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import { isAuthenticated } from "../lib/auth.js";
import { generateDocs } from "../lib/api.js";
import { analyzeProject } from "../lib/project-analyzer.js";
import { writeExportFiles } from "../lib/writer.js";
import { loginCommand } from "./login.js";

const COMMON_DOC_FILES = [
  "CLAUDE.md",
  ".cursorrules",
  ".windsurfrules",
  "opencode.json",
  "CONTRIBUTING.md",
  "ARCHITECTURE.md",
  "DEVELOPMENT.md",
  "SETUP.md",
];

function readExistingDocs(cwd: string): Record<string, string> {
  const docs: Record<string, string> = {};

  for (const fileName of COMMON_DOC_FILES) {
    const filePath = path.join(cwd, fileName);
    if (fs.existsSync(filePath)) {
      try {
        docs[fileName] = fs.readFileSync(filePath, "utf-8");
      } catch {
        // Skip unreadable files
      }
    }
  }

  // Check .clinerules directory
  const clineDir = path.join(cwd, ".clinerules");
  if (fs.existsSync(clineDir)) {
    try {
      const entries = fs.readdirSync(clineDir).filter((f) => f.endsWith(".md"));
      for (const entry of entries) {
        const filePath = path.join(clineDir, entry);
        docs[`.clinerules/${entry}`] = fs.readFileSync(filePath, "utf-8");
      }
    } catch {
      // Skip
    }
  }

  // Check .cursor/rules directory
  const cursorRulesDir = path.join(cwd, ".cursor", "rules");
  if (fs.existsSync(cursorRulesDir)) {
    try {
      const entries = fs.readdirSync(cursorRulesDir).filter((f) => f.endsWith(".mdc"));
      for (const entry of entries) {
        const filePath = path.join(cursorRulesDir, entry);
        docs[`.cursor/rules/${entry}`] = fs.readFileSync(filePath, "utf-8");
      }
    } catch {
      // Skip
    }
  }

  return docs;
}

export const docsCommand = new Command("docs")
  .description("Generate agent documentation for the current project")
  .option("--output <dir>", "Output directory (default: current directory root)")
  .option("--update", "Read existing docs and improve them")
  .option("--name <name>", "Project name override")
  .action(async (options: { output?: string; update?: boolean; name?: string }) => {
    // 1. Check auth
    if (!isAuthenticated()) {
      console.log(chalk.dim("Not authenticated. Starting login flow...\n"));
      await loginCommand.parseAsync([], { from: "user" });

      if (!isAuthenticated()) {
        console.log(chalk.red("Authentication required. Aborting."));
        process.exit(1);
      }
    }

    // 2. Analyze project
    const cwd = process.cwd();
    const spinner = ora("Analyzing project...").start();

    let analysis;
    try {
      analysis = await analyzeProject(cwd);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      spinner.fail(message);
      process.exit(1);
    }

    if (options.name) {
      analysis.name = options.name;
    }

    spinner.succeed("Project analyzed");

    // 3. Display summary
    console.log();
    console.log(`  ${chalk.dim("Project:")} ${analysis.name}`);
    if (analysis.framework) {
      console.log(`  ${chalk.dim("Framework:")} ${analysis.framework}`);
    }
    if (analysis.language) {
      console.log(`  ${chalk.dim("Language:")} ${analysis.language}`);
    }
    console.log(`  ${chalk.dim("Files:")} ${analysis.fileTree.length}`);
    console.log();

    // 4. Read existing docs if --update
    let existingDocs: Record<string, string> | undefined;
    if (options.update) {
      existingDocs = readExistingDocs(cwd);
      const docCount = Object.keys(existingDocs).length;
      if (docCount > 0) {
        console.log(chalk.dim(`Found ${docCount} existing doc(s) to improve.`));
      } else {
        console.log(chalk.dim("No existing docs found. Generating fresh."));
      }
      console.log();
    }

    // 5. Build repo context
    const repoContext: Record<string, unknown> = {
      name: analysis.name,
      description: null,
      language: analysis.language,
      topics: [],
      readme: analysis.keyFiles.find((f) => f.path === "README.md")?.content ?? null,
      fileTree: analysis.fileTree,
      packageDeps: analysis.dependencies,
      devDeps: analysis.devDependencies,
      tsconfigOptions: null,
      packageScripts: analysis.packageScripts,
      ciWorkflows:
        analysis.keyFiles
          .filter((f) => f.path.includes(".github/workflows"))
          .map((f) => f.content)
          .join("\n---\n") || null,
      dockerConfig: analysis.keyFiles.find((f) => f.path === "Dockerfile")?.content ?? null,
      testConfig:
        analysis.keyFiles.find((f) => /jest|vitest|playwright/.test(f.path))?.content ?? null,
      envExample: analysis.keyFiles.find((f) => f.path === ".env.example")?.content ?? null,
      existingAgentConfig:
        analysis.keyFiles.find((f) => f.path === "CLAUDE.md" || f.path === ".cursorrules")
          ?.content ?? null,
    };

    // 6. Generate docs via API
    const genSpinner = ora("Generating documentation...").start();

    let result;
    try {
      result = await generateDocs({
        repoContext,
        existingDocs,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      genSpinner.fail(message);
      process.exit(1);
    }

    genSpinner.succeed("Documentation generated");
    console.log();

    // 7. Show preview
    const fileEntries = Object.entries(result.docs);
    console.log(chalk.bold("Generated files:"));
    for (const [filePath, content] of fileEntries) {
      const words = content.split(/\s+/).length;
      console.log(`  ${filePath} ${chalk.dim(`(${words} words)`)}`);
    }
    console.log();

    // 8. Confirm
    const proceed = await confirm({
      message: "Write generated docs to disk?",
      default: true,
    });

    if (!proceed) {
      console.log(chalk.dim("Aborted."));
      process.exit(0);
    }

    // 9. Write files
    const outputDir = options.output ? path.resolve(cwd, options.output) : cwd;
    const files = fileEntries.map(([filePath, content]) => ({
      path: filePath,
      content,
    }));

    const writeResult = writeExportFiles(files, outputDir);

    console.log();
    console.log(chalk.green("Docs written successfully!"));
    for (const written of writeResult.written) {
      console.log(`  ${chalk.dim("+")} ${written}`);
    }
    console.log();
  });
