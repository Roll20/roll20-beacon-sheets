export const STORY_BONDS_PAGE = { pageName: 'Story Bonds', categoryName: 'Rules' };

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–' };

const plain = (html) =>
  String(html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)
    .replace(/\s+/g, ' ')
    .trim();

export const storyBondRows = (html) => {
  const rows = [];
  for (const [, row] of String(html ?? '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(([, cell]) => plain(cell));
    const roll = Number(cells[0]);
    if (cells.length >= 3 && Number.isInteger(roll) && cells[1]) rows.push({ roll, bond: cells[1], text: cells[2] });
  }
  return rows.sort((a, b) => a.roll - b.roll);
};

export const bondLine = (row) => (row.text ? `${row.bond}: ${row.text}` : row.bond);

export const addBond = (current, row) => {
  const text = String(current ?? '').replace(/\s+$/, '');
  const lines = text.split('\n').map((l) => l.trim());
  if (lines.some((l) => l === bondLine(row) || l.startsWith(`${row.bond}:`))) return text;
  return text ? `${text}\n${bondLine(row)}` : bondLine(row);
};
