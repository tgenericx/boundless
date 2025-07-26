import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { ExchangeOperation } from '../../libs/types/src/lib/amqp/exchange.constants';
import { findMonorepoRoot } from './find-root';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q: string): Promise<string> =>
  new Promise((res) => rl.question(q, res));

(async (): Promise<void> => {
  const service = (await ask('Service name (e.g., auth): ')).trim();
  const operation = (
    await ask('Operation (command/query/event): ')
  ).trim() as ExchangeOperation;

  const root = findMonorepoRoot(__dirname);
  const filePath = path.join(
    root,
    `libs/types/src/lib/amqp/exchanges/${service}.exchanges.ts`,
  );

  const constName = `${service.toUpperCase()}_EXCHANGES`;
  const newEntry = `${operation}: defineExchange('${service}', '${operation}')`;

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  let existingContent = '';
  if (fs.existsSync(filePath)) {
    existingContent = fs.readFileSync(filePath, 'utf-8');
  }

  // Extract existing entries
  const entryRegex = /(\w+):\s*defineExchange\([^)]+\)/g;
  const entries: Record<string, string> = {};

  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(existingContent))) {
    const op = match[1];
    entries[op] = `${op}: defineExchange('${service}', '${op}')`;
  }

  // Add or update the current operation
  entries[operation] = newEntry;

  // Generate updated content
  const merged = Object.values(entries)
    .map((line) => `  ${line},`)
    .join('\n');

  const updatedContent = `import { defineExchange } from '../define-exchange';

export const ${constName} = {
${merged}
};
`;

  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Exchange config written to', filePath);
  require('./generate-exchange-config');
  rl.close();
})();
