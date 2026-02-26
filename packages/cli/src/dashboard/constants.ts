export const ASCII_LOGO = `    _   ___ _____ _   _  _ _____
   /_\\ / __|_   _/_\\ | \\| |_   _|
  / _ \\ (__  | |/ _ \\| .\` | | |
 /_/ \\_\\___| |_/_/ \\_\\_|\\_| |_|`;

export const TAGLINE = "Configs & workflows for AI coding agents";

export const VERSION = "0.1.0";

export interface MenuItem {
  id: string;
  label: string;
  description: string;
  requiresAuth: boolean;
  separator?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "analyze",
    label: "Analyze Project",
    description: "Scan project structure and tools",
    requiresAuth: false,
  },
  {
    id: "docs",
    label: "Generate Docs",
    description: "Generate documentation with AI",
    requiresAuth: true,
  },
  {
    id: "init",
    label: "Pull Config",
    description: "Pull a config or workflow from Actant",
    requiresAuth: true,
  },
  {
    id: "push",
    label: "Push Config",
    description: "Push local config, commands & agents to Actant",
    requiresAuth: true,
  },
  {
    id: "list",
    label: "My Configs",
    description: "List saved configs and workflows",
    requiresAuth: true,
  },
  {
    id: "login",
    label: "Login",
    description: "Authenticate with actant.io",
    requiresAuth: false,
    separator: true,
  },
];

export type ScreenId = "menu" | "analyze" | "docs" | "init" | "push" | "list" | "login";
