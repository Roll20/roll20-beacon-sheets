import { deepTransformFormulas, parseStatBlock, capitalize } from './utils';
import {
  type NpcAction,
  type NpcFeature,
  type NpcSpell,
  type NpcSpellSource,
} from '@/sheet/stores/npc/npcStore';
import { config } from '@/config';

function parseAc(acValue?: string | number): { armorClass: number; acDescription: string } {
    if (!acValue) return { armorClass: 10, acDescription: "" };
    const acString = String(acValue);
    const match = acString.match(/(\d+)\s*(?:\((.*?)\))?/);
    return {
        armorClass: match ? parseInt(match[1], 10) : 10,
        acDescription: match && match[2] ? match[2].toLowerCase() : ""
    };
}

const getProficiencyBonusFromCR = (crString?: string): number => {
  if (!crString) return 2;

  const crMap: Record<string, number> = {
    '0': 2,
    '1/8': 2,
    '1/4': 2,
    '1/2': 2,
    '1': 2,
    '2': 2,
    '3': 2,
    '4': 2,
    '5': 3,
    '6': 3,
    '7': 3,
    '8': 3,
    '9': 4,
    '10': 4,
    '11': 4,
    '12': 4,
    '13': 5,
    '14': 5,
    '15': 5,
    '16': 5,
    '17': 6,
    '18': 6,
    '19': 6,
    '20': 6,
    '21': 7,
    '22': 7,
    '23': 7,
    '24': 7,
    '25': 8,
    '26': 8,
    '27': 8,
    '28': 8,
    '29': 9,
    '30': 9,
  };

  const cr = crString.toString().trim();
  return crMap[cr] || 2;
};

function parseHp(hpString?: string): { current: number; max: number; formula: string } {
  if (!hpString) return { current: 1, max: 1, formula: '1d4' };
  const formulaMatch = hpString.match(/\((.*?)\)/);
  const hpValueMatch = hpString.match(/^(\d+)/);
  return {
    current: hpValueMatch ? parseInt(hpValueMatch[1], 10) : 1,
    max: hpValueMatch ? parseInt(hpValueMatch[1], 10) : 1,
    formula: formulaMatch ? formulaMatch[1] : '',
  };
}

function processTraits(traitsString?: string): NpcFeature[] {
  if (!traitsString) return [];
  try {
    const traits = JSON.parse(traitsString);
    return traits.map((trait: any) => {
      const newTrait: Partial<NpcFeature> = {
        name: trait.Name,
        description: (trait.Desc || '').replace(/effect/g, 'effect'),
      };

      return newTrait as NpcFeature;
    });
  } catch (e) {
    return [];
  }
}

function processActions(
  actionsString?: string,
  legendaryActionsString?: string,
  lairActionsString?: string,
  reactionsString?: string,
): { actions: NpcAction[]; legendaryActions: NpcAction[]; lairActions: NpcAction[] } {
  const result: { actions: NpcAction[]; legendaryActions: NpcAction[]; lairActions: NpcAction[] } =
    {
      actions: [],
      legendaryActions: [],
      lairActions: [],
    };

  const parseActionArray = (
    arr: any[],
    group: 'actions' | 'legendary' | 'lair' | 'reactions' | 'bonus-actions',
  ) => {
    return arr.map((action: any) => {
      const newAction: Partial<NpcAction> = {
        name: action.Name,
        group: group,
        isAttack: !!action['Type Attack'],
        description: (action.Desc || '').replace(/effect/g, 'effect'),
      };

      const costMatch = action.Name.match(/\(Costs (\d+) Actions\)/);
      if (costMatch) {
        newAction.legendaryCost = parseInt(costMatch[1], 10);
        newAction.name = newAction.name!.replace(costMatch[0], '').trim();
      }

      if (newAction.isAttack) {
        newAction.sourceType = action['Type Attack'].toLowerCase().includes('spell')
          ? 'spell'
          : 'weapon';
        newAction.attackType = action.Type ? action.Type.toLowerCase().trim() : 'melee';
        newAction.attackBonus = action['Hit Bonus'] ? parseInt(action['Hit Bonus'], 10) : 0;
        newAction.range = action.Reach ? String(action.Reach) : '5 ft.';
        newAction.target = action.Target ? String(action.Target) : 'one target';
        newAction.damage = [];
        if (action.Damage) {
          const damageMatch = action.Damage?.match(/(\d+d\d+(?:\s*\+\s*\d+)?)/);
          const damageString = damageMatch ? damageMatch[1] : action.Damage;
          newAction.damage.push({
            ability: 'none',
            damage: damageString,
            type: action['Damage Type'] ? action['Damage Type'].toLowerCase() : 'bludgeoning',
            critDamage: damageString.match(/d/) ? damageString.split('+')[0].trim() : '',
          });
        }
      }

      if ((!newAction.damage || newAction.damage.length === 0) && newAction.description) {
        const damageMatch = newAction.description.match(/\[\[(.*?)\]\]/);
        if (damageMatch && damageMatch[1]) {
          const damageString = damageMatch[1];

          const substringAfterDice = newAction.description.substring(
            damageMatch.index! + damageMatch[0].length,
          );
          const typeMatch = substringAfterDice.match(/(\w+)\s+damage/i);

          let damageType = 'bludgeoning';
          if (
            typeMatch &&
            typeMatch[1] &&
            (config.damageTypes as readonly string[]).includes(typeMatch[1].toLowerCase())
          ) {
            damageType = typeMatch[1].toLowerCase();
          }

          newAction.damage = [
            {
              ability: 'none',
              damage: damageString,
              type: damageType,
              critDamage: damageString.match(/d/) ? damageString.split('+')[0].trim() : '',
            },
          ];
        }
      }

      const desc = newAction.description || '';
      const saveMatch = desc.match(/DC (\d+) (\w+) saving throw/i);
      if (saveMatch) {
        newAction.savingDc = parseInt(saveMatch[1], 10);
        newAction.saving = saveMatch[2].toLowerCase() as any;
      }

      if (action.Name === 'Multiattack') newAction.isAttack = false;

      return newAction as NpcAction;
    });
  };

  try {
    let allStandardActions: NpcAction[] = [];

    if (actionsString) {
      allStandardActions = allStandardActions.concat(
        parseActionArray(JSON.parse(actionsString), 'actions'),
      );
    }
    if (reactionsString) {
      allStandardActions = allStandardActions.concat(
        parseActionArray(JSON.parse(reactionsString), 'reactions'),
      );
    }

    result.actions = allStandardActions;

    if (legendaryActionsString)
      result.legendaryActions = parseActionArray(JSON.parse(legendaryActionsString), 'legendary');
    if (lairActionsString)
      result.lairActions = parseActionArray(JSON.parse(lairActionsString), 'lair');
  } catch (e) {
    console.error('Error processing actions:', e);
  }
  return result;
}

export const transformDnDMonster = (
  rawPayload: any,
  book: any,
  properties: any,
): Record<string, any> => {
  const p = deepTransformFormulas(properties);

  const abilities = {
    strength: parseInt(p.STR, 10),
    dexterity: parseInt(p.DEX, 10),
    constitution: parseInt(p.CON, 10),
    intelligence: parseInt(p.INT, 10),
    wisdom: parseInt(p.WIS, 10),
    charisma: parseInt(p.CHA, 10),
  };

  let sensesString = p.Senses || '';
  const proficiencyBonus = getProficiencyBonusFromCR(p['Challenge Rating']);

  const passivePerceptionValue = parseInt(p['Passive Perception'], 10) || 10;
  if (sensesString && !sensesString.toLowerCase().includes('passive perception')) {
    sensesString += `, passive perception ${passivePerceptionValue}`;
  } else if (!sensesString) {
    sensesString = `Passive Perception ${passivePerceptionValue}`;
  }

  const { actions, legendaryActions, lairActions } = processActions(
    p['data-Actions'],
    p['data-Legendary Actions'],
    p['data-Lair Actions'],
    p['data-Reactions'],
  );

  const spellSources: Partial<NpcSpellSource>[] = [];
  const spells: Partial<NpcSpell>[] = [];

  if (p['data-Spells']) {
    try {
      const spellData = JSON.parse(p['data-Spells'] || '{}');
      const traitData = JSON.parse(p['data-Traits'] || '[]');
      const spellcastingTrait = traitData.find((t: any) =>
        t.Name.toLowerCase().includes('spellcasting'),
      );

      if (spellcastingTrait) {
        const desc = spellcastingTrait.Desc || '';
        let ability: keyof typeof abilities = 'intelligence';
        const abilityMatch = desc.match(/spellcasting ability is (\w+)/i);
        if (abilityMatch && abilityMatch[1]) {
          const parsedAbility = abilityMatch[1].toLowerCase();
          if (Object.keys(abilities).includes(parsedAbility)) {
            ability = parsedAbility as keyof typeof abilities;
          }
        } else if (p['Spellcasting Ability']) {
          const parsedAbility = p['Spellcasting Ability'].toLowerCase();
          if (Object.keys(abilities).includes(parsedAbility)) {
            ability = parsedAbility as keyof typeof abilities;
          }
        }

        let spellAttackBonus = parseInt(
          desc.match(/\+(\d+) to hit/)?.[1] || '0',
          10,
        );
        let spellSaveDC = parseInt(desc.match(/DC (\d+)/)?.[1] || '0', 10);

        if (spellAttackBonus === 0 || spellSaveDC === 0) {
          const abilityModifier = Math.floor((abilities[ability] - 10) / 2);
          if (spellAttackBonus === 0) {
            spellAttackBonus = proficiencyBonus + abilityModifier;
          }
          if (spellSaveDC === 0) {
            spellSaveDC = 8 + proficiencyBonus + abilityModifier;
          }
        }

        const newSource: Partial<NpcSpellSource> = {
          name: `${rawPayload.name} ${spellcastingTrait.Name}`,
          type: 'ability',
          ability: ability,
          isInnate: !!spellData.innate,
          spellAttackBonus: spellAttackBonus,
          spellSaveDC: spellSaveDC,
          spellSlots: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
          spellSlotsUsed: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
        };

        if (spellData.spells) {
          const slotLines = desc.match(/•.*\((.+) slots?\)/g) || [];
          for (const line of slotLines) {
            const levelMatch = line.match(/(\d+)[a-z]{2} level/);
            const slotMatch = line.match(/\((\d+) slot/);
            if (levelMatch && slotMatch) {
              const level = parseInt(levelMatch[1]);
              const slots = parseInt(slotMatch[1]);
              if (newSource.spellSlots) newSource.spellSlots[level] = slots;
            }
          }
        }

        spellSources.push(newSource);
        const sourceIndex = spellSources.length - 1;

        if (spellData.spells) {
          for (const levelKey in spellData.spells) {
            spellData.spells[levelKey].forEach((spellName: string) => {
              spells.push({
                name: spellName.split(' ').map(capitalize).join(' '),
                spellSourceId: `$picker:${sourceIndex}`,
              });
            });
          }
        } else if (spellData.innate) {
          for (const freq in spellData.innate) {
            let usage: string;
            if (freq === 'at-will') {
              usage = 'At Will';
            } else {
              usage = freq.replace(/_/g, '/').replace(/\b\w/g, (c) => c.toUpperCase());
            }
            spellData.innate[freq].forEach((spellName: string) => {
              spells.push({
                name: spellName.split(' ').map(capitalize).join(' '),
                innateUsage: usage,
                spellSourceId: `$picker:${sourceIndex}`,
              });
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse monster spell data for:', rawPayload.name);
    }
  }

  const transformedPayload: Record<string, any> = {
    name: rawPayload.name,
    shortDescription: `${p.Size || 'Medium'} ${p.Type || 'beast'}, ${p.Alignment || 'unaligned'}`,
    ...parseAc(p.AC),
    hitPoints: parseHp(p.HP),
    speed: p.Speed || '30 ft.',
    abilities,
    savingThrows: parseStatBlock(p['Saving Throws']),
    skills: parseStatBlock(p.Skills),
    damageVulnerabilities: p.Vulnerabilities || '',
    damageResistances: p.Resistances || '',
    damageImmunities: p.Immunities || '',
    conditionImmunities: p['Condition Immunities'] || '',
    senses: sensesString,
    passivePerception: parseInt(p['Passive Perception'], 10) || 10,
    languages: p.Languages || '',
    challenge: `${p['Challenge Rating'] || '0'} (${p['data-XP'] || '10'} XP)`,
    token: p.Token || '',
    features: processTraits(p['data-Traits']),
    actions: actions,
    legendaryActions: {
      description: p['data-LANum']
        ? `The ${rawPayload.name} can take ${p['data-LANum']} legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${rawPayload.name} regains spent legendary actions at the start of its turn.`
        : '',
      actions: legendaryActions,
    },
    lairActions: {
      description: '',
      actions: lairActions,
    },
    spellSources: spellSources,
    'data-spells': spells,
  };

  console.log(transformedPayload);
  return transformedPayload;
};
