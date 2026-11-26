import { isRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from './objectify';
import { normalizeArrays } from './normalizeArrays';

const getBaseSchema = (schema: any): any => {
  if (!schema) return schema;
  
  if (schema._def) {
    if (schema._def.typeName === 'ZodEffects') return getBaseSchema(schema._def.schema);
    if (schema._def.typeName === 'ZodDefault') return getBaseSchema(schema._def.innerType);
    if (schema._def.typeName === 'ZodOptional') return getBaseSchema(schema._def.innerType);
    if (schema._def.typeName === 'ZodNullable') return getBaseSchema(schema._def.innerType);
    if (schema._def.typeName === 'ZodPipeline') return getBaseSchema(schema._def.out);
  }

  const type = schema.type || schema.def?.type;
  if (type === 'pipe') return getBaseSchema(schema.out);
  if (type === 'transform') return getBaseSchema(schema.schema);
  if (type === 'default') return getBaseSchema(schema.def?.innerType || schema.innerType);
  if (type === 'optional') return getBaseSchema(schema.def?.innerType || schema.innerType);
  if (type === 'nullable') return getBaseSchema(schema.def?.innerType || schema.innerType);

  return schema;
};

const getShape = (schema: any): any => {
  const shape = schema.shape || schema.def?.shape;
  return typeof shape === 'function' ? shape() : (shape || {});
};

export const genericDehydrate = (input: any, schema?: any): any => {
  if (isRef(input)) {
    return genericDehydrate(input.value, schema);
  }

  const baseSchema = getBaseSchema(schema);

  if (Array.isArray(input)) {
    const isArraySchema = baseSchema?.type === 'array' || baseSchema?._def?.typeName === 'ZodArray';
    
    if (input.length === 0 && isArraySchema) {
      return {};
    }

    const itemSchema = isArraySchema ? (baseSchema.element || baseSchema._def?.type) : undefined;
    const dehydratedArray = input.map((item) => genericDehydrate(item, itemSchema));

    
    const canObjectify = dehydratedArray.length > 0 && dehydratedArray.every(item => item && typeof item === 'object' && '_id' in item);
    return canObjectify ? arrayToObject(dehydratedArray) : dehydratedArray;
  }

  if (typeof input === 'object' && input !== null) {
    const isObjectSchema = baseSchema?.type === 'object' || baseSchema?._def?.typeName === 'ZodObject';
    const result: Record<string, any> = {};
    for (const key in input) {
      const childSchema = isObjectSchema ? getShape(baseSchema)[key] : undefined;
      result[key] = genericDehydrate(input[key], childSchema);
    }
    return result;
  }

  return input;
};

export const genericHydrate = (snapshot: any, target: any, schema?: any, originalSnapshot?: any) => {
  if (!snapshot || !target) return;

  const orig = originalSnapshot !== undefined ? originalSnapshot : snapshot;

  if (schema && typeof schema.safeParse === 'function') {
    const parsed = schema.safeParse(snapshot);
    if (parsed.success) {
      snapshot = parsed.data;
    } else {
      console.warn('[store.ts] genericHydrate Zod validation warning:', parsed.error);
    }
  }

  snapshot = normalizeArrays(snapshot);

  const baseSchema = getBaseSchema(schema);
  const isObjectSchema = baseSchema?.type === 'object' || baseSchema?._def?.typeName === 'ZodObject';

  for (const key in snapshot) {
    if (!(key in target)) continue;

    
    
    
    if (orig && typeof orig === 'object' && !(key in orig)) {
      continue;
    }

    let value = snapshot[key];
    const childSchema = isObjectSchema ? getShape(baseSchema)[key] : undefined;
    const baseChildSchema = getBaseSchema(childSchema);
    const isChildArraySchema = baseChildSchema?.type === 'array' || baseChildSchema?._def?.typeName === 'ZodArray';

    
    if (
      isChildArraySchema &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      value = [];
    }

    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const isObjectifiedArray = Object.values(value).some(
        (item: any) => item && typeof item === 'object' && 'arrayPosition' in item
      );
      const isTargetArray = isRef(target[key]) ? Array.isArray(target[key].value) : Array.isArray(target[key]);

      if (isObjectifiedArray || isTargetArray) {
        value = objectToArray(value);
      }
    }

    if (Array.isArray(value)) {
      value.forEach((item: any) => {
        if (item && typeof item === 'object' && !item._id) {
          item._id = uuidv4();
        }
      });
    }

    if (isRef(target[key])) {
      target[key].value = value ?? target[key].value;
    } else if (
      typeof target[key] === 'object' &&
      target[key] !== null &&
      typeof value === 'object' &&
      value !== null
    ) {
      genericHydrate(value, target[key], childSchema, orig ? orig[key] : undefined);
    }
  }
};

