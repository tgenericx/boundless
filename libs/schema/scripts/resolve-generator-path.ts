import { dirname } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const resolvedEntry = require.resolve('prisma-nestjs-graphql');
const generatorPath = dirname(resolvedEntry);

const schemaPath = resolve(__dirname, '../schema.prisma');
const originalSchema = readFileSync(schemaPath, 'utf8');

const modifiedSchema = originalSchema.replace(
  /(generator[\s\S]*?\{[\s\S]*?provider\s*=\s*)["']node .*?["']/i,
  `$1"node ${generatorPath}"`,
);

writeFileSync(schemaPath, modifiedSchema);
console.log(`✅ Updated generator path to: ${generatorPath}`);
