import { describe, it, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { generateEntityFromPrompt } from './generateEntityDraft';
import { buildTokenPayload } from './deployToCharacter';
import { crucibleSheetActions } from '@/relay/handlers/crucibleActions';
import {
  getCrucibleHp,
  setCrucibleHp,
  getCrucibleAp,
  getCrucibleAether,
} from '@/relay/handlers/crucibleComputed';
import { useThreadOfFateStore } from '@/sheet/stores';
import { useCrucibleCharacterStore } from '@/crucible/store/crucibleCharacter.store';
import type { Character, Dispatch } from '@roll20-official/beacon-sdk';

const NOW = '2026-08-07T00:00:00.000Z';

/** A minimal fake Roll20 host capturing everything the sheet sends. */
function fakeHost() {
  const calls: Record<string, unknown[]> = {
    post: [],
    roll: [],
    update: [],
    updateTokensByCharacter: [],
    addToTracker: [],
    addActionsToHost: [],
  };
  const dispatch = {
    post: async (args: unknown) => {
      calls.post.push(args);
      return 'msg';
    },
    roll: async ({ rolls }: { rolls: Record<string, string> }) => {
      const results: Record<string, unknown> = {};
      for (const [key, formula] of Object.entries(rolls)) {
        results[key] = {
          results: {
            result: 10,
            expression: formula,
            rolls: [{ dice: 1, sides: 20, results: [10] }],
          },
        };
      }
      return { results };
    },
    update: (args: unknown) => calls.update.push(args),
    updateCharacter: (args: unknown) => calls.update.push(args),
    updateTokensByCharacter: async (args: unknown) => {
      calls.updateTokensByCharacter.push(args);
    },
    addToTracker: async (args: unknown) => {
      calls.addToTracker.push(args);
    },
    addActionsToHost: (args: unknown) => calls.addActionsToHost.push(args),
    getTokens: async () => ({ selected: [], tokens: [{ id: 'tok-1' }] }),
    characters: {},
  } as unknown as Dispatch;
  return { dispatch, calls };
}

function deployedCharacter(prompt: string): Character {
  const { entity } = generateEntityFromPrompt(prompt, { id: 'vtt-e1', now: NOW });
  return {
    id: 'char-1',
    attributes: { crucible: entity as unknown as Record<string, never> },
  } as unknown as Character;
}

// ---------------------------------------------------------------------------
// Token defaults (parity: NPC default token in the D&D sheet)
// ---------------------------------------------------------------------------

describe('buildTokenPayload', () => {
  it('links bars to computed values and sizes the token from the grid footprint', () => {
    const { entity } = generateEntityFromPrompt('a huge undead boss for 4 level 9 players', {
      id: 'tok-e1',
      now: NOW,
    });
    const payload = buildTokenPayload(entity);
    expect(payload.bar1_link).toBe('crucible_hp');
    expect(payload.width).toBe(entity.token.gridWidth * 70);
    expect(payload.height).toBe(entity.token.gridHeight * 70);
    expect(payload.name).toBe(entity.identity.name);
    expect(payload.showplayers_bar1).toBe(true);
    // GM-only bars stay hidden from players.
    expect(payload.showplayers_bar2).toBe(false);
  });

  it('leaves bars unlinked for minions so copies do not share HP', () => {
    const { entity } = generateEntityFromPrompt(
      'a pack of 6 goblin minions for 4 level 3 players',
      {
        id: 'tok-e2',
        now: NOW,
      },
    );
    const payload = buildTokenPayload(entity);
    expect(payload.bar1_link).toBeUndefined();
  });

  it('uses the concealed name when the GM hides identity', () => {
    const { entity } = generateEntityFromPrompt('a terrifying cathedral monster', {
      id: 'tok-e3',
      now: NOW,
    });
    entity.roll20.concealName = true;
    entity.roll20.concealedAs = 'Unknown Horror';
    expect(buildTokenPayload(entity).name).toBe('Unknown Horror');
  });
});

// ---------------------------------------------------------------------------
// Token-bar computed values against a deployed character
// ---------------------------------------------------------------------------

describe('crucible_* computed (token bars)', () => {
  it('reads HP/AP/Aether from the character attributes and applies damage temp-HP-first', () => {
    const character = deployedCharacter('a level 6 blackstone war beast for 4 level 6 players');
    const { dispatch, calls } = fakeHost();

    const hp = getCrucibleHp({ character });
    expect(hp.max).toBeGreaterThan(0);
    expect(hp.current).toBe(hp.max);
    expect(getCrucibleAp({ character }).max).toBeGreaterThan(0);
    expect(getCrucibleAether({ character })).toEqual({ current: 0, max: 0 });

    // Token-bar edit: "-5" damage writes play state back through dispatch.update.
    setCrucibleHp({ character, dispatch }, '-5');
    expect(calls.update.length).toBe(1);
    const written = calls.update[0] as {
      character: { attributes: { cruciblePlay: { currentHp: number } } };
    };
    expect(written.character.attributes.cruciblePlay.currentHp).toBe(hp.max - 5);
  });

  it('returns 0/0 for a plain PC character (no crucible attributes)', () => {
    const character = { id: 'pc', attributes: {} } as unknown as Character;
    expect(getCrucibleHp({ character })).toEqual({ current: 0, max: 0 });
  });
});

// ---------------------------------------------------------------------------
// Sheet actions (parity: clicking token buttons on an NPC token)
// ---------------------------------------------------------------------------

describe('crucible sheet actions', () => {
  it('initiative rolls, posts to chat, and adds the token to the turn tracker', async () => {
    const character = deployedCharacter('a level 5 feral beast for 4 level 5 players');
    const { dispatch, calls } = fakeHost();
    await crucibleSheetActions.crucible_roll_initiative.method({ dispatch, character });
    expect(calls.roll ?? []).toBeDefined();
    expect(calls.post.length).toBeGreaterThan(0);
    expect(calls.addToTracker.length).toBe(1);
    expect((calls.addToTracker[0] as { tokenId: string }).tokenId).toBe('tok-1');
  });

  it('use_action posts the action card (and damage) to chat', async () => {
    const character = deployedCharacter('a level 5 feral beast for 4 level 5 players');
    const entity = character.attributes.crucible as never as { actions: { id: string }[] };
    const attackId = entity.actions[entity.actions.length - 1].id;
    const { dispatch, calls } = fakeHost();
    await crucibleSheetActions.crucible_use_action.method(
      { dispatch, character },
      'vtt-e1',
      attackId,
    );
    expect(calls.post.length).toBeGreaterThan(0);
  });

  it('phase_transition advances the active phase and persists it', async () => {
    const character = deployedCharacter('a two-phase undead boss for 5 level 9 players');
    const { dispatch, calls } = fakeHost();
    await crucibleSheetActions.crucible_phase_transition.method({ dispatch, character });
    expect(calls.update.length).toBe(1);
    const written = calls.update[0] as {
      character: { attributes: { cruciblePlay: { activePhaseId: string } } };
    };
    expect(written.character.attributes.cruciblePlay.activePhaseId).toBeTruthy();
  });

  it('does nothing gracefully on a character with no crucible entity', async () => {
    const character = { id: 'pc', attributes: {} } as unknown as Character;
    const { dispatch, calls } = fakeHost();
    await crucibleSheetActions.crucible_roll_initiative.method({ dispatch, character });
    expect(calls.post.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GM gating through the master store (parity: players never see GM prep)
// ---------------------------------------------------------------------------

describe('master store GM gating', () => {
  it('GM sessions sync the library; player sessions neither read nor write it', () => {
    setActivePinia(createPinia());
    const sheet = useThreadOfFateStore();
    const { entity } = generateEntityFromPrompt('a terrifying cathedral monster', {
      id: 'gate-e1',
      now: NOW,
    });
    entity.identity.gmNotes = 'SECRET-PLOT';
    sheet.crucible.upsert(entity);

    // GM session: library is included in the Roll20 payload.
    sheet.setPermissions(true, true);
    const gmPayload = sheet.dehydrateStore();
    expect(Array.isArray(gmPayload.attributes.crucibleLibrary)).toBe(true);
    expect(gmPayload.attributes.crucibleLibrary.length).toBeGreaterThan(0);

    // Player session: the library never enters the payload...
    sheet.setPermissions(true, false);
    const playerPayload = sheet.dehydrateStore();
    expect(playerPayload.attributes.crucibleLibrary).toBeUndefined();
    expect(JSON.stringify(playerPayload)).not.toContain('SECRET-PLOT');
  });

  it('players hydrating a bound character receive the player-safe projection', () => {
    setActivePinia(createPinia());
    const sheet = useThreadOfFateStore();
    const { entity } = generateEntityFromPrompt(
      'Make a suspicious merchant who secretly knows where the Fallstar relic is.',
      { id: 'gate-e2', now: NOW },
    );
    entity.identity.gmNotes = 'THE-RELIC-LOCATION';
    if (entity.npc) entity.npc.secret = 'RELIC-SECRET';

    sheet.setPermissions(true, false); // player session
    sheet.hydrateStore({ crucible: entity }, undefined as never);

    const characterStore = useCrucibleCharacterStore();
    expect(characterStore.isBound).toBe(true);
    const stored = JSON.stringify(characterStore.bound);
    expect(stored).not.toContain('THE-RELIC-LOCATION');
    expect(stored).not.toContain('RELIC-SECRET');
  });

  it('a bound entity presents the character as the creature on dehydrate', () => {
    setActivePinia(createPinia());
    const sheet = useThreadOfFateStore();
    const { entity } = generateEntityFromPrompt('a level 4 gilded construct sentinel', {
      id: 'gate-e3',
      now: NOW,
    });
    sheet.setPermissions(true, true);
    sheet.crucibleCharacter.bind(entity);
    const payload = sheet.dehydrateStore();
    expect(payload.name).toBe(entity.identity.name);
    expect(payload.attributes.crucible).toBeTruthy();
    expect(payload.attributes.cruciblePlay).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Bound play state drives the bars (parity: sheet and token stay in step)
// ---------------------------------------------------------------------------

describe('crucibleCharacter store', () => {
  it('damage burns temp HP first and clamps at 0 and max', () => {
    setActivePinia(createPinia());
    const store = useCrucibleCharacterStore();
    const { entity } = generateEntityFromPrompt('a level 6 tank warden for 4 level 6 players', {
      id: 'play-e1',
      now: NOW,
    });
    store.bind(entity);
    const max = store.maxHp;
    expect(store.currentHp).toBe(max);

    store.play.tempHp = 5;
    store.adjustHp(-8);
    expect(store.play.tempHp).toBe(0);
    expect(store.currentHp).toBe(max - 3);

    store.adjustHp(-9999);
    expect(store.currentHp).toBe(0);
    store.adjustHp(9999);
    expect(store.currentHp).toBe(max);
  });

  it('rest() restores everything', () => {
    setActivePinia(createPinia());
    const store = useCrucibleCharacterStore();
    const { entity } = generateEntityFromPrompt('a level 8 arcane caster for 4 level 8 players', {
      id: 'play-e2',
      now: NOW,
    });
    store.bind(entity);
    store.adjustHp(-10);
    store.adjustAether(-3);
    store.markRechargeSpent('some-action');
    store.rest();
    expect(store.currentHp).toBe(store.maxHp);
    expect(store.currentAether).toBe(store.maxAether);
    expect(store.play.spentRecharges).toEqual({});
  });
});
