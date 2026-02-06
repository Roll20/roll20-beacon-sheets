import { describe, it, expect } from 'vitest';
import { transformDnDRace } from '../transformRace';

describe('transformDnDRace', () => {
  const mockBook = { itemId: '123' };

  describe('Legacy Format (No Datarecords)', () => {
    it('transforms Ability Score Increases', () => {
      const properties = {
        'data-Ability Score Increase': JSON.stringify({
          str: 2,
          cha: 1,
        }),
      };

      const result = transformDnDRace({ name: 'Dragonborn' }, mockBook, properties);
      const mainFeature = result['data-features']['level-1'][0];
      const effects = mainFeature['data-effects'].effects;

      expect(effects).toContainEqual(
        expect.objectContaining({
          attribute: 'strength',
          value: 2,
          operation: 'add',
        }),
      );
      expect(effects).toContainEqual(
        expect.objectContaining({
          attribute: 'charisma',
          value: 1,
          operation: 'add',
        }),
      );
    });

    it('transforms Speed', () => {
      const properties = {
        Speed: '30',
      };

      const result = transformDnDRace({ name: 'Human' }, mockBook, properties);
      const effects = result['data-features']['level-1'][0]['data-effects'].effects;

      expect(effects).toContainEqual({
        attribute: 'walk-speed',
        operation: 'set-base',
        value: 30,
      });
    });

    it('transforms Bonus Feats into a picker', () => {
      const properties = {
        'data-Feats': '1',
      };

      const result = transformDnDRace({ name: 'Variant Human' }, mockBook, properties);
      const pickers = result['data-features']['level-1'][0]['data-effects'].pickers;

      expect(pickers).toHaveLength(1);
      expect(pickers[0]).toEqual({
        label: 'Bonus Feat',
        options: [],
        count: '1',
      });
    });
  });

  describe('Modern Format (Datarecords)', () => {
    const createRecord = (name: string, payload: any, parent?: string) => ({
      name,
      payload: JSON.stringify(payload),
      parent,
    });

    it('aggregates standalone traits into the main racial feature', () => {
      const records = [
        createRecord('Speed Trait', {
          type: 'Speed',
          speed: 'walk',
          valueFormula: { flatValue: 35 },
          calculation: 'Set Base',
        }),
        createRecord('Darkvision', {
          type: 'Sense',
          name: 'Darkvision',
          valueFormula: { flatValue: 60 },
        }),
      ];

      const properties = {
        'data-datarecords': JSON.stringify(records),
      };

      const result = transformDnDRace({ name: 'Wood Elf' }, mockBook, properties);
      const effects = result['data-features']['level-1'][0]['data-effects'].effects;

      // Check Speed
      expect(effects).toContainEqual(
        expect.objectContaining({
          attribute: 'walk-speed',
          value: 35,
        }),
      );

      // Check Sense
      expect(effects).toContainEqual(
        expect.objectContaining({
          attribute: 'sense-darkvision',
          value: 60,
        }),
      );
    });

    it('aggregates pickers from standalone traits', () => {
      const records = [
        createRecord('Language Choice', {
          type: 'Language Choice',
          numOfChoices: 1,
          pickerIndexOffset: 0,
        }),
      ];

      const properties = {
        'data-datarecords': JSON.stringify(records),
      };

      const result = transformDnDRace({ name: 'Human' }, mockBook, properties);
      const mainFeature = result['data-features']['level-1'][0];

      expect(mainFeature['data-effects'].pickers).toBeDefined();
      expect(mainFeature['data-effects'].pickers).toHaveLength(1);
      expect(mainFeature['data-effects'].pickers[0].label).toBe('Language Choice');
    });

    it('groups child records under parent features', () => {
      const records = [
        createRecord('Ancestral Legacy', {
          type: 'Features',
          description: 'Choose a legacy.',
        }),
        createRecord(
          'Skill Proficiency',
          {
            type: 'Proficiency',
            category: 'Skill',
            proficiency: 'Perception',
            proficiencyLevel: 'Proficient',
          },
          'Ancestral Legacy',
        ),
      ];

      const properties = {
        'data-datarecords': JSON.stringify(records),
      };

      const result = transformDnDRace({ name: 'Custom Lineage' }, mockBook, properties);
      const features = result['data-features']['level-1'];

      // Should have Main Traits + Ancestral Legacy
      expect(features.length).toBeGreaterThanOrEqual(1);

      const legacyFeature = features.find((f) => f.label === 'Ancestral Legacy');
      expect(legacyFeature).toBeDefined();
      expect(legacyFeature['data-effects'].effects).toContainEqual(
        expect.objectContaining({
          attribute: 'perception-proficiency',
          value: 1,
        }),
      );
    });

    it('removes empty data-effects and data-spells from parent features', () => {
      const records = [
        createRecord('Age', {
          type: 'Features',
          description: 'Humans reach adulthood in their late teens.'
        }),
        createRecord('Age Detail', { type: 'Features', description: '' }, 'Age')
      ];

      const properties = {
        'data-datarecords': JSON.stringify(records)
      };

      const result = transformDnDRace({ name: 'Human' }, mockBook, properties);
      
      expect(result['data-features']).toBeDefined();
      const features = result['data-features']['level-1'];
      
      const ageFeature = features.find(f => f.label === 'Age');
      
      expect(ageFeature).toBeDefined();
      expect(ageFeature.description).toContain('late teens');
      expect(ageFeature['data-effects']).toBeUndefined();
      expect(ageFeature['data-spells']).toBeUndefined();
    });

    it('ignores "Species" and "Size" type records in aggregation', () => {
      const records = [
        createRecord('Elf', { type: 'Species' }),
        createRecord('Medium', { type: 'Size' }),
      ];

      const properties = {
        'data-datarecords': JSON.stringify(records),
      };

      const result = transformDnDRace({ name: 'Elf' }, mockBook, properties);

      expect(result['data-features']).toBeUndefined();
    });
  });

  describe('Subrace Handling', () => {
    it('sets data-compatibility when Parent Race property exists', () => {
      const properties = {
        'Parent Race': 'Elf',
      };

      const result = transformDnDRace({ name: 'High Elf' }, mockBook, properties);

      expect(result['data-compatibility']).toBeDefined();
      expect(result['data-compatibility']).toHaveLength(1);
      expect(result['data-compatibility'][0]).toEqual({
        name: 'Elf',
        sourceBook: 123,
      });
    });
  });
});
