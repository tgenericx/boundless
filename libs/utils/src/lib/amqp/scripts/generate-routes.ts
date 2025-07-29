import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';
import { findMonorepoRoot } from './find-monorepo-root';

const monorepoRoot = findMonorepoRoot(__dirname);
const routesDir = path.join(monorepoRoot, 'src/lib/amqp/routes');
const outputPath = path.join(routesDir, '__generated__/route-registry.ts');

const project = new Project({
  tsConfigFilePath: path.join(monorepoRoot, 'tsconfig.json'),
});

project.addSourceFilesAtPaths(`${routesDir}/**/*.routes.ts`);

const sourceFiles = project.getSourceFiles();

const routeMapEntries: string[] = [];
const imports: string[] = [];

for (const file of sourceFiles) {
  const baseName = file.getBaseNameWithoutExtension();
  const serviceName = baseName.replace('.routes', '');
  const varName = `${capitalize(serviceName)}Routes`;

  const variable = file.getVariableDeclaration(varName);

  if (!variable) {
    console.warn(`❌ Missing export: ${varName} in ${baseName}`);
    continue;
  }

  imports.push(`import { ${varName} } from '../${baseName}';`);
  routeMapEntries.push(`  ${JSON.stringify(serviceName)}: ${varName},`);
}

const contents = `
// 🚨 AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

${imports.join('\n')}

export const RouteRegistry = {
${routeMapEntries.join('\n')}
} as const;

export type RegisteredService = keyof typeof RouteRegistry;
export type RegisteredRouteName<S extends RegisteredService> = keyof typeof RouteRegistry[S];
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, contents.trim() + '\n');

console.log(`✅ Routes generated successfully at ${outputPath}`);

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
