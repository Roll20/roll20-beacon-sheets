import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import type { CharacterDraft } from '@/maker/draftModel';
import { draftDerived, draftFinalScores, draftModifiers } from '@/maker/rules/selectors';
import { playResources } from '@/maker/rules/playState';
import { ATTRIBUTES } from '@/maker/data/attributes';

/*
 * Beacon "computed" properties expose sheet data to Roll20 macros, inline rolls,
 * and token bars. Everything is derived live from the maker's CharacterDraft,
 * which dehydrateStore() writes to `character.attributes.draft`.
 */

const getDraft = (character: Character): CharacterDraft | null =>
  (character.attributes?.draft as unknown as CharacterDraft | undefined) ?? null;

/* Resolve "+N" / "-N" / "N" against an old value (used by token-bar setters). */
const applyChange = (oldValue: number, newValue: number | string) => {
  if (typeof newValue === 'string') newValue = newValue.trim();
  const operator = typeof newValue === 'string' ? newValue[0] : false;
  if (typeof newValue === 'string' && (operator === '-' || operator === '+')) {
    const intValue = parseInt(newValue.substring(1));
    if (isNaN(intValue)) return oldValue;
    return operator === '+' ? oldValue + intValue : oldValue - intValue;
  }
  const intValue = typeof newValue === 'string' ? parseInt(newValue) : newValue;
  return isNaN(intValue) ? oldValue : intValue;
};

/* Write a patched draft back to Roll20 (token-bar edits flow through here). */
const writeDraft = (dispatch: Dispatch, character: Character, draft: CharacterDraft) => {
  dispatch.update({
    character: {
      id: character.id,
      attributes: { updateId: 'TOKENCHANGE', draft: draft as unknown as Record<string, never> },
    },
  });
};

// @{name|abilityScores.Might.current} / .modifier
export const getAbilityScores = ({ character }: { character: Character }) => {
  const draft = getDraft(character);
  if (!draft) return {};
  const scores = draftFinalScores(draft);
  const mods = draftModifiers(draft);
  const out: Record<string, { current: number; modifier: number }> = {};
  for (const a of ATTRIBUTES) {
    out[a.label] = { current: scores[a.key], modifier: mods[a.key] };
  }
  return out;
};

export const getBio = ({ character }: { character: Character }) => {
  const draft = getDraft(character);
  if (!draft) return {};
  const { description, lore, allies, enemies } = draft.bio;
  return { description, lore, allies, enemies };
};

// Token bar: Health (current / max)
export const getLife = ({ character }: { character: Character }) => {
  const draft = getDraft(character);
  if (!draft) return { current: 0, max: 0 };
  const res = playResources(draft);
  return { current: res.currentHp, max: res.maxHp };
};
export const setLife = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: any[]
) => {
  const draft = getDraft(character);
  if (!draft) return;
  const res = playResources(draft);
  const next = Math.max(0, Math.min(res.maxHp, applyChange(res.currentHp, args[0])));
  writeDraft(dispatch, character, { ...draft, play: { ...draft.play, currentHp: next } });
};

// Token bar: Stamina (current / max)
export const getStamina = ({ character }: { character: Character }) => {
  const draft = getDraft(character);
  if (!draft) return { current: 0, max: 0 };
  const res = playResources(draft);
  return { current: res.currentStamina, max: res.maxStamina };
};
export const setStamina = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: any[]
) => {
  const draft = getDraft(character);
  if (!draft) return;
  const res = playResources(draft);
  const next = Math.max(0, Math.min(res.maxStamina, applyChange(res.currentStamina, args[0])));
  writeDraft(dispatch, character, { ...draft, play: { ...draft.play, currentStamina: next } });
};

// Token bar: Aether (current / max)
export const getAether = ({ character }: { character: Character }) => {
  const draft = getDraft(character);
  if (!draft) return { current: 0, max: 0 };
  const res = playResources(draft);
  return { current: res.currentAether, max: res.maxAether };
};
export const setAether = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: any[]
) => {
  const draft = getDraft(character);
  if (!draft) return;
  const res = playResources(draft);
  const next = Math.max(0, Math.min(res.maxAether, applyChange(res.currentAether, args[0])));
  writeDraft(dispatch, character, { ...draft, play: { ...draft.play, currentAether: next } });
};

// Read-only token bar: Armor Class
export const getArmorClass = ({ character }: { character: Character }) => {
  const draft = getDraft(character);
  return { current: draft ? draftDerived(draft).armorClass : 0 };
};
