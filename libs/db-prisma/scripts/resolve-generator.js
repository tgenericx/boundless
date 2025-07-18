const path = require('path');
const generatorPath = path.resolve(
  __dirname,
  '../node_modules/prisma-nestjs-graphql',
);
console.error('Using generator path:', generatorPath);
console.log(`node ${generatorPath}`);
