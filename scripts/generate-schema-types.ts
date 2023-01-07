#!/usr/bin/env ts-node

import { compileFromFile } from 'json-schema-to-typescript';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function main() {
  const rulesPath = path.join(process.cwd(), './lib/rules');
  const files = await fs.readdir(rulesPath);

  for (const file of files.filter((file) => path.extname(file) === '.json')) {
    console.log('Generating for file: %s', file);
    const generatedType = await compileFromFile(path.join(rulesPath, file), {
      additionalProperties: false,
      bannerComment: '/** This is a generated file. */',
      strictIndexSignatures: true,
    });

    const writePath = path.join(rulesPath, path.basename(file).replaceAll('.json', '.d.ts'));
    await fs.writeFile(writePath, generatedType);
  }
}

main();
