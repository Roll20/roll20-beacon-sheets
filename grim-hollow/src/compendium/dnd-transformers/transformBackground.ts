import { createEffectFragment } from './transformEffects';
import { transformDnDFeature } from './transformFeature';

export const transformDnDBackground = (
  rawPayload: any,
  book: any,
  properties: any,
): Record<string, any> => {
  const transformedPayload: Record<string, any> = {
    name: rawPayload.name,
  };
  const featuresByLevel: Record<string, any[]> = {};

  if (properties['data-datarecords']) {
    const dataRecords = JSON.parse(properties['data-datarecords'] || '[]');
    const otherFeatures: any[] = [];

    const mainBackgroundFeature: any = {
      label: `${rawPayload.name} Traits`,
      group: 'background-features',
      description: '',
      'data-effects': {
        label: `${rawPayload.name} Background Effects`,
        enabled: true,
        toggleable: false,
        removable: false,
        effects: [],
        pickers: [],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
      },
    };

    let pickerIndexOffset = 0;

    for (const record of dataRecords) {
      try {
        const payload = JSON.parse(record.payload);

        if (payload.type === 'Background') {
          mainBackgroundFeature.description = payload.description || '';
          continue;
        }

        if (payload.type === 'Features' || payload.type === 'Feat Attach') {
          const separateFeature = transformDnDFeature(record);
          if (separateFeature) {
            separateFeature.group = 'background-features';
            otherFeatures.push(separateFeature);
          }
          continue;
        }

        payload.pickerIndexOffset = pickerIndexOffset;
        const recordWithOffset = { ...record, payload: JSON.stringify(payload) };
        const fragment = createEffectFragment(recordWithOffset);

        if (fragment) {
          const effectsObj = mainBackgroundFeature['data-effects']!;
          if (fragment.effects) effectsObj.effects!.push(...fragment.effects);
          if (fragment.actions) effectsObj.actions!.push(...fragment.actions);
          if (fragment.resources) effectsObj.resources!.push(...fragment.resources);
          if (fragment.spellSources) effectsObj.spellSources!.push(...fragment.spellSources);
          if (fragment.spells) effectsObj.spells!.push(...fragment.spells);
          if (fragment.pickers) {
            effectsObj.pickers!.push(...fragment.pickers);
            pickerIndexOffset += fragment.pickers.length;
          }
        }
      } catch (e) {
        console.warn(
          `Could not process datarecord for background "${rawPayload.name}":`,
          record,
          e,
        );
      }
    }

    const mainEffectsObj = mainBackgroundFeature['data-effects']!;

    if (mainEffectsObj.actions?.length === 0) delete mainEffectsObj.actions;
    if (mainEffectsObj.resources?.length === 0) delete mainEffectsObj.resources;
    if (mainEffectsObj.spells?.length === 0) delete mainEffectsObj.spells;
    if (mainEffectsObj.spellSources?.length === 0) delete mainEffectsObj.spellSources;

    const hasEffects = (mainEffectsObj.effects?.length ?? 0) > 0;
    const hasPickers = (mainEffectsObj.pickers?.length ?? 0) > 0;
    const hasDescription = !!mainBackgroundFeature.description;

    const level1Features: any[] = [];

    if (hasEffects || hasPickers || hasDescription) {
      level1Features.push(mainBackgroundFeature);
    }
    
    if (otherFeatures.length > 0) {
      level1Features.push(...otherFeatures);
    }

    if (level1Features.length > 0) {
      featuresByLevel['level-1'] = level1Features;
    }
  } else {
    const description = properties['data-description'] || null;
    if (!description) {
      return {};
    }
    const legacyFeature = {
      label: `${rawPayload.name} Features`,
      group: 'background-features',
      description: description,
    };
    featuresByLevel['level-1'] = [legacyFeature];
  }

  if (Object.keys(featuresByLevel).length > 0) {
    transformedPayload['data-features'] = featuresByLevel;
  }

  return transformedPayload;
};