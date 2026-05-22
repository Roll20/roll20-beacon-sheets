import { useEffectsStore } from "@/sheet/stores/modifiers/modifiersStore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { onDropFeature } from "../dropFeature";
import { useFeaturesStore } from "@/sheet/stores/features/faturesStore";
import { DropContext } from "../drop";
import { useTagsStore } from "@/sheet/stores/tags/tagsStore";
import { createPinia, setActivePinia } from "pinia";

vi.mock('../hydrateSpells', () => ({
  hydrateSpells: vi.fn(async (spells) => {
    return spells.map((s: any) => ({ ...s, isHydrated: true }));
  }),
}));


vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: null },
  initValues: { character: { id: 'char-123' } },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('onDropFeature', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const validPayload = {
    label: 'Test Feature',
    description: 'A test description',
    group: 'class-features',
  };

  it('should validate payload and return undefined on failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const invalidPayload = { description: 'Missing required fields' };
    
    const result = await onDropFeature({ 
      payload: invalidPayload 
    } as unknown as DropContext);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Invalid feature data', expect.anything());
    
    consoleSpy.mockRestore();
  });

  it('should create a feature in the store', async () => {
    const featuresStore = useFeaturesStore();
    
    const resultId = await onDropFeature({ 
      payload: validPayload 
    } as DropContext);

    expect(resultId).toBeDefined();
    expect(featuresStore.features).toHaveLength(1);
    
    const feature = featuresStore.features[0];
    expect(feature.label).toBe('Test Feature');
    expect(feature.group).toBe('class-features');
  });

  it('should create tags and link them to the feature', async () => {
    const tagsStore = useTagsStore();
    const tags = ['Fire', 'Magical'];

    const resultId = await onDropFeature({ 
      payload: validPayload,
      tags 
    } as DropContext);

    const feature = useFeaturesStore().features.find(f => f._id === resultId);
    expect(feature?.tagId).toBeDefined();

    const tagGroup = tagsStore.tagGroups.find(g => g._id === feature?.tagId);
    expect(tagGroup).toBeDefined();
    expect(tagGroup?.tags).toHaveLength(2);
    expect(tagGroup?.tags.map(t => t.text)).toContain('Fire');
    expect(tagGroup?.category).toBe('feature');
  });

  it('should create effects if provided', async () => {
    const effectsStore = useEffectsStore();
    const effects = {
      label: 'Feature Effects',
      effects: [{ attribute: 'strength', operation: 'add', value: 1 }]
    };

    const resultId = await onDropFeature({ 
      payload: validPayload,
      effects 
    } as any as DropContext);

    const feature = useFeaturesStore().features.find(f => f._id === resultId);
    expect(feature?.effectId).toBeDefined();

    const createdEffect = effectsStore.effects.find(e => e._id === feature?.effectId);
    expect(createdEffect).toBeDefined();
    expect(createdEffect?.effects[0].attribute).toBe('strength');
  });

  it('should auto-generate effects container if spells exist but effects do not', async () => {
    const effectsStore = useEffectsStore();
    const spells = [{ name: 'Fireball', level: 3 }];

    const resultId = await onDropFeature({ 
      payload: validPayload,
      spells: spells as any
    } as DropContext);

    const feature = useFeaturesStore().features.find(f => f._id === resultId);
    const createdEffect = effectsStore.effects.find(e => e._id === feature?.effectId);

    expect(createdEffect).toBeDefined();
    expect(createdEffect?.spells).toHaveLength(1);
    expect((createdEffect?.spells![0] as any).isHydrated).toBe(true);
  });

  it('should handle cascade source for the feature', async () => {
    const featuresStore = useFeaturesStore();
    const cascade = { source: 'Paladin 3' };

    const resultId = await onDropFeature({ 
      payload: validPayload,
      cascade 
    } as DropContext);

    const feature = featuresStore.features.find(f => f._id === resultId);
    expect(feature?.source).toBe('Paladin 3');
  });

  it('should apply cascade spellSourceId to spells if no sources defined', async () => {
    const effectsStore = useEffectsStore();
    const spells = [{ name: 'Smite' }];
    const cascade = { spellSourceId: 'source-123' };

    const resultId = await onDropFeature({ 
      payload: validPayload,
      spells: spells as any,
      cascade
    } as DropContext);

    const feature = useFeaturesStore().features.find(f => f._id === resultId);
    const effect = effectsStore.effects.find(e => e._id === feature?.effectId);

    expect(effect?.spells![0].spellSourceId).toBe('source-123');
  });

  it('should remap $source:X references in spells to generated source IDs', async () => {
    const effectsStore = useEffectsStore();
    
    const effects = {
      label: 'Magic Initiate',
      spellSources: [{ name: 'Intiate Casting', type: 'ability', ability: 'int' }],
      spells: [{ name: 'Cantrip', spellSourceId: '$source:0' }]
    };

    const resultId = await onDropFeature({ 
      payload: validPayload,
      effects
    } as any as DropContext);

    const feature = useFeaturesStore().features.find(f => f._id === resultId);
    const effect = effectsStore.effects.find(e => e._id === feature?.effectId);

    expect(effect).toBeDefined();
    
    const generatedSourceId = effect?.spellSources![0]._id;
    const spellSourceRef = effect?.spells![0].spellSourceId;

    expect(generatedSourceId).toBeDefined();
    expect(spellSourceRef).toBe(generatedSourceId);
    expect(spellSourceRef).not.toBe('$source:0');
  });

  it('should default spell source to the first source if index invalid', async () => {
    const effectsStore = useEffectsStore();
    
    const effects = {
      label: 'Magic',
      spellSources: [{ name: 'Main Source' }],
      spells: [{ name: 'Broken Link Spell', spellSourceId: '$source:99' }]
    };

    const resultId = await onDropFeature({ 
      payload: validPayload,
      effects
    } as any as DropContext);

    const feature = useFeaturesStore().features.find(f => f._id === resultId);
    const effect = effectsStore.effects.find(e => e._id === feature?.effectId);

    const generatedSourceId = effect?.spellSources![0]._id;
    expect(effect?.spells![0].spellSourceId).toBe(generatedSourceId);
  });
});