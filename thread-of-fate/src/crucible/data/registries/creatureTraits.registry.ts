/**
 * The Crucible - registry of reusable creature Traits (the passive abilities printed under a
 * statblock's "Traits" heading). Voice and mechanical style follow the exemplar statblocks in
 * Design/Convergence TTRPG Rules/Convergence Bestiary.md - notably Toughened Hide (lines 93-96)
 * and the swarm trait suite of the Built of Conflict unit (lines 629-636). Descriptions carry
 * {{placeholders}} the Crucible engine fills in from the finished entity.
 */

import type { CrucibleTraitDefinition } from '@/crucible/schemas/crucibleTrait.schema';

export const CREATURE_TRAITS: CrucibleTraitDefinition[] = [
  // ---------------------------------------------------------------------------
  // Offense
  // ---------------------------------------------------------------------------
  {
    id: 'streetBornBrutality',
    name: 'Street-Born Brutality',
    description:
      '{{name}} has Advantage on Attack Rolls against creatures that are Prone, Grappled, or Restrained.',
    category: 'offense',
    threatCost: 1,
    suitedTo: ['npc', 'monster', 'minion'],
    recommendedRoles: ['bruiser', 'scout'],
    keywords: ['advantage', 'prone', 'grappled', 'restrained', 'brutal', 'thug'],
    source: 'The Crucible',
  },
  {
    id: 'noWitnesses',
    name: 'No Witnesses',
    description:
      '{{name}} gains Advantage on its next Attack Roll before the end of its next turn whenever it reduces a creature to 0 Hit Points.',
    category: 'offense',
    threatCost: 1,
    suitedTo: ['npc', 'monster', 'boss', 'minion'],
    recommendedRoles: ['bruiser', 'minion'],
    keywords: ['snowball', 'kill', 'advantage', 'momentum'],
    source: 'The Crucible',
  },
  {
    id: 'packEnforcer',
    name: 'Pack Enforcer',
    description:
      '{{name}} gains a +2 bonus to Attack Rolls against any target that has at least one creature allied to {{name}} within 5 feet of it.',
    category: 'offense',
    threatCost: 1,
    suitedTo: ['npc', 'monster', 'minion', 'companion'],
    recommendedRoles: ['bruiser', 'minion', 'coordinator'],
    keywords: ['flanking', 'pack', 'allies', 'attack bonus'],
    source: 'The Crucible',
  },
  {
    id: 'openingSalvo',
    name: 'Opening Salvo',
    description:
      '{{name}} has Advantage on Attack Rolls against any creature that has not yet taken a turn in the combat, and the first attack it lands in an encounter deals an extra {{pb}} damage.',
    category: 'offense',
    threatCost: 2,
    modifiers: [
      {
        id: 'openingSalvoInitiative',
        target: 'derived.initiative',
        op: 'add',
        value: 2,
        reason: 'Opening Salvo - {{name}} is already moving when the fight starts.',
      },
    ],
    suitedTo: ['npc', 'monster', 'minion', 'boss'],
    recommendedRoles: ['blaster', 'scout'],
    keywords: ['initiative', 'alpha strike', 'ambush', 'first round'],
    source: 'The Crucible',
  },
  {
    id: 'bloodInTheWater',
    name: 'Blood in the Water',
    description:
      "While a creature is at or below half its Hit Point maximum, {{name}}'s attacks against it score a Critical Hit on a roll of 19 or 20.",
    category: 'offense',
    threatCost: 2,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'companion'],
    recommendedRoles: ['bruiser', 'blaster'],
    keywords: ['critical', 'wounded', 'finisher', 'predator'],
    source: 'The Crucible',
  },
  {
    id: 'chargingMomentum',
    name: 'Charging Momentum',
    description:
      "If {{name}} moves at least 20 feet in a straight line toward a creature and hits it with a melee attack on the same turn, the target takes an extra 2d6 damage of the attack's type and must succeed on a DC {{dc}} Body Saving Throw or be knocked Prone.",
    category: 'offense',
    threatCost: 2,
    modifiers: [
      {
        id: 'chargingMomentumDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 7,
        reason: 'Charging Momentum lands roughly once per round in open ground.',
      },
    ],
    suitedTo: ['monster', 'boss', 'companion', 'vehicle'],
    recommendedRoles: ['bruiser', 'tank'],
    keywords: ['charge', 'prone', 'straight line', 'impact'],
    source: 'The Crucible',
  },
  {
    id: 'sunderer',
    name: 'Sunderer',
    description:
      "Whenever {{name}} makes a melee attack it can target a creature's armor, shield, or weapon instead of the creature. Each hit imposes a cumulative -1 penalty to that item's Armor Class or damage; at -5 a nonmagical item is broken, and a magical item loses its bonuses until repaired. {{name}} provokes no Opportunity Attack from the struck target.",
    category: 'offense',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss'],
    recommendedRoles: ['bruiser', 'controller'],
    keywords: ['sunder', 'break', 'armor', 'weapon', 'attrition'],
    source: 'The Crucible',
  },
  {
    id: 'rendingWounds',
    name: 'Rending Wounds',
    description:
      "A creature hit by {{name}}'s natural weapons that does not have the Construct or Undead tag gains a bleeding wound lasting until it regains at least 1 Hit Point. A bleeding creature loses 1d6 Hit Points at the start of each of its turns for each wound, and any creature that can reach it may spend an Action to staunch every wound.",
    category: 'offense',
    threatCost: 2,
    modifiers: [
      {
        id: 'rendingWoundsDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 3,
        reason: 'Bleeding ticks add sustained damage across the encounter.',
      },
    ],
    suitedTo: ['monster', 'boss', 'companion'],
    recommendedRoles: ['bruiser', 'scout'],
    keywords: ['bleed', 'wound', 'damage over time', 'claws'],
    source: 'The Crucible',
  },
  {
    id: 'executionersFocus',
    name: "Executioner's Focus",
    description:
      "Once on each of its turns, when {{name}} hits a creature that is Frightened, Grappled, Restrained, or Stunned, the target takes an extra 3d6 damage of the attack's type.",
    category: 'offense',
    threatCost: 2,
    uses: { count: 1, per: 'turn' },
    modifiers: [
      {
        id: 'executionersFocusDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 10,
        reason: 'Assumes a controller ally keeps at least one target impaired.',
      },
    ],
    suitedTo: ['npc', 'monster', 'boss'],
    recommendedRoles: ['bruiser', 'blaster', 'coordinator'],
    keywords: ['execute', 'condition', 'burst', 'focus fire'],
    source: 'The Crucible',
  },
  {
    id: 'overwhelmingReach',
    name: 'Overwhelming Reach',
    description:
      "{{name}}'s melee reach increases by 5 feet, and a creature that leaves that reach provokes an Opportunity Attack from {{name}} even if it takes the Disengage action.",
    category: 'offense',
    threatCost: 2,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'hazard'],
    recommendedRoles: ['tank', 'controller'],
    keywords: ['reach', 'opportunity attack', 'zone', 'sticky'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Defense
  // ---------------------------------------------------------------------------
  {
    id: 'toughenedHide',
    name: 'Toughened Hide',
    description:
      '{{name}} is built hardier than its kin. In place of Natural Armor, its Armor Class equals 10 + its Instinct Modifier + its Conviction Modifier.',
    category: 'defense',
    threatCost: 1,
    modifiers: [
      {
        id: 'toughenedHideAc',
        target: 'defenses.miscAcBonus',
        op: 'add',
        value: 2,
        reason: 'Toughened Hide folds the Conviction Modifier into Natural Armor.',
      },
    ],
    suitedTo: ['monster', 'boss', 'companion', 'summon'],
    recommendedRoles: ['tank', 'bruiser'],
    keywords: ['natural armor', 'hide', 'armor class', 'instinct', 'conviction'],
    source: 'The Crucible',
  },
  {
    id: 'grittedResolve',
    name: 'Gritted Resolve',
    description:
      '{{name}} may choose to succeed on a Saving Throw it has failed. Once this trait is used it cannot be used again until {{name}} finishes a Quick or Full Rest.',
    category: 'defense',
    threatCost: 2,
    uses: { count: 1, per: 'quickRest' },
    suitedTo: ['npc', 'monster', 'boss', 'companion'],
    recommendedRoles: ['tank', 'bruiser', 'coordinator'],
    keywords: ['saving throw', 'reroll', 'resolve', 'grit'],
    source: 'The Crucible',
  },
  {
    id: 'deadenedNerves',
    name: 'Deadened Nerves',
    description: '{{name}} takes no damage from any single instance of 5 damage or less.',
    category: 'defense',
    threatCost: 2,
    suitedTo: ['monster', 'minion', 'swarm', 'hazard'],
    recommendedRoles: ['tank', 'minion'],
    keywords: ['damage threshold', 'chip damage', 'numb', 'flat reduction'],
    source: 'The Crucible',
  },
  {
    id: 'notToday',
    name: 'Not Today',
    description:
      '{{name}} drops to 1 Hit Point instead of 0 the first time it would be reduced to 0 Hit Points, and may immediately move up to its Speed without provoking Opportunity Attacks.',
    category: 'defense',
    threatCost: 3,
    uses: { count: 1, per: 'fullRest' },
    suitedTo: ['npc', 'boss', 'mythicBoss'],
    recommendedRoles: ['tank', 'controller'],
    keywords: ['survive', 'escape', 'last stand', 'once per rest'],
    source: 'The Crucible',
  },
  {
    id: 'dirtySurvivor',
    name: 'Dirty Survivor',
    description:
      'The first time {{name}} is reduced to half its Hit Point maximum or fewer, it gains Advantage on all Attack Rolls until the end of its next turn.',
    category: 'defense',
    threatCost: 1,
    suitedTo: ['npc', 'monster', 'boss'],
    recommendedRoles: ['bruiser', 'tank'],
    keywords: ['bloodied', 'desperate', 'advantage', 'threshold'],
    source: 'The Crucible',
  },
  {
    id: 'stubbornFooting',
    name: 'Stubborn Footing',
    description:
      '{{name}} cannot be knocked Prone or moved against its will unless it chooses to be, and it has Advantage on Body Saving Throws made to resist being Grappled or Restrained.',
    category: 'defense',
    threatCost: 2,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'vehicle'],
    recommendedRoles: ['tank', 'bruiser'],
    keywords: ['prone immunity', 'forced movement', 'anchor', 'stance'],
    source: 'The Crucible',
  },
  {
    id: 'hardenedPlating',
    name: 'Hardened Plating',
    description:
      'Layered plates cover {{name}}, granting it a +2 bonus to Armor Class. It loses this bonus while it is Prone or Incapacitated.',
    category: 'defense',
    threatCost: 2,
    modifiers: [
      {
        id: 'hardenedPlatingAc',
        target: 'defenses.miscAcBonus',
        op: 'add',
        value: 2,
        reason: 'Hardened Plating adds flat Armor Class.',
      },
    ],
    suitedTo: ['monster', 'boss', 'vehicle', 'encounterObject'],
    recommendedRoles: ['tank'],
    keywords: ['armor class', 'plating', 'plates', 'defense'],
    source: 'The Crucible',
  },
  {
    id: 'closeRanks',
    name: 'Close Ranks',
    description:
      '{{name}} and every conscious ally within 5 feet of it gain a +1 bonus to Armor Class and to Body Saving Throws while they remain within 5 feet of one another.',
    category: 'defense',
    threatCost: 1,
    modifiers: [
      {
        id: 'closeRanksAc',
        target: 'defenses.miscAcBonus',
        op: 'add',
        value: 1,
        reason: 'Close Ranks assumes at least one ally is holding the line.',
      },
    ],
    suitedTo: ['npc', 'monster', 'minion', 'swarm'],
    recommendedRoles: ['tank', 'coordinator', 'minion'],
    keywords: ['formation', 'allies', 'shield wall', 'armor class'],
    source: 'The Crucible',
  },
  {
    id: 'shieldingBulwark',
    name: 'Shielding Bulwark',
    description:
      'Allies within 5 feet of {{name}} have Half Cover against Ranged Attacks. Once each round {{name}} can spend its Reaction to impose Disadvantage on an Attack Roll made against one of those allies.',
    category: 'defense',
    threatCost: 2,
    uses: { count: 1, per: 'round' },
    suitedTo: ['npc', 'monster', 'boss', 'companion'],
    recommendedRoles: ['tank', 'coordinator'],
    keywords: ['cover', 'protect', 'reaction', 'guardian'],
    source: 'The Crucible',
  },
  {
    id: 'wardedCarapace',
    name: 'Warded Carapace',
    description:
      '{{name}} has Resistance to Bludgeoning, Piercing, and Slashing damage from nonmagical attacks.',
    category: 'defense',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'summon'],
    recommendedRoles: ['tank'],
    keywords: ['resistance', 'nonmagical', 'physical', 'carapace'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Mobility
  // ---------------------------------------------------------------------------
  {
    id: 'flyby',
    name: 'Flyby',
    description:
      "{{name}} does not provoke Opportunity Attacks when it flies out of an enemy's reach.",
    category: 'mobility',
    threatCost: 1,
    suitedTo: ['monster', 'boss', 'companion', 'summon'],
    recommendedRoles: ['scout', 'blaster'],
    keywords: ['fly', 'hit and run', 'opportunity attack', 'aerial'],
    source: 'The Crucible',
  },
  {
    id: 'unfetteredMovement',
    name: 'Unfettered Movement',
    description:
      '{{name}} ignores Difficult Terrain, and magical effects can neither reduce its Speed nor cause it to be Restrained. It can spend 5 feet of movement to escape a nonmagical restraint or a Grapple.',
    category: 'mobility',
    threatCost: 2,
    suitedTo: ['monster', 'boss', 'vehicle', 'companion'],
    recommendedRoles: ['scout', 'bruiser'],
    keywords: ['difficult terrain', 'freedom', 'escape', 'unstoppable movement'],
    source: 'The Crucible',
  },
  {
    id: 'nimbleEscape',
    name: 'Nimble Escape',
    description:
      'Once on each of its turns, {{name}} can take the Disengage or Hide action without spending an Action Point.',
    category: 'mobility',
    threatCost: 2,
    uses: { count: 1, per: 'turn' },
    suitedTo: ['npc', 'monster', 'minion', 'companion'],
    recommendedRoles: ['scout', 'minion'],
    keywords: ['disengage', 'hide', 'action point', 'skirmish'],
    source: 'The Crucible',
  },
  {
    id: 'wallStrider',
    name: 'Wall Strider',
    description:
      '{{name}} can climb difficult surfaces, including along ceilings, without making a check, and it has a climbing speed equal to its walking speed.',
    category: 'mobility',
    threatCost: 1,
    modifiers: [
      {
        id: 'wallStriderClimb',
        target: 'movement.climb',
        op: 'add',
        value: 30,
        reason: 'Wall Strider grants a climbing speed matching a typical walking speed.',
      },
    ],
    suitedTo: ['monster', 'minion', 'swarm', 'companion'],
    recommendedRoles: ['scout'],
    keywords: ['climb', 'ceiling', 'spider', 'vertical'],
    source: 'The Crucible',
  },
  {
    id: 'amphibiousHunter',
    name: 'Amphibious Hunter',
    description:
      '{{name}} breathes both air and water, has a swimming speed of 40 feet, and has Advantage on Attack Rolls against creatures that are in or under water.',
    category: 'mobility',
    threatCost: 1,
    modifiers: [
      {
        id: 'amphibiousHunterSwim',
        target: 'movement.swim',
        op: 'add',
        value: 40,
        reason: 'Amphibious Hunter grants a swimming speed.',
      },
    ],
    suitedTo: ['monster', 'companion', 'summon'],
    recommendedRoles: ['scout', 'bruiser'],
    keywords: ['swim', 'water', 'aquatic', 'amphibious'],
    source: 'The Crucible',
  },
  {
    id: 'trampler',
    name: 'Trampler',
    description:
      '{{name}} can move through the space of any creature two or more sizes smaller than it. A creature whose space it passes through is pushed 5 feet to one side and must succeed on a DC {{dc}} Body Saving Throw or take 2d8 Bludgeoning damage and be knocked Prone.',
    category: 'mobility',
    threatCost: 2,
    modifiers: [
      {
        id: 'tramplerDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 5,
        reason: 'Trampling catches roughly one creature per round in a crowded fight.',
      },
    ],
    suitedTo: ['monster', 'boss', 'mythicBoss', 'vehicle'],
    recommendedRoles: ['bruiser', 'tank'],
    keywords: ['trample', 'overrun', 'push', 'prone', 'large'],
    source: 'The Crucible',
  },
  {
    id: 'stormBorneFlight',
    name: 'Storm-Borne Flight',
    description:
      'While outdoors in windy or stormy conditions, {{name}} increases its flying speed by 30 feet and cannot be knocked Prone or moved against its will unless it chooses to be.',
    category: 'mobility',
    threatCost: 2,
    modifiers: [
      {
        id: 'stormBorneFlightFly',
        target: 'movement.fly',
        op: 'add',
        value: 30,
        reason: 'Storm-Borne Flight assumes the creature fights in its own weather.',
      },
    ],
    suitedTo: ['monster', 'boss', 'mythicBoss'],
    recommendedRoles: ['scout', 'blaster'],
    keywords: ['fly', 'storm', 'wind', 'weather', 'aerial'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------
  {
    id: 'keenSenses',
    name: 'Keen Senses',
    description:
      '{{name}} has Advantage on Perception Checks that rely on sight, hearing, or smell, and it cannot be surprised while it is conscious.',
    category: 'utility',
    threatCost: 1,
    suitedTo: ['npc', 'monster', 'companion', 'minion'],
    recommendedRoles: ['scout'],
    keywords: ['perception', 'senses', 'surprise', 'awareness'],
    source: 'The Crucible',
  },
  {
    id: 'ambushPredator',
    name: 'Ambush Predator',
    description:
      '{{name}} has Advantage on Stealth Checks made within its native terrain, and on the first round of combat it deals an extra 2d6 damage to any creature it hits that has not yet taken a turn.',
    category: 'utility',
    threatCost: 2,
    modifiers: [
      {
        id: 'ambushPredatorInitiative',
        target: 'derived.initiative',
        op: 'add',
        value: 2,
        reason: 'Ambush Predator chooses the moment the fight begins.',
      },
    ],
    suitedTo: ['monster', 'minion', 'hazard', 'companion'],
    recommendedRoles: ['scout', 'bruiser'],
    keywords: ['stealth', 'ambush', 'surprise', 'terrain'],
    source: 'The Crucible',
  },
  {
    id: 'falseAppearance',
    name: 'False Appearance',
    description:
      'While {{name}} remains motionless it is indistinguishable from an ordinary feature of its surroundings. A creature must succeed on a DC {{dc}} Intuition Check to discern that {{name}} is a creature at all.',
    category: 'utility',
    threatCost: 1,
    suitedTo: ['monster', 'hazard', 'trap', 'encounterObject'],
    recommendedRoles: ['controller', 'scout'],
    keywords: ['disguise', 'mimic', 'motionless', 'hidden', 'trap'],
    source: 'The Crucible',
  },
  {
    id: 'tirelessFrame',
    name: 'Tireless Frame',
    description:
      '{{name}} requires no food, drink, or sleep, and it automatically succeeds on Saving Throws against Exhaustion caused by travel or exertion.',
    category: 'utility',
    threatCost: 0,
    suitedTo: ['npc', 'monster', 'summon', 'companion', 'vehicle'],
    recommendedRoles: ['tank', 'scout'],
    keywords: ['tireless', 'exhaustion', 'travel', 'flavour'],
    source: 'The Crucible',
  },
  {
    id: 'scentOfBlood',
    name: 'Scent of Blood',
    description:
      '{{name}} pinpoints by scent the location of any wounded creature within 60 feet, and it tracks a creature that has lost Hit Points within the last hour with Advantage on Perception Checks.',
    category: 'utility',
    threatCost: 1,
    suitedTo: ['monster', 'companion', 'minion'],
    recommendedRoles: ['scout'],
    keywords: ['scent', 'track', 'wounded', 'hunter'],
    source: 'The Crucible',
  },
  {
    id: 'saboteursHands',
    name: "Saboteur's Hands",
    description:
      '{{name}} has Advantage on checks made to disable, jam, or rig traps, locks, and machinery, and it can rig any nonmagical mechanism to fail the next time it is used.',
    category: 'utility',
    threatCost: 1,
    suitedTo: ['npc', 'minion', 'monster'],
    recommendedRoles: ['scout', 'controller'],
    keywords: ['sabotage', 'traps', 'locks', 'machinery', 'tinker'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Social
  // ---------------------------------------------------------------------------
  {
    id: 'reputationPrecedesThem',
    name: 'Reputation Precedes Them',
    description:
      'At the start of combat, each hostile creature that can see {{name}} must succeed on a DC {{dc}} Mind Saving Throw or have Disadvantage on its first Attack Roll of the encounter.',
    category: 'social',
    threatCost: 2,
    suitedTo: ['npc', 'monster', 'boss', 'mythicBoss'],
    recommendedRoles: ['controller', 'coordinator'],
    keywords: ['reputation', 'fear', 'opening', 'disadvantage', 'notoriety'],
    source: 'The Crucible',
  },
  {
    id: 'crimelordPresence',
    name: 'Crimelord Presence',
    description:
      'While {{name}} is conscious, allied creatures of its choice within 30 feet gain a +2 bonus to Attack Rolls and to Saving Throws made against being Frightened.',
    category: 'social',
    threatCost: 3,
    suitedTo: ['npc', 'boss', 'mythicBoss'],
    recommendedRoles: ['coordinator'],
    keywords: ['aura', 'allies', 'command', 'frightened', 'leader'],
    source: 'The Crucible',
  },
  {
    id: 'silverTongue',
    name: 'Silver Tongue',
    description:
      '{{name}} has Advantage on Deception and Persuasion Checks made against any creature that does not already know it to be hostile.',
    category: 'social',
    threatCost: 1,
    suitedTo: ['npc', 'boss', 'companion'],
    recommendedRoles: ['coordinator', 'controller'],
    keywords: ['deception', 'persuasion', 'charm', 'presence', 'negotiate'],
    source: 'The Crucible',
  },
  {
    id: 'rallyingVoice',
    name: 'Rallying Voice',
    description:
      'Allied creatures within 30 feet that can hear {{name}} have Advantage on Saving Throws against being Charmed or Frightened, and an ally that starts its turn Frightened may immediately repeat the Saving Throw against that effect.',
    category: 'social',
    threatCost: 2,
    suitedTo: ['npc', 'monster', 'boss', 'companion'],
    recommendedRoles: ['coordinator', 'healer'],
    keywords: ['rally', 'morale', 'allies', 'charmed', 'frightened'],
    source: 'The Crucible',
  },
  {
    id: 'inscrutableMask',
    name: 'Inscrutable Mask',
    description:
      "Checks made to read {{name}}'s intentions, catch it in a lie, or magically discern its thoughts are made with Disadvantage, and {{name}} has Advantage on Saving Throws against Artes that would compel it to answer truthfully.",
    category: 'social',
    threatCost: 1,
    suitedTo: ['npc', 'boss', 'mythicBoss'],
    recommendedRoles: ['controller', 'caster'],
    keywords: ['insight', 'lie', 'thoughts', 'mind reading', 'mask'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Swarm
  // ---------------------------------------------------------------------------
  {
    id: 'swarmBody',
    name: 'Swarm',
    description:
      "{{name}} can occupy another creature's space and vice versa, and {{name}} can move through any opening large enough for a Medium humanoid. {{name}} cannot regain Hit Points or gain Temporary Hit Points.",
    category: 'swarm',
    threatCost: 1,
    suitedTo: ['swarm', 'minion'],
    recommendedRoles: ['minion', 'bruiser'],
    keywords: ['swarm', 'space', 'squeeze', 'no healing'],
    source: 'The Crucible',
  },
  {
    id: 'swarmTactics',
    name: 'Swarm Tactics',
    description: '{{name}} has Advantage on Attack Rolls against any creature within its space.',
    category: 'swarm',
    threatCost: 2,
    suitedTo: ['swarm', 'minion'],
    recommendedRoles: ['minion', 'bruiser'],
    keywords: ['swarm', 'advantage', 'engulf', 'space'],
    source: 'The Crucible',
  },
  {
    id: 'swarmStride',
    name: 'Swarm Stride',
    description:
      "{{name}} moves through another creature's space without any penalty to its movement. Creatures other than {{name}} must treat {{name}}'s space as Difficult Terrain.",
    category: 'swarm',
    threatCost: 1,
    suitedTo: ['swarm', 'minion'],
    recommendedRoles: ['minion', 'controller'],
    keywords: ['swarm', 'difficult terrain', 'movement', 'flow'],
    source: 'The Crucible',
  },
  {
    id: 'reactiveSwarm',
    name: 'Reactive',
    description: '{{name}} can use a Reaction once every turn instead of once every round.',
    category: 'swarm',
    threatCost: 3,
    suitedTo: ['swarm', 'boss', 'mythicBoss'],
    recommendedRoles: ['minion', 'controller'],
    keywords: ['reaction', 'action economy', 'swarm', 'many bodies'],
    source: 'The Crucible',
  },
  {
    id: 'strengthInNumbers',
    name: 'Strength in Numbers',
    description:
      '{{name}} has Advantage on Body Saving Throws and on Might Checks. It loses this Advantage while it is at or below half its Hit Point maximum.',
    category: 'swarm',
    threatCost: 2,
    suitedTo: ['swarm', 'minion'],
    recommendedRoles: ['minion', 'tank'],
    keywords: ['swarm', 'body save', 'might', 'numbers'],
    source: 'The Crucible',
  },
  {
    id: 'wallOfBlades',
    name: 'Wall of Blades',
    description:
      "A creature that first enters {{name}}'s space on a turn, or starts its turn there, takes 1d8 Bludgeoning, 1d8 Piercing, and 1d8 Slashing damage.",
    category: 'swarm',
    threatCost: 3,
    modifiers: [
      {
        id: 'wallOfBladesDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 13,
        reason: 'Wall of Blades punishes anyone sharing the swarm space each round.',
      },
    ],
    suitedTo: ['swarm'],
    recommendedRoles: ['minion', 'bruiser'],
    keywords: ['swarm', 'aura damage', 'blades', 'space', 'punish'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Boss
  // ---------------------------------------------------------------------------
  {
    id: 'legendaryResistance',
    name: 'Legendary Resistance',
    description:
      '{{name}} may choose to succeed on a Saving Throw it has failed. It can do this three times, regaining all expended uses when it finishes a Full Rest.',
    category: 'boss',
    threatCost: 5,
    uses: { count: 3, per: 'fullRest' },
    suitedTo: ['boss', 'mythicBoss'],
    recommendedRoles: ['tank', 'caster', 'controller'],
    keywords: ['legendary', 'saving throw', 'resistance', 'boss'],
    source: 'The Crucible',
  },
  {
    id: 'phaseAggression',
    name: 'Phase Aggression',
    description:
      '{{name}} sheds one condition affecting it, regains one spent Apex Action, and adds {{pb}} damage to each of its attacks for the rest of the encounter each time it enters a new phase.',
    category: 'boss',
    threatCost: 4,
    modifiers: [
      {
        id: 'phaseAggressionDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 8,
        reason: 'Later phases raise sustained output for the back half of the fight.',
      },
    ],
    suitedTo: ['boss', 'mythicBoss'],
    recommendedRoles: ['bruiser', 'blaster', 'controller'],
    keywords: ['phase', 'escalation', 'apex actions', 'boss', 'threshold'],
    source: 'The Crucible',
  },
  {
    id: 'auraOfDread',
    name: 'Aura of Dread',
    description:
      'Each hostile creature that starts its turn within 30 feet of {{name}} must succeed on a DC {{dc}} Mind Saving Throw or be Frightened of {{name}} until the start of its next turn. A creature that succeeds is immune to this trait for the next 24 hours.',
    category: 'boss',
    threatCost: 4,
    suitedTo: ['boss', 'mythicBoss', 'monster'],
    recommendedRoles: ['controller', 'tank'],
    keywords: ['aura', 'frightened', 'dread', 'mind save', 'presence'],
    source: 'The Crucible',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description:
      '{{name}} ends one of the following conditions affecting it at the start of each of its turns: Charmed, Frightened, Grappled, Paralyzed, Prone, Restrained, or Stunned. It can also spend 5 feet of movement to escape any nonmagical restraint.',
    category: 'boss',
    threatCost: 4,
    suitedTo: ['boss', 'mythicBoss'],
    recommendedRoles: ['bruiser', 'tank'],
    keywords: ['condition removal', 'unstoppable', 'boss', 'freedom'],
    source: 'The Crucible',
  },
  {
    id: 'apexVigor',
    name: 'Apex Vigor',
    description:
      "{{name}} regains one additional spent Apex Action at the start of its turn, and it may take one Apex Action at the end of its own turn as well as at the end of another creature's turn.",
    category: 'boss',
    threatCost: 4,
    suitedTo: ['boss', 'mythicBoss'],
    recommendedRoles: ['bruiser', 'blaster', 'controller'],
    keywords: ['apex actions', 'legendary actions', 'action economy', 'boss'],
    source: 'The Crucible',
  },
  {
    id: 'overtureAwakening',
    name: 'Overture Awakening',
    description:
      '{{name}} drops to 1 Hit Point instead of 0 the first time it would be reduced to 0 Hit Points, regains all spent Apex Actions, and gains access to its Overture Actions for the rest of the encounter.',
    category: 'boss',
    threatCost: 5,
    uses: { count: 1, per: 'encounter' },
    suitedTo: ['mythicBoss'],
    recommendedRoles: ['bruiser', 'caster', 'controller'],
    keywords: ['mythic', 'overture actions', 'second phase', 'boss', 'awakening'],
    source: 'The Crucible',
  },
  {
    id: 'crucibleOfWill',
    name: 'Crucible of Will',
    description:
      "Hostile creatures within 60 feet of {{name}} make Saving Throws against {{name}}'s Artes and traits with Disadvantage while {{name}} is at or above half its Hit Point maximum.",
    category: 'boss',
    threatCost: 3,
    modifiers: [
      {
        id: 'crucibleOfWillDc',
        target: 'derived.effectSaveDc',
        op: 'add',
        value: 1,
        reason: 'Crucible of Will effectively raises the bar on every save it forces.',
      },
    ],
    suitedTo: ['boss', 'mythicBoss'],
    recommendedRoles: ['caster', 'controller'],
    keywords: ['save dc', 'aura', 'will', 'disadvantage', 'boss'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Undead
  // ---------------------------------------------------------------------------
  {
    id: 'undeadFortitude',
    name: 'Undead Fortitude',
    description:
      'When damage reduces {{name}} to 0 Hit Points it makes a Soul Saving Throw with a DC equal to 5 + the damage taken, unless that damage is Radiant or comes from a Critical Hit. On a success {{name}} drops to 1 Hit Point instead, and each success raises the DC of subsequent saves by 3 until it fails one.',
    category: 'undead',
    threatCost: 3,
    suitedTo: ['monster', 'minion', 'boss'],
    recommendedRoles: ['tank', 'minion'],
    keywords: ['undead', 'fortitude', 'soul save', 'radiant', 'rise again'],
    source: 'The Crucible',
  },
  {
    id: 'incorporealMovement',
    name: 'Incorporeal Movement',
    description:
      '{{name}} moves through other creatures and objects as if they were Difficult Terrain. It takes 1d10 Force damage and is shunted to the nearest unoccupied space if it ends its turn inside an object.',
    category: 'undead',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'summon'],
    recommendedRoles: ['scout', 'controller'],
    keywords: ['incorporeal', 'phase', 'spirit', 'ghost', 'walls'],
    source: 'The Crucible',
  },
  {
    id: 'sunlightSensitivity',
    name: 'Sunlight Sensitivity',
    description:
      '{{name}} has Disadvantage on Attack Rolls and on Perception Checks that rely on sight while it is in sunlight.',
    category: 'undead',
    threatCost: 0,
    suitedTo: ['monster', 'minion', 'npc', 'boss'],
    recommendedRoles: ['minion', 'scout'],
    keywords: ['sunlight', 'weakness', 'drawback', 'undead', 'daylight'],
    source: 'The Crucible',
  },
  {
    id: 'lifeSiphon',
    name: 'Life Siphon',
    description:
      '{{name}} regains Hit Points equal to half the Necrotic damage it deals to any creature that does not have the Construct or Undead tag.',
    category: 'undead',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss'],
    recommendedRoles: ['bruiser', 'caster'],
    keywords: ['necrotic', 'drain', 'lifesteal', 'undead', 'sustain'],
    source: 'The Crucible',
  },
  {
    id: 'gravechillAura',
    name: 'Gravechill Aura',
    description:
      'The air within 15 feet of {{name}} is deathly cold. A creature that starts its turn in that area must succeed on a DC {{dc}} Body Saving Throw or take 1d6 Necrotic damage and be unable to regain Hit Points until the start of its next turn.',
    category: 'undead',
    threatCost: 3,
    modifiers: [
      {
        id: 'gravechillAuraDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 4,
        reason: 'The aura ticks on anyone who stays in melee with the creature.',
      },
    ],
    suitedTo: ['monster', 'boss', 'mythicBoss', 'hazard'],
    recommendedRoles: ['controller', 'tank'],
    keywords: ['aura', 'necrotic', 'anti-healing', 'cold', 'undead'],
    source: 'The Crucible',
  },
  {
    id: 'hiddenCorpse',
    name: 'Hidden Corpse',
    description:
      '{{name}} returns to its buried corpse when destroyed and rises again 1d4 days later at its full Hit Point maximum within 5 feet of that corpse. Destroying or sanctifying the corpse with an Arte of Tier 3 or higher ends this trait for good.',
    category: 'undead',
    threatCost: 2,
    suitedTo: ['npc', 'monster', 'boss', 'mythicBoss'],
    recommendedRoles: ['controller', 'caster'],
    keywords: ['resurrection', 'corpse', 'recurring villain', 'undead', 'sanctify'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Construct
  // ---------------------------------------------------------------------------
  {
    id: 'constructedResilience',
    name: 'Constructed Resilience',
    description:
      '{{name}} is immune to the Charmed, Exhausted, Frightened, Paralyzed, Petrified, and Poisoned conditions, and it does not need to breathe.',
    category: 'construct',
    threatCost: 3,
    suitedTo: ['monster', 'minion', 'boss', 'summon', 'vehicle'],
    recommendedRoles: ['tank', 'minion'],
    keywords: ['construct', 'condition immunity', 'resilience', 'machine'],
    source: 'The Crucible',
  },
  {
    id: 'aethericWeapon',
    name: 'Aetheric Weapon',
    description:
      "{{name}}'s weapon attacks count as magical for the purpose of overcoming Resistance and Immunity, and they deal double damage to objects and structures.",
    category: 'construct',
    threatCost: 2,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'vehicle'],
    recommendedRoles: ['bruiser', 'tank'],
    keywords: ['magical attacks', 'aether', 'objects', 'construct', 'golem'],
    source: 'The Crucible',
  },
  {
    id: 'elementalEngine',
    name: 'Elemental Engine',
    description:
      '{{name}} runs on a bound elemental core. It requires no food, drink, or air, and it is immune to any effect that would put it to Sleep.',
    category: 'construct',
    threatCost: 1,
    suitedTo: ['monster', 'summon', 'vehicle', 'encounterObject'],
    recommendedRoles: ['tank', 'minion'],
    keywords: ['engine', 'core', 'sleep immunity', 'construct', 'elemental'],
    source: 'The Crucible',
  },
  {
    id: 'selfRepairProtocol',
    name: 'Self-Repair Protocol',
    description:
      '{{name}} regains Hit Points equal to {{tr}} at the start of each of its turns while it has at least 1 Hit Point. This protocol is offline until the end of its next turn if {{name}} has taken Lightning or Force damage since the end of its last turn.',
    category: 'construct',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'vehicle'],
    recommendedRoles: ['tank'],
    keywords: ['regeneration', 'repair', 'construct', 'lightning', 'force'],
    source: 'The Crucible',
  },
  {
    id: 'overclockedCore',
    name: 'Overclocked Core',
    description:
      '{{name}} can push its core past tolerance. For 1 minute its walking speed increases by 20 feet and its attacks deal an extra 1d8 Fire damage, after which it gains one level of Exhaustion.',
    category: 'construct',
    threatCost: 2,
    uses: { count: 1, per: 'encounter' },
    suitedTo: ['monster', 'boss', 'vehicle'],
    recommendedRoles: ['bruiser', 'blaster'],
    keywords: ['overclock', 'burst', 'fire', 'exhaustion', 'construct'],
    source: 'The Crucible',
  },
  {
    id: 'faultyGovernor',
    name: 'Faulty Governor',
    description:
      '{{name}} must succeed on a DC {{dc}} Body Saving Throw whenever it takes Lightning or Force damage or its systems stutter, leaving it with 1 fewer Action Point on its next turn.',
    category: 'construct',
    threatCost: 0,
    suitedTo: ['monster', 'minion', 'vehicle', 'encounterObject'],
    recommendedRoles: ['minion', 'tank'],
    keywords: ['drawback', 'lightning', 'force', 'action points', 'malfunction'],
    source: 'The Crucible',
  },

  // ---------------------------------------------------------------------------
  // Magic
  // ---------------------------------------------------------------------------
  {
    id: 'aethericResistance',
    name: 'Aetheric Resistance',
    description:
      '{{name}} has Advantage on Saving Throws made against Artes and other magical effects, and Artes Attack Rolls made against {{name}} are made with Disadvantage.',
    category: 'magic',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'summon'],
    recommendedRoles: ['tank', 'caster'],
    keywords: ['artes', 'aether', 'magic resistance', 'advantage', 'antimagic'],
    source: 'The Crucible',
  },
  {
    id: 'artescasting',
    name: 'Artescasting',
    description:
      '{{name}} is a caster with Aether equal to twice its Threat Rating {{tr}}. Its Artescasting attribute is chosen when the statblock is built, giving it an Artes Save DC of {{dc}} and a bonus of {{pb}} plus that modifier to hit with Artes Attack Rolls. Its prepared Artes are listed beneath this trait.',
    category: 'magic',
    threatCost: 2,
    suitedTo: ['npc', 'monster', 'boss', 'mythicBoss', 'summon'],
    recommendedRoles: ['caster', 'blaster', 'healer', 'controller'],
    keywords: ['artes', 'aether', 'spellcasting', 'prepared', 'caster'],
    source: 'The Crucible',
  },
  {
    id: 'aetherSiphon',
    name: 'Aether Siphon',
    description:
      '{{name}} drains raw magic from those it strikes. A creature hit by one of its attacks must succeed on a DC {{dc}} Mind Saving Throw or lose 1d4 Aether, which {{name}} may spend to fuel its own Artes before the end of the encounter.',
    category: 'magic',
    threatCost: 3,
    suitedTo: ['monster', 'boss', 'mythicBoss'],
    recommendedRoles: ['caster', 'controller'],
    keywords: ['aether drain', 'siphon', 'artes', 'resource', 'anti-caster'],
    source: 'The Crucible',
  },
  {
    id: 'aethericDistortionField',
    name: 'Aetheric Distortion Field',
    description:
      'Unstable Aether warps the area within 30 feet of {{name}}, making it Difficult Terrain for hostile creatures. A creature Concentrating on an Arte inside that area must succeed on a DC {{dc}} Mind Saving Throw at the start of its turn or lose Concentration.',
    category: 'magic',
    threatCost: 4,
    suitedTo: ['monster', 'boss', 'mythicBoss', 'hazard'],
    recommendedRoles: ['controller', 'caster'],
    keywords: ['aura', 'concentration', 'difficult terrain', 'aether', 'distortion'],
    source: 'The Crucible',
  },
  {
    id: 'innateArtes',
    name: 'Innate Artes',
    description:
      '{{name}} is an Innate-Caster and spends no Aether to cast. It casts two cantrip-tier Artes at will and three Artes of Tier 2 or lower each Full Rest, using an Artes Save DC of {{dc}}.',
    category: 'magic',
    threatCost: 2,
    uses: { count: 3, per: 'fullRest' },
    suitedTo: ['npc', 'monster', 'companion', 'summon'],
    recommendedRoles: ['caster', 'blaster', 'healer'],
    keywords: ['innate', 'artes', 'at will', 'cantrip', 'no aether'],
    source: 'The Crucible',
  },
  {
    id: 'resonantBacklash',
    name: 'Resonant Backlash',
    description:
      'Once each round, when a creature within 30 feet of {{name}} casts an Arte, {{name}} can use its Reaction to recoil the surrounding Aether. That creature must succeed on a DC {{dc}} Soul Saving Throw or take Force damage equal to 2d6 plus {{pb}}.',
    category: 'magic',
    threatCost: 3,
    uses: { count: 1, per: 'round' },
    modifiers: [
      {
        id: 'resonantBacklashDpr',
        target: 'derived.damagePerRound',
        op: 'add',
        value: 7,
        reason: 'Assumes at least one enemy Arte is cast in range each round.',
      },
    ],
    suitedTo: ['monster', 'boss', 'mythicBoss', 'hazard'],
    recommendedRoles: ['caster', 'blaster'],
    keywords: ['reaction', 'punish casting', 'force damage', 'aether', 'backlash'],
    source: 'The Crucible',
  },
];

export const traitById: Record<string, CrucibleTraitDefinition> = Object.fromEntries(
  CREATURE_TRAITS.map((trait) => [trait.id, trait]),
);

/** Every trait recommended for the given creature role id. */
export function traitsForRole(roleId: string): CrucibleTraitDefinition[] {
  return CREATURE_TRAITS.filter((trait) => (trait.recommendedRoles ?? []).includes(roleId));
}
