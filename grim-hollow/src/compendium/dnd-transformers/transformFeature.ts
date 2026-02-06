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

  if (fragment.effects || fragment.actions || fragment.resources || fragment.spells || fragment.pickers) {
    baseFeature['data-effects'] = {
      label: datarecord.name,
      enabled: true,
      toggleable: false,
      removable: false,
      effects: fragment.effects || [],
      actions: fragment.actions || [],
      resources: fragment.resources || [],
      spells: fragment.spells || [],
      pickers: fragment.pickers || [],
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
        toggleable: true,
        removable: true,
        effects: [] as any[],
        actions: [] as any[],
        resources: [] as any[],
        spells: [] as any[],
        pickers: [] as any[],
      },
    };

    const descriptionParts: string[] = [];

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
        if (fragment.spells) effectsObj.spells?.push(...fragment.spells);
        if (fragment.pickers) effectsObj.pickers?.push(...fragment.pickers);
      }
    }

    if (descriptionParts.length > 0) {
      combinedFeat.description += (combinedFeat.description ? '\n\n' : '') + descriptionParts.join('\n');
    }

    const effectsObj = combinedFeat['data-effects']!;
    if (
      (effectsObj.effects?.length ?? 0) === 0 &&
      (effectsObj.actions?.length ?? 0) === 0 &&
      (effectsObj.resources?.length ?? 0) === 0 &&
      (effectsObj.spells?.length ?? 0) === 0 &&
      (effectsObj.pickers?.length ?? 0) === 0
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
