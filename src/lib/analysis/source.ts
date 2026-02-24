/**
 * ProjectDataSource interface — abstracts file access for analysis passes.
 * Implemented by GitHubSource (web) and FsSource (CLI).
 */

export interface ProjectDataSource {
  /** Source type identifier */
  readonly type: "github" | "filesystem";

  /** Repository or project name */
  readonly name: string;

  /** Optional description (from GitHub API or package.json) */
  readonly description: string | null;

  /**
   * List all file paths in the project (relative to root).
   * Directories end with "/". Limited to a reasonable depth/count.
   */
  listFiles(): Promise<string[]>;

  /**
   * Check if a file or directory exists at the given path.
   */
  fileExists(path: string): Promise<boolean>;

  /**
   * Read a file's text content. Returns null if not found or binary.
   * Implementations should cap at a reasonable size (e.g. 50KB).
   */
  readFile(path: string): Promise<string | null>;

  /**
   * Read and parse a JSON file. Returns null if not found or invalid.
   */
  readJson<T>(path: string): Promise<T | null>;

  /**
   * List files in a directory (non-recursive). Returns relative paths.
   */
  listDirectory(path: string): Promise<string[]>;

  /**
   * Read multiple files in parallel. Returns a map of path → content.
   * Missing files are omitted from the result.
   */
  readFiles(paths: string[]): Promise<Record<string, string>>;
}
