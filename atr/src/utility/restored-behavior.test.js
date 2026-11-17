import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import * as z3 from 'zod/v3';
import { EffectsCalculator } from './effectsCalculator';
import { createComponentsFromFormula } from './diceParser';
import { getModifiedValue } from '@/relay/handlers/effects';
import { useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { useActionsStore } from '@/sheet/stores/actions/actionsStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { SingleEffectSchema } from '@/schemas/common/effect.base';
import { allEffectKeysWithPickers } from '@/schemas/common/common';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }));

describe('restored pre-upgrade behavior', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('keeps raw dice-pool contributions and JavaScript subtraction coercion', () => {
    const result = EffectsCalculator.calculateModifiedDicePool([], [
      { label: 'add', operation: 'add', value: '1d6' },
      { label: 'subtract', operation: 'subtract', value: '1d4' },
      { label: 'number', operation: 'subtract', value: '2' },
    ]);

    expect(result.final).toEqual(['1d6', '-1d4', '-2']);
    expect(result.modifiers).toEqual([
      { name: 'add', value: '1d6' },
      { name: 'subtract', value: NaN },
      { name: 'number', value: -2 },
    ]);
  });

  it('includes zero constants in parsed dice components', () => {
    expect(createComponentsFromFormula('0+1d6', 'base')).toEqual([
      { value: 0, label: 'base' },
      { sides: 6, count: 1 },
    ]);
  });

  it('preserves the former truthy effect context and owned single-effect checks', () => {
    const effect = {
      arrayPosition: 0, enabled: true, label: 'bonus', required: { 0: 'equipped' },
      effects: { single: { arrayPosition: 0, attribute: 'test', operation: 'add', value: 3, required: { 0: 'cl>5' } } },
    };
    const character = { attributes: { modifiers: { effects: { effect } } } };
    expect(getModifiedValue(1, 'test', [], character)).toBe(4);
    character.attributes.equipment = {
      equipment: { item: { effectId: 'effect', equipped: true, isAttuned: true } },
    };
    expect(getModifiedValue(1, 'test', [], character)).toBe(1);
    effect.effects.single.required = { 0: 'equipped' };
    expect(getModifiedValue(1, 'test', [], character)).toBe(4);
    character.attributes.equipment.equipment.item.equipped = false;
    expect(getModifiedValue(1, 'test', [], character)).toBe(1);
    effect.enabled = false;
    expect(getModifiedValue(1, 'test', [], character)).toBe(1);
  });

  it('retains the original shared equipment-owner lookup for effect items', () => {
    useEquipmentStore().equipment.push({ effectId: 'effect', equipped: false, isAttuned: false });
    const effect = {
      _id: 'effect', label: 'effect', resources: [{ _id: 'resource', required: ['equipped'] }],
    };
    expect(EffectsCalculator.collectFromEffects([effect], 'resources', () => true)).toHaveLength(1);
    useEquipmentStore().equipment.push({ equipped: false, isAttuned: false });
    expect(EffectsCalculator.collectFromEffects([effect], 'resources', () => true)).toHaveLength(0);
  });

  it('looks up tag groups by array property rather than group ID', () => {
    const tags = [{ _id: 'tag', text: 'tag' }];
    useTagsStore().tagGroups.push({ _id: 'group', tags });
    expect(useActionsStore().getActionTags('group')).toEqual([]);
    expect(useFeaturesStore().getFeatureTags('group')).toEqual([]);
    expect(useActionsStore().getActionTags('0')).toEqual(tags);
    expect(useFeaturesStore().getFeatureTags('0')).toEqual(tags);
  });

  it('preserves Zod 3 acceptance of omitted undefined fields after the upgrade', () => {
    expect(z3.object({ formula: z3.undefined() }).safeParse({}).success).toBe(true);
    expect(SingleEffectSchema.safeParse({
      attribute: allEffectKeysWithPickers[0], operation: 'add', value: 1,
    }).success).toBe(true);
    expect(SingleEffectSchema.safeParse({
      attribute: allEffectKeysWithPickers[0], operation: 'add-formula', formula: '1',
    }).success).toBe(true);
  });
});
