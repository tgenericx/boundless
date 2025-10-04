import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Options for customizing the behavior of {@link findRoot}.
 */
export interface FindRootOptions {
  /**
   * List of files or markers that identify the root of a project.
   * Defaults to `["package.json", ".git"]`.
   *
   * @example
   * ```ts
   * { rootFiles: ["nx.json", "package.json"] }
   * ```
   */
  rootFiles?: string[];

  /**
   * Maximum number of parent directories to traverse while searching.
   * Defaults to `20`.
   */
  maxDepth?: number;

  /**
   * Whether to stop searching when the user's home directory is reached.
   * Defaults to `true`.
   */
  stopAtHome?: boolean;
}

/**
 * Recursively searches upward from a given directory until a "project root"
 * is found. A project root is defined as a directory containing at least one
 * of the files specified in {@link FindRootOptions.rootFiles}.
 *
 * By default, it looks for `package.json` or `.git` within a maximum depth of 20 levels,
 * and stops if the search reaches the user's home directory.
 *
 * @param currentDir - The starting directory for the search.
 * @param options - Optional configuration for customizing search behavior.
 * @returns The absolute path to the detected project root directory.
 *
 * @throws If no matching root directory is found within the given constraints.
 *
 * @example
 * ```ts
 * // Find project root starting from current working directory
 * const root = findRoot(process.cwd());
 *
 * // Custom search: look for Nx monorepo marker
 * const nxRoot = findRoot(__dirname, {
 *   rootFiles: ["nx.json", "package.json"],
 *   maxDepth: 50,
 * });
 * ```
 */
export function findRoot(
  currentDir: string,
  options: FindRootOptions = {},
): string {
  const {
    rootFiles = ['package.json', '.git'],
    maxDepth = 20,
    stopAtHome = true,
  } = options;

  const homeDir = os.homedir();
  let dir = path.resolve(currentDir);
  let depth = 0;

  while (depth < maxDepth) {
    const hasRootFile = rootFiles.some((file) =>
      fs.existsSync(path.join(dir, file)),
    );

    if (hasRootFile) {
      return dir;
    }

    const parentDir = path.dirname(dir);

    if (parentDir === dir || (stopAtHome && dir === homeDir)) {
      throw new Error(
        `Project root not found. Looked for: ${rootFiles.join(', ')}. ` +
          `Searched up from: ${currentDir}`,
      );
    }

    dir = parentDir;
    depth++;
  }

  throw new Error(
    `Reached maximum depth of ${maxDepth} while searching for project root. ` +
      `Looked for: ${rootFiles.join(', ')}`,
  );
}
