import { picksOf } from './draft.js';
import { finalAbilities, limitedIncrease } from './abilities.js';
import { keyCurrent } from './skills.js';
import { maxSkillRank } from '../rules/progression.js';
import { maxHp } from './hp.js';
import { equipmentPicks, optionItems } from './equipment.js';
import { draftFeats } from './feats.js';
import { featPrefix, settleFeat } from './featChoices.js';

const setPicks = (app, prefix, draftPick) => {
  for (const key of Object.keys(draftPick.choices ?? {})) {
    if (!key.startsWith('feature:')) continue;
    const [ref, asked] = key.slice('feature:'.length).split(':');
    const pick = picksOf(draftPick, key).join('|');
    for (const feature of app.sheet.features ?? []) {
      if (feature.ref !== ref || !String(feature.source ?? '').startsWith(prefix)) continue;
      if (!asked) feature.pick = pick;
      else {
        const line = `${asked.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}: ${pick.split('|').join(', ')}`;
        feature.text = [feature.text, line].filter(Boolean).join('\n\n');
      }
    }
  }
};

const PAGES = [
  {
    key: 'species',
    kind: 'species',
    apply: (app, mapped, draftPick, context) => {
      app.applySpecies(mapped);
      context.hpPerLevel = mapped.hpPerLevel ?? 0;
      const [size] = picksOf(draftPick, 'size');
      if (size) app.bio.size = size;
      setPicks(app, 'species:', draftPick);
      for (const row of mapped.features ?? []) {
        const [option] = picksOf(draftPick, `feature:${row.ref}`);
        const grants = row.optionTechniques?.[option];
        const feature = grants && (app.sheet.features ?? []).find((f) => f.ref === row.ref && String(f.source ?? '').startsWith('species:'));
        if (feature) feature.techniques = grants;
      }
    },
  },
  {
    key: 'background',
    kind: 'background',
    apply: (app, mapped, draftPick, context) => {
      app.applyBackground(mapped);
      setPicks(app, 'background:', draftPick);
      context.backgroundPicks = mapped.equipmentPicks ?? [];
    },
  },
  {
    key: 'profession',
    kind: 'profession',
    apply: (app, mapped, draftPick, context) => {
      app.applyProfession(mapped);
      setPicks(app, `profession:${mapped.id}:`, draftPick);
      context.pathLevel = mapped.pathLevel;
      context.hitDie = mapped.professionStats?.hitDie ?? null;
      context.kit = mapped.startingEquipment ?? null;
      context.features.push(...(mapped.features ?? []));
    },
  },
  {
    key: 'path',
    kind: 'path',
    skip: (draft, context) => context.pathLevel != null && draft.level < context.pathLevel,
    apply: (app, mapped, draftPick, context) => {
      app.applyPath(mapped);
      setPicks(app, `path:${mapped.id}:`, draftPick);
      context.features.push(...(mapped.features ?? []));
    },
  },
];

export const buildCharacter = async ({ draft, app, fetchPage }) => {
  const applied = [];
  const failed = [];
  const context = { features: [] };

  const name = String(draft.concept?.name ?? '').trim();
  const concept = String(draft.concept?.concept ?? '').trim();
  if (name) app.meta.name = name;
  if (concept) app.sheet.concept = concept;
  if (name || concept) applied.push('concept');

  if (draft.profession) app.sheet.level = draft.level;

  for (const { key, kind, apply, skip } of PAGES) {
    const pointer = draft[key];
    if (!pointer?.pageName || skip?.(draft, context)) continue;
    try {
      const read = await fetchPage(pointer);
      if (!read?.ok) failed.push({ step: key, error: read?.error ?? `Couldn't fetch ${pointer.pageName}.` });
      else if (read.kind !== kind) failed.push({ step: key, error: `${pointer.pageName} isn't a ${kind} page.` });
      else {
        apply(app, read.mapped, pointer, context);
        applied.push(key);
      }
    } catch (error) {
      failed.push({ step: key, error: `Couldn't fetch ${pointer.pageName}: ${error?.message ?? error}` });
    }
  }

  const kitId = draft.equipment?.kit;
  const kit = kitId ? context.kit?.[kitId] : null;
  const chosen = draft.equipment?.picks ?? {};
  const addItem = async (name, plain) => {
    if (plain) {
      app.addItemFromCompendium({ equipment: { name, itemType: 'gear', grade: '', quantity: 1, weight: '', text: '' } });
      return;
    }
    try {
      const read = await fetchPage({ pageName: name, categoryName: 'Items', expansionId: '' });
      if (read?.ok && read.kind === 'item') app.addItemFromCompendium(read.mapped, { wear: true });
      else failed.push({ step: 'equipment', error: read?.error ?? `Couldn't fetch ${name}.` });
    } catch (error) {
      failed.push({ step: 'equipment', error: `Couldn't fetch ${name}: ${error?.message ?? error}` });
    }
  };
  const professionName = draft.profession?.pageName ?? '';
  const kitPicks = kitId === 'a' ? kit?.picks ?? [] : [];
  if (kit) {
    app.applyStartingEquipment(kit);
    for (const name of optionItems({ professionName, kitPicks }, chosen)) await addItem(name);
  }
  const picks = equipmentPicks({
    professionName, kitPicks, backgroundName: draft.background?.pageName ?? '', backgroundPicks: context.backgroundPicks ?? [],
  }, chosen);
  let carried = !!kit;
  for (const p of picks) {
    if (p.type === 'option') continue;
    for (const name of String(chosen[p.key] ?? '').split('|').filter(Boolean).slice(0, p.count)) {
      await addItem(name, p.plain);
      carried = true;
    }
  }
  if (carried) applied.push('equipment');

  const cap = maxSkillRank(draft.level);
  let placed = false;
  for (const [key, ranks] of Object.entries(draft.skills?.ranks ?? {})) {
    if (!keyCurrent(draft, key)) continue;
    for (const [id, n] of Object.entries(ranks)) {
      const skill = app.sheet.skills?.[id];
      if (!skill || !(n > 0)) continue;
      skill.ranks = Math.min(cap, (Number(skill.ranks) || 0) + n);
      placed = true;
    }
  }
  for (const [key, value] of Object.entries(draft.skills?.picks ?? {})) {
    if (!keyCurrent(draft, key)) continue;
    for (const pick of String(value).split('|').filter(Boolean)) {
      const [kind, id] = pick.split(':');
      if (!id) continue;
      if (kind === 'mastery') {
        if (id in (app.sheet.proficiencies?.mastery ?? {})) app.sheet.proficiencies.mastery[id] = true;
      } else if (kind === 'skill') {
        if (!app.sheet.skills?.[id]) continue;
        app.sheet.skills[id].doubled = true;
      } else if (['tool', 'vehicle', 'weapon'].includes(kind)) {
        app.sheet.addProficiency(kind, { id });
      } else continue;
      placed = true;
    }
  }
  if (placed) applied.push('skills');

  let learned = false;
  for (const [key, value] of Object.entries(draft.techniques?.picks ?? {})) {
    if (!keyCurrent(draft, key)) continue;
    for (const name of String(value).split('|').filter(Boolean)) {
      try {
        const read = await fetchPage({ pageName: name, categoryName: 'Techniques', expansionId: '' });
        if (read?.ok && read.kind === 'technique') {
          app.techniques.importTechnique(read.mapped);
          learned = true;
        } else failed.push({ step: 'techniques', error: read?.error ?? `Couldn't fetch ${name}.` });
      } catch (error) {
        failed.push({ step: 'techniques', error: `Couldn't fetch ${name}: ${error?.message ?? error}` });
      }
    }
  }
  if (learned) applied.push('techniques');

  const abilities = finalAbilities(draft.abilities, limitedIncrease(draft));
  if (Object.keys(abilities).length) {
    Object.assign(app.sheet.abilities, abilities);
    applied.push('abilities');
  }

  for (const { key, name } of draftFeats(draft)) {
    try {
      const read = await fetchPage({ pageName: name, categoryName: 'Feats', expansionId: '' });
      if (!read?.ok || read.kind !== 'feat') {
        failed.push({ step: 'abilities', error: read?.error ?? `Couldn't fetch ${name}.` });
        continue;
      }
      const plan = app.applyFeat(read.mapped);
      if (plan?.refuse) {
        failed.push({ step: 'abilities', error: plan.refuse });
        continue;
      }
      if (!applied.includes('feats')) applied.push('feats');
      settleFeat(app, read.mapped.id, featPrefix(key, name), draft.abilities?.featPicks ?? {});
    } catch (error) {
      failed.push({ step: 'abilities', error: `Couldn't fetch ${name}: ${error?.message ?? error}` });
    }
  }

  if (context.hitDie) {
    const total = maxHp({
      hitDie: context.hitDie,
      con: Number(app.sheet.abilities.constitution) || 0,
      level: draft.level,
      hp: draft.hp,
      hpPerLevel: context.hpPerLevel ?? 0,
      flat: context.features
        .filter((f) => Number.isInteger(f.maxHp) && (f.level ?? 1) <= draft.level)
        .reduce((sum, f) => sum + f.maxHp, 0),
    });
    if (total == null) {
      failed.push({ step: 'profession', error: 'Max HP needs its hit dice rolled on the Profession step.' });
    } else {
      app.sheet.hp.max = total;
      app.sheet.hp.current = total;
      applied.push('hp');
    }
  }
  if (Number(app.sheet.maxTP) > 0) app.sheet.tp.current = Number(app.sheet.maxTP);

  const story = draft.story ?? {};
  let told = false;
  for (const field of ['storyBonds', 'history', 'appearance']) {
    const value = String(story[field] ?? '').trim();
    if (!value) continue;
    app.bio[field] = value;
    told = true;
  }
  if (told) applied.push('story');

  return { applied, failed };
};
