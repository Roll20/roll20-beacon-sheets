import { picksOf } from './draft.js';
import { choicesOf } from './choices.js';
import { abilityRows, bonusShape, poolOf, poolLeft, pointsLeft, currentLimited, limitedIncrease } from './abilities.js';
import { abilityPoints } from './steps.js';
import { hpReady, levelsPastFirst } from './hp.js';
import { skillAllotments, proficiencyChoices, allotmentSpent } from './skills.js';
import { techniquePools, eligibleFor } from './techniques.js';
import { kitOf, equipmentPicks } from './equipment.js';
import { creationSlots, currentFeats, draftHolds, featBlocks, FEAT_PENDING } from './feats.js';
import { featOptionDone, featPrefix } from './featChoices.js';

const DEFAULT_NAME = 'New Character';

const capitalized = (text) => String(text ?? '').replace(/^\w/, (c) => c.toUpperCase());
const left = (n) => (n > 1 ? ` (${n} left)` : '');
const sum = (map) => Object.values(map).reduce((a, b) => a + b, 0);
const names = (value) => String(value ?? '').split('|').filter(Boolean);

const pageItems = (kind, draft, option, level) => {
  const pick = draft[kind];
  if (!pick) return ['Not chosen'];
  const labels = option ? Object.fromEntries(choicesOf(option, level).now.map((c) => [c.key, c.label])) : {};
  const out = [];
  for (const [key, count] of Object.entries(pick.needs ?? {})) {
    if (key.startsWith('later:') || key === 'path') continue;
    const missing = count - picksOf(pick, key).length;
    if (missing > 0) out.push(`${labels[key] ?? key}${left(missing)}`);
  }
  return out;
};

export const openItems = ({ draft, pages = {}, techniques = [], feats = [] }) => {
  const out = [];
  const add = (step, text, source = '') => out.push({ step, text, source });
  const level = draft.level ?? 1;

  const name = String(draft.concept?.name ?? '').trim();
  if (!name || name === DEFAULT_NAME) add('concept', 'Name');

  for (const text of pageItems('species', draft, pages.species, 1)) add('species', text);
  for (const text of pageItems('background', draft, pages.background, 1)) add('background', text);
  for (const text of pageItems('profession', draft, pages.profession, level)) add('profession', text);
  if (draft.profession?.needs?.path) {
    if (!draft.path) add('profession', 'Path');
    else for (const text of pageItems('path', draft, pages.path, level)) add('profession', text, draft.path.pageName);
  }
  const hitDie = pages.profession?.payload?.professionStats?.hitDie ?? null;
  if (draft.profession && !hpReady(draft.hp, level, hitDie)) {
    add('profession', `Hit points for levels 2–${level}${left(levelsPastFirst(level))}`);
  }

  const a = draft.abilities ?? {};
  const rows = abilityRows(a, limitedIncrease(draft));
  const unset = rows.filter((r) => r.base == null).length;
  if (unset) add('abilities', `Base values${left(unset)}`);
  else if (a.method === 'points' && pointsLeft(a) !== 0) add('abilities', `Points to spend${left(pointsLeft(a))}`);
  else if (poolOf(a) && poolLeft(a).length) add('abilities', `Base values${left(poolLeft(a).length)}`);
  const { count, amount } = bonusShape(a);
  const bonused = rows.filter((r) => r.bonus > 0);
  if (bonused.length !== count || bonused.some((r) => r.bonus !== amount)) {
    add('abilities', count === 1 ? `+${amount} to one ability` : `+${amount} to ${count} abilities`);
  }
  const points = abilityPoints(draft);
  const spent = sum(a.improvements ?? {});
  if (spent !== points) add('abilities', `Ability Improvement${left(points - spent)}`);
  const limited = currentLimited(draft);
  for (const slot of creationSlots(pages, level).filter((s) => s.from && !limited[s.key])) add('abilities', `${slot.name}: an ability`);
  const chosen = currentFeats(draft);
  const slots = creationSlots(pages, level).filter((s) => s.feat && chosen[s.key]);
  const blocks = featBlocks({ slots, chosen, feats, holdsAt: (at) => draftHolds(pages, draft, at) });
  for (const slot of slots) {
    const name = chosen[slot.key];
    if (name === FEAT_PENDING) add('abilities', `Feat (level ${slot.level})`);
    else if (blocks[slot.key]?.[name]) add('abilities', `${name}: ${blocks[slot.key][name]}`);
  }
  for (const f of pages.feats ?? []) {
    const option = f.choices?.option;
    const pick = draft.abilities?.featPicks?.[featPrefix(f.slotKey, f.option.pageName)];
    if (!featOptionDone(option, pick)) add('abilities', `${f.option.pageName}: ${option.count === 1 ? 'an option' : `${option.count} options`}`);
  }

  if (pages.species && pages.background && pages.profession) {
    for (const allot of skillAllotments(pages, level, draft.skills)) {
      const missing = allot.total - allotmentSpent(allot, draft.skills);
      if (missing > 0) add('skills', `${capitalized(allot.label)} (${missing} ${missing === 1 ? 'rank' : 'ranks'} left)`, allot.source);
      else if (missing < 0) add('skills', `${capitalized(allot.label)} (${-missing} too many)`, allot.source);
    }
    for (const c of proficiencyChoices(pages, level, draft.skills?.picks ?? {})) {
      if (!c.options.length) continue;
      const missing = Math.min(c.count, c.options.length) - names(draft.skills?.picks?.[c.key]).length;
      if (missing > 0) add('skills', `${capitalized(c.label)}${left(missing)}`, c.source);
    }
  } else add('skills', 'Species, background and profession first');

  if (pages.profession) {
    const profession = draft.profession.pageName;
    for (const pool of techniquePools(pages, level)) {
      const missing = Math.min(pool.count, eligibleFor(pool, techniques, { profession }).length)
        - names(draft.techniques?.picks?.[pool.key]).length;
      if (missing > 0) add('techniques', `${pool.label}${left(missing)}`);
    }
  } else add('techniques', 'Profession first');

  const kit = kitOf(pages.profession);
  if (!kit) add('equipment', 'Profession first');
  else {
    const kitId = draft.equipment?.kit;
    if (!kitId) add('equipment', 'Starting equipment A or B');
    const chosen = draft.equipment?.picks ?? {};
    const picks = equipmentPicks({
      professionName: draft.profession?.pageName ?? '',
      kitPicks: kitId === 'a' ? kit.a?.picks ?? [] : [],
      backgroundName: draft.background?.pageName ?? '',
      backgroundPicks: pages.background?.payload?.equipmentPicks ?? [],
    }, chosen);
    for (const p of picks) {
      const missing = p.count - names(chosen[p.key]).length;
      if (missing > 0) add('equipment', `${capitalized(p.label)}${left(missing)}`, p.source);
    }
  }

  const story = draft.story ?? {};
  if (![story.storyBonds, story.history, story.appearance].some((v) => String(v ?? '').trim())) {
    add('story', 'Story bonds, history or appearance');
  }

  return out;
};
