import { mergeRecordsIntoFeatures } from './transformFeature';
import { deepTransformFormulas } from './utils';
import { createEffectFragment } from './transformEffects';

const casterProgressionMap: Record<string, string> = {
  full: 'full',
  half: 'half',
  pact: 'pact',
};

const transformLegacyClass = (rawPayload: any, properties: any): Record<string, any> => {
  const description = properties['data-description'] || '';

  const transformedPayload: Record<string, any> = {
    name: rawPayload.name,
    hitDie: '1' + properties['Hit Die'],
    subclassUnlockLevel: properties['data-Subclass Level'] || 1,
    spellcasting: (properties['Caster Progression'] || 'none').toLowerCase(),
  };

  if (transformedPayload.spellcasting !== 'none' && properties['Spellcasting Ability']) {
    transformedPayload['data-spellSource'] = {
      name: `${rawPayload.name} Spellcasting`,
      type: 'ability',
      ability: properties['Spellcasting Ability'].toLowerCase(),
      isPrepared: true,
    };
  }

  const featuresByLevel: Record<string, any[]> = {};
  const proficiencyEffects: any[] = [];

  if (properties['data-Saving Throws']) {
    try {
      const saves: string[] = JSON.parse(properties['data-Saving Throws']);
      saves.forEach((st) => {
        proficiencyEffects.push({
          attribute: `${st.toLowerCase()}-saving-proficiency`,
          operation: 'set',
          value: 1,
        });
      });
    } catch (e) {
      console.warn(`Could not parse data-Saving Throws for "${rawPayload.name}"`);
    }
  }

  const proficiencyRegex = /^(Armor|Weapons|Tools|Skills):\s*(.*)/gm;
  let match;
  while ((match = proficiencyRegex.exec(description)) !== null) {
    const category = match[1].trim();
    const items = match[2].split(',').map((item) => item.trim().toLowerCase());

    switch (category) {
      case 'Armor':
        items.forEach((armor) =>
          proficiencyEffects.push({
            attribute: 'armor-proficiencies',
            operation: 'push',
            value: armor.replace(/ /g, '-'),
          }),
        );
        break;
      case 'Weapons':
        items.forEach((weapon) =>
          proficiencyEffects.push({
            attribute: 'weapon-proficiencies',
            operation: 'push',
            value: weapon.replace(/ /g, '-'),
          }),
        );
        break;
    }
  }

  if (proficiencyEffects.length > 0) {
    featuresByLevel['level-1'] = [
      {
        label: 'Proficiencies',
        group: 'class-features',
        description: 'Gained proficiencies from the ' + rawPayload.name + ' class.',
        'data-effects': {
          label: `${rawPayload.name} Proficiencies`,
          enabled: true,
          effects: proficiencyEffects,
        },
      },
    ];
  }

  if (Object.keys(featuresByLevel).length > 0) {
    transformedPayload['data-features'] = featuresByLevel;
  }

  return transformedPayload;
};


const preprocessModifiers = (dataRecords: any[]): any[] => {
  const modifierRecords = dataRecords.filter((rec: any) => rec.modify !== undefined);
  if (modifierRecords.length === 0) return modifierRecords;

  const modifiersByTarget = new Map<string, any[]>();
  for (const mod of modifierRecords) {
    const target = mod.modify;
    if (!modifiersByTarget.has(target)) {
      modifiersByTarget.set(target, []);
    }
    modifiersByTarget.get(target)!.push(mod);
  }

  for (const [targetName, modifiers] of modifiersByTarget.entries()) {
    const targetRecord = dataRecords.find((rec: any) => rec.name === targetName);
    if (!targetRecord) continue;

    try {
      const targetPayload = JSON.parse(targetRecord.payload);

      if (targetPayload.type === 'Resource') {
        const baseValue = targetPayload.maxValueFormula?.flatValue || 0;
        const sortedModifiers = [...modifiers].sort(
          (a, b) => parseInt(a.level) - parseInt(b.level),
        );

        let formula = String(baseValue);
        let prevValue = baseValue;

        for (const mod of sortedModifiers) {
          try {
            const modPayload = JSON.parse(mod.payload);
            const modLevel = parseInt(mod.level);
            const newValue = modPayload.modifications?.['maxValueFormula.flatValue'];

            if (newValue !== undefined && !isNaN(modLevel)) {
              const delta = newValue - prevValue;
              if (delta !== 0) {
                formula += ` + ${delta} * floor(min(max($ownerlevel - ${modLevel - 1}, 0), 1))`;
              }
              prevValue = newValue;
            }
          } catch {
            // Skip invalid modifier payloads
          }
        }

        if (formula !== String(baseValue)) {
          targetPayload.maxValueFormula = {
            ...targetPayload.maxValueFormula,
            customFormula: formula,
          };
          targetRecord.payload = JSON.stringify(targetPayload);
        }
      }
    } catch {
      // Skip if target payload can't be parsed
    }
  }

  return modifierRecords;
};

export const transformDnDClass = (
  rawPayload: any,
  book: any,
  properties: any,
): Record<string, any> => {
  if (properties['data-datarecords']) {
    const dataRecords = JSON.parse(properties['data-datarecords'] || '[]');

    // Pre-process modifier records before any feature transformation to apply level-dependent formulas
    const modifierRecords = preprocessModifiers(dataRecords);

    let hitDie = '1d8'; 
    const hitDiceRecord = dataRecords.find((rec: any) => {
      try {
        return JSON.parse(rec.payload).type === 'Hit Dice';
      } catch {
        return false;
      }
    });

    if (hitDiceRecord) {
      const hitDicePayload = JSON.parse(hitDiceRecord.payload);
      const dieSize = hitDicePayload.dieSize ? String(hitDicePayload.dieSize).replace(/^d/, '') : '8';
      hitDie = `${hitDicePayload.dieCount || 1}d${dieSize}`;
    } else if (properties['Hit Die'] || properties['filter-Hit Die']) {
      const dieSize = properties['Hit Die'] || properties['filter-Hit Die'];
      hitDie = `1${dieSize}`;
    }

    let subclassUnlockLevel = 3;
    const classDetailsRecord = dataRecords.find((rec: any) => {
      try {
        return JSON.parse(rec.payload).type === 'Class Details';
      } catch {
        return false;
      }
    });

    if (classDetailsRecord) {
      const classDetailsPayload = JSON.parse(classDetailsRecord.payload);
      if (classDetailsPayload.subclassLevel) {
        subclassUnlockLevel = classDetailsPayload.subclassLevel;
      }
    } else if (properties['data-Subclass Level']) {
      subclassUnlockLevel = properties['data-Subclass Level'];
    }

    const transformedPayload: Record<string, any> = {
      name: rawPayload.name,
      hitDie: hitDie,
      subclassUnlockLevel: subclassUnlockLevel,
    };

    const spellcastingRecord = dataRecords.find((rec: any) => {
      try {
        return JSON.parse(rec.payload).type === 'Spellcasting';
      } catch {
        return false;
      }
    });

    if (spellcastingRecord) {
      const spellcastingPayload = deepTransformFormulas(JSON.parse(spellcastingRecord.payload));
      const progression = casterProgressionMap[spellcastingPayload.casterType];
      if (progression) {
        transformedPayload.spellcasting = progression;
        transformedPayload['data-spellSource'] = {
          name: `${rawPayload.name} Spellcasting`,
          type: 'ability',
          ability: spellcastingPayload.ability.toLowerCase(),
          isPrepared: true,
        };
      }
    }

    if (transformedPayload.spellcasting && transformedPayload.spellcasting !== 'none') {
      const cantripsProgression = Array(20).fill(0);
      const spellsKnownProgression = Array(20).fill(0);

      const spellChoiceRecords = dataRecords.filter((rec: any) => {
        try {
          const payload = JSON.parse(rec.payload);
          return payload.type === 'Spell Choice' && payload.replace !== true;
        } catch {
          return false;
        }
      });

      for (const record of spellChoiceRecords) {
        const payload = JSON.parse(record.payload);
        const level = parseInt(record.level, 10);
        const choices = payload.choices || 0;

        if (level > 0 && level <= 20 && choices > 0) {
          if (payload.spellLevel === 0) {
            cantripsProgression[level - 1] += choices;
          } else {
            spellsKnownProgression[level - 1] += choices;
          }
        }
      }

      for (let i = 1; i < 20; i++) {
        cantripsProgression[i] += cantripsProgression[i - 1];
        spellsKnownProgression[i] += spellsKnownProgression[i - 1];
      }

      if (transformedPayload['data-spellSource']) {
        if (cantripsProgression.some((count) => count > 0)) {
          transformedPayload['data-spellSource'].cantripsKnown = cantripsProgression;
        }
        if (spellsKnownProgression.some((count) => count > 0)) {
          transformedPayload['data-spellSource'].spellsKnown = spellsKnownProgression;
          // If a class has a spells known progression, it's not a prepared caster.
          transformedPayload['data-spellSource'].isPrepared = false;
        }
      }
    }

    const featuresByLevel: Record<string, any[]> = {};

    const level1ProficiencyRecords = dataRecords.filter((rec: any) => {
      if (rec.level !== 1 && rec.level !== '1') return false;
      try {
        return JSON.parse(rec.payload).type === 'Proficiency';
      } catch {
        return false;
      }
    });

    if (level1ProficiencyRecords.length > 0) {
      const proficiencyEffects: any[] = [];

      level1ProficiencyRecords.forEach((rec: any) => {
        const fragment = createEffectFragment(rec);
        if (fragment && fragment.effects) {
          proficiencyEffects.push(...fragment.effects);
        }
      });

      const combinedProficiencyFeature = {
        label: 'Proficiencies',
        group: 'class-features',
        description: 'Gained proficiencies from the ' + rawPayload.name + ' class.',
        'data-effects': {
          label: `${rawPayload.name} Proficiencies`,
          enabled: true,
          effects: proficiencyEffects,
        },
      };

      featuresByLevel['level-1'] = [combinedProficiencyFeature];
    }

    const otherRecords = dataRecords.filter((rec: any) => {
      if (level1ProficiencyRecords.includes(rec)) return false;
      if (modifierRecords.includes(rec)) return false;
      try {
        const payload = JSON.parse(rec.payload);
        return payload.type !== 'Spellcasting' && payload.type !== 'Spell Choice';
      } catch {
        return true;
      }
    });

    const mergedFeatures = mergeRecordsIntoFeatures(dataRecords, otherRecords);
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
  } else {
    // Fallback to legacy transformation
    return transformLegacyClass(rawPayload, properties);
  }
};
