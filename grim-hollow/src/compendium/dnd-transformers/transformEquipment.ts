import { deepTransformFormulas } from './utils';
import { config } from '@/config';
import { createEffectFragment } from './transformEffects';
import { type Currency } from '@/sheet/stores/currency/currencyStore';
import { type Equipment } from '@/sheet/stores/equipment/equipmentStore';

const cleanDescription = (desc: string | null | undefined): string => {
  if (!desc) return '';
  return desc.replace(/<[^>]*>/g, '').trim();
};

const parseCost = (
  costString: string | null | undefined,
): { amount: number; currency: Currency } | undefined => {
  if (!costString) return undefined;
  const match = costString.match(/(\d+)\s*(\w+)/);
  if (match) {
    const amount = parseInt(match[1], 10);
    const currency = match[2].toLowerCase() as Currency;
    if (config.currencyTypes.includes(currency)) {
      return { amount, currency };
    }
  }
  return undefined;
};

const mapItemType = (itemType: string | null | undefined): Equipment['type'] => {
  if (!itemType) return 'equipment';
  const lowerType = itemType.toLowerCase();

  if (lowerType.includes('wondrous')) return 'magic-item-wondrous';
  if (lowerType.includes('weapon')) return 'weapon';
  if (lowerType.includes('armor')) return 'armor';
  if (lowerType.includes('consumable') || lowerType.includes('potion'))
    return 'magic-item-consumable';
  if (lowerType.includes('tool')) return 'tool';
  if (lowerType.includes('vehicle')) return 'vehicle';
  if (lowerType.includes('gear')) return 'survival-gear';
  if (lowerType.includes('ammunition')) return 'ammunition';

  return 'equipment';
};

export const transformDnDEquipment = (
  rawPayload: any,
  book: any,
  properties: any,
): Partial<Equipment> => {
  let transformedPayload: Partial<Equipment> & { [key: string]: any } = {
    name: rawPayload.name,
  };
  let descriptionPrefix = '';
  const tags: string[] = [];

  if (properties['data-datarecords']) {
    const dataRecords = JSON.parse(properties['data-datarecords'] || '[]');
    const itemRecord = dataRecords.find((r: any) => JSON.parse(r.payload).type === 'Item');

    if (!itemRecord) return {};

    const itemPayload = deepTransformFormulas(JSON.parse(itemRecord.payload));

    transformedPayload = {
      ...transformedPayload,
      name: itemPayload.name,
      weight: parseFloat(itemPayload.weight) || 0,
      description: itemPayload.description || '',
      value: parseCost(itemPayload.cost),
      type: mapItemType(
        itemPayload.armorData?.category ||
          itemPayload.weaponData?.category ||
          properties['Item Type'],
      ),
    };

    descriptionPrefix = [itemPayload.rarity, properties['Item Type']].filter(Boolean).join(', ');

    if (itemPayload.properties && Array.isArray(itemPayload.properties)) {
      itemPayload.properties.forEach((prop: string) => {
        tags.push(prop.split('(')[0].trim());
      });
    }
    if (properties.Mastery) {
      tags.push(properties.Mastery);
    }

    const childRecordsByParent: Record<string, any[]> = {};
    dataRecords.forEach((record: any) => {
      if (record.parent) {
        if (!childRecordsByParent[record.parent]) {
          childRecordsByParent[record.parent] = [];
        }
        childRecordsByParent[record.parent].push(record);
      }
    });
    const combinedEffects: any = {
      label: `${itemPayload.name} Effects`,
      enabled: true,
      toggleable: false,
      removable: false,
      required: ['equipped'],
      effects: [],
      actions: [],
      resources: [],
      spells: [],
      pickers: [],
      spellSources: [],
    };
    if (itemPayload.armorData || itemPayload.shieldData) {
      const isShield = !!itemPayload.shieldData;
      const baseACRecord = dataRecords.find(
        (r: any) =>
          JSON.parse(r.payload).type === 'Armor Class' &&
          JSON.parse(r.payload).calculation === 'Set Base',
      );
      const bonusACRecords = dataRecords.filter(
        (r: any) =>
          JSON.parse(r.payload).type === 'Armor Class' &&
          JSON.parse(r.payload).calculation === 'Modify',
      );

      const baseAC = baseACRecord ? JSON.parse(baseACRecord.payload).valueFormula.flatValue : 0;
      const magicBonus = bonusACRecords.reduce(
        (sum: number, rec: any) => sum + JSON.parse(rec.payload).valueFormula.flatValue,
        0,
      );

      if (isShield) {
        combinedEffects.effects.push({
          attribute: 'armor-class',
          operation: 'add',
          value: baseAC + magicBonus,
        });
      } else {
        let formula = `${baseAC + magicBonus}`;
        const armorData = itemPayload.armorData;
        if (armorData && armorData.ability) {
          const abilityMap: Record<string, string> = { 
            str: 'strength', dex: 'dexterity', con: 'constitution', 
            int: 'intelligence', wis: 'wisdom', cha: 'charisma' 
          };
          const rawAbility = armorData.ability.toLowerCase();
          const ability = abilityMap[rawAbility] || rawAbility;
          const cap = armorData.bonusCap;
          
          const modifierString = cap ? `@{${ability}-modifier|max:${cap}}` : `@{${ability}-modifier}`;
          formula += `+${modifierString}`;
        }
        combinedEffects.effects.push({
          attribute: 'armor-class',
          operation: 'set-base-final-formula',
          formula: formula,
        });
      }
    }

    const recordsToProcess = dataRecords.filter(
      (rec: any) => JSON.parse(rec.payload).type !== 'Item',
    );

    for (const record of recordsToProcess) {
      const payload = JSON.parse(record.payload);

      if (payload.type === 'Armor Class' || payload.type === 'Damage') continue;

      if (payload.type === 'Attunement') {
        if (!tags.includes('attunement')) tags.push('attunement');
        if (!combinedEffects.required.includes('attuned')) combinedEffects.required.push('attuned');
        continue;
      }

      if (payload.type === 'Spell Attach') {
        if (combinedEffects.spellSources.length === 0) {
          let flatDC = 0;
          const descriptionText = itemPayload.description || '';
          const dcMatch = descriptionText.match(/(?:save\s*)?DC\s*(\d+)/i);
          if (dcMatch && dcMatch[1]) {
            flatDC = parseInt(dcMatch[1], 10);
          }

          combinedEffects.spellSources.push({
            name: itemPayload.name,
            type: 'flat',
            flat: flatDC - 8,
          });
        }

        const fragment = createEffectFragment(record);
        if (fragment && fragment.spells) {
          if (!transformedPayload['data-spells']) {
            transformedPayload['data-spells'] = [];
          }
          transformedPayload['data-spells'].push(...fragment.spells);
        }
        continue;
      }

      if (payload.type === 'Attack') {
        const attackFragment = createEffectFragment(record);
        if (!attackFragment || !attackFragment.actions) continue;

        const newAction = attackFragment.actions[0];
        const damageRecords = (childRecordsByParent[record.name] || []).filter(
          (child) => JSON.parse(child.payload).type === 'Damage',
        );

        newAction.damage = damageRecords.map((damageRecord) => {
          const damagePayload = JSON.parse(damageRecord.payload);
          const ability =
            damagePayload.ability === 'auto'
              ? newAction.attackAbility
              : damagePayload.ability || 'none';

          const dice = `${damagePayload.diceCount || 1}${damagePayload.diceSize}`;
          let bonusString = '';

          if (damagePayload._bonus) {
            bonusString = `+(${damagePayload._bonus})`;
          } else if (damagePayload.bonus) {
            const bonus = parseInt(damagePayload.bonus, 10);
            if (bonus > 0) bonusString = `+${bonus}`;
            else if (bonus < 0) bonusString = `${bonus}`;
          }

          return {
            ability: ability,
            damage: `${dice}${bonusString}`,
            type: damagePayload.damageType?.toLowerCase() || 'bludgeoning',
            critDamage: `${dice}${bonusString}`,
          };
        });

        combinedEffects.actions.push(newAction);
        continue;
      }

      const fragment = createEffectFragment(record);
      if (fragment) {
        if (fragment.effects) combinedEffects.effects.push(...fragment.effects);
        if (fragment.actions) combinedEffects.actions.push(...fragment.actions);
        if (fragment.resources) combinedEffects.resources.push(...fragment.resources);
        if (fragment.spells) combinedEffects.spells.push(...fragment.spells);
        if (fragment.pickers) combinedEffects.pickers.push(...fragment.pickers);
      }
    }

    const hasEffectsData =
      [
        combinedEffects.effects,
        combinedEffects.actions,
        combinedEffects.resources,
        combinedEffects.spells,
        combinedEffects.pickers,
        combinedEffects.spellSources,
      ].some((arr) => arr && arr.length > 0) || combinedEffects.required.length > 1;

    if (hasEffectsData) {
      transformedPayload['data-effects'] = combinedEffects;
    }
  } else {
    transformedPayload = {
      ...transformedPayload,
      weight: parseFloat(properties.Weight) || 0,
      description: cleanDescription(properties['data-description']),
      type: mapItemType(properties['Item Type']),
    };

    descriptionPrefix = [properties['Item Rarity'], properties['Item Type']]
      .filter(Boolean)
      .join(', ');

    if (properties['Requires Attunement']) {
      tags.push('attunement');
    }

    if (properties.Properties && typeof properties.Properties === 'string') {
      const propertyTags = properties.Properties.split(',').map((p: string) => p.trim());
      tags.push(...propertyTags);
    }

    const effects: any[] = [];

    const actions: any[] = [];
    if (
      properties.AC &&
      (properties['Item Type']?.toLowerCase().includes('armor') ||
        properties['Item Type']?.toLowerCase().includes('shield'))
    ) {
      const isShield = properties['Item Type']?.toLowerCase().includes('shield');
      const baseAC = parseInt(properties.AC, 10) || 0;

      let magicBonus = 0;
      if (properties.Modifiers && typeof properties.Modifiers === 'string') {
        const acMatch = properties.Modifiers.match(/AC\s*\+(\d+)/i);
        if (acMatch) magicBonus = parseInt(acMatch[1], 10);
      }

      if (isShield) {
        effects.push({
          attribute: 'armor-class',
          operation: 'add',
          value: baseAC + magicBonus,
        });
      } else {
        const desc = properties['data-description']?.toLowerCase() || '';
        let formula = `${baseAC + magicBonus}`;
        const dexMatch = desc.match(/dex\s*modifier(?:\s*\(max\s*(\d+)\))?/);

        if (dexMatch) {
          const cap = dexMatch[1];
          formula += cap ? `+@{dexterity-modifier|max:${cap}}` : `+@{dexterity-modifier}`;
        }

        effects.push({
          attribute: 'armor-class',
          operation: 'set-base-final-formula',
          formula: formula,
        });
      }
    }
    if (properties.Damage) {
      actions.push({
        name: rawPayload.name,
        group: 'actions',
        isAttack: true,
        attackType: 'melee',
        sourceType: 'weapon',
        damage: [
          {
            ability: 'strength',
            damage: properties.Damage,
            type: properties['Damage Type']?.toLowerCase() || 'bludgeoning',
          },
        ],
        range: properties.Range || '',
      });
    }

    if (effects.length > 0 || actions.length > 0) {
      transformedPayload['data-effects'] = {
        label: `${rawPayload.name} Effects`,
        enabled: true,
        toggleable: false,
        removable: false,
        required: ['equipped'],
        effects,
        actions,
      };
      if (tags.includes('attunement')) {
        transformedPayload['data-effects'].required.push('attuned');
      }
    }
  }

  if (descriptionPrefix) {
    transformedPayload.description = `**${descriptionPrefix}**\n\n${
      transformedPayload.description || ''
    }`;
  }

  if (tags.length > 0) {
    transformedPayload['data-tags'] = [...new Set(tags)];
  }

  return transformedPayload;
};
