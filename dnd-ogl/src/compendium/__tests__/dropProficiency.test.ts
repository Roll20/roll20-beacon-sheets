import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropProficiency } from '../dropProficiency';
import { useUnrankedProficienciesStore } from '@/sheet/stores/proficiencies/unrankedProficienciesStore';
import { useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import type { DropContext } from '../drop';

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: {} },
  initValues: { character: { id: 'char-123' } },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe('dropProficiency', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const makeContext = (name: string, category: string): DropContext => ({
    payload: { name, category },
  } as unknown as DropContext);

  describe('Language drops', () => {
    it('adds a known language using the nameKey as text', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Common', 'Language'));

      expect(store.languages).toHaveLength(1);
      expect(store.languages[0].text).toBe('common');
      expect(store.languages[0].isDefault).toBe(true);
    });

    it('adds an unknown language using the original name', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Exotic Tongue', 'Language'));

      expect(store.languages).toHaveLength(1);
      expect(store.languages[0].text).toBe('Exotic Tongue');
      expect(store.languages[0].isDefault).toBe(false);
    });

    it('does not add duplicate languages', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Elvish', 'Language'));
      await onDropProficiency(makeContext('Elvish', 'Language'));

      expect(store.languages).toHaveLength(1);
    });
  });

  describe('Weapon drops', () => {
    it('adds a known weapon proficiency using the nameKey', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Simple Weapons', 'Weapon'));

      expect(store.weapons).toHaveLength(1);
      expect(store.weapons[0].text).toBe('simple-weapons');
      expect(store.weapons[0].isDefault).toBe(true);
    });

    it('adds an unknown weapon proficiency using the original name', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Exotic Blade', 'Weapon'));

      expect(store.weapons).toHaveLength(1);
      expect(store.weapons[0].text).toBe('Exotic Blade');
      expect(store.weapons[0].isDefault).toBe(false);
    });

    it('does not add duplicate weapons', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Martial Weapons', 'Weapon'));
      await onDropProficiency(makeContext('Martial Weapons', 'Weapon'));

      expect(store.weapons).toHaveLength(1);
    });
  });

  describe('Armor drops', () => {
    it('adds a known armor proficiency using the nameKey', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Light Armor', 'Armor'));

      expect(store.armor).toHaveLength(1);
      expect(store.armor[0].text).toBe('light-armor');
      expect(store.armor[0].isDefault).toBe(true);
    });

    it('adds an unknown armor using the original name', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Exotic Armor', 'Armor'));

      expect(store.armor).toHaveLength(1);
      expect(store.armor[0].text).toBe('Exotic Armor');
      expect(store.armor[0].isDefault).toBe(false);
    });

    it('does not add duplicate armor', async () => {
      const store = useUnrankedProficienciesStore();
      await onDropProficiency(makeContext('Shields', 'Armor'));
      await onDropProficiency(makeContext('Shields', 'Armor'));

      expect(store.armor).toHaveLength(1);
    });
  });

  describe('Tool drops', () => {
    it('adds a new known tool proficiency', async () => {
      const profStore = useProficienciesStore();
      await onDropProficiency(makeContext("Thieves' Tools", 'Tool'));

      const tools = profStore.ranked.filter((p) => p.group === 'tools');
      expect(tools).toHaveLength(1);
      expect(tools[0].label).toBe("Thieves' Tools");
      expect(tools[0].ability).toBe('dexterity');
      expect(tools[0].level).toBe(1);
    });

    it('does not add duplicate tool if already exists with level > 0', async () => {
      const profStore = useProficienciesStore();
      await onDropProficiency(makeContext("Thieves' Tools", 'Tool'));
      const initialCount = profStore.ranked.filter((p) => p.group === 'tools').length;

      await onDropProficiency(makeContext("Thieves' Tools", 'Tool'));
      const finalCount = profStore.ranked.filter((p) => p.group === 'tools').length;

      expect(finalCount).toBe(initialCount);
    });
  });

  describe('Skill drops', () => {
    it('sets an untrained skill to proficient', async () => {
      const profStore = useProficienciesStore();
      const stealth = profStore.ranked.find(
        (p) => p.group === 'default-skills' && p.label === 'stealth',
      );
      expect(stealth?.level).toBeLessThanOrEqual(0);

      await onDropProficiency(makeContext('Stealth', 'Skill'));

      const updated = profStore.ranked.find(
        (p) => p.group === 'default-skills' && p.label === 'stealth',
      );
      expect(updated?.level).toBe(1);
    });

    it('does not downgrade an already proficient skill', async () => {
      const profStore = useProficienciesStore();
      await onDropProficiency(makeContext('Stealth', 'Skill'));
      const stealth = profStore.ranked.find(
        (p) => p.group === 'default-skills' && p.label === 'stealth',
      );
      profStore.updateRanked(stealth!._id, { level: 2 });

      await onDropProficiency(makeContext('Stealth', 'Skill'));

      const updated = profStore.ranked.find(
        (p) => p.group === 'default-skills' && p.label === 'stealth',
      );
      expect(updated?.level).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('logs error for missing payload name', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await onDropProficiency({ payload: { category: 'Language' } } as unknown as DropContext);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid proficiency data', expect.anything());
      consoleSpy.mockRestore();
    });

    it('logs error for missing payload category', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await onDropProficiency({ payload: { name: 'Elvish' } } as unknown as DropContext);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid proficiency data', expect.anything());
      consoleSpy.mockRestore();
    });

    it('logs warning for unknown category', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await onDropProficiency(makeContext('Something', 'Unknown'));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown proficiency category'),
      );
      consoleSpy.mockRestore();
    });
  });
});
