import { useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { onDropEquipment } from '../dropEquipment';

import { hydrateSpells } from '../hydrateSpells';
import { config } from '@/config';

vi.mock('../hydrateSpells', () => ({
  hydrateSpells: vi.fn(async (spells) => spells),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: {} },
  initValues: { character: { id: 'test-char' } },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('onDropEquipment', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockEquipmentPayload = {
    name: 'Longsword',
    type: 'weapon',
    weight: 3,
    quantity: 1,
    description: 'Versatile weapon',
    value: { amount: 15, currency: 'gp' },
  };

  it('should drop basic equipment into the store', async () => {
    const equipmentStore = useEquipmentStore();

    await onDropEquipment({
      payload: mockEquipmentPayload,
    });

    expect(equipmentStore.equipment).toHaveLength(1);
    const item = equipmentStore.equipment[0];
    expect(item.name).toBe('Longsword');
    expect(item.weight).toBe(3);
    expect(item.type).toBe('weapon');
  });

  it('should create tag group when tags are provided', async () => {
    const equipmentStore = useEquipmentStore();
    const tagsStore = useTagsStore();

    await onDropEquipment({
      payload: mockEquipmentPayload,
      tags: ['martial', 'slashing'],
    });

    const item = equipmentStore.equipment[0];
    expect(item.tagId).toBeDefined();

    const tagGroup = tagsStore.tagGroups.find((g) => g._id === item.tagId);
    expect(tagGroup).toBeDefined();
    expect(tagGroup?.category).toBe('equipment');
    expect(tagGroup?.tags).toHaveLength(2);
    expect(tagGroup?.tags.map((t) => t.text).sort()).toEqual(['martial', 'slashing'].sort());
  });

  it('should create an effect when effects are provided', async () => {
    const equipmentStore = useEquipmentStore();
    const effectsStore = useEffectsStore();

    const mockEffects = {
      label: 'Magic Sword Effects',
      effects: [
        {
          attribute: 'attack-bonus',
          operation: 'add',
          value: 1,
        },
      ],
    };

    await onDropEquipment({
      payload: mockEquipmentPayload,
      effects: mockEffects,
    });

    const item = equipmentStore.equipment[0];
    expect(item.effectId).toBeDefined();

    const effect = effectsStore.effects.find((e) => e._id === item.effectId);
    expect(effect).toBeDefined();
    expect(effect?.label).toBe('Magic Sword Effects');
    expect(effect?.effects).toHaveLength(1);
  });

  it('should process item tags within effects (actions)', async () => {
    const tagsStore = useTagsStore();
    const mockEffects = {
      label: 'Item Actions',
      actions: [
        {
          name: 'Special Attack',
          group: 'actions',
          isAttack: true,
          'data-tags': ['fire'],
        },
      ],
    };

    await onDropEquipment({
      payload: mockEquipmentPayload,
      effects: mockEffects,
    });

    const actionTagGroup = tagsStore.tagGroups.find((g) => g.category === 'action');
    expect(actionTagGroup).toBeDefined();
    expect(actionTagGroup?.tags[0].text).toBe('fire');
  });

  it('should remap spell sources and spells in effects', async () => {
    const effectsStore = useEffectsStore();

    const mockEffects = {
      label: 'Staff of Power',
      spellSources: [
        { name: 'Staff Charges', type: 'flat', flat: 15 }, // Source Index 0
      ],
      spells: [], 
    };

    const mockSpellsForHydration = [
      { name: 'Fireball', spellSourceId: '$source:0' }
    ];

    await onDropEquipment({
      payload: mockEquipmentPayload,
      effects: mockEffects,
      spells: mockSpellsForHydration as any,
    });

    expect(hydrateSpells).toHaveBeenCalled();

    const createdEffect = effectsStore.effects[0];
    expect(createdEffect).toBeDefined();
    
    expect(createdEffect.spellSources).toHaveLength(1);
    expect(createdEffect.spells).toHaveLength(1);

    const sourceId = createdEffect.spellSources![0]._id;
    const spell = createdEffect.spells![0];

    // Verify remapping
    expect(spell.spellSourceId).toBe(sourceId);
    expect(spell.spellSourceId).not.toBe('$source:0');
  });

  it('should auto-fix missing currency in value', async () => {
    const equipmentStore = useEquipmentStore();
    
    // Payload with value but missing currency
    const payloadMissingCurrency = {
      name: 'Gold Bar',
      type: 'equipment',
      value: { amount: 100 }, 
    };

    await onDropEquipment({
      payload: payloadMissingCurrency,
    });

    expect(equipmentStore.equipment).toHaveLength(1);
    const item = equipmentStore.equipment[0];
    expect(item.value?.amount).toBe(100);
    expect(item.value?.currency).toBe(config.currencyTypes[0]); // Default applied
  });

  it('should fail gracefully with invalid payload', async () => {
    const equipmentStore = useEquipmentStore();

    await onDropEquipment({
      payload: { name: 'Invalid Item', type: 'unknown-type' },
    });

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid equipment data'),
      expect.anything()
    );
    expect(equipmentStore.equipment).toHaveLength(0);
  });

  it('should fallback to first spell source if referenced source index is invalid', async () => {
    const effectsStore = useEffectsStore();

    const mockEffects = {
      label: 'Broken Link Staff',
      spellSources: [
        { name: 'Primary Source', type: 'flat', flat: 10 }, // Index 0
      ],
      spells: [],
    };

    // The code should fallback to index 0.
    const mockSpellsForHydration = [
      { name: 'Lost Spell', spellSourceId: '$source:99' }
    ];

    await onDropEquipment({
      payload: mockEquipmentPayload,
      effects: mockEffects,
      spells: mockSpellsForHydration as any,
    });

    const createdEffect = effectsStore.effects[0];
    const sourceId = createdEffect.spellSources![0]._id;
    const spell = createdEffect.spells![0];

    expect(spell.spellSourceId).toBe(sourceId);
  });

  it('should apply default currency if missing in value object', async () => {
    const equipmentStore = useEquipmentStore();
    
    const payloadMissingCurrency = {
      name: 'Old Gem',
      type: 'equipment',
      weight: 0.1,
      value: { amount: 500 } as any, 
    };

    await onDropEquipment({
      payload: payloadMissingCurrency,
    });

    const item = equipmentStore.equipment[0];
    
    expect(item.value?.amount).toBe(500);
    expect(item.value?.currency).toBe(config.currencyTypes[0]);
  });
});