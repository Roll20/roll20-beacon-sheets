import { SingleEffectSchema, EffectStringSchema } from "@/schemas/common/SingleEffectSchema";
import { EffectCollectionSchema } from "@/schemas/common/EffectCollection";

function unwrap(schema: any): any {
  const def = schema.def || schema._def;
  if (!def) return schema;

  const typeName = def.typeName || schema.type || def.type;

  if (typeName === 'ZodOptional' || typeName === 'optional' ||
    typeName === 'ZodNullable' || typeName === 'nullable' ||
    typeName === 'ZodDefault' || typeName === 'default') {
    return unwrap(schema.unwrap ? schema.unwrap() : (def.innerType || schema.innerType));
  }

  if (typeName === 'ZodEffects' || typeName === 'transform' || typeName === 'preprocess') {
    return unwrap(def.schema || schema.schema);
  }

  if (typeName === 'pipe') {
    return unwrap(schema.out || def.out);
  }

  return schema;
}

export function discoverEffectCollections(schema: any, path: string = ''): string[] {
  let paths: string[] = [];
  const current = unwrap(schema);
  const def = current?.def || current?._def;

  if (!def) return paths;

  
  if (current === EffectCollectionSchema) {
    paths.push(path);
    return paths;
  }

  const typeName = def.typeName || current.type || def.type;

  
  if (typeName === 'ZodObject' || typeName === 'object') {
    const shape = current.shape || def.shape;
    
    const resolvedShape = typeof shape === 'function' ? shape() : shape;
    for (const key in resolvedShape) {
      const subPath = path ? `${path}.${key}` : key;
      paths = [...paths, ...discoverEffectCollections(resolvedShape[key], subPath)];
    }
  }
  
  else if (typeName === 'ZodUnion' || typeName === 'union') {
    const options = current.options || def.options || [];
    for (const opt of options) {
      const subPaths = discoverEffectCollections(opt, path);
      if (subPaths.includes(path)) {
        paths.push(path);
        break; 
      }
    }
  }

  
  else if (typeName === 'ZodArray' || typeName === 'array') {
    const elementSchema = current.element || def.element || (def.type && typeof def.type !== 'string' ? def.type : undefined);
    const itemSchema = unwrap(elementSchema);

    const isSingleEffect = (s: any): boolean => {
      const sDef = s?.def || s?._def;
      if (!sDef) return false;

      if (s === SingleEffectSchema) return true;

      const sType = sDef.typeName || s.type || sDef.type;

      if (sType === 'ZodUnion' || sType === 'union') {
        const sOptions = s.options || sDef.options || [];
        return sOptions.some((opt: any) => {
          const optDef = opt?.def || opt?._def;
          const optType = optDef?.typeName || opt?.type || optDef?.type;
          const optShape = opt.shape || optDef?.shape;
          const resolvedOptShape = typeof optShape === 'function' ? optShape() : (optShape || {});
          return (optType === 'ZodObject' || optType === 'object') && 'attribute' in resolvedOptShape;
        });
      }

      if (sType === 'ZodObject' || sType === 'object') {
        const shape = s.shape || sDef.shape;
        const resolvedShape = typeof shape === 'function' ? shape() : (shape || {});
        return 'attribute' in resolvedShape && 'operation' in resolvedShape;
      }
      return false;
    };

    if (isSingleEffect(itemSchema)) {
      paths.push(path);
    } else {
      const subPaths = discoverEffectCollections(itemSchema, `${path}[*]`);
      paths = [...paths, ...subPaths];
    }
  }

  
  else if (typeName === 'ZodString' || typeName === 'string') {
    if (current === EffectStringSchema) {
      paths.push(path);
    }
  }

  return paths;
}