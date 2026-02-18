# Architecture

Comprehensive developer documentation for Actant.io — the configuration platform for CLI coding agents.

## Overview

Actant.io helps developers build, share, and deploy high-quality configs for AI coding agents: Claude Code, Cursor, Windsurf, Cline, and OpenCode. The platform provides a visual config builder, a community marketplace, and a CLI for pulling configs into any project.

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (Postgres + Auth + RLS)
- **Styling:** Tailwind CSS + shadcn/ui + Radix Icons
- **Payments:** Stripe (subscriptions)
- **AI:** OpenAI GPT-4o via Vercel AI SDK
- **CLI:** Commander + Ink (React for terminals)
- **Validation:** Zod
- **Deployment:** Vercel

### Monorepo Structure

```
actant.io/
├── src/                  # Next.js web application
├── packages/cli/         # Standalone CLI package (npx actant)
├── public/               # Static assets
└── supabase/             # Migrations and config
```

---

## Web Application (`src/`)

### Routes

#### Marketing (public, top-nav + footer layout)

| Route      | Purpose                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`        | Landing page — 13 sections: hero, social proof, integrations, features, testimonials, how-it-works, workflow timeline, agent comparison, open source, CLI showcase, FAQ, pricing preview, CTA |
| `/login`   | Email/password + GitHub OAuth login                                                                                                                                                           |
| `/signup`  | User registration with email confirmation                                                                                                                                                     |
| `/pricing` | Full pricing page — Free vs Pro plans with feature comparison                                                                                                                                 |

#### App (protected, sidebar layout, auth required)

| Route                         | Purpose                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `/builder`                    | Create new config (optional `?template=id` query param)                                         |
| `/builder/[configId]`         | Edit existing config                                                                            |
| `/builder/import/[listingId]` | Import config from marketplace — creates copy, redirects to builder                             |
| `/configs`                    | My Library — list all user's configs                                                            |
| `/templates`                  | Browse pre-built templates by use case                                                          |
| `/marketplace`                | Browse community configs with search, filters (agent, use_case), sorting (newest/popular/rated) |
| `/marketplace/[listingId]`    | Listing detail — config preview, reviews, import button                                         |
| `/favorites`                  | User's favorited marketplace listings                                                           |
| `/profile`                    | Public profile — published configs and favorites                                                |
| `/profile/settings`           | Account settings (username, display name, bio, GitHub), billing plan management                 |

#### Docs (public, docs sidebar layout)

| Route                      | Purpose                              |
| -------------------------- | ------------------------------------ |
| `/docs`                    | Redirects to `/docs/getting-started` |
| `/docs/getting-started`    | Getting started guide                |
| `/docs/cli`                | CLI documentation                    |
| `/docs/agents/claude-code` | Claude Code agent guide              |
| `/docs/agents/cursor`      | Cursor agent guide                   |
| `/docs/agents/windsurf`    | Windsurf agent guide                 |
| `/docs/agents/cline`       | Cline agent guide                    |
| `/docs/agents/opencode`    | OpenCode agent guide                 |
| `/docs/community`          | Community guidelines                 |

#### Auth

| Route            | Purpose                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| `/auth/callback` | OAuth callback — exchanges code for session                             |
| `/auth/cli`      | CLI authentication page — handles port-based callback for CLI auth flow |

#### API Endpoints

**Configs**

| Endpoint                        | Method | Purpose                                               |
| ------------------------------- | ------ | ----------------------------------------------------- |
| `/api/configs`                  | GET    | List user's configs (ordered by updated_at)           |
| `/api/configs`                  | POST   | Create new config                                     |
| `/api/configs/[id]`             | GET    | Fetch config by ID (owner only)                       |
| `/api/configs/[id]`             | PUT    | Update config (owner only)                            |
| `/api/configs/[id]`             | DELETE | Delete config (owner only)                            |
| `/api/configs/[id]/export`      | POST   | Export config as ZIP for target agent                 |
| `/api/configs/[id]/export-json` | POST   | Export config as JSON (supports Bearer token for CLI) |
| `/api/configs/push`             | POST   | Push/import config files from CLI                     |

**Generation (AI)**

| Endpoint                            | Method | Purpose                                                     |
| ----------------------------------- | ------ | ----------------------------------------------------------- |
| `/api/configs/generate/questions`   | POST   | Generate clarifying questions from project description      |
| `/api/configs/generate/auto-answer` | POST   | Auto-answer clarifying questions via AI                     |
| `/api/configs/generate`             | POST   | Generate full config (free tier: 5/month)                   |
| `/api/configs/import-repo`          | POST   | Import from GitHub repo — analyzes structure via GitHub API |

**Documentation**

| Endpoint             | Method | Purpose                                                      |
| -------------------- | ------ | ------------------------------------------------------------ |
| `/api/docs/generate` | POST   | Generate project docs via AI (supports Bearer token for CLI) |

**Marketplace**

| Endpoint                        | Method | Purpose                                        |
| ------------------------------- | ------ | ---------------------------------------------- |
| `/api/marketplace`              | GET    | Search listings (query, agent, use_case, sort) |
| `/api/marketplace`              | POST   | Publish config to marketplace                  |
| `/api/marketplace/[id]`         | GET    | Fetch listing by ID                            |
| `/api/marketplace/[id]/reviews` | GET    | List reviews for listing                       |
| `/api/marketplace/[id]/reviews` | POST   | Create review (rating + comment)               |

**Favorites**

| Endpoint         | Method | Purpose                                     |
| ---------------- | ------ | ------------------------------------------- |
| `/api/favorites` | GET    | List user's favorites                       |
| `/api/favorites` | POST   | Add to favorites                            |
| `/api/favorites` | DELETE | Remove from favorites (query: `listing_id`) |

**Stripe**

| Endpoint               | Method | Purpose                                                                 |
| ---------------------- | ------ | ----------------------------------------------------------------------- |
| `/api/stripe/checkout` | POST   | Create checkout session for Pro plan                                    |
| `/api/stripe/portal`   | POST   | Create billing portal session                                           |
| `/api/stripe/webhook`  | POST   | Handle Stripe events (checkout completed, subscription updated/deleted) |

---

### Components

#### `layout/`

| Component   | Purpose                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| TopNav      | Marketing nav — logo, links (Pricing, Docs, Marketplace), auth buttons / user avatar. Mobile hamburger menu                               |
| SidebarNav  | App sidebar — Build (New Config, My Library, Templates), Discover (Marketplace, Favorites), Account (Settings). Plan badge, mobile drawer |
| DocsSidebar | Documentation navigation tree for `/docs` routes                                                                                          |
| Footer      | Copyright, social/legal links                                                                                                             |

#### `auth/`

| Component  | Purpose                                                           |
| ---------- | ----------------------------------------------------------------- |
| LoginForm  | Email + password with Zod validation, GitHub OAuth button         |
| SignupForm | Email + password + confirm, GitHub OAuth, email confirmation flow |
| AuthGuard  | Wrapper — redirects unauthenticated users to login                |
| UserMenu   | Dropdown — profile link, settings, sign out                       |

#### `builder/`

| Component        | Purpose                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| BuilderShell     | Main builder shell — state management (useConfig), auto-save, tabs, preview, dialogs, smart suggestions             |
| BuilderTabs      | Tab container — Instructions, Skills, MCP Servers, Permissions, Rules, Docs                                         |
| BuilderHeader    | Config name/description inputs, agent selector, save status, export/publish/AI buttons                              |
| InstructionsTab  | Markdown editor for main instructions + template picker                                                             |
| SkillsTab        | Skill search/selection with parameter editing                                                                       |
| McpTab           | MCP server list, add form, provider catalog, setup panel                                                            |
| PermissionsTab   | Permission rows (tool + allow/ask/deny toggle), preset buttons                                                      |
| RulesTab         | Rule editor (title, content, glob, alwaysApply), presets                                                            |
| DocsTab          | Markdown editor for additional docs, file list management                                                           |
| ExportDialog     | Multi-agent export preview, agent dropdown, file tree, ZIP download                                                 |
| PublishDialog    | Publish to marketplace — title, description, use case, tags                                                         |
| AiGenerateDialog | AI generation workflow — project description, tech stack, clarifying questions, auto-answer, generation limit check |
| RepoImportDialog | Import from GitHub repo — URL validation, public/private toggle, access token input                                 |
| OnboardingWizard | Multi-step setup — agent selection, project description, AI generation option, smart suggestions                    |
| LivePreview      | Real-time debounced file preview with warnings                                                                      |

#### `marketplace/`

| Component      | Purpose                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| SearchBar      | Debounced search input updating URL params                                                            |
| FilterSidebar  | Checkboxes for agent types and use cases, sort dropdown                                               |
| ListingGrid    | Grid of ConfigCard components                                                                         |
| ListingDetail  | Full listing view — metadata, instructions, rules, permissions, MCP servers, reviews, import/favorite |
| ImportButton   | One-click import to user's library                                                                    |
| FavoriteButton | Heart toggle for favorites                                                                            |
| ReviewForm     | Rating stars + comment textarea                                                                       |
| ReviewList     | Reviews with author avatars, ratings, dates                                                           |

#### `config/`

| Component      | Purpose                                                               |
| -------------- | --------------------------------------------------------------------- |
| ConfigCard     | Marketplace card — title, description, agent badge, rating, downloads |
| UserConfigCard | User's config card — edit/delete/export actions                       |
| AgentBadge     | Badge displaying agent name with secondary variant                    |
| RatingStars    | Star display (1-5) with average and count                             |

#### `landing/` (13 sections in page order)

| #   | Component               | Type   | Purpose                                                                          |
| --- | ----------------------- | ------ | -------------------------------------------------------------------------------- |
| 1   | HeroSection             | Client | Headline, CTA buttons, copy-to-clipboard install command, builder preview mockup |
| 2   | SocialProof             | Server | Supported agents list as trust indicator                                         |
| 3   | IntegrationsShowcase    | Server | Native config file cards per agent                                               |
| 4   | FeaturesSection         | Server | 6-feature grid (Builder, Export, AI, Marketplace, Templates, CLI)                |
| 5   | TestimonialsSection     | Server | 3 customer testimonials                                                          |
| 6   | HowItWorksSection       | Server | 3-step process: Choose Agent, Configure, Export & Deploy                         |
| 7   | WorkflowTimelineSection | Client | 5-step interactive orbital timeline (RadialOrbitalTimeline component)            |
| 8   | AgentComparison         | Server | Feature support matrix table across 5 agents                                     |
| 9   | OpenSourceSection       | Server | Community stats + GitHub link                                                    |
| 10  | CliShowcaseSection      | Client | Animated terminal demo of `npx actant` with phase-based state machine            |
| 11  | FaqSection              | Client | 6 collapsible Q&A accordion items                                                |
| 12  | PricingPreview          | Server | Free vs Pro tier cards with feature lists                                        |
| 13  | CtaSection              | Server | Final call-to-action with signup and docs buttons                                |

Utility: **FadeIn** (client) — reusable scroll-triggered fade-in animation wrapper using IntersectionObserver

#### `billing/`

| Component     | Purpose                                                            |
| ------------- | ------------------------------------------------------------------ |
| PlanBadge     | Badge displaying "Free" or "Pro" based on profile.plan             |
| UpgradeDialog | Feature comparison (Free vs Pro), upgrade button → Stripe checkout |

#### `profile/`

| Component            | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| ProfileHeader        | Avatar, display name, bio, GitHub link                |
| SavedConfigsList     | Grid of user's draft configs with edit/delete actions |
| PublishedConfigsList | Grid of published marketplace listings with stats     |
| FavoritesList        | Grid of favorited marketplace configs                 |

#### `ui/` (notable custom component)

| Component             | Purpose                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| RadialOrbitalTimeline | Interactive orbital visualization — rotating ring with circular nodes, expand-on-click cards, auto-rotate, pulse effects, responsive z-depth opacity |

---

### Services (`src/services/`)

| Service            | Purpose                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `configs.ts`       | CRUD for agent configs — create, get, update, delete, list. Converts between camelCase (app) and snake_case (DB)     |
| `marketplace.ts`   | Marketplace listings — search with filters (query, agent, use_case, sort), get listing, publish, increment downloads |
| `reviews.ts`       | Review management — get reviews for listing, create, update, delete                                                  |
| `favorites.ts`     | Favorites — get user favorites, toggle (add/remove), check if favorited                                              |
| `skills.ts`        | Client-side skill catalog — list all, get by ID                                                                      |
| `skills-server.ts` | Server-side skill operations — batch fetch by IDs, list all with metadata                                            |
| `templates.ts`     | Config templates — list all or filter by agent, ordered by featured then name                                        |
| `mcp-providers.ts` | MCP server catalog — list all, full-text search, get recommendations by tech stack                                   |
| `profiles.ts`      | User profile operations                                                                                              |

### Hooks (`src/hooks/`)

| Hook                  | Purpose                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAuth`             | Auth state management — user, profile, loading, signOut. Listens to auth changes, auto-fetches profile                                                     |
| `useConfig`           | Central config state via useReducer — manages instructions, skills, MCP servers, permissions, rules, docs, tech stack. Tracks isDirty, isSaving, lastSaved |
| `useAutoSave`         | Auto-saves config to DB with 2-second debounce. Returns saveStatus (`idle`/`saving`/`saved`/`error`) and saveNow                                           |
| `useDebounce`         | Generic debounce for any value (default 300ms)                                                                                                             |
| `useConfigGeneration` | AI generation workflow — generates questions, collects answers, generates config. Statuses: idle → asking → answering → generating → done                  |
| `useDocsGeneration`   | AI docs generation — generates documentation from config context. Statuses: idle → generating → done                                                       |
| `useRepoImport`       | GitHub repo import — fetches and analyzes repo, returns parsed config. Statuses: idle → importing → done                                                   |

### Lib (`src/lib/`)

#### Exporters (`src/lib/exporters/`)

Each exporter takes an `AgentConfig` and returns `{ files, warnings }`:

| Exporter         | Output Files                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `claude-code.ts` | `CLAUDE.md`, `.claude/settings.json` (permissions), `.mcp.json`, `.claude/skills/*/SKILL.md`, doc files |
| `cursor.ts`      | `.cursorrules` (legacy), `.cursor/rules/{slug}.mdc` (YAML frontmatter), `.mcp.json`, docs               |
| `windsurf.ts`    | `.windsurfrules` (warns if >6000 chars), `.windsurf/rules/rules.md`, docs                               |
| `cline.ts`       | `.clinerules/{NN}-{slug}.md` (numbered), `.clinerules/01-instructions.md`, docs                         |
| `opencode.ts`    | `opencode.json` (instructions, MCP, permissions), docs separately                                       |
| `utils.ts`       | `slugify()` — text to kebab-case                                                                        |

#### AI (`src/lib/ai/`)

| Module                | Purpose                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `provider.ts`         | Returns OpenAI GPT-4o model via Vercel AI SDK                                                                                |
| `schema.ts`           | Zod schemas for AI-generated config and docs output                                                                          |
| `questions-schema.ts` | Schema for clarifying questions (5-8 per generation, multiple choice or freeform)                                            |
| `prompts.ts`          | System prompts — agent file knowledge, config schema description, quality guidelines, known MCP server catalog (15+ servers) |

#### Other Lib Modules

| Module                   | Purpose                                                                                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants.ts`           | Site metadata, nav items (marketing, app, docs navigation trees)                                                                                                                                     |
| `utils.ts`               | `cn()` — Tailwind class merging (clsx + tailwind-merge)                                                                                                                                              |
| `stripe.ts`              | Singleton Stripe client for payments                                                                                                                                                                 |
| `presets.ts`             | Permission presets (standard/permissive/restrictive), rule presets (10 categories: code-style, git, testing, nextjs, react, api, security, docs, accessibility, performance), MCP bundles (6 stacks) |
| `smart-suggestions.ts`   | Maps tech stack → recommended MCP servers, rule presets, permission presets. Handles combos (Next.js + Supabase, Next.js + shadcn)                                                                   |
| `repo-analysis.ts`       | Framework detection (15+ frameworks), test framework detection, CI platform detection, env var parsing, compact file tree builder                                                                    |
| `supabase/client.ts`     | Browser Supabase client                                                                                                                                                                              |
| `supabase/server.ts`     | Server Supabase client with cookie-based auth                                                                                                                                                        |
| `supabase/middleware.ts` | Supabase auth middleware for Next.js                                                                                                                                                                 |

### Types (`src/types/`)

#### `config.ts`

```
AgentType = "claude-code" | "cursor" | "windsurf" | "cline" | "opencode"
UseCase = "frontend" | "backend" | "fullstack" | "mobile" | "devops" | "data" | "general"
SkillCategory = "development" | "testing" | "devops" | "documentation" | "code-quality" | "design" | "productivity" | "other"
McpServer { name, type, command?, args?, url?, env?, enabled }
SkillEntry { skillId, enabled, params }
Rule { title, content, glob?, alwaysApply? }
AgentConfig { name, description, targetAgent, instructions, skills, mcpServers, permissions, rules, techStack?, docs? }
```

#### `marketplace.ts`

```
Profile { id, username, display_name, avatar_url, bio, github_username, plan, generation_credits_used, stripe_* }
Config { id, owner_id, name, description, target_agent, instructions, skills, mcp_servers, permissions, rules, is_draft, document_type, content, timestamps }
Skill { id, name, slug, description, category, content, compatible_agents, tags, version, download_count, is_official, source }
Template { id, name, slug, description, target_agent, use_case, instructions, skills, mcp_servers, permissions, rules, is_featured, document_type, timestamps }
Listing { id, config_id, author_id, title, description, target_agent, use_case, tags, avg_rating, review_count, download_count, is_featured, document_type, published_at, author? }
Review { id, listing_id, author_id, rating, comment, timestamps, author? }
Favorite { id, user_id, listing_id, created_at }
McpProvider { id, name, slug, description, icon_url, type, default_*, required_env_keys, category, tags, recommended_for }
```

### Validations (`src/validations/`)

| Schema             | Validates                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `config.ts`        | Rule content, MCP server config, skill entries, agent config (name required)              |
| `generation.ts`    | Project description (10-2000 chars), tech stack, target agent, answers, skill IDs         |
| `listing.ts`       | Config ID (UUID), title (3-100), description (10-1000), use case, tags (max 5)            |
| `review.ts`        | Rating (1-5), comment (optional, max 1000)                                                |
| `billing.ts`       | Checkout priceId (optional)                                                               |
| `mcp-server.ts`    | Name, type, command (required for stdio), args, url (required for sse/http), env array    |
| `profile.ts`       | Username (3-39 chars, alphanumeric+hyphens), display name, bio (max 500), GitHub username |
| `repo-import.ts`   | GitHub URL regex validation, target agent, access token (optional)                        |
| `docs-generate.ts` | Repo context object or project description (at least one required)                        |

---

## CLI Package (`packages/cli/`)

The CLI provides both direct commands and an interactive dashboard (Ink-based TUI).

**Install:** `npx actant` or `npm i -g actant`

**Entry:** `actant` with no arguments launches the dashboard; with a command runs that command directly.

### Commands

| Command            | Description                                          | Flags                                                 | Auth |
| ------------------ | ---------------------------------------------------- | ----------------------------------------------------- | ---- |
| `actant` (no args) | Launch interactive dashboard                         | —                                                     | No   |
| `actant analyze`   | Analyze project structure and detect framework/tools | `--json`                                              | No   |
| `actant docs`      | Generate agent docs with AI                          | `--output <dir>`, `--update`, `--name <name>`         | Yes  |
| `actant init`      | Pull config from Actant and write agent files        | —                                                     | Yes  |
| `actant list`      | List user's saved configurations                     | —                                                     | Yes  |
| `actant login`     | Authenticate via browser                             | —                                                     | No   |
| `actant logout`    | Clear stored credentials                             | —                                                     | No   |
| `actant push`      | Scan local config files and push to Actant           | `--agent <type>`, `--config-id <id>`, `--name <name>` | Yes  |

### Dashboard

Built with Ink (React for terminals). Requires interactive TTY.

```
┌─────────────────────────────────┐
│  ASCII Logo + Auth Status       │  ← Header
├─────────────────────────────────┤
│  > Analyze Project              │  ← Menu (vim keys: j/k, arrows)
│    Generate Docs                │
│    Pull Config                  │
│    Push Config                  │
│    My Configs                   │
│    ─────────────                │
│    Login                        │
├─────────────────────────────────┤
│  v0.1.0 · actant.io            │  ← Footer
└─────────────────────────────────┘
```

**Screens:** menu (default), analyze, docs, init, push, list, login

Each screen maps to its corresponding command with interactive prompts (config selection, agent selection, file conflict warnings, confirmation).

**Hooks:**

- `useNavigation` — screen state management (navigate, goBack)
- `useAuthStatus` — polls auth status every 2 seconds

### Auth Flow

1. `actant login` starts a local HTTP server on a random port
2. Opens browser to `https://actant.io/auth/cli?port={port}`
3. User logs in via the web app
4. Browser redirects to `http://localhost:{port}/callback?access_token=...&refresh_token=...`
5. Tokens saved to `~/.actant/auth.json` (mode `0o600`)
6. Subsequent CLI commands use `Authorization: Bearer {token}` header
7. On 401, tokens are auto-refreshed via Supabase refresh token

### Scanner & Parser

**Scanner** (`lib/scanner.ts`): Discovers agent config files by glob patterns:

| Agent       | Scanned Files                                                                  |
| ----------- | ------------------------------------------------------------------------------ |
| Claude Code | `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`, `.claude/skills/*/SKILL.md` |
| Cursor      | `.cursorrules`, `.cursor/rules/*.mdc`, `.mcp.json`                             |
| Windsurf    | `.windsurfrules`, `.windsurf/rules/rules.md`                                   |
| Cline       | `.clinerules/*.md`                                                             |
| OpenCode    | `opencode.json`                                                                |

Auto-detection: scans all agents, returns the one with most files found. Or use `--agent` to force.

**Parser** (`lib/parser.ts`): Extracts structured config (instructions, skills, MCP servers, permissions, rules) from raw files. Per-agent parsing logic handles format differences (YAML frontmatter in Cursor rules, JSON in OpenCode, numbered files in Cline).

**Project Analyzer** (`lib/project-analyzer.ts`): Deep project scan returning name, file tree (depth 4), key files (10KB limit), package scripts, dependencies, framework/language/test/CI detection, Docker support, env vars.

### Build

- **Bundler:** tsup (ESM only)
- **JSX:** automatic (React)
- **External:** react, ink, @inkjs/ui (peer deps)
- **Output:** `dist/index.js` + `dist/index.d.ts`

---

## Data Flow

### Config Lifecycle

```
Create (builder)
  → Edit (tabs: instructions, skills, MCP, permissions, rules, docs)
  → Auto-save (2s debounce → Supabase)
  → Export (select agent → generate files → ZIP download)
  → Publish (add title, description, use case, tags → marketplace listing)
```

### AI Config Generation

```
User describes project + selects tech stack
  → API generates 5-8 clarifying questions
  → User answers (or auto-answer via AI)
  → API generates full AgentConfig
  → User accepts → loaded into builder
```

### CLI Auth Flow

```
actant login
  → Start local HTTP server (random port)
  → Open browser: actant.io/auth/cli?port=N
  → User logs in via web
  → Browser redirects to localhost:N/callback with tokens
  → Save to ~/.actant/auth.json (0o600)
  → Subsequent commands: Bearer token in headers
  → 401 → auto-refresh tokens → retry
```

### Marketplace Flow

```
Author publishes config → listing created
  → Users search/filter in marketplace
  → View listing detail + reviews
  → Import → creates copy in user's library
  → Edit in builder → export to project
```

### CLI Push/Pull

```
Push: scan local files → parse config → POST /api/configs/push → saved in Actant
Pull: list configs → select → select agent → export → preview files → write to disk
```

---

## Database (Supabase)

### Tables

| Table       | Purpose                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `profiles`  | User profiles — username, display name, bio, avatar, GitHub, plan, Stripe IDs, generation credits                          |
| `configs`   | Agent configurations — owner, name, description, target agent, instructions, skills, MCP servers, permissions, rules, docs |
| `skills`    | Skill catalog — name, description, category, content, compatible agents, tags                                              |
| `templates` | Pre-built config templates — same shape as configs, with use_case and is_featured                                          |
| `listings`  | Marketplace listings — config reference, author, title, description, agent, use case, tags, ratings, downloads             |
| `reviews`   | Listing reviews — author, rating (1-5), comment                                                                            |
| `favorites` | User favorites — user_id + listing_id                                                                                      |

### Auth

- Email/password signup with email confirmation
- GitHub OAuth
- All tables use Row Level Security (RLS)
- Profiles created on first auth via trigger

### Key Relationships

```
profiles 1──N configs
profiles 1──N listings (via author_id)
configs  1──1 listings (via config_id)
listings 1──N reviews
profiles 1──N favorites
listings 1──N favorites
```

---

## Environment Variables

### Required

| Variable                        | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key                    |
| `NEXT_PUBLIC_APP_URL`           | Application URL (used for auth callbacks) |

### Optional

| Variable                             | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| `ANTHROPIC_API_KEY`                  | AI config generation in the builder   |
| `STRIPE_SECRET_KEY`                  | Stripe server-side API                |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signature verification |
| `STRIPE_PRICE_ID_PRO_MONTHLY`        | Pro plan Stripe price ID              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side key                |

### CLI-specific

| Variable         | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `ACTANT_API_URL` | Override API base URL (default: `https://actant.io`) |
