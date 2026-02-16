import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformDnDFeature, transformDnDFeatureSet, mergeRecordsIntoFeatures } from '../transformFeature';

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
      const record = { name: 'Attack Action', payload };
      
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
      const record = { name: 'Ki Pool', payload };
      
      const result = transformDnDFeature(record);

      expect(result?.['data-effects']?.resources).toHaveLength(1);
      expect(result?.['data-effects']?.resources![0]).toMatchObject({
        name: 'Ki',
        count: 5,
        max: '5',
        refreshOnShortRest: 'all'
      });
    });

    it('places Spell Attach spells in data-spells instead of data-effects', () => {
      const payload = JSON.stringify({
        type: 'Spell Attach',
        spells: ['Speak with Animals'],
      });
      const record = { name: 'Druidic Spells', description: 'You can cast this spell.', payload };
      
      const result = transformDnDFeature(record);

      expect(result?.['data-spells']).toEqual([
        { name: 'Speak with Animals', spellSourceId: '$source:0' },
      ]);
      expect(result?.['data-effects']).toBeUndefined();
    });

    it('includes spellSources in data-effects when present', () => {
      const payload = JSON.stringify({
        type: 'Spellcasting',
        name: 'Innate Spellcasting',
        ability: 'Charisma',
      });
      const record = { name: 'Innate Casting', payload };

      const result = transformDnDFeature(record);

      expect(result?.['data-effects']?.spellSources).toBeDefined();
      expect(result?.['data-effects']?.spellSources[0]).toMatchObject({
        name: 'Innate Spellcasting',
        type: 'ability',
        ability: 'charisma',
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

    it('places Spell Attach spells in data-spells for hydration', () => {
      const rawPayload = { name: 'Feat with Spells', properties: { Category: 'Feats' } };
      const dataRecords = [
        { payload: JSON.stringify({ type: 'Features', description: 'Grants a spell.' }) },
        {
          name: 'SpellRec',
          description: 'Cast this spell.',
          payload: JSON.stringify({ type: 'Spell Attach', spells: ['Fireball'] }),
        },
      ];
      const properties = { 'data-datarecords': JSON.stringify(dataRecords) };

      const result = transformDnDFeatureSet(rawPayload, mockBook, properties);

      expect(result['data-spells']).toEqual([
        { name: 'Fireball', spellSourceId: '$source:0' },
      ]);
      expect(result['data-effects']?.spells ?? []).toEqual([]);
    });
  });

  describe('mergeRecordsIntoFeatures', () => {
    it('merges child Action records into their parent Features record', () => {
      const records = [
        {
          name: 'Martial Arts',
          level: '1',
          payload: JSON.stringify({ type: 'Features', description: 'Martial arts mastery.' }),
        },
        {
          name: 'Martial Arts Attack',
          level: '1',
          parent: 'Martial Arts',
          payload: JSON.stringify({
            type: 'Action',
            name: 'Martial Arts Strike',
            actionType: 'Action',
            description: 'Make a strike.',
          }),
        },
      ];

      const result = mergeRecordsIntoFeatures(records, records);

      expect(result).toHaveLength(1);
      expect(result[0].feature.label).toBe('Martial Arts');
      expect(result[0].feature.description).toBe('Martial arts mastery.');
      expect(result[0].feature['data-effects']).toBeDefined();
      expect(result[0].feature['data-effects'].actions).toHaveLength(1);
      expect(result[0].feature['data-effects'].actions[0].name).toBe('Martial Arts Strike');
      expect(result[0].level).toBe(1);
    });

    it('merges deeply nested children into the root ancestor', () => {
      const records = [
        {
          name: 'Martial Arts',
          level: '1',
          payload: JSON.stringify({ type: 'Features', description: 'Main feature.' }),
        },
        {
          name: 'Martial Arts Condition',
          level: '1',
          parent: 'Martial Arts',
          payload: JSON.stringify({ type: 'Effect', name: 'Martial Arts' }),
        },
        {
          name: 'Martial Arts Attack',
          level: '1',
          parent: 'Martial Arts Condition',
          payload: JSON.stringify({
            type: 'Attack',
            name: 'MA Attack',
            attack: { type: 'Melee', abilityBonus: 'Dexterity' },
            actionType: 'Action',
          }),
        },
      ];

      const result = mergeRecordsIntoFeatures(records, records);

      expect(result).toHaveLength(1);
      expect(result[0].feature.label).toBe('Martial Arts');
      expect(result[0].feature['data-effects'].actions).toHaveLength(1);
      expect(result[0].feature['data-effects'].actions[0].name).toBe('MA Attack');
    });

    it('keeps child Features records as separate features', () => {
      const records = [
        {
          name: "Monk's Focus",
          level: '2',
          payload: JSON.stringify({ type: 'Features', description: 'Focus points.' }),
        },
        {
          name: 'Focus Points',
          level: '2',
          parent: "Monk's Focus",
          payload: JSON.stringify({
            type: 'Resource',
            name: 'Focus Points',
            maxValueFormula: { flatValue: 2 },
            recoveryRate: { 'Short Rest': { type: 'Full' }, 'Long Rest': { type: 'Full' } },
          }),
        },
        {
          name: 'Flurry of Blows',
          level: '2',
          parent: "Monk's Focus",
          payload: JSON.stringify({ type: 'Features', description: 'Flurry of blows.' }),
        },
        {
          name: 'Flurry of Blows Action',
          level: '2',
          parent: 'Flurry of Blows',
          payload: JSON.stringify({
            type: 'Action',
            name: 'Flurry of Blows',
            actionType: 'Bonus Action',
            description: 'Make two unarmed strikes.',
          }),
        },
      ];

      const result = mergeRecordsIntoFeatures(records, records);

      // Should produce Monk's Focus (with Resource) and Flurry of Blows (with Action)
      expect(result).toHaveLength(2);

      const focusFeature = result.find((r) => r.feature.label === "Monk's Focus");
      expect(focusFeature).toBeDefined();
      expect(focusFeature!.feature.description).toBe('Focus points.');
      expect(focusFeature!.feature['data-effects'].resources).toHaveLength(1);
      expect(focusFeature!.feature['data-effects'].resources[0].name).toBe('Focus Points');

      const flurryFeature = result.find((r) => r.feature.label === 'Flurry of Blows');
      expect(flurryFeature).toBeDefined();
      expect(flurryFeature!.feature.description).toBe('Flurry of blows.');
      expect(flurryFeature!.feature['data-effects'].actions).toHaveLength(1);
      expect(flurryFeature!.feature['data-effects'].actions[0].name).toBe('Flurry of Blows');
    });

    it('treats records with no Features ancestor as standalones', () => {
      const records = [
        {
          name: 'Random Action',
          level: '5',
          payload: JSON.stringify({
            type: 'Action',
            name: 'Do Something',
            actionType: 'Action',
            description: 'A standalone action.',
          }),
        },
      ];

      const result = mergeRecordsIntoFeatures(records, records);

      expect(result).toHaveLength(1);
      expect(result[0].feature.label).toBe('Random Action');
      expect(result[0].feature['data-effects'].actions).toHaveLength(1);
    });

    it('excludes records not in the process set while still resolving parent chains', () => {
      const allRecords = [
        {
          name: 'Class Details',
          level: '1',
          payload: JSON.stringify({ type: 'Class Details', subclassLevel: 3 }),
        },
        {
          name: 'Save Prof',
          level: '1',
          parent: 'Class Details',
          payload: JSON.stringify({ type: 'Proficiency', category: 'Saving Throw', proficiency: 'Strength' }),
        },
        {
          name: 'Ki Feature',
          level: '2',
          payload: JSON.stringify({ type: 'Features', description: 'Ki points.' }),
        },
        {
          name: 'Ki Resource',
          level: '2',
          parent: 'Ki Feature',
          payload: JSON.stringify({
            type: 'Resource',
            name: 'Ki',
            maxValueFormula: { flatValue: 5 },
            recoveryRate: { 'Short Rest': { type: 'Full' } },
          }),
        },
      ];

      const recordsToProcess = allRecords.filter(
        (r) => r.name === 'Ki Feature' || r.name === 'Ki Resource',
      );

      const result = mergeRecordsIntoFeatures(allRecords, recordsToProcess);

      expect(result).toHaveLength(1);
      expect(result[0].feature.label).toBe('Ki');
      expect(result[0].feature['data-effects'].resources).toHaveLength(1);
    });

    it('merges proficiency effects from children into subclass feature', () => {
      const records = [
        {
          name: 'Implements of Mercy',
          level: '3',
          payload: JSON.stringify({
            type: 'Features',
            description: 'You gain proficiencies.',
          }),
        },
        {
          name: 'Insight Prof',
          level: '3',
          parent: 'Implements of Mercy',
          payload: JSON.stringify({
            type: 'Proficiency',
            category: 'Skill',
            proficiency: 'Insight',
            proficiencyLevel: 'Proficient',
          }),
        },
        {
          name: 'Medicine Prof',
          level: '3',
          parent: 'Implements of Mercy',
          payload: JSON.stringify({
            type: 'Proficiency',
            category: 'Skill',
            proficiency: 'Medicine',
            proficiencyLevel: 'Proficient',
          }),
        },
      ];

      const result = mergeRecordsIntoFeatures(records, records);

      expect(result).toHaveLength(1);
      expect(result[0].feature.label).toBe('Implements of Mercy');
      expect(result[0].feature['data-effects'].effects).toHaveLength(2);
    });

    it('does not create data-effects when no children have effect data', () => {
      const records = [
        {
          name: 'Simple Feature',
          level: '1',
          payload: JSON.stringify({ type: 'Features', description: 'Just a description.' }),
        },
      ];

      const result = mergeRecordsIntoFeatures(records, records);

      expect(result).toHaveLength(1);
      expect(result[0].feature['data-effects']).toBeUndefined();
    });

    it('handles circular parent references without infinite loop', () => {
      const records = [
        {
          name: 'A',
          level: '1',
          parent: 'B',
          payload: JSON.stringify({ type: 'Action', name: 'A', actionType: 'Action', description: '' }),
        },
        {
          name: 'B',
          level: '1',
          parent: 'A',
          payload: JSON.stringify({ type: 'Action', name: 'B', actionType: 'Action', description: '' }),
        },
      ];

      // both become orphans since no root found
      const result = mergeRecordsIntoFeatures(records, records);
      expect(result).toHaveLength(2);
    });
  });
});