import { createEffectFragment } from './transformEffects';
import { abilityMap } from './utils';

export const transformDnDRace = (
  rawPayload: any,
  book: any,
  properties: any,
  expansionId?: number,
): Record<string, any> => {
  const transformedPayload: Record<string, any> = {
    name: rawPayload.name,
  };
  const featuresByLevel: Record<string, any[]> = {};

  if (properties['Parent Race']) {
    transformedPayload['data-compatibility'] = [
      {
        name: properties['Parent Race'],
        sourceBook: Number(book.itemId),
      },
    ];
  }

  const mainRacialFeature = {
    label: `${rawPayload.name} Racial Traits`,
    group: 'ancestry-features',
    description: '',
    'data-spells': [] as any[],
    'data-effects': {
      label: `${rawPayload.name} Traits`,
      enabled: true,
      toggleable: false,
      removable: false,
      effects: [] as any[],
      pickers: [] as any[],
      actions: [] as any[],
      resources: [] as any[],
      spells: [] as any[],
      spellSources: [] as any[],
    },
  };

  if (properties['data-datarecords']) {
    const dataRecords = JSON.parse(properties['data-datarecords'] || '[]');
    const otherFeatures: { feature: any; level: number }[] = [];

    const parentRecordNames = new Set(dataRecords.map((r: any) => r.parent).filter(Boolean));
    const childRecordsByParent: Record<string, any[]> = {};
    const standaloneRecords: any[] = [];
    const parentRecords: any[] = [];

    for (const record of dataRecords) {
      if (record.parent) {
        if (!childRecordsByParent[record.parent]) {
          childRecordsByParent[record.parent] = [];
        }
        childRecordsByParent[record.parent].push(record);
      } else if (parentRecordNames.has(record.name)) {
        parentRecords.push(record);
      } else {
        standaloneRecords.push(record);
      }
    }

    for (const record of standaloneRecords) {
      const payloadType = JSON.parse(record.payload).type;
      if (payloadType === 'Species' || payloadType === 'Size') continue;

      const fragment = createEffectFragment(record);
      if (fragment) {
        const effectsObj = mainRacialFeature['data-effects'];
        if (fragment.effects) effectsObj.effects.push(...fragment.effects);
        if (fragment.actions) effectsObj.actions.push(...fragment.actions);
        if (fragment.resources) effectsObj.resources.push(...fragment.resources);
        if (fragment.spellSources) effectsObj.spellSources.push(...fragment.spellSources);
        if (fragment.spells) mainRacialFeature['data-spells'].push(...fragment.spells);
        if (fragment.pickers) effectsObj.pickers.push(...fragment.pickers);
      }
    }

    for (const parentRecord of parentRecords) {
      if (JSON.parse(parentRecord.payload).type === 'Species') continue;

      const combinedFeature: Record<string, any> = {
        label: parentRecord.name,
        group: 'ancestry-features',
        description: JSON.parse(parentRecord.payload).description || '',
        'data-spells': [] as any[],
        'data-effects': {
          label: `${parentRecord.name} Effects`,
          enabled: true,
          toggleable: true,
          removable: true,
          effects: [] as any[],
          actions: [] as any[],
          resources: [] as any[],
          spells: [],
          spellSources: [] as any[],
          pickers: [] as any[],
        },
      };

      const children = childRecordsByParent[parentRecord.name] || [];
      for (const childRecord of children) {
        const fragment = createEffectFragment(childRecord);
        if (fragment) {
          const effectsObj = combinedFeature['data-effects'];
          if (fragment.effects) effectsObj.effects.push(...fragment.effects);
          if (fragment.actions) effectsObj.actions.push(...fragment.actions);
          if (fragment.resources) effectsObj.resources.push(...fragment.resources);
          if (fragment.spellSources) effectsObj.spellSources.push(...fragment.spellSources);
          if (fragment.spells) combinedFeature['data-spells'].push(...fragment.spells);
          if (fragment.pickers) effectsObj.pickers.push(...fragment.pickers);
        }
      }

      const effectsObj = combinedFeature['data-effects'];
      if (
        effectsObj.effects.length === 0 &&
        effectsObj.actions.length === 0 &&
        effectsObj.resources.length === 0 &&
        effectsObj.spellSources.length === 0 &&
        effectsObj.pickers.length === 0
      ) {
        delete combinedFeature['data-effects'];
      }
      if (combinedFeature['data-spells'].length === 0) {
        delete combinedFeature['data-spells'];
      }
      otherFeatures.push({ feature: combinedFeature, level: parentRecord.level || 1 });
    }

    const mainEffectsObj = mainRacialFeature['data-effects'];
    if (mainEffectsObj.effects.length > 0 || mainEffectsObj.pickers.length > 0) {
      if (!featuresByLevel['level-1']) featuresByLevel['level-1'] = [];
      featuresByLevel['level-1'].unshift(mainRacialFeature);
    }

    for (const { feature, level } of otherFeatures) {
      const levelKey = `level-${level}`;
      if (!featuresByLevel[levelKey]) featuresByLevel[levelKey] = [];
      featuresByLevel[levelKey].push(feature);
    }
  } else {
    if (properties['data-Ability Score Increase']) {
      const asi = JSON.parse(properties['data-Ability Score Increase']);
      for (const ability in asi) {
        const abilityKey = ability.toLowerCase();
        const attribute = abilityMap[abilityKey] || abilityKey;

        mainRacialFeature['data-effects'].effects.push({
          attribute: attribute,
          operation: 'add',
          value: parseInt(asi[ability], 10) || 0,
        });
      }
    }
    if (properties['Speed']) {
      mainRacialFeature['data-effects'].effects.push({
        attribute: 'walk-speed',
        operation: 'set-base',
        value: parseInt(properties['Speed'], 10) || 0,
      });
    }
    if (properties['data-Feats']) {
      mainRacialFeature['data-effects'].pickers.push({
        label: 'Bonus Feat',
        options: [],
        count: properties['data-Feats'],
      });
    }

    if (
      mainRacialFeature['data-effects'].effects.length > 0 ||
      mainRacialFeature['data-effects'].pickers.length > 0
    ) {
      if (!featuresByLevel['level-1']) {
        featuresByLevel['level-1'] = [];
      }
      featuresByLevel['level-1'].unshift(mainRacialFeature);
    }
  }

  if (Object.keys(featuresByLevel).length > 0) {
    transformedPayload['data-features'] = featuresByLevel;
  }
  return transformedPayload;
};
