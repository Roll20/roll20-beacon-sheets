import { zodToJsonSchema } from 'zod-to-json-schema';
import fs from 'fs';
import path from 'path';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const schemaMappings = fs
  .readdirSync('./src/schemas')
  .filter(file => file.endsWith('.ts'))
  .map(file => {
    const fileName = path.parse(file).name;
    const schemaExport = `${capitalize(fileName)}CompendiumSchema`;
    return {
      source: `./schemas/${file}`,
      schemaExport,
      destination: `generatedSchemas/${fileName}.json`
    };
  });

async function generateAllSchemas() {
  console.log('Generating JSON schemas from Zod schemas...');

  for (const mapping of schemaMappings) {
    try {
      const module = await import(mapping.source);
      const zodSchema = module[mapping.schemaExport];

      if (!zodSchema) {
        console.error(`❌ Error: Schema '${mapping.schemaExport}' not found in '${mapping.source}'. Skipping.`);
        continue;
      }

      const jsonSchema = zodToJsonSchema(zodSchema, mapping.schemaExport);

      const destDir = path.dirname(mapping.destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.writeFileSync(
        mapping.destination,
        JSON.stringify(jsonSchema, null, 2)
      );

      console.log(`✅ Generated ${mapping.destination}`);
    } catch (error) {
      console.error(`❌ Failed to process ${mapping.source}:`, error);
    }
  }

  console.log('\nSchema generation complete!');
}

generateAllSchemas();