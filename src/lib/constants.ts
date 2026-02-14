export const SITE_NAME = "Actant";
export const SITE_DESCRIPTION =
  "Configure, share, and export CLI agent configurations for Claude Code, Cursor, Windsurf, Cline, and OpenCode.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://actant.io";

export const NAV_ITEMS = {
  marketing: [
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Marketplace", href: "/marketplace" },
  ],
  app: [
    {
      title: "Build",
      items: [
        { label: "New Config", href: "/builder", icon: "Pencil2Icon" },
        { label: "My Library", href: "/configs", icon: "FileTextIcon" },
        { label: "Templates", href: "/templates", icon: "LayoutIcon" },
      ],
    },
    {
      title: "Discover",
      items: [
        { label: "Marketplace", href: "/marketplace", icon: "MagnifyingGlassIcon" },
        { label: "Favorites", href: "/favorites", icon: "HeartIcon" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Settings", href: "/profile/settings", icon: "GearIcon" },
      ],
    },
  ],
  docs: [
    {
      title: "Getting Started",
      items: [{ label: "Introduction", href: "/docs/getting-started" }],
    },
    {
      title: "CLI",
      items: [{ label: "Installation & Usage", href: "/docs/cli" }],
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
