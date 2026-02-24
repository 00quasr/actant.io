## Vision

Actant.io is the **configuration platform for CLI coding agents**. Our goal: make it effortless to build, share, and deploy high-quality configs for Claude Code, Cursor, Windsurf, Cline, and OpenCode.

**Why this matters:** Every dev team using AI coding agents needs a CLAUDE.md, .cursorrules, MCP servers, permissions, and skills — but there's no standard tooling to create, share, or manage these. Actant fills that gap with a visual builder, a marketplace of community configs, and a CLI to pull configs into any project.

**Core value proposition:**

1. **Build** — Visual config builder with AI generation, templates, MCP catalog, smart suggestions
2. **Share** — Marketplace to publish and discover community-curated configs
3. **Deploy** — CLI (`npx actant init`) and export to pull configs into any project
4. **Scale** — Pro plan for teams: unlimited configs, AI generation, priority support

**Competitive landscape:**

- **skills.sh** (Vercel): "npm for agent skills" — 57K+ skills, but mostly uncurated AI slop. We offer guided visual building + quality curation.
- **CodeGuide**: Full-page AI generation, good UX, but no marketplace or CLI. We combine builder + marketplace + CLI.

## Project

Actant.io - CLI agent configuration platform. Build, share, and export configs for Claude Code, Cursor, Windsurf, Cline, and OpenCode.

Stack: Next.js 14 (App Router), TypeScript strict, Supabase, Tailwind CSS, shadcn/ui, Radix Icons, Zod

## Commands

```bash
# Dev
npm run dev
npm run build
npm run lint

# Supabase
# Managed via MCP - use mcp__supabase tools for migrations, SQL, types
```

## Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing, auth pages (top nav + footer layout)
│   ├── (app)/           # Builder, marketplace, profile (sidebar layout, auth required)
│   ├── (docs)/          # Documentation (docs sidebar layout)
│   ├── auth/            # OAuth callback, CLI auth
│   └── api/             # REST endpoints (configs, generation, marketplace, favorites, stripe, docs, analysis)
├── components/
│   ├── ui/              # shadcn/ui primitives + radial-orbital-timeline (auto-generated, don't edit)
│   ├── layout/          # top-nav, sidebar-nav, docs-sidebar, footer
│   ├── auth/            # login-form, signup-form, auth-guard, user-menu
│   ├── builder/         # builder-shell, tabs, export/publish/ai-generate/repo-import dialogs, onboarding-wizard, live-preview, project-intelligence-report
│   ├── marketplace/     # search-bar, filter-sidebar, listing-grid, listing-detail, review-form, review-list, import/favorite buttons
│   ├── config/          # config-card, user-config-card, agent-badge, rating-stars
│   ├── markdown/        # markdown-editor, markdown-preview
│   ├── landing/         # 13 sections (see Landing Page Sections below)
│   ├── billing/         # plan-badge, upgrade-dialog
│   └── profile/         # profile-header, saved/published/favorites lists
├── lib/
│   ├── supabase/        # client.ts, server.ts, middleware.ts
│   ├── exporters/       # claude-code.ts, cursor.ts, windsurf.ts, cline.ts, opencode.ts, utils.ts
│   ├── ai/              # provider.ts, schema.ts, questions-schema.ts, prompts.ts
│   ├── analysis/        # Deep multi-pass project analysis engine
│   │   ├── types.ts             # ProjectProfile, Detection<T>, all sub-types
│   │   ├── source.ts            # ProjectDataSource interface
│   │   ├── detection-maps.ts    # Static lookup tables (ORMs, auth, deploy, etc.)
│   │   ├── github-source.ts     # GitHub API data source adapter
│   │   ├── analyze.ts           # Orchestrator — runs 5 passes via Promise.allSettled
│   │   ├── summary.ts           # Tech stack list, gap detection, detection counting
│   │   ├── profile-to-prompt.ts # ProjectProfile → structured AI prompt
│   │   └── passes/              # 5 independent analysis passes
│   │       ├── structure.ts     # Architecture, modules, key dirs, entry points
│   │       ├── dependencies.ts  # Pkg manager, ORM, state, UI lib, build tool, API style
│   │       ├── conventions.ts   # File naming, imports, tests, linting, git hooks
│   │       ├── integrations.ts  # DB, auth, CI, deploy, monitoring, payments, env vars
│   │       └── agents.ts        # Existing agent configs + quality assessment
│   ├── utils.ts         # cn() helper
│   ├── constants.ts     # Agent types, categories, nav items, enums
│   ├── stripe.ts        # Stripe singleton client
│   ├── presets.ts       # Permission, rule, and MCP presets
│   ├── smart-suggestions.ts  # Tech stack → MCP/rules/permissions mapping (+ profile-based)
│   └── repo-analysis.ts     # Framework, test, CI detection for imports (legacy)
├── hooks/               # use-auth, use-config, use-auto-save, use-debounce, use-config-generation, use-docs-generation, use-repo-import
├── types/               # config.ts, marketplace.ts
├── services/            # configs, skills, skills-server, marketplace, reviews, favorites, templates, mcp-providers, profiles
└── validations/         # Zod schemas: config, generation, listing, review, billing, mcp-server, profile, repo-import, docs-generate

packages/cli/
├── src/
│   ├── index.ts               # CLI entry point, command registration
│   ├── types.ts               # Shared CLI types
│   ├── commands/              # 7 commands: analyze, docs, init, list, login, logout, push
│   ├── dashboard/             # Ink-based interactive TUI
│   │   ├── app.tsx            # Dashboard entry & layout
│   │   ├── constants.ts       # Menu items, ASCII logo
│   │   ├── components/        # header, menu, footer
│   │   ├── hooks/             # use-auth-status, use-navigation
│   │   └── screens/           # analyze, docs, init, list, login, push screens
│   └── lib/                   # Core logic
│       ├── auth.ts            # Token storage (~/.actant/auth.json)
│       ├── auth-flow.ts       # Browser-based OAuth flow
│       ├── api.ts             # Actant API client with auto-refresh
│       ├── scanner.ts         # Agent-specific file discovery
│       ├── parser.ts          # Config file parsing per agent
│       ├── project-analyzer.ts # Project structure analysis (+ deep analysis via FsSource)
│       ├── writer.ts          # Write exported files to disk
│       └── analysis/          # Deep analysis engine (mirrored from src/lib/analysis, ESM imports)
│           ├── fs-source.ts   # Node.js filesystem data source adapter
│           └── passes/        # 5 analysis passes (structure, deps, conventions, integrations, agents)
├── dist/                      # Built ESM output
├── package.json               # bin: actant
└── tsup.config.ts             # ESM build config
```

### Landing Page Sections (render order)

1. HeroSection — headline, CTA, copy-to-clipboard install, builder preview (client)
2. SocialProof — supported agents list (server)
3. IntegrationsShowcase — native config files per agent (server)
4. FeaturesSection — 6-feature grid (server)
5. TestimonialsSection — 3 customer testimonials (server)
6. HowItWorksSection — 3-step process overview (server)
7. WorkflowTimelineSection — 5-step orbital timeline visualization (client)
8. AgentComparison — feature support matrix table (server)
9. OpenSourceSection — community stats + GitHub link (server)
10. CliShowcaseSection — animated terminal demo of `npx actant` (client)
11. FaqSection — 6 collapsible Q&A items (client)
12. PricingPreview — Free vs Pro tier cards (server)
13. CtaSection — final call-to-action (server)

Utility: FadeIn — reusable scroll-triggered animation wrapper (client)

## Code Style

- TypeScript strict, no `any`
- Named exports
- Functional components
- Tailwind for styling (shadcn/ui components as base)
- Zod for validation
- Radix Icons only (`@radix-ui/react-icons`)
- Inter typeface (via `next/font/google`)

## Supabase

- Project ID: `nyiibwqpkupzdgwqctlb`
- Region: eu-west-1
- Tables: profiles, configs, skills, templates, listings, reviews, favorites
- Auth: email/password + GitHub OAuth
- All tables use RLS

## Agent Export Formats

| Agent       | Files                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Claude Code | `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`, `.claude/skills/*/SKILL.md` |
| Cursor      | `.cursorrules`, `.cursor/rules/*.mdc`, `.mcp.json`                             |
| Windsurf    | `.windsurfrules`, `.windsurf/rules/rules.md`                                   |
| Cline       | `.clinerules/*.md` (numbered)                                                  |
| OpenCode    | `opencode.json`                                                                |

## Git

- `feature/[name]` or `fix/[name]`
- Commits: `type(scope): message`
- Run lint + typecheck before commit
- never commit with claude as co-author

## Maintenance

- After every major implementation (new features, new sections, new commands, architectural changes), update this CLAUDE.md to reflect the changes
- Keep the Structure section, Landing Page Sections list, and CLI tree accurate
- Update Agent Export Formats if new file types are added
- Update Environment section if new env vars are required
- Update Commands section if new CLI commands or npm scripts are added

## Design Principles (UI & UX)

We aim for **minimalistic, calm, and clean interfaces**.

### Core design philosophy

- **Few colors.** Limited palette: neutral base (white/off-white/dark), one primary accent, optional muted secondary
- **Minimalism over decoration.** Every visual element must earn its place.
- **Clean, boring, professional.** No flashy gradients, excessive shadows, or visual noise.
- **Whitespace is intentional.** Spacing is a feature.
- **Consistency beats creativity.** Reuse patterns relentlessly.

### Practical rules

- Avoid: rainbow color schemes, unnecessary icons, excessive borders/dividers, "UI tricks"
- Prefer: typography hierarchy over boxes, alignment over decoration, spacing over separators
- If in doubt: **remove, then reassess**.

### Reference design

- agentation.dev style: docs-style layout, left sidebar nav, monochrome + single accent color
- Inter typeface, Radix Icons, shadcn/ui components

## UI Development: Screenshot-Driven Workflow

UI quality is validated visually, not assumed. -> use /agent-browser skill

### Requirements

- Take screenshots before/after changes
- Validate: spacing, alignment, typography, color restraint, responsiveness (2+ breakpoints)

## MCP Servers (Available in this project)

### Project-level (`.mcp.json`)

| Server       | Type | Purpose                                                          |
| ------------ | ---- | ---------------------------------------------------------------- |
| **Supabase** | HTTP | Database, auth, migrations, SQL, edge functions, branches, types |

### Project-level (Claude config)

| Server     | Type | Purpose                                                  |
| ---------- | ---- | -------------------------------------------------------- |
| **Vercel** | HTTP | Deployments, build logs, runtime logs, projects, domains |

### User-level (inherited)

| Server         | Type  | Purpose                                  |
| -------------- | ----- | ---------------------------------------- |
| **Neon**       | HTTP  | Serverless Postgres (alternative DB)     |
| **Playwright** | stdio | Browser automation, screenshots, testing |

### Built-in (Claude Code native)

| Server             | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| **Context7**       | Up-to-date library docs and code examples             |
| **21st.dev Magic** | UI component builder, inspiration, refiner            |
| **shadcn**         | Registry search, component examples, install commands |

### Usage patterns

- **Database work**: Use `mcp__supabase__*` tools for migrations, SQL, types, logs
- **Deployment**: Use `mcp__vercel__*` tools for deploy, build logs, runtime logs
- **UI components**: Use `mcp__shadcn__*` to search/view/install shadcn components
- **Library docs**: Use `mcp__context7__*` to look up any library's current API
- **Screenshots**: Use `/agent-browser` skill (Playwright-based)

## Skills

### Installed

| Skill                         | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `agent-browser`               | Browser automation for visual QA and E2E testing     |
| `find-skills`                 | Discover and install skills from skills.sh ecosystem |
| `vercel-react-best-practices` | React/Next.js performance optimization from Vercel   |
| `skill-creator`               | Guide for creating custom skills                     |
| `nextjs-supabase-auth`        | Auth patterns for Next.js + Supabase stack           |
| `shadcn-ui-expert`            | Deep shadcn/ui component knowledge                   |
| `vercel-deployment`           | Vercel deployment workflows                          |
| `supabase-backend-platform`   | Advanced Supabase backend patterns                   |

## Environment

```
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# Optional — AI generation (builder "Generate with AI" feature)
ANTHROPIC_API_KEY=

# Optional — Payments (Pro plan upgrades via Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO_MONTHLY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Links

- Repo: https://github.com/keanuklestil/actant.io
- Supabase: https://supabase.com/dashboard/project/nyiibwqpkupzdgwqctlb
- Skills: https://skills.sh/
