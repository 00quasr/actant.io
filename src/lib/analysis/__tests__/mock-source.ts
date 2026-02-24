/**
 * Mock ProjectDataSource for testing analysis passes.
 */

import type { ProjectDataSource } from "../source";

interface MockSourceOptions {
  name?: string;
  description?: string;
  files?: Record<string, string>;
  directories?: Record<string, string[]>;
}

export class MockSource implements ProjectDataSource {
  readonly type = "filesystem" as const;
  readonly name: string;
  readonly description: string | null;

  private files: Record<string, string>;
  private directories: Record<string, string[]>;

  constructor(options: MockSourceOptions = {}) {
    this.name = options.name ?? "test-project";
    this.description = options.description ?? null;
    this.files = options.files ?? {};
    this.directories = options.directories ?? {};
  }

  async listFiles(): Promise<string[]> {
    const paths: string[] = [];
    for (const key of Object.keys(this.files)) {
      paths.push(key);
    }
    // Add directory entries
    for (const key of Object.keys(this.directories)) {
      if (!paths.includes(key + "/")) {
        paths.push(key + "/");
      }
    }
    return paths;
  }

  async fileExists(path: string): Promise<boolean> {
    const normalized = path.replace(/\/$/, "");
    return (
      normalized in this.files ||
      normalized in this.directories ||
      normalized + "/" in this.directories
    );
  }

  async readFile(path: string): Promise<string | null> {
    return this.files[path] ?? null;
  }

  async readJson<T>(path: string): Promise<T | null> {
    const content = this.files[path];
    if (!content) return null;
    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  async listDirectory(path: string): Promise<string[]> {
    return this.directories[path] ?? [];
  }

  async readFiles(paths: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    for (const p of paths) {
      if (p in this.files) {
        results[p] = this.files[p];
      }
    }
    return results;
  }
}

// ---------------------------------------------------------------------------
// Preset mock projects
// ---------------------------------------------------------------------------

export function createNextjsShadcnProject(): MockSource {
  return new MockSource({
    name: "my-nextjs-app",
    description: "A Next.js app with shadcn/ui",
    files: {
      "package.json": JSON.stringify({
        name: "my-nextjs-app",
        dependencies: {
          next: "14.0.0",
          react: "18.2.0",
          "react-dom": "18.2.0",
          "@supabase/supabase-js": "2.0.0",
          "@radix-ui/react-dialog": "1.0.0",
          "@radix-ui/react-popover": "1.0.0",
          "@radix-ui/react-tooltip": "1.0.0",
          "@radix-ui/react-icons": "1.0.0",
          tailwindcss: "3.4.0",
          stripe: "14.0.0",
          "next-auth": "5.0.0",
          zustand: "4.5.0",
        },
        devDependencies: {
          typescript: "5.3.0",
          vitest: "1.0.0",
          "@playwright/test": "1.40.0",
          eslint: "8.56.0",
          prettier: "3.2.0",
        },
        scripts: {
          dev: "next dev",
          build: "next build",
          lint: "eslint .",
          test: "vitest",
        },
      }),
      "package-lock.json": "{}",
      "next.config.ts": "export default {}",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          strict: true,
          paths: { "@/*": ["./src/*"] },
        },
      }),
      ".eslintrc.json": "{}",
      ".prettierrc": "{}",
      ".env.example":
        "NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSTRIPE_SECRET_KEY=\nNEXTAUTH_SECRET=\n",
      "CLAUDE.md":
        "# Project\n\n## Overview\nThis is a Next.js project.\n\n## Architecture\nApp Router with Supabase.\n\n## Code Style\nTypeScript strict.\n\n## Testing\nVitest for unit tests.\n\n## Deployment\nVercel.",
      "vercel.json": "{}",
      // Source files for convention detection
      "src/app/layout.tsx":
        'import { Inter } from "next/font/google";\nimport "@/styles/globals.css";\nexport default function Layout({ children }) { return children; }',
      "src/app/page.tsx":
        'import { Button } from "@/components/ui/button";\nexport default function Home() { return <Button />; }',
      "src/components/ui/button.tsx":
        'import { cn } from "@/lib/utils";\nexport function Button() {}',
      "src/lib/utils.ts": "export function cn() {}",
      "src/hooks/use-auth.ts":
        'import { create } from "zustand";\nexport const useAuth = create(() => ({}));',
    },
    directories: {
      ".github/workflows": ["ci.yml"],
      ".husky": ["pre-commit"],
      "src/app": ["layout.tsx", "page.tsx"],
      "src/components/ui": ["button.tsx"],
      "src/lib": ["utils.ts"],
      "src/hooks": ["use-auth.ts"],
    },
  });
}

export function createMonorepoProject(): MockSource {
  return new MockSource({
    name: "my-monorepo",
    description: "A turborepo monorepo",
    files: {
      "turbo.json": "{}",
      "package.json": JSON.stringify({
        name: "my-monorepo",
        devDependencies: { typescript: "5.3.0" },
      }),
      "pnpm-lock.yaml": "",
      "pnpm-workspace.yaml": "packages:\n  - packages/*\n  - apps/*",
      "packages/ui/package.json": JSON.stringify({ name: "@my/ui" }),
      "packages/config/package.json": JSON.stringify({ name: "@my/config" }),
      "apps/web/package.json": JSON.stringify({
        name: "@my/web",
        dependencies: { next: "14.0.0", "drizzle-orm": "0.29.0" },
      }),
      "apps/api/package.json": JSON.stringify({
        name: "@my/api",
        dependencies: { fastify: "4.25.0" },
      }),
    },
  });
}

export function createPythonProject(): MockSource {
  return new MockSource({
    name: "my-flask-app",
    description: "A Flask API",
    files: {
      "requirements.txt": "flask==3.0.0\npytest==8.0.0\nredis==5.0.0\n",
      "app.py": "from flask import Flask\napp = Flask(__name__)",
      "conftest.py": "",
      ".gitlab-ci.yml": "test:\n  script: pytest",
      Dockerfile: "FROM python:3.12",
    },
  });
}

export function createMinimalProject(): MockSource {
  return new MockSource({
    name: "tiny",
    files: {
      "index.js": "console.log('hello')",
    },
  });
}
