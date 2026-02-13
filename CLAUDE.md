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
│   ├── auth/            # OAuth callback
│   └── api/             # REST endpoints
├── components/
│   ├── ui/              # shadcn/ui primitives (auto-generated, don't edit)
│   ├── layout/          # top-nav, sidebar-nav, docs-sidebar, footer
│   ├── auth/            # login-form, signup-form, auth-guard, user-menu
│   ├── builder/         # builder-shell, tabs, export-dialog
│   ├── marketplace/     # search, filters, listing components
│   ├── config/          # config-card, agent-badge, rating-stars
│   ├── markdown/        # markdown-editor, markdown-preview
│   ├── landing/         # hero, features, how-it-works sections
│   └── profile/         # profile-header, saved/published lists
├── lib/
│   ├── supabase/        # client.ts, server.ts, middleware.ts
│   ├── exporters/       # claude-code.ts, cursor.ts, windsurf.ts, cline.ts, opencode.ts
│   ├── utils.ts         # cn() helper
│   └── constants.ts     # Agent types, categories, enums
├── hooks/               # use-auth, use-config, use-debounce, use-auto-save
├── types/               # database.ts, config.ts, marketplace.ts
├── services/            # configs.ts, skills.ts, marketplace.ts, reviews.ts, profiles.ts
└── validations/         # Zod schemas: config.ts, review.ts, profile.ts
```

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

| Agent | Files |
|-------|-------|
| Claude Code | `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`, `.claude/skills/*/SKILL.md` |
| Cursor | `.cursorrules`, `.cursor/rules/*.mdc`, `.mcp.json` |
| Windsurf | `.windsurfrules`, `.windsurf/rules/rules.md` |
| Cline | `.clinerules/*.md` (numbered) |
| OpenCode | `opencode.json` |

## Git

- `feature/[name]` or `fix/[name]`
- Commits: `type(scope): message`
- Run lint + typecheck before commit
- never commit with claude as co-author

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

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

## Links

- Repo: https://github.com/keanuklestil/actant.io
- Supabase: https://supabase.com/dashboard/project/nyiibwqpkupzdgwqctlb
