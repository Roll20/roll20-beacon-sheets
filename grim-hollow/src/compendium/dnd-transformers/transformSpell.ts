import { type Spell } from '@/sheet/stores/spells/spellsStore';
import { deepTransformFormulas } from './utils';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { config } from '@/config';

const parseSchool = (schoolString?: string): string | undefined => {
  if (!schoolString) return undefined;
  return schoolString.toLowerCase().split('(')[0].trim();
};

const parseDatarecords = (recordsStr: string | undefined): any[] => {
  if (!recordsStr) return [];
  try {
    const parsedRecords = JSON.parse(recordsStr);
    return parsedRecords
      .map((record: any) => {
        try {
          record.payload = deepTransformFormulas(JSON.parse(record.payload));
          return record;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

/**
 * Translates the 'V S M' component string into an array.
 */
const translateComponents = (componentString?: string): string[] => {
  if (!componentString) return [];
  const components: string[] = [];
  if (componentString.includes('V')) components.push('verbal');
  if (componentString.includes('S')) components.push('somatic');
  if (componentString.includes('M')) components.push('material');
  return components;
};

/**
 * Extracts and formats the spell's damage information.
 */
const translateDamage = (properties: any, records: any[], spellName: string): any[] | undefined => {
  const damageRecord = records.find((r) => r.payload.type === 'Damage');

  if (damageRecord) {
    const { payload } = damageRecord;
    const damageType = (config.dicePoolTypes as readonly string[]).includes(
      payload.damageType?.toLowerCase(),
    )
      ? payload.damageType.toLowerCase()
      : 'untyped';
    return [
      {
        ability: payload.ability || 'none',
        damage: `${payload.diceCount || 1}${payload.diceSize}`,
        type: damageType,
      },
    ];
  }

  if (properties.Damage && properties['Damage Type']) {
    return [
      {
        ability: 'none',
        damage: properties.Damage,
        type: properties['Damage Type'].toLowerCase(),
      },
    ];
  }

  return undefined;
};

/**
 * Determines the saving throw ability.
 */
const translateSavingThrow = (properties: any): string => {
  return properties.Save?.toLowerCase() || 'none';
};

/**
 * Constructs the cantrip damage scaling formula.
 */
const translateCantripScaling = (
  records: any[],
  spellName: string,
  baseDamage: any[],
): string | null => {
  if (!baseDamage || baseDamage.length === 0 || !baseDamage[0].damage.match(/\d+d\d+/)) {
    return null;
  }

  const scalingRecords = records
    .filter(
      (r) =>
        r.payload.type === 'Upcasting' &&
        r.payload.mode === 'Specific Character Level' &&
        r.parent.startsWith(spellName),
    )
    .sort((a, b) => a.payload.level - b.payload.level);

  if (scalingRecords.length === 0) return null;

  const diceMatch = baseDamage[0].damage.match(/(\d+)d(\d+)/);
  if (!diceMatch) return null;

  const baseDiceCount = parseInt(diceMatch[1]);
  const dieSize = diceMatch[2];

  const tiers = [{ level: 1, dice: baseDiceCount }];
  let currentDice = baseDiceCount;
  scalingRecords.forEach((rec) => {
    currentDice += rec.payload.value;
    tiers.push({ level: rec.payload.level, dice: currentDice });
  });

  let formula = `${tiers[tiers.length - 1].dice}`;
  for (let i = tiers.length - 2; i >= 0; i--) {
    formula = `@{level} < ${tiers[i + 1].level} ? ${tiers[i].dice} : ${formula}`;
  }

  return `(${formula})d${dieSize}`;
};

/**
 * Constructs the upcast scaling array
 */
const translateUpcasting = (
  records: any[],
  baseDamage: any[] | undefined,
  baseDuration: string,
): any[] | undefined => {
  const upcastRecords = records.filter((r) => r.payload.type === 'Upcasting');

  if (upcastRecords.length === 0) {
    return undefined;
  }

  const upcastMap: Record<number, any> = {};

  for (const rec of upcastRecords) {
    const { payload } = rec;
    const { mode, startingLevel, level: levelStep, value: valuePerStep, target, level } = payload;

    if (mode === 'Per X Spell Level') {
      if (target === '$.diceCount' && baseDamage && baseDamage.length > 0) {
        const baseDamageEntry = baseDamage[0];
        const diceMatch = baseDamageEntry.damage.match(/(\d+)d(\d+)/);
        if (!diceMatch) continue;

        const baseDiceCount = parseInt(diceMatch[1]);
        const dieSize = diceMatch[2];

        for (let i = startingLevel; i <= 9; i += levelStep) {
          if (!upcastMap[i]) upcastMap[i] = { level: i };
          const steps = Math.floor((i - startingLevel) / levelStep) + 1;
          const diceToAdd = steps * valuePerStep;
          const newDiceCount = baseDiceCount + diceToAdd;

          upcastMap[i].damage = [
            {
              ...baseDamageEntry,
              damage: `${newDiceCount}d${dieSize}`,
            },
          ];
        }
      }
      if (target === '$.duration' && typeof valuePerStep === 'string') {
        const match = valuePerStep.match(/(\d+)\s*(hours?|minutes?|rounds?)/);
        if (!match) continue;

        const amount = parseInt(match[1]);
        const unit = match[2];
        const baseAmountMatch = baseDuration.match(/(\d+)\s*(hours?|minutes?|rounds?)/);
        const baseAmount = baseAmountMatch ? parseInt(baseAmountMatch[1]) : 0;

        for (let i = startingLevel; i <= 9; i += levelStep) {
          if (!upcastMap[i]) upcastMap[i] = { level: i };
          const steps = Math.floor((i - startingLevel) / levelStep) + 1;
          const newDuration = baseAmount + steps * amount;
          upcastMap[i].duration = `${newDuration} ${unit}`;
        }
      }
    }

    if (mode === 'Specific Spell Level') {
      const upcastTargetMap: Record<string, string> = {
        '$.duration': 'duration',
        '$.concentration': 'concentration',
        '$.range': 'range',
        '$.target': 'target',
      };

      const targetProp = upcastTargetMap[target];
      if (!targetProp) continue;
      if (!upcastMap[level]) upcastMap[level] = { level };
      upcastMap[level][targetProp] = payload.value;
    }
  }

  const sortedUpcasts = Object.values(upcastMap).sort((a, b) => a.level - b.level);

  for (let i = 1; i < sortedUpcasts.length; i++) {
    const previousLevelProps = sortedUpcasts[i - 1];
    sortedUpcasts[i] = {
      ...previousLevelProps,
      ...sortedUpcasts[i],
      level: sortedUpcasts[i].level,
    };
  }

  return sortedUpcasts.length > 0 ? sortedUpcasts : undefined;
};

const translateLegacyUpcasting = (
  properties: any,
  baseDamage: any[] | undefined,
): any[] | undefined => {
  if (!properties['Higher Spell Slot Desc'] || !baseDamage || baseDamage.length === 0) {
    return undefined;
  }

  const baseDamageEntry = baseDamage[0];
  const diceMatch = baseDamageEntry.damage.match(/(\d+)d(\d+)/);

  if (!diceMatch) return undefined;

  const baseDiceCount = parseInt(diceMatch[1], 10);
  const dieSize = diceMatch[2];

  const baseLevel = parseInt(properties.Level, 10);
  const diceToAddPerLevel = parseInt(properties['Higher Spell Slot Dice'], 10) || 1;
  const startingLevel = baseLevel + 1;

  const upcastLevels: any[] = [];

  for (let spellLevel = startingLevel; spellLevel <= 9; spellLevel++) {
    const levelsAboveBase = spellLevel - baseLevel;
    const newDiceCount = baseDiceCount + levelsAboveBase * diceToAddPerLevel;

    upcastLevels.push({
      level: spellLevel,
      damage: [
        {
          ...baseDamageEntry,
          damage: `${newDiceCount}d${dieSize}`,
        },
      ],
    });
  }

  return upcastLevels.length > 0 ? upcastLevels : undefined;
};

export const transformDnDSpell = (rawPayload: any, book: any, properties: any): Partial<Spell> => {
  if (properties['data-datarecords']) {
    const records = parseDatarecords(properties['data-datarecords']);
    const spellRecord = records.find((r) => r.payload.type === 'Spell');

    const name = rawPayload.name;
    const description = properties['data-description'] || spellRecord?.payload.description || '';
    const upcastDescription =
      properties['Higher Spell Slot Desc'] || spellRecord?.payload.upcastText || '';

    const baseDamage = translateDamage(properties, records, name);
    const baseDuration = properties.Duration || '';
    let finalDamage = baseDamage;

    if (properties.Level === 0 || properties.Level === '0') {
      const cantripFormula = baseDamage ? translateCantripScaling(records, name, baseDamage) : null;
      if (cantripFormula && finalDamage && finalDamage[0]) {
        finalDamage[0].damage = cantripFormula;
      }
    }

    const transformedSpell: Partial<Spell> = {
      name: name,
      level: parseInt(properties.Level, 10) || 0,
      school: parseSchool(properties.School),
      castingTime: properties['Casting Time'],
      range: properties.Range,
      duration: baseDuration,
      target: properties.Target,
      components: translateComponents(properties.Components),
      material: spellRecord?.payload?.components?.materialDescription,
      concentration:
        properties['filter-Concentration'] === 'Yes' || properties['Concentration'] === 'Yes',
      ritual: properties['filter-Ritual'] === 'Yes',
      isAttack: properties['Spell Attack'] && properties['Spell Attack'] !== 'None',
      description: {
        default: description,
        upcast: upcastDescription || undefined,
      },
      damage: finalDamage,
      saving: translateSavingThrow(properties) as AbilityKey,
      upcast: translateUpcasting(records, baseDamage, baseDuration),
      'data-tags': properties['filter-Tags']?.split(',').map((t: string) => t.trim()),
    };
    return Object.fromEntries(Object.entries(transformedSpell).filter(([_, v]) => v !== undefined));
  } else {
    const name = rawPayload.name;
    const description = properties['data-description'] || '';
    const upcastDescription = properties['Higher Spell Slot Desc'] || '';

    let baseDamage;
    if (properties.Damage && properties['Damage Type']) {
      baseDamage = [
        {
          ability: 'none' as AbilityKey | 'none',
          damage: properties.Damage,
          type: properties['Damage Type'].toLowerCase(),
          critDamage: properties.Damage,
        },
      ];
    }

    const transformedSpell: Partial<Spell> = {
      name: name,
      level: parseInt(properties.Level, 10) || 0,
      school: parseSchool(properties.School),
      castingTime: properties['Casting Time'],
      range: properties.Range,
      duration: properties.Duration,
      target: properties.Target,
      components: translateComponents(properties.Components),
      material: properties.Material,
      concentration: properties['Concentration'] === 'Yes',
      ritual: properties['Ritual'] === 'Yes',
      isAttack: properties['Spell Attack'] && properties['Spell Attack'] !== 'None',
      description: {
        default: description,
        upcast: upcastDescription || undefined,
      },
      damage: baseDamage || undefined,
      saving: translateSavingThrow(properties) as AbilityKey,
      upcast: translateLegacyUpcasting(properties, baseDamage),
    };

    return Object.fromEntries(
      Object.entries(transformedSpell).filter(([_, v]) => v !== undefined && v !== ''),
    );
  }
};
