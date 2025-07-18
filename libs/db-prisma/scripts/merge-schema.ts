import * as fs from 'fs';
import * as path from 'path';

const partsDir = path.join(__dirname, '..', 'prisma');
const outputFile = path.join(__dirname, '..', 'schema.prisma');

const parts = fs
  .readdirSync(partsDir)
  .filter((f) => f.endsWith('.prisma'))
  .sort();

const schema = parts
  .map((file) => fs.readFileSync(path.join(partsDir, file), 'utf-8'))
  .join('\n\n');

fs.writeFileSync(outputFile, schema);
console.log(`✅ schema.prisma generated from ${parts.length} parts`);
