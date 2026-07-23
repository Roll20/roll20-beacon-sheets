import type { ZodSchema } from 'zod';
import { isRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { compendium } from '@/schemas/compendium';

export interface ValidationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function makeSchemaPartial(schema: any): any {
  if (!schema || !schema._def) return schema;
  const def = schema._def;
  const type = def.type;
  if (type === 'object') {
    let base = schema;
    if (schema && 'omit' in schema && typeof schema.omit === 'function') {
      const shape = schema.shape || def.shape || {};
      if ('_children' in shape) {
        base = schema.omit({ _children: true });
      }
    }
    return base.partial();
  }
  if (type === 'default' || type === 'optional' || type === 'nullable') {
    return makeSchemaPartial(def.innerType).optional();
  }
  if (type === 'pipe') {
    return makeSchemaPartial(def.out || def.in).optional();
  }
  return schema;
}

export function parseInput(input: any): any {
  if (typeof input !== 'string') {
    return input;
  }

  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  
  try {
    return JSON.parse(trimmed);
  } catch {
    
    return trimmed;
  }
}

export function transformPageToWrapper(page: any): any {
  if (!page || typeof page !== 'object') return null;

  const properties = page.properties || page;

  const categoryName = properties.Category || properties.category || page.categoryName || page.Category || '';
  let payload = properties['data-payload'] !== undefined ? properties['data-payload'] : page['data-payload'];
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      // ignore
    }
  }

  let rawChildren = page.children || properties['data-children'] || [];
  if (typeof rawChildren === 'string') {
    try {
      rawChildren = JSON.parse(rawChildren);
    } catch {
      rawChildren = [];
    }
  }
  const children: any[] = [];

  if (Array.isArray(rawChildren)) {
    for (const child of rawChildren) {
      const mapped = transformPageToWrapper(child);
      if (mapped) {
        children.push(mapped);
      }
    }
  }

  if (payload === undefined) {
    return null;
  }

  return {
    categoryName,
    'data-payload': payload,
    'data-children': children
  };
}

function validateNode(node: any, defaultSchema: ZodSchema): { success: true; node: any } | { success: false; error: string } {
  const categoryName = node.categoryName || '';

  let schema = defaultSchema;
  let target = null;
  if (categoryName) {
    const handler = compendium.find((c) => c.category === categoryName);
    if (!handler) {
      return { success: false, error: `No compendium category found for "${categoryName}".` };
    }
    schema = handler.schema;
    target = handler.target;
  }

  const partialSchema = makeSchemaPartial(schema);
  const result = partialSchema.safeParse(node['data-payload']);
  if (!result.success) {
    const errorMsg = result.error.issues
      .map((err: any) => `${err.path.join('.') || 'root'}: ${err.message}`)
      .join(', ');
    return { success: false, error: `[${categoryName || 'Root'}] Validation failed: ${errorMsg}` };
  }

  const validatedChildren: any[] = [];
  if (Array.isArray(node['data-children'])) {
    for (const child of node['data-children']) {
      const childRes = validateNode(child, defaultSchema);
      if (!childRes.success) {
        return childRes;
      }
      validatedChildren.push(childRes.node);
    }
  }

  return {
    success: true,
    node: {
      categoryName,
      data: result.data,
      target,
      children: validatedChildren
    }
  };
}

export function validateEntry(input: any, schema: ZodSchema): ValidationResult {
  const parsed = parseInput(input);

  const wrapper = (parsed && typeof parsed === 'object' && ('properties' in parsed || 'data-payload' in parsed))
    ? transformPageToWrapper(parsed)
    : null;

  if (wrapper) {
    const res = validateNode(wrapper, schema);
    if (res.success) {
      return {
        success: true,
        data: {
          isWrapper: true,
          node: res.node
        }
      };
    } else {
      return { success: false, error: res.error };
    }
  } else {
    
    const partialSchema = makeSchemaPartial(schema);
    const result = partialSchema.safeParse(parsed);

    if (result.success) {
      return {
        success: true,
        data: {
          isWrapper: false,
          node: {
            categoryName: '',
            data: result.data,
            children: []
          }
        }
      };
    } else {
      const errorMsg = result.error.issues
        .map((err: any) => `${err.path.join('.') || 'root'}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMsg };
    }
  }
}

export function ensureIds(data: any): any {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        if (!item._id) {
          item._id = uuidv4();
        }
      }
      ensureIds(item);
    }
  } else if (typeof data === 'object') {
    for (const key in data) {
      ensureIds(data[key]);
    }
  }
  return data;
}

export function applyDataToTarget(data: any, target: any): void {
  if (!target) {
    throw new Error('Target is undefined or null.');
  }

  
  ensureIds(data);

  if (Array.isArray(target)) {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (!data._id) {
        data._id = uuidv4();
      }
      const existingIndex = target.findIndex((item: any) => item && item._id === data._id);
      if (existingIndex !== -1) {
        target[existingIndex] = data;
        return;
      }
    }
    target.push(data);
  } else if (isRef(target)) {
    target.value = data;
  } else if (typeof target === 'object') {
    
    if (typeof target.$patch === 'function') {
      target.$patch(data);
    } else {
      
      Object.keys(data).forEach((key) => {
        target[key] = data[key];
      });
    }
  } else {
    throw new Error('Target must be an array, ref, or object to apply changes.');
  }
}

export function generateSchemaTemplate(schema: any): any {
  if (!schema) return null;

  const def = schema.def || schema._def;
  if (!def) return '';

  const type = def.type;

  if (type === 'default' || type === 'optional' || type === 'nullable') {
    return generateSchemaTemplate(def.innerType);
  }
  if (type === 'pipe') {
    if (def.in && (def.in.type === 'transform' || (def.in._def && def.in._def.type === 'transform'))) {
      return generateSchemaTemplate(def.out);
    }
    return generateSchemaTemplate(def.in || def.out);
  }
  if (type === 'transform') {
    return generateSchemaTemplate(def.innerType || def.schema);
  }
  if (type === 'object') {
    const shape = schema.shape || def.shape;
    const obj: any = {};
    for (const key in shape) {
      if (key === '_id' || key === '_children') continue;
      obj[key] = generateSchemaTemplate(shape[key]);
    }
    return obj;
  }
  if (type === 'array') {
    return [generateSchemaTemplate(def.element)];
  }
  if (type === 'union') {
    const options = schema.options || def.options || [];
    return options.length > 0 ? generateSchemaTemplate(options[0]) : null;
  }
  if (type === 'string') {
    return 'text';
  }
  if (type === 'number') {
    return 0;
  }
  if (type === 'boolean') {
    return true;
  }
  if (type === 'enum') {
    const vals = schema.options || (def.entries ? Object.keys(def.entries) : []) || def.values || [];
    return vals[0] || '';
  }
  if (type === 'nativeEnum') {
    const vals = Object.values(def.values || {});
    return vals[0] || '';
  }
  if (type === 'literal') {
    const val = def.value !== undefined ? def.value : (def.values ? def.values[0] : undefined);
    return val !== undefined ? val : '';
  }

  return '';
}

export function getSchemaPlaceholder(schema: any): string {
  const template = generateSchemaTemplate(schema);
  return template !== null && template !== undefined
    ? JSON.stringify(template, null, 2)
    : '';
}

function applyNodeRecursive(node: any, defaultTarget: any): void {
  const { data, target, children } = node;

  const resolvedTarget = target
    ? (typeof target === 'function' ? target() : target)
    : defaultTarget;

  if (!resolvedTarget) {
    throw new Error(`Target is unresolved for category "${node.categoryName}".`);
  }

  if (data && typeof data === 'object' && !data._id) {
    data._id = uuidv4();
  }

  const childIds: string[] = [];

  if (Array.isArray(children) && children.length > 0) {
    for (const child of children) {
      const childTarget = child.target
        ? (typeof child.target === 'function' ? child.target() : child.target)
        : null;

      applyNodeRecursive(child, childTarget);
      if (child.data && child.data._id) {
        childIds.push(child.data._id);
      }
    }
  }

  if (childIds.length > 0) {
    data._children = childIds;
  }

  applyDataToTarget(data, resolvedTarget);
}

export function applyCompendiumData(validationData: any, parentTarget: any): void {
  if (!validationData || !validationData.node) {
    throw new Error('Validation data is missing.');
  }

  const { isWrapper, node } = validationData;

  if (isWrapper) {
    applyNodeRecursive(node, parentTarget);
  } else {
    applyDataToTarget(node.data, parentTarget);
  }
}

export function getCompendiumWrapperPlaceholder(entry: any): string {
  const parentTemplate = generateSchemaTemplate(entry.schema);

  let childrenTemplates: any[] = [];
  if (entry.category === 'Features') {
    const actionsEntry = compendium.find((c) => c.category === 'Actions');
    if (actionsEntry) {
      childrenTemplates = [
        {
          categoryName: 'Actions',
          'data-payload': generateSchemaTemplate(actionsEntry.schema),
          'data-children': []
        }
      ];
    }
  }

  const wrapper = {
    categoryName: entry.category,
    'data-payload': parentTemplate,
    'data-children': childrenTemplates
  };

  return JSON.stringify(wrapper, null, 2);
}
