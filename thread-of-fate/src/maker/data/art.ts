/**
 * Art manifest. Files live in /public/art, curated from Design/Art Studio.
 * Section/banner art uses the high-quality LICENSED environment + portrait packs,
 * chosen deliberately to fit each step (all downscaled to web-friendly JPGs).
 * Naomi and the logo are the project's own brand assets (the narrator + wordmark).
 */
const BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
const art = (file: string) => `${BASE}art/${file}`;

export const ART = {
  // Brand
  naomi: art('naomi.png'),
  logo: art('logo.png'),
  // Reference sheets
  sheetCore: art('sheet-core.png'),
  sheetBio: art('sheet-bio.png'),
  sheetSpells: art('sheet-spells.png'),
  sheetInventory: art('sheet-inventory.png'),
  // Licensed environment landscapes (named pieces)
  envCastle: art('env-castle.jpg'),
  envCity: art('env-city.jpg'),
  envRuins: art('env-ruins.jpg'),
  envPool: art('env-pool.jpg'),
  envVista: art('env-vista.jpg'),
  envWaterfall: art('env-waterfall.jpg'),
  envGargantuan: art('env-gargantuan.jpg'),
  envLayer: art('env-layer.jpg'),
  envForest: art('env-forest.jpg'),
  // Licensed portrait pack
  portraitA: art('portrait-a.png'),
  portraitB: art('portrait-b.png'),
  portraitC: art('portrait-c.png'),
  portraitD: art('portrait-d.png'),
};

/**
 * Official Convergence character-sheet UI kit (from Design/Assets, 72 DPI).
 * Monochrome line-art frames/icons; tinted to gold/cream in CSS. Bound onto the
 * app root as CSS custom properties (see App.vue) so url() respects the base path.
 */
export const UI = {
  attrBox: art('ui/attr-box.png'),
  attrButton: art('ui/attr-button.png'),
  attrDivider: art('ui/attr-divider.png'),
  hourglass: art('ui/hourglass.png'),
  moon: art('ui/moon.png'),
  totalBox: art('ui/total-box.png'),
  overviewDivider: art('ui/overview-divider.png'),
  menuBox: art('ui/menu-box.png'),
  chevron: art('ui/chevron.png'),
};

/** Per-step banner art, deliberately matched landscapes for every step. */
export const STEP_ART: Record<string, string> = {
  intro: ART.envCastle, // an epic seat of legend, the tale awaits
  stats: ART.envPool, // a still pool reflecting fate
  background: ART.envCity, // the world you came from
  equipment: ART.envRuins, // gear for the road ahead
  philosophy: ART.envVista, // a grand vista, your worldview
  race: ART.envWaterfall, // wild nature, heritage and origin
  class: ART.envGargantuan, // power and prowess
  artes: ART.envLayer, // the arcane made manifest
  bio: ART.envForest, // a quiet wood, who you are
  review: ART.envForest, // grounded nature at journey's threshold (paired with the flower field)
};
