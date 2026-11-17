import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unconstrainedJsonSchemas } from './schemas/common/jsonSchema.ts';

const projectDir = fileURLToPath(new URL('../', import.meta.url));
const schemaDir = path.join(projectDir, 'src', 'schemas');
const outputDir = path.join(projectDir, 'generatedSchemas');

export function toJsonSchema(schema) {
  return z.toJSONSchema(schema, {
    target: 'draft-7',
    io: 'input',
    reused: 'ref',
    unrepresentable: ({ zodSchema }) => {
      if (zodSchema.type === 'undefined') return { not: {} };
      if (zodSchema.type === 'custom' && unconstrainedJsonSchemas.has(zodSchema)) return 'any';
      return 'throw';
    },
  });
}

export async function generateSchemas() {
  const files = (await fs.readdir(schemaDir)).filter(file => file.endsWith('.ts')).sort();
  if (files.length === 0) throw new Error(`No schema files found in ${schemaDir}`);

  const schemas = [];
  for (const file of files) {
    const name = path.parse(file).name;
    const schemaExport = `${name.charAt(0).toUpperCase()}${name.slice(1)}CompendiumSchema`;
    const module = await import(pathToFileURL(path.join(schemaDir, file)).href);
    const schema = module[schemaExport];
    if (!schema) throw new Error(`Schema '${schemaExport}' not found in '${file}'`);
    try {
      schemas.push({ name, schema: toJsonSchema(schema) });
    } catch (error) {
      throw new Error(`Failed to convert '${schemaExport}' in '${file}'`, { cause: error });
    }
  }
  return schemas;
}

async function main() {
  const schemas = await generateSchemas();
  await fs.mkdir(outputDir, { recursive: true });
  for (const { name, schema } of schemas) {
    await fs.writeFile(path.join(outputDir, `${name}.json`), `${JSON.stringify(schema, null, 2)}\n`);
    console.log(`Generated generatedSchemas/${name}.json`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Schema generation failed:', error);
    process.exitCode = 1;
  });
}
