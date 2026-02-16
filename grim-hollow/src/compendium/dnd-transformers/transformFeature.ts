import { createEffectFragment } from './transformEffects';

type ActionGroup = 'actions' | 'bonus-actions' | 'reactions' | 'free-actions';

const actionTypeMap: Record<string, ActionGroup> = {
  Action: 'actions',
  'Bonus Action': 'bonus-actions',
  Reaction: 'reactions',
  'Free Action': 'free-actions',
};

/**
 * Merges child datarecords into their nearest "Features"-type ancestor,
 */
export const mergeRecordsIntoFeatures = (
  allRecords: any[],
  recordsToProcess: any[],
): Array<{ feature: any; level: number }> => {
  // Build lookup maps from all records
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

  // Find the nearest ancestor (or self) for a record
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
      effects: any[];
      actions: any[];
      resources: any[];
      pickers: any[];
      spells: any[];
      spellSources: any[];
    }
  >();

  for (const rec of recordsToProcess) {
    if (payloadTypeMap.get(rec.name) === 'Features') {
      const fragment = createEffectFragment(rec);
      featureRoots.set(rec.name, {
        record: rec,
        description: fragment?.description || '',
        effects: [],
        actions: [],
        resources: [],
        pickers: [],
        spells: [],
        spellSources: [],
      });
    }
  }

  // Merge non-Features records into their nearest ancestor
  const orphans: any[] = [];
  for (const rec of recordsToProcess) {
    if (payloadTypeMap.get(rec.name) === 'Features') continue;

    const rootName = findFeatureRoot(rec.name);
    const fragment = createEffectFragment(rec);
    if (!fragment) continue;

    if (rootName && featureRoots.has(rootName)) {
      const root = featureRoots.get(rootName)!;
      if (fragment.effects) root.effects.push(...fragment.effects);
      if (fragment.actions) root.actions.push(...fragment.actions);
      if (fragment.resources) root.resources.push(...fragment.resources);
      if (fragment.pickers) root.pickers.push(...fragment.pickers);
      if (fragment.spells) root.spells.push(...fragment.spells);
      if (fragment.spellSources) root.spellSources.push(...fragment.spellSources);
    } else {
      // No ancestor found, treat as standalone feature
      orphans.push(rec);
    }
  }

  const result: Array<{ feature: any; level: number }> = [];

  for (const [, data] of featureRoots) {
    const feature: any = {
      label: data.record.name.replace(/ feature$/gi, ''),
      description: data.description,
    };

    if (data.spells.length > 0) {
      feature['data-spells'] = data.spells;
    }

    const hasEffectData =
      data.effects.length > 0 ||
      data.actions.length > 0 ||
      data.resources.length > 0 ||
      data.pickers.length > 0 ||
      data.spellSources.length > 0;

    if (hasEffectData) {
      feature['data-effects'] = {
        label: data.record.name,
        enabled: true,
        toggleable: false,
        removable: false,
        effects: data.effects,
        actions: data.actions,
        resources: data.resources,
        spells: [],
        pickers: data.pickers,
        ...(data.spellSources.length > 0 ? { spellSources: data.spellSources } : {}),
      };
    }

    const level = parseInt(data.record.level, 10);
    result.push({ feature, level: isNaN(level) ? 0 : level });
  }

  // Process orphans as standalone features
  for (const rec of orphans) {
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
