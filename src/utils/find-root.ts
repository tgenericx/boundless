import * as fs from 'fs';
import * as path from 'path';

export function findRoot(currentDir: string): string {
  let dir = currentDir;
  while (
    !fs.existsSync(path.join(dir, 'nx.json')) &&
    !fs.existsSync(path.join(dir, 'package.json'))
  ) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('Monorepo root not found');
    dir = parent;
  }
  return dir;
}
