/**
 * Static lookup tables for the analysis engine.
 * All detection logic uses these maps — keep them sorted alphabetically within categories.
 */

// ---------------------------------------------------------------------------
// Framework detection (dep name → framework label)
// ---------------------------------------------------------------------------

export const FRAMEWORK_DEPS: Record<string, string> = {
  "@angular/core": "angular",
  "@remix-run/react": "remix",
  "@sveltejs/kit": "sveltekit",
  astro: "astro",
  express: "express",
  fastify: "fastify",
  gatsby: "gatsby",
  hono: "hono",
  next: "next.js",
  nuxt: "nuxt",
  svelte: "svelte",
  vue: "vue",
  "@nestjs/core": "nestjs",
};

export const FRAMEWORK_FILES: Record<string, string> = {
  "angular.json": "angular",
  "astro.config.mjs": "astro",
  "astro.config.ts": "astro",
  "gatsby-config.js": "gatsby",
  "gatsby-config.ts": "gatsby",
  "nest-cli.json": "nestjs",
  "next.config.js": "next.js",
  "next.config.mjs": "next.js",
  "next.config.ts": "next.js",
  "nuxt.config.js": "nuxt",
  "nuxt.config.ts": "nuxt",
  "remix.config.js": "remix",
  "svelte.config.js": "svelte",
  "manage.py": "django",
  "settings.py": "django",
  Gemfile: "rails",
  "config/routes.rb": "rails",
  "go.mod": "go",
  "Cargo.toml": "rust",
};

// ---------------------------------------------------------------------------
// ORM detection
// ---------------------------------------------------------------------------

export const ORM_DEPS: Record<string, string> = {
  "@prisma/client": "prisma",
  prisma: "prisma",
  "drizzle-orm": "drizzle",
  typeorm: "typeorm",
  sequelize: "sequelize",
  mongoose: "mongoose",
  knex: "knex",
  kysely: "kysely",
};

// ---------------------------------------------------------------------------
// State management detection
// ---------------------------------------------------------------------------

export const STATE_DEPS: Record<string, string> = {
  "@reduxjs/toolkit": "redux",
  "react-redux": "redux",
  redux: "redux",
  zustand: "zustand",
  jotai: "jotai",
  recoil: "recoil",
  pinia: "pinia",
  vuex: "vuex",
  mobx: "mobx",
  xstate: "xstate",
  valtio: "valtio",
};

// ---------------------------------------------------------------------------
// Component library detection
// ---------------------------------------------------------------------------

export const COMPONENT_LIB_DEPS: Record<string, string> = {
  "@mui/material": "mui",
  "@mui/core": "mui",
  antd: "antd",
  "@chakra-ui/react": "chakra",
  "@mantine/core": "mantine",
  "@headlessui/react": "headless-ui",
};

/** shadcn is detected by having multiple @radix-ui deps + tailwindcss */
export const SHADCN_INDICATORS = {
  radixPrefix: "@radix-ui/",
  minRadixDeps: 3,
  requiredDep: "tailwindcss",
};

// ---------------------------------------------------------------------------
// Build tool detection
// ---------------------------------------------------------------------------

export const BUILD_TOOL_DEPS: Record<string, string> = {
  vite: "vite",
  webpack: "webpack",
  esbuild: "esbuild",
  "@swc/core": "swc",
  tsup: "tsup",
  rollup: "rollup",
};

export const BUILD_TOOL_FILES: Record<string, string> = {
  "vite.config.ts": "vite",
  "vite.config.js": "vite",
  "webpack.config.js": "webpack",
  "webpack.config.ts": "webpack",
  "esbuild.config.js": "esbuild",
  "tsup.config.ts": "tsup",
  "tsup.config.js": "tsup",
  "rollup.config.js": "rollup",
  "rollup.config.ts": "rollup",
};

// ---------------------------------------------------------------------------
// API style detection
// ---------------------------------------------------------------------------

export const API_STYLE_DEPS: Record<string, string> = {
  "@trpc/server": "trpc",
  "@trpc/client": "trpc",
  graphql: "graphql",
  "@apollo/server": "graphql",
  "@apollo/client": "graphql",
  "apollo-server": "graphql",
  "@graphql-tools/schema": "graphql",
  "type-graphql": "graphql",
  "@grpc/grpc-js": "grpc",
};

// ---------------------------------------------------------------------------
// Test framework detection
// ---------------------------------------------------------------------------

export const TEST_DEPS: Record<string, string> = {
  vitest: "vitest",
  jest: "jest",
  "@jest/core": "jest",
  mocha: "mocha",
  "@playwright/test": "playwright",
  playwright: "playwright",
  cypress: "cypress",
  ava: "ava",
};

export const TEST_FILES: Record<string, string> = {
  "vitest.config.ts": "vitest",
  "vitest.config.js": "vitest",
  "jest.config.ts": "jest",
  "jest.config.js": "jest",
  "jest.config.mjs": "jest",
  "playwright.config.ts": "playwright",
  "playwright.config.js": "playwright",
  "cypress.config.ts": "cypress",
  "cypress.config.js": "cypress",
  ".mocharc.yml": "mocha",
  ".mocharc.js": "mocha",
  "pytest.ini": "pytest",
  "conftest.py": "pytest",
};

// ---------------------------------------------------------------------------
// Database / service detection (from dependencies)
// ---------------------------------------------------------------------------

export const DATABASE_DEPS: Record<string, string> = {
  "@supabase/supabase-js": "supabase",
  firebase: "firebase",
  "firebase-admin": "firebase",
  pg: "postgresql",
  postgres: "postgresql",
  "@neondatabase/serverless": "neon",
  mongodb: "mongodb",
  redis: "redis",
  ioredis: "redis",
  "@upstash/redis": "upstash-redis",
  "better-sqlite3": "sqlite",
  "@libsql/client": "turso",
  "@planetscale/database": "planetscale",
  mysql2: "mysql",
};

// ---------------------------------------------------------------------------
// Auth provider detection
// ---------------------------------------------------------------------------

export const AUTH_DEPS: Record<string, string> = {
  "next-auth": "next-auth",
  "@auth/core": "auth-js",
  "@clerk/nextjs": "clerk",
  "@clerk/clerk-react": "clerk",
  "@auth0/nextjs-auth0": "auth0",
  "@auth0/auth0-react": "auth0",
  lucia: "lucia",
  "@kinde-oss/kinde-auth-nextjs": "kinde",
  passport: "passport",
  "@supabase/auth-helpers-nextjs": "supabase-auth",
};

// ---------------------------------------------------------------------------
// Deployment target detection (config files)
// ---------------------------------------------------------------------------

export const DEPLOY_FILES: Record<string, string> = {
  "vercel.json": "vercel",
  ".vercel/project.json": "vercel",
  "netlify.toml": "netlify",
  "fly.toml": "fly",
  "railway.json": "railway",
  "wrangler.toml": "cloudflare",
  "wrangler.json": "cloudflare",
  "serverless.yml": "aws-serverless",
  "serverless.yaml": "aws-serverless",
  "app.yaml": "gcp",
  "render.yaml": "render",
  Dockerfile: "docker",
  "docker-compose.yml": "docker",
  "docker-compose.yaml": "docker",
};

// ---------------------------------------------------------------------------
// CI platform detection
// ---------------------------------------------------------------------------

export const CI_INDICATORS: Record<string, string[]> = {
  "github-actions": [".github/workflows"],
  "gitlab-ci": [".gitlab-ci.yml"],
  circleci: [".circleci/config.yml", ".circleci"],
  jenkins: ["Jenkinsfile"],
  "azure-pipelines": ["azure-pipelines.yml"],
  "travis-ci": [".travis.yml"],
  "bitbucket-pipelines": ["bitbucket-pipelines.yml"],
};

// ---------------------------------------------------------------------------
// Monitoring / observability
// ---------------------------------------------------------------------------

export const MONITORING_DEPS: Record<string, string> = {
  "@sentry/nextjs": "sentry",
  "@sentry/node": "sentry",
  "@sentry/react": "sentry",
  "dd-trace": "datadog",
  "posthog-js": "posthog",
  "@posthog/node": "posthog",
  "@opentelemetry/api": "opentelemetry",
  newrelic: "new-relic",
  "@logtail/node": "logtail",
};

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const PAYMENT_DEPS: Record<string, string> = {
  stripe: "stripe",
  "@stripe/stripe-js": "stripe",
  "@lemonsqueezy/lemonsqueezy.js": "lemon-squeezy",
  "paddle-sdk": "paddle",
};

// ---------------------------------------------------------------------------
// Linting / formatting
// ---------------------------------------------------------------------------

export const LINTER_FILES: Record<string, string> = {
  ".eslintrc": "eslint",
  ".eslintrc.js": "eslint",
  ".eslintrc.json": "eslint",
  ".eslintrc.cjs": "eslint",
  ".eslintrc.yml": "eslint",
  "eslint.config.js": "eslint",
  "eslint.config.mjs": "eslint",
  "eslint.config.ts": "eslint",
  "biome.json": "biome",
  "biome.jsonc": "biome",
  "deno.json": "deno-lint",
};

export const FORMATTER_FILES: Record<string, string> = {
  ".prettierrc": "prettier",
  ".prettierrc.js": "prettier",
  ".prettierrc.json": "prettier",
  ".prettierrc.yml": "prettier",
  "prettier.config.js": "prettier",
  "prettier.config.mjs": "prettier",
  "biome.json": "biome",
  "biome.jsonc": "biome",
  "dprint.json": "dprint",
};

// ---------------------------------------------------------------------------
// Git hooks
// ---------------------------------------------------------------------------

export const GIT_HOOK_INDICATORS: Record<string, string> = {
  ".husky": "husky",
  ".husky/_": "husky",
  "lefthook.yml": "lefthook",
};

// ---------------------------------------------------------------------------
// Package manager detection (lock files)
// ---------------------------------------------------------------------------

export const LOCK_FILES: Record<string, string> = {
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "bun.lockb": "bun",
  "bun.lock": "bun",
  "package-lock.json": "npm",
};

// ---------------------------------------------------------------------------
// Architecture detection
// ---------------------------------------------------------------------------

export const ARCHITECTURE_FILES: Record<string, string> = {
  "turbo.json": "monorepo-turborepo",
  "nx.json": "monorepo-nx",
  "pnpm-workspace.yaml": "monorepo-pnpm",
  "lerna.json": "monorepo-lerna",
  "serverless.yml": "serverless",
  "serverless.yaml": "serverless",
};

// ---------------------------------------------------------------------------
// Agent config files
// ---------------------------------------------------------------------------

export const AGENT_CONFIG_FILES: Record<string, string> = {
  "CLAUDE.md": "claude-code",
  ".cursorrules": "cursor",
  ".windsurfrules": "windsurf",
  "opencode.json": "opencode",
  ".github/copilot-instructions.md": "copilot",
  "AGENTS.md": "agents-md",
};

/** Directory-based agent configs (need to check for files inside) */
export const AGENT_CONFIG_DIRS: Record<string, string> = {
  ".clinerules": "cline",
  ".cursor/rules": "cursor",
  ".windsurf/rules": "windsurf",
};

// ---------------------------------------------------------------------------
// Environment variable categorization (prefix → category)
// ---------------------------------------------------------------------------

export const ENV_PREFIX_CATEGORIES: Record<string, string> = {
  DATABASE_: "database",
  DB_: "database",
  SUPABASE_: "database",
  POSTGRES_: "database",
  MONGO_: "database",
  REDIS_: "database",
  MYSQL_: "database",
  AUTH_: "auth",
  CLERK_: "auth",
  NEXTAUTH_: "auth",
  AUTH0_: "auth",
  JWT_: "auth",
  SESSION_: "auth",
  STRIPE_: "payments",
  LEMON_SQUEEZY_: "payments",
  SENTRY_: "monitoring",
  DD_: "monitoring",
  POSTHOG_: "monitoring",
  DATADOG_: "monitoring",
  AWS_: "cloud",
  GCP_: "cloud",
  AZURE_: "cloud",
  VERCEL_: "deployment",
  NETLIFY_: "deployment",
  FLY_: "deployment",
  CLOUDFLARE_: "deployment",
  SMTP_: "email",
  RESEND_: "email",
  SENDGRID_: "email",
  GITHUB_: "vcs",
  GITLAB_: "vcs",
  S3_: "storage",
  R2_: "storage",
  OPENAI_: "ai",
  ANTHROPIC_: "ai",
  GOOGLE_: "cloud",
  NEXT_PUBLIC_: "client",
};

// ---------------------------------------------------------------------------
// Runtime detection
// ---------------------------------------------------------------------------

export const RUNTIME_FILES: Record<string, string> = {
  "deno.json": "deno",
  "deno.jsonc": "deno",
  "bun.lockb": "bun",
  "bun.lock": "bun",
  "bunfig.toml": "bun",
};
