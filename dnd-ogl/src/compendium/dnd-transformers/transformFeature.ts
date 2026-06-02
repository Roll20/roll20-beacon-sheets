import { createEffectFragment } from './transformEffects';

type ActionGroup = 'actions' | 'bonus-actions' | 'reactions' | 'free-actions';

const actionTypeMap: Record<string, ActionGroup> = {
  Action: 'actions',
  'Bonus Action': 'bonus-actions',
  Reaction: 'reactions',
  'Free Action': 'free-actions',
};

const buildFeature = (
  rootRecord: any,
  description: string,
  effects: any[],
  actions: any[],
  resources: any[],
  pickers: any[],
  spells: any[],
  spellSources: any[],
  validUntilLevel?: number,
): any => {
  const feature: any = {
    label: rootRecord.name.replace(/ feature$/gi, ''),
    description,
  };

  if (validUntilLevel !== undefined) {
    feature.validUntilLevel = validUntilLevel;
  }

  if (spells.length > 0) {
    feature['data-spells'] = spells;
  }

  const hasEffectData =
    effects.length > 0 ||
    actions.length > 0 ||
    resources.length > 0 ||
    pickers.length > 0 ||
    spellSources.length > 0;

  if (hasEffectData) {
    feature['data-effects'] = {
      label: rootRecord.name,
      enabled: true,
      toggleable: false,
      removable: false,
      effects,
      actions,
      resources,
      spells: [],
      pickers,
      ...(spellSources.length > 0 ? { spellSources } : {}),
    };
  }

  return feature;
};

/**
 * Merges child datarecords into their nearest "Features"-type ancestor.
 * When children exist at different levels under the same root, cumulative
 * level variants are created. 
 */
export const mergeRecordsIntoFeatures = (
  allRecords: any[],
  recordsToProcess: any[],
): Array<{ feature: any; level: number }> => {
  const recordMap = new Map<string, any>();
  const payloadTypeMap = new Map<string, string>();

  for (const rec of allRecords) {
    recordMap.set(rec.name, rec);
    try {
      payloadTypeMap.set(rec.name, JSON.parse(rec.payload).type);
    } catch {
      payloadTypeMap.set(rec.name, 'unknown');
    }
  }

  // wire Damage records into Attacks
  const childrenMap = new Map<string, any[]>();
  for (const rec of allRecords) {
    if (rec.parent) {
      if (!childrenMap.has(rec.parent)) childrenMap.set(rec.parent, []);
      childrenMap.get(rec.parent)!.push(rec);
    }
  }

  const findFeatureRoot = (name: string, visited = new Set<string>()): string | null => {
    if (visited.has(name)) return null;
    visited.add(name);
    const rec = recordMap.get(name);
    if (!rec) return null;
    if (payloadTypeMap.get(name) === 'Features') return name;
    if (rec.parent) return findFeatureRoot(rec.parent, visited);
    return null;
  };

  const featureRoots = new Map<
    string,
    {
      record: any;
      description: string;
      childrenByLevel: Map<number, any[]>;
    }
  >();

  for (const rec of recordsToProcess) {
    if (payloadTypeMap.get(rec.name) === 'Features') {
      const fragment = createEffectFragment(rec);
      featureRoots.set(rec.name, {
        record: rec,
        description: fragment?.description || '',
        childrenByLevel: new Map(),
      });
    }
  }

  const consumedRecords = new Set<string>();
  const orphans: any[] = [];

  for (const rec of recordsToProcess) {
    if (payloadTypeMap.get(rec.name) === 'Features') continue;
    if (consumedRecords.has(rec.name)) continue;

    const rootName = findFeatureRoot(rec.name);
    if (!rootName || !featureRoots.has(rootName)) {
      orphans.push(rec);
      continue;
    }

    const level = parseInt(rec.level, 10);
    if (isNaN(level)) continue;

    const root = featureRoots.get(rootName)!;
    if (!root.childrenByLevel.has(level)) {
      root.childrenByLevel.set(level, []);
    }
    root.childrenByLevel.get(level)!.push(rec);
  }

  const result: Array<{ feature: any; level: number }> = [];

  for (const [, rootData] of featureRoots) {
    const childrenByLevel = rootData.childrenByLevel;

    if (childrenByLevel.size === 0) {
      const feature = buildFeature(
        rootData.record,
        rootData.description,
        [],
        [],
        [],
        [],
        [],
        [],
      );
      const level = parseInt(rootData.record.level, 10);
      result.push({ feature, level: isNaN(level) ? 0 : level });
      continue;
    }

    const rootLevel = parseInt(rootData.record.level, 10);
    const sortedLevels = Array.from(
      new Set([...(isNaN(rootLevel) ? [] : [rootLevel]), ...childrenByLevel.keys()]),
    ).sort((a, b) => a - b);

    // Build overwrite map
    const overwrittenAtLevel = new Map<string, number>();
    for (const [level, children] of childrenByLevel) {
      for (const child of children) {
        if (child.overwrite) {
          overwrittenAtLevel.set(child.overwrite, level);
        }
      }
    }

    // Helper to check if a record is active at a target level
    const isActive = (rec: any, targetLevel: number): boolean => {
      const recLevel = parseInt(rec.level, 10);
      if (isNaN(recLevel) || recLevel > targetLevel) return false;

      // Check if this record is overwritten at or before targetLevel
      const overwrittenLevel = overwrittenAtLevel.get(rec.name);
      if (overwrittenLevel !== undefined && overwrittenLevel <= targetLevel) {
        return false;
      }

      // Check if any ancestor is overwritten at or before targetLevel
      let currentName = rec.parent;
      while (currentName) {
        const overwrittenLevel = overwrittenAtLevel.get(currentName);
        if (overwrittenLevel !== undefined && overwrittenLevel <= targetLevel) {
          return false;
        }
        const parentRec = recordMap.get(currentName);
        currentName = parentRec?.parent;
      }

      return true;
    };

    for (let i = 0; i < sortedLevels.length; i++) {
      const level = sortedLevels[i];
      const nextLevel = sortedLevels[i + 1];

      const effects: any[] = [];
      const actions: any[] = [];
      const resources: any[] = [];
      const pickers: any[] = [];
      const spells: any[] = [];
      const spellSources: any[] = [];

      for (const [childLevel, children] of childrenByLevel) {
        if (childLevel > level) continue;

        for (const child of children) {
          if (consumedRecords.has(child.name)) continue;
          if (!isActive(child, level)) continue;

          let fragment: ReturnType<typeof createEffectFragment>;
          if (payloadTypeMap.get(child.name) === 'Attack') {
            const damageChildren = (childrenMap.get(child.name) || []).filter((c: any) => {
              try {
                return JSON.parse(c.payload).type === 'Damage';
              } catch {
                return false;
              }
            });
            damageChildren.forEach((c: any) => consumedRecords.add(c.name));
            fragment = createEffectFragment(child, damageChildren);
          } else {
            fragment = createEffectFragment(child);
          }

          if (!fragment) continue;

          const isMainClassOnly = child.multiclass === 'FALSE' || child.multiclass === 'false';
          const isMulticlassOnly = child.multiclass === 'TRUE' || child.multiclass === 'true';
          if (isMainClassOnly && fragment.effects) {
            fragment.effects.forEach((eff: any) => {
              eff.required = [...(eff.required || []), 'mainClassOnly'];
            });
          }
          if (isMulticlassOnly && fragment.effects) {
            fragment.effects.forEach((eff: any) => {
              eff.required = [...(eff.required || []), 'multiclassOnly'];
            });
          }

          if (fragment.effects) effects.push(...fragment.effects);
          if (fragment.actions) actions.push(...fragment.actions);
          if (fragment.resources) resources.push(...fragment.resources);
          if (fragment.pickers) pickers.push(...fragment.pickers);
          if (fragment.spells) spells.push(...fragment.spells);
          if (fragment.spellSources) spellSources.push(...fragment.spellSources);
        }
      }

      const feature = buildFeature(
        rootData.record,
        rootData.description,
        effects,
        actions,
        resources,
        pickers,
        spells,
        spellSources,
        nextLevel !== undefined ? nextLevel : undefined,
      );

      result.push({ feature, level });
    }
  }

  for (const rec of orphans) {
    if (consumedRecords.has(rec.name)) continue;
    const feature = transformDnDFeature(rec);
    if (feature) {
      const level = parseInt(rec.level, 10);
      result.push({ feature, level: isNaN(level) ? 0 : level });
    }
  }

  return result;
};

export const transformDnDFeature = (datarecord: any) => {
  const fragment = createEffectFragment(datarecord);
  if (!fragment) return null;

  const baseFeature: Partial<any> = {
    label: datarecord.name,
    description: fragment.description || '',
  };

  // Spells go to data-spells so they can be hydrated from the compendium during drop
  if (fragment.spells && fragment.spells.length > 0) {
    baseFeature['data-spells'] = fragment.spells;
  }

  if (fragment.effects || fragment.actions || fragment.resources || fragment.pickers || fragment.spellSources) {
    baseFeature['data-effects'] = {
      label: datarecord.name,
      enabled: true,
      toggleable: false,
      removable: false,
      effects: fragment.effects || [],
      actions: fragment.actions || [],
      resources: fragment.resources || [],
      spells: [],
      pickers: fragment.pickers || [],
      ...(fragment.spellSources ? { spellSources: fragment.spellSources } : {}),
    };
  }

  return baseFeature;
};

export const transformDnDFeatureSet = (rawPayload: any, book: any, properties: any): any => {
  const group = rawPayload.properties?.Category === 'Feats' ? 'feats' : 'class-features';

  if (properties['data-datarecords']) {
    const dataRecords = JSON.parse(properties['data-datarecords'] || '[]');

    const combinedFeat: Partial<any> = {
      label: rawPayload.name,
      group: group,
      description: '',
      'data-effects': {
        label: `${rawPayload.name} Effects`,
        enabled: true,
        toggleable: false,
        removable: false,
        effects: [] as any[],
        actions: [] as any[],
        resources: [] as any[],
        spells: [] as any[],
        pickers: [] as any[],
      },
    };

    const descriptionParts: string[] = [];
    const allSpells: any[] = [];

    for (const record of dataRecords) {
      const fragment = createEffectFragment(record);

      if (fragment) {
        if (JSON.parse(record.payload).type === 'Features') {
          combinedFeat.description = fragment.description;
        } else if (fragment.description) {
          descriptionParts.push(fragment.description);
        }

        const effectsObj = combinedFeat['data-effects']!;
        if (fragment.effects) effectsObj.effects?.push(...fragment.effects);
        if (fragment.actions) effectsObj.actions?.push(...fragment.actions);
        if (fragment.resources) effectsObj.resources?.push(...fragment.resources);
        if (fragment.spells) allSpells.push(...fragment.spells);
        if (fragment.pickers) effectsObj.pickers?.push(...fragment.pickers);
        if (fragment.spellSources) {
          if (!effectsObj.spellSources) effectsObj.spellSources = [];
          effectsObj.spellSources.push(...fragment.spellSources);
        }
      }
    }

    if (allSpells.length > 0) {
      combinedFeat['data-spells'] = allSpells;
    }

    if (descriptionParts.length > 0) {
      combinedFeat.description += (combinedFeat.description ? '\n\n' : '') + descriptionParts.join('\n');
    }

    const effectsObj = combinedFeat['data-effects']!;
    if (
      (effectsObj.effects?.length ?? 0) === 0 &&
      (effectsObj.actions?.length ?? 0) === 0 &&
      (effectsObj.resources?.length ?? 0) === 0 &&
      (effectsObj.pickers?.length ?? 0) === 0 &&
      (!effectsObj.spellSources || effectsObj.spellSources.length === 0)
    ) {
      delete combinedFeat['data-effects'];
    }

    return combinedFeat;
  }

  return {
    label: rawPayload.name,
    group: group,
    description: properties['data-description'] || properties['data-Description'] || '',
  };
};
