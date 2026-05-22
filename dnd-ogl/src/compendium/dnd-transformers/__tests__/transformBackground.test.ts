import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformDnDBackground } from '../transformBackground';


describe('transformDnDBackground', () => {
  const mockBook = { itemId: '123' };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Legacy Format', () => {
    it('creates a feature from data-description', () => {
      const rawPayload = { name: 'Hermit' };
      const properties = {
        'data-description': 'I live in a cave.',
      };

      const result = transformDnDBackground(rawPayload, mockBook, properties);

      expect(result.name).toBe('Hermit');
      expect(result['data-features']).toBeDefined();
      const features = result['data-features']['level-1'];
      
      expect(features).toHaveLength(1);
      expect(features[0]).toMatchObject({
        label: 'Hermit Features',
        group: 'background-features',
        description: 'I live in a cave.',
      });
    });

    it('returns empty object if no data found', () => {
      const result = transformDnDBackground({ name: 'Empty' }, mockBook, {});
      expect(result).toEqual({});
    });
  });

  describe('Modern Format (data-datarecords)', () => {
    it('transforms a description-only background', () => {
      const rawPayload = { name: 'Noble' };
      const records = [
        { 
          payload: JSON.stringify({ 
            type: 'Background', 
            description: 'You have a title.' 
          }) 
        }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDBackground(rawPayload, mockBook, properties);
      
      const features = result['data-features']['level-1'];
      expect(features).toHaveLength(1);
      expect(features[0].label).toBe('Noble Traits');
      expect(features[0].description).toBe('You have a title.');
    });

    it('transforms mechanical effects', () => {
      const rawPayload = { name: 'Soldier' };
      const records = [
        {
          payload: JSON.stringify({
            type: 'Ability Score',
            calculation: 'Add',
            ability: 'Strength',
            value: 2
          })
        },
        {
          payload: JSON.stringify({
            type: 'Proficiency',
            category: 'Skill',
            proficiency: 'Athletics'
          })
        }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDBackground(rawPayload, mockBook, properties);
      const mainFeature = result['data-features']['level-1'][0];
      const effectsData = mainFeature['data-effects'];

      const strEffect = effectsData.effects.find((e: any) => e.attribute === 'strength');
      expect(strEffect).toBeDefined();
      expect(strEffect).toMatchObject({
        operation: 'add',
        value: 2
      });

      const skillEffect = effectsData.effects.find((e: any) => e.attribute === 'athletics-proficiency');
      expect(skillEffect).toBeDefined();
      expect(skillEffect).toMatchObject({
        operation: 'set-max', 
        value: 1 
      });
    });

    it('transforms pickers and handles offsets', () => {
      const rawPayload = { name: 'Scholar' };
      const records = [
        {
          payload: JSON.stringify({
            type: 'Language Choice',
            numOfChoices: 1
          })
        },
        {
          payload: JSON.stringify({
            type: 'Ability Score Choice',
            choose: 2,
            increase: 1,
            from: ['Intelligence', 'Wisdom']
          })
        }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDBackground(rawPayload, mockBook, properties);
      const effectsData = result['data-features']['level-1'][0]['data-effects'];

      expect(effectsData.pickers).toHaveLength(3);

      expect(effectsData.pickers[0].label).toBe('Language Choice');
      const langEffect = effectsData.effects.find((e: any) => e.attribute === 'languages' && e.value === '$picker:0');
      expect(langEffect).toBeDefined();

      const abilityEffect1 = effectsData.effects.find((e: any) => e.attribute === '$picker:1');
      const abilityEffect2 = effectsData.effects.find((e: any) => e.attribute === '$picker:2');

      expect(abilityEffect1).toMatchObject({ operation: 'add', value: 1 });
      expect(abilityEffect2).toMatchObject({ operation: 'add', value: 1 });
    });

    it('separates "Features" type into distinct feature objects', () => {
      const rawPayload = { name: 'Outlander' };
      const records = [
        {
          payload: JSON.stringify({
            type: 'Background',
            description: 'Main background desc'
          })
        },
        {
          name: 'Wanderer', 
          payload: JSON.stringify({
            type: 'Features',
            name: 'Wanderer',
            description: 'You recall maps.'
          })
        }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDBackground(rawPayload, mockBook, properties);
      const features = result['data-features']['level-1'];

      expect(features).toHaveLength(2);

      expect(features[0].label).toBe('Outlander Traits');
      expect(features[0].description).toBe('Main background desc');

      expect(features[1].label).toBe('Wanderer');
      expect(features[1].description).toBe('You recall maps.');
      expect(features[1].group).toBe('background-features');
    });

    it('handles malformed records gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rawPayload = { name: 'Broken' };
      const records = [
        { payload: 'INVALID_JSON' }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDBackground(rawPayload, mockBook, properties);
      
      expect(result['data-features']).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});