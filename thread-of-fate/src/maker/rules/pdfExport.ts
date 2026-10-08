import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { CharacterDraft } from '@/maker/draftModel';
import { ATTRIBUTES } from '@/maker/data/attributes';
import {
  classById,
  philosophyById,
  aspectById,
  armorById,
  shieldById,
  weaponById,
  arteById,
  backgroundTraitById,
} from '@/maker/data';
import {
  draftDerived,
  draftFinalScores,
  draftModifiers,
  selectedRace,
  selectedSubrace,
  totalLevel,
} from './selectors';
import { skillRows } from './proficiency';
import { casterInfo } from './casting';
import { traitAggregation } from './aggregation';
import { weaponLine } from './weapons';
import { CONDITIONS, ACTIONS, DAMAGE_TYPES } from '@/maker/data/reference';
import { formatModifier } from './stats';

const GOLD = rgb(0.74, 0.55, 0.16);
const INK = rgb(0.14, 0.14, 0.14);
const CREAM = rgb(0.976, 0.91, 0.816);
const LINE = rgb(0.55, 0.43, 0.23);

const PAGE_W = 612;
const PAGE_H = 792;
const M = 36;

interface Ctx {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
}

function newPage(doc: PDFDocument, font: PDFFont, bold: PDFFont, title: string): Ctx {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: CREAM });
  page.drawText(title, { x: M, y: PAGE_H - M, size: 16, font: bold, color: GOLD });
  page.drawText('Convergence TTRPG - The Thread of Fate', {
    x: M,
    y: PAGE_H - M + 18,
    size: 8,
    font,
    color: LINE,
  });
  page.drawLine({
    start: { x: M, y: PAGE_H - M - 6 },
    end: { x: PAGE_W - M, y: PAGE_H - M - 6 },
    thickness: 1,
    color: GOLD,
  });
  return { page, font, bold };
}

function box(ctx: Ctx, x: number, y: number, w: number, h: number, label?: string) {
  ctx.page.drawRectangle({
    x,
    y: y - h,
    width: w,
    height: h,
    borderColor: LINE,
    borderWidth: 1,
    color: rgb(0.957, 0.86, 0.745),
  });
  if (label)
    ctx.page.drawText(label.toUpperCase(), {
      x: x + 5,
      y: y - 11,
      size: 7,
      font: ctx.bold,
      color: GOLD,
    });
}

/**
 * Map smart punctuation / symbols to ASCII so the standard WinAnsi fonts can
 * encode them. Written with \u escapes so this source file stays pure ASCII.
 */
function clean(s: string): string {
  return (
    (s ?? '')
      .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
      .replace(/[\u2013\u2014\u2015]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u2022\u25CF\u25AA\u2726\u2727\u2605\u2736\u00B7]/g, '-')
      .replace(/\u00D7/g, 'x')
      // eslint-disable-next-line no-control-regex -- intentional: strip non-ASCII the standard PDF fonts can't encode
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
  );
}

function text(ctx: Ctx, s: string, x: number, y: number, size = 9, bold = false) {
  ctx.page.drawText(clean(s), { x, y, size, font: bold ? ctx.bold : ctx.font, color: INK });
}

/** Decode a data-URL portrait and embed it (JPEG/PNG). Returns null if absent/invalid. */
async function embedImage(doc: PDFDocument, dataUrl: string | null | undefined) {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return null;
  try {
    const isPng = dataUrl.slice(0, 22).includes('image/png');
    const b64 = dataUrl.split(',')[1] ?? '';
    const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
    return isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  } catch {
    return null;
  }
}

/** Wrap text to a width and draw; returns the y after the last line. */
function paragraph(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  w: number,
  size = 8,
  leading = 11,
): number {
  const words = clean(s).replace(/\s+/g, ' ').trim().split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.font.widthOfTextAtSize(test, size) > w && line) {
      text(ctx, line, x, cy, size);
      line = word;
      cy -= leading;
    } else {
      line = test;
    }
  }
  if (line) {
    text(ctx, line, x, cy, size);
    cy -= leading;
  }
  return cy;
}

/** Build the filled character-sheet PDF and return its bytes (environment-agnostic). */
export async function buildCharacterPdfBytes(draft: CharacterDraft): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const scores = draftFinalScores(draft);
  const mods = draftModifiers(draft);
  const derived = draftDerived(draft);
  const level = totalLevel(draft);
  const pb = derived.proficiencyBonus;
  const race = selectedRace(draft);
  const subrace = selectedSubrace(draft);

  // ---------------- PAGE 1, CORE ----------------
  const c = newPage(doc, font, bold, 'Character Core');
  let y = PAGE_H - M - 24;

  // Avatar portrait (top-right), if provided.
  const avatar = await embedImage(doc, draft.bio.avatarImage);
  if (avatar) {
    const size = 64;
    const ax = PAGE_W - M - size;
    const ay = PAGE_H - M - 20 - size;
    c.page.drawImage(avatar, { x: ax, y: ay, width: size, height: size });
    c.page.drawRectangle({
      x: ax,
      y: ay,
      width: size,
      height: size,
      borderColor: GOLD,
      borderWidth: 1,
    });
  }

  text(c, `Name: ${draft.identity.name || ', '}`, M, y, 11, true);
  const classes =
    draft.classBuild.classes
      .filter((x) => x.classId)
      .map((x) => `${classById[x.classId]?.name} ${x.level}`)
      .join(', ') || (draft.classBuild.startingLevel === 0 ? 'Level 0 (unclassed)' : ', ');
  text(c, `Race: ${subrace ? subrace.name + ' ' : ''}${race?.name ?? ', '}`, M + 280, y, 9);
  y -= 14;
  text(c, `Class: ${classes}    Level: ${level}`, M, y, 9);
  const phil =
    draft.philosophy.custom?.name ||
    (draft.philosophy.selectedPhilosophyId
      ? philosophyById[draft.philosophy.selectedPhilosophyId]?.name
      : ', ');
  text(c, `Philosophy: ${phil}`, M + 280, y, 9);
  y -= 14;
  if (draft.bio.howYouDie) text(c, `Thread's End (how you die): ${draft.bio.howYouDie}`, M, y, 9);
  y -= 22;

  // Attributes row
  const colW = (PAGE_W - 2 * M) / 6;
  ATTRIBUTES.forEach((a, i) => {
    const x = M + i * colW;
    box(c, x, y, colW - 4, 50);
    text(c, a.label, x + 5, y - 11, 7, true);
    text(c, `${scores[a.key]}`, x + colW / 2 - 12, y - 30, 16, true);
    text(c, formatModifier(mods[a.key]), x + colW / 2 - 8, y - 44, 10);
  });
  y -= 64;

  // Derived stats row
  const stats = [
    ['Health', `${derived.health}`],
    ['Stamina', `${derived.stamina}`],
    ['Armor Class', `${derived.armorClass}`],
    ['Prof. Bonus', `+${pb}`],
    ['Movement', race?.movementSpeed ?? '30 ft.'],
  ];
  const sW = (PAGE_W - 2 * M) / stats.length;
  stats.forEach(([label, val], i) => {
    const x = M + i * sW;
    box(c, x, y, sW - 4, 34, label);
    text(c, val, x + 6, y - 26, 12, true);
  });
  y -= 48;

  // Saving throws (a * marks a save the class is proficient in)
  box(c, M, y, PAGE_W - 2 * M, 30, 'Saving Throws');
  let sx = M + 8;
  const saveCols: [string, keyof typeof derived.saves, 'Body' | 'Mind' | 'Soul'][] = [
    ['Body', 'body', 'Body'],
    ['Mind', 'mind', 'Mind'],
    ['Soul', 'soul', 'Soul'],
  ];
  saveCols.forEach(([label, key, group]) => {
    const star = derived.saveProficiencies.includes(group) ? '*' : '';
    text(c, `${label}${star}: ${formatModifier(derived.saves[key])}`, sx, y - 22, 10, true);
    sx += 130;
  });
  text(c, `Conc.: ${formatModifier(derived.saves.concentration)}`, sx, y - 22, 10, true);
  y -= 44;

  // Talents (left) + Proficiencies (right). ** = Expertise, * = Proficient
  const skillTop = y;
  box(c, M, y, 250, 290, 'Talents (* proficient, ** expertise)');
  let ky = y - 22;
  for (const s of skillRows(draft)) {
    const mark = s.tier === 'expert' ? '**' : s.tier === 'proficient' ? '*' : '  ';
    text(c, `${mark} ${s.name}`, M + 8, ky, 8);
    text(c, `${formatModifier(s.bonus)} (${s.abbr})`, M + 205, ky, 8);
    ky -= 11.5;
  }

  box(c, M + 262, skillTop, PAGE_W - 2 * M - 262, 130, 'Proficiencies');
  let py = skillTop - 22;
  const weaponProfs = draft.background.selectedTraits
    .filter((t) => ['weapon-training', 'armor-training'].includes(t.traitId))
    .map((t) => t.detail)
    .filter(Boolean);
  const langs = draft.background.selectedTraits
    .filter((t) => t.traitId === 'linguistic-training')
    .map((t) => t.detail)
    .filter(Boolean);
  py = paragraph(c, `Weapons & Armor: ${weaponProfs.join(', ') || ', '}`, M + 270, py, 250, 8);
  py = paragraph(
    c,
    `Languages: Common${langs.length ? ', ' + langs.join(', ') : ''}`,
    M + 270,
    py - 2,
    250,
    8,
  );
  const tools = draft.background.selectedTraits
    .filter((t) => t.traitId === 'tool-training')
    .map((t) => t.detail)
    .filter(Boolean);
  paragraph(c, `Tools: ${tools.join(', ') || ', '}`, M + 270, py - 2, 250, 8);

  // Defenses & senses (derived from racial traits)
  const agg = traitAggregation(draft);
  box(c, M + 262, skillTop - 140, PAGE_W - 2 * M - 262, 130, 'Defenses, Senses & Traits');
  let ty = skillTop - 162;
  const defLine = (label: string, items: string[]) => {
    if (!items.length) return;
    ty = paragraph(c, `${label}: ${items.join(', ')}`, M + 270, ty, 250, 7.5) - 2;
  };
  const senseList = [...(race && race.senses !== 'None' ? [race.senses] : []), ...agg.senses];
  defLine('Resistances', agg.resistances);
  defLine('Immunities', agg.immunities);
  defLine('Vulnerable', agg.vulnerabilities);
  defLine('Senses', [...new Set(senseList)]);
  defLine('Extra Speeds', agg.extraSpeeds);
  const traitLines = [
    ...(race ? race.traits.map((t) => `- ${t.name}`) : []),
    ...(subrace ? subrace.traits.map((t) => `- ${t.name}`) : []),
    ...draft.classBuild.aspects
      .filter((a) => a.aspectId)
      .map((a) => `✦ ${aspectById[a.aspectId]?.name}`),
  ];
  traitLines.slice(0, 8).forEach((l) => {
    text(c, l, M + 270, ty, 7.5);
    ty -= 9.5;
  });

  // ---------------- PAGE 2, BIO ----------------
  const b = newPage(doc, font, bold, 'Character Bio');
  let by = PAGE_H - M - 24;
  text(
    b,
    `Age: ${draft.identity.age || ', '}    Height: ${draft.identity.height || ', '}`,
    M,
    by,
    10,
  );
  by -= 20;
  box(b, M, by, PAGE_W - 2 * M, 70, 'Philosophy');
  const pdef = draft.philosophy.selectedPhilosophyId
    ? philosophyById[draft.philosophy.selectedPhilosophyId]
    : null;
  paragraph(
    b,
    pdef
      ? `${pdef.name} (${pdef.title}): ${pdef.overview}`
      : draft.philosophy.custom?.overview || ', ',
    M + 8,
    by - 22,
    PAGE_W - 2 * M - 16,
    8,
  );
  by -= 84;
  box(b, M, by, PAGE_W - 2 * M, 90, 'Character Appearance');
  paragraph(b, draft.bio.description, M + 8, by - 22, PAGE_W - 2 * M - 16, 8);
  by -= 104;
  box(b, M, by, PAGE_W - 2 * M, 110, 'Background / Lore');
  paragraph(b, draft.bio.lore, M + 8, by - 22, PAGE_W - 2 * M - 16, 8);
  by -= 124;
  const halfW = (PAGE_W - 2 * M - 12) / 2;
  box(b, M, by, halfW, 90, 'Allies');
  paragraph(b, draft.bio.allies, M + 8, by - 22, halfW - 16, 8);
  box(b, M + halfW + 12, by, halfW, 90, 'Enemies');
  paragraph(b, draft.bio.enemies, M + halfW + 20, by - 22, halfW - 16, 8);
  by -= 104;
  box(b, M, by, PAGE_W - 2 * M, 130, 'Racial Traits');
  let ry = by - 22;
  const allRaceTraits = [...(race?.traits ?? []), ...(subrace?.traits ?? [])];
  for (const t of allRaceTraits) {
    text(b, `- ${t.name}`, M + 8, ry, 8, true);
    ry = paragraph(b, t.description, M + 16, ry - 10, PAGE_W - 2 * M - 24, 7.5) - 4;
    if (ry < M + 20) break;
  }

  // ---------------- PAGE 3, INVENTORY ----------------
  const inv = newPage(doc, font, bold, 'Inventory & Equipment');
  let iy = PAGE_H - M - 24;
  box(inv, M, iy, PAGE_W - 2 * M, 40, 'Worn');
  const armor = draft.equipment.selectedArmorId ? armorById[draft.equipment.selectedArmorId] : null;
  const shield = draft.equipment.selectedShieldId
    ? shieldById[draft.equipment.selectedShieldId]
    : null;
  text(
    inv,
    `Armor: ${armor ? `${armor.name} (+${armor.acBonus} AC, ${armor.type})` : ', '}`,
    M + 8,
    iy - 22,
    9,
  );
  text(
    inv,
    `Shield: ${shield ? `${shield.name} (+${shield.shieldAc})` : ', '}`,
    M + 300,
    iy - 22,
    9,
  );
  iy -= 54;
  box(inv, M, iy, PAGE_W - 2 * M, 150, 'Weapons (Atk = Prof + attribute, assuming Trained)');
  let wy = iy - 22;
  text(inv, 'Name', M + 8, wy, 7, true);
  text(inv, 'Atk', M + 150, wy, 7, true);
  text(inv, 'Damage', M + 195, wy, 7, true);
  text(inv, 'Properties', M + 300, wy, 7, true);
  wy -= 12;
  draft.equipment.selectedWeaponIds.forEach((id) => {
    const w = weaponById[id];
    if (!w) return;
    const wl = weaponLine(draft, w);
    text(inv, `- ${w.name}`, M + 8, wy, 8, true);
    text(inv, wl.attackText, M + 150, wy, 8);
    text(inv, wl.damageText, M + 195, wy, 7.5);
    text(inv, w.properties, M + 300, wy, 6);
    wy -= 12;
  });
  iy -= 164;
  box(inv, M, iy, PAGE_W - 2 * M, 160, 'Items & Pack');
  let cy2 = iy - 22;
  Object.entries(draft.equipment.packChoices).forEach(([cat, choice]) => {
    if (choice) {
      text(inv, `- ${choice} (${cat})`, M + 8, cy2, 8);
      cy2 -= 12;
    }
  });
  draft.equipment.customItems.forEach((item) => {
    text(inv, `- ${item}`, M + 8, cy2, 8);
    cy2 -= 12;
  });
  if (agg.effectiveWealth != null)
    text(inv, `Wealth: ${agg.effectiveWealth}`, M + 300, iy - 22, 9, true);

  // ---------------- PAGE 4, ARTES ----------------
  const ar = newPage(doc, font, bold, 'Artes & Magic');
  let ay = PAGE_H - M - 24;
  const cast = casterInfo(draft);
  if (cast.isCaster) {
    text(
      ar,
      `Source: ${cast.sources.join('/')}   Caster Lvl ${cast.casterLevel}   Max Tier ${
        cast.maxTier
      }   Aether ${cast.aether}`,
      M,
      ay,
      9,
    );
    text(
      ar,
      `Arte Save DC ${formatModifier(cast.arteSaveDC)}   Arte Attack ${formatModifier(
        cast.arteAttack,
      )}`,
      M,
      ay - 13,
      9,
    );
    ay -= 13;
  } else {
    text(ar, 'Non-caster, no Aether or Artes.', M, ay, 9);
  }
  ay -= 24;
  const byTier: Record<number, string[]> = {};
  draft.artes.selectedArteIds.forEach((id) => {
    const a = arteById[id];
    if (!a) return;
    (byTier[a.tier] ??= []).push(a.name);
  });
  const tiers = Object.keys(byTier)
    .map(Number)
    .sort((x, z) => x - z);
  if (!tiers.length) {
    text(ar, 'No Artes selected.', M, ay, 10);
  } else {
    for (const t of tiers) {
      box(
        ar,
        M,
        ay,
        PAGE_W - 2 * M,
        20 + byTier[t].length * 12,
        t === 0 ? 'Cantrips (Tier-0)' : `Tier-${t} Artes`,
      );
      let ly = ay - 22;
      byTier[t].forEach((n) => {
        text(ar, `- ${n}`, M + 8, ly, 9);
        ly -= 12;
      });
      ay -= 30 + byTier[t].length * 12;
      if (ay < M + 40) break;
    }
  }

  // Background traits summary footer on page 4
  if (draft.background.selectedTraits.length) {
    box(ar, M, ay, PAGE_W - 2 * M, 110, 'Background Traits');
    let gy = ay - 22;
    draft.background.selectedTraits.forEach((t) => {
      const def = backgroundTraitById[t.traitId];
      text(
        ar,
        `- ${def?.name ?? t.traitId} (${t.cost} BP)${t.detail ? ', ' + t.detail : ''}`,
        M + 8,
        gy,
        8,
      );
      gy -= 12;
    });
  }

  // ---------------- PAGE 5, QUICK REFERENCE ----------------
  const ref = newPage(doc, font, bold, 'Quick Reference');
  const refColW = (PAGE_W - 2 * M - 12) / 2;
  const refTop = PAGE_H - M - 24;
  text(ref, 'CONDITIONS', M, refTop, 9, true);
  const half = Math.ceil(CONDITIONS.length / 2);
  const condYs = [refTop - 12, refTop - 12];
  CONDITIONS.forEach((cnd, i) => {
    const col = i < half ? 0 : 1;
    const x = M + col * (refColW + 12);
    text(ref, cnd.name, x, condYs[col], 7.5, true);
    condYs[col] = paragraph(ref, cnd.text, x, condYs[col] - 9, refColW, 6.5, 8) - 3;
  });
  const refMid = Math.min(condYs[0], condYs[1]) - 8;
  text(ref, 'ACTION ECONOMY', M, refMid, 9, true);
  text(ref, 'DAMAGE TYPES', M + refColW + 12, refMid, 9, true);
  let refActY = refMid - 12;
  ACTIONS.forEach((a) => {
    text(ref, a.name, M, refActY, 7.5, true);
    refActY = paragraph(ref, a.text, M, refActY - 9, refColW, 6.5, 8) - 3;
  });
  let refDmgY = refMid - 12;
  DAMAGE_TYPES.forEach((d2) => {
    text(ref, `${d2.name}: ${d2.text}`, M + refColW + 12, refDmgY, 6.5);
    refDmgY -= 9;
  });

  return await doc.save();
}

/** Browser-side wrapper: build the PDF and trigger a download. */
export async function exportCharacterPdf(draft: CharacterDraft): Promise<void> {
  const bytes = await buildCharacterPdfBytes(draft);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(draft.identity.name || 'character').replace(/\s+/g, '_')}.character-sheet.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
