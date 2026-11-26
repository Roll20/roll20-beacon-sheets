import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { compendium } from '../src/schemas/compendium';

function zodToJsonSchema(schema: any): any {
  if (!schema) return {};

  const def = schema._def || schema.def;
  if (!def) return {};

  const typeName = def.type || def.typeName || schema.constructor.name || '';

  const isOptional = typeName === 'optional' || typeName === 'ZodOptional';
  const isDefault = typeName === 'default' || typeName === 'ZodDefault';
  const isNullable = typeName === 'nullable' || typeName === 'ZodNullable';
  const isEffects = typeName === 'effects' || typeName === 'ZodEffects' || typeName === 'preprocess' || typeName === 'transform' || schema.constructor.name === 'ZodEffects' || schema.constructor.name === 'ZodPreprocess';
  const isPipeline = typeName === 'pipeline' || typeName === 'ZodPipeline' || typeName === 'pipe';

  if (isOptional || isDefault || isNullable) {
    return zodToJsonSchema(def.innerType);
  }
  if (isEffects) {
    return zodToJsonSchema(def.schema || def.innerType || def.out || def.in);
  }
  if (isPipeline) {
    return zodToJsonSchema(def.out || def.in);
  }

  const isString = typeName === 'string' || typeName === 'ZodString';
  const isNumber = typeName === 'number' || typeName === 'ZodNumber';
  const isBoolean = typeName === 'boolean' || typeName === 'ZodBoolean';

  if (isString) {
    return { type: 'string' };
  }
  if (isNumber) {
    return { type: 'number' };
  }
  if (isBoolean) {
    return { type: 'boolean' };
  }

  const isEnum = typeName === 'enum' || typeName === 'ZodEnum';
  const isNativeEnum = typeName === 'nativeEnum' || typeName === 'ZodNativeEnum';

  if (isEnum) {
    const rawValues = def.values || def.entries || [];
    const values = Array.isArray(rawValues) ? rawValues : Object.values(rawValues);
    return { type: 'string', enum: values };
  }
  if (isNativeEnum) {
    const rawValues = Object.values(def.values || {});
    const values = Array.isArray(rawValues) ? rawValues : Object.values(rawValues);
    return { type: 'string', enum: values };
  }

  const isObject = typeName === 'object' || typeName === 'ZodObject' || schema.constructor.name === 'ZodObject';
  if (isObject) {
    const properties: any = {};
    const required: string[] = [];
    const shape = typeof def.shape === 'function' ? def.shape() : (def.shape || {});

    for (const key in shape) {
      const propSchema = shape[key];
      properties[key] = zodToJsonSchema(propSchema);

      let isPropOptional = false;
      let curr = propSchema;
      while (curr && curr._def) {
        const currType = curr._def.type || curr._def.typeName || curr.constructor.name || '';
        if (currType === 'optional' || currType === 'ZodOptional' || currType === 'default' || currType === 'ZodDefault') {
          isPropOptional = true;
          break;
        }
        curr = curr._def.innerType;
      }
      if (!isPropOptional) {
        required.push(key);
      }
    }

    const objSchema: any = { type: 'object', properties };
    if (required.length > 0) {
      objSchema.required = required;
    }
    return objSchema;
  }

  const isArray = typeName === 'array' || typeName === 'ZodArray' || schema.constructor.name === 'ZodArray';
  if (isArray) {
    const elementSchema = def.element || def.type || def.innerType;
    return {
      type: 'array',
      items: zodToJsonSchema(elementSchema)
    };
  }

  return { type: 'object' };
}

try {
  const categoryNames = compendium.map((c) => c.category);

  // Reference definition shared among schemas
  const referenceDefinition = {
    type: 'object',
    required: ['categoryName', 'pageName'],
    properties: {
      categoryName: {
        type: 'string',
        enum: categoryNames
      },
      pageName: { type: 'string' }
    }
  };

  const outputDir = join(process.cwd(), 'public/schemas');
  mkdirSync(outputDir, { recursive: true });

  // Generate individual category page wrapper schemas
  for (const entry of compendium) {
    const category = entry.category;
    // Format category name for the title (e.g., Features -> Feature)
    const title = category.endsWith('s') ? category.slice(0, -1) : category;

    const payloadSchema = zodToJsonSchema(entry.schema);

    // Build the anyOf refs array to include every category's schema file
    const childRefs = [
      { $ref: '#/definitions/reference' }
    ];
    for (const otherEntry of compendium) {
      const otherName = otherEntry.category.toLowerCase();
      const otherSingular = otherName.endsWith('s') ? otherName.slice(0, -1) : otherName;
      childRefs.push({
        $ref: `${otherSingular}-page-schema.json`
      });
    }

    const schemaContent = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `${title} Page Wrapper`,
      description: `JSON Schema representing a Compendium Page Wrapper for ${category} supporting recursive child components.`,
      type: 'object',
      required: ['categoryName', 'data-payload'],
      properties: {
        categoryName: { type: 'string', const: category },
        'data-payload': payloadSchema,
        'data-children': {
          type: 'array',
          items: {
            anyOf: childRefs
          }
        }
      },
      definitions: {
        reference: referenceDefinition
      }
    };

    const fileName = `${title.toLowerCase()}-page-schema.json`;
    const filePath = join(outputDir, fileName);
    writeFileSync(filePath, JSON.stringify(schemaContent, null, 2), 'utf-8');
    console.log(`[build-schema] Generated ${title} schema to ${filePath}`);
  }
} catch (error) {
  console.error('[build-schema] Error building schemas:', error);
  process.exit(1);
}
