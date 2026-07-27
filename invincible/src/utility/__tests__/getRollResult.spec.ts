import { describe, it, expect, vi } from 'vitest';
import { actionRollSolver, actionDamageRollSolver } from '../../system/rolls/action';
import type { RollParameters } from '@/rolltemplates/rolltemplates';

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: null },
  initValues: {
    character: { id: 'test-character-id' }
  }
}));

describe('actionRollSolver', () => {
  it('correctly counts successes (sixes) on d6s, sets modifiers to 0, and posts to chat', async () => {
    const args: RollParameters = {
      title: 'Test Check',
      components: [
        { rollFormula: '3d6 + 5', label: 'Check' }
      ]
    };

    const mockRollResult = {
      results: {
        'dice-0': {
          results: {
            result: 19, 
            expression: '3d6 + 5',
            rolls: [
              {
                dice: 3,
                sides: 6,
                results: [6, 6, 2]
              }
            ]
          }
        }
      }
    };

    const dispatch = {
      roll: vi.fn().mockResolvedValue(mockRollResult),
      post: vi.fn().mockResolvedValue({})
    } as any;

    const total = await actionRollSolver(args, dispatch);

    
    expect(dispatch.roll).toHaveBeenCalled();

    
    
    
    
    expect(total).toBe(2);

    
    expect(dispatch.post).toHaveBeenCalled();
    const postCall = dispatch.post.mock.calls[0][0];
    expect(postCall.characterId).toBe('test-character-id');
    expect(typeof postCall.content).toBe('string');
  });

  it('sets non-d6 dice to 0 success value', async () => {
    const args: RollParameters = {
      title: 'Mixed Dice Check',
      components: [
        { rollFormula: '2d10', label: 'Mixed Roll' }
      ]
    };

    const mockRollResult = {
      results: {
        'dice-0': {
          results: {
            result: 15, 
            expression: '2d10',
            rolls: [
              {
                dice: 2,
                sides: 10,
                results: [8, 7]
              }
            ]
          }
        }
      }
    };

    const dispatch = {
      roll: vi.fn().mockResolvedValue(mockRollResult),
      post: vi.fn().mockResolvedValue({})
    } as any;

    const total = await actionRollSolver(args, dispatch);

    
    expect(total).toBe(0);
    expect(dispatch.post).toHaveBeenCalled();
  });

  it('handles static modifiers and manual bonuses by setting their success contribution to 0', async () => {
    const args: RollParameters = {
      title: 'Check with Static Bonus',
      components: [
        { sides: 6, count: 2, label: 'Base' },
        { label: 'Static Modifier', value: 4 }
      ]
    };

    const mockRollResult = {
      results: {
        'dice-0': {
          results: {
            result: 12, 
            expression: '2d6',
            rolls: [
              {
                dice: 2,
                sides: 6,
                results: [6, 6]
              }
            ]
          }
        }
      }
    };

    const dispatch = {
      roll: vi.fn().mockResolvedValue(mockRollResult),
      post: vi.fn().mockResolvedValue({})
    } as any;

    const total = await actionRollSolver(args, dispatch);

    
    
    
    expect(total).toBe(2);
    expect(dispatch.post).toHaveBeenCalled();
  });
});

describe('actionDamageRollSolver', () => {
  it('correctly separates action check (successes) and damage check (totals)', async () => {
    const args: RollParameters = {
      title: 'Slugfest Roll',
      components: {
        action: [
          { rollFormula: '3d6', label: 'Fighting' }
        ],
        damage: [
          { value: 4, label: 'Slugfest Damage' }
        ]
      }
    };

    const mockRollResult = {
      results: {
        'dice-0': {
          results: {
            result: 14,
            expression: '3d6',
            rolls: [
              {
                dice: 3,
                sides: 6,
                results: [6, 6, 2]
              }
            ]
          }
        },
        'dice-1': {
          results: {
            result: 4,
            expression: '4'
          }
        }
      }
    };

    const dispatch = {
      roll: vi.fn().mockResolvedValue(mockRollResult),
      post: vi.fn().mockResolvedValue({})
    } as any;

    const result = await actionDamageRollSolver(args, dispatch);

    expect(dispatch.roll).toHaveBeenCalled();
    expect(dispatch.post).toHaveBeenCalled();

    
    expect(result).toEqual({ successes: 2, damage: 4 });

    const postCall = dispatch.post.mock.calls[0][0];
    expect(postCall.characterId).toBe('test-character-id');
    expect(typeof postCall.content).toBe('string');
  });
});
