import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useThreadOfFateStore } from '@/sheet/stores';
import {
  getLife,
  getStamina,
  getArmorClass,
  getAbilityScores,
  setLife,
} from '@/relay/handlers/computed';

/**
 * Round-trips the maker draft through the master store's dehydrate (what Roll20
 * stores) and back through the Beacon computed getters (what macros/token bars
 * read). Guards against the Roll20 bindings silently regressing.
 */
describe('Roll20 dehydrate -> computed round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  function build() {
    const store = useThreadOfFateStore();
    store.draft.reset();
    store.draft.draft.classBuild.startingLevel = 1;
    store.draft.draft.classBuild.classes = [{ classId: 'reclaimer', level: 1 }];
    store.draft.draft.stats.assigned = {
      might: 16,
      instinct: 14,
      focus: 10,
      conviction: 14,
      resonance: 10,
      presence: 10,
    };
    return store;
  }

  it('exposes HP/Stamina/AC/abilityScores from the dehydrated character', () => {
    const store = build();
    const character = store.dehydrateStore() as any;
    expect(character.attributes.draft).toBeTruthy();

    const life = getLife({ character });
    expect(life.max).toBeGreaterThan(0);
    expect(life.current).toBe(life.max);

    expect(getStamina({ character }).max).toBeGreaterThan(0);
    expect(getArmorClass({ character }).current).toBeGreaterThan(0);
    expect(getAbilityScores({ character }).Might.current).toBe(16);
  });

  it('setLife writes current HP back into the draft blob', () => {
    const store = build();
    const character = store.dehydrateStore() as any;
    let written: any = null;
    const dispatch = {
      update: (u: any) => {
        written = u;
      },
    } as any;

    setLife({ character, dispatch }, '7');
    expect(written.character.attributes.draft.play.currentHp).toBe(7);
  });
});
