/**
 * Encounter environments the Crucible can stage a fight in: what the terrain does, how much it
 * shifts the Threat Rating, which creature roles it rewards, and which hazards belong there.
 *
 * Provenance: authored for the Crucible GM tool. Setting nouns (the Great Forest and its
 * White-Trees, the Megalith of Absolution, the Dark Below and its Dark Suns, the Nexus Beneath,
 * the Endless Astral Sea, the Elysian Fields, Avaranth, the Red Wastes, Vigilo, the Pantheon,
 * Faeia and the Orrery of the Firmament) come from Convergence Storytelling Guide.md L258-306 and
 * L1215; creature tag families from Creature Tags.md. Every `commonHazardIds` entry is an id
 * defined in hazardTypes.registry.ts, and every `favorsRoles` entry is one of the nine role ids
 * in creatureRoles.registry.ts. The terrain rulings themselves are homebrew scaffolding.
 */

export interface EncounterEnvironmentDef {
  id: string;
  name: string;
  description: string;
  /** Threat Rating modifier this environment contributes to an encounter. */
  threatModifier: number;
  /** Why it shifts the threat. */
  threatReason: string;
  /** Terrain effects in play. */
  terrainEffects: string[];
  /** Visibility: clear | dim | dark | obscured | variable */
  visibility: string;
  /** Creature-role ids the environment favours. */
  favorsRoles: string[];
  /** Hazard type ids that commonly appear here. */
  commonHazardIds: string[];
  /** Creature tag families that live here. */
  nativeCreatureKeywords: string[];
  /** Movement notes, e.g. 'difficult terrain in the undergrowth'. */
  movementNotes: string;
  keywords: string[];
  source: string;
}

const SRC = 'The Crucible';

export const ENCOUNTER_ENVIRONMENTS: EncounterEnvironmentDef[] = [
  // -------------------------------------------------------------------------
  // Wilderness
  // -------------------------------------------------------------------------
  {
    id: 'deepForest',
    name: 'Deep Forest',
    description:
      'Old timber standing close enough that nobody sees the whole fight at once. Everything here is cover for somebody, and the somebody is rarely the party.',
    threatModifier: 1,
    threatReason:
      'Sightlines break at twenty paces, so ranged support cannot cover the line and an ambusher gets the first exchange free.',
    terrainEffects: [
      'Heavy undergrowth is difficult terrain',
      'Trunks give half cover across almost every square',
      'The canopy blocks flight above 20 feet',
    ],
    visibility: 'dim',
    favorsRoles: ['scout', 'controller', 'minion'],
    commonHazardIds: ['stranglevine', 'netSnare', 'pitTrap', 'rotSpores'],
    nativeCreatureKeywords: ['Beast', 'Beastmen', 'Flora', 'Fae', 'Monstrosity'],
    movementNotes:
      'Difficult terrain in the undergrowth; game trails run at full speed and are the obvious approach for exactly that reason.',
    keywords: ['forest', 'woodland', 'ambush', 'cover', 'wilderness'],
    source: SRC,
  },
  {
    id: 'mireSwamp',
    name: 'Mire Swamp',
    description:
      'Black water, reed beds, and mud that takes a boot and keeps it. Everything that lives here is patient and most of it is already downwind.',
    threatModifier: 1,
    threatReason:
      'The ground slows every advance and hides every ambush, and the locals have the water table on their side.',
    terrainEffects: [
      'Standing water and mud are difficult terrain',
      'Reed beds give half cover and fully hide prone creatures',
      'Marsh gas ignites off any open flame',
    ],
    visibility: 'obscured',
    favorsRoles: ['scout', 'controller', 'minion'],
    commonHazardIds: ['quicksand', 'chokingDamp', 'rotSpores', 'stranglevine'],
    nativeCreatureKeywords: ['Slime', 'Flora', 'Beast', 'Undead', 'Monstrosity'],
    movementNotes:
      'Difficult terrain nearly everywhere; the hummock trail runs at full speed and is exactly where the ambush is waiting.',
    keywords: ['swamp', 'mire', 'bog', 'ambush', 'wilderness'],
    source: SRC,
  },
  {
    id: 'tundraExpanse',
    name: 'Tundra Expanse',
    description:
      'Wind-packed snow to the horizon in every direction, with a sky that gives no sense of distance. The cold is not an event here, it is the baseline.',
    threatModifier: 0,
    threatReason:
      'There is nothing to hide behind in either direction, so the fight is decided by range bands and cold attrition instead of position.',
    terrainEffects: [
      'No natural cover for hundreds of yards',
      'Cold exposure adds Fatigued over a long engagement',
      'Snow crust hides depressions and meltwater channels',
    ],
    visibility: 'clear',
    favorsRoles: ['blaster', 'coordinator', 'healer'],
    commonHazardIds: ['freezingFog', 'thinIce', 'rockslide'],
    nativeCreatureKeywords: ['Beast', 'Elemental', 'Giant', 'Undead'],
    movementNotes:
      'Deep snow is difficult terrain off the wind-packed ridges; sledge tracks and frozen river courses are the only fast lanes.',
    keywords: ['tundra', 'snow', 'cold', 'open ground', 'exposure'],
    source: SRC,
  },
  {
    id: 'frozenLake',
    name: 'Frozen Lake',
    description:
      'A sheet of grey ice over water that will kill anyone who reaches it. The surface holds until somebody heavy stops paying attention.',
    threatModifier: 1,
    threatReason:
      'The floor is a hazard that gets worse every time the front line lands on it, and it punishes armour hardest.',
    terrainEffects: [
      'Ice is slick: a Body save or fall Prone when dashing',
      'Fire and Thunder damage crack the sheet in a 10-foot radius',
      'The water beneath is lethally cold',
    ],
    visibility: 'clear',
    favorsRoles: ['blaster', 'controller', 'scout'],
    commonHazardIds: ['thinIce', 'freezingFog', 'crushingDepths'],
    nativeCreatureKeywords: ['Elemental', 'Beast', 'Undead', 'Aberration'],
    movementNotes:
      'Full speed in a straight line only; any dash or sharp turn calls for a Body save against falling Prone.',
    keywords: ['ice', 'lake', 'slippery', 'cold', 'breakable floor'],
    source: SRC,
  },
  {
    id: 'desertDunes',
    name: 'Desert Dunes',
    description:
      'Sand ridges that move a little every night, under a sun that treats armour as a punishment. Distances out here are always further than they look.',
    threatModifier: 1,
    threatReason:
      'Heat, distance, and shifting footing grind down anyone who cannot end the fight quickly.',
    terrainEffects: [
      'Dune faces are difficult terrain on the climb',
      'Heat adds Fatigued over a long engagement',
      'Blowing sand cuts visibility to 30 feet during a storm',
    ],
    visibility: 'variable',
    favorsRoles: ['scout', 'blaster', 'controller'],
    commonHazardIds: ['quicksand', 'rockslide', 'crushingDepths'],
    nativeCreatureKeywords: ['Beast', 'Elemental', 'Undead', 'Monstrosity', 'Giant'],
    movementNotes:
      'Windward faces are difficult terrain; the leeward slip face can be ridden down at double speed for one round.',
    keywords: ['desert', 'dunes', 'heat', 'open ground', 'sandstorm'],
    source: SRC,
  },
  {
    id: 'mountainPass',
    name: 'Mountain Pass',
    description:
      'A narrow floor of broken rock with scree walls on both sides. Whoever holds the heights holds the conversation.',
    threatModifier: 1,
    threatReason:
      'High ground on both flanks belongs to whoever arrived first, and that is very rarely the party.',
    terrainEffects: [
      'Scree slopes on both flanks are difficult terrain',
      'High ground grants advantage on ranged attacks into the pass',
      'Wind imposes disadvantage on ranged attacks beyond 60 feet',
    ],
    visibility: 'clear',
    favorsRoles: ['blaster', 'scout', 'coordinator'],
    commonHazardIds: ['rockslide', 'freezingFog', 'thinIce'],
    nativeCreatureKeywords: ['Giant', 'Beast', 'Elemental', 'Dragon', 'Monstrosity'],
    movementNotes:
      'The pass floor runs at full speed; anything up the flanking scree costs double movement and announces itself.',
    keywords: ['mountain', 'pass', 'high ground', 'chokepoint', 'wilderness'],
    source: SRC,
  },
  {
    id: 'coastalCliffs',
    name: 'Coastal Cliffs',
    description:
      'A shelf path cut between wet rock and a long drop into surf. The weather has opinions and none of them are about who deserves to win.',
    threatModifier: 1,
    threatReason:
      'A narrow shelf with a lethal fall on one side turns every forced-movement effect into a save against dying.',
    terrainEffects: [
      'Shelf paths are 5 to 10 feet wide with a lethal fall',
      'Sea spray leaves the stone slick underfoot',
      'Wind imposes disadvantage on ranged attacks beyond 30 feet',
    ],
    visibility: 'variable',
    favorsRoles: ['controller', 'scout', 'blaster'],
    commonHazardIds: ['rockslide', 'gravityWell', 'crushingDepths', 'freezingFog'],
    nativeCreatureKeywords: ['Beast', 'Elemental', 'Fae', 'Monstrosity'],
    movementNotes:
      'Full speed along the shelf, half speed up the goat tracks; any push toward the seaward edge should be resolved slowly.',
    keywords: ['cliff', 'coast', 'fall', 'narrow', 'weather'],
    source: SRC,
  },
  {
    id: 'volcanicCaldera',
    name: 'Volcanic Caldera',
    description:
      'A basin of black basalt over a fire that never went out, roofed in falling ash. The crust is thick enough almost everywhere.',
    threatModifier: 2,
    threatReason:
      'The ground deals damage on a schedule, so a long fight is a losing fight for whoever has the least mobility.',
    terrainEffects: [
      'Ash fall obscures everything beyond 60 feet',
      'Fresh basalt crust breaks under heavy weight',
      'Ambient heat adds Fatigued over a long engagement',
    ],
    visibility: 'obscured',
    favorsRoles: ['blaster', 'scout', 'bruiser'],
    commonHazardIds: ['magmaVent', 'emberFall', 'chokingDamp', 'rockslide'],
    nativeCreatureKeywords: ['Elemental', 'Dragon', 'Fiend', 'Giant', 'Monstrosity'],
    movementNotes:
      'Cooled flows run at full speed; fresh crust is difficult terrain and calls a Body save for every square crossed.',
    keywords: ['volcano', 'caldera', 'fire', 'ash', 'timer'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Underground
  // -------------------------------------------------------------------------
  {
    id: 'cavernSystem',
    name: 'Cavern System',
    description:
      'Natural rock, worked by water rather than hands, so nothing is level and nothing is square. Light stops where the lamp stops.',
    threatModifier: 1,
    threatReason:
      'Darkness favours whatever already lives here, and the chambers are too irregular for a formation to hold shape.',
    terrainEffects: [
      'Total darkness beyond carried light',
      'Flowstone and rubble floors are difficult terrain',
      'Sound carries far and arrives from the wrong direction',
    ],
    visibility: 'dark',
    favorsRoles: ['scout', 'bruiser', 'minion'],
    commonHazardIds: ['acidPool', 'shriekerBloom', 'rotSpores', 'chokingDamp'],
    nativeCreatureKeywords: ['Beast', 'Slime', 'Monstrosity', 'Aberration', 'Elemental'],
    movementNotes:
      'Difficult terrain across the flowstone; crawls and chimneys force single file and cost double movement.',
    keywords: ['cavern', 'cave', 'darkness', 'underground', 'irregular'],
    source: SRC,
  },
  {
    id: 'deepMine',
    name: 'Deep Mine',
    description:
      'Timbered galleries running level after level into the rock, with rails, carts, and just enough lamp oil left to matter. Somebody stopped working here in a hurry.',
    threatModifier: 1,
    threatReason:
      'Long straight galleries hand the field to whoever shoots first, and one collapse cuts the party in half.',
    terrainEffects: [
      'Timbered galleries collapse when the props are struck',
      'Ore carts and rails serve as improvised cover',
      'Bad air pools in the lower drifts',
    ],
    visibility: 'dark',
    favorsRoles: ['blaster', 'controller', 'minion'],
    commonHazardIds: ['chokingDamp', 'collapsingCeiling', 'crushingDepths', 'lightningConduit'],
    nativeCreatureKeywords: ['Constructed', 'Beast', 'Elemental', 'Undead', 'Smallfolk'],
    movementNotes:
      'Rail beds run flat and fast; the side drifts are difficult terrain and usually too low for a Large creature.',
    keywords: ['mine', 'gallery', 'collapse', 'underground', 'industrial'],
    source: SRC,
  },
  {
    id: 'sewerTunnels',
    name: 'Sewer Tunnels',
    description:
      'Brick barrel vaults carrying a city worth of runoff, with maintenance ledges barely wide enough to stand on. Everyone who fights down here has done it before.',
    threatModifier: 1,
    threatReason:
      'Ankle-deep filth and no room to swing, against locals who know every side channel and grate.',
    terrainEffects: [
      'Standing water is difficult terrain and conducts',
      'Ledges give a 5-foot height advantage over the channel',
      'Foul air imposes disadvantage on tracking by scent',
    ],
    visibility: 'dark',
    favorsRoles: ['scout', 'minion', 'controller'],
    commonHazardIds: ['chokingDamp', 'lightningConduit', 'rotSpores', 'netSnare'],
    nativeCreatureKeywords: ['Slime', 'Undead', 'Beast', 'Smallfolk', 'Monstrosity'],
    movementNotes:
      'The channel is difficult terrain; the ledges are 3 feet wide and fighting on them at speed calls a Body save.',
    keywords: ['sewer', 'tunnel', 'urban underground', 'water', 'cramped'],
    source: SRC,
  },
  {
    id: 'floodedCistern',
    name: 'Flooded Cistern',
    description:
      'A pillared reservoir gone waist deep, where every footfall answers itself twice. The plinths are the only dry ground and there are not enough of them.',
    threatModifier: 1,
    threatReason:
      'Deep water halves the melee line and the echo makes verbal coordination unreliable for both sides.',
    terrainEffects: [
      'Waist-deep water is difficult terrain and conducts',
      'Pillar rows break line of sight every 20 feet',
      'Echo imposes disadvantage on hearing-based checks',
    ],
    visibility: 'dark',
    favorsRoles: ['controller', 'blaster', 'minion'],
    commonHazardIds: ['lightningConduit', 'crushingDepths', 'chokingDamp', 'acidPool'],
    nativeCreatureKeywords: ['Slime', 'Undead', 'Elemental', 'Aberration'],
    movementNotes:
      'Difficult terrain in the water; each pillar plinth is dry, defensible, and holds exactly one Medium creature.',
    keywords: ['cistern', 'flooded', 'pillars', 'echo', 'underground'],
    source: SRC,
  },
  {
    id: 'dungeonCorridor',
    name: 'Dungeon Corridor',
    description:
      'Worked stone, five feet across, running straight to a door somebody locked on purpose. Every inch of it was designed by a person who expected visitors.',
    threatModifier: 0,
    threatReason:
      'A five-foot front is a fair trade: the party cannot be flanked, and the party cannot bring numbers to bear either.',
    terrainEffects: [
      'Only one or two combatants can hold the front rank',
      'Doors and portcullises split the party on a bad round',
      'Trap density is high and entirely deliberate',
    ],
    visibility: 'dim',
    favorsRoles: ['tank', 'blaster', 'controller'],
    commonHazardIds: ['dartWall', 'bladePendulum', 'flameJet', 'pitTrap', 'crushingWalls'],
    nativeCreatureKeywords: ['Constructed', 'Undead', 'Humanoid', 'Mercenary'],
    movementNotes:
      'Five to ten feet wide with no cover; the only tactical choice left is which end of the corridor you want.',
    keywords: ['dungeon', 'corridor', 'chokepoint', 'traps', 'worked stone'],
    source: SRC,
  },
  {
    id: 'ancientRuin',
    name: 'Ancient Ruin',
    description:
      'Half a building, standing at odd angles under whatever grew over it. Some of what the builders left behind is still powered and still counting intruders.',
    threatModifier: 1,
    threatReason:
      'Broken sightlines and unstable footing, plus whatever the original builders left running and unattended.',
    terrainEffects: [
      'Fallen masonry gives half cover throughout',
      'Floors give way under Large or heavier creatures',
      'Old wards still hold their charge',
    ],
    visibility: 'variable',
    favorsRoles: ['scout', 'caster', 'controller'],
    commonHazardIds: ['collapsingCeiling', 'wardingSigil', 'alarmGlyph', 'pitTrap', 'cursedGround'],
    nativeCreatureKeywords: ['Constructed', 'Undead', 'Elemental', 'Aberration', 'Monstrosity'],
    movementNotes:
      'Rubble is difficult terrain; climbing the standing walls costs half speed and opens clean firing lines both ways.',
    keywords: ['ruin', 'ancient', 'rubble', 'wards', 'exploration'],
    source: SRC,
  },
  {
    id: 'necropolis',
    name: 'Necropolis',
    description:
      'Street after street of mausoleums laid out like a city that forgot to have people in it. The soil has been used and reused and it has not forgotten either.',
    threatModifier: 2,
    threatReason:
      'The dead here are numerous, patient, and get back up, so attrition works for the ground rather than the party.',
    terrainEffects: [
      'Grave soil is cursed and dulls healing',
      'Mausoleum rows break line of sight every 15 feet',
      'Consecrated plots suppress undead within 10 feet',
    ],
    visibility: 'dim',
    favorsRoles: ['minion', 'caster', 'healer'],
    commonHazardIds: ['cursedGround', 'whisperingChorus', 'summoningCircle', 'bindingRunes'],
    nativeCreatureKeywords: ['Undead', 'Fiend', 'Celestial', 'Abomination'],
    movementNotes:
      'The lanes between mausoleum rows run at full speed; cutting across the plots is difficult terrain and wakes what is under it.',
    keywords: ['necropolis', 'graveyard', 'undead', 'curse', 'maze'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Built and civilised
  // -------------------------------------------------------------------------
  {
    id: 'cathedralNave',
    name: 'Cathedral Nave',
    description:
      'A long consecrated hall under a vault high enough to hold weather, with galleries running the length of both walls. Sound carries and so does anything said in it.',
    threatModifier: 0,
    threatReason:
      'A long open hall with high galleries gives clean lines to everyone, so the height advantage decides the fight rather than the terrain.',
    terrainEffects: [
      'Galleries 25 feet up overlook the entire nave',
      'Consecrated flagstones grant advantage on Soul saves',
      'Pillars give three-quarters cover along the aisles',
    ],
    visibility: 'dim',
    favorsRoles: ['blaster', 'healer', 'coordinator'],
    commonHazardIds: ['bindingRunes', 'alarmGlyph', 'whisperingChorus', 'wardingSigil'],
    nativeCreatureKeywords: ['Celestial', 'Undead', 'Humanoid', 'Fiend'],
    movementNotes:
      'Open flagstones at full speed; the gallery stair is the only route up and it is a bottleneck by design.',
    keywords: ['cathedral', 'temple', 'consecrated', 'gallery', 'vertical'],
    source: SRC,
  },
  {
    id: 'archiveLibrary',
    name: 'Archive Library',
    description:
      'Stacks two storeys tall on rolling ladders, packed tight enough that nobody sees more than one aisle at a time. Nothing here is dangerous until the first fire Arte goes off.',
    threatModifier: 0,
    threatReason:
      'Cover is total and mutual, so the encounter resolves as a hunt rather than a line fight and neither side gains outright.',
    terrainEffects: [
      'Stacks give three-quarters cover and block every sightline',
      'Shelving topples in chains when struck hard',
      'Fire spreads two squares a round once anything catches',
    ],
    visibility: 'dim',
    favorsRoles: ['scout', 'controller', 'caster'],
    commonHazardIds: ['alarmGlyph', 'wardingSigil', 'mirrorGallery', 'emberFall'],
    nativeCreatureKeywords: ['Constructed', 'Undead', 'Aberration', 'Humanoid'],
    movementNotes:
      'Aisles are 5 feet wide and force single file; climbing the stacks costs half speed and risks bringing a whole row down.',
    keywords: ['library', 'archive', 'stacks', 'fire risk', 'hunt'],
    source: SRC,
  },
  {
    id: 'throneRoom',
    name: 'Throne Room',
    description:
      'A hall built to make the walk to the dais feel long, with the guard rota timed to that walk. The person on the chair picked this room.',
    threatModifier: 1,
    threatReason:
      'The defender chose this ground, sighted every approach, and has reinforcements arriving on a schedule.',
    terrainEffects: [
      'The dais stands 10 feet up with clear lines to every door',
      'Side doors admit a fresh guard wave every third round',
      'Banners and drapes can be cut down for cover',
    ],
    visibility: 'clear',
    favorsRoles: ['coordinator', 'tank', 'blaster'],
    commonHazardIds: ['bindingRunes', 'alarmGlyph', 'boltTurret', 'wardingSigil'],
    nativeCreatureKeywords: ['Humanoid', 'Constructed', 'Celestial', 'Soldier'],
    movementNotes:
      'Open marble at full speed; the dais steps are difficult terrain and every one of them is covered from above.',
    keywords: ['throne room', 'boss arena', 'reinforcements', 'court', 'set piece'],
    source: SRC,
  },
  {
    id: 'arenaPit',
    name: 'Arena Pit',
    description:
      'A sand floor inside a ring of shouting, with gates that only open when somebody else decides. Nobody in the stands wants this to end early.',
    threatModifier: 1,
    threatReason:
      'No retreat, no cover, and a crowd that will not permit disengagement, which removes the party best escape option.',
    terrainEffects: [
      'Churned sand is difficult terrain after the first round',
      'No exits: withdrawing is not available',
      'The crowd grants advantage on Presence checks to whoever is winning',
    ],
    visibility: 'clear',
    favorsRoles: ['bruiser', 'tank', 'blaster'],
    commonHazardIds: ['netSnare', 'spikedPit', 'flameJet', 'boltTurret'],
    nativeCreatureKeywords: ['Humanoid', 'Beast', 'Monstrosity', 'Mercenary'],
    movementNotes:
      'Sand slows a charge to half speed after the first round; the gates open and close on the arena master signal, not yours.',
    keywords: ['arena', 'pit', 'duel', 'crowd', 'no retreat'],
    source: SRC,
  },
  {
    id: 'crowdedMarket',
    name: 'Crowded Market',
    description:
      'Stalls, awnings, livestock, and several hundred people who did not agree to be here for this. Every area effect has a bystander in it.',
    threatModifier: -1,
    threatReason:
      'Bystanders blunt area effects and force restraint, which costs the aggressor far more than it costs the defender.',
    terrainEffects: [
      'Civilians occupy half the squares and scatter unpredictably',
      'Stalls and awnings give half cover',
      'Area effects risk collateral and a reckoning with the local authority',
    ],
    visibility: 'clear',
    favorsRoles: ['scout', 'controller', 'coordinator'],
    commonHazardIds: ['netSnare', 'alarmGlyph', 'emberFall', 'chokingDamp'],
    nativeCreatureKeywords: ['Humanoid', 'Commoner', 'Smallfolk', 'Beastmen', 'Mercenary'],
    movementNotes:
      'Crowd squares are difficult terrain; a Presence or Acrobatics check clears one lane for a single round.',
    keywords: ['market', 'crowd', 'bystanders', 'urban', 'restraint'],
    source: SRC,
  },
  {
    id: 'cityRooftops',
    name: 'City Rooftops',
    description:
      'Tile, slate, and washing lines forty feet above a street nobody is watching. The fight moves faster than heavy armour can follow it.',
    threatModifier: 2,
    threatReason:
      'Every miss and every shove is a forty-foot fall, and the terrain punishes anyone who cannot jump or climb.',
    terrainEffects: [
      'Gaps of 5 to 15 feet between roofs demand jumps',
      'Tile slopes are difficult terrain and shed underfoot',
      'Chimneys and dormers give half cover',
    ],
    visibility: 'variable',
    favorsRoles: ['scout', 'blaster', 'controller'],
    commonHazardIds: ['emberFall', 'collapsingCeiling', 'netSnare', 'boltTurret'],
    nativeCreatureKeywords: ['Humanoid', 'Beastmen', 'Fae', 'Constructed'],
    movementNotes:
      'Ridge lines run at full speed; slopes are difficult terrain and a failed Body save on one means a slide to the gutter.',
    keywords: ['rooftops', 'urban', 'chase', 'falls', 'vertical'],
    source: SRC,
  },
  {
    id: 'chasmBridge',
    name: 'Chasm Bridge',
    description:
      'A single unrailed span over a drop that ate the sound of the last stone somebody threw. There is no second route and both sides know it.',
    threatModifier: 1,
    threatReason:
      'A single-file crossing with no cover reduces the fight to a shoving match, and the loser does not come back from it.',
    terrainEffects: [
      'No cover anywhere on the span',
      'Forced movement over an edge is effectively lethal',
      'The span itself can be cut, dropping everyone on it',
    ],
    visibility: 'variable',
    favorsRoles: ['tank', 'controller', 'blaster'],
    commonHazardIds: ['collapsingCeiling', 'gravityWell', 'rockslide', 'boltTurret'],
    nativeCreatureKeywords: ['Constructed', 'Giant', 'Monstrosity', 'Elemental'],
    movementNotes:
      'The span is 10 feet wide and unrailed; forced movement toward an edge is the entire tactical conversation.',
    keywords: ['bridge', 'chasm', 'chokepoint', 'falls', 'forced movement'],
    source: SRC,
  },
  {
    id: 'shipDeck',
    name: 'Ship Deck',
    description:
      'A working deck under sail, with rigging overhead, hatches underfoot, and nowhere at all to disengage to. Whatever starts here finishes here.',
    threatModifier: 1,
    threatReason:
      'A small moving field with no line of retreat and fire risk everywhere, which removes attrition tactics from the party toolkit.',
    terrainEffects: [
      'The deck pitches: a Body save or fall Prone when dashing',
      'Rigging can be climbed for height or cut to entangle',
      'Fire on a wooden deck spreads every round',
    ],
    visibility: 'variable',
    favorsRoles: ['bruiser', 'scout', 'controller'],
    commonHazardIds: ['emberFall', 'netSnare', 'crushingDepths', 'lightningConduit'],
    nativeCreatureKeywords: ['Humanoid', 'Mercenary', 'Undead', 'Beast', 'Elemental'],
    movementNotes:
      'Open deck at full speed; the shrouds cost half speed to climb and put a scout 20 feet above the whole fight.',
    keywords: ['ship', 'deck', 'boarding', 'naval', 'no retreat'],
    source: SRC,
  },
  {
    id: 'openBattlefield',
    name: 'Open Battlefield',
    description:
      'A field two armies are already using, churned to mud and marked by whichever banner moved last. The party is a footnote in somebody else larger plan.',
    threatModifier: 2,
    threatReason:
      'Both sides field numbers the party cannot match, and stray fire arrives regardless of who the party is fighting.',
    terrainEffects: [
      'Churned mud and fallen bodies are difficult terrain',
      'Stray volleys land on random squares each round',
      'Horns and banners move whole units on a schedule',
    ],
    visibility: 'obscured',
    favorsRoles: ['coordinator', 'minion', 'healer'],
    commonHazardIds: ['emberFall', 'cursedGround', 'netSnare', 'summoningCircle'],
    nativeCreatureKeywords: ['Humanoid', 'Soldier', 'Mercenary', 'Undead', 'Constructed'],
    movementNotes:
      'Difficult terrain across the churn; the supply road is clear, exposed, and watched by every archer on the field.',
    keywords: ['battlefield', 'war', 'mass combat', 'attrition', 'chaos'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // The Great Forest and the layers around it
  // -------------------------------------------------------------------------
  {
    id: 'greatForestCanopy',
    name: 'Great Forest Canopy',
    description:
      'The branch-roads between White-Trees, where a limb is wide enough to hold a war and the drop below it has no floor anyone has ever found. Nothing here stays mapped from one expedition to the next.',
    threatModifier: 3,
    threatReason:
      'The ground rearranges itself between visits, rifts open unannounced, and a failed grip is a fall out of the world entirely.',
    terrainEffects: [
      'Any fall off an unrailed branch has no bottom',
      'Bark and moss surfaces shift position between rounds',
      'Aether density swings wildly from round to round',
    ],
    visibility: 'variable',
    favorsRoles: ['scout', 'caster', 'controller'],
    commonHazardIds: ['kingsBaneRift', 'aetherSurge', 'gravityWell', 'stranglevine'],
    nativeCreatureKeywords: ['Fae', 'Aberration', 'Flora', 'Abomination', 'Monstrosity'],
    movementNotes:
      'Branch-roads run 10 to 60 feet wide with no rails; anything off the branch is a fall nobody survives.',
    keywords: ['great forest', 'white-tree', 'canopy', 'planar', 'unmapped'],
    source: SRC,
  },
  {
    id: 'kingsBaneGlade',
    name: 'Kings Bane Glade',
    description:
      'A clearing choked with the pale Kings Bane flowers that always mark a natural rift into the Great Forest. Travellers come through here, and so do things that are not travellers.',
    threatModifier: 2,
    threatReason:
      'Reinforcements can arrive from another world entirely, and the rift itself is a live hazard nobody can switch off.',
    terrainEffects: [
      'Kings Bane pollen slows Aether recovery',
      'The rift mouth drifts 5 feet in a random direction each round',
      'Noise from the far side masks the approach of anything local',
    ],
    visibility: 'dim',
    favorsRoles: ['controller', 'caster', 'minion'],
    commonHazardIds: ['kingsBaneRift', 'aetherSurge', 'stranglevine', 'nullZone'],
    nativeCreatureKeywords: ['Fae', 'Aberration', 'Flora', 'Humanoid', 'Monstrosity'],
    movementNotes:
      'Open ground in the glade proper; the flower beds around the rim are difficult terrain and shed pollen when trampled.',
    keywords: ['kings bane', 'rift', 'great forest', 'glade', 'crossing'],
    source: SRC,
  },
  {
    id: 'megalithHalls',
    name: 'Halls of the Megalith',
    description:
      'The white and gold marble of the Megalith of Absolution, where every corridor is longer than it looks and every scar in the stone came from a war somebody lost. Past its doors, only Overtures walk.',
    threatModifier: 2,
    threatReason:
      'The Megalith has never been taken in any cycle, and whatever holds it fights as though that record is personal.',
    terrainEffects: [
      'Halls run 40 feet wide beneath 60-foot vaults',
      'The marble refuses Artes that would breach or mark it',
      'Distances stretch: a withdrawal takes longer than the approach did',
    ],
    visibility: 'clear',
    favorsRoles: ['tank', 'blaster', 'coordinator'],
    commonHazardIds: ['bindingRunes', 'wardingSigil', 'nullZone', 'alarmGlyph'],
    nativeCreatureKeywords: ['Celestial', 'Constructed', 'Champion', 'Avatar'],
    movementNotes:
      'Open marble at full speed, but the halls are long enough that a retreat costs three rounds nobody has to spare.',
    keywords: ['megalith', 'absolution', 'overture', 'marble', 'sanctum'],
    source: SRC,
  },
  {
    id: 'darkBelowFelledWorld',
    name: 'Felled World of the Dark Below',
    description:
      'The wreck of a White-Tree dragged under after its ending, lying in the composting dark beneath the Forest. Survivors from three timelines share the ruins and none of them trust the others.',
    threatModifier: 3,
    threatReason:
      'No afterlife survived the felling, so every death here is permanent, and the light overhead rewrites anything left under it too long.',
    terrainEffects: [
      'Prime Dark Sun light reaches anything not in hard shadow',
      'Distance and time run inconsistently between rounds',
      'Salvage cover drawn from three different worlds, none of it stable',
    ],
    visibility: 'dim',
    favorsRoles: ['bruiser', 'scout', 'minion'],
    commonHazardIds: ['darkSunGlare', 'cursedGround', 'collapsingCeiling', 'rotSpores'],
    nativeCreatureKeywords: ['Abomination', 'Aberration', 'Undead', 'Fiend', 'Humanoid'],
    movementNotes:
      'Rubble fields are difficult terrain; the only fast routes run in the open, directly under the Dark Sun.',
    keywords: ['dark below', 'felled world', 'dark sun', 'permanent death', 'salvage'],
    source: SRC,
  },
  {
    id: 'nexusBeneathApproach',
    name: 'Approach to the Nexus Beneath',
    description:
      'The marshalling ground before the seat of the Scarlet King, where his crusade is ordered and sent out. Nearly everything that has ever attacked here was repelled without visible effort.',
    threatModifier: 3,
    threatReason:
      'This is the defended heart of a conquering power: reinforcement is effectively unlimited and the ground was shaped to kill attackers.',
    terrainEffects: [
      'Fire lanes cut deliberately across every approach',
      'Command horns move reserves onto the field every second round',
      'Scarlet banners blunt morale effects used against the defenders',
    ],
    visibility: 'dim',
    favorsRoles: ['coordinator', 'tank', 'minion'],
    commonHazardIds: ['boltTurret', 'bindingRunes', 'darkSunGlare', 'cursedGround'],
    nativeCreatureKeywords: ['Fiend', 'Abomination', 'Undead', 'Soldier', 'Commander'],
    movementNotes:
      'Open killing ground at full speed, which is the point; the ravine flanks are difficult terrain and seeded with wards.',
    keywords: ['nexus beneath', 'scarlet king', 'dark below', 'fortress', 'siege'],
    source: SRC,
  },
  {
    id: 'astralSeaShallows',
    name: 'Endless Astral Sea Shallows',
    description:
      'The prismatic expanse that connects an unknown number of White-Trees, where thought and belief carry more weight than distance and time has very little to say.',
    threatModifier: 2,
    threatReason:
      'Conviction shapes the field directly, so whichever side believes harder rewrites the terrain in the middle of the fight.',
    terrainEffects: [
      'Distance is negotiable: ranges shift by half each round',
      'A Conviction check can reshape one terrain feature per round',
      'No gravity baseline, so the fight is fully three-dimensional',
    ],
    visibility: 'variable',
    favorsRoles: ['caster', 'controller', 'coordinator'],
    commonHazardIds: ['gravityWell', 'aetherSurge', 'nullZone', 'mirrorGallery'],
    nativeCreatureKeywords: ['Aberration', 'Celestial', 'Fae', 'Elemental', 'Abomination'],
    movementNotes:
      'Movement is drift and swim in three dimensions; a creature with no fly or swim speed moves at half rate.',
    keywords: ['astral sea', 'planar', 'belief', 'weightless', 'travel'],
    source: SRC,
  },
  {
    id: 'elysianFields',
    name: 'The Elysian Fields',
    description:
      'Endless red spider-lilies, and souls standing at the edge of a final end. Reality bends politely here, and fighting in it feels like an intrusion because it is one.',
    threatModifier: 1,
    threatReason:
      'Healing and revival behave strangely at the precipice of a final death, which quietly takes away the party safety net.',
    terrainEffects: [
      'Healing Artes restore half their usual amount',
      'Waist-high lily fields fully hide prone creatures',
      'Time runs unevenly: initiative order may reverse between rounds',
    ],
    visibility: 'dim',
    favorsRoles: ['healer', 'caster', 'controller'],
    commonHazardIds: ['cursedGround', 'whisperingChorus', 'nullZone', 'stranglevine'],
    nativeCreatureKeywords: ['Undead', 'Celestial', 'Fae', 'Flora', 'Spirit'],
    movementNotes:
      'The lily fields are difficult terrain and shoulder deep on Small creatures; the bare paths do not stay where they were.',
    keywords: ['elysian fields', 'afterlife', 'spider-lily', 'final death', 'liminal'],
    source: SRC,
  },
  {
    id: 'avaranthStage',
    name: 'Avaranth, the Great Refrain',
    description:
      'A place outside the borders of the Great Forest, where all that was, is, and was meant to be happen together. The Fool-King has already cast you; the Voice of Avaranth will explain your part.',
    threatModifier: 3,
    threatReason:
      'Causality does not favour visitors: outcomes can be settled before the roll, and minds that do not belong here come apart.',
    terrainEffects: [
      'Actions may resolve out of order at the Storyteller call',
      'A Mind save each round or be assigned a role in the Refrain',
      'The set changes between scenes without warning',
    ],
    visibility: 'variable',
    favorsRoles: ['controller', 'caster', 'coordinator'],
    commonHazardIds: ['mirrorGallery', 'whisperingChorus', 'bindingRunes', 'aetherSurge'],
    nativeCreatureKeywords: ['Fae', 'Aberration', 'Abomination', 'Celestial', 'Outergod'],
    movementNotes:
      'Movement works normally until it does not; once per round a creature simply finds itself where the Refrain needed it.',
    keywords: ['avaranth', 'fool-king', 'refrain', 'causality', 'madness'],
    source: SRC,
  },

  // -------------------------------------------------------------------------
  // Named White-Trees
  // -------------------------------------------------------------------------
  {
    id: 'redWastesFlats',
    name: 'The Red Wastes',
    description:
      'A White-Tree scoured down to red hardpan and standing iron, where the horizon is a flat line in every direction and the dust gets into wounds. What lives out here travels light and strikes once.',
    threatModifier: 1,
    threatReason:
      'No cover and no water: the environment sets a clock, and the raiders out here already know how long the party has.',
    terrainEffects: [
      'No natural cover for miles in any direction',
      'Red dust storms drop visibility to 20 feet without warning',
      'Water discipline matters: long fights add Fatigued',
    ],
    visibility: 'variable',
    favorsRoles: ['scout', 'blaster', 'coordinator'],
    commonHazardIds: ['quicksand', 'chokingDamp', 'rockslide'],
    nativeCreatureKeywords: ['Humanoid', 'Beast', 'Elemental', 'Monstrosity', 'Mercenary'],
    movementNotes:
      'Hardpan runs at full speed in every direction, so disengaging is possible and pursuit is guaranteed.',
    keywords: ['red wastes', 'white-tree', 'wasteland', 'raiders', 'exposure'],
    source: SRC,
  },
  {
    id: 'vigiloWatchStreets',
    name: 'Vigilo, the Watch Streets',
    description:
      'A White-Tree that never stood down from its vigil. Its cities run on shift bells and lamp lines, and the civic watch treats an unexplained fight as an alarm condition.',
    threatModifier: 1,
    threatReason:
      'Every round of noise brings the watch closer, so the encounter carries a timer the party did not set and cannot stop.',
    terrainEffects: [
      'Lamp lines leave very few genuinely dark squares',
      'Watch patrols arrive within four rounds of any alarm',
      'Narrow lanes and shutter alcoves give half cover',
    ],
    visibility: 'dim',
    favorsRoles: ['coordinator', 'scout', 'controller'],
    commonHazardIds: ['alarmGlyph', 'netSnare', 'boltTurret', 'nullZone'],
    nativeCreatureKeywords: ['Humanoid', 'Constructed', 'Soldier', 'Commoner'],
    movementNotes:
      'Cobbled lanes at full speed; the roof lines and gutter runs are the only routes the watch does not already cover.',
    keywords: ['vigilo', 'white-tree', 'urban', 'watch', 'timer'],
    source: SRC,
  },
  {
    id: 'pantheonSkySpire',
    name: 'The Pantheon, Sky Spire',
    description:
      'A White-Tree where the gods keep their seats a layer above the mortal world, and the spires between are raised from condensed dragonscale. Mortals visit here on sufferance.',
    threatModifier: 3,
    threatReason:
      'The residents are divine or close to it, and the architecture assumes a flight speed the party very probably lacks.',
    terrainEffects: [
      'Open drops between every spire platform',
      'Ambient Aether is dense enough to feed hostile Artes',
      'Divine precedence: Soul saves against the local powers are at disadvantage',
    ],
    visibility: 'clear',
    favorsRoles: ['caster', 'blaster', 'healer'],
    commonHazardIds: ['aetherSurge', 'gravityWell', 'wardingSigil', 'bindingRunes'],
    nativeCreatureKeywords: ['Celestial', 'Dragon', 'Avatar', 'God (Lesser)'],
    movementNotes:
      'Platforms are open at full speed; crossing between them without flight means the bridge, and the bridge is watched.',
    keywords: ['pantheon', 'white-tree', 'divine', 'spire', 'dragonscale'],
    source: SRC,
  },
  {
    id: 'faeiaSunderedSpan',
    name: 'Faeia, Sundered Span',
    description:
      'A ferry lane between the Bowl, Ring, and Cap of Faeia, the three free-floating supermasses skewered and held by the Orrery of the Firmament. The Yggdrasyllian Empire runs the lanes; other people run everything between them.',
    threatModifier: 2,
    threatReason:
      'Boarding actions across moving hulls, with an unsurvivable fall underneath and no chance of reinforcement from anywhere.',
    terrainEffects: [
      'Hull decks drift relative to one another each round',
      'A fall off the lane is unrecoverable',
      'Aetherium plant on the ferries reacts badly to loose Artes',
    ],
    visibility: 'clear',
    favorsRoles: ['scout', 'bruiser', 'controller'],
    commonHazardIds: ['resonanceFeedback', 'gravityWell', 'emberFall', 'netSnare'],
    nativeCreatureKeywords: ['Humanoid', 'Constructed', 'Mercenary', 'Dragon', 'Beastmen'],
    movementNotes:
      'Full speed along a deck; jumps between drifting hulls run 10 to 20 feet and the gap changes between turns.',
    keywords: ['faeia', 'sundered kingdoms', 'orrery', 'yggdrasyllian', 'boarding'],
    source: SRC,
  },
];

export const environmentById: Record<string, EncounterEnvironmentDef> = Object.fromEntries(
  ENCOUNTER_ENVIRONMENTS.map((e) => [e.id, e]),
);
