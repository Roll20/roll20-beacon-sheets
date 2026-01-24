// Canonical spell path data sourced from compendium/spells.json
// Each entry maps directly to the spell template fields in sheetStore

export const CANONICAL_SPELL_PATHS = [
  'Beam', 'Explosion', 'Curing', 'Restoration', 'Amplify', 'Manipulate',
  'Barrier', 'Transformation', 'Summoning', 'Divination', 'Chronomancy'
];

export const SPELL_PATH_DATA = {
  Beam: {
    name: 'Beam Path',
    range: '60ft',
    tier_I_name: 'Beam I', tier_I_dice: '3d8', tier_I_special: 'Reclaim', tier_I_description: 'If missed, regain \u00BD MP spent', tier_I_action: 'Standard',
    tier_II_name: 'Beam II', tier_II_dice: '6d8', tier_II_special: 'Reclaim', tier_II_description: 'If missed, regain \u00BD MP spent', tier_II_action: 'Standard',
    tier_III_name: 'Beam III', tier_III_dice: '9d8', tier_III_special: 'Reclaim', tier_III_description: 'If missed, regain \u00BD MP spent', tier_III_action: 'Standard',
    tier_IV_name: 'Beam IV', tier_IV_dice: '12d8', tier_IV_special: 'Reclaim', tier_IV_description: 'If missed, regain \u00BD MP spent', tier_IV_action: 'Standard',
    tier_V_name: 'Beam V', tier_V_dice: '6d10', tier_V_special: 'Dual Beam', tier_V_description: 'Make two spell attacks (same or different targets)', tier_V_action: 'Standard',
    tier_VI_name: 'Beam VI', tier_VI_dice: '8d10', tier_VI_special: 'Dual Beam', tier_VI_description: 'Make two spell attacks (same or different targets)', tier_VI_action: 'Standard'
  },
  Explosion: {
    name: 'Explosion Path',
    range: '60ft',
    tier_I_name: 'Explosion I', tier_I_dice: '1d12', tier_I_special: '1 Target OR 1 Horde', tier_I_description: 'Intensity', tier_I_action: 'Standard',
    tier_II_name: 'Explosion II', tier_II_dice: '2d12', tier_II_special: '1 Target OR 1 Horde', tier_II_description: 'Converge I', tier_II_action: 'Standard',
    tier_III_name: 'Explosion III', tier_III_dice: '3d12', tier_III_special: '1 Target OR 1 Horde', tier_III_description: 'Intensity', tier_III_action: 'Standard',
    tier_IV_name: 'Explosion IV', tier_IV_dice: '4d12', tier_IV_special: '1 Target OR 1 Horde', tier_IV_description: 'Converge II', tier_IV_action: 'Standard',
    tier_V_name: 'Explosion V', tier_V_dice: '5d12', tier_V_special: '1 Target OR 1 Horde', tier_V_description: 'Intensity', tier_V_action: 'Standard',
    tier_VI_name: 'Explosion VI', tier_VI_dice: '7d12', tier_VI_special: '1 Target OR 1 Horde', tier_VI_description: 'Converge III + Intensity', tier_VI_action: 'Standard'
  },
  Curing: {
    name: 'Curing Path',
    range: '5ft (Touch)',
    tier_I_name: 'Curing I', tier_I_dice: '1d10 + 1d4', tier_I_special: 'Deathwatch', tier_I_description: 'Stabilize dying ally', tier_I_action: 'Standard',
    tier_II_name: 'Curing II', tier_II_dice: '1d10 + 2d6', tier_II_special: 'Cleanse (1), Deathwatch', tier_II_description: 'Remove one Condition', tier_II_action: 'Standard',
    tier_III_name: 'Curing III', tier_III_dice: '1d10 + 3d8', tier_III_special: 'Mending (1), Deathwatch', tier_III_description: 'Repair 1 Crystalline Fracture', tier_III_action: 'Standard',
    tier_IV_name: 'Curing IV', tier_IV_dice: '5d10', tier_IV_special: 'Deathwatch, Purge (1)', tier_IV_description: 'Entirely remove one Condition', tier_IV_action: 'Standard',
    tier_V_name: 'Curing V', tier_V_dice: '6d12', tier_V_special: 'Deathwatch, Instant, Mending (2)', tier_V_description: 'Free Action; Repair 2 Fractures', tier_V_action: 'Standard',
    tier_VI_name: 'Curing VI', tier_VI_dice: '200 HP', tier_VI_special: 'Deathwatch, Mending (4), Purge (2)', tier_VI_description: 'Repair 4 Fractures; Remove 2 Conditions', tier_VI_action: 'Standard'
  },
  Restoration: {
    name: 'Restoration Path',
    range: '60ft (affects squadron)',
    tier_I_name: 'Restoration I', tier_I_dice: '1d4', tier_I_special: 'Protection', tier_I_description: 'Provides Temp HP to squadron only', tier_I_action: 'Standard',
    tier_II_name: 'Restoration II', tier_II_dice: '2d4', tier_II_special: 'Restoration', tier_II_description: 'Heals all squadron Magi-Knights', tier_II_action: 'Standard',
    tier_III_name: 'Restoration III', tier_III_dice: '3d4', tier_III_special: 'Restoration OR Protection', tier_III_description: 'Choose Temp HP OR healing', tier_III_action: 'Standard',
    tier_IV_name: 'Restoration IV', tier_IV_dice: '1d6 + 3d4', tier_IV_special: 'Instant Protection', tier_IV_description: 'Free Action; Temp HP only', tier_IV_action: 'Standard',
    tier_V_name: 'Restoration V', tier_V_dice: '2d6 + 4d4', tier_V_special: 'Restoration OR Protection, Cleanse (1)', tier_V_description: 'Choose effect; also Cleanse one', tier_V_action: 'Standard',
    tier_VI_name: 'Restoration VI', tier_VI_dice: '4d6 + 8d4', tier_VI_special: 'Restoration, Protection (\u00D75 MAM), Mending (1)', tier_VI_description: 'Heals, grants 5\u00D7MAM Temp HP, repairs 1 Fracture', tier_VI_action: 'Standard'
  },
  Amplify: {
    name: 'Amplify Path',
    range: '120ft (affects squadron)',
    tier_I_name: 'Amplify I', tier_I_dice: 'Enhancement', tier_I_special: 'Add Rep Level (min 1) to Attacks and Rolls to Resist. Stack: +1 more', tier_I_description: 'Until next turn: Add MAM to first Attack', tier_I_action: 'Standard',
    tier_II_name: 'Amplify II', tier_II_dice: 'Illumination', tier_II_special: 'Healing spells add \u00BD Level (min 1) + MAM (single) or MAM (multi). Stack: +5/+2 per Rep', tier_II_description: 'Until next turn: One ally regains HP = MAM + Rep at start of turn', tier_II_action: 'Standard',
    tier_III_name: 'Amplify III', tier_III_dice: 'Purification', tier_III_special: 'Remove Berserk/Bleeding/Burning/Disoriented from one ally per turn. Stack: Add Drained/Distressed/Silenced; Stack again: Add Soul-Siphoned (I-II)/Soul-Tainted', tier_III_description: 'Until next turn: Add MAM to first Roll to Resist', tier_III_action: 'Standard',
    tier_IV_name: 'Amplify IV', tier_IV_dice: 'Resolution', tier_IV_special: 'Advantage on Roll to Resist vs Conditions; re-roll active Conditions. Stack: +2 to Roll', tier_IV_description: 'Until next turn: Add MAM to first Skill Check', tier_IV_action: 'Standard',
    tier_V_name: 'Amplify V', tier_V_dice: 'Serenity', tier_V_special: 'Remove 1 Stress or Exhaustion from squadron per turn (combat only). Stack: +2 MP per turn', tier_V_description: 'Until next turn: +2\u00D7MAM MP at start of ally turns', tier_V_action: 'Standard',
    tier_VI_name: 'Amplify VI', tier_VI_dice: 'Visionary Focus', tier_VI_special: 'Gain 1 chosen Aura for squad + 2 more for self only (no Flare/Stack). Stack: Auras persist until all lose Focus or combat ends', tier_VI_description: 'Once per Round: Reroll d20 if result \u2264 MAM', tier_VI_action: 'Standard'
  },
  Manipulate: {
    name: 'Manipulate Path',
    range: '60ft',
    tier_I_name: 'Manipulate I', tier_I_dice: 'Elemental Chains', tier_I_special: '1 Cultist', tier_I_description: 'Roll to Resist (Magic). Fail: Restrained. Fail by 5+: Also Prone (Bonus). Success: Refund \u00BD MP. Nemesis+ have Advantage', tier_I_action: 'Standard',
    tier_II_name: 'Manipulate II', tier_II_dice: 'Glaring Resonance', tier_II_special: '2 Adjacent Cultists or 1 Horde', tier_II_description: 'Opposed Mysticism (Nemesis Advantage). Fail: Disoriented. Success: Refund \u00BD MP', tier_II_action: 'Standard',
    tier_III_name: 'Manipulate III', tier_III_dice: 'Erratic Misfortune', tier_III_special: '1 Enemy', tier_III_description: 'Roll to Resist (Magic). Fail: Roll 2d6 for Condition (1-Berserk, 2-Bleed(2+MAM), 3-Burning(2+MAM), 4-Disoriented, 5-Poisoned, 6-Silenced). Doubles: Condition + 3d12 damage. Nemesis+: 4d12 damage only', tier_III_action: 'Standard',
    tier_IV_name: 'Manipulate IV', tier_IV_dice: 'Spectral Restraints', tier_IV_special: '1 Outsider/Horde', tier_IV_description: 'Opposed Mysticism. Fail: Paralyzed. Success: Refund \u00BD MP (Adversary: +1 Stress). No effect on Nemesis+', tier_IV_action: 'Standard',
    tier_V_name: 'Manipulate V', tier_V_dice: 'Thousand Elemental Cuts', tier_V_special: 'Up to 4 Targets or 2 Hordes', tier_V_description: 'Spell Attack. Hit: Bleeding (8) + Level + MAM damage. Miss: Bleeding (8) only. Swarm: 2\u00D7Level + MAM damage or \u00BD MP refund', tier_V_action: 'Standard',
    tier_VI_name: 'Manipulate VI', tier_VI_dice: 'Elemental Degradation', tier_VI_special: '1 Target', tier_VI_description: 'While maintaining Total Focus: All Magi-Knight Weapon/Spell Attacks gain Advantage. If already Advantage: Reroll one damage die', tier_VI_action: 'Standard'
  },
  Barrier: {
    name: 'Barrier Path',
    range: '',
    tier_I_name: 'Barrier I', tier_I_dice: 'Shield of Dissipation', tier_I_special: 'Reaction', tier_I_description: 'Reduce Physical damage by Rep Level d4s + MAM. Magical: d8s instead. Overcharge: d4\u2192d8, d8\u2192d12. Quicken: Immediate Action', tier_I_action: 'Standard',
    tier_II_name: 'Barrier II', tier_II_dice: 'Twin Souls (Total Focus)', tier_II_special: 'Standard', tier_II_description: 'You + willing Magi-Knight gain Physical Resistance, split all damage evenly. One instance only', tier_II_action: 'Standard',
    tier_III_name: 'Barrier III', tier_III_dice: 'Globe of Dissipation', tier_III_special: 'Reaction', tier_III_description: 'All Magi-Knights in 20ft gain Magical Resistance to one source. Overcharge: Immunity vs Adversary/Vassal. Quicken: Immediate Action', tier_III_action: 'Standard',
    tier_IV_name: 'Barrier IV', tier_IV_dice: 'Barrier of Nullification', tier_IV_special: 'Reaction', tier_IV_description: 'Physical + Magical Immunity to one ability; then Resistance until your turn (gain Drained). Overcharge: No Drained. Quicken: Immediate Action', tier_IV_action: 'Standard',
    tier_V_name: 'Barrier V', tier_V_dice: 'Strengthen Element (Total Focus)', tier_V_special: 'Standard', tier_V_description: 'You + one Magi-Knight gain Magical Resistance. If Twin Souls active last round, Total Focus both', tier_V_action: 'Standard',
    tier_VI_name: 'Barrier VI', tier_VI_dice: 'Colossal Sphere of Nullification', tier_VI_special: 'Reaction', tier_VI_description: 'All Magi-Knights in 60ft gain Physical + Magical Immunity to one source. Next turn: Depleted. Overcharge: Drained instead', tier_VI_action: 'Standard'
  },
  Transformation: {
    name: 'Transformation Path',
    range: '',
    tier_I_name: 'Transformation I', tier_I_dice: 'Empower Element', tier_I_special: 'Total Focus', tier_I_description: 'Weapon Damage = 3d4. Use MAM for Attack/Damage modifiers. Enhance: +2 Stress to deal Magical damage. Linked: If under Transformation, cast as Bonus Action', tier_I_action: 'Standard',
    tier_II_name: 'Transformation II', tier_II_dice: 'Elemental Focus', tier_II_special: 'None', tier_II_description: 'Next Weapon Attack auto-hits + 10 damage. Soul Guns roll for Direct Hit only. Enhance: +1 Stress for +5 damage', tier_II_action: 'Standard',
    tier_III_name: 'Transformation III', tier_III_dice: 'Transformation [Super]', tier_III_special: 'Total Focus', tier_III_description: '+30 Temp HP, +1 Move and Bonus Action per Round, +1d10 Weapon Damage per Round. Lasts until Unconscious/combat ends. Total Focus protected vs Depleted/Drained/Soul-Siphoned (II-IV)/Unconscious. Full-Round: Remove Distressed even if already', tier_III_action: 'Standard',
    tier_IV_name: 'Transformation IV', tier_IV_dice: 'Unleash Fury', tier_IV_special: 'Transformation Active', tier_IV_description: 'Make 3 Weapon Attacks. Recover 1 Stress per hit', tier_IV_action: 'Standard',
    tier_V_name: 'Transformation V', tier_V_dice: 'Transformation [Ultimate]', tier_V_special: 'Total Focus', tier_V_description: '+60 Temp HP, +1 Move and Standard Action per Round, +2d10 Weapon Damage per Round. Total Focus protected vs Depleted/Drained/Soul-Siphoned (III-IV)/Unconscious. Full-Round: Remove Horrified even if already. Does not stack with [Super]', tier_V_action: 'Standard',
    tier_VI_name: 'Transformation VI', tier_VI_dice: 'Second Awakening', tier_VI_special: 'None', tier_VI_description: 'Immediate Action when receiving last Crystalline Fracture: Heal 3 Fractures, recover \u00BD HP, recover 25 MP, reduce Stress to 0, take a turn after current turn', tier_VI_action: 'Standard'
  },
  Summoning: {
    name: 'Summoning Spell Path',
    range: '',
    tier_I_name: 'Summoning I', tier_I_dice: 'Summon Elemental', tier_I_special: 'Summon appears. Surge: Also gain Secondary. Reinforce: If summon present, gain 3\u00D7Level+MAM Temp HP', tier_I_action: 'Standard',
    tier_II_name: 'Summoning II', tier_II_dice: 'Strengthen', tier_II_special: '+20 Range OR +1d8 melee damage. Quicken available', tier_II_action: 'Standard',
    tier_III_name: 'Summoning III', tier_III_dice: 'Enhanced', tier_III_special: 'Enlargement (Large, +1d12) OR Duplication (Horde, +3 Atk/Dmg). Surge: Free Summon Elemental', tier_III_action: 'Standard',
    tier_IV_name: 'Summoning IV', tier_IV_dice: 'Intercept Attack', tier_IV_special: 'Reaction: Summon takes Fracture damage for you, dispersed', tier_IV_action: 'Standard',
    tier_V_name: 'Summoning V', tier_V_dice: 'True Summoning', tier_V_special: 'Evolution (Huge, 3 Commands, +2d12) OR Mass Duplication (2 Hordes, 3 Commands)', tier_V_action: 'Standard',
    tier_VI_dice: '', tier_VI_special: '', tier_VI_description: '', tier_VI_action: ''
  },
  Chronomancy: {
    name: 'Chronomancy Spell Path',
    range: '',
    tier_I_name: 'Chronomancy I', tier_I_dice: 'Velocity Burst', tier_I_special: 'Reaction', tier_I_description: 'When attacked within 15ft: Attack enemy before their attack completes', tier_I_action: 'Standard',
    tier_II_name: 'Chronomancy II', tier_II_dice: 'Time Screen', tier_II_special: 'Standard', tier_II_description: 'Total Focus: -MAM to damage received; +MAM to damage dealt (becomes Magical)', tier_II_action: 'Standard',
    tier_III_name: 'Chronomancy III', tier_III_dice: 'Moratorium', tier_III_special: 'Immediate', tier_III_description: 'After dealing damage: Reduce to 0. Enemy Roll to Resist (Magic): Fail = \u00D72 later, Success = \u00BD', tier_III_action: 'Standard',
    tier_IV_name: 'Chronomancy IV', tier_IV_dice: 'Timely Intervention', tier_IV_special: 'Reaction', tier_IV_description: 'You or ally within 10ft about to take damage/Condition: Teleport 10ft together, negate all. Gain Drained', tier_IV_action: 'Standard',
    tier_V_name: 'Chronomancy V', tier_V_dice: 'Time Displaced Weapon', tier_V_special: 'Bonus', tier_V_description: 'Soul Weapon: 2 Attacks. Implement: Free spell, -10 MP (Tier IV-). Soul Gun: +2 MD, auto-reload. 1d100: 90+ = Temporal Huntress', tier_V_action: 'Standard',
    tier_VI_name: 'Chronomancy VI', tier_VI_dice: 'Chrono Dance', tier_VI_special: 'Immediate', tier_VI_description: 'Total Focus: -3 all damage, Reaction -10 more, +10ft Move (teleport), +1 Bonus, grab ally to teleport. No other Actions during your turn. 1d100: 80+ = Temporal Huntress', tier_VI_action: 'Standard'
  },
  Divination: {
    name: 'Divination Spell Path',
    range: '',
    tier_I_name: 'Divination I', tier_I_dice: '3', tier_I_special: '0', tier_I_description: '2', tier_I_action: 'Standard',
    tier_II_name: 'Divination II', tier_II_dice: '6', tier_II_special: '0', tier_II_description: '4', tier_II_action: 'Standard',
    tier_III_name: 'Divination III', tier_III_dice: '15', tier_III_special: '0', tier_III_description: '6', tier_III_action: 'Standard',
    tier_IV_name: 'Divination IV', tier_IV_dice: '25', tier_IV_special: '0', tier_IV_description: '8', tier_IV_action: 'Standard',
    tier_V_name: 'Divination V', tier_V_dice: '36', tier_V_special: '1', tier_V_description: '10', tier_V_action: 'Standard',
    tier_VI_name: 'Divination VI', tier_VI_dice: '45', tier_VI_special: '2', tier_VI_description: '12', tier_VI_action: 'Standard'
  }
};
