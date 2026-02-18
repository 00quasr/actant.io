/**
 * Shared repo analysis utilities used by both GitHub import and CLI upload paths.
 */

const FRAMEWORK_INDICATORS: Record<string, { deps: string[]; files: string[] }> = {
  "next.js": { deps: ["next"], files: ["next.config.js", "next.config.mjs", "next.config.ts"] },
  angular: { deps: ["@angular/core"], files: ["angular.json"] },
  vue: { deps: ["vue"], files: ["vue.config.js", "vite.config.ts"] },
  nuxt: { deps: ["nuxt"], files: ["nuxt.config.ts", "nuxt.config.js"] },
  svelte: { deps: ["svelte"], files: ["svelte.config.js"] },
  sveltekit: { deps: ["@sveltejs/kit"], files: ["svelte.config.js"] },
  remix: { deps: ["@remix-run/react"], files: ["remix.config.js"] },
  astro: { deps: ["astro"], files: ["astro.config.mjs", "astro.config.ts"] },
  express: { deps: ["express"], files: [] },
  fastify: { deps: ["fastify"], files: [] },
  nestjs: { deps: ["@nestjs/core"], files: ["nest-cli.json"] },
  django: { deps: [], files: ["manage.py", "settings.py"] },
  flask: { deps: [], files: ["app.py", "wsgi.py"] },
  rails: { deps: [], files: ["Gemfile", "config/routes.rb"] },
  "spring-boot": { deps: [], files: ["pom.xml", "build.gradle"] },
  gatsby: { deps: ["gatsby"], files: ["gatsby-config.js", "gatsby-config.ts"] },
  vite: { deps: ["vite"], files: ["vite.config.ts", "vite.config.js"] },
};

const TEST_FRAMEWORK_INDICATORS: Record<string, { deps: string[]; files: string[] }> = {
  vitest: { deps: ["vitest"], files: ["vitest.config.ts", "vitest.config.js"] },
  jest: {
    deps: ["jest", "@jest/core"],
    files: ["jest.config.ts", "jest.config.js", "jest.config.mjs"],
  },
  pytest: { deps: [], files: ["pytest.ini", "pyproject.toml", "conftest.py"] },
  mocha: { deps: ["mocha"], files: [".mocharc.yml", ".mocharc.js"] },
  playwright: {
    deps: ["@playwright/test", "playwright"],
    files: ["playwright.config.ts", "playwright.config.js"],
  },
  cypress: { deps: ["cypress"], files: ["cypress.config.ts", "cypress.config.js", "cypress.json"] },
  ava: { deps: ["ava"], files: [] },
};

const CI_PLATFORM_INDICATORS: Record<string, string[]> = {
  "github-actions": [".github/workflows"],
  "gitlab-ci": [".gitlab-ci.yml"],
  circleci: [".circleci/config.yml"],
  jenkins: ["Jenkinsfile"],
  "azure-pipelines": ["azure-pipelines.yml"],
  "travis-ci": [".travis.yml"],
  "bitbucket-pipelines": ["bitbucket-pipelines.yml"],
};

export function detectFramework(
  deps: Record<string, string> | null,
  files: string[],
): string | null {
  const allDeps = deps ? Object.keys(deps) : [];
  const fileNames = files.map(
    (f) =>
      f
        .replace(/^[📁📄]\s*/, "")
        .split("/")
        .pop() ?? f,
  );
  const filePaths = files.map((f) => f.replace(/^[📁📄]\s*/, ""));

  for (const [framework, indicators] of Object.entries(FRAMEWORK_INDICATORS)) {
    const hasDep = indicators.deps.some((d) => allDeps.includes(d));
    const hasFile = indicators.files.some((f) => fileNames.includes(f) || filePaths.includes(f));
    if (hasDep || hasFile) return framework;
  }

  return null;
}

export function detectTestFramework(
  deps: Record<string, string> | null,
  files: string[],
): string | null {
  const allDeps = deps ? Object.keys(deps) : [];
  const fileNames = files.map(
    (f) =>
      f
        .replace(/^[📁📄]\s*/, "")
        .split("/")
        .pop() ?? f,
  );
  const filePaths = files.map((f) => f.replace(/^[📁📄]\s*/, ""));

  for (const [framework, indicators] of Object.entries(TEST_FRAMEWORK_INDICATORS)) {
    const hasDep = indicators.deps.some((d) => allDeps.includes(d));
    const hasFile = indicators.files.some((f) => fileNames.includes(f) || filePaths.includes(f));
    if (hasDep || hasFile) return framework;
  }

  return null;
}

export function detectCiPlatform(files: string[]): string | null {
  const filePaths = files.map((f) => f.replace(/^[📁📄]\s*/, ""));

  for (const [platform, indicators] of Object.entries(CI_PLATFORM_INDICATORS)) {
    const hasIndicator = indicators.some((indicator) =>
      filePaths.some((f) => f === indicator || f.startsWith(indicator + "/")),
    );
    if (hasIndicator) return platform;
  }

  return null;
}

export function parseEnvExample(content: string): string[] {
  const vars: string[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) vars.push(match[1]);
  }
  return vars;
}

export function buildCompactTree(entries: string[], maxEntries: number = 300): string[] {
  return entries.slice(0, maxEntries);
}
