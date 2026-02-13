export const SITE_NAME = "Actant";
export const SITE_DESCRIPTION =
  "Configure, share, and export CLI agent configurations for Claude Code, Cursor, Windsurf, Cline, and OpenCode.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://actant.io";

export const NAV_ITEMS = {
  marketing: [
    { label: "Features", href: "/#features" },
    { label: "Docs", href: "/docs" },
    { label: "Marketplace", href: "/marketplace" },
  ],
  app: [
    { label: "Builder", href: "/builder", icon: "Pencil2Icon" },
    { label: "Marketplace", href: "/marketplace", icon: "MagnifyingGlassIcon" },
    { label: "Profile", href: "/profile", icon: "PersonIcon" },
  ],
  docs: [
    {
      title: "Getting Started",
      items: [{ label: "Introduction", href: "/docs/getting-started" }],
    },
    {
      title: "Agents",
      items: [
        { label: "Claude Code", href: "/docs/agents/claude-code" },
        { label: "Cursor", href: "/docs/agents/cursor" },
        { label: "Windsurf", href: "/docs/agents/windsurf" },
        { label: "Cline", href: "/docs/agents/cline" },
        { label: "OpenCode", href: "/docs/agents/opencode" },
      ],
    },
    {
      title: "Resources",
      items: [{ label: "Community", href: "/docs/community" }],
    },
  ],
} as const;
