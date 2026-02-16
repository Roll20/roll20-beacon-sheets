import { createEffectFragment } from './transformEffects';

type ActionGroup = 'actions' | 'bonus-actions' | 'reactions' | 'free-actions';

const actionTypeMap: Record<string, ActionGroup> = {
  Action: 'actions',
  'Bonus Action': 'bonus-actions',
  Reaction: 'reactions',
  'Free Action': 'free-actions',
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
