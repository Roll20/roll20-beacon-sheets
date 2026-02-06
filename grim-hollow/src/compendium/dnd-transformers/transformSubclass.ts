import { transformDnDFeature } from "./transformFeature";
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

  for (const record of dataRecords) {
    let payload;
    try {
      payload = JSON.parse(record.payload);
    } catch (e) {
      console.warn(`Failed to parse payload for record: ${record.name}`);
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
      continue;
    }

    const feature = transformDnDFeature(record);
    
    if (feature) {
      feature.group = 'class-features';

      const level = parseInt(record.level, 10);
      if (!isNaN(level) && level > 0) {
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