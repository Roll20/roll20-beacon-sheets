/** Mana Confluxes, extra Aether-fueled effects applied when casting an Arte. */
export interface ManaConfluxDef {
  id: string;
  name: string;
  description: string;
}

export const MANA_CONFLUXES: ManaConfluxDef[] = [
  {
    id: 'adamant',
    name: 'Adamant Conflux',
    description:
      'Spend (1 + Arte tier) Aether to make an Arte immune to Anti-Magic effects (Null Artes, Nullify Magic, anti-magic field).',
  },
  {
    id: 'amplified',
    name: 'Amplified Conflux',
    description:
      'When an Arte deals your draconic-ancestry damage type, spend 1 Aether to make that damage ignore resistances.',
  },
  {
    id: 'bewitching',
    name: 'Bewitching Conflux',
    description:
      'When rolling damage for an Arcane Cantrip, spend 1 Aether to curse the target (ground its flight, drop its item, or impose Disadvantage on one attribute). +1 Aether to Incapacitate (Mind Save each turn to end).',
  },
  {
    id: 'binding',
    name: 'Binding Conflux',
    description:
      "On a damaging Arte, pay 1 Aether per chosen creature (up to PB): each becomes Restrained and takes 1d6 of the Arte's type each turn (Body Save vs your Arte DC to break free).",
  },
  {
    id: 'brisk',
    name: 'Brisk Conflux',
    description:
      'Spend 1 Aether on an Arte targeting a creature to grant it +10 ft. speed, 15 ft. fly, or 40 ft. climb for 10 minutes.',
  },
  {
    id: 'brutal',
    name: 'Brutal Conflux',
    description: 'On an Arte attack, spend 1-3 Aether to crit on 19-20 / 18-20 / 17-20.',
  },
  {
    id: 'burning',
    name: 'Burning Conflux',
    description:
      'On a damaging Arte, spend 1 Aether per target: after taking damage, they take 1d10 of the same type each round (Action + full movement to end).',
  },
  {
    id: 'careful',
    name: 'Careful Conflux',
    description:
      'On a save-forcing Arte, spend 1 Aether to let up to your Presence Mod creatures auto-succeed (and take no damage).',
  },
  {
    id: 'concussive',
    name: 'Concussive Conflux',
    description:
      'On a Bludgeoning/Thunder Arte, spend 1 Aether to force a Body Save or knock a target Prone (Large+ has Advantage).',
  },
  {
    id: 'conductive',
    name: 'Conductive Conflux',
    description:
      'On a damaging Arte, spend 1 Aether to convert half its damage to Lightning or Thunder.',
  },
  {
    id: 'distance',
    name: 'Distance Conflux',
    description: "Spend 1 Aether to double an Arte's range (or make a Touch Arte 30 ft.).",
  },
  {
    id: 'double',
    name: 'Double Conflux',
    description:
      'On a single-target Arte, spend Aether = its Tier to cast a second different single-target Arte at the same target.',
  },
  {
    id: 'empowered',
    name: 'Empowered Conflux',
    description:
      'Spend 1 Aether to reroll up to your Presence Mod damage dice (take the new rolls). Stacks with another Conflux.',
  },
  {
    id: 'exalted',
    name: 'Exalted Conflux',
    description:
      "Spend 3 Aether to remove an Arte's Concentration requirement (full duration). Once per minute.",
  },
  {
    id: 'extended',
    name: 'Extended Conflux',
    description:
      'On an Arte lasting 1+ minute, spend 1 Aether to double its duration (max 24h); Advantage on Concentration saves.',
  },
  {
    id: 'favored',
    name: 'Favored Conflux',
    description:
      'On an Arte attack roll, spend 2 Aether for a +2d4 bonus (declare before rolling).',
  },
  {
    id: 'flux',
    name: 'Flux Conflux',
    description:
      'On an Acid/Cold/Fire/Lightning/Thunder Arte, spend 1 Aether to switch to another of those types.',
  },
  {
    id: 'frightful',
    name: 'Frightful Conflux',
    description:
      'On a save-forcing Arte, spend 2 Aether: target must make a Mind Save or be Frightened of you until your next turn.',
  },
  {
    id: 'heightened',
    name: 'Heightened Conflux',
    description: 'Spend 2 Aether to give one target Disadvantage on its save against the Arte.',
  },
  {
    id: 'imbued',
    name: 'Imbued Conflux',
    description:
      'On a range-Self Arte, spend (1 + tier) Aether to cast it at Touch on a willing creature.',
  },
  {
    id: 'invisible',
    name: 'Invisible Conflux',
    description:
      'On an instantaneous Arte, spend 1 Aether to make its visual manifestations invisible. Stacks with another Conflux.',
  },
  {
    id: 'kinetic',
    name: 'Kinetic Conflux',
    description:
      'On a Body-Save Arte, spend 2 Aether to change the initial save to a different one.',
  },
  {
    id: 'linked',
    name: 'Linked Conflux',
    description:
      'Spend 2 Aether and touch a willing creature within 5 ft. to expend their Aether to cast the Arte in place of yours.',
  },
  {
    id: 'malignant',
    name: 'Malignant Conflux',
    description:
      "On a damaging Arte, spend Aether = its Tier to reduce a target's max HP by the damage taken for 1 hour.",
  },
  {
    id: 'misdirecting',
    name: 'Misdirecting Conflux',
    description:
      'Spend 3 Aether to make an Arte appear to originate from a point you can see within 30 ft.',
  },
  {
    id: 'mercy',
    name: 'Mercy Conflux',
    description:
      'When an Arte reduces a creature to 0 HP, spend 1 Aether to knock it out instead of killing it.',
  },
  {
    id: 'potency',
    name: 'Potency Conflux',
    description:
      'On a damaging Arte, spend 3 Aether to ignore Resistance and treat Immunity as Resistance.',
  },
  {
    id: 'quickened',
    name: 'Quickened Conflux',
    description:
      'Spend 2 Aether to change an Action-cast Arte to a Quick Action (limits on other Tier-1+ casts that turn).',
  },
  {
    id: 'restorative',
    name: 'Restorative Conflux',
    description:
      'On a single-target Arte, spend 2 Aether to end a disease or a condition (blinded/deafened/paralyzed/poisoned).',
  },
  {
    id: 'ricochet',
    name: 'Ricochet Conflux',
    description:
      'When a single-target Arte has no effect, spend 2 Aether (Reaction) to redirect it to another target in range.',
  },
  {
    id: 'seeking',
    name: 'Seeking Conflux',
    description:
      'Spend 1 Aether to ignore half/three-quarters cover on an Arte attack or Body-Save Arte.',
  },
  {
    id: 'sieging',
    name: 'Sieging Conflux',
    description:
      'On an object-damaging Arte, spend 1 Aether to deal double damage to objects. Stacks with another Conflux.',
  },
  {
    id: 'subtle',
    name: 'Subtle Conflux',
    description:
      'Spend 1 Aether to cast without Verbal/Somatic/Material components (except costed/consumed materials).',
  },
  {
    id: 'tempestuous',
    name: 'Tempestuous Conflux',
    description:
      'On a creature-targeting Arte, spend 2 Aether: Body Save or be pushed 20 ft. or knocked prone.',
  },
  {
    id: 'siphoning',
    name: 'Siphoning Conflux',
    description:
      'On a damaging Arte, spend 2 Aether to heal yourself for half the damage dealt to one target.',
  },
  {
    id: 'umbral',
    name: 'Umbral Conflux',
    description:
      'On an area Arte, spend 3 Aether to fill the area with magical darkness (which you can see through) until your next turn.',
  },
  {
    id: 'unerring',
    name: 'Unerring Conflux',
    description:
      'On a missed Arte attack, spend 2 Aether to reroll (use the new result). Stacks with another Conflux.',
  },
];
