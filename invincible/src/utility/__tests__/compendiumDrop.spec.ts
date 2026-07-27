import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateEntry, applyCompendiumData, getCompendiumWrapperPlaceholder } from '../compendiumDrop';
import { compendium } from '@/schemas/compendium';
import { characterStore } from '@/sheet/stores';

describe('compendiumDrop utility', () => {
  let featureEntry: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    featureEntry = compendium.find(c => c.category === 'Features')!;
  });

  it('validates a standard flat payload successfully', () => {
    const payload = {
      name: 'Super Strength',
      type: 'talent',
      description: 'Gives extra muscle power',
      effects: { value: [] }
    };

    const res = validateEntry(JSON.stringify(payload), featureEntry.schema);
    expect(res.success).toBe(true);
    expect(res.data.isWrapper).toBe(false);
    expect(res.data.node.data.name).toBe('Super Strength');
  });

  it('validates a wrapper payload with children successfully', () => {
    const payload = {
      categoryName: 'Features',
      'data-payload': {
        name: 'Super Strength',
        type: 'talent',
        description: 'Gives extra muscle power',
        effects: { value: [] }
      },
      'data-children': [
        {
          categoryName: 'Actions',
          'data-payload': {
            name: 'Pummel',
            type: 'full',
            attributeUsed: 'strength',
            damage: '1d6',
            description: 'Hits hard'
          }
        },
        {
          categoryName: 'Actions',
          'data-payload': {
            name: 'Block',
            type: 'quick',
            attributeUsed: 'agility',
            description: 'Reduces damage'
          }
        }
      ]
    };

    const res = validateEntry(JSON.stringify(payload), featureEntry.schema);
    expect(res.success).toBe(true);
    expect(res.data.isWrapper).toBe(true);
    expect(res.data.node.data.name).toBe('Super Strength');
    expect(res.data.node.children).toHaveLength(2);
    expect(res.data.node.children[0].categoryName).toBe('Actions');
    expect(res.data.node.children[0].data.name).toBe('Pummel');
  });

  it('fails validation when parent schema contains errors', () => {
    const payload = {
      categoryName: 'Features',
      'data-payload': {
        
        effects: 123
      },
      'data-children': []
    };

    const res = validateEntry(JSON.stringify(payload), featureEntry.schema);
    expect(res.success).toBe(false);
    expect(res.error).toContain('effects');
  });

  it('fails validation when child category schema contains errors', () => {
    const payload = {
      categoryName: 'Features',
      'data-payload': {
        name: 'Super Strength',
        type: 'talent',
        description: 'Gives extra muscle power',
        effects: { value: [] }
      },
      'data-children': [
        {
          categoryName: 'Actions',
          'data-payload': {
            
            isDefault: { invalid: true }
          }
        }
      ]
    };

    const res = validateEntry(JSON.stringify(payload), featureEntry.schema);
    expect(res.success).toBe(false);
    expect(res.error).toContain('isDefault');
  });

  it('applies wrapper payload and links child IDs in the parent _children array', () => {
    const store = characterStore();

    
    store.features.list = [];
    store.actions.list = [];

    
    expect(store.features.list).toHaveLength(0);
    expect(store.actions.list).toHaveLength(0);

    const payload = {
      categoryName: 'Features',
      'data-payload': {
        name: 'Super Strength',
        type: 'talent',
        description: 'Gives extra muscle power',
        effects: { value: [] }
      },
      'data-children': [
        {
          categoryName: 'Actions',
          'data-payload': {
            name: 'Pummel',
            type: 'full',
            attributeUsed: 'strength',
            damage: '1d6',
            description: 'Hits hard'
          }
        },
        {
          categoryName: 'Actions',
          'data-payload': {
            name: 'Block',
            type: 'quick',
            attributeUsed: 'agility',
            description: 'Reduces damage'
          }
        }
      ]
    };

    const res = validateEntry(JSON.stringify(payload), featureEntry.schema);
    expect(res.success).toBe(true);

    applyCompendiumData(res.data, store.features.list);

    
    expect(store.features.list).toHaveLength(1);
    expect(store.features.list[0].name).toBe('Super Strength');
    
    
    expect(store.actions.list).toHaveLength(2);
    expect(store.actions.list[0].name).toBe('Pummel');
    expect(store.actions.list[1].name).toBe('Block');

    
    const childId1 = store.actions.list[0]._id;
    const childId2 = store.actions.list[1]._id;
    expect(childId1).toBeDefined();
    expect(childId2).toBeDefined();

    expect(store.features.list[0]._children).toEqual([childId1, childId2]);
  });

  it('generates placeholder wrappers without internal _children field', () => {
    const placeholder = getCompendiumWrapperPlaceholder(featureEntry);
    const parsed = JSON.parse(placeholder);
    
    expect(parsed).toHaveProperty('categoryName');
    expect(parsed).toHaveProperty('data-payload');
    expect(parsed).toHaveProperty('data-children');
    expect(parsed['data-payload']).not.toHaveProperty('_children');
    expect(parsed['data-children'][0].categoryName).toBe('Actions');
  });

  it('cascades deletion recursively when deleting a parent entity with children', () => {
    const store = characterStore();
    store.features.list = [];
    store.actions.list = [];

    const payload = {
      categoryName: 'Features',
      'data-payload': {
        name: 'Super Strength',
        type: 'talent',
        description: 'Gives extra muscle power',
        effects: { value: [] }
      },
      'data-children': [
        {
          categoryName: 'Actions',
          'data-payload': {
            name: 'Pummel',
            type: 'full',
            attributeUsed: 'strength',
            damage: '1d6',
            description: 'Hits hard'
          }
        },
        {
          categoryName: 'Actions',
          'data-payload': {
            name: 'Block',
            type: 'quick',
            attributeUsed: 'agility',
            description: 'Reduces damage'
          }
        }
      ]
    };

    const res = validateEntry(JSON.stringify(payload), featureEntry.schema);
    expect(res.success).toBe(true);

    applyCompendiumData(res.data, store.features.list);

    
    expect(store.features.list).toHaveLength(1);
    expect(store.actions.list).toHaveLength(2);

    const parentId = store.features.list[0]._id;

    
    const deleted = store.deleteEntity(parentId || '');
    expect(deleted).toBe(true);

    
    expect(store.features.list).toHaveLength(0);

    
    expect(store.actions.list).toHaveLength(0);
  });

  describe('Team Features compendium drop', () => {
    it('applies team feature successfully using onApply when user is in a team', async () => {
      const { sharedSettings } = await import('@/relay/relay');
      const store = characterStore();
      store.meta.id = 'char-123';

      
      const mockTeam = {
        _id: 'team-1',
        name: 'The Avengers',
        members: [{ _id: 'char-123', name: 'Iron Man' }],
        baseFeatures: []
      };
      sharedSettings.value = {
        teams: JSON.stringify([mockTeam])
      };

      const teamFeatureEntry = compendium.find(c => c.category === 'Team Features')!;
      expect(teamFeatureEntry).toBeDefined();
      expect(teamFeatureEntry.onApply).toBeDefined();

      const payload = {
        name: 'Tactical Cover',
        description: 'Take cover behind shields'
      };

      const res = validateEntry(JSON.stringify(payload), teamFeatureEntry.schema);
      expect(res.success).toBe(true);

      
      await teamFeatureEntry.onApply!(res.data.node.data);

      
      const rawTeams = sharedSettings.value.teams;
      const updatedTeams = typeof rawTeams === 'string' ? JSON.parse(rawTeams) : rawTeams;
      expect(updatedTeams[0].baseFeatures).toHaveLength(1);
      expect(updatedTeams[0].baseFeatures[0].name).toBe('Tactical Cover');
      expect(updatedTeams[0].baseFeatures[0].description).toBe('Take cover behind shields');
      expect(updatedTeams[0].baseFeatures[0]._id).toBeDefined();
    });

    it('gracefully no-ops and warns when user is not in a team', async () => {
      const { sharedSettings } = await import('@/relay/relay');
      const store = characterStore();
      store.meta.id = 'char-999'; 

      const mockTeam = {
        _id: 'team-1',
        name: 'The Avengers',
        members: [{ _id: 'char-123', name: 'Iron Man' }],
        baseFeatures: []
      };
      sharedSettings.value = {
        teams: JSON.stringify([mockTeam])
      };

      const teamFeatureEntry = compendium.find(c => c.category === 'Team Features')!;

      const payload = {
        name: 'Tactical Cover'
      };

      const res = validateEntry(JSON.stringify(payload), teamFeatureEntry.schema);
      await teamFeatureEntry.onApply!(res.data.node.data);

      const rawTeams = sharedSettings.value.teams;
      const updatedTeams = typeof rawTeams === 'string' ? JSON.parse(rawTeams) : rawTeams;
      expect(updatedTeams[0].baseFeatures).toHaveLength(0); 
    });
  });
});

