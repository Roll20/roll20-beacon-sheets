import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropSpell } from '../dropSpell';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { hydrateSpells } from '../hydrateSpells';

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

describe('onDropSpell', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  const mockSpellPayload = {
    name: 'Fireball',
    level: 3,
    school: 'evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: ['verbal', 'somatic', 'material'],
    duration: 'Instantaneous',
    description: { default: 'A bright streak flashes...' },
    spellSourceId: 'source-1',
    damage: [],
  };

  const mockEffects = {
    label: 'Fireball Effects',
    effects: [
      {
        attribute: 'fire-damage',
        operation: 'add',
        value: '1d6',
      },
    ],
  };

  it('should drop a spell on a PC (Global Store)', async () => {
    const spellsStore = useSpellsStore();
    const effectsStore = useEffectsStore();
    
    spellsStore.userSources = [{ _id: 'source-1', name: 'Wizard', type: 'ability', ability: 'intelligence' } as any];

    await onDropSpell({
      payload: mockSpellPayload,
      effects: mockEffects,
      tags: ['fire', 'evocation'],
    });

    expect(spellsStore.userSpells).toHaveLength(1);
    const addedSpell = spellsStore.userSpells[0];
    expect(addedSpell.name).toBe('Fireball');
    expect(addedSpell.effectId).toBeDefined();

    expect(effectsStore.effects).toHaveLength(1);
    const addedEffect = effectsStore.effects[0];
    expect(addedEffect.label).toBe('Fireball Effects');
    expect(addedEffect._id).toBe(addedSpell.effectId);

    const tagsStore = useTagsStore();
    expect(tagsStore.tagGroups).toHaveLength(1);
    expect(tagsStore.tagGroups[0].category).toBe('spell');
  });

  it('should drop a spell on an NPC (Local NPC Store)', async () => {
    const npcStore = useNpcStore();
    const effectsStore = useEffectsStore();

    const npcId = npcStore.addCompanion();
    const npc = npcStore.npcs.find(n => n._id === npcId)!;
    
    npc.spellSources.push({
      _id: 'source-1',
      name: 'Innate',
      type: 'ability',
      ability: 'charisma',
      spellAttackBonus: 0,
      spellSaveDC: 10,
      isInnate: true,
      spellSlots: {},
      spellSlotsUsed: {}
    });

    await onDropSpell({
      payload: mockSpellPayload,
      effects: mockEffects,
      npcId: npcId,
    });

    expect(npc.spells).toHaveLength(1);
    const addedNpcSpell = npc.spells[0];
    expect(addedNpcSpell.name).toBe('Fireball');
    
    expect(npc.effects).toHaveLength(1);
    const addedNpcEffect = npc.effects[0];
    expect(addedNpcEffect.label).toBe('Fireball Effects');
    expect(addedNpcEffect._id).toBe(addedNpcSpell.effectId);

    expect(effectsStore.effects).toHaveLength(0);
  });

  it('should resolve correct source for valid $picker index', async () => {
    const npcStore = useNpcStore();
    const npcId = npcStore.addCompanion();
    const npc = npcStore.npcs.find(n => n._id === npcId)!;

    npc.spellSources = [
        { _id: 'source-A', name: 'A' } as any,
        { _id: 'source-B', name: 'B' } as any
    ];

    const pickerPayload = { ...mockSpellPayload, spellSourceId: '$picker:1' };

    await onDropSpell({
        payload: pickerPayload,
        npcId: npcId
    });

    expect(npc.spells).toHaveLength(1);
    expect(npc.spells[0].spellSourceId).toBe('source-B');
  });

  it('should fallback to first source if $picker index is out of bounds', async () => {
    const npcStore = useNpcStore();
    const npcId = npcStore.addCompanion();
    const npc = npcStore.npcs.find(n => n._id === npcId)!;

    npc.spellSources = [
        { _id: 'source-A', name: 'A' } as any
    ];

    const pickerPayload = { ...mockSpellPayload, spellSourceId: '$picker:5' };

    await onDropSpell({
        payload: pickerPayload,
        npcId: npcId
    });

    expect(npc.spells).toHaveLength(1);
    expect(npc.spells[0].spellSourceId).toBe('source-A');
  });

  it('should log error when hydration fails for NPC drop', async () => {
    const npcStore = useNpcStore();
    const npcId = npcStore.addCompanion();
    
    const errorMock = new Error('Network error');
    vi.mocked(hydrateSpells).mockRejectedValueOnce(errorMock);

    await onDropSpell({
      payload: mockSpellPayload,
      npcId: npcId,
    });

    expect(console.error).toHaveBeenCalledWith(
      'Failed to hydrate and add spell to NPC.',
      errorMock
    );
    
    const npc = npcStore.npcs.find(n => n._id === npcId)!;
    expect(npc.spells).toHaveLength(0);
  });

  it('should create default spell source on NPC if none exists', async () => {
    const npcStore = useNpcStore();
    const npcId = npcStore.addCompanion();
    const npc = npcStore.npcs.find(n => n._id === npcId)!;
    
    npc.spellSources = [];

    const payloadNoSource = { ...mockSpellPayload, spellSourceId: '' };

    await onDropSpell({
      payload: payloadNoSource,
      npcId: npcId,
    });

    expect(npc.spellSources).toHaveLength(1);
    expect(npc.spellSources[0].name).toBe("Spellcasting");
    
    expect(npc.spells).toHaveLength(1);
    expect(npc.spells[0].spellSourceId).toBe(npc.spellSources[0]._id);
  });

  it('should gracefully fail with invalid payload', async () => {
    await onDropSpell({
      payload: { invalid: 'data' },
    });

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid spell data'), expect.anything());
    
    const spellsStore = useSpellsStore();
    expect(spellsStore.userSpells).toHaveLength(0);
  });

  
});