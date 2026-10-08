/**
 * Hazard and trap archetypes the Crucible can drop into an encounter, with the trigger,
 * avoidance save, disable route, and Threat Rating contribution for each.
 *
 * Provenance: authored for the Crucible GM tool. Conditions, damage types, saves (Body/Mind/Soul)
 * and Talent names are taken from Convergence Playtest Rules.md (Conditions L283-336, Damage Types
 * L548-590, Skills L221-275); setting nouns from Convergence Storytelling Guide.md L258-300.
 * The individual hazards themselves are homebrew scaffolding, kept mechanically plain on purpose.
 */

export interface HazardTypeDef {
  id: string;
  name: string;
  description: string;
  category: 'mechanical' | 'natural' | 'magical' | 'aetheric' | 'environmental' | 'biological';
  /** proximity|touch|weight|sight|sound|magic|timed|roundStart|manual */
  triggerKind: string;
  triggerDescription: string;
  /** Perception DC offset from the creature's effect DC; 0 means use the effect DC. */
  noticeDcOffset: number;
  /** body|mind|soul|null */
  avoidSave: string | null;
  /** Talent used to disable it. */
  disableTalent: string;
  disableMethod: string;
  /** Base Threat Rating contribution at a typical mid-level encounter. */
  baseThreatRating: number;
  /** Damage dice at the base Threat Rating, e.g. { count: 4, die: 10, damageType: 'Piercing' }. */
  baseDamage: { count: number; die: number; damageType: string } | null;
  /** Area shape/size, or null for single-target. */
  area: {
    shape: 'cone' | 'line' | 'sphere' | 'cube' | 'cylinder' | 'emanation';
    size: number;
    width?: number;
  } | null;
  /** Condition names inflicted. */
  conditions: string[];
  /** Does it take turns in initiative? */
  takesTurns: boolean;
  reusable: boolean;
  escalates: boolean;
  escalationText: string;
  keywords: string[];
  source: string;
}

const SRC = 'The Crucible';

export const HAZARD_TYPES: HazardTypeDef[] = [
  // -------------------------------------------------------------------------
  // Mechanical
  // -------------------------------------------------------------------------
  {
    id: 'pitTrap',
    name: 'Pit Trap',
    description:
      'A covered shaft cut into the floor, its lid a lattice of thin slats, cloth, and swept dust. Weight folds the cover and drops whoever found it into the dark.',
    category: 'mechanical',
    triggerKind: 'weight',
    triggerDescription:
      'Triggers when a Small or larger creature puts its weight on the covered lid.',
    noticeDcOffset: 2,
    avoidSave: 'body',
    disableTalent: 'Tinkering',
    disableMethod:
      'Spring the cover from a safe distance with a pole, then wedge the lid flat with a spike so the shaft can be crossed.',
    baseThreatRating: 1,
    baseDamage: { count: 2, die: 6, damageType: 'Bludgeoning' },
    area: null,
    conditions: ['Prone'],
    takesTurns: false,
    reusable: false,
    escalates: false,
    escalationText: '',
    keywords: ['pit', 'fall', 'floor', 'dungeon', 'concealed'],
    source: SRC,
  },
  {
    id: 'spikedPit',
    name: 'Spiked Pit',
    description:
      'A deeper shaft floored with rusted iron stakes set at angles, so that climbing back out costs almost as much blood as falling in did.',
    category: 'mechanical',
    triggerKind: 'weight',
    triggerDescription:
      'Triggers the moment weight settles on the false floor; the whole panel hinges away at once.',
    noticeDcOffset: 2,
    avoidSave: 'body',
    disableTalent: 'Athletics',
    disableMethod:
      'Brace the hinged panel with timber and haul it flat, or fill the shaft with rubble until the stakes are buried.',
    baseThreatRating: 2,
    baseDamage: { count: 3, die: 6, damageType: 'Piercing' },
    area: null,
    conditions: ['Prone', 'Bleeding'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['pit', 'spikes', 'fall', 'dungeon', 'lethal'],
    source: SRC,
  },
  {
    id: 'dartWall',
    name: 'Dart Wall',
    description:
      'A masonry face drilled with hundreds of thumb-wide holes, fed by a spring magazine behind the stone. The volley comes flat, fast, and at chest height.',
    category: 'mechanical',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when a creature crosses the tripwire strung ankle-high across the corridor.',
    noticeDcOffset: 1,
    avoidSave: 'body',
    disableTalent: 'Tinkering',
    disableMethod:
      'Cut the tripwire while it is under tension, then jam the magazine spring with a wedge of hardwood.',
    baseThreatRating: 2,
    baseDamage: { count: 4, die: 4, damageType: 'Piercing' },
    area: { shape: 'line', size: 30, width: 5 },
    conditions: ['Poisoned'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['darts', 'corridor', 'tripwire', 'volley', 'venom'],
    source: SRC,
  },
  {
    id: 'bladePendulum',
    name: 'Blade Pendulum',
    description:
      'A crescent of grey steel as wide as the hall, hung from a ceiling track and driven by a falling counterweight. It keeps swinging long after the first cut.',
    category: 'mechanical',
    triggerKind: 'roundStart',
    triggerDescription:
      'Arms on proximity, then sweeps the hall at the start of every round until the counterweight bottoms out.',
    noticeDcOffset: -3,
    avoidSave: 'body',
    disableTalent: 'Acrobatics',
    disableMethod:
      'Ride the swing up to the ceiling track and pin the carriage, or spike the counterweight chain where it runs over the drum.',
    baseThreatRating: 3,
    baseDamage: { count: 4, die: 8, damageType: 'Slashing' },
    area: { shape: 'line', size: 20, width: 5 },
    conditions: ['Prone'],
    takesTurns: true,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['blade', 'swing', 'timing', 'corridor', 'clockwork'],
    source: SRC,
  },
  {
    id: 'collapsingCeiling',
    name: 'Collapsing Ceiling',
    description:
      'Keystones cut loose and reset on wax. The first heavy footfall starts a groan overhead, then the roof arrives as a slab of masonry and choking grit.',
    category: 'mechanical',
    triggerKind: 'weight',
    triggerDescription:
      'Triggers one round after weight crosses the marked flagstones, giving exactly one round of falling dust as warning.',
    noticeDcOffset: 0,
    avoidSave: 'body',
    disableTalent: 'Technology',
    disableMethod:
      'Shore the span with prop timbers or hold it with a sustained force Arte before the wax lets go.',
    baseThreatRating: 4,
    baseDamage: { count: 6, die: 10, damageType: 'Bludgeoning' },
    area: { shape: 'cube', size: 20 },
    conditions: ['Prone', 'Restrained'],
    takesTurns: false,
    reusable: false,
    escalates: true,
    escalationText:
      'After the first collapse another 10-foot section drops on a random square in the area at the end of each round until the whole span is down.',
    keywords: ['collapse', 'ceiling', 'rubble', 'burial', 'countdown'],
    source: SRC,
  },
  {
    id: 'crushingWalls',
    name: 'Crushing Walls',
    description:
      'Two counterweighted wall faces on greased rails, closing a hand-span at a time. The room narrows until there is nowhere left to stand.',
    category: 'mechanical',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when the far door is opened, which seals both exits and releases the drive weights.',
    noticeDcOffset: -2,
    avoidSave: null,
    disableTalent: 'Athletics',
    disableMethod:
      'Jam the rails with a spear haft or a shield rim, then work the drive-weight release while the faces are held.',
    baseThreatRating: 5,
    baseDamage: { count: 4, die: 12, damageType: 'Bludgeoning' },
    area: { shape: 'cube', size: 20 },
    conditions: ['Restrained'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'The faces close 5 feet at the end of each round, and damage rises by 1d12 for every 5 feet the room has already lost.',
    keywords: ['crush', 'walls', 'timer', 'sealed room', 'pressure'],
    source: SRC,
  },
  {
    id: 'flameJet',
    name: 'Flame Jet',
    description:
      'A nozzle of blackened brass fed by pressurised lamp oil, set in a gargoyle mouth or a floor grate. It answers a footfall with a roaring lance of fire.',
    category: 'mechanical',
    triggerKind: 'weight',
    triggerDescription:
      'Triggers on a pressure plate concealed under the flagstone directly in front of the nozzle.',
    noticeDcOffset: 1,
    avoidSave: 'body',
    disableTalent: 'Tinkering',
    disableMethod:
      'Shut the oil cock upstream of the nozzle, or pack the pressure plate so that it cannot travel.',
    baseThreatRating: 3,
    baseDamage: { count: 5, die: 6, damageType: 'Fire' },
    area: { shape: 'line', size: 30, width: 5 },
    conditions: ['Burning'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['fire', 'jet', 'pressure plate', 'corridor', 'oil'],
    source: SRC,
  },
  {
    id: 'netSnare',
    name: 'Weighted Net Snare',
    description:
      'A knotted net of tarred rope and lead beads slung in the rafters on a hair trigger. Built to hold a target still for whatever is coming next.',
    category: 'mechanical',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when a creature passes under the anchor line strung across the doorway.',
    noticeDcOffset: 2,
    avoidSave: 'body',
    disableTalent: 'Sleight of Hand',
    disableMethod:
      'Ease the anchor line off its release hook, or cut the net down from the rafters before anyone walks beneath it.',
    baseThreatRating: 1,
    baseDamage: null,
    area: { shape: 'cube', size: 10 },
    conditions: ['Restrained', 'Prone'],
    takesTurns: false,
    reusable: false,
    escalates: false,
    escalationText: '',
    keywords: ['net', 'snare', 'capture', 'ambush', 'nonlethal'],
    source: SRC,
  },
  {
    id: 'boltTurret',
    name: 'Bolt Turret',
    description:
      'A geared crossbow head mounted in a wall niche and sighted through a lens of polished glass. It tracks movement and feeds itself from a drum of iron quarrels.',
    category: 'mechanical',
    triggerKind: 'sight',
    triggerDescription:
      'Acquires the first creature to enter its firing arc, then fires on its own place in initiative until the drum runs dry.',
    noticeDcOffset: 0,
    avoidSave: null,
    disableTalent: 'Technology',
    disableMethod:
      'Blind the sighting lens with cloth or mud, then strip the feed pawl out of the drum housing.',
    baseThreatRating: 3,
    baseDamage: { count: 3, die: 8, damageType: 'Piercing' },
    area: null,
    conditions: [],
    takesTurns: true,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['turret', 'ranged', 'automated', 'tracking', 'clockwork'],
    source: SRC,
  },
  {
    id: 'lightningConduit',
    name: 'Lightning Conduit',
    description:
      'Copper rails bedded into the floor and fed by a humming accumulator. Anything that bridges two rails becomes part of the circuit.',
    category: 'mechanical',
    triggerKind: 'touch',
    triggerDescription:
      'Triggers when a creature or conductive object contacts two rails at once; standing water bridges them on its own.',
    noticeDcOffset: -1,
    avoidSave: 'body',
    disableTalent: 'Technology',
    disableMethod:
      'Ground the accumulator into the bedrock with a spike and chain, or lay a dry insulating mat across the rails.',
    baseThreatRating: 3,
    baseDamage: { count: 5, die: 8, damageType: 'Lightning' },
    area: { shape: 'line', size: 25, width: 10 },
    conditions: ['Sluggish'],
    takesTurns: false,
    reusable: true,
    escalates: true,
    escalationText:
      'While the accumulator is intact the conduit discharges again at the start of each round for half damage.',
    keywords: ['lightning', 'circuit', 'conductive', 'water', 'accumulator'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Natural
  // -------------------------------------------------------------------------
  {
    id: 'magmaVent',
    name: 'Magma Vent',
    description:
      'A fissure of glowing rock that breathes heat in slow pulses and throws gouts of molten stone whenever the pressure below builds too far.',
    category: 'natural',
    triggerKind: 'roundStart',
    triggerDescription:
      'Erupts at the start of a round on a rising count; the brightening glow gives one round of warning.',
    noticeDcOffset: -6,
    avoidSave: 'body',
    disableTalent: 'Survivalism',
    disableMethod:
      'Cap the vent with heaped stone or packed ice, or bleed the pressure off by opening a second fissure nearby.',
    baseThreatRating: 4,
    baseDamage: { count: 6, die: 6, damageType: 'Fire' },
    area: { shape: 'cylinder', size: 10 },
    conditions: ['Burning'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'Every third round the vent throws a wider gout: the cylinder radius grows by 5 feet and the damage by 2d6.',
    keywords: ['magma', 'volcanic', 'fire', 'eruption', 'timed'],
    source: SRC,
  },
  {
    id: 'freezingFog',
    name: 'Freezing Fog',
    description:
      'A low bank of white vapour that drinks the warmth out of everything it settles over. Armour frosts, breath fails, and the world past ten paces is gone.',
    category: 'natural',
    triggerKind: 'roundStart',
    triggerDescription:
      'Drifts 10 feet on its own each round and chills every creature it covers at the start of their turns.',
    noticeDcOffset: -5,
    avoidSave: 'body',
    disableTalent: 'Naturalism',
    disableMethod:
      'Burn it back with sustained heat, or open the space to a crosswind and let it disperse.',
    baseThreatRating: 2,
    baseDamage: { count: 2, die: 8, damageType: 'Cold' },
    area: { shape: 'sphere', size: 30 },
    conditions: ['Blinded', 'Sluggish'],
    takesTurns: true,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['fog', 'cold', 'obscuring', 'drifting', 'winter'],
    source: SRC,
  },
  {
    id: 'quicksand',
    name: 'Quicksand',
    description:
      'Saturated sand that behaves like water until it is disturbed and then grips like setting mortar. Struggling only buys a deeper hold.',
    category: 'natural',
    triggerKind: 'weight',
    triggerDescription:
      'Triggers the moment weight settles on the surface crust, which looks identical to the dry ground around it.',
    noticeDcOffset: 3,
    avoidSave: 'body',
    disableTalent: 'Survivalism',
    disableMethod:
      'Lay planking or a rope span across the pool, or read the crust, stake out its edges, and route the party around.',
    baseThreatRating: 2,
    baseDamage: null,
    area: { shape: 'sphere', size: 15 },
    conditions: ['Restrained'],
    takesTurns: false,
    reusable: true,
    escalates: true,
    escalationText:
      'A second failure sinks the creature to the chest and leaves it Incapacitated; a third submerges it and begins suffocation.',
    keywords: ['sand', 'sinking', 'restrain', 'swamp', 'desert'],
    source: SRC,
  },
  {
    id: 'rockslide',
    name: 'Rockslide',
    description:
      'A slope of loose scree held together by nothing but habit. One loud noise or one bad step and the whole face comes down the mountain.',
    category: 'natural',
    triggerKind: 'sound',
    triggerDescription:
      'Triggers on any loud noise or heavy impact on the slope, including a shout, the report of an Arte, or a falling body.',
    noticeDcOffset: -2,
    avoidSave: 'body',
    disableTalent: 'Naturalism',
    disableMethod:
      'Read the slope and pick a bedded line across it, or bring the face down deliberately from somewhere safe.',
    baseThreatRating: 3,
    baseDamage: { count: 5, die: 10, damageType: 'Bludgeoning' },
    area: { shape: 'cone', size: 60 },
    conditions: ['Prone', 'Restrained'],
    takesTurns: false,
    reusable: false,
    escalates: false,
    escalationText: '',
    keywords: ['scree', 'avalanche', 'mountain', 'burial', 'noise'],
    source: SRC,
  },
  {
    id: 'thinIce',
    name: 'Thin Ice',
    description:
      'A skin of new ice over black water, strong enough for a scout and nothing heavier. It announces its failure with a sound like a snapping rope.',
    category: 'natural',
    triggerKind: 'weight',
    triggerDescription:
      'Triggers when a Medium or larger creature crosses, or when any creature crosses wearing heavy armour.',
    noticeDcOffset: 1,
    avoidSave: 'body',
    disableTalent: 'Survivalism',
    disableMethod:
      'Sound the sheet ahead with a pole and rope, spread the load across planks, or find the thicker shelf ice near shore.',
    baseThreatRating: 2,
    baseDamage: { count: 2, die: 6, damageType: 'Cold' },
    area: { shape: 'cube', size: 10 },
    conditions: ['Restrained'],
    takesTurns: false,
    reusable: false,
    escalates: true,
    escalationText:
      'Each creature that falls through widens the hole by 5 feet, and the current under the sheet drags anyone in the water 10 feet from the edge each round.',
    keywords: ['ice', 'water', 'cold', 'drowning', 'tundra'],
    source: SRC,
  },
  {
    id: 'acidPool',
    name: 'Caustic Pool',
    description:
      'A sump of pale green mineral acid, gently smoking, that has eaten its own basin out of the bedrock. The fumes alone strip paint and lungs.',
    category: 'natural',
    triggerKind: 'touch',
    triggerDescription:
      'Affects any creature that enters the pool, and any creature that starts its turn within 5 feet of the fumes.',
    noticeDcOffset: -5,
    avoidSave: 'body',
    disableTalent: 'Medicine',
    disableMethod:
      'Neutralise the sump with slaked lime or powdered chalk, or bridge it and keep everyone upwind of the fumes.',
    baseThreatRating: 3,
    baseDamage: { count: 4, die: 8, damageType: 'Acid' },
    area: { shape: 'sphere', size: 10 },
    conditions: ['Blinded'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['acid', 'pool', 'fumes', 'corrosion', 'cavern'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Magical
  // -------------------------------------------------------------------------
  {
    id: 'alarmGlyph',
    name: 'Alarm Glyph',
    description:
      'A hair-fine sigil scribed across a threshold in silver dust. It does no harm at all; it simply tells everything in the building exactly where you are.',
    category: 'magical',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when any creature not keyed to the sigil crosses the threshold, waking a chime audible for 300 feet.',
    noticeDcOffset: 4,
    avoidSave: null,
    disableTalent: 'Arcana',
    disableMethod:
      'Break one stroke of the sigil with a grounding rod, or key yourself to it using a token carried by the wards.',
    baseThreatRating: 1,
    baseDamage: null,
    area: { shape: 'emanation', size: 5 },
    conditions: [],
    takesTurns: false,
    reusable: true,
    escalates: true,
    escalationText:
      'Left alone the glyph chimes again each round, and reinforcements arrive one wave sooner for every chime after the first.',
    keywords: ['alarm', 'glyph', 'stealth', 'reinforcements', 'ward'],
    source: SRC,
  },
  {
    id: 'wardingSigil',
    name: 'Warding Sigil',
    description:
      'A defensive Arte anchored into a door, chest, or vault ring. Aether coils in the carving until something unkeyed touches it, then leaves as a lash of raw force.',
    category: 'magical',
    triggerKind: 'touch',
    triggerDescription:
      'Triggers when an unkeyed creature touches the warded object or attempts to open it.',
    noticeDcOffset: 2,
    avoidSave: 'soul',
    disableTalent: 'Arcana',
    disableMethod:
      'Bleed the stored Aether into a focus crystal, or unpick the anchoring stroke of the sigil with a counter-Arte.',
    baseThreatRating: 3,
    baseDamage: { count: 5, die: 8, damageType: 'Force' },
    area: { shape: 'sphere', size: 10 },
    conditions: ['Sluggish'],
    takesTurns: false,
    reusable: false,
    escalates: false,
    escalationText: '',
    keywords: ['ward', 'sigil', 'vault', 'aether', 'arte'],
    source: SRC,
  },
  {
    id: 'summoningCircle',
    name: 'Summoning Circle',
    description:
      'A ring of chalk, salt, and bound names that answers intrusion by opening a door on the other side. Whatever comes through was never asked politely.',
    category: 'magical',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when a living creature enters the ring, and keeps calling for as long as the ring stays unbroken.',
    noticeDcOffset: -3,
    avoidSave: 'soul',
    disableTalent: 'Occultism',
    disableMethod:
      'Scuff one continuous arc of the ring, or speak the bound name back at it to shut the door.',
    baseThreatRating: 5,
    baseDamage: null,
    area: { shape: 'sphere', size: 20 },
    conditions: ['Frightened'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'The circle calls one minion at the end of each round, and a bruiser instead of a minion on every third round.',
    keywords: ['summoning', 'circle', 'ritual', 'reinforcements', 'occult'],
    source: SRC,
  },
  {
    id: 'cursedGround',
    name: 'Cursed Ground',
    description:
      'Earth that remembers an atrocity. Nothing grows, sound carries wrong, and every step drags a little living warmth out of whoever takes it.',
    category: 'magical',
    triggerKind: 'roundStart',
    triggerDescription:
      'Affects every creature that begins its turn on the tainted ground; it gives no sign at all before that first turn ends.',
    noticeDcOffset: 2,
    avoidSave: 'soul',
    disableTalent: 'Theology',
    disableMethod:
      'Consecrate the ground with a rite lasting a full minute, or lay the remains that anchor the curse to proper rest.',
    baseThreatRating: 3,
    baseDamage: { count: 3, die: 6, damageType: 'Necrotic' },
    area: { shape: 'cube', size: 30 },
    conditions: ['Doomed', 'Fatigued'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['curse', 'necrotic', 'haunted', 'ground', 'battlefield'],
    source: SRC,
  },
  {
    id: 'whisperingChorus',
    name: 'Whispering Chorus',
    description:
      'A resonance trapped in stone that speaks with the voices of everyone who has ever died in the room. It offers advice, and the advice is always slightly wrong.',
    category: 'magical',
    triggerKind: 'sound',
    triggerDescription:
      'Triggers when a creature speaks aloud in the chamber, and again each round any creature keeps listening.',
    noticeDcOffset: 1,
    avoidSave: 'mind',
    disableTalent: 'Occultism',
    disableMethod:
      'Stop the chamber with wax and cloth, or answer the chorus with its own final words and lay it quiet.',
    baseThreatRating: 3,
    baseDamage: { count: 4, die: 6, damageType: 'Psychic' },
    area: { shape: 'emanation', size: 30 },
    conditions: ['Charmed', 'Deafened'],
    takesTurns: true,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['voices', 'psychic', 'haunting', 'sound', 'crypt'],
    source: SRC,
  },
  {
    id: 'mirrorGallery',
    name: 'Mirror Gallery',
    description:
      'A hall of standing glass keyed to an illusion Arte. Every reflection moves half a beat late, and one of them is not a reflection.',
    category: 'magical',
    triggerKind: 'sight',
    triggerDescription: 'Triggers when a creature looks directly into any of the standing panes.',
    noticeDcOffset: 3,
    avoidSave: 'mind',
    disableTalent: 'Investigation',
    disableMethod:
      'Shatter or shroud the keystone pane, or track the half-beat lag back to whichever reflection is doing the casting.',
    baseThreatRating: 3,
    baseDamage: null,
    area: { shape: 'cube', size: 30 },
    conditions: ['Blinded', 'Frightened'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['illusion', 'mirror', 'confusion', 'gallery', 'duplicate'],
    source: SRC,
  },
  {
    id: 'bindingRunes',
    name: 'Binding Runes',
    description:
      'Chains of script burned into the floor of a holding cell, cut to restrain something far worse than an adventuring party. They do not make the distinction.',
    category: 'magical',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when a creature crosses the inner ring of script, and the chains rise out of the floor as bands of light.',
    noticeDcOffset: -1,
    avoidSave: 'soul',
    disableTalent: 'Arcana',
    disableMethod:
      'Overload one chain by channelling Aether into it, or chisel through the anchor rune at the centre of the ring.',
    baseThreatRating: 3,
    baseDamage: { count: 2, die: 10, damageType: 'Radiant' },
    area: { shape: 'cylinder', size: 15 },
    conditions: ['Restrained', 'Severed'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['binding', 'runes', 'prison', 'restrain', 'antimagic'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Aetheric
  // -------------------------------------------------------------------------
  {
    id: 'aetherSurge',
    name: 'Aether Surge',
    description:
      'A pressure spike in the local Aether, the kind that builds where too many Artes are cast in too small a room. It discharges through anything that has ever channelled.',
    category: 'aetheric',
    triggerKind: 'roundStart',
    triggerDescription:
      'Builds while Artes are cast nearby and breaks at the start of a round, striking every creature currently holding Aether.',
    noticeDcOffset: 0,
    avoidSave: 'soul',
    disableTalent: 'Arcana',
    disableMethod:
      'Vent the pressure into an earthed focus, or stop casting entirely and let the surge bleed off over three rounds.',
    baseThreatRating: 4,
    baseDamage: { count: 6, die: 8, damageType: 'Force' },
    area: { shape: 'emanation', size: 30 },
    conditions: ['Stunned', 'Severed'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'Every Arte cast inside the area adds 1d8 to the next discharge and pushes the emanation out another 5 feet.',
    keywords: ['aether', 'surge', 'caster punish', 'discharge', 'force'],
    source: SRC,
  },
  {
    id: 'nullZone',
    name: 'Null Zone',
    description:
      'A pocket of dead Aether where no Arte will take hold. The silence in it is not quiet, it is absence, and channellers feel it like a missing tooth.',
    category: 'aetheric',
    triggerKind: 'proximity',
    triggerDescription:
      'Applies continuously to any creature inside the boundary, and the boundary stays invisible until an Arte fails at it.',
    noticeDcOffset: 4,
    avoidSave: null,
    disableTalent: 'Arcana',
    disableMethod:
      'There is nothing to disarm. Map the boundary with a cheap probing Arte and fight outside it, or carry the anchoring null-shard out of the room.',
    baseThreatRating: 3,
    baseDamage: null,
    area: { shape: 'sphere', size: 30 },
    conditions: ['Severed'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['null', 'antimagic', 'dead aether', 'zone', 'caster punish'],
    source: SRC,
  },
  {
    id: 'gravityWell',
    name: 'Gravity Well',
    description:
      'A knot of folded Aether that has made up its mind about which way is down. Loose gear, arrows, and unbraced bodies all answer the same summons.',
    category: 'aetheric',
    triggerKind: 'proximity',
    triggerDescription:
      'Pulls on every creature and unsecured object within range at the start of each round for as long as the knot holds.',
    noticeDcOffset: -2,
    avoidSave: 'body',
    disableTalent: 'Arcana',
    disableMethod:
      'Collapse the knot with a dispelling Arte, or drive pitons, run line, anchor the party, and simply endure it.',
    baseThreatRating: 4,
    baseDamage: { count: 4, die: 6, damageType: 'Force' },
    area: { shape: 'sphere', size: 30 },
    conditions: ['Restrained', 'Prone'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'Each round the pull adds another 10 feet of forced movement, and a creature dragged into the core takes an extra 2d6 Force damage.',
    keywords: ['gravity', 'pull', 'forced movement', 'aether', 'anomaly'],
    source: SRC,
  },
  {
    id: 'resonanceFeedback',
    name: 'Resonance Feedback',
    description:
      'An unshielded aetherium coil, cracked and quietly singing. It couples to the nearest channelling mind and plays its own note back through them.',
    category: 'aetheric',
    triggerKind: 'magic',
    triggerDescription: 'Triggers whenever a creature casts an Arte within 60 feet of the coil.',
    noticeDcOffset: 1,
    avoidSave: 'mind',
    disableTalent: 'Technology',
    disableMethod:
      'Pack the coil in lead sheet, or short the housing to a grounding spike before anyone casts again.',
    baseThreatRating: 3,
    baseDamage: { count: 4, die: 10, damageType: 'Psychic' },
    area: null,
    conditions: ['Stunned'],
    takesTurns: false,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['aetherium', 'feedback', 'psychic', 'caster punish', 'machinery'],
    source: SRC,
  },
  {
    id: 'kingsBaneRift',
    name: 'Kings Bane Rift',
    description:
      'A passage into the Great Forest, ringed by the pale Kings Bane flowers that always mark them. Rifts wander when nobody is watching, and they do not care what they take along.',
    category: 'aetheric',
    triggerKind: 'proximity',
    triggerDescription:
      'Triggers when a creature falls or is forced within 5 feet of the rift mouth while it stands open.',
    noticeDcOffset: -4,
    avoidSave: 'soul',
    disableTalent: 'Occultism',
    disableMethod:
      'You cannot close a rift inside one fight. Cut back the Kings Bane blooms to shrink the mouth, or rope off the whole approach.',
    baseThreatRating: 5,
    baseDamage: { count: 3, die: 12, damageType: 'Force' },
    area: { shape: 'sphere', size: 15 },
    conditions: ['Frightened', 'Fatigued'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'The mouth widens by 5 feet each round it stays open, and on the fourth round something steps through from the far side.',
    keywords: ['rift', 'great forest', 'kings bane', 'planar', 'banishment'],
    source: SRC,
  },
  {
    id: 'darkSunGlare',
    name: 'Dark Sun Glare',
    description:
      'Light from a Dark Sun falling through torn cloud onto ground that has already ended once. Brief exposure is survivable. None of it is safe.',
    category: 'aetheric',
    triggerKind: 'roundStart',
    triggerDescription:
      'Affects every creature that begins its turn in unshielded light beneath a Dark Sun.',
    noticeDcOffset: -6,
    avoidSave: 'soul',
    disableTalent: 'Occultism',
    disableMethod:
      'There is no disarming a sun. Move into hard shadow, raise a shielding Arte, or wear warded cloth cut for the Dark Below.',
    baseThreatRating: 4,
    baseDamage: { count: 4, die: 8, damageType: 'Necrotic' },
    area: { shape: 'cylinder', size: 60 },
    conditions: ['Doomed', 'Fatigued'],
    takesTurns: false,
    reusable: true,
    escalates: true,
    escalationText:
      'On a fifth consecutive round of exposure the damage die steps up to d10 and the creature takes a lasting mutation of the Storyteller choosing.',
    keywords: ['dark below', 'dark sun', 'mutation', 'necrotic', 'exposure'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Environmental
  // -------------------------------------------------------------------------
  {
    id: 'chokingDamp',
    name: 'Choking Damp',
    description:
      'Heavy gas pooled in the low ground of a mine or crypt, colourless and faintly sweet. It sits below head height and it does not move on its own.',
    category: 'environmental',
    triggerKind: 'proximity',
    triggerDescription:
      'Affects any creature that enters the low ground, and any creature that starts its turn breathing it.',
    noticeDcOffset: 3,
    avoidSave: 'body',
    disableTalent: 'Naturalism',
    disableMethod:
      'Ventilate the low ground with a bellows or a wind Arte, or carry a caged bird and never go anywhere it stops singing.',
    baseThreatRating: 3,
    baseDamage: { count: 4, die: 6, damageType: 'Poison' },
    area: { shape: 'cube', size: 20 },
    conditions: ['Poisoned', 'Blinded'],
    takesTurns: false,
    reusable: true,
    escalates: true,
    escalationText:
      'Open flame carried into the damp ignites it: the hazard instead deals 8d6 Fire damage in a 30-foot sphere and is spent.',
    keywords: ['gas', 'poison', 'mine', 'crypt', 'explosive'],
    source: SRC,
  },
  {
    id: 'emberFall',
    name: 'Ember Fall',
    description:
      'Burning debris raining out of a collapsing roof or a burning canopy. Every round is another handful of coals thrown at random into the fight.',
    category: 'environmental',
    triggerKind: 'roundStart',
    triggerDescription:
      'Falls at the start of each round onto randomly determined squares inside the burning area.',
    noticeDcOffset: -5,
    avoidSave: 'body',
    disableTalent: 'Perception',
    disableMethod:
      'Nothing here can be disarmed. Read the fall pattern and call the safe squares, or get hard cover overhead.',
    baseThreatRating: 2,
    baseDamage: { count: 3, die: 6, damageType: 'Fire' },
    area: { shape: 'cylinder', size: 20 },
    conditions: ['Burning'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'The burning area spreads 10 feet along anything flammable each round, and one more square inside it catches per round.',
    keywords: ['fire', 'debris', 'burning', 'random', 'spreading'],
    source: SRC,
  },
  {
    id: 'crushingDepths',
    name: 'Crushing Depths',
    description:
      'Deep water, deep earth, or the airless weight of a lower layer. The pressure does not attack, it simply keeps being there until something gives.',
    category: 'environmental',
    triggerKind: 'roundStart',
    triggerDescription:
      'Applies at the start of every turn a creature spends below the safe depth without protection.',
    noticeDcOffset: -4,
    avoidSave: 'body',
    disableTalent: 'Athletics',
    disableMethod:
      'Ascend above the safe depth, or run a pressure line and equalise on the way down and the way back up.',
    baseThreatRating: 3,
    baseDamage: { count: 3, die: 10, damageType: 'Bludgeoning' },
    area: { shape: 'cube', size: 60 },
    conditions: ['Fatigued', 'Deafened'],
    takesTurns: false,
    reusable: true,
    escalates: true,
    escalationText:
      'Every round below the safe depth adds one level of Fatigued, and those levels do not clear until the creature surfaces.',
    keywords: ['pressure', 'depth', 'drowning', 'fatigue', 'underwater'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Biological
  // -------------------------------------------------------------------------
  {
    id: 'rotSpores',
    name: 'Rot Spores',
    description:
      'A shelf of grey fungus that answers footsteps with a cloud of spores. Whatever lands in an open wound keeps growing after the fight is over.',
    category: 'biological',
    triggerKind: 'proximity',
    triggerDescription:
      'Bursts when a creature comes within 10 feet of the shelf, or the instant the shelf takes any damage.',
    noticeDcOffset: 0,
    avoidSave: 'body',
    disableTalent: 'Naturalism',
    disableMethod:
      'Burn the shelf out from range, or cut it at the root with a long blade while holding your breath.',
    baseThreatRating: 2,
    baseDamage: { count: 3, die: 6, damageType: 'Poison' },
    area: { shape: 'sphere', size: 15 },
    conditions: ['Poisoned', 'Fatigued'],
    takesTurns: false,
    reusable: false,
    escalates: true,
    escalationText:
      'A creature that fails twice takes root: it gains Doomed 1 until the growth is cut out with a Medicine check on a later turn.',
    keywords: ['fungus', 'spores', 'poison', 'infection', 'underdark'],
    source: SRC,
  },
  {
    id: 'stranglevine',
    name: 'Stranglevine',
    description:
      'Great Forest undergrowth that hunts by patience. The vine lies as flat as a root until something warm stands on it, then takes the leg and keeps it.',
    category: 'biological',
    triggerKind: 'touch',
    triggerDescription:
      'Triggers when a warm-blooded creature steps within reach of the coiled runners.',
    noticeDcOffset: 3,
    avoidSave: 'body',
    disableTalent: 'Survivalism',
    disableMethod:
      'Sever the runner at the crown, or scatter ash and salt across the coil until it recoils on its own.',
    baseThreatRating: 3,
    baseDamage: { count: 3, die: 8, damageType: 'Bludgeoning' },
    area: { shape: 'emanation', size: 10 },
    conditions: ['Grappled', 'Restrained'],
    takesTurns: true,
    reusable: true,
    escalates: false,
    escalationText: '',
    keywords: ['vine', 'flora', 'grapple', 'great forest', 'ambush'],
    source: SRC,
  },
  {
    id: 'shriekerBloom',
    name: 'Shrieker Bloom',
    description:
      'A pale bulb that screams when light or movement touches it, loud enough to carry three chambers deep. Everything down here has learned what the scream means.',
    category: 'biological',
    triggerKind: 'sight',
    triggerDescription:
      'Triggers when light falls on the bulb, or when a creature moves within 30 feet of it.',
    noticeDcOffset: -3,
    avoidSave: 'body',
    disableTalent: 'Stealth',
    disableMethod:
      'Smother the bulb with a cloak before it fills its air sac, or burst it from range with a thrown stone.',
    baseThreatRating: 1,
    baseDamage: { count: 2, die: 6, damageType: 'Thunder' },
    area: { shape: 'emanation', size: 20 },
    conditions: ['Deafened'],
    takesTurns: true,
    reusable: true,
    escalates: true,
    escalationText:
      'Each round it shrieks, every other Shrieker Bloom within 60 feet takes up the cry and reinforcements arrive one round sooner.',
    keywords: ['fungus', 'alarm', 'thunder', 'cavern', 'reinforcements'],
    source: SRC,
  },
];

export const hazardTypeById: Record<string, HazardTypeDef> = Object.fromEntries(
  HAZARD_TYPES.map((h) => [h.id, h]),
);
