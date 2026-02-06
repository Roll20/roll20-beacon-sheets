import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNpcStore } from '../npc/npcStore';
import { effectKeys } from '@/effects.config';
import { v4 as uuidv4 } from 'uuid';
import { EffectsCalculator } from '@/utility/effectsCalculator';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: { post: vi.fn() } },
  initValues: { character: { id: 'test-char-id' } },
}));

// Mock rolltemplates to return JSON string instead of HTML
vi.mock('@/rolltemplates/rolltemplates', () => ({
  createRollTemplate: vi.fn((args) => JSON.stringify(args)),
}));

describe('npcStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const store = useNpcStore();
      expect(store.isNpc).toBe(false);
      expect(store.npcs).toEqual([]);
      expect(store.isEditMode).toBe(true);
    });
  });

  describe('getEmptyNpc', () => {
    it('should create a default NPC with correct properties', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();

      expect(npc._id).toBeDefined();
      expect(npc.name).toBe('New NPC');
      expect(npc.isDefault).toBe(false);
      expect(npc.isCompanion).toBe(false);
      expect(npc.armorClass).toBe(10);
      expect(npc.hitPoints).toEqual({ current: 10, max: 10, formula: '2d8+2' });
      expect(npc.speed).toBe('30 ft.');
    });

    it('should create a companion with correct properties', () => {
      const store = useNpcStore();
      const companion = store.getEmptyNpc(false, true);

      expect(companion.name).toBe('New Companion');
      expect(companion.isCompanion).toBe(true);
      expect(companion.isCollapsed).toBe(true);
    });

    it('should apply patch properties', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, { name: 'Test NPC', armorClass: 15 });

      expect(npc.name).toBe('Test NPC');
      expect(npc.armorClass).toBe(15);
    });

    it('should initialize nested structures from patch data', () => {
      const store = useNpcStore();

      const patchData = {
        legendaryActions: {
          description: 'Legendary Description',
          actions: [{ name: 'Legendary Strike', attackBonus: 10 } as any],
        },
        lairActions: {
          description: 'Lair Description',
          actions: [{ name: 'Lair Quake', savingDc: 15 } as any],
        },
        spellSources: [{ name: 'Innate Magic', spellSaveDC: 18 } as any],
      };

      const npc = store.getEmptyNpc(false, false, patchData);

      expect(npc.legendaryActions.description).toBe('Legendary Description');
      expect(npc.legendaryActions.actions).toHaveLength(1);
      expect(npc.legendaryActions.actions[0].name).toBe('Legendary Strike');
      expect(npc.legendaryActions.actions[0]._id).toBeDefined();

      expect(npc.lairActions.description).toBe('Lair Description');
      expect(npc.lairActions.actions).toHaveLength(1);
      expect(npc.lairActions.actions[0].name).toBe('Lair Quake');
      expect(npc.lairActions.actions[0]._id).toBeDefined();

      expect(npc.spellSources).toHaveLength(1);
      expect(npc.spellSources[0].name).toBe('Innate Magic');
      expect(npc.spellSources[0]._id).toBeDefined();
    });
  });

  describe('Add/Update/Remove', () => {
    it('addCompanion should add a new companion', () => {
      const store = useNpcStore();
      const id = store.addCompanion();

      expect(store.npcs).toHaveLength(1);
      expect(store.npcs[0]._id).toBe(id);
      expect(store.npcs[0].isCompanion).toBe(true);
    });

    it('updateNpc should update existing NPC', () => {
      const store = useNpcStore();
      const id = store.addCompanion();
      store.updateNpc(id, { name: 'Updated Name', armorClass: 20 });

      const npc = store.npcs.find((n) => n._id === id);
      expect(npc?.name).toBe('Updated Name');
      expect(npc?.armorClass).toBe(20);
    });

    it('updateNpc should create new NPC if id not found', () => {
      const store = useNpcStore();
      const id = store.updateNpc('non-existent-id', { name: 'New NPC' });

      expect(store.npcs).toHaveLength(1);
      expect(store.npcs[0]._id).toBe(id);
      expect(store.npcs[0].name).toBe('New NPC');
    });

    it('removeNpc should remove non-default NPC', () => {
      const store = useNpcStore();
      const id = store.addCompanion();
      store.removeNpc(id);

      expect(store.npcs).toHaveLength(0);
    });

    it('duplicateNpc should create a copy', () => {
      const store = useNpcStore();
      const originalId = store.addCompanion();
      store.updateNpc(originalId, { name: 'Original' });

      store.duplicateNpc(originalId);

      expect(store.npcs).toHaveLength(2);
      expect(store.npcs[1].name).toBe('Original (Copy)');
      expect(store.npcs[1]._id).not.toBe(originalId);
    });

    it('Duplicate NPCs should regenerate IDs for nested items and remap links', () => {
      const store = useNpcStore();
      const source = store.getEmptyNpcSpellSource();
      const spell = store.getEmptyNpcSpell({ spellSourceId: source._id });
      const action = store.getEmptyNpcAction({});
      const feature = store.getEmptyNpcFeature({});
      const legendaryAction = store.getEmptyNpcAction({});

      const original = store.getEmptyNpc();
      original.spellSources = [source];
      original.spells = [spell];
      original.actions = [action];
      original.features = [feature];
      original.legendaryActions.actions = [legendaryAction];

      store.npcs = [original];

      store.duplicateNpc(original._id);

      expect(store.npcs).toHaveLength(2);
      const copy = store.npcs[1];

      expect(copy.actions[0]._id).not.toBe(action._id);
      expect(copy.features[0]._id).not.toBe(feature._id);
      expect(copy.legendaryActions.actions[0]._id).not.toBe(legendaryAction._id);
      expect(copy.spellSources[0]._id).not.toBe(source._id);
      expect(copy.spells[0]._id).not.toBe(spell._id);
      // The copy's spell should point to the copy's source
      expect(copy.spells[0].spellSourceId).toBe(copy.spellSources[0]._id);
      expect(copy.spells[0].spellSourceId).not.toBe(source._id);
    });

    it('setLastNpcSpellAttackResult should update the state', () => {
      const store = useNpcStore();

      store.setLastNpcSpellAttackResult('spell-id-1', 'crit-success');
      expect(store.lastNpcSpellAttack).toEqual({
        spellId: 'spell-id-1',
        resultType: 'crit-success',
      });

      store.setLastNpcSpellAttackResult('spell-id-2', undefined);
      expect(store.lastNpcSpellAttack).toEqual({ spellId: 'spell-id-2', resultType: undefined });
    });
  });

  describe('Effects and Calculations', () => {
    it('getNpcModifiedAbilities should calculate base modifiers', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, {
        abilities: {
          strength: 16,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
      });
      store.npcs.push(npc);

      const abilities = store.getNpcModifiedAbilities(npc._id).value;
      expect(abilities.strength.score.value.final).toBe(16);
      expect(abilities.strength.bonus.value.final).toBe(3);
    });

    it('getNpcModifiedAbilities should apply effects', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, {
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
      });

      npc.effects.push({
        _id: 'effect-1',
        label: 'Strength Buff',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'se-1',
            attribute: effectKeys['strength'],
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });

      store.npcs.push(npc);

      const abilities = store.getNpcModifiedAbilities(npc._id).value;
      expect(abilities.strength.score.value.final).toBe(12);
      expect(abilities.strength.bonus.value.final).toBe(1);
    });

    it('getNpcSkillBonus should apply effects', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, {
        abilities: { ...store.getEmptyNpc().abilities, dexterity: 14 },
      });
      npc.effects.push({
        _id: 'eff-skill',
        label: 'Sneaky',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'se-skill',
            attribute: 'stealth-modifier',
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });
      store.npcs = [npc];

      const bonus = store.getNpcSkillBonus(npc._id, 'stealth').value;
      expect(bonus.final).toBe(4);
    });

    it('getNpcSavingThrowBonus should apply ability mod and effects', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, {
        abilities: { ...store.getEmptyNpc().abilities, constitution: 16 },
      });
      npc.effects.push({
        _id: 'eff-save',
        label: 'Protection',
        enabled: true,
        description: '',
        effects: [
          { _id: 'se-save', attribute: 'saving-modifier', operation: 'add', value: 1, formula: '' },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });
      store.npcs = [npc];

      const bonus = store.getNpcSavingThrowBonus(npc._id, 'constitution').value;
      expect(bonus.final).toBe(4);
    });

    it('getNpcSpellCritRange should apply effects', () => {
      const store = useNpcStore();
      const spell = store.getEmptyNpcSpell({ critRange: 20, attackType: 'ranged' });
      const npc = store.getEmptyNpc();
      npc.spells.push(spell);
      npc.effects.push({
        _id: 'eff-crit',
        label: 'Sniper',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'se-crit',
            attribute: 'spell-crit-range',
            operation: 'set-min',
            value: 19,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });
      store.npcs = [npc];

      const range = store.getNpcSpellCritRange(npc._id, spell).value;
      expect(range.final).toBe(19);
    });

    it('getNpcSpellAttackBonus should apply source bonus and effects', () => {
      const store = useNpcStore();
      const source = store.getEmptyNpcSpellSource({ spellAttackBonus: 5 });
      const npc = store.getEmptyNpc();
      npc.spellSources.push(source);
      npc.effects.push({
        _id: 'eff-atk',
        label: 'Focus',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'se-atk',
            attribute: 'spell-attack-modifier',
            operation: 'add',
            value: 1,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });
      store.npcs = [npc];

      const bonus = store.getNpcSpellAttackBonus(npc._id, source._id).value;
      expect(bonus.final).toBe(6);
    });

    it('getNpcSpellDamage should include ability modifier', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, {
        abilities: { ...store.getEmptyNpc().abilities, intelligence: 14 },
      });
      const source = store.getEmptyNpcSpellSource({ ability: 'intelligence' });
      npc.spellSources.push(source);

      const spell = store.getEmptyNpcSpell({
        spellSourceId: source._id,
        damage: [{ damage: '1d10', critDamage: '1d10', type: 'fire', ability: 'spellcasting' }], // Should resolve to Int
      });
      npc.spells.push(spell);
      store.npcs = [npc];

      const pool = store.getNpcSpellDamage(npc._id, spell).value;
      expect(pool.final).toEqual(['1d10', 2]);
    });

    it('getNpcActionDamage should include ability modifier', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, {
        abilities: { ...store.getEmptyNpc().abilities, strength: 16 },
      });
      const action = store.getEmptyNpcAction({
        damage: [{ damage: '1d6', critDamage: '1d6', type: 'slashing', ability: 'strength' }],
      });
      npc.actions.push(action);
      store.npcs = [npc];

      const pool = store.getNpcActionDamage(npc._id, action).value;
      expect(pool.final).toEqual(['1d6', 3]);
    });

    it('getNpcActionBonus should apply attack bonuses', () => {
      const store = useNpcStore();
      const action = store.getEmptyNpcAction({
        name: 'Sword',
        attackBonus: 5,
        attackType: 'melee',
        sourceType: 'weapon',
      });

      const npc = store.getEmptyNpc();
      npc.actions.push(action);

      npc.effects.push({
        _id: 'effect-1',
        label: 'Bless',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'se-1',
            attribute: effectKeys['melee-attack'],
            operation: 'add',
            value: 1,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });

      store.npcs.push(npc);

      const bonus = store.getNpcActionBonus(npc._id, action).value;
      expect(bonus.final).toBe(6);
    });

    it('getNpcActionDamage should apply damage effects', () => {
      const store = useNpcStore();
      const action = store.getEmptyNpcAction({
        name: 'Sword',
        damage: [{ damage: '1d8', type: 'slashing', ability: 'none', critDamage: '1d8' }],
        attackType: 'melee',
        sourceType: 'weapon',
      });

      const npc = store.getEmptyNpc();
      npc.actions.push(action);

      npc.effects.push({
        _id: 'effect-dmg',
        label: 'Rage',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'se-2',
            attribute: effectKeys['melee-damage'],
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });

      store.npcs.push(npc);

      const damage = store.getNpcActionDamage(npc._id, action).value;
      expect(damage.final).toEqual(['1d8', 2]);
    });

    it('getNpcFormulaContext should correctly resolve Hit Dice and Caster Level', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();
      npc.hitPoints.formula = '12d8 + 24';

      const source = store.getEmptyNpcSpellSource({ casterLevel: 5 });

      const contextWithSource = store.getNpcFormulaContext(npc, source);
      expect(contextWithSource.variables?.level).toBe(5);

      const resolvedHD = contextWithSource.resolveHitDice?.(2);
      expect(resolvedHD).toBe('2d8');

      // defaults to 1
      const contextNoSource = store.getNpcFormulaContext(npc, undefined);
      expect(contextNoSource.variables?.level).toBe(1);
    });

    it('getNpcActionsFromEffects should resolve sources, bonuses, and damage types', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();

      const source1 = store.getEmptyNpcSpellSource({
        _id: 'src-1',
        name: 'Primary',
        spellAttackBonus: 5,
        ability: 'intelligence',
      });
      const source2 = store.getEmptyNpcSpellSource({
        _id: 'src-2',
        name: 'Secondary',
        spellAttackBonus: 3,
      });
      npc.spellSources = [source1, source2];

      const parentSpell = store.getEmptyNpcSpell({
        _id: 'spell-parent',
        effectId: 'eff-parent',
        spellSourceId: 'src-2',
      });
      npc.spells = [parentSpell];

      const effectLinked = {
        _id: 'eff-parent',
        label: 'Test Effect Linked',
        enabled: true,
        description: '',
        effects: [],
        actions: [
          // Explicit spell source id
          {
            _id: 'act-explicit',
            name: 'Explicit Source Action',
            group: 'actions',
            isAttack: true,
            attackAbility: 'spellcasting',
            spellSourceId: 'src-1',
            damage: [],
          },
          // Inferred from parent spell
          {
            _id: 'act-inferred',
            name: 'Inferred Source Action',
            group: 'actions',
            isAttack: true,
            attackAbility: 'spellcasting',
            damage: [],
          },
        ],
        resources: [],
        spellSources: [],
        spells: [],
        pickers: [],
      };

      // Fallback to first source
      const effectStandalone = {
        _id: 'eff-standalone',
        label: 'Test Effect Standalone',
        enabled: true,
        description: '',
        effects: [],
        actions: [
          {
            _id: 'act-fallback',
            name: 'Fallback Action',
            group: 'actions',
            isAttack: true,
            attackAbility: 'spellcasting',
            damage: [{ damage: '1d6', type: 'fire', ability: 'spellcasting' }],
          },
          // Should parse to 0
          {
            _id: 'act-formula',
            name: 'Formula Bonus',
            group: 'actions',
            isAttack: true,
            attackBonus: '1d4 + 2',
            damage: [],
          },
        ],
        resources: [],
        spellSources: [],
        spells: [],
        pickers: [],
      };

      npc.effects.push(effectLinked as any);
      npc.effects.push(effectStandalone as any);
      store.npcs = [npc];

      const actions = store.getNpcActionsFromEffects(npc);

      const actExplicit = actions.find((a) => a.name === 'Explicit Source Action');
      const actInferred = actions.find((a) => a.name === 'Inferred Source Action');
      const actFallback = actions.find((a) => a.name === 'Fallback Action');
      const actFormula = actions.find((a) => a.name === 'Formula Bonus');

      expect(actExplicit?.attackBonus).toBe(5); // src-1
      expect(actExplicit?.spellSourceId).toBe('src-1');

      expect(actInferred?.attackBonus).toBe(3); // src-2 via parent spell
      expect(actInferred?.spellSourceId).toBe('src-2');

      expect(actFallback?.attackBonus).toBe(5); // Defaults to src-1 (index 0)
      expect(actFallback?.damage[0].ability).toBe('intelligence'); // Resolved from src-1

      expect(actFormula?.attackBonus).toBe(0);
    });

    it('should handle pickers with conditional requirements', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();
      store.npcs = [npc];

      const effect = {
        _id: 'eff-complex-conditional',
        enabled: true,
        toggleable: true,
        removable: false,
        label: 'Dark Sacrament Blessing',
        pickers: [
          {
            label: 'Dark Sacrament Blessing',
            value: '0',
            options: [
              { label: 'Unassailable', value: '0' },
              { label: 'Unbreakable', value: '1' },
              { label: 'Unerring', value: '2' },
            ],
          },
        ],
        effects: [
          {
            attribute: 'saving-action-die',
            operation: 'set',
            value: 1,
            required: ['$picker:0==0'],
          },
          {
            attribute: 'weapon-damage-roll-modifier',
            operation: 'add-formula',
            formula: '1d4',
            required: ['$picker:0==1'],
          },
          {
            attribute: 'proficiency-bonus',
            operation: 'add',
            value: 2,
            required: ['$picker:0==2'],
          },
        ],
      };

      npc.effects.push(effect as any);

      // Picker = 0
      expect(store.getNpcModifiedValue(npc._id, 0, 'saving-action-die').value.final).toBe(1);
      expect(store.getNpcModifiedValue(npc._id, 0, 'proficiency-bonus').value.final).toBe(0);
      

      // Picker = 2
      effect.pickers[0].value = '2';


      expect(store.getNpcModifiedValue(npc._id, 0, 'saving-action-die').value.final).toBe(0);
      expect(store.getNpcModifiedValue(npc._id, 0, 'proficiency-bonus').value.final).toBe(2);

    });

    it('should handle pickers with dynamic formulas', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();
      store.npcs = [npc];

      const effect = {
        _id: 'eff-dynamic-formula',
        label: 'Enspelled Armament',
        enabled: true,
        toggleable: true,
        removable: false,
        effects: [
          {
            attribute: 'weapon-damage-roll-modifier',
            operation: 'add-formula',
            formula: '$picker:0',
          },
        ],
        pickers: [
          {
            label: 'Enspelled Armament Level',
            value: '1d4',
            options: [
              { label: 'Level 2 (+1d4)', value: '1d4' },
              { label: 'Level 3 (+2d4)', value: '2d4' },
              { label: 'Level 4 (+3d4)', value: '3d4' },
            ],
          },
        ],
      };

      npc.effects.push(effect as any);

      const getRollBonuses = () => {
        return EffectsCalculator.calculateModifiedRollBonuses(
          npc.effects,
          'weapon-damage-roll-modifier',
          store.isNpcEffectSingleActive,
        );
      };

      // Picker = 1d4
      let bonuses = getRollBonuses();
      expect(bonuses).toHaveLength(1);
      expect(bonuses[0].label).toContain('1d4');
      expect(bonuses[0].count).toBe(1);
      expect(bonuses[0].sides).toBe(4);

      // Change Picker to 3d4
      effect.pickers[0].value = '3d4';

      bonuses = getRollBonuses();
      expect(bonuses).toHaveLength(1);
      expect(bonuses[0].label).toContain('3d4');
      expect(bonuses[0].count).toBe(3);
      expect(bonuses[0].sides).toBe(4);
    });

    it('getNpcSpellAttackBonus should apply specific attack-type keys', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();
      const source = store.getEmptyNpcSpellSource();
      npc.spellSources = [source];

      npc.effects.push({
        _id: 'eff-melee',
        label: 'Melee Buff',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'mod-1',
            attribute: 'melee-spell-attack-modifier',
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });
      store.npcs = [npc];

      const spell = store.getEmptyNpcSpell({
        spellSourceId: source._id,
        attackType: 'melee',
        isAttack: true,
      });

      const bonus = store.getNpcSpellAttackBonus(npc._id, source._id, spell).value;

      expect(bonus.final).toBe(2);
    });

    it('getNpcActionCritRange should apply specific crit keys', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();

      const action = store.getEmptyNpcAction({
        attackType: 'melee',
        sourceType: 'weapon',
        critRange: 20,
      });

      npc.effects.push({
        _id: 'eff-crit',
        label: 'Keen',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'mod-1',
            attribute: 'melee-weapon-crit-range',
            operation: 'set-min',
            value: 19,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      });
      store.npcs = [npc];

      const crit = store.getNpcActionCritRange(npc._id, action).value;
      expect(crit.final).toBe(19);
    });

    it('getNpcActionDamage should correctly resolve source context for formulas', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();

      const source = store.getEmptyNpcSpellSource({
        _id: 'src-10',
        casterLevel: 10,
      });
      npc.spellSources = [source];

      const actionExplicit = store.getEmptyNpcAction({
        spellSourceId: 'src-10',
        damage: [{ damage: '@{level}',critDamage: '@{level}', type: 'force', ability: 'none' }],
      });

      const parentSpell = store.getEmptyNpcSpell({
        _id: 'spell-linked',
        spellSourceId: 'src-10',
        effectId: 'eff-linked',
      });
      npc.spells = [parentSpell];

      const actionLinked = store.getEmptyNpcAction({
        damage: [{ damage: '@{level}',critDamage: '@{level}', type: 'force', ability: 'none' }],
      });
      (actionLinked as any).isFromEffect = true;
      (actionLinked as any).sourceEffectId = 'eff-linked';

      npc.actions = [actionExplicit, actionLinked];
      store.npcs = [npc];

      const poolExplicit = store.getNpcActionDamage(npc._id, actionExplicit).value;
      expect(poolExplicit.final[0]).toBe('10');

      const poolLinked = store.getNpcActionDamage(npc._id, actionLinked).value;
      expect(poolLinked.final[0]).toBe('10');
    });
  });

  describe('sendSpellInfoToChat', () => {
    it('should send spell info with calculated DC', async () => {
      const store = useNpcStore();
      const { dispatchRef } = await import('@/relay/relay');
      const postSpy = vi.spyOn(dispatchRef.value, 'post');

      const source = store.getEmptyNpcSpellSource({
        _id: 'src-1',
        name: 'Archmage',
        spellSaveDC: 15,
      });

      const spell = store.getEmptyNpcSpell({
        _id: 'spell-1',
        name: 'Fireball',
        spellSourceId: 'src-1',
        saving: 'dexterity',
        description: { default: 'Boom' },
      });

      const npc = store.getEmptyNpc();
      npc._id = 'npc-1';
      npc.name = 'Test Caster';
      npc.spellSources = [source];
      npc.spells = [spell];

      store.npcs = [npc];

      const t = (k: string) => k;

      await store.sendSpellInfoToChat('npc-1', 'spell-1', t);

      expect(postSpy).toHaveBeenCalled();
      const callArg = postSpy.mock.lastCall?.[0] as any;

      // Verify content
      const content = JSON.parse(callArg.content as string);
      expect(content.parameters.title).toBe('Fireball');
      expect(content.parameters.characterName).toBe('Test Caster');
      expect(content.parameters.properties['titles.saving-throw']).toContain('15');
    });

    it('should handle spell without source', async () => {
      const store = useNpcStore();
      const { dispatchRef } = await import('@/relay/relay');
      const postSpy = vi.spyOn(dispatchRef.value, 'post');

      const spell = store.getEmptyNpcSpell({
        _id: 'spell-2',
        name: 'Orphan Spell',
        spellSourceId: 'missing-source',
      });

      const npc = store.getEmptyNpc();
      npc._id = 'npc-1';
      npc.spells = [spell];
      store.npcs = [npc];

      await store.sendSpellInfoToChat('npc-1', 'spell-2', (k) => k);

      expect(postSpy).toHaveBeenCalled();
      const content = JSON.parse((postSpy.mock.lastCall?.[0] as any).content);

      expect(content.parameters.title).toBe('Orphan Spell');
    });
  });

  describe('sendActionInfoToChat', () => {
    it('should send action info to chat', async () => {
      const store = useNpcStore();
      const { dispatchRef } = await import('@/relay/relay');
      const postSpy = vi.spyOn(dispatchRef.value, 'post');

      const action = store.getEmptyNpcAction({ name: 'Legendary Smash', group: 'legendary' });
      const npc = store.getEmptyNpc();
      npc._id = 'npc-chat';
      npc.name = 'Chatter';
      npc.legendaryActions.actions.push(action);
      store.npcs = [npc];

      await store.sendActionInfoToChat('npc-chat', action._id, (k) => k);

      expect(postSpy).toHaveBeenCalled();
      const content = JSON.parse((postSpy.mock.lastCall?.[0] as any).content);
      expect(content.parameters.title).toBe('Legendary Smash');
      expect(content.parameters.sourceType).toBe('action');
    });
  });

  describe('toggleNpcEffect check', () => {
    it('should not toggle if effect is not toggleable', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();
      npc.effects.push({
        _id: 'static-eff',
        label: 'Static',
        enabled: true,
        toggleable: false,
        effects: [],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
        description: '',
      });
      store.npcs = [npc];

      store.toggleNpcEffect(npc._id, 'static-eff');
      expect(npc.effects[0].enabled).toBe(true); // Should remain true
    });

    it('toggleNpcEffect should toggle enabled state when toggleable is true', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc();
      npc.effects.push({
        _id: 'eff-1',
        label: 'Test',
        enabled: false,
        toggleable: true,
        effects: [],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
        description: '',
      });
      store.npcs = [npc];

      store.toggleNpcEffect(npc._id, 'eff-1');
      expect(npc.effects[0].enabled).toBe(true);

      store.toggleNpcEffect(npc._id, 'eff-1');
      expect(npc.effects[0].enabled).toBe(false);
    });
  });

  describe('Hydration', () => {
    it('should dehydrate NPC data correctly', () => {
      const store = useNpcStore();
      const npc = store.getEmptyNpc(false, false, { name: 'Save Me' });
      store.npcs.push(npc);

      const dehydrated = store.dehydrate();
      expect(dehydrated.npcs.npcs).toBeDefined();
      expect(Object.values(dehydrated.npcs.npcs)[0].name).toBe('Save Me');
    });

    it('should hydrate NPC data correctly', () => {
      const store = useNpcStore();
      const npcData = store.getEmptyNpc(false, false, { name: 'Load Me' });
      const payload = {
        npcs: {
          isNpc: true,
          npcs: { [npcData._id]: { ...npcData, arrayPosition: 0 } },
          isEditMode: false,
        },
      };

      store.hydrate(payload);

      expect(store.npcs).toHaveLength(1);
      expect(store.npcs[0].name).toBe('Load Me');
      expect(store.isNpc).toBe(true);
      expect(store.isEditMode).toBe(false);
    });

    it('should handle complex nested structures during hydration and dehydration', () => {
      const store = useNpcStore();

      const complexNpc = store.getEmptyNpc(false, false, { name: 'Complex NPC' });

      const action = store.getEmptyNpcAction({
        name: 'Slash',
        damage: [{ damage: '1d6', type: 'slashing', ability: 'strength', critDamage: '1d6' }],
      });
      complexNpc.actions.push(action);

      const source = store.getEmptyNpcSpellSource({
        name: 'Wizardry',
        spellSlots: { 1: 4, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      });
      complexNpc.spellSources.push(source);

      const spell = store.getEmptyNpcSpell({
        name: 'Fireball',
        spellSourceId: source._id,
        components: ['verbal', 'somatic'],
        damage: [{ damage: '8d6', critDamage: '8d6', type: 'fire', ability: 'none' }],
        upcast: [{ level: 4, damage: [{ damage: '1d6', critDamage: '1d6', type: 'fire', ability: 'none' }] } as any],
      });
      complexNpc.spells.push(spell);

      const effect = {
        _id: 'eff-1',
        label: 'Buff',
        enabled: true,
        description: '',
        effects: [
          {
            _id: 'sub-1',
            attribute: 'strength-score',
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
        actions: [],
        resources: [],
        spells: [],
        spellSources: [],
        pickers: [],
      };
      complexNpc.effects.push(effect as any);

      store.npcs = [complexNpc];

      const dehydrated = store.dehydrate();
      const npcData = Object.values(dehydrated.npcs.npcs)[0];

      // Verify nested arrays became objects
      expect((npcData.actions as any)[action._id].damage).toBeDefined();
      expect((npcData.actions as any)[action._id].damage['0'].damage).toBe('1d6');

      expect((npcData.spells as any)[spell._id].components['0']).toBe('verbal');
      expect((npcData.spells as any)[spell._id].upcast['0'].level).toBe(4);

      expect((npcData.effects as any)[effect._id].effects['sub-1'].value).toBe(2);
      const newStore = useNpcStore();
      newStore.hydrate(dehydrated);
      const hydratedNpc = newStore.npcs[0];

      // Verify arrays are restored
      expect(hydratedNpc.actions[0].damage[0].type).toBe('slashing');
      expect(hydratedNpc.spells[0].components).toContain('verbal');
      expect(hydratedNpc.spells[0].upcast[0].level).toBe(4);
      expect(hydratedNpc.effects[0].effects[0].attribute).toBe('strength-score');

      expect(hydratedNpc.spellSources[0].spellSlots[1]).toBe(4);
      expect(hydratedNpc.spellSources[0].spellSlots[9]).toBe(0);
    });

    it('should handle complex nested effect structures during hydration and dehydration', () => {
      const store = useNpcStore();

      const complexNpc = store.getEmptyNpc(false, false, { name: 'Complex NPC' });

      const effect = {
        _id: 'eff-1',
        label: 'Complex Buff',
        enabled: true,
        description: 'Test Description',
        required: ['$picker:0==1'],
        effects: [
          {
            _id: 'sub-1',
            attribute: 'strength-score',
            operation: 'add',
            value: 2,
            formula: '',
            required: ['$picker:0==1'],
          },
        ],
        actions: [
          {
            _id: 'act-1',
            name: 'Effect Action',
            group: 'actions',
            isAttack: true,
            damage: [{ damage: '1d6', type: 'slashing', ability: 'none', critDamage: '' }],
            required: ['equipped'],
          },
        ],
        resources: [
          {
            _id: 'res-1',
            name: 'Effect Resource',
            count: 1,
            max: '3',
            refreshOnShortRest: 'none',
            refreshOnLongRest: 'all',
            required: ['attuned'],
          },
        ],
        spellSources: [
          {
            _id: 'src-1',
            name: 'Effect Source',
            type: 'ability',
            spellAttackBonus: 5,
            spellSaveDC: 15,
            spellSlots: {},
            spellSlotsUsed: {},
            required: ['$picker:0==2'],
          },
        ],
        spells: [
          {
            _id: 'spl-1',
            name: 'Effect Spell',
            level: 1,
            components: ['verbal'],
            damage: [{ damage: '2d8', type: 'radiant' }],
            required: ['equipped'],
          },
        ],
        pickers: [
          {
            label: 'Mode',
            options: [
              { label: 'Off', value: '0' },
              { label: 'On', value: '1' },
            ],
          },
        ],
      };

      complexNpc.effects.push(effect as any);
      store.npcs = [complexNpc];

      const dehydrated = store.dehydrate();
      const npcData = Object.values(dehydrated.npcs.npcs)[0];
      const effData = (npcData.effects as any)['eff-1'];

      // Check nested objects
      expect(effData.required['0']).toBe('$picker:0==1');

      // Actions
      expect(effData.actions['act-1'].name).toBe('Effect Action');
      expect(effData.actions['act-1'].damage['0'].damage).toBe('1d6');
      expect(effData.actions['act-1'].required['0']).toBe('equipped');

      // Resources
      expect(effData.resources['res-1'].name).toBe('Effect Resource');
      expect(effData.resources['res-1'].required['0']).toBe('attuned');

      // Spell Sources
      expect(effData.spellSources['src-1'].name).toBe('Effect Source');
      expect(effData.spellSources['src-1'].required['0']).toBe('$picker:0==2');

      // Spells
      expect(effData.spells['spl-1'].name).toBe('Effect Spell');
      expect(effData.spells['spl-1'].components['0']).toBe('verbal');
      expect(effData.spells['spl-1'].required['0']).toBe('equipped');

      // Pickers
      expect(effData.pickers['0'].label).toBe('Mode');
      expect(effData.pickers['0'].options['1'].label).toBe('On');

      const newStore = useNpcStore();
      newStore.hydrate(dehydrated);
      const hydratedNpc = newStore.npcs[0];
      const hydratedEffect = hydratedNpc.effects[0];

      expect(hydratedEffect.required?.[0]).toBe('$picker:0==1');

      // Actions
      expect(hydratedEffect.actions?.[0].name).toBe('Effect Action');
      expect(hydratedEffect.actions?.[0].damage?.[0].damage).toBe('1d6');
      expect(hydratedEffect.actions?.[0].required?.[0]).toBe('equipped');

      // Resources
      expect(hydratedEffect.resources?.[0].name).toBe('Effect Resource');
      expect(hydratedEffect.resources?.[0].required?.[0]).toBe('attuned');

      // Spell Sources
      expect(hydratedEffect.spellSources?.[0].name).toBe('Effect Source');
      expect(hydratedEffect.spellSources?.[0].required?.[0]).toBe('$picker:0==2');

      // Spells
      expect(hydratedEffect.spells?.[0].name).toBe('Effect Spell');
      expect(hydratedEffect.spells?.[0].components?.[0]).toBe('verbal');
      expect(hydratedEffect.spells?.[0].required?.[0]).toBe('equipped');

      // Pickers
      expect(hydratedEffect.pickers?.[0].label).toBe('Mode');
      expect(hydratedEffect.pickers?.[0].options?.[1].label).toBe('On');
    });

    it('should handle undefined/empty effect arrays gracefully during hydration', () => {
      const store = useNpcStore();
      const payload = {
        npcs: {
          isNpc: true,
          npcs: {
            'npc-1': {
              _id: 'npc-1',
              name: 'Empty Effect NPC',
              arrayPosition: 0,
              effects: {
                'eff-1': {
                  _id: 'eff-1',
                  label: 'Empty',
                  enabled: true,
                  arrayPosition: 0,
                },
              },
            },
          },
        },
      };

      store.hydrate(payload as any);
      const effect = store.npcs[0].effects[0];

      expect(effect.actions).toEqual([]);
      expect(effect.resources).toEqual([]);
      expect(effect.spellSources).toEqual([]);
      expect(effect.spells).toEqual([]);
      expect(effect.pickers).toEqual([]);
      expect(effect.required).toEqual([]);
      expect(effect.effects).toEqual([]);
    });

    it('should fallback to default NPC if hydrated list is empty', () => {
      const store = useNpcStore();

      store.hydrate({
        npcs: {
          isNpc: true,
          npcs: {},
          isEditMode: false,
        },
      });

      expect(store.npcs).toHaveLength(1);
      expect(store.npcs[0].isDefault).toBe(true);
    });

    it('should fallback to default NPC if payload is missing', () => {
      const store = useNpcStore();

      store.hydrate(null as any);

      expect(store.npcs).toHaveLength(1);
      expect(store.npcs[0].isDefault).toBe(true);
    });
  });
});
