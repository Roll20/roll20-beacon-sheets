import { describe, it, expect, vi } from 'vitest';
import { transformDnDMonster } from '../transformMonster';
import exp from 'constants';

describe('dnd-transformers/transformMonster', () => {
  const baseProperties = {
    STR: '10',
    DEX: '10',
    CON: '10',
    INT: '10',
    WIS: '10',
    CHA: '10',
    'Challenge Rating': '0',
    AC: '10',
    HP: '10 (3d6)',
    Speed: '30 ft.',
    'Passive Perception': '10',
    'data-XP': '10',
  };

  it('transforms basic monster stats', () => {
    const rawPayload = { name: 'Goblin' };
    const properties = {
      ...baseProperties,
      STR: '8',
      DEX: '14',
      CON: '10',
      INT: '10',
      WIS: '8',
      CHA: '8',
      AC: '15 (Leather Armor, Shield)',
      HP: '7 (2d6)',
      'Challenge Rating': '1/4',
      'data-XP': '50',
      Senses: 'Darkvision 60 ft.',
      Languages: 'Common, Goblin',
    };

    const result = transformDnDMonster(rawPayload, {}, properties);

    expect(result.name).toBe('Goblin');
    expect(result.armorClass).toBe(15);
    expect(result.acDescription).toBe('leather armor, shield');
    expect(result.hitPoints).toEqual({ current: 7, max: 7, formula: '2d6' });
    expect(result.abilities.strength).toBe(8);
    expect(result.abilities.dexterity).toBe(14);
    expect(result.challenge).toBe('1/4 (50 XP)');
    expect(result.senses).toContain('Darkvision 60 ft.');
    expect(result.languages).toBe('Common, Goblin');
  });

  it('calculates saving throws and skills', () => {
    const properties = {
      ...baseProperties,
      'Saving Throws': 'Dex +4, Con +2',
      Skills: 'Stealth +6, Survival +1',
    };

    const result = transformDnDMonster({ name: 'Test' }, {}, properties);

    expect(result.savingThrows).toEqual({
      dexterity: 4,
      constitution: 2,
    });
    expect(result.skills).toEqual({
      stealth: 6,
      survival: 1,
    });
  });

  it('returns empty features on malformed traits data', () => {
    const properties = {
      ...baseProperties,
      'data-Traits': '{{invalid-json',
    };

    const result = transformDnDMonster({ name: 'Glitch' }, {}, properties);
    expect(result.features).toEqual([]);
  });

  it('processes actions correctly', () => {
    const actionsData = JSON.stringify([
      {
        Name: 'Scimitar',
        'Type Attack': 'Melee Weapon Attack',
        'Hit Bonus': 4,
        Reach: '5 ft.',
        Target: 'one target',
        Damage: '5 (1d6 + 2) slashing damage',
        'Damage Type': 'Slashing',
      },
    ]);

    const properties = {
      ...baseProperties,
      'data-Actions': actionsData,
    };

    const result = transformDnDMonster({ name: 'Test' }, {}, properties);

    expect(result.actions).toHaveLength(1);
    const action = result.actions[0];
    expect(action.name).toBe('Scimitar');
    expect(action.isAttack).toBe(true);
    expect(action.attackBonus).toBe(4);
    expect(action.range).toBe('5 ft.');
    expect(action.target).toBe('one target');
    expect(action.sourceType).toBe('weapon');
    expect(action.damage[0].damage).toBe('1d6 + 2');
    expect(action.damage[0].type).toBe('slashing');
  });

  it('processes actions with save DCs in description', () => {
    const actionsData = JSON.stringify([
      {
        Name: 'Breath Weapon',
        Desc: 'DC 15 Dexterity saving throw taking 20 (5d8) fire damage on failure.',
      },
    ]);

    const properties = {
      ...baseProperties,
      'data-Actions': actionsData,
    };

    const result = transformDnDMonster({ name: 'Dragon' }, {}, properties);
    const action = result.actions[0];

    expect(action.savingDc).toBe(15);
    expect(action.saving).toBe('dexterity');
  });

  it('processes legendary actions', () => {
    const legActions = JSON.stringify([
      { Name: 'Tail Attack', 'Type Attack': 'Melee' },
      { Name: 'Wing Attack (Costs 2 Actions)', Desc: 'Flaps wings.' },
    ]);

    const properties = {
      ...baseProperties,
      'data-Legendary Actions': legActions,
      'data-LANum': '3',
    };

    const result = transformDnDMonster({ name: 'Dragon' }, {}, properties);

    expect(result.legendaryActions.actions).toHaveLength(2);
    expect(result.legendaryActions.description).toContain('3 legendary actions');
    expect(result.legendaryActions.actions[1].name).toBe('Wing Attack');
    expect(result.legendaryActions.actions[1].legendaryCost).toBe(2);
  });

  it('identifies spell attacks and processes reactions', () => {
    const spellActionData = JSON.stringify([
      {
        Name: 'Fire Ray',
        'Type Attack': 'Ranged Spell Attack',
        'Hit Bonus': 5,
        Damage: '1d10 fire',
      },
    ]);

    const reactionData = JSON.stringify([
      {
        Name: 'Shield',
        Desc: 'Adds +5 to AC',
      },
    ]);

    const properties = {
      ...baseProperties,
      'data-Actions': spellActionData,
      'data-Reactions': reactionData,
    };

    const result = transformDnDMonster({ name: 'Caster' }, {}, properties);

    const attack = result.actions.find((a) => a.name === 'Fire Ray');
    expect(attack).toBeDefined();
    expect(attack?.isAttack).toBe(true);
    expect(attack?.sourceType).toBe('spell');

    const reaction = result.actions.find((a) => a.name === 'Shield');
    expect(reaction).toBeDefined();
    expect(reaction?.group).toBe('reactions');
  });

  it('parses inline damage formulas from description', () => {
    const actionData = JSON.stringify([
      {
        Name: 'Burn',
        Desc: 'The target takes [[2d6]] fire damage.',
      },
    ]);

    const properties = {
      ...baseProperties,
      'data-Actions': actionData,
    };

    const result = transformDnDMonster({ name: 'Fire Elemental' }, {}, properties);
    const action = result.actions[0];

    expect(action.damage).toHaveLength(1);
    expect(action.damage[0].damage).toBe('2d6');
    expect(action.damage[0].type).toBe('fire');
  });

  it('handles malformed action JSON gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const properties = {
      ...baseProperties,
      'data-Actions': '{{invalid-json',
    };

    const result = transformDnDMonster({ name: 'Broken' }, {}, properties);

    expect(result.actions).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles spellcasting traits', () => {
    const traits = JSON.stringify([
      {
        Name: 'Spellcasting',
        Desc: 'The mage is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 14, +6 to hit). The mage has the following wizard spells prepared:\n• Cantrips (at will): fire bolt, light\n• 1st level (4 slots): detect magic, mage armor',
      },
    ]);
    const spellData = JSON.stringify({
      spells: {
        '0': ['fire bolt', 'light'],
        '1': ['detect magic', 'mage armor'],
      },
    });

    const properties = {
      ...baseProperties,
      'data-Traits': traits,
      'data-Spells': spellData,
    };

    const result = transformDnDMonster({ name: 'Mage' }, {}, properties);

    expect(result.spellSources).toHaveLength(1);
    const source = result.spellSources[0];
    expect(source.ability).toBe('intelligence');
    expect(source.spellSaveDC).toBe(14);
    expect(source.spellAttackBonus).toBe(6);
    expect(source.spellSlots[1]).toBe(4);

    expect(result['data-spells']).toHaveLength(4);
    const fireBolt = result['data-spells'].find((s: any) => s.name === 'Fire Bolt');
    expect(fireBolt).toBeDefined();
    expect(fireBolt.spellSourceId).toContain('$picker:0');
  });

  it('handles innate spellcasting', () => {
    const traits = JSON.stringify([
      {
        Name: 'Innate Spellcasting',
        Desc: "The monster's innate spellcasting ability is Charisma (spell save DC 13).",
      },
    ]);
    const spellData = JSON.stringify({
      innate: {
        'at-will': ['invisibility'],
        '3/day': ['darkness'],
      },
    });

    const properties = {
      ...baseProperties,
      'data-Traits': traits,
      'data-Spells': spellData,
    };

    const result = transformDnDMonster({ name: 'Drow' }, {}, properties);

    expect(result.spellSources).toHaveLength(1);
    const source = result.spellSources[0];
    expect(source.ability).toBe('charisma');
    expect(source.spellSaveDC).toBe(13);
    expect(source.isInnate).toBe(true);

    expect(result['data-spells']).toHaveLength(2);
    const invis = result['data-spells'].find((s: any) => s.name === 'Invisibility');
    expect(invis.innateUsage).toBe('At Will');

    const darkness = result['data-spells'].find((s: any) => s.name === 'Darkness');
    expect(darkness.innateUsage).toBe('3/Day');
  });

  it('falls back to Spellcasting Ability property if description match fails', () => {
    const traits = JSON.stringify([
      {
        Name: 'Spellcasting',
        Desc: 'The creature casts spells.',
      },
    ]);
    const spellData = JSON.stringify({
      spells: { '0': ['light'] },
    });

    const properties = {
      ...baseProperties,
      'data-Traits': traits,
      'data-Spells': spellData,
      'Spellcasting Ability': 'Wisdom', // Fallback
    };

    const result = transformDnDMonster({ name: 'Druid' }, {}, properties);

    expect(result.spellSources).toHaveLength(1);
    expect(result.spellSources[0].ability).toBe('wisdom');
  });

  it('formats special innate frequencies', () => {
      const traits = JSON.stringify([
        { Name: 'Innate Spellcasting', Desc: 'Innate ability.' }
      ]);
      
      const spellData = JSON.stringify({
        innate: {
          '1_day': ['misty step'],
          '3/week': ['sending']
        }
      });

      const properties = {
        ...baseProperties,
        'data-Traits': traits,
        'data-Spells': spellData
      };

      const result = transformDnDMonster({ name: 'Fey' }, {}, properties);
      
      const mistyStep = result['data-spells'].find((s: any) => s.name === 'Misty Step');
      expect(mistyStep.innateUsage).toBe('1/Day');

      const sending = result['data-spells'].find((s: any) => s.name === 'Sending');
      expect(sending.innateUsage).toBe('3/Week');
    });

  it('handles malformed spell JSON gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const properties = {
      ...baseProperties,
      'data-Spells': '{{invalid-json',
    };

    const result = transformDnDMonster({ name: 'Corrupt Mage' }, {}, properties);

    expect(result.spellSources).toEqual([]);
    expect(result['data-spells']).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('safely handles missing spellcasting description', () => {
    const traits = JSON.stringify([
      { Name: 'Spellcasting' },
    ]);
    const spellData = JSON.stringify({ spells: {} });

    const properties = {
      ...baseProperties,
      'data-Traits': traits,
      'data-Spells': spellData,
    };

    const result = transformDnDMonster({ name: 'Broken Mage' }, {}, properties);

    expect(result.spellSources).toHaveLength(1);
    // defaults to int if not found
    expect(result.spellSources[0].ability).toBe('intelligence');
  });
});
