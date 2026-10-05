import { formatError, formatPath } from './validation.js'

// Plain-language lines for character schema errors (ddd-ag26, plan
// docs/superpowers/plans/2026-09-16-ddd-ag26-import-export-plan.md §2.2-2.3).
// Pure: no Vue, no Pinia, no DOM. The creature panel does not use this module.

// Visible list titles (ItemList titles in the segment components).
const LISTS = {
  skills: 'Skills',
  abilities: 'Abilities',
  attacks: 'Attacks',
  equipment: 'Equipment',
  cyphers: 'Cyphers',
  artifacts: 'Artifacts',
  powerShifts: 'Power shifts',
  currencies: 'Currencies',
  arcs: 'Character arcs'
}

// Top-level fields and containers, named as the sheet shows them (SheetHeader microlabels).
const TOP = {
  schemaVersion: 'Schema version',
  kind: 'File kind',
  name: 'Character name',
  sentence: 'Character sentence',
  tier: 'Tier',
  effort: 'Effort',
  xp: 'XP',
  storyXp: 'Story XP',
  resourcePoints: 'RP',
  rank: 'Rank',
  advancement: 'Advancement',
  pools: 'Pools',
  recovery: 'Recovery',
  wounds: 'Wounds',
  shield: 'Shield',
  armor: 'Armor value',
  armorModifiers: 'Armor',
  cypherLimit: 'Cypher limit',
  genre: 'Genre',
  subgenre: 'Subgenre',
  background: 'Background',
  notes: 'Notes',
  portraitUrl: 'Portrait link',
  // schemaVersion 3 (ddd-xrug, spec §10).
  rules: 'Optional rules',
  damageTrack: 'Damage track',
  luck: 'Luck Pool',
  stress: 'Stress',
  wearingArmor: 'Wearing armor',
  ...LISTS
}

const SENTENCE = {
  descriptor: 'Descriptor',
  secondDescriptor: 'Second descriptor',
  type: 'Type',
  focus: 'Focus',
  secondFocus: 'Second focus',
  species: 'Species'
}

const POOLS = { might: 'Might pool', speed: 'Speed pool', intellect: 'Intellect pool' }

// Where each top-level key is edited (plan §2.3). A container routes with its members.
const TOP_OF_SHEET = 'the top of the sheet'
const PLACES = {
  name: TOP_OF_SHEET,
  sentence: TOP_OF_SHEET,
  tier: TOP_OF_SHEET,
  effort: TOP_OF_SHEET,
  xp: TOP_OF_SHEET,
  storyXp: TOP_OF_SHEET,
  resourcePoints: TOP_OF_SHEET,
  rank: TOP_OF_SHEET,
  genre: TOP_OF_SHEET,
  subgenre: TOP_OF_SHEET,
  pools: 'the pool cards at the top of the sheet',
  recovery: 'Damage & Recovery',
  wounds: 'Damage & Recovery',
  shield: 'Damage & Recovery',
  rules: 'Damage & Recovery',
  damageTrack: 'Damage & Recovery',
  skills: 'Character › Skills',
  abilities: 'Character › Abilities',
  advancement: 'Character › Advancement',
  powerShifts: 'Character › Advancement',
  arcs: 'Character › Advancement',
  attacks: 'Kit › Attacks',
  cyphers: 'Kit › Cyphers',
  cypherLimit: 'Kit › Cyphers',
  artifacts: 'Kit › Artifacts',
  equipment: 'Kit › Gear',
  currencies: 'Kit › Gear',
  armorModifiers: 'Kit › Gear',
  background: 'Notes & Background',
  notes: 'Notes & Background'
}

// Paths nothing on the sheet can edit, so an export line names no place. secondDescriptor
// and secondFocus are display-only, import-only by owner ruling ddd-5vb.
export const NO_EDITOR_PATTERNS = [
  'schemaVersion',
  'kind',
  'armor',
  'portraitUrl',
  'sentence/secondDescriptor',
  'sentence/secondFocus',
  // schemaVersion 3, phase 1 (ddd-xrug): the sheet carries these three but renders none of
  // them, and a line must not send the player to a control that does not exist. Phase 2
  // removes luck; phase 3 removes stress and wearingArmor.
  'luck',
  'stress',
  'wearingArmor'
]

// Field words that read badly humanized.
const FIELD_WORDS = {
  isProficiency: 'proficiency',
  displayName: 'display name',
  stressCost: 'Stress cost',
  supernaturalLevels: 'supernatural levels'
}

const humanize = (key) => FIELD_WORDS[key] ?? key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()

const isIndex = (segment) => /^\d+$/.test(segment)

// JSON Pointer unescaping (RFC 6901): '~1' is '/', '~0' is '~'.
const segmentsOf = (instancePath) =>
  instancePath
    ? instancePath
        .split('/')
        .slice(1)
        .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))
    : []

// Trim, collapse whitespace, swap double quotes for single so the ("…") delimiter stays
// readable, and cut long names. Vue renders the result as text, so markup is inert.
const rowName = (value) => {
  if (typeof value !== 'string') return ''
  const clean = value.trim().replace(/\s+/g, ' ').replace(/"/g, "'")
  return clean.length > 40 ? `${clean.slice(0, 40)}…` : clean
}

const rowLabel = (title, index, name) => {
  const clean = rowName(name)
  return `${title}, row ${Number(index) + 1}${clean ? ` ("${clean}")` : ''}`
}

// { head, field } for an instance path, or null when the path is not mapped. A top-level
// or container field reads "<head>: <message>"; a field inside a row or nested item reads
// "<head>: <field> <message>" (plan §2.2).
export const labelFor = (instancePath, doc) => {
  const [top, ...rest] = segmentsOf(instancePath)
  if (top === undefined) return { head: 'This file', field: null }
  if (!(top in TOP)) return null

  if (top in LISTS) {
    if (rest.length === 0) return { head: LISTS[top], field: null }
    const [index, ...inner] = rest
    if (!isIndex(index)) return null
    let head = rowLabel(LISTS[top], index, doc?.[top]?.[index]?.name)
    let tail = inner
    if (top === 'arcs' && inner[0] === 'steps' && isIndex(inner[1] ?? '')) {
      head = `${head}, step ${Number(inner[1]) + 1}`
      tail = inner.slice(2)
    }
    if (tail.length === 0) return { head, field: null }
    const last = tail[tail.length - 1]
    const field = isIndex(last)
      ? `${humanize(tail[tail.length - 2] ?? top)} item ${Number(last) + 1}`
      : humanize(last)
    return { head, field }
  }

  if (rest.length === 0) return { head: TOP[top], field: null }
  if (top === 'sentence') return rest.length === 1 && rest[0] in SENTENCE ? { head: SENTENCE[rest[0]], field: null } : null
  if (top === 'pools') {
    const [pool, key] = rest
    if (!(pool in POOLS) || rest.length > 2) return null
    return { head: key ? `${POOLS[pool]}, ${humanize(key)}` : POOLS[pool], field: null }
  }
  if (top === 'recovery' && rest[0] === 'slots' && rest.length > 1) {
    if (!isIndex(rest[1])) return null
    const head = `Recovery, slot ${Number(rest[1]) + 1}`
    return rest.length === 2 ? { head, field: null } : { head, field: humanize(rest[rest.length - 1]) }
  }
  // recovery.bonus, recovery.slots, wounds.minor.current, shield.major, advancement.stats
  return { head: [TOP[top], ...rest.map(humanize)].join(', '), field: null }
}

export const placeFor = (instancePath) => {
  const segments = segmentsOf(instancePath)
  const pattern = segments.map((s) => (isIndex(s) ? '[]' : s)).join('/')
  if (NO_EDITOR_PATTERNS.some((n) => pattern === n || pattern.startsWith(`${n}/`))) return null
  return PLACES[segments[0]] ?? null
}

const TYPE_WORDS = {
  integer: 'a whole number',
  number: 'a number',
  string: 'text',
  boolean: 'true or false',
  array: 'a list',
  null: 'empty'
}

const quote = (value) => (typeof value === 'string' ? `"${value}"` : String(value))

// Ajv keyword to plain words (plan §2.2 table).
const plainMessage = (e) => {
  const p = e.params ?? {}
  switch (e.keyword) {
    case 'invalid':
      return 'is not a valid value'
    case 'minLength':
      return p.limit === 1 ? 'is empty' : `must be at least ${p.limit} characters`
    case 'maxLength':
      return `must be at most ${p.limit} characters`
    case 'required':
      return `is missing "${p.missingProperty}"`
    case 'type': {
      const types = [].concat(p.type)
      if (types.includes('object')) return 'is not in the right shape'
      return `must be ${types.map((t) => TYPE_WORDS[t] ?? t).join(' or ')}`
    }
    case 'minimum':
      return `must be at least ${p.limit}`
    case 'maximum':
      return `must be at most ${p.limit}`
    case 'enum':
      return `must be one of ${p.allowedValues.join(', ')}`
    case 'additionalProperties':
      return `has an unexpected field "${p.additionalProperty}"`
    case 'const':
      return `must be ${quote(p.allowedValue)}`
    default:
      return e.message
  }
}

const isAtOrUnder = (path, parent) => path === parent || path.startsWith(`${parent}/`)

const onlyNullType = (branch, path) =>
  branch.every((e) => e.keyword === 'type' && [].concat(e.params?.type).join() === 'null' && e.instancePath === path)

// Ajv (allErrors) validates each anyOf/oneOf branch in order and, when none fits, pushes
// the summary right after every branch error: validate.js records the error count on
// entry and pushes or rewinds on exit. So a failing summary E at path P is preceded by a
// contiguous run of its branch errors, all at P or under P. The run collapses to the
// branch the value actually matched (plan §2.2 steps 1-7).
export const collapseErrors = (errors) => {
  const out = []
  for (const e of errors) {
    if (e.keyword !== 'anyOf' && e.keyword !== 'oneOf') {
      out.push(e)
      continue
    }
    const P = e.instancePath
    const S = e.schemaPath

    // Step 1: the run, scoped to this instance so two bad rows never mix.
    let start = out.length
    while (start > 0 && isAtOrUnder(out[start - 1].instancePath, P)) start -= 1
    const run = out.splice(start)

    // Step 2: branch index from the schema path. A $ref branch reports its definition's
    // path instead; every reachable anyOf/oneOf has at most one, so one key covers it.
    const branches = new Map()
    for (const r of run) {
      const key = r.schemaPath.startsWith(`${S}/`) ? r.schemaPath.slice(S.length + 1).split('/')[0] : 'ref'
      if (!branches.has(key)) branches.set(key, [])
      branches.get(key).push(r)
    }

    // Step 3: the null branch only says the value was not empty.
    const remaining = [...branches.values()].filter((branch) => !onlyNullType(branch, P))

    // Steps 4-6.
    let kept
    if (remaining.length === 1) {
      kept = remaining[0]
    } else {
      const fits = remaining.filter(
        (branch) => !branch.some((r) => r.instancePath === P && ['type', 'const', 'enum'].includes(r.keyword))
      )
      kept =
        fits.length === 1
          ? fits[0]
          : [{ instancePath: P, schemaPath: S, keyword: 'invalid', params: {}, message: 'is not a valid value' }]
    }

    // Step 7: a synthetic line never sits beside a concrete one at the same path.
    const concrete = new Set(kept.filter((r) => r.keyword !== 'invalid').map((r) => r.instancePath))
    out.push(...kept.filter((r) => r.keyword !== 'invalid' || !concrete.has(r.instancePath)))
  }
  // A oneOf is checked before its node's own properties, so a bad field inside ability.cost
  // leaves a synthetic "cost is not a valid value" beside the concrete field error, and the
  // two do not always meet in one run. The concrete error already names the problem, so a
  // synthetic never survives beside a concrete error at or under its path (closeout audit).
  const concrete = out.filter((r) => r.keyword !== 'invalid')
  return out.filter((r) => r.keyword !== 'invalid' || !concrete.some((c) => isAtOrUnder(c.instancePath, r.instancePath)))
}

const describeError = (e, doc, mode) => {
  const label = labelFor(e.instancePath, doc)
  if (!label) return formatError(e)
  const message = plainMessage(e)
  const body = label.field ? `${label.head}: ${label.field} ${message}` : `${label.head}: ${message}`
  if (mode === 'import') return `${body} (${formatPath(e.instancePath)})`
  const place = placeFor(e.instancePath)
  return place ? `${body}. Fix it in ${place}.` : `${body}.`
}

// { details, more }: the first `limit` collapsed lines and how many were left out.
export const describeCharacterErrors = (errors, doc, { mode = 'import', limit = 5 } = {}) => {
  const lines = collapseErrors(errors).map((e) => describeError(e, doc, mode))
  return { details: lines.slice(0, limit), more: Math.max(0, lines.length - limit) }
}
