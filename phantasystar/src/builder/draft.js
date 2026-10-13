import { normalizeLevelUp } from './levelUp.js';

export const DRAFT_VERSION = 1;

export const pagePointer = ({ pageName = '', categoryName = '', expansionId = '' } = {}) => ({
  pageName: String(pageName ?? ''),
  categoryName: String(categoryName ?? ''),
  expansionId: String(expansionId ?? ''),
});

const text = (value) => String(value ?? '');

const choiceMap = (value) =>
  Object.fromEntries(
    Object.entries(value && typeof value === 'object' ? value : {})
      .map(([k, v]) => [k, Array.isArray(v) ? v.join('|') : text(v)])
      .filter(([, v]) => v !== ''),
  );

const needMap = (value) =>
  Object.fromEntries(
    Object.entries(value && typeof value === 'object' ? value : {})
      .map(([k, n]) => [k, Math.max(1, Math.trunc(Number(n)) || 1)]),
  );

const amounts = (value) => {
  if (Array.isArray(value)) return Object.fromEntries(value.filter((n) => typeof n === 'string').map((n) => [n, 1]));
  return Object.fromEntries(
    Object.entries(value && typeof value === 'object' ? value : {})
      .map(([k, n]) => [k, Number(n)])
      .filter(([, n]) => Number.isInteger(n) && n !== 0),
  );
};

const pick = (value) =>
  value && value.pageName
    ? { ...pagePointer(value), choices: choiceMap(value.choices), needs: needMap(value.needs) }
    : null;

export const MAX_LEVEL = 20;

const level = (value) => Math.min(MAX_LEVEL, Math.max(1, Math.trunc(Number(value)) || 1));

export const emptyDraft = () => ({
  v: DRAFT_VERSION,
  concept: { name: '', concept: '' },
  setting: '',
  level: 1,
  species: null,
  background: null,
  profession: null,
  path: null,
  abilities: {
    method: '', values: {}, bonusMode: 'two', bonuses: {}, improvements: {}, rolled: '',
    feats: {}, featsFor: '', featPicks: {}, limited: {},
  },
  hp: { method: 'average', rolled: '', die: 0 },
  skills: { ranks: {}, picks: {}, doneFor: '' },
  techniques: { picks: {}, doneFor: '' },
  equipment: { kit: '', picks: {}, doneFor: '' },
  story: { storyBonds: '', history: '', appearance: '' },
  skipped: false,
  built: false,
  levelUp: null,
});

export const normalizeDraft = (stored) => {
  const base = emptyDraft();
  if (!stored || typeof stored !== 'object') return base;
  const abilities = stored.abilities ?? {};
  const story = stored.story ?? {};
  return {
    ...base,
    concept: { name: text(stored.concept?.name), concept: text(stored.concept?.concept) },
    setting: ['classic', 'pso', 'any'].includes(stored.setting) ? stored.setting : '',
    level: level(stored.level),
    species: pick(stored.species),
    background: pick(stored.background),
    profession: pick(stored.profession),
    path: pick(stored.path),
    abilities: {
      method: text(abilities.method),
      values: { ...(abilities.values ?? {}) },
      bonusMode: abilities.bonusMode === 'one' ? 'one' : 'two',
      bonuses: amounts(abilities.bonuses),
      improvements: amounts(abilities.improvements),
      rolled: text(abilities.rolled),
      feats: choiceMap(abilities.feats),
      featsFor: text(abilities.featsFor),
      featPicks: choiceMap(abilities.featPicks),
      limited: choiceMap(abilities.limited),
    },
    hp: {
      method: stored.hp?.method === 'roll' ? 'roll' : 'average',
      rolled: text(stored.hp?.rolled),
      die: Number.isInteger(Number(stored.hp?.die)) ? Number(stored.hp?.die) : 0,
    },
    skills: {
      ranks: Object.fromEntries(
        Object.entries(stored.skills?.ranks ?? {})
          .filter(([, placed]) => placed && typeof placed === 'object')
          .map(([key, placed]) => [key, amounts(placed)]),
      ),
      picks: choiceMap(stored.skills?.picks),
      doneFor: text(stored.skills?.doneFor),
    },
    techniques: { picks: choiceMap(stored.techniques?.picks), doneFor: text(stored.techniques?.doneFor) },
    equipment: {
      kit: ['a', 'b'].includes(stored.equipment?.kit) ? stored.equipment.kit : '',
      picks: choiceMap(stored.equipment?.picks),
      doneFor: text(stored.equipment?.doneFor),
    },
    story: { storyBonds: text(story.storyBonds), history: text(story.history), appearance: text(story.appearance) },
    skipped: !!stored.skipped,
    built: !!stored.built,
    levelUp: normalizeLevelUp(stored.levelUp),
  };
};

export const picksOf = (draftPick, key) => text(draftPick?.choices?.[key]).split('|').filter(Boolean);

export const needsMet = (draftPick, draft) =>
  !!draftPick
  && Object.entries(draftPick.needs ?? {}).every(([key, count]) =>
    key.startsWith('later:')
    || (key === 'path' ? !!draft?.path && needsMet(draft.path, draft) : picksOf(draftPick, key).length >= count));
