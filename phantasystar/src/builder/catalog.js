import { escapeArg } from '../compendium/fetchEntry.js';
import { normalizeKey } from '../compendium/shared.js';

export const CARD_ART = 'data-builderImage';

export const SUMMARY_PROPERTIES = {
  Species: ['Size', 'Speed'],
  Backgrounds: ['Skills'],
  Professions: ['Hit Die', 'Saving Throws', 'Tech Ability'],
  Paths: [],
  Techniques: ['Rank', 'Casting Time', 'Range', 'Duration'],
};

export const cardLine = (option) =>
  option?.categoryName === 'Professions'
    ? (option.summary ?? []).filter((p) => p.label === 'Hit Die').map((p) => `${p.label} ${p.value}`).join('')
    : (option?.summary ?? []).map((p) => p.value).join(' · ');

export const categoryQuery = (category) =>
  `category(name: "${escapeArg(category)}") { pages { id name book { itemId shortName } properties } }`;

const property = (page, name) => {
  const wanted = normalizeKey(name);
  for (const [key, value] of Object.entries(page?.properties ?? {})) {
    if (normalizeKey(key) === wanted) return value;
  }
  return undefined;
};

const json = (raw) => {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const toOption = (page, category) => {
  const payload = json(property(page, 'data-payload'));
  const features = json(property(page, 'data-features'));
  const art = String(property(page, CARD_ART) ?? '').trim();
  return {
    pageName: String(page?.name ?? ''),
    categoryName: category,
    expansionId: page?.book?.itemId != null ? String(page.book.itemId) : '',
    book: String(page?.book?.shortName ?? ''),
    art: /^(https?:)?\/\//.test(art) || art.startsWith('/') ? art : '',
    summary: (SUMMARY_PROPERTIES[category] ?? [])
      .map((label) => ({ label, value: String(property(page, label) ?? '').trim() }))
      .filter((p) => p.value),
    properties: Object.fromEntries(Object.entries(page?.properties ?? {})
      .filter(([key, value]) => !/^data-/i.test(key) && (typeof value === 'string' || typeof value === 'number'))
      .map(([key, value]) => [key, String(value)])),
    payload: isObject(payload) ? payload : null,
    features: isObject(features) ? features : null,
    page: { name: String(page?.name ?? ''), categoryName: category, properties: page?.properties ?? {} },
  };
};

export const readCategory = (response, category) => {
  const errors = response?.errors;
  if (Array.isArray(errors) && errors.length) {
    return { ok: false, error: errors.map((e) => e?.message ?? String(e)).join('; ') };
  }
  const ruleSystem = response?.data?.ruleSystem;
  if (!ruleSystem) return { ok: false, error: 'No compendium answered. Is one set for this game?' };
  const found = ruleSystem.category;
  const pages = (Array.isArray(found) ? found.flatMap((c) => c?.pages ?? []) : found?.pages ?? []).filter(Boolean);

  const byName = new Map();
  for (const page of pages) {
    const option = toOption(page, category);
    if (!option.pageName) continue;
    const held = byName.get(option.pageName);
    if (!held || (!held.payload && option.payload)) byName.set(option.pageName, option);
  }
  const options = [...byName.values()].sort((a, b) => a.pageName.localeCompare(b.pageName));
  if (!options.length) {
    return {
      ok: false,
      error: `The compendium has no ${category} pages to offer. If it should, ask the GM to turn on `
        + '"Share my compendium with players?" in Game Settings.',
    };
  }
  return { ok: true, options };
};

export const pathsOf = (profession, paths = []) => {
  const id = profession?.payload?.id;
  const named = new Set(Array.isArray(profession?.payload?.paths) ? profession.payload.paths : []);
  return paths.filter((p) => (id && p.payload?.profession === id) || named.has(p.payload?.id));
};

export const compendiumUrl = (option) => {
  if (!option?.pageName || !option?.categoryName) return '';
  const page = encodeURIComponent(`${option.categoryName}:${option.pageName}`).replace(/%3A/g, ':');
  const book = option.expansionId ? `?expansion=${encodeURIComponent(option.expansionId)}` : '';
  return `https://app.roll20.net/compendium/phantasystar/${page}${book}`;
};
