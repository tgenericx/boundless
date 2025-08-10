import { dirname } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const resolvedEntry = require.resolve('prisma-nestjs-graphql');
const generatorPath = dirname(resolvedEntry);

const schemaPath = resolve(__dirname, '../schema.prisma');
const originalSchema = readFileSync(schemaPath, 'utf8');

const modifiedSchema = originalSchema.replace(
  /provider\s*=\s*["']node .*?["']/,
  `provider = "node ${generatorPath}"`,
);

writeFileSync(schemaPath, modifiedSchema);
console.log(`✅ Updated generator path to: ${generatorPath}`);
