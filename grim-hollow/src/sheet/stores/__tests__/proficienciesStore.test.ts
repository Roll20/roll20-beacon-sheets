import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProficienciesStore, proficiencyLevels, proficiencyLevelsBase } from '../proficiencies/proficienciesStore';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useProgressionStore } from '../progression/progressionStore';
import { effectKeys } from '@/effects.config';
import { v4 as uuidv4 } from 'uuid';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('proficienciesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default ranked proficiencies (Skills, Saves, Init)', () => {
      const store = useProficienciesStore();
      expect(store.ranked).toBeDefined();
      expect(store.ranked.length).toBeGreaterThanOrEqual(30); 
    });

    it('should map initiative and death-saving correctly', () => {
      const store = useProficienciesStore();
      expect(store.initiative.label).toBe('initiative');
      expect(store.deathSaving.label).toBe('death-saving');
    });
  });

  describe('Add/Update/Delete Operations', () => {
    it('should update proficiency level', () => {
      const store = useProficienciesStore();
      const stealth = store.getProficiencyByLabel('stealth')!;
      
      store.updateRanked(stealth._id, { level: 1 }); 
      
      const updated = store.getProficiencyByLabel('stealth')!;
      expect(updated.level).toBe(1);
    });

    it('should add a custom tool proficiency', () => {
      const store = useProficienciesStore();
      const initialLength = store.ranked.length;

      store.updateRanked(undefined, { 
        label: 'Thieves Tools', 
        ability: 'dexterity', 
        group: 'tools' 
      });

      expect(store.ranked.length).toBe(initialLength + 1);
      const tool = store.getProficiencyByLabel('Thieves Tools');
      expect(tool).toBeDefined();
    });

    it('should remove a ranked proficiency', () => {
      const store = useProficienciesStore();
      store.updateRanked(undefined, { label: 'Temp Tool', ability: 'wisdom', group: 'tools' });
      const tool = store.getProficiencyByLabel('Temp Tool')!;

      store.removeRanked(tool._id);

      expect(store.getProficiencyByLabel('Temp Tool')).toBeUndefined();
    });
  });

  describe('Calculations', () => {
    it('should calculate skill modifier (Ability + PB + Rank + Effects)', () => {
      const profStore = useProficienciesStore();
      const abilitiesStore = useAbilitiesStore();
      const progressionStore = useProgressionStore();
      const effectsStore = useEffectsStore();

      const dex = abilitiesStore.abilities.find(a => a.label === 'dexterity')!;
      abilitiesStore.update(dex._id, { score: 14 });
      progressionStore.classes = [{ level: 5 } as any];

      const stealth = profStore.getProficiencyByLabel('stealth')!;

      // Untrained
      expect(profStore.getProficiencyModifier(stealth).value.final).toBe(2);

      // Proficient
      profStore.updateRanked(stealth._id, { level: 1 });
      expect(profStore.getProficiencyModifier(stealth).value.final).toBe(5);

      // Expert
      profStore.updateRanked(stealth._id, { level: 2 });
      expect(profStore.getProficiencyModifier(stealth).value.final).toBe(8);

      // Effect: +2 Stealth
      effectsStore.addEffect({
        label: 'Boots',
        enabled: true,
        effects: [{
          _id: 'eff1',
          attribute: effectKeys['stealth'],
          operation: 'add',
          value: 2,
          formula: ''
        }]
      });

      expect(profStore.getProficiencyModifier(stealth).value.final).toBe(10);
    });

    it('should calculate Passive Perception', () => {
      const profStore = useProficienciesStore();
      const abilitiesStore = useAbilitiesStore();

      const wis = abilitiesStore.abilities.find(a => a.label === 'wisdom')!;
      abilitiesStore.update(wis._id, { score: 12 }); 

      const perception = profStore.getProficiencyByLabel('perception')!;
      
      expect(profStore.getPassiveProficiency(perception).value.final).toBe(11);
    });
  });

  describe('Edge Cases', () => {
    it('getPassiveProficiency returns 0 if proficiency is missing', () => {
      const store = useProficienciesStore();
      // @ts-ignore
      const result = store.getPassiveProficiency(undefined);
      expect(result.value.final).toBe(0);
    });

    it('getProficiencyLevelKey returns "untrained" for unknown values', () => {
      const store = useProficienciesStore();
      // @ts-ignore
      const result = store.getProficiencyLevelKey(99);
      expect(result).toBe('untrained');
    });

    it('getModifiedProficiencyLevel includes group-specific effect keys (Savings)', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();
      
      const saving = store.ranked.find(r => r.group === 'savings')!;
      
      effectsStore.addEffect({
        label: 'Global Save Proficiency',
        enabled: true,
        effects: [{
          _id: 'eff-save',
          attribute: effectKeys['saving-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      const level = store.getModifiedProficiencyLevel(saving);
      expect(level.value.final).toBe(1);
    });

    it('getModifiedProficiencyLevel includes group-specific effect keys (Tools)', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();
      
      store.updateRanked(undefined, { label: 'Hammer', ability: 'strength', group: 'tools' });
      const tool = store.getProficiencyByLabel('Hammer')!;

      effectsStore.addEffect({
        label: 'Global Tool Proficiency',
        enabled: true,
        effects: [{
          _id: 'eff-tool',
          attribute: effectKeys['tools-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      const level = store.getModifiedProficiencyLevel(tool);
      expect(level.value.final).toBe(1);
    });

    it('getProficiencyModifier returns 0 modifiers if ability not found', () => {
      const store = useProficienciesStore();
      store.ranked.push({
        _id: 'bad-id',
        label: 'Broken Skill',
        ability: 'invalid-ability' as any,
        group: 'default-skills',
        level: 0
      });
      
      const broken = store.getProficiencyByLabel('Broken Skill')!;
      const mod = store.getProficiencyModifier(broken);
      
      expect(mod.value.final).toBe(0);
      expect(mod.value.modifiers).toHaveLength(0);
    });

    it('getProficiencyModifier includes group-specific modifier keys (Savings)', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();
      const dexSave = store.ranked.find(r => r.label === 'dexterity-saving')!;

      effectsStore.addEffect({
        label: 'Blessing',
        enabled: true,
        effects: [{
          _id: 'e1',
          attribute: effectKeys['saving'],
          operation: 'add',
          value: 2,
          formula: ''
        }]
      });

      const mod = store.getProficiencyModifier(dexSave);
      expect(mod.value.final).toBe(2);
    });

    it('getProficiencyModifier includes group-specific modifier keys (Tools)', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();
      
      store.updateRanked(undefined, { label: 'Wrench', ability: 'strength', group: 'tools' });
      const tool = store.getProficiencyByLabel('Wrench')!;

      effectsStore.addEffect({
        label: 'Engineering',
        enabled: true,
        effects: [{
          _id: 'e1',
          attribute: effectKeys['tools'],
          operation: 'add',
          value: 3,
          formula: ''
        }]
      });

      const mod = store.getProficiencyModifier(tool);
      expect(mod.value.final).toBe(3);
    });

    it('getProficiencyModifier includes Initiative specific keys', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();
      
      effectsStore.addEffect({
        label: 'Jack of All Trades',
        enabled: true,
        effects: [{
          _id: 'e1',
          attribute: effectKeys['check'],
          operation: 'add',
          value: 1,
          formula: ''
        }]
      });

      effectsStore.addEffect({
        label: 'Agile',
        enabled: true,
        effects: [{
          _id: 'e2',
          attribute: effectKeys['dexterity-check'],
          operation: 'add',
          value: 2,
          formula: ''
        }]
      });

      const mod = store.getProficiencyModifier(store.initiative);
      expect(mod.value.final).toBe(3);
    });

    it('getProficiencyModifier includes Death Saving specific keys', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();
      
      effectsStore.addEffect({
        label: 'Lucky',
        enabled: true,
        effects: [{
          _id: 'e1',
          attribute: effectKeys['saving'],
          operation: 'add',
          value: 1,
          formula: ''
        }]
      });

      

      const mod = store.getProficiencyModifier(store.deathSaving);
      expect(mod.value.final).toBe(1);
    });

    it('updateUnranked updates an unranked proficiency', () => {
      const store = useProficienciesStore();
      const id = uuidv4();
      
      store.unranked.push({
        _id: id,
        label: 'Old Label',
        group: 'languages'
      });

      store.updateUnranked(id, { label: 'New Label' });

      const updated = store.unranked.find(u => u._id === id);
      expect(updated?.label).toBe('New Label');
    });
  });

  describe('Hydration & Dehydration', () => {
    it('should dehydrate state correctly', () => {
      const store = useProficienciesStore();
      const acrobatics = store.getProficiencyByLabel('acrobatics')!;
      store.updateRanked(acrobatics._id, { level: 1 });

      const dehydrated = store.dehydrate();

      expect(dehydrated.ranked).toBeDefined();
      const storedItem = Object.values(dehydrated.ranked).find((i: any) => i.label === 'acrobatics');
      expect(storedItem).toBeDefined();
      expect(storedItem?.level).toBe(1);
    });

    it('should replace state on hydrate', () => {
      const store = useProficienciesStore();
      
      const payload = {
        ranked: {
          'id-1': {
            _id: 'id-1',
            label: 'Custom Skill',
            ability: 'strength',
            level: 1,
            group: 'default-skills',
            arrayPosition: 0 
          } as any
        },
        unranked: {}
      };

      store.hydrate(payload);

      expect(store.ranked).toHaveLength(1);
      expect(store.ranked[0].label).toBe('Custom Skill');
    });
  });

  describe('Tool Proficiencies from Effects', () => {
    it('should add a known tool proficiency from an effect', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Background: Criminal',
        enabled: true,
        effects: [{
          _id: 'eff-thieves',
          attribute: effectKeys['thieves-tools-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      const tools = store.combinedTools;
      const thievesTools = tools.find(t => t.label === 'titles.proficiency-type.tool-proficiencies.thieves-tools');
      expect(thievesTools).toBeDefined();
      expect(thievesTools!.isFromEffect).toBe(true);
      expect(thievesTools!.sourceEffectLabel).toBe('Background: Criminal');
      expect(thievesTools!.toolKey).toBe('thieves-tools');
    });

    it('should not duplicate when user already has a matching tool', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();

      store.updateRanked(undefined, {
        label: 'titles.proficiency-type.tool-proficiencies.thieves-tools',
        ability: 'dexterity',
        group: 'tools'
      });

      effectsStore.addEffect({
        label: 'Background',
        enabled: true,
        effects: [{
          _id: 'eff-thieves',
          attribute: effectKeys['thieves-tools-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      const tools = store.combinedTools;
      const thievesMatches = tools.filter(t =>
        t.label.toLowerCase() === 'titles.proficiency-type.tool-proficiencies.thieves-tools'
      );
      expect(thievesMatches).toHaveLength(1);
      expect(thievesMatches[0].toolKey).toBe('thieves-tools');
    });

    it('should modify proficiency level of an effect-sourced tool', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Feature',
        enabled: true,
        effects: [{
          _id: 'eff-tools',
          attribute: effectKeys['alchemist-supplies-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      const tools = store.combinedTools;
      const alchemist = tools.find(t => t.toolKey === 'alchemist-supplies')!;
      expect(alchemist).toBeDefined();

      const level = store.getModifiedProficiencyLevel(alchemist);
      expect(level.value.final).toBe(1);
    });

    it('should remove effect-sourced tool when effect is removed', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();

      const effect = effectsStore.addEffect({
        label: 'Background',
        enabled: true,
        effects: [{
          _id: 'eff-thieves',
          attribute: effectKeys['thieves-tools-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      expect(store.combinedTools.some(t => t.toolKey === 'thieves-tools')).toBe(true);

      effectsStore.remove(effect._id);

      expect(store.combinedTools.some(t => t.toolKey === 'thieves-tools')).toBe(false);
    });

    it('should apply global tools-proficiency to effect-sourced tools', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Per-Tool',
        enabled: true,
        effects: [
          {
            _id: 'eff-thieves',
            attribute: effectKeys['thieves-tools-proficiency'],
            operation: 'set',
            value: 1,
            formula: ''
          },
        ]
      });

      effectsStore.addEffect({
        label: 'Tool Expert',
        enabled: true,
        effects: [
          {
            _id: 'eff-global',
            attribute: effectKeys['tools-proficiency'],
            operation: 'add',
            value: 1,
            formula: ''
          }
        ]
      });

      const tools = store.combinedTools;
      const thievesTools = tools.find(t => t.toolKey === 'thieves-tools')!;

      const level = store.getModifiedProficiencyLevel(thievesTools);
      expect(level.value.final).toBe(1);

      store.updateRanked(undefined, { label: 'Wrench', ability: 'strength', group: 'tools' });
      const wrench = store.combinedTools.find(t => t.label === 'Wrench')!;
      const wrenchLevel = store.getModifiedProficiencyLevel(wrench);
      expect(wrenchLevel.value.final).toBe(0);
    });

    it('should allow user to edit an effect-sourced tool', () => {
      const store = useProficienciesStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Background',
        enabled: true,
        effects: [{
          _id: 'eff-smith',
          attribute: effectKeys['smith-tools-proficiency'],
          operation: 'set',
          value: 1,
          formula: ''
        }]
      });

      let tools = store.combinedTools;
      const smithTool = tools.find(t => t.toolKey === 'smith-tools')!;
      expect(smithTool.isFromEffect).toBe(true);

      store.updateRanked(undefined, {
        label: smithTool.label,
        ability: 'intelligence',
        group: 'tools',
        level: 2 
      });

      tools = store.combinedTools;
      const smithMatches = tools.filter(t =>
        t.label.toLowerCase() === smithTool.label.toLowerCase()
      );
      expect(smithMatches).toHaveLength(1);
    });
  });
});