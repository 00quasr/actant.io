import type { AgentType, UseCase } from "./config";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Config {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  target_agent: AgentType;
  instructions: Record<string, unknown>;
  skills: Record<string, unknown>[];
  mcp_servers: Record<string, unknown>[];
  permissions: Record<string, string>;
  rules: Record<string, unknown>[];
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  author_id: string | null;
  name: string;
  slug: string;
  description: string;
  category: string;
  content: string;
  compatible_agents: AgentType[];
  tags: string[];
  version: string;
  download_count: number;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  target_agent: AgentType;
  use_case: UseCase;
  instructions: Record<string, unknown>;
  skills: Record<string, unknown>[];
  mcp_servers: Record<string, unknown>[];
  permissions: Record<string, string>;
  rules: Record<string, unknown>[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  config_id: string;
  author_id: string;
  title: string;
  description: string;
  target_agent: AgentType;
  use_case: UseCase;
  tags: string[];
  avg_rating: number;
  review_count: number;
  download_count: number;
  is_featured: boolean;
  published_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Review {
  id: string;
  listing_id: string;
  author_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}
