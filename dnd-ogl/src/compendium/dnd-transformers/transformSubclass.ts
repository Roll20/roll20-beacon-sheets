import { mergeRecordsIntoFeatures } from "./transformFeature";
import { deepTransformFormulas } from "./utils"; 

const casterProgressionMap: Record<string, string> = {
  full: 'full',
  half: 'half',
  third: 'third',
  pact: 'pact',
};

export const transformDnDSubclass = (rawPayload: any, book:any, properties: any): Record<string, any> => {
  const transformedPayload: Record<string, any> = {
    name: rawPayload.name,
    'data-compatibility': [{
      name: properties['Parent Class']
    }],
  };

  const featuresByLevel: Record<string, any[]> = {};
  let dataRecords: any[] = [];
  try {
    dataRecords = JSON.parse(properties['data-datarecords'] || '[]');
  } catch (e) {
    console.warn(`Failed to parse data-datarecords for subclass: ${rawPayload.name}`);
    dataRecords = [];
  }

  // Handle spellcasting records
  for (const record of dataRecords) {
    let payload;
    try {
      payload = JSON.parse(record.payload);
    } catch (e) {
      continue;
    }

    if (payload.type === 'Spellcasting') {
      const spellcastingPayload = deepTransformFormulas(payload);
      const progression = casterProgressionMap[spellcastingPayload.casterType];
      
      if (progression) {
        transformedPayload.spellcasting = progression;
        transformedPayload['data-spellSource'] = {
          name: `${rawPayload.name} Spellcasting`,
          type: 'ability',
          ability: (spellcastingPayload.ability || 'intelligence').toLowerCase(),
          isPrepared: false,
        };
      }
    }
  }

  // Filter out modifier records and spellcasting records
  const modifierRecords = dataRecords.filter((rec: any) => rec.modify !== undefined);
  const recordsToProcess = dataRecords.filter((rec: any) => {
    if (modifierRecords.includes(rec)) return false;
    try {
      const payload = JSON.parse(rec.payload);
      return payload.type !== 'Spellcasting';
    } catch {
      return true;
    }
  });

  // Merge child records into their parent Features records
  const mergedFeatures = mergeRecordsIntoFeatures(dataRecords, recordsToProcess);
  for (const { feature, level } of mergedFeatures) {
    const hasDescription = feature.description && feature.description.trim() !== '';
    const hasEffects = !!feature['data-effects'];
    const hasSpells = !!feature['data-spells'];

    if (hasDescription || hasEffects || hasSpells) {
      feature.group = 'class-features';
      if (level > 0) {
        const levelKey = `level-${level}`;
        if (!featuresByLevel[levelKey]) {
          featuresByLevel[levelKey] = [];
        }
        featuresByLevel[levelKey].push(feature);
      }
    }
  }

  if (Object.keys(featuresByLevel).length > 0) {
    transformedPayload['data-features'] = featuresByLevel;
  }
  return transformedPayload;
};