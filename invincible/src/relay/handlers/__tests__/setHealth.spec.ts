import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setHealth } from '../handlers';
import { ruleSets } from '@/system';

vi.mock('@/system', () => {
  return {
    ruleSets: {
      health: vi.fn(),
      health_max: vi.fn(),
    },
  };
});

describe('setHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly calculates health update when subtracting more than current', async () => {
    vi.mocked(ruleSets.health).mockReturnValue(2);
    vi.mocked(ruleSets.health_max).mockReturnValue({ value: 2, modifiers: [] } as any);

    const dispatch = {
      update: vi.fn(),
    };

    const character = {
      id: 'char123',
      attributes: {
        combat: {
          health: 2,
          healthMax: 2,
        },
      },
    };

    await setHealth(
      {
        character: character as any,
        dispatch: dispatch as any,
      },
      "-20"
    );

    expect(dispatch.update).toHaveBeenCalledWith({
      character: {
        id: 'char123',
        attributes: {
          updateId: 'TOKENCHANGE',
          combat: {
            health: '0',
            healthMax: 2,
            criticalInjuries: expect.any(Object),
          },
        },
      },
    });
  });
});
