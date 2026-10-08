export const escapeArg = (value) =>
  String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const pageFields = ({ prose = true } = {}) =>
  [
    'id',
    'name',
    'legacyPageId',
    'book { itemId shortName }',
    'properties',
    'children { name properties }',
    prose ? 'content' : null,
  ]
    .filter(Boolean)
    .join(' ');

export const pagesQuery = ({ name, category, prose = true } = {}) => {
  const args = [`name: "${escapeArg(name)}"`];
  if (category) args.push(`category: "${escapeArg(category)}"`);
  return `pages(${args.join(' ')}) { ${pageFields({ prose })} }`;
};

export const bookItemId = (value) => {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) ? Number(text) : null;
};

export const bookPagesQuery = ({ expansionId, name, category, prose = true } = {}) => {
  const itemId = bookItemId(expansionId);
  if (itemId == null) return null;
  return `book(itemId: ${itemId}) { ${pagesQuery({ name, category, prose })} }`;
};

export const pageByIdQuery = ({ id, prose = true } = {}) =>
  `page(id: "${escapeArg(id)}") { ${pageFields({ prose })} }`;

export const readPages = (response) => {
  const errors = response?.errors;
  if (Array.isArray(errors) && errors.length) {
    return { ok: false, error: errors.map((e) => e?.message ?? String(e)).join('; ') };
  }

  const ruleSystem = response?.data?.ruleSystem;
  if (!ruleSystem) {
    return { ok: false, error: 'No compendium answered - is one set for this game?' };
  }

  const pages =
    ruleSystem.pages ?? ruleSystem.book?.pages ?? (ruleSystem.page ? [ruleSystem.page] : []);
  const found = pages.filter(Boolean);
  if (!found.length) {
    return {
      ok: false,
      error:
        'The compendium returned no such entry. If it should be there, ask the GM to turn on '
        + '"Share my compendium with players?" in Game Settings - paid pages look missing to '
        + 'anyone without a sharing slot.',
    };
  }
  return { ok: true, pages: found };
};

export const pageLabel = (page) => {
  const book = page?.book?.shortName;
  return book ? `${page?.name ?? 'Entry'} (${book})` : page?.name ?? 'Entry';
};

const ask = async (dispatch, query, via) => {
  try {
    const result = readPages(await dispatch.compendiumRequest({ query }));
    return result.ok ? { ...result, via } : result;
  } catch (error) {
    return { ok: false, error: `The compendium request failed: ${error?.message ?? error}` };
  }
};

export const fetchEntry = async (dispatch, drop, { prose = true } = {}) => {
  if (typeof dispatch?.compendiumRequest !== 'function') {
    return { ok: false, error: 'This relay cannot reach a compendium.' };
  }
  const name = drop?.pageName;
  if (!name) return { ok: false, error: 'That drop carried no page name.' };

  const category = drop?.categoryName;

  const scoped = bookPagesQuery({ expansionId: drop?.expansionId, name, category, prose });
  if (scoped) {
    const result = await ask(dispatch, scoped, 'book');
    if (result.ok) return result;
  }

  return ask(dispatch, pagesQuery({ name, category, prose }), 'pages');
};
