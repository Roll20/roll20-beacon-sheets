import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useActionsStore } from '../actions/actionsStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import { useProgressionStore } from '../progression/progressionStore';
import { useTagsStore } from '../tags/tagsStore';
import { useSpellsStore } from '../spells/spellsStore';
import { effectKeys } from '@/effects.config';
import { dispatchRef } from '@/relay/relay';
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: { post: vi.fn() } },
  initValues: { character: { id: 'test-char-id' } },
}));

describe('actionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Store Changes', () => {
    it('should create an action with default values', () => {
      const store = useActionsStore();
      const action = store.getEmptyAction({});

      expect(action).toMatchObject({
        name: '',
        group: 'actions',
        isAttack: false,
        attackType: 'melee',
      });
      expect(action._id).toBeTruthy();
      expect(action.tagId).toBeTruthy();
    });

    it('should add a new action to userActions', () => {
      const store = useActionsStore();
      const action = store.addAction({ name: 'New Action' });

      expect(store.userActions).toHaveLength(1);
      expect(store.userActions[0].name).toBe('New Action');
    });

    it('should update an existing action', () => {
      const store = useActionsStore();
      const action = store.addAction({ name: 'Original' });

      store.update({ _id: action._id, name: 'Updated' });

      expect(store.userActions[0].name).toBe('Updated');
    });

    it('should remove an action and its associated tag', () => {
      const store = useActionsStore();
      const tagsStore = useTagsStore();

      const action = store.addAction({ name: 'To Remove' });
      const tagId = action.tagId;

      expect(tagsStore.getExistingOrCreate(tagId)).toBeDefined();

      store.remove(action);

      expect(store.userActions).toHaveLength(0);
      expect(tagsStore.tagGroups.find((g) => g._id === tagId)).toBeUndefined();
    });

    it('should create a new action if updating a non-existent ID', () => {
      const store = useActionsStore();
      store.update({ _id: 'ghost-id', name: 'Created from Ghost' });

      expect(store.userActions).toHaveLength(1);
      expect(store.userActions[0].name).toBe('Created from Ghost');
      expect(store.userActions[0]._id).toBe('ghost-id');
    });

    it('should get existing action or create if missing', () => {
      const store = useActionsStore();
      const existing = store.addAction({ name: 'Exists' });

      const result1 = store.getExistingOrCreate({ _id: existing._id });
      expect(result1._id).toBe(existing._id);

      const result2 = store.getExistingOrCreate({ _id: 'new-one', name: 'Created' });
      expect(store.userActions).toHaveLength(2);
      expect(result2.name).toBe('Created');
    });

    it('should store last attack result', () => {
      const store = useActionsStore();
      store.setLastAttackResult('act-1', 'crit-fail');
      expect(store.lastAttack).toEqual({ actionId: 'act-1', resultType: 'crit-fail' });
    });

    it('should retrieve tags for a given action tagId', () => {
      const store = useActionsStore();
      const tagsStore = useTagsStore();

      const action = store.addAction({ name: 'Tagged Action' });
      tagsStore.update({ _id: action.tagId, tags: [{ _id: 't1', text: 'Fire' }] });

      const tags = store.getActionTags(action.tagId);
      expect(tags).toHaveLength(1);
      expect(tags[0].text).toBe('Fire');
    });
  });

  describe('Calculations (Bonus, Damage, DC)', () => {
    it('should calculate Attack Bonus (Ability + Proficiency + Flat)', () => {
      const actionsStore = useActionsStore();
      const abilitiesStore = useAbilitiesStore();
      const progressionStore = useProgressionStore();

      progressionStore.classes = [{ level: 5 } as any];
      const str = abilitiesStore.abilities.find((a) => a.label === 'strength')!;
      str.score = 18;

      const action = actionsStore.addAction({
        name: 'Greatsword',
        isAttack: true,
        attackAbility: 'strength',
        attackProficiency: 1,
        attackBonus: '2',
      });

      const bonus = actionsStore.getActionBonus(action._id);
      expect(bonus.value.final).toBe(9);
    });

    it('should calculate Damage (Dice + Ability)', () => {
      const actionsStore = useActionsStore();
      const abilitiesStore = useAbilitiesStore();

      const dex = abilitiesStore.abilities.find((a) => a.label === 'dexterity')!;
      dex.score = 16;

      const action = actionsStore.addAction({
        name: 'Shortbow',
        isAttack: true,
        attackType: 'ranged',
        damage: [{ damage: '1d6', type: 'piercing', ability: 'dexterity', critDamage: '1d6' }],
      });

      const damage = actionsStore.getActionDamage(action._id);

      expect(damage.value.final).toEqual(['1d6', 3]);
    });

    it('should calculate DC based on formula', () => {
      const actionsStore = useActionsStore();
      const abilitiesStore = useAbilitiesStore();
      const progressionStore = useProgressionStore();

      const int = abilitiesStore.abilities.find((a) => a.label === 'intelligence')!;
      int.score = 14;
      progressionStore.classes = [{ level: 1 } as any];

      const action = actionsStore.addAction({
        name: 'Save Ability',
        saving: 'intelligence',
        savingDc: '8 + @{intelligence-modifier} + @{pb}',
      });

      const dc = actionsStore.getActionDC(action._id);
      expect(dc.value.final).toBe(12);
    });

    it('should use Flat spell source for Bonus calculation', () => {
      const actionsStore = useActionsStore();
      const spellsStore = useSpellsStore();

      spellsStore.updateSource({ type: 'flat', flat: 5, name: 'Wand' });
      const sourceId = spellsStore.userSources[0]._id;

      const action = actionsStore.addAction({
        name: 'Wand Blast',
        attackAbility: 'spellcasting',
        spellSourceId: sourceId,
        attackProficiency: 0,
      });

      const bonus = actionsStore.getActionBonus(action._id);
      expect(bonus.value.final).toBe(5);
    });

    it('should resolve @{spell-dc} for Save DC', () => {
      const actionsStore = useActionsStore();
      const spellsStore = useSpellsStore();
      const abilitiesStore = useAbilitiesStore();
      const progressionStore = useProgressionStore();

      const int = abilitiesStore.abilities.find((a) => a.label === 'intelligence')!;
      int.score = 16;
      progressionStore.classes = [{ level: 1 } as any];

      spellsStore.updateSource({ type: 'ability', ability: 'intelligence', name: 'Wizard' });
      const sourceId = spellsStore.userSources[0]._id;

      const action = actionsStore.addAction({
        name: 'Fireball',
        savingDc: '@{spell-dc}',
        spellSourceId: sourceId,
      });

      const dc = actionsStore.getActionDC(action._id);
      expect(dc.value.final).toBe(13);
    });

    it('should return empty damage modifiers if action has no damage', () => {
      const store = useActionsStore();
      const action = store.addAction({ name: 'Utility', damage: [] });

      const dmg = store.getActionDamage(action._id);
      expect(dmg.value.final).toEqual([]);
      expect(dmg.value.modifiers).toEqual([]);
    });

    it('should calculate Crit Range modifiers', () => {
      const actionsStore = useActionsStore();
      const effectsStore = useEffectsStore();

      const action = actionsStore.addAction({
        name: 'Keen Dagger',
        isAttack: true,
        attackType: 'melee',
        sourceType: 'weapon',
        critRange: 20,
      });

      effectsStore.addEffect({
        label: 'Improved Crit',
        enabled: true,
        effects: [
          {
            _id: 'e1',
            attribute: effectKeys['crit-range'],
            operation: 'subtract',
            value: 1,
            formula: '',
          },
        ],
      });

      const crit = actionsStore.getActionCritRange(action);
      expect(crit.value.final).toBe(19);
    });

  });

  describe('Integration with EffectsStore', () => {
    it('should reflect attack bonus modifiers from effects', () => {
      const actionsStore = useActionsStore();
      const effectsStore = useEffectsStore();

      const action = actionsStore.addAction({
        name: 'Punch',
        isAttack: true,
        attackType: 'melee',
        sourceType: 'weapon',
        attackBonus: '0',
      });

      effectsStore.addEffect({
        label: 'Bless',
        enabled: true,
        effects: [
          {
            _id: 'eff1',
            attribute: effectKeys['melee-attack'],
            operation: 'add',
            value: 1,
            formula: '',
          },
        ],
      });

      const bonus = actionsStore.getActionBonus(action._id);
      expect(bonus.value.final).toBe(1);
      expect(bonus.value.modifiers).toContainEqual(
        expect.objectContaining({ name: 'Bless', value: 1 }),
      );
    });

    it('should reflect damage modifiers from effects', () => {
      const actionsStore = useActionsStore();
      const effectsStore = useEffectsStore();

      const action = actionsStore.addAction({
        name: 'Firebolt',
        isAttack: true,
        attackType: 'ranged',
        sourceType: 'spell',
        damage: [{ damage: '1d10', type: 'fire', ability: 'none', critDamage: '1d10' }],
      });

      effectsStore.addEffect({
        label: 'Evocation Wizard',
        enabled: true,
        effects: [
          {
            _id: 'eff2',
            attribute: effectKeys['spell-damage'],
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
      });

      const damage = actionsStore.getActionDamage(action._id);
      expect(damage.value.final).toContain(2);
    });

    it('should collect Actions granted by Effects', () => {
      const actionsStore = useActionsStore();
      const effectsStore = useEffectsStore();

      const grantedAction = actionsStore.getEmptyAction({ name: 'Dragon Breath', isAttack: true });

      effectsStore.addEffect({
        label: 'Dragonborn',
        enabled: true,
        actions: [grantedAction],
      });

      expect(actionsStore.actions).toHaveLength(1);
      expect(actionsStore.actions[0].name).toBe('Dragon Breath');

      expect((actionsStore.actions[0] as any).isFromEffect).toBe(true);
    });

    it('should update an action within an effect', () => {
      const actionsStore = useActionsStore();
      const effectsStore = useEffectsStore();

      const effectAction = actionsStore.getEmptyAction({ _id: 'eff-action', name: 'Original' });
      const effect = effectsStore.addEffect({
        label: 'Transform',
        actions: [effectAction],
      });

      actionsStore.update({
        _id: 'eff-action',
        name: 'Updated via Store',
        sourceEffectId: effect._id,
      });

      expect(effectsStore.effects[0].actions![0].name).toBe('Updated via Store');
    });

    it('should remove an action within an effect', () => {
      const actionsStore = useActionsStore();
      const effectsStore = useEffectsStore();

      const effectAction = actionsStore.getEmptyAction({ _id: 'eff-action', name: 'Delete Me' });
      const effect = effectsStore.addEffect({
        label: 'Transform',
        actions: [effectAction],
      });

      actionsStore.remove({
        _id: 'eff-action',
        sourceEffectId: effect._id,
      } as any);

      expect(effectsStore.effects[0].actions).toHaveLength(0);
    });
  });

  describe('Chat and Hydration', () => {
    it('should replace userActions on hydrate', () => {
      const store = useActionsStore();
      store.addAction({ name: 'Old Action' });

      const newAction = store.getEmptyAction({ name: 'Hydrated Action' });

      const payload = {
        actions: {
          actions: {
            [newAction._id]: { ...newAction, arrayPosition: 0 },
          },
        },
      };

      store.hydrate(payload);

      expect(store.userActions).toHaveLength(1);
      expect(store.userActions[0].name).toBe('Hydrated Action');
    });

    it('should handle empty hydration', () => {
      const store = useActionsStore();
      store.addAction({ name: 'Preserve Me' });

      store.hydrate({ actions: undefined } as any);

      expect(store.userActions).toHaveLength(1);
      expect(store.userActions[0].name).toBe('Preserve Me');
    });

    it('should send action info to chat', async () => {
      const store = useActionsStore();
      const action = store.addAction({ name: 'Chat Test' });

      await store.sendActionInfoToChat(action._id, (k) => k);

      expect(dispatchRef.value.post).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('Chat Test'),
        }),
      );
    });

    it('should hydrate and dehydrate required fields correctly', () => {
      const store = useActionsStore();
      store.addAction({
        name: 'Req Action',
        required: ['attuned'],
      });

      const dehydrated = store.dehydrate();
      const actionId = Object.keys(dehydrated.actions.actions)[0];
      const req = (dehydrated.actions.actions[actionId] as any).required;
      expect(req['0']).toBe('attuned');

      store.userActions = [];
      store.hydrate(dehydrated);

      expect(store.userActions[0].required).toEqual(['attuned']);
    });
  });
});
