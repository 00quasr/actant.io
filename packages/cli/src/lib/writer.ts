import fs from "node:fs";
import path from "node:path";
import type { ExportFile } from "../types.js";

export interface WriteResult {
  written: string[];
  skipped: string[];
}

export function getExistingFiles(files: ExportFile[], cwd: string): string[] {
  return files.map((f) => f.path).filter((p) => fs.existsSync(path.resolve(cwd, p)));
}

export function writeExportFiles(files: ExportFile[], cwd: string): WriteResult {
  const written: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const fullPath = path.resolve(cwd, file.path);
    const dir = path.dirname(fullPath);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, file.content, "utf-8");
    written.push(file.path);
  }

  return { written, skipped };
}
