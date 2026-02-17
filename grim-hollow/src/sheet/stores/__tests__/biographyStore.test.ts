import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBiographyStore } from '../biography/biographyStore';
import { config } from '@/config';

describe('useBiographyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default values', () => {
    const store = useBiographyStore();

    expect(store.size).toBe(config.sizes[2]);
    expect(store.gender).toBe('');
  });

  it('should update values reactively', () => {
    const store = useBiographyStore();
    store.size = 'Large';
    store.gender = 'Non-binary';

    expect(store.size).toBe('Large');
    expect(store.gender).toBe('Non-binary');
  });

  describe('dehydrate', () => {
    it('should return current biography values', () => {
      const store = useBiographyStore();
      store.size = 'Large';
      store.gender = 'Male';

      const result = store.dehydrate();

      expect(result).toEqual({
        biography: {
          size: 'Large',
          gender: 'Male',
        },
      });
    });

    it('should return default values when not modified', () => {
      const store = useBiographyStore();
      const result = store.dehydrate();

      expect(result).toEqual({
        biography: {
          size: config.sizes[2],
          gender: '',
        },
      });
    });
  });

  describe('hydrate', () => {
    it('should restore biography values from hydrate data', () => {
      const store = useBiographyStore();
      const hydrateData = {
        biography: {
          size: 'Huge',
          gender: 'Female',
        },
      };

      store.hydrate(hydrateData);

      expect(store.size).toBe('Huge');
      expect(store.gender).toBe('Female');
    });

    it('should keep existing values if key is missing', () => {
      const store = useBiographyStore();
      store.size = 'Gargantuan';
      store.gender = 'Male';

      const hydrateData = {
        biography: {
          size: 'Tiny',
        },
      } as any;

      store.hydrate(hydrateData);

      expect(store.size).toBe('Tiny'); 
      expect(store.gender).toBe('Male');
    });

    it('should preserve existing values when hydrate property is explicitly undefined', () => {
      const store = useBiographyStore();
      store.size = 'Custom';
      store.gender = 'Custom Gender';

      const hydrateData = {
        biography: {
          size: undefined,
          gender: undefined,
        },
      } as any;

      store.hydrate(hydrateData);

      expect(store.size).toBe('Custom');
      expect(store.gender).toBe('Custom Gender');
    });
  });
});