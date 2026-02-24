/**
 * GitHub API implementation of ProjectDataSource.
 * Extracts repo data via the GitHub REST API (v3).
 */

import type { ProjectDataSource } from "./source";

interface GitHubRepoMeta {
  description: string | null;
  language: string | null;
  topics: string[];
}

interface GitHubTreeItem {
  path: string;
  type: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubContentItem {
  name: string;
  type: string;
}

const MAX_TREE_FILES = 5000;
const MAX_FILE_SIZE = 50 * 1024; // 50KB

export class GitHubSource implements ProjectDataSource {
  readonly type = "github" as const;
  readonly name: string;
  readonly description: string | null;

  private readonly owner: string;
  private readonly repo: string;
  private readonly token: string;
  private readonly basePath: string;
  private fileTreeCache: string[] | null = null;

  constructor(owner: string, repo: string, token: string, meta?: { description: string | null }) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.name = `${owner}/${repo}`;
    this.basePath = `/repos/${owner}/${repo}`;
    this.description = meta?.description ?? null;
  }

  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  }

  static async create(owner: string, repo: string, token: string): Promise<GitHubSource> {
    const basePath = `/repos/${owner}/${repo}`;
    const meta = await fetchJsonSafe<GitHubRepoMeta>(basePath, token);
    if (!meta) {
      throw new Error("Repository not found or inaccessible");
    }
    return new GitHubSource(owner, repo, token, {
      description: meta.description,
    });
  }

  async listFiles(): Promise<string[]> {
    if (this.fileTreeCache) return this.fileTreeCache;

    const treeData = await fetchJsonSafe<GitHubTreeResponse>(
      `${this.basePath}/git/trees/HEAD?recursive=1`,
      this.token,
    );

    if (!treeData) {
      // Fall back to root contents listing
      const contents = await fetchJsonSafe<GitHubContentItem[]>(
        `${this.basePath}/contents`,
        this.token,
      );
      this.fileTreeCache = (contents ?? []).map((item) =>
        item.type === "dir" ? `${item.name}/` : item.name,
      );
      return this.fileTreeCache;
    }

    this.fileTreeCache = treeData.tree
      .slice(0, MAX_TREE_FILES)
      .map((item) => (item.type === "tree" ? `${item.path}/` : item.path));
    return this.fileTreeCache;
  }

  async fileExists(path: string): Promise<boolean> {
    const files = await this.listFiles();
    const normalized = path.replace(/\/$/, "");
    return files.some((f) => f === normalized || f === `${normalized}/`);
  }

  async readFile(path: string): Promise<string | null> {
    const res = await fetchGitHub(
      `${this.basePath}/contents/${path}`,
      this.token,
      "application/vnd.github.raw",
    );
    if (!res.ok) return null;

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      const text = await res.text();
      return text.slice(0, MAX_FILE_SIZE);
    }

    return res.text();
  }

  async readJson<T>(path: string): Promise<T | null> {
    const content = await this.readFile(path);
    if (!content) return null;
    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  async listDirectory(path: string): Promise<string[]> {
    const contents = await fetchJsonSafe<GitHubContentItem[]>(
      `${this.basePath}/contents/${path}`,
      this.token,
    );
    if (!contents || !Array.isArray(contents)) return [];
    return contents.map((item) => (item.type === "dir" ? `${item.name}/` : item.name));
  }

  async readFiles(paths: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    const settled = await Promise.allSettled(
      paths.map(async (p) => {
        const content = await this.readFile(p);
        if (content !== null) {
          results[p] = content;
        }
      }),
    );
    void settled;
    return results;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function fetchGitHub(path: string, token: string, accept?: string): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept ?? "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

async function fetchJsonSafe<T>(path: string, token: string): Promise<T | null> {
  const res = await fetchGitHub(path, token);
  if (!res.ok) return null;
  return (await res.json()) as T;
}
