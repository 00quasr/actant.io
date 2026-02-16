# Actant.io

CLI agent configuration platform. Build, share, and export configurations for AI coding agents.

Actant provides a visual builder for creating configuration files that AI coding agents read to understand your project. Instead of manually writing rules files, permission configs, and MCP server definitions, you use the builder to assemble everything and export a ready-to-use set of files.


https://github.com/user-attachments/assets/078cc9be-4312-4060-894c-f8b81a702aa9


## Supported Agents

| Agent | Config Files | MCP Support |
|-------|-------------|-------------|
| Claude Code | `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`, `.claude/skills/*/SKILL.md` | Yes |
| Cursor | `.cursorrules`, `.cursor/rules/*.mdc`, `.mcp.json` | Yes |
| Windsurf | `.windsurfrules`, `.windsurf/rules/rules.md` | No |
| Cline | `.clinerules/*.md` (numbered) | No |
| OpenCode | `opencode.json` | Yes |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/keanuklestil/actant.io.git
cd actant.io

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_APP_URL

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing page, auth pages (top nav + footer layout)
│   ├── (app)/           # Builder, marketplace, profile (sidebar layout, auth required)
│   ├── (docs)/          # Documentation pages (docs sidebar layout)
│   ├── auth/            # OAuth callback handler
│   └── api/             # REST API endpoints
├── components/
│   ├── ui/              # shadcn/ui primitives (auto-generated)
│   ├── layout/          # Top nav, sidebar nav, docs sidebar, footer
│   ├── auth/            # Login form, signup form, auth guard, user menu
│   ├── builder/         # Builder shell, tabs, export dialog
│   ├── marketplace/     # Search, filters, listing components
│   ├── config/          # Config card, agent badge, rating stars
│   ├── markdown/        # Markdown editor, markdown preview
│   ├── landing/         # Hero, features, how-it-works sections
│   └── profile/         # Profile header, saved/published lists
├── lib/
│   ├── supabase/        # Supabase client (browser), server client, middleware
│   ├── exporters/       # Agent-specific exporters (claude-code, cursor, windsurf, cline, opencode)
│   ├── utils.ts         # cn() helper for Tailwind class merging
│   └── constants.ts     # Agent types, categories, nav items, enums
├── hooks/               # Custom hooks (use-auth, use-config, use-debounce, use-auto-save)
├── types/               # TypeScript definitions (database, config, marketplace)
├── services/            # Data access layer (configs, skills, marketplace, reviews, profiles)
└── validations/         # Zod schemas (config, review, profile)
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui + Radix UI
- **Icons:** Radix Icons
- **Validation:** Zod
- **Editor:** CodeMirror (Markdown + JSON)
- **Font:** Inter (via next/font/google)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run typecheck` | Run TypeScript type checking |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `NEXT_PUBLIC_APP_URL` | Application URL (http://localhost:3000 for dev) |
| `ANTHROPIC_API_KEY` | Anthropic API key (for AI features) |
| `STRIPE_SECRET_KEY` | Stripe secret key (for payments) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | Stripe price ID for Pro plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the existing code style:
   - TypeScript strict mode, no `any`
   - Named exports
   - Functional components
   - Tailwind CSS for styling
   - Zod for validation
4. Run checks before committing:
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```
5. Commit with conventional format: `type(scope): message`
6. Push and open a pull request against `main`

## License

MIT
