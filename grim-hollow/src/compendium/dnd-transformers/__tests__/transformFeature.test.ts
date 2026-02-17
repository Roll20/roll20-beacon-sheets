import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformDnDFeature, transformDnDFeatureSet } from '../transformFeature';

describe('dnd-transformers/transformFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('transformDnDFeature', () => {
    it('returns null if payload is invalid json', () => {
      const record = { name: 'Bad Record', payload: '{ invalid json' };
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = transformDnDFeature(record);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('creates a basic feature from a Features type payload', () => {
      const payload = JSON.stringify({
        type: 'Features',
        description: 'Test Description'
      });
      const record = { name: 'Feature Name', payload };
      
      const result = transformDnDFeature(record);

      expect(result).toEqual({
        label: 'Feature Name',
        description: 'Test Description',
      });
      expect(result).not.toHaveProperty('data-effects');
    });

    it('constructs data-effects for Ability Score payload', () => {
      const payload = JSON.stringify({
        type: 'Ability Score',
        ability: 'Strength',
        calculation: 'Add',
        value: 1
      });
      const record = { name: 'Str Boost', payload };
      
      const result = transformDnDFeature(record);

      expect(result?.['data-effects']).toBeDefined();
      expect(result?.['data-effects']?.label).toBe('Str Boost');
      expect(result?.['data-effects']?.enabled).toBe(true);
      expect(result?.['data-effects']?.effects).toEqual([
        {
          attribute: 'strength',
          operation: 'add',
          value: 1
        }
      ]);
    });

    it('includes actions for Action type payload', () => {
      const payload = JSON.stringify({
        type: 'Action',
        name: 'Smack',
        actionType: 'Action',
        description: 'Hit hard'
      });
      const record = { name: 'Attack Feature', payload };
      
      const result = transformDnDFeature(record);

      expect(result?.['data-effects']?.actions).toHaveLength(1);
      expect(result?.['data-effects']?.actions![0]).toMatchObject({
        name: 'Smack',
        group: 'actions',
        description: 'Hit hard',
        isAttack: false
      });
    });

    it('handles fragments with resources', () => {
      const payload = JSON.stringify({
        type: 'Resource',
        name: 'Ki',
        maxValueFormula: { flatValue: 5 },
        recovery: 'Short Rest',
        recoveryRate: 'Full'
      });
      const record = { name: 'Ki Feature', payload };
      
      const result = transformDnDFeature(record);

      expect(result?.['data-effects']?.resources).toHaveLength(1);
      expect(result?.['data-effects']?.resources![0]).toMatchObject({
        name: 'Ki',
        count: 5,
        max: '5',
        refreshOnShortRest: 'all'
      });
    });
  });

  describe('transformDnDFeatureSet', () => {
    const mockBook = {};
    
    it('uses fallback legacy logic when data-datarecords is missing', () => {
      const rawPayload = { 
        name: 'Legacy Feat',
        properties: { Category: 'Feats' } 
      };
      const properties = {
        'data-description': 'Legacy Description',
        'Category': 'Feats'
      };

      const result = transformDnDFeatureSet(rawPayload, mockBook, properties);

      expect(result).toEqual({
        label: 'Legacy Feat',
        group: 'feats',
        description: 'Legacy Description',
      });
    });

    it('defaults to class-features group if not Feats category', () => {
      const rawPayload = { name: 'Class Feat' };
      const properties = { 'data-description': 'Desc' };
      const result = transformDnDFeatureSet(rawPayload, mockBook, properties);
      expect(result.group).toBe('class-features');
    });

    it('aggregates extended effect properties from multiple records', () => {
      const rawPayload = { name: 'Complex Feat', properties: { Category: 'Feats' } };
      
      const resourceRecord = {
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Res',
          maxValueFormula: { flatValue: 1 }
        })
      };
      
      const abilityRecord = {
        payload: JSON.stringify({
          type: 'Ability Score',
          ability: 'Dexterity',
          calculation: 'Add',
          value: 1
        })
      };

      const choiceRecord = {
        payload: JSON.stringify({
          type: 'Ability Score Choice',
          choose: 1,
          increase: 1,
          from: ['Strength']
        })
      };
      
      const properties = {
        'data-datarecords': JSON.stringify([resourceRecord, abilityRecord, choiceRecord])
      };

      const result = transformDnDFeatureSet(rawPayload, mockBook, properties);
      
      expect(result['data-effects']?.resources).toHaveLength(1);
      expect(result['data-effects']?.resources![0].name).toBe('Res');

      expect(result['data-effects']?.effects).toHaveLength(2); 
      
      expect(result['data-effects']?.pickers).toHaveLength(1);
      expect(result['data-effects']?.pickers![0].label).toContain('Ability Score Increase');
    });

    it('properly joins descriptions from multiple records', () => {
      const rawPayload = { name: 'Multi Desc', properties: {} };
      
      const mainFeatureRecord = { 
        payload: JSON.stringify({ type: 'Features', description: 'Main Description' }) 
      };

      const spellAttachRecord = {
        name: 'SpellRec',
        description: 'Spell Description',
        payload: JSON.stringify({ type: 'Spell Attach', spells: ['Fireball'] })
      };
      
      const properties = { 'data-datarecords': JSON.stringify([mainFeatureRecord, spellAttachRecord]) };
      
      const result = transformDnDFeatureSet(rawPayload, mockBook, properties);
      
      expect(result.description).toBe('Main Description\n\nSpell Description');
    });

    it('removes data-effects if empty after aggregation', () => {
      const rawPayload = { name: 'Text Only', properties: {} };
      const dataRecords = [{ payload: JSON.stringify({ type: 'Features', description: 'Just text' }) }];
      const properties = { 'data-datarecords': JSON.stringify(dataRecords) };

      const result = transformDnDFeatureSet(rawPayload, mockBook, properties);

      expect(result.description).toBe('Just text');
      expect(result['data-effects']).toBeUndefined();
    });
  });
});