import { describe, it, expect } from 'vitest';
import { getModifiedValue } from '../handlers/effects';
import type { Character } from '@roll20-official/beacon-sdk';
import { v4 as uuidv4 } from 'uuid';

const createMockCharacter = (
  effects: Record<string, any> = {}, 
  equipment: Record<string, any> = {}
): Character => {
  return {
    id: 'char-123',
    attributes: {
      modifiers: {
        effects
      },
      equipment: {
        equipment
      }
    }
  } as unknown as Character;
};

const createEffectData = (
  id: string, 
  attr: string, 
  val: number, 
  op: string = 'add',
  position: number = 0,
  extra: any = {}
) => {
  return {
    _id: id,
    arrayPosition: position,
    label: 'Test Effect',
    enabled: true,
    effects: {
      '0': {
        _id: uuidv4(),
        arrayPosition: 0,
        attribute: attr,
        operation: op,
        value: val,
        formula: '',
        ...extra.singleEffect
      }
    },
    actions: {},
    ...extra.parent
  };
};

describe('Relay Effects Handler', () => {
  
  it('should calculate a basic modified value (Base + Add)', () => {
    const effectId = uuidv4();
    const effects = {
      [effectId]: createEffectData(effectId, 'strength', 2)
    };
    
    const character = createMockCharacter(effects);
    
    const result = getModifiedValue(10, 'strength', [], character);
    expect(result).toBe(12);
  });

  it('should handle set-base operations correctly', () => {
    const effectId = uuidv4();
    const effects = {
      [effectId]: createEffectData(effectId, 'dexterity', 15, 'set-base')
    };
    
    const character = createMockCharacter(effects);
    
    const result = getModifiedValue(10, 'dexterity', [], character);
    expect(result).toBe(15);
  });

  it('should verify "equipped" requirement is respected', () => {
    const effectId = uuidv4();
    
    const effects = {
      [effectId]: createEffectData(effectId, 'armor-class', 2, 'add', 0, {
        parent: { required: { '0': 'equipped' } } 
      })
    };

    // Item exists but is NOT equipped
    const charNotEquipped = createMockCharacter(effects, {
      [uuidv4()]: {
        _id: uuidv4(),
        name: 'Shield',
        effectId: effectId, 
        equipped: false
      }
    });

    const result1 = getModifiedValue(10, 'armor-class', [], charNotEquipped);
    expect(result1).toBe(10); 

    // Item exists and is equipped
    const charEquipped = createMockCharacter(effects, {
      [uuidv4()]: {
        _id: uuidv4(),
        name: 'Shield',
        effectId: effectId,
        equipped: true
      }
    });

    const result2 = getModifiedValue(10, 'armor-class', [], charEquipped);
    expect(result2).toBe(12);
  });

  it('should treat effects with missing item as inactive if they have requirements', () => {
    const effectId = uuidv4();
    
    const effects = {
      [effectId]: createEffectData(effectId, 'armor-class', 2, 'add', 0, {
        parent: { required: { '0': 'equipped' } } 
      })
    };

    const character = createMockCharacter(effects, {});

    const result = getModifiedValue(10, 'armor-class', [], character);
    expect(result).toBe(10); 
  });

  it('should handle picker requirements ($picker)', () => {
    const effectId = uuidv4();
    
    const effects = {
      [effectId]: createEffectData(effectId, 'damage', 5, 'add', 0, {
        parent: { 
          pickers: { '0': { label: 'Type', value: 'fire', options: {} } },
          required: { '0': '$picker:0==fire' } 
        }
      })
    };

    const character = createMockCharacter(effects);
    const result = getModifiedValue(0, 'damage', [], character);
    expect(result).toBe(5);
  });

  it('should apply constraints (min/max)', () => {
    const effectId = uuidv4();
    const effects = {
      [effectId]: createEffectData(effectId, 'hp', 50, 'add')
    };
    
    const character = createMockCharacter(effects);
    
    // Constrain between [0, 20]. Should be 20.
    const result = getModifiedValue(10, 'hp', [0, 20], character);
    expect(result).toBe(20);
  });

  it('should process multiple effects in priority order (set-base before add)', () => {
    const id1 = uuidv4();
    const id2 = uuidv4();

    const effects = {
      [id1]: createEffectData(id1, 'score', 5, 'add', 0),     
      [id2]: createEffectData(id2, 'score', 15, 'set-base', 1) 
    };

    const character = createMockCharacter(effects);

    const result = getModifiedValue(10, 'score', [], character);
    expect(result).toBe(20); 
  });

  it('should handle missing equipment property gracefully (defaults to empty)', () => {
    const effectId = uuidv4();
    const effects = {
      [effectId]: createEffectData(effectId, 'armor-class', 2, 'add', 0, {
        parent: { required: { '0': 'equipped' } } 
      })
    };

    const character = {
      id: 'char-123',
      attributes: {
        modifiers: { effects },
        equipment: {}
      }
    } as unknown as Character;

    const result = getModifiedValue(10, 'armor-class', [], character);
    expect(result).toBe(10); 
  });

  it('should ignore disabled effects', () => {
    const effectId = uuidv4();
    const effects = {
      [effectId]: createEffectData(effectId, 'strength', 5, 'add', 0, {
        parent: { enabled: false }
      })
    };
    
    const character = createMockCharacter(effects);
    
    const result = getModifiedValue(10, 'strength', [], character);
    expect(result).toBe(10); 
  });

  it('should handle missing effects property gracefully (defaults to empty)', () => {
    const character = {
      id: 'char-123',
      attributes: {
        modifiers: {}, 
        equipment: { equipment: {} }
      }
    } as unknown as Character;

    const result = getModifiedValue(10, 'strength', [], character);
    expect(result).toBe(10);
  });
});