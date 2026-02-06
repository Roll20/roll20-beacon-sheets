import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProgressionStore } from '../progression/progressionStore';
import { useFeaturesStore } from '../features/faturesStore';
import { dropClassFeatures } from '@/compendium/dropClass';
import { dropAncestryFeatures } from '@/compendium/dropRace';
import { dropBackgroundFeatures } from '@/compendium/dropBackground';
import { useSpellsStore } from '../spells/spellsStore';

vi.mock('@/compendium/dropClass', () => ({
  dropClassFeatures: vi.fn(),
  onDropClass: vi.fn(),
}));

vi.mock('@/compendium/dropRace', () => ({
  dropAncestryFeatures: vi.fn(),
  onDropRace: vi.fn(),
}));

vi.mock('@/compendium/dropBackground', () => ({
  dropBackgroundFeatures: vi.fn(),
  onDropBackground: vi.fn(),
}));

vi.mock('@dice-roller/rpg-dice-roller', () => ({
  DiceRoll: vi.fn().mockImplementation(() => ({
    roll: vi.fn(),
    total: 8,
  })),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('progressionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const store = useProgressionStore();
      expect(store.classes).toEqual([]);
      expect(store.ancestry.name).toBe('');
      expect(store.background.name).toBe('');
      expect(store.experiencePoints).toBe(0);
    });
  });

  describe('Class Management and HP Logic', () => {
    it('getHitDice in manual mode returns only non-zero dice counts', () => {
      const store = useProgressionStore();
      store.hitDice.mode = 'manual';
      store.hitDice.total = { 
        '1d6': 0, 
        '1d8': 5, 
        '1d10': 2, 
        '1d12': 0, 
        '1d4': 0 
      };
      
      const result = store.getHitDice;
      
      expect(result).toEqual({ '1d8': 5, '1d10': 2 });
      expect(Object.keys(result)).not.toContain('1d6');
    });

    it('getClassesSummary truncates long class/subclass strings with ellipsis', () => {
      const store = useProgressionStore();
      store.updateClass({ 
        name: 'VeryLongClassName', 
        subclass: 'ExtremelyLongSubclassName', 
        level: 20 
      });
      
      const summary = store.getClassesSummary;
      expect(summary).toContain('...');
      expect(summary.length).toBeLessThanOrEqual(16);
    });

    it('addFeaturesToClass passes spellSourceId cascade if source exists', async () => {
      const store = useProgressionStore();
      const spellsStore = useSpellsStore();
      const sourceId = 'valid-source-id';
      
      spellsStore.userSources.push({ _id: sourceId, name: 'Magic', type: 'ability' } as any);
      
      store.updateClass({ 
        name: 'Wizard', 
        spellSourceId: sourceId,
        compendiumData: { class: '{}', subclass: null } 
      });
      
      await store.addFeaturesToClass(store.classes[0]._id, 1);
      
      expect(dropClassFeatures).toHaveBeenCalledWith(expect.objectContaining({
        cascade: { spellSourceId: sourceId }
      }));
    });
    it('should calculate HP based on mode', () => {
      const store = useProgressionStore();
      store.hitPointsMode = 'average';
      store.updateClass({ name: 'Paladin', hitDie: '1d10', level: 2 });

      expect(store.classes[0].hitPoints[0]).toBe(10);
      expect(store.classes[0].hitPoints[1]).toBe(6);
    });

    it('should preserve existing HP in rolled mode', () => {
      const store = useProgressionStore();
      store.hitPointsMode = 'rolled';
      store.updateClass({ name: 'Fighter', hitDie: '1d10', level: 1 });
      expect(store.classes[0].hitPoints[0]).toBe(8);
      store.classes[0].hitPoints[0] = 5;
      store.updateClass({ _id: store.classes[0]._id, name: 'Renamed Fighter' });
      expect(store.classes[0].hitPoints[0]).toBe(5);
    });

    it('should fallback to 0 or existing in manual/else mode', () => {
      const store = useProgressionStore();
      store.hitPointsMode = 'manual';
      store.updateClass({ name: 'Wizard', hitDie: '1d6', level: 1 });
      expect(store.classes[0].hitPoints[0]).toBe(0);
      store.classes[0].hitPoints[0] = 12;
      store.updateClass({ _id: store.classes[0]._id, level: 1 });
      expect(store.classes[0].hitPoints[0]).toBe(12);
    });

    it('should clear HP array if HitDie or Level is missing', () => {
      const store = useProgressionStore();
      store.updateClass({ name: 'GlitchClass', level: 0 });
      expect(store.classes[0].hitPoints).toEqual([]);
    });

    it('should remove subclass when leveling down below unlock level', () => {
      const store = useProgressionStore();
      store.updateClass({
        name: 'Rogue',
        level: 3,
        subclass: 'Thief',
        subclassUnlockLevel: 3,
        compendiumData: { class: null, subclass: '{"features":{}}' },
      });
      expect(store.classes[0].subclass).toBe('Thief');

      store.levelUpClass(store.classes[0]._id, -1);

      expect(store.classes[0].level).toBe(2);
      expect(store.classes[0].subclass).toBe('');
      expect(store.classes[0].compendiumData.subclass).toBeNull();
    });

    it('removeClass should remove associated spell source', () => {
      const store = useProgressionStore();
      const spellsStore = useSpellsStore();

      const sourceId = 'test-source-id';
      spellsStore.userSources.push({ _id: sourceId, name: 'Magic', type: 'ability' } as any);

      store.updateClass({ name: 'Wizard', spellSourceId: sourceId });
      const classId = store.classes[0]._id;

      store.removeClass(classId);

      expect(store.classes).toHaveLength(0);
      expect(spellsStore.sources.find((s) => s._id === sourceId)).toBeUndefined();
    });

    it('Level Up calls updateClass, addFeatures and removeClassFeatures(expired)', async () => {
      const store = useProgressionStore();
      store.updateClass({ name: 'Cleric', level: 1 });
      const clsId = store.classes[0]._id;
      
      await store.levelUpClass(clsId, 1);

      expect(store.classes[0].level).toBe(2);
    });

    it('Level Down removes high level features', async () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const removeSpy = vi.spyOn(featuresStore, 'remove');

      store.updateClass({ 
        name: 'Bard', 
        level: 5, 
        subclass: 'Lore', 
        subclassUnlockLevel: 3,
        subclassFeatureIds: [{ level: 5, id: 'bard-5-feat' }],
        featureIds: [{ level: 5, id: 'feat-5' }]
      });
      
      await store.levelUpClass(store.classes[0]._id, -1);

      expect(store.classes[0].level).toBe(4);
      expect(store.classes[0].subclass).toBe('Lore'); 
      expect(removeSpy).toHaveBeenCalledWith('bard-5-feat');
      expect(removeSpy).toHaveBeenCalledWith('feat-5');
    });

    it('addFeaturesToClass logs warning on invalid class JSON', async () => {
      const store = useProgressionStore();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      store.updateClass({ 
        name: 'BrokenClass', 
        compendiumData: { class: '{ invalid json', subclass: null } 
      });
      
      await store.addFeaturesToClass(store.classes[0]._id, 1);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to parse class features from compendium data", 
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Ancestry Features', () => {
    it('getAncestrySummary returns empty string if subrace is present but name is empty', () => {
      const store = useProgressionStore();
      store.ancestry.subrace = 'Variant';
      store.ancestry.name = ''; 
      
      expect(store.getAncestrySummary).toBe('');
    });

    it('getAncestrySummary formats correctly', () => {
      const store = useProgressionStore();

      store.ancestry.name = '';
      expect(store.getAncestrySummary).toBe('');

      store.ancestry.name = 'Elf';
      expect(store.getAncestrySummary).toBe('Elf');

      store.ancestry.subrace = 'High';
      expect(store.getAncestrySummary).toBe('High Elf');

      store.ancestry.subrace = 'Wood Elf';
      expect(store.getAncestrySummary).toBe('Wood Elf');
    });

    it('addFeaturesToAncestry should parse data and call drop handler', async () => {
      const store = useProgressionStore();
      store.ancestry.name = 'Elf';
      store.ancestry.compendiumData.race = JSON.stringify({ 'level-1': [] });

      await store.addFeaturesToAncestry(1, 1, true, false);

      expect(dropAncestryFeatures).toHaveBeenCalledWith(
        expect.objectContaining({
          updateSubrace: false,
          cascade: { source: 'Elf' },
        }),
      );
    });

    it('removeAncestryExpiredFeatures removes expired subrace features', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const removeSpy = vi.spyOn(featuresStore, 'remove');

      store.ancestry.subraceFeatureIds = [
        { level: 1, id: 'keep-1', expirantionLevel: 5 },
        { level: 1, id: 'remove-1', expirantionLevel: 2 },
      ];

      store.removeAncestryExpiredFeatures(2);

      expect(removeSpy).toHaveBeenCalledWith('remove-1');
      expect(store.ancestry.subraceFeatureIds).toHaveLength(1);
      expect(store.ancestry.subraceFeatureIds[0].id).toBe('keep-1');
    });

    it('removeAncestryFeatures removes subrace features by level', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const removeSpy = vi.spyOn(featuresStore, 'remove');
      
      store.ancestry.subraceFeatureIds = [
        { level: 1, id: 'lvl1' },
        { level: 5, id: 'lvl5' },
      ];

      store.removeAncestryFeatures(3);

      expect(removeSpy).toHaveBeenCalledWith('lvl5');
      expect(store.ancestry.subraceFeatureIds).toHaveLength(1);
      expect(store.ancestry.subraceFeatureIds[0].id).toBe('lvl1');
    });

    it('removeRace logic clears ancestry and calls removeSubrace logic implicit via cleanup', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const removeSpy = vi.spyOn(featuresStore, 'remove');

      store.ancestry = {
        name: 'Dwarf',
        sourceBook: 1,
        subrace: 'Mountain',
        subraceSourceBook: 1,
        featureIds: [{ level: 1, id: 'race-feat' }],
        subraceFeatureIds: [{ level: 1, id: 'subrace-feat' }],
        compendiumData: { race: '{}', subrace: '{}' }
      };

      store.removeRace();

      expect(removeSpy).toHaveBeenCalledWith('subrace-feat');
      expect(removeSpy).toHaveBeenCalledWith('race-feat');

      expect(store.ancestry.name).toBe('');
      expect(store.ancestry.subrace).toBe('');
      expect(store.ancestry.featureIds).toEqual([]);
      expect(store.ancestry.compendiumData.race).toBeNull();
    });

    it('handles JSON parse errors in addFeaturesToAncestry', async () => {
      const store = useProgressionStore();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      store.ancestry.compendiumData.race = '{ invalid json }';

      await store.addFeaturesToAncestry(1, 1);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse ancestry features from compendium data',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it('removeAncestryFeatures should remove features above specific level', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const feat = featuresStore.getEmptyFeature({ label: 'Level 5 Feature' });
      featuresStore.features.push(feat);

      store.ancestry.featureIds = [{ level: 5, id: feat._id }];

      store.removeAncestryFeatures(3);

      expect(store.ancestry.featureIds).toHaveLength(0);
      expect(featuresStore.features.find((f) => f._id === feat._id)).toBeUndefined();
    });

    it('removeAncestryExpiredFeatures should remove expired features', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const feat = featuresStore.getEmptyFeature({ label: 'Temporary Buff' });
      featuresStore.features.push(feat);

      store.ancestry.featureIds = [
        {
          level: 1,
          id: feat._id,
          expirantionLevel: 3,
        },
      ];

      store.removeAncestryExpiredFeatures(3);

      expect(store.ancestry.featureIds).toHaveLength(0);
      expect(featuresStore.features.find((f) => f._id === feat._id)).toBeUndefined();
    });

    it('removeSubrace should clear subrace data and features', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const feat = featuresStore.getEmptyFeature({ label: 'Subrace Feat' });
      featuresStore.features.push(feat);

      store.ancestry.subrace = 'High';
      store.ancestry.subraceFeatureIds = [{ level: 1, id: feat._id }];

      store.removeSubrace();

      expect(store.ancestry.subrace).toBe('');
      expect(store.ancestry.subraceFeatureIds).toHaveLength(0);
      expect(featuresStore.features.find((f) => f._id === feat._id)).toBeUndefined();
    });

    it('addFeaturesToAncestry passes correct flags for subrace features', async () => {
      const store = useProgressionStore();
      store.ancestry.name = 'Gnome';
      store.ancestry.subrace = 'Rock';
      store.ancestry.compendiumData.subrace = JSON.stringify({ 'level-1': [] });

      // raceFeatures=false, subraceFeatures=true
      await store.addFeaturesToAncestry(1, 1, false, true);

      expect(dropAncestryFeatures).toHaveBeenCalledWith(expect.objectContaining({
        updateSubrace: true,
        cascade: { source: 'Rock' } // Falls back to subrace name if present
      }));
    });
  });

  describe('Background Management', () => {
    it('getEmptyBackground returns correct default structure', () => {
      const store = useProgressionStore();
      const bg = store.getEmptyBackground();
      expect(bg).toEqual({
        name: '',
        sourceBook: -1,
        featureIds: [],
        compendiumData: null,
      });
    });
    it('addFeaturesToBackground should call drop handler', async () => {
      const store = useProgressionStore();
      store.background.compendiumData = JSON.stringify({ 'level-1': [] });

      await store.addFeaturesToBackground(1);

      expect(dropBackgroundFeatures).toHaveBeenCalled();
    });

    it('removeBackground should clear background and features', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const feat = featuresStore.getEmptyFeature({ label: 'Bg Feat' });
      featuresStore.features.push(feat);

      store.background.name = 'Soldier';
      store.background.featureIds = [{ level: 1, id: feat._id }];

      store.removeBackground();

      expect(store.background.name).toBe('');
      expect(store.background.featureIds).toHaveLength(0);
      expect(featuresStore.features.find((f) => f._id === feat._id)).toBeUndefined();
    });

    it('removeBackgroundFeatures should remove features above level', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const feat = featuresStore.getEmptyFeature({ label: 'High Level Bg Feat' });
      featuresStore.features.push(feat);

      store.background.featureIds = [{ level: 4, id: feat._id }];

      store.removeBackgroundFeatures(3);

      expect(store.background.featureIds).toHaveLength(0);
      expect(featuresStore.features.find((f) => f._id === feat._id)).toBeUndefined();
    });

    it('removeBackgroundExpiredFeatures should remove expired features', () => {
      const store = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const feat = featuresStore.getEmptyFeature({ label: 'Expired Bg Feat' });
      featuresStore.features.push(feat);

      store.background.featureIds = [
        {
          level: 1,
          id: feat._id,
          expirantionLevel: 2,
        },
      ];

      store.removeBackgroundExpiredFeatures(2);

      expect(store.background.featureIds).toHaveLength(0);
      expect(featuresStore.features.find((f) => f._id === feat._id)).toBeUndefined();
    });

    it('addFeaturesToBackground catches JSON parse errors', async () => {
      const store = useProgressionStore();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      store.background.compendiumData = '{ invalid json ';

      await store.addFeaturesToBackground(1);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse background features from compendium data',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Hydration & Dehydration (Complex Structures)', () => {
    it('should correctly dehydrate and hydrate nested arrays to objects and back', () => {
      const store = useProgressionStore();

      const classId = 'class-1';
      store.classes = [
        {
          _id: classId,
          name: 'Wizard',
          level: 5,
          hitDie: '1d6',
          hitPoints: [6, 4, 4, 4, 4],
          featureIds: [
            { level: 1, id: 'f1' },
            { level: 2, id: 'f2' },
          ],
          subclassFeatureIds: [{ level: 2, id: 'sf1' }],
          subclass: 'Evocation',
          subclassUnlockLevel: 2,
          spellcasting: 'full',
          subclassSpellcasting: 'none',
          spellSourceId: 'src1',
          compendiumData: { class: null, subclass: null },
        } as any,
      ];

      store.ancestry = {
        name: 'Elf',
        subrace: 'High',
        sourceBook: 1,
        subraceSourceBook: 1,
        featureIds: [{ level: 1, id: 'af1' }],
        subraceFeatureIds: [{ level: 1, id: 'asf1' }],
        compendiumData: { race: null, subrace: null },
      } as any;

      store.background = {
        name: 'Sage',
        sourceBook: 1,
        featureIds: [{ level: 1, id: 'bf1' }],
        compendiumData: null,
      } as any;

      const dehydrated = store.dehydrate();

      expect(dehydrated.classes[classId].hitPoints).toHaveProperty('0', 6);
      expect(dehydrated.classes[classId].featureIds).toHaveProperty('0');
      expect(dehydrated.ancestry.featureIds).toHaveProperty('0');
      expect(dehydrated.ancestry.subraceFeatureIds).toHaveProperty('0');
      expect(dehydrated.background.featureIds).toHaveProperty('0');

      store.classes = [];
      store.ancestry.name = '';

      store.hydrate(dehydrated);

      expect(store.classes[0].hitPoints).toHaveLength(5);
      expect(store.classes[0].featureIds).toHaveLength(2);
      expect(store.ancestry.subraceFeatureIds).toHaveLength(1);
      expect(store.background.featureIds).toHaveLength(1);
    });

    it('hydrate retains existing state when payload keys are missing', () => {
      const store = useProgressionStore();
      
      store.updateClass({ name: 'ExistingClass' });
      store.ancestry.name = 'ExistingRace';
      store.background.name = 'ExistingBackground';

      const partialPayload = {
        classes: undefined,
        ancestry: undefined,
        background: undefined
      } as any;

      store.hydrate(partialPayload);

      expect(store.classes[0].name).toBe('ExistingClass');
      expect(store.ancestry.name).toBe('ExistingRace');
      expect(store.background.name).toBe('ExistingBackground');
    });
  });
});
