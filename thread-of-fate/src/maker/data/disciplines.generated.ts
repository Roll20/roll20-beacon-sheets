// AUTO-GENERATED from "Convergence Disciplines.md".
// Do not edit by hand, re-run: node scripts/parse-disciplines.mjs
import type { DisciplineDef } from '@/maker/types';

export const GENERATED_DISCIPLINES: DisciplineDef[] = [
  {
    id: 'pretender',
    name: 'Pretender',
    cost: 4,
    prerequisite: 'Presence 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Presence Score by 2, to a maximum of 30.\n\nImpersonation. While you're disguised as a real or fictional person, you have Advantage on Deception or Performance checks to convince others that you are that person.\n\nMimicry. You can mimic the sounds of other creatures, including speech. A creature that hears the mimicry must succeed on an Intuition Check to determine the effect is faked (DC = 8 + your Proficiency Bonus + your Presence Modifier). You must have heard the sounds of this other creature for at least 1 minute to properly mimic them.",
  },
  {
    id: 'vigilant',
    name: 'Vigilant',
    cost: 6,
    prerequisite: 'Focus 12+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus Score by 1, to a maximum of 30.\n\nInitiative Proficiency. When you roll Initiative, you can add your Proficiency Bonus to the roll.\n\nInitiative Swap. Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can't make this swap if you or the ally has the Incapacitated condition.",
  },
  {
    id: 'physically-fit',
    name: 'Physically Fit',
    cost: 5,
    prerequisite: 'Might or Instinct 13+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nClimb Speed. You gain a Climb Speed equal to your Ground Speed.\n\nHop Up. When you have the Prone condition, you can right yourself with only 5 feet of movement.\n\nJumping. You can make a running Long or High Jump after moving only 5 feet.',
  },
  {
    id: 'sanguine-thirst',
    name: 'Sanguine Thirst',
    cost: 5,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might, Instinct, or Conviction Score by 1, to a maximum of 30.\n\nPowerful Recovery. When you roll a Hit Point Die to regain Hit Points, you can treat any roll of 1 or 2 as a 3.\n\nSanguine Feast. Once per turn when you hit a Bloodied (target whose hit points are at 50% or less) creature that isn't a Construct or Undead with an attack roll, you can expend a Hit Point Die, roll it, and regain a number of Hit Points equal to (the number rolled + your Conviction modifier).\n\nYou can use this feature a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Full Rest.",
  },
  {
    id: 'big-badda-boom',
    name: 'Big-Badda-Boom',
    cost: 2,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct Score by 1, to a maximum of 30.\n\nFar Lobber. When you use the Attack action to throw a vial or flask, you can target an object or creature you can see within 40 feet of yourself.\n\nLong Shots. Attacking at long range doesn't impose Disadvantage on your attack rolls with Thrown weapons.",
  },
  {
    id: 'card-magic',
    name: 'Card Magic',
    cost: 5,
    prerequisite: 'Level 4+, ability to cast Artes',
    description:
      'You have learned to channel your magic through a deck of cards. You can use a card deck as your spellcasting focus, and you gain the following benefits:\n\nIs This Your Card?. You learn the "Parlor Trick" cantrip and can use it to create illusions that duplicate the effects of stage magic. When you use "Parlor Trick" in this way, you can conceal the verbal and somatic components of the spell as ordinary conversation and card handling.\n\nNothing Up My Sleeves!. When you finish a Full Rest, you can choose one spell from your class or aspect\'s spell list and imbue that spell into a card. The chosen spell must have a casting time of Full Cast, and it must be a Tier for which you have the Caster Level to use. The card remains imbued with this spell for 8 hours. While the card is imbued with the spell, you can use a Quick Action to flourish the card and cast the spell within. The card then immediately loses its magic.',
  },
  {
    id: 'battering-ram',
    name: 'Battering Ram',
    cost: 5,
    prerequisite: 'Might or Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nImproved Gait. When you take the Dash action, your Speed increases by 10 feet for that action.\n\nRamming Speed. If you move at least 10 feet in a straight line toward a target immediately before hitting it with a melee attack roll as part of the Attack action, choose one of the following effects: gain a 1d8 bonus to the attack's damage roll, or push the target up to 10 feet away if it is no more than one size larger than you. You can use this benefit only once on each of your turns.",
  },
  {
    id: 'kitchens-call',
    name: "Kitchen's Call",
    cost: 6,
    prerequisite: 'Focus 12+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction or Focus Score by 1, to a maximum of 30.\n\nChef's Art. You gain proficiency with Cook's Utensils if you don't already have it.\n\nFeeling Peckish?. As part of a Quick Rest, you can cook special food if you have ingredients and Cook's Utensils on hand. You can prepare enough of this food for a number of creatures equal to (4 + your Proficiency Bonus). At the end of the Quick Rest, any creature who eats the food and spends one or more Hit Dice to regain Hit Points regains an extra 1d8 Hit Points.\n\nSoothing Snacks. With 1 hour of work or when you finish a Full Rest, you can cook a number of treats equal to your Proficiency Bonus if you have ingredients and Cook's Utensils on hand. These special treats last 8 hours after being made. A creature can eat one of those treats as a Quick Action to gain a number of Temporary Hit Points equal to your Proficiency Bonus.",
  },
  {
    id: 'omen-mists',
    name: 'Omen Mists',
    cost: 5,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus, Resonance, or Presence Score by 1, to a maximum of 30.\n\nRolling Omen. You always have the Omen Mists Arte prepared. You can cast it without using Aether once, and you must finish a Full Rest before you can cast it in this way again. You can also cast it using Aether you have of the appropriate level. Your spellcasting ability for the Arte is the ability increased by this Discipline.\n\nClawing Mists. Whenever you cast Omen Mists, nonmagical flames in the Arte's Sphere are extinguished, and creatures other than you and your allies have their Speed reduced by 5 feet while in the Arte's Sphere.",
  },
  {
    id: 'cryo-caster',
    name: 'Cryo-Caster',
    cost: 5,
    prerequisite: 'Focus, Resonance or Presence 12+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus, Resonance, or Presence Score by 1, to a maximum of 30.\n\nIcy Influence. You learn the Chill-Ray cantrip. If you already know it, you learn a different Arcane cantrip of your choice. The Arte's casting ability is the ability increased by this Discipline.\n\nFrostbite. Once per turn when you hit a creature with an attack roll and deal Cold damage, you can temporarily negate the creature's defenses. The creature subtracts 1d4 from the next Saving Throw it makes before the end of your next turn.",
  },
  {
    id: 'crossbow-killer',
    name: 'Crossbow Killer',
    cost: 6,
    prerequisite: 'Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct Score by 1, to a maximum of 30.\n\nIgnore Loading. You reduce the Reload property of weapons in the Crossbow group (all called crossbows elsewhere in this feat) by a step. If you're holding one of them, you can load a piece of ammunition into it even if you lack a free hand.\n\nClose Quarters Combat. Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with crossbows.\n\nDual Wielding. When you make the extra attack of the Light property, you can add your ability modifier to the damage of the extra attack if that attack is with a crossbow that has the Light property and you aren't already adding that modifier to the damage.",
  },
  {
    id: 'cruelty',
    name: 'Cruelty',
    cost: 5,
    prerequisite: 'None',
    description:
      "The challenges and struggles you've faced throughout your life have led you to delight in inflicting pain and anguish upon others. You gain a number of cruelty dice equal to your Proficiency Bonus. Your cruelty dice are d6s. You can roll only one cruelty die per turn, and a cruelty die is spent when you roll it.\nYou can roll a cruelty die under any of the following circumstances, with the indicated result:\nWhen you deal damage to a creature, spend one cruelty die to deal extra damage to the creature equal to the roll.\n\nWhen you score a critical hit, spend one cruelty die to gain temporary hit points equal to the roll.\n\nWhen you make an Intimidation Check, spend one cruelty die and add the roll to your check.\nYou regain all spent cruelty dice when you finish a Full Rest.",
  },
  {
    id: 'crushing-impact',
    name: 'Crushing Impact',
    cost: 4,
    prerequisite: 'Might 14+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Conviction Score by 1, to a maximum of 30.\n\nPush. Once per turn, when you hit a creature with an attack that deals Bludgeoning damage, you can move it 5 feet to an unoccupied space if the target is no more than one size larger than you.\n\nCritical Crush. When you score a Critical Hit that deals Bludgeoning damage to a creature, attack rolls against that creature have Advantage until the start of your next turn.',
  },
  {
    id: 'draconic-cultist',
    name: 'Draconic Cultist',
    cost: 6,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nDragonspeech. You know Draconic. If you already know Draconic when you select this feat, you instead learn one language of your choice from the language tables.\n\nPresence of the Dragon. You can take an Action to instill terror in a creature you can see within 30 feet of yourself. The target must succeed on a Mind Saving Throw (DC = 8 + your Proficiency Bonus + your Resonance Modifier) or have the Frightened condition until the end of your next turn. If the target succeeds on the save or when the effect ends for a target, the target is immune to this effect for 24 hours.\n\nDriven by Despair. When you cause a creature to have the Frightened condition and you are the source of its fear, you can choose to regain a Stamina Point. Once you use this benefit, you can't use it again until you finish a Quick or Full Rest.",
  },
  {
    id: 'defensive-duelist',
    name: 'Defensive Duelist',
    cost: 3,
    prerequisite: 'Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct Score by 1, to a maximum of 30.\n\nParry. If you're holding a Finesse weapon and another creature hits you with a melee attack, you can take a Reaction to add your Proficiency Bonus to your Armor Class, potentially causing the attack to miss you. You gain this bonus to your AC against melee attacks until the start of your next turn.",
  },
  {
    id: 'masochistic-resilience',
    name: 'Masochistic Resilience',
    cost: 3,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase one of your Ability Scores by 1, to a maximum of 30.\n\nToughened Flesh. Immediately after you take Bludgeoning, Piercing, or Slashing damage, you can take a Reaction to gain Resistance to Bludgeoning, Piercing, and Slashing damage until the start of your next turn. Once you use this benefit, you can't use it again until you finish a Quick or Full Rest.",
  },
  {
    id: 'dual-wielder-combat-style',
    name: 'Dual Wielder Combat Style',
    cost: 5,
    prerequisite: 'Two-Weapon Fighting Combat Style',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nOff-Defense.  While you wield a separate weapon in each hand you gain a +1 bonus to your AC.\n\nBalanced Wielding. You have learned to keep your balance regardless of the weapons you wield. You can use make Off-Strikes even when the weapons you are wielding aren't light.\n\nQuick Draw. You can draw or stow two weapons that lack the Two-Handed property when you would normally be able to draw or stow only one.",
  },
  {
    id: 'dungeon-diver',
    name: 'Dungeon Diver',
    cost: 3,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus or Instinct Score by 1, to a maximum of 30.\n\nOff-Strike. Alert to the hidden traps and secret doors found in many dungeons, you gain the following benefits:\nYou have advantage on Perception and Investigation Checks made to detect the presence of secret doors.\nYou have advantage on saving throws made to avoid or resist traps.\nYou have resistance to the damage dealt by traps.\nTraveling at a fast pace doesn't impose the normal -5 penalty on your passive Perception score.",
  },
  {
    id: 'durable-constitution',
    name: 'Durable Constitution',
    cost: 4,
    prerequisite: 'Level 4+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction Score by 1, to a maximum of 30.\n\nHard to Kill. You have Advantage on Death Saving Throws.\n\nSpeedy Recovery. As a Quick Action, you can expend one of your Hit Point Dice, roll the die, and regain a number of Hit Points equal to the roll.',
  },
  {
    id: 'elemental-initiate',
    name: 'Elemental Initiate',
    cost: 7,
    prerequisite: 'Ability to cast Artes',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nEnergy Mastery. Choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. Spells you cast ignore Resistance to damage of the chosen type. In addition, when you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2.\n\nRepeatable. You can take this Discipline more than once, but you must choose a different damage type each time for Energy Mastery.',
  },
  {
    id: 'playful-trickster',
    name: 'Playful Trickster',
    cost: 8,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct or Presence Score by 1, to a maximum of 30.\n\nFae Trailblazer. When you take the Disengage action on your turn, Difficult Terrain doesn't cost you extra movement for the rest of that turn.\n\nFlustering Feint. When you hit a creature with an attack roll, you can attempt to fluster the target. The target must succeed on a Mind Saving Throw (DC = 8 + your Proficiency Bonus + the ability modifier of the score increased by this Discipline) or have Disadvantage on Saving Throws until the end of your next turn.\n\nYou can use this benefit a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Full Rest.",
  },
  {
    id: 'fae-touched',
    name: 'Fae-Touched',
    cost: 5,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nFae Magic. Choose one Tier 1 Arte from the Fatebinding or Compulsion school. You learn that Arte and the Warp Step Arte. You can cast each of these Artes without expending Aether. Once you cast either Arte in this way, you can't cast that Arte in this way again until you finish a Full Rest. You can also cast these Artes using Aether you have of the appropriate amount. The Artes' spellcasting ability is the ability increased by this Discipline.",
  },
  {
    id: 'wrastlin',
    name: "Wrastlin'",
    cost: 6,
    prerequisite: 'Might or Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nTwo-Piece Special. When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can also attempt to Grapple that creature. You can use this benefit only once per turn.\n\nLeverage. You have Advantage on attack rolls against a creature Grappled by you.\n\nLariat Whip. You don't have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller.",
  },
  {
    id: 'great-weapon-specialist',
    name: 'Great Weapon Specialist',
    cost: 5,
    prerequisite: 'Might or Instinct 13+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might Score by 1, to a maximum of 30.\n\nHeavy Weapon Mastery. When you hit a creature with a weapon that has the Heavy property as part of the Attack action on your turn, you can cause the weapon to deal extra damage to the target. The extra damage equals your Proficiency Bonus.\n\nHew. Immediately after you score a Critical Hit with a Melee weapon or reduce a creature to 0 Hit Points with one, you can make one attack with the same weapon as a Quick Action.',
  },
  {
    id: 'firearms-specialist',
    name: 'Firearms Specialist',
    cost: 7,
    prerequisite: 'Instinct 13+',
    description:
      "You have a quick hand and keen eye when employing firearms, granting you the following benefits:\n\n    Increase your Instinct Score by 1, to a maximum of 30.\n\n    You become Trained with Munitions Weapons.\n\n    You reduce the reload property of Munitions weapons by a step.\n\n    Being within 5 feet of a hostile creature doesn't impose Disadvantage on your Ranged Attack Rolls with Munitions weapons.",
  },
  {
    id: 'motivating-musician',
    name: 'Motivating Musician',
    cost: 1,
    prerequisite: 'Level 4',
    description:
      'You gain the following benefits:\n\nMusical Protege. You gain proficiency with three Musical Instruments of your choice.\n\nEncouraging Song. As you finish a Quick or Full Rest, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to allies who hear the song. The number of allies you can affect in this way equals your Proficiency Bonus.',
  },
  {
    id: 'underground-musician',
    name: 'Underground Musician',
    cost: 3,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nDouble-Speak. You know Double-Speak.\n\nMusical Inclination. You gain Proficiency with a Musical Instrument of your choice.\n\nDistracting Melody. When you take the Help action to assist an ally's attack roll, the enemy you're distracting can be within 30 feet of you, rather than within 5 feet of you, provided the enemy can see or hear you.",
  },
  {
    id: 'for-the-band',
    name: 'For The Band!',
    cost: 6,
    prerequisite: 'Level 4, Underground Musician',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct or Presence Score by 1, to a maximum of 30.\n\nWithering Wordplay. When you take the Help action to assist an ally's attack roll against an enemy, that enemy also has Disadvantage on the first saving throw it makes before the start of your next turn.\n\nInspiring Willpower. If you succeed on a saving throw to end the Frightened or Paralyzed condition on yourself, you can choose one ally you can see within 30 feet of yourself that has the same condition. That condition immediately ends for that ally.",
  },
  {
    id: 'healer',
    name: 'Healer',
    cost: 4,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nBattle Medic. If you have a Healer's Kit, you can expend one use of it and tend to a creature within 5 feet of yourself as a Utilize action. That creature can expend one of its Hit Point Dice, and you then roll that die. The creature regains a number of Hit Points equal to the roll plus your Proficiency Bonus.\n\nHealing Renewal. Whenever you roll a die to determine the number of Hit Points you restore with an Arte or with this feat's Battle Medic benefit, you can reroll the die if it rolls a 1, and you must use the new roll.",
  },
  {
    id: 'heavily-armored',
    name: 'Heavily Armored',
    cost: 1,
    prerequisite: 'Proficiency in Medium Armor',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Conviction Score by 1, to a maximum of 30.\n\nArmor Training. You become Trained with Heavy armor.',
  },
  {
    id: 'heavy-armor-specialist',
    name: 'Heavy Armor Specialist',
    cost: 4,
    prerequisite: 'Level 4+, Proficiency in Heavy Armor',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Conviction Score by 1, to a maximum of 30.\n\nDamage Reduction. When you're hit by an attack while you're wearing Heavy armor, any Bludgeoning, Piercing, and Slashing damage dealt to you by that attack is reduced by an amount equal to your Proficiency Bonus.",
  },
  {
    id: 'inspiring-leader',
    name: 'Inspiring Leader',
    cost: 3,
    prerequisite: 'Presence 13+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Presence Score by 2, to a maximum of 30.\n\nDramatic Performance. When you finish a Quick or Full Rest, you can give an inspiring performance: a speech, song, or dance. When you do so, choose up to six allies (which can include yourself) within 30 feet of yourself who witness the performance. The chosen creatures each gain Temporary Hit Points equal to your character level plus your Presence modifier.',
  },
  {
    id: 'keen-mind',
    name: 'Keen Mind',
    cost: 5,
    prerequisite: 'Focus 13+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus Score by 2, to a maximum of 30.\n\nLore Fixation. Choose one of the following skills: Arcana, Historical Lore, Investigation, Naturalism, or Theology. If you lack proficiency in the chosen skill, you gain proficiency in it, and if you already have proficiency in it, you gain Expertise in it.\n\nQuick Study. You can take the Survey Quick Action as a Free Action once per turn.',
  },
  {
    id: 'light-bearer',
    name: 'Light-Bearer',
    cost: 7,
    prerequisite: 'Level 4',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nSacred Magic. You learn the Lumen cantrip and can cast it. If you already know that Cantrip, you learn a different Divine Cantrip of your choice. The Artes casting ability is the ability increased by this feat.\n\nSolar Luminance. When you cast Lumen, you can have the light from the Arte be sunlight. Once you use this benefit, you can't use it again until you finish a Full Rest.\n\nSun's Grace. As a Quick Action while within sunlight, you can expend one of your Hit Point Dice, roll the die, and regain a number of Hit Points equal to the roll. Once you use this benefit, you can't use it again until you finish a Quick or Full Rest.",
  },
  {
    id: 'lightly-armored',
    name: 'Lightly Armored',
    cost: 2,
    prerequisite: 'None',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nArmor Training. You become Trained with Light armor and Shields.',
  },
  {
    id: 'linguist',
    name: 'Linguist',
    cost: 4,
    prerequisite: 'Focus 12+',
    description:
      "You have studied languages and codes, gaining the following benefits:\n\n    Increase your Focus Score by 2, to a maximum of 30.\n\n    You learn three languages of your choice.\n\n    You can ably create written ciphers. Others can't decipher a code you create unless you teach them, they succeed on a Focus Check (DC = your Proficiency Bonus + your Focus score), or they use magic to decipher it.",
  },
  {
    id: 'lady-lucks-eye',
    name: "Lady Luck's Eye",
    cost: 8,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nLady's Grace. You have a number of Luck Points equal to your Proficiency Bonus and can spend the points on the benefits below. You regain your expended Luck Points when you finish a Full Rest.\n\nLady's Love. When you roll a d20 for an Attack Roll, Skill Check, Ability Check or Saving Throw, you can spend 1 Luck Point to give yourself Advantage on the roll.\n\nLady's Ire. When a creature rolls a d20 for an Attack Roll, Skill Check, Ability Check or Saving Throw against you or originating from you, you can spend 1 Luck Point to impose Disadvantage on that roll.",
  },
  {
    id: 'mage-slayer',
    name: 'Mage Slayer',
    cost: 5,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nFocus Breaker. When you damage a creature that is Concentrating, it has Disadvantage on the saving throw it makes to maintain Concentration.\n\nStrengthened Mind & Spirit. If you fail a Mind or Soul Saving Throw, you can cause yourself to succeed instead. Once you use this benefit, you can't use it again until you finish a Quick or Full Rest.",
  },
  {
    id: 'artes-initiate',
    name: 'Artes Initiate',
    cost: 6,
    prerequisite: 'Conviction, Resonance, or Presence 12+',
    description:
      "You gain the following benefits:\n\nTier-0. You learn two Cantrips of your choice from the Divine or Arcane Artes list. Conviction, Resonance, or Presence is your spellcasting ability for this Discipline's Artes (choose when you select this Discipline).\n\nTier-1. Choose a Tier-1 Arte from the same list you selected for this Discipline's Cantrips. You always have that Arte prepared. You can cast it once without Aether, and you regain the ability to cast it in that way when you finish a Full Rest. You can also cast the Arte using any Aether you may have, if you are able to.\n\nArtes Change. Whenever you gain a new level, you can replace one of the Artes you chose for this Discipline with a different Arte of the same level from the chosen Artes-List.\n\nRepeatable. You can take this Discipline more than once, but you must choose a different spell list each time.",
  },
  {
    id: 'martial-weapons-specialist',
    name: 'Martial Weapons Specialist',
    cost: 3,
    prerequisite: 'None',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nFocus Breaker. You become Trained with Martial weapons.',
  },
  {
    id: 'moderately-armor',
    name: 'Moderately Armor',
    cost: 1,
    prerequisite: 'Proficiency in Light Armor',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nArmor Training. You become Trained with Medium armor.',
  },
  {
    id: 'medium-armor-specialist',
    name: 'Medium Armor Specialist',
    cost: 3,
    prerequisite: 'Level 4+, Proficiency in Medium Armor',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nDexterous Wear. While you're wearing Medium armor, you can treat its Attribute Cap as being 1 higher..",
  },
  {
    id: 'mounted-combatant',
    name: 'Mounted Combatant',
    cost: 7,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might, Instinct, or Focus Score by 1, to a maximum of 30.\n\nMounted Strike. While mounted, you have Advantage on attack rolls against any unmounted creature within 5 feet of your mount that is at least one size smaller than the mount.\n\nLeap Aside. If your mount is subjected to an effect that allows it to make a Body saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw and only half damage if it fails. For your mount to gain this benefit, you must be riding it, and neither of you can have the Incapacitated condition.\n\nVeer. While mounted, you can force an attack that hits your mount to hit you instead if you don't have the Incapacitated condition.",
  },
  {
    id: 'mystrium-conflux',
    name: 'Mystrium Conflux',
    cost: 4,
    prerequisite: 'None',
    description:
      'You possess an intuitive understanding of the way magic ebbs and flows within enchanted items. Such items attune easily to you, and you are able to sound out their secrets. You gain the following benefits:\n\n    You can attune to up to four magic items at once.\n\n    You can cast the Identify Artes without expending Aether or components. You must finish a Full Rest before you can do so again.',
  },
  {
    id: 'observant',
    name: 'Observant',
    cost: 3,
    prerequisite: 'Focus 12+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus or Resonance Score by 1, to a maximum of 30.\n\nKeen Eyes. Choose one of the following skills: Intuition, Investigation, or Perception. If you lack proficiency with the chosen skill, you gain proficiency in it, and if you already have proficiency in it, you gain Expertise in it.\n\nQuick Search. You can take the Search action as a Quick Action.',
  },
  {
    id: 'piercing-strike',
    name: 'Piercing Strike',
    cost: 5,
    prerequisite: 'Might or Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nPuncture. Once per turn, when you hit a creature with an attack that deals Piercing damage, you can reroll one of the attack's damage dice, and you must use the new roll.\n\nPiercing Critical. When you score a Critical Hit that deals Piercing damage to a creature, you can roll one additional damage die when determining the extra Piercing damage the target takes.",
  },
  {
    id: 'poisoner',
    name: 'Poisoner',
    cost: 6,
    prerequisite: 'Focus 12+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct or Focus Score by 1, to a maximum of 30.\n\nPotent Poison. When you make a damage roll that deals Poison damage, it ignores Resistance to Poison damage.\n\nBrew Poison. You gain proficiency with the Poisoner's Kit. With 1 hour of work using such a kit and expending 50 GP worth of materials, you can create a number of poison doses equal to your Proficiency Bonus. As a Quick Action, you can apply a poison dose to a weapon or piece of ammunition. Once applied, the poison retains its potency for 1 minute or until you deal damage with the poisoned item, whichever is shorter. When a creature takes damage from the poisoned item, that creature must succeed on a Constitution saving throw (DC = 8 + your Proficiency Bonus + the modifier of the ability increased by this Discipline) or take 2d8 Poison damage and have the Poisoned condition until the end of your next turn.",
  },
  {
    id: 'polearm-specialist',
    name: 'Polearm Specialist',
    cost: 5,
    prerequisite: 'Level 4+, Might or Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nHaft Off-Strike. Immediately after you take the Attack action and attack with a Quarterstaff, a Spear, or a weapon that has the Heavy and Reach properties, you can use a Quick Action to make a melee attack with the opposite end of the weapon. The weapon deals Bludgeoning damage, and the weapon's damage die for this attack is a d4.\n\nLine In The Sand. While you're holding a Quarterstaff, a Spear, or a weapon that has the Heavy and Reach properties, you can take a Reaction to make one melee attack against a creature that enters the reach you have with that weapon.",
  },
  {
    id: 'prodigy',
    name: 'Prodigy',
    cost: 4,
    prerequisite: 'None',
    description:
      "You have a knack for learning new things. You gain the following benefits:\n\n    You gain one Skill Proficiency of your choice, one Tool Proficiency of your choice, and fluency in one Language of your choice.\n\n    Choose one skill in which you have Proficiency. You gain Expertise with that skill, which means your Proficiency Bonus is doubled for any ability check you make with it. The skill you choose must be one that isn't already benefiting from a feature, such as Expertise, that doubles your Proficiency Bonus.",
  },
  {
    id: 'putrefy',
    name: 'Putrefy',
    cost: 3,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase one of your Attribute Scores by 1, to a maximum of 30.\n\nNecrosis. When you make a damage roll that deals Necrotic damage, you can cause one creature taking that damage to have the Poisoned condition until the start of your next turn. Once you use this benefit, you can't use it again until you finish a Quick or Full Rest.",
  },
  {
    id: 'rebuke',
    name: 'Rebuke',
    cost: 4,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase one of your Attribute Scores by 1, to a maximum of 30.\n\nNecrosis. When you make a damage roll that deals Radiant damage, you can cause one Huge or smaller creature taking the damage to have the Prone condition. Once you use this benefit, you can't use it again until you finish a Quick or Full Rest.",
  },
  {
    id: 'remarkable-recovery',
    name: 'Remarkable Recovery',
    cost: 6,
    prerequisite: 'None',
    description:
      'Your body has the ability to recover quickly from terrible injuries, and is unusually receptive to healing magic. You gain the following benefits:\n\n    Increase your Conviction Score by 1, to a maximum of 30.\n\n    When you are successfully stabilized while dying, you regain hit points equal to your Conviction Modifier (minimum of 1).\n\n    Whenever you regain hit points as a result of an Arte, potion, or class feature (but not this Discipline), you regain additional hit points equal to your Conviction Modifier (minimum of 1).',
  },
  {
    id: 'resilience',
    name: 'Resilience',
    cost: 4,
    prerequisite: 'Level 4+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase one of your Attribute Scores by 1, to a maximum of 30.\n\nSaving Throw Proficiency. You gain Saving Throw Proficiency in a Saving Throw you do not already Possess Proficiency in (Body, Mind, or Soul).\n\nRepeatable. You can take this Discipline more than once, but you must choose a different Saving Throw you don't already possess each time.",
  },
  {
    id: 'savage-strikes',
    name: 'Savage Strikes',
    cost: 2,
    prerequisite: 'Level 4+',
    description:
      "You've trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target.",
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    cost: 5,
    prerequisite: 'Level 4+, Might or Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nGuardian. Immediately after a creature within 5 feet of you takes the Disengage action or hits a target other than you with an attack, you can make an Opportunity Attack against that creature.\n\nHalt. When you hit a creature with an Opportunity Attack, the creature's Speed becomes 0 for the rest of the current turn.",
  },
  {
    id: 'shadow-touched',
    name: 'Shadow-Touched',
    cost: 5,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nShadow Magic. Choose one Tier-1 Arte from the Illusory or Necromancy Arte-Groups. You learn that Arte and the Invisibility Arte. You can cast each of these Artes without expending Aether. Once you cast either Arte in this way, you can't cast that Arte in this way again until you finish a Full Rest. You can also cast these Artes using Aether you have of the appropriate amount. The Artes' spellcasting ability is the ability increased by this Discipline.",
  },
  {
    id: 'shadow-hex-curse',
    name: 'Shadow-Hex Curse',
    cost: 3,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nMalison. You learn the Hex Arte. Conviction, Resonance, or Presence is your spellcasting ability for this Arte (choose when you select this Discipline). You can cast it once without using Aether, and you regain the ability to cast it in that way when you finish a Full Rest. You can also cast the Arte using any Aether you have.\n\nCurse Magic. When a creature that you've cursed with Hex hits you with an attack roll, the creature takes Psychic damage equal to your Proficiency Bonus. A creature takes this damage only once per turn.",
  },
  {
    id: 'distance-marksmen',
    name: 'Distance Marksmen',
    cost: 9,
    prerequisite: 'Proficiency in Munitions Weapons, Instinct 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct Score by 1, to a maximum of 30.\n\nCover Penetration. Your ranged attacks with weapons ignore Half Cover and Three-Quarters Cover.\n\nClose Quarters Shooting. Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with Ranged weapons.\n\nLong Shots. Attacking at long range doesn't impose Disadvantage on your Attack Rolls with Ranged weapons.",
  },
  {
    id: 'shield-master',
    name: 'Shield Master',
    cost: 5,
    prerequisite: 'Proficiency in Shields, Might 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might Score by 1, to a maximum of 30.\n\nShield Bash. If you attack a creature within 5 feet of you as part of the Attack action and hit with a Melee weapon, you can immediately bash the target with your Shield if it's equipped, forcing the target to make a Body Saving Throw (DC = 8 + your Proficiency Bonus + your Might Modifier). On a failed save, you either push the target 5 feet from you or cause it to have the Prone condition (your choice). You can use this benefit only once on each of your turns.\n\nInterpose Shield. If you're subjected to an effect that allows you to make a Body Saving Throw to take only half damage, you can take a Reaction to take no damage if you succeed on the saving throw and are holding a Shield.",
  },
  {
    id: 'talent-expert',
    name: 'Talent Expert',
    cost: 5,
    prerequisite: 'Level 4+, Focus 12+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase one of your Ability Scores by 1, to a maximum of 30.\n\nSkill Proficiency. You gain Proficiency in one skill of your choice.\n\nExpertise. Choose one skill in which you have Proficiency but lack Expertise. You gain Expertise with that skill.\n\nRepeatable. You can take this Discipline more than once, but you must choose different Skills you don't already possess each time.",
  },
  {
    id: 'skilled',
    name: 'Skilled',
    cost: 2,
    prerequisite: 'Focus 12+',
    description:
      "You gain the following benefits:\n\nSkill Proficiency. You gain Proficiency in any combination of three skills or tools of your choice.\n\nRepeatable. You can take this Discipline more than once, but you must choose different Skills or Tools you don't already possess each time.",
  },
  {
    id: 'shadow-skulker',
    name: 'Shadow Skulker',
    cost: 6,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct Score by 1, to a maximum of 30.\n\nBlindsight. You have Blindsight with a range of 10 feet.\n\nFog of War. You exploit the distractions of battle, gaining Advantage on any Stealth Check you make as part of the Hide action during combat.\n\nSniper. If you make an attack roll while hidden and the roll misses, making the attack roll doesn't reveal your location.",
  },
  {
    id: 'rending-slasher',
    name: 'Rending Slasher',
    cost: 4,
    prerequisite: 'Might or Instinct 13+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nHamstring. Once per turn when you hit a creature with an attack that deals Slashing damage, you can reduce the Speed of that creature by 10 feet until the start of your next turn.\n\nSlashing Critical. When you score a Critical Hit that deals Slashing damage to a creature, it has Disadvantage on attack rolls until the start of your next turn.',
  },
  {
    id: 'speedy',
    name: 'Speedy',
    cost: 5,
    prerequisite: 'Instinct or Conviction 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Instinct or Conviction Score by 1, to a maximum of 30.\n\nSpeedy Stride. Your Ground Speed increases by 10 feet.\n\nUnhindered Steps. When you take the Dash action on your turn, Difficult Terrain doesn't cost you extra movement for the rest of that turn.\n\nDistance Casting. Opportunity Attacks have Disadvantage against you.",
  },
  {
    id: 'spell-sniper',
    name: 'Spell Sniper',
    cost: 7,
    prerequisite: 'Ability to cast Artes',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nPenetrating Magicks. Your attack rolls for Artes ignore Half Cover and Three-Quarters Cover.\n\nClose Quarters Casting. Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with Artes.\n\nDistance Casting. When you cast a Artes that has a range of at least 10 feet and requires you to make an attack roll, you can increase the Arte's range by 60 feet.",
  },
  {
    id: 'street-justice',
    name: 'Street Justice',
    cost: 5,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nHeadlock. Your allies have Advantage on attack rolls against a creature Grappled by you.\n\nSturdy Knot. When you use Chain, Manacles, or Rope to bind a creature, add your Proficiency Bonus to the DC to escape or burst the Chain, Manacles, or Rope.\n\nTough Talk. A creature's Hostile attitude doesn't impose Disadvantage on your Intimidation Checks to influence that creature.",
  },
  {
    id: 'bar-brawler',
    name: 'Bar-Brawler',
    cost: 6,
    prerequisite: 'Might 12+',
    description:
      'You gain the following benefits:\n\nImproved Pugilism. When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to (1d4 + your Might Modifier) instead of the normal damage of an Unarmed Strike.\n\nBob & Weave. Whenever you roll a damage die for your Unarmed Strike, you can reroll the die if it rolls a 1, and you must use the new roll.\n\nImprovised Weaponry. You have proficiency with improvised weapons.\n\nPush. When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also push it 5 feet away from you. You can use this benefit only once per turn.',
  },
  {
    id: 'telekinetic',
    name: 'Telekinetic',
    cost: 6,
    prerequisite: 'Resonance 13+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nMinor Telekinesis. You learn the Manus Arte. You can cast it without Verbal or Somatic components, you can make the spectral hand Invisible, and its range and the distance it can be away from you both increase by 30 feet when you cast it. The Arte's spellcasting ability is the ability increased by this Discipline.\n\nTelekinetic Shove. As a Quick Action, you can telekinetically shove one creature you can see within 30 feet of yourself. When you do so, the target must succeed on a Body Saving Throw (DC = 8 + your Proficiency Bonus + the ability modifier of the score increased by this Discipline) or be moved 5 feet toward or away from you.",
  },
  {
    id: 'telepathic',
    name: 'Telepathic',
    cost: 6,
    prerequisite: 'Resonance 12+',
    description:
      "You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nTelepathic Utterance. You can speak telepathically to any creature you can see within 60 feet of yourself. Your telepathic utterances are in a language you know, and the creature understands you only if it knows that language. Your communication doesn't give the creature the ability to respond to you telepathically.\n\nMental Scan. You always have the Breach Mind Arte prepared. You can cast it without Aether or spell components, and you must finish a Full Rest before you can cast it in this way again. You can also cast it using Aether you have of the appropriate amount. Your spellcasting ability for the Arte is the ability increased by this Discipline.",
  },
  {
    id: 'thrown-arms-mastery',
    name: 'Thrown Arms Mastery',
    cost: 7,
    prerequisite: 'Instinct 12+',
    description:
      "You've honed your ability to lob weaponry into the fray, including weapons not meant for ranged combat. You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Instinct Score by 1, to a maximum of 30.\n\nMundane and Martial melee weapons without the thrown property have the thrown property for you. One-handed weapons have a normal range of 20 feet and a long range of 60 feet, while two-handed weapons have a normal range of 15 feet and a long range of 30 feet.\n\nWeapons that already have the thrown property increase their short range by 20 feet and their long range by 40 feet for you.\n\nWhen you miss with a thrown weapon attack using a light weapon, the weapon returns to your grasp like a boomerang at the end of your turn, unless something prevents it from returning. You can catch and stow as many weapons as you throw in this way.",
  },
  {
    id: 'tough',
    name: 'Tough',
    cost: 2,
    prerequisite: 'Conviction 13+',
    description:
      'Your Hit Point maximum increases by an amount equal to twice your character level when you gain this Discipline. Whenever you gain a character level thereafter, your Hit Point maximum increases by an additional 2 Hit Points.',
  },
  {
    id: 'treacherous-allure',
    name: 'Treacherous Allure',
    cost: 5,
    prerequisite: 'Presence 13+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nEnchanting Presence. You learn the Beguile Arte. You can cast it without Aether, and you must finish a Full Rest before you can cast it in this way again. You can also cast it using Aether you have of the appropriate amount. Your spellcasting ability for the Arte is the ability increased by this Discipline.\n\nInevitable Betrayal. You have Advantage on attack rolls against creatures with the Charmed condition.',
  },
  {
    id: 'vampire-hunter',
    name: 'Vampire Hunter',
    cost: 4,
    prerequisite: 'None',
    description:
      "You gain the following benefits:\n\nAdroit Escape. You have Advantage on checks to escape from nonmagical restraints or the Grappled condition.\n\nVitality Ward. When you take Necrotic damage, you can take a Reaction to mitigate the damage. Roll a number of d6s equal to your Proficiency Bonus, and add them together. Reduce the Necrotic damage you take by this total. Once you use this benefit, you can't use it again until you finish a Short or Long Rest.",
  },
  {
    id: 'vampire-touched',
    name: 'Vampire Touched',
    cost: 5,
    prerequisite: 'None',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nVampire Magic. Choose one Tier-1 Arte from the Compulsion or Illusion school. You learn that Arte and the Orient Anchor Arte. You can cast each of these Artes without expending Aether, but when you cast Orient Anchor this way, you must target yourself, and you must finish a Full Rest before you can cast each Arte in this way again. You can also cast either Arte using Aether you have of the appropriate amount. Your spellcasting ability for the Artes is the ability increased by this Discipline.',
  },
  {
    id: 'vampires-plaything',
    name: "Vampire's Plaything",
    cost: 4,
    prerequisite: 'Conviction 12+',
    description:
      'You gain the following benefits:\n\nDecanting. When you finish a Full Rest, you can create one Potion of Healing or an Antitoxin, as long as you have an empty vial or flask. These liquids evaporate when you finish another Full Rest.\n\nTimely Retreat. You can take a Quick Action to take the Dash action or the Disengage action. You can use this benefit a number of times equal to your Proficiency Bonus, and you recover all expended uses when you finish a Full Rest.\n\nVampiric Connection. The GM determines the fate of your former vampire master. While you and your former vampire master are on the same plane of existence, the vampire can communicate with you telepathically, and you can choose to allow the vampire to perceive through your senses.',
  },
  {
    id: 'vital-sacrifice',
    name: 'Vital Sacrifice',
    cost: 5,
    prerequisite: 'Level 4+, Conviction 12+',
    description:
      "You've learned secrets of hemocraft that grant you esoteric power at the price of your own life force. As a Quick Action, you can choose to take 1d6 necrotic damage to gain a Blood-Boon. Your blood boon lasts for 1 hour or until expended.\n\nYou can expend this blood boon to gain one of the following benefits:\n\nWhen you make an Attack Roll, you roll 1d6 and add it to the total.\n\nWhen you hit with an Attack or Arte, you deal an additional 2d6 necrotic damage.\n\nWhen you cause a creature to make a Body Saving Throw, roll a d4 and reduce their save by the amount rolled.\n\nThe damage you take to gain a blood boon can't be reduced in any way.",
  },
  {
    id: 'war-caster',
    name: 'War-Caster',
    cost: 6,
    prerequisite: 'Focus 12+',
    description:
      'You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction, Resonance, or Presence Score by 1, to a maximum of 30.\n\nConcentration. You have Advantage on Concentration Checks that you make to maintain Concentration.\n\nReactive Spell. When a creature provokes an Opportunity Attack from you by leaving your reach, you can take a Reaction to cast an Arte at the creature rather than making an Opportunity Attack. The Arte must have a casting time of Full Cast or Quick Cast and must target only that creature.\n\nSomatic Savant. You can perform the Somatic components of Artes even when you have weapons or a Shield in one or both hands.',
  },
  {
    id: 'beeline-blitz',
    name: 'Beeline Blitz',
    cost: 4,
    prerequisite: 'Instinct 13+',
    description:
      "Your agility and quick reflexes allow you to close the distance between you and ranged attackers while simultaneously dodging their attacks. When a creature makes a ranged attack against you, you can use your reaction to do the following:\n\nMove up to half your speed towards the attacker, this movement doesn't provoke opportunity attacks.\n\nGain the benefits of the Dodge action against ranged attacks until the start of your next turn.",
  },
  {
    id: 'weaponmaster-specialist',
    name: 'Weaponmaster Specialist',
    cost: 5,
    prerequisite: 'Level 4+, Might or Instinct 16+',
    description:
      "You have spent countless hours of focused training and study with a selected weapon. As you become one with this chosen weapon, you reach levels of deadly accuracy that few others could begin to fathom.\n\nAttribute Score Increase. You gain a +1 bonus to your primary combat ability score, to a maximum of 30.\n\nChoose one weapon to specialize in, if you are not already Trained with this weapon, you now become Trained with it.\n\nYour command over this weapon grants you a +1 bonus to the weapon's critical range (i.e. you score a Critical Hit on a 19 or 20).\n\nRepeatable. You can take this Discipline more than once, choosing to gain an additional +1 bonus to your chosen weapon's critical range, for a maximum bonus of +3 (i.e. you score a Critical Hit on a 17, 18, 19 or 20). Conversely, you can also pick this Discipline option again at higher levels, to gain training and a +1 bonus to critical range with a different weapon.",
  },
  {
    id: 'titanic-strength-combat-style',
    name: 'Titanic Strength Combat Style',
    cost: 8,
    prerequisite: 'Level 4+, Might +18',
    description:
      "Your ability to wield weapons normally has changed drastically, causing the following effects:\n\nWhen wielding a weapon, you are able to effectively wield even a two handed weapon with one hand.\n\nIf a weapon has the versatile property, the damage die is always the two-handed version.\n\nIf an attack made uses Might, it gains a +2 to the attack and damage rolls, deals an additional die of the weapon's damage, and its critical hit range is increased by 1.",
  },
  {
    id: 'unusually-nimble',
    name: 'Unusually Nimble',
    cost: 6,
    prerequisite: 'Instinct 16+',
    description:
      'You have trained to be quick on your feet. You gain the following benefits:\n\nAttribute Score Increase. Your Instinct Score increases by 2, to a maximum of 30.\n\nAll of your Movement Speeds increase by 10 feet.\n\nWhenever you take the Dodge action, you also gain the benefits of the Dash action.',
  },
  {
    id: 'archmage',
    name: 'Archmage',
    cost: 6,
    prerequisite: 'Level 10+, Ability to cast Artes',
    description:
      'You have mastered the finer points of magic and improved your abilities beyond the basic Spellcaster.\n\nAttribute Score Increase. Increase your Focus and Resonance score by 2, to a maximum of 30.\n\nYour Arte Save DC increases by +3\n\nYou learn one cantrip from the Arcane Spell List.\n\nThe gold and time you must spend to copy an Arte into your spell book is reduced to 40gp per Artes-Tier.',
  },
  {
    id: 'concentrated-mind',
    name: 'Concentrated Mind',
    cost: 4,
    prerequisite: 'Level 4+, Focus 14+',
    description:
      "Your mind is honed to a razor's edge, and your attention can be split between two areas. You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus, Resonance, or Presence Score by 1 point.\n\nWhile you have an Arte active that requires Concentration and are casting another Arte that requires concentration, you may use your Quick Action to maintain concentration on both Artes the turn you cast the Arte and each subsequent turn until one of the Arte's effects ends or Concentration is lost.",
  },
  {
    id: 'fight-back-fucker-fight-back',
    name: 'FIGHT BACK FUCKER! FIGHT BACK!',
    cost: 4,
    prerequisite: 'Level 4+',
    description:
      "You have learned to rally your allies in battle and coordinate a powerful group assault on your enemies. You've trained to transform the strikes of your allies and yourself into magical attacks and overwhelm your foes. When you take this discipline, you gain the following benefits:\n\nCoordinated Assault. As a Focused Action, you can command any number of willing creatures within your melee weapon range, including yourself, to strike a single enemy within their melee weapon range. Each creature makes a single melee weapon attack against the designated target. The attacks made as part of this coordinated assault are considered magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.\n\nOverwhelming Force. When a creature is hit by two or more attacks as part of the Coordinated Assault, it must make a Body Saving Throw (DC 8 + your Proficiency Bonus + your Presence Modifier). On a failed save, the creature is knocked prone by the sheer force of the combined strikes.\n\nAfter using Coordinated Assault, you must complete a Quick or Full Rest before you can use it again.",
  },
  {
    id: 'high-caliber-choreography',
    name: 'High-Caliber Choreography',
    cost: 7,
    prerequisite: 'Level 7+, Instinct 16+, Proficiency with Munitions',
    description:
      "You have honed your skills in the high-octane and unpredictable gun techniques inspired by cinematic gun-fu showdowns. This fighting style combines firearm proficiency with unorthodox movements, acrobatics, and creativity. You gain the following benefits:\n\nBulletstorm Ballet. When you take the Attack action on your turn and attack with a one handed firearm you are Trained with, you can choose to make an acrobatic or unorthodox attack. If you do so, you can use your Quick Action to perform an Acrobatics Check contested by the target's Acrobatics or Athletics Check. If you succeed, the target is off-balance and you gain Advantage on your next Attack Roll against that target before the end of your next turn.\n\nRicochet Rhapsody. When you are targeted by a ranged weapon attack and are wielding a one handed firearm you are Trained with, you can use your Reaction to attempt to evade the attack by adding a bonus equal to your Instinct Modifier (minimum of +1) to your AC. If the attack still hits, you take half as much damage from the attack instead of full. \n\nYou can use this feature a number of times equal to your Instinct Modifier (minimum of once), and you regain all expended uses when you finish a Full rest.\n\nFirearm Flourish. You can use your Might instead of Instinct for ranged weapon attacks and damage rolls when using a one handed firearm you are Trained with.",
  },
  {
    id: 'spear-dancer',
    name: 'Spear Dancer',
    cost: 6,
    prerequisite: 'Proficiency with Spears',
    description:
      "You've put a lot of time into mastering the spear and turned a fairly simple weapon style into a beautiful dance of death. As a result, you are more accurate and deadly, and able to hit foes farther away than normal. You gain the following benefits when using a weapon with the Spear-tag:\n\nYou gain a +1 bonus to attack rolls with the weapon.\n\nThe damage dice for spears increases by one size when you wield them(i.e. d6 to d8). (This benefit has no effect if another feature has already improved this weapon's damage die).\n\nAs a Quick Action, you may attempt one of the following advanced maneuvers while wielding a spear:\n\nYou shift your grip and can increase the range of the spear by 5 ft until the start of your next turn.\n\nYou thrust repeatedly against any target in melee range, causing 1d6 piercing damage, but also leaving yourself wide-open to attacks: all attacks have Advantage against you until your next turn starts.\n\nYou dance the spear around your opponent, tripping their stance and making them focus on your attacks first and foremost. While they remain within range and before your next turn starts, the next attack against them gains Advantage.\n\nYou spin your spear in a weaving flurry about your body, gaining +1 to your AC until your next turn starts. You cannot take any Reactions without ending the defensive swings.",
  },
  {
    id: 'arcane-librarian',
    name: 'Arcane Librarian',
    cost: 2,
    prerequisite: 'Focus 12+',
    description:
      "You have been trained in the preservation and creation of Arcane texts:\n\nAttribute Score Increase. Your Focus Score is increased by 1 to a maximum of 30.\n\nYou gain proficiency with Calligrapher's Supplies.\n\nYou gain the ability to cast Comprehend Languages once per Full Rest. Focus is your spellcasting ability for this Arte, and you cast them at their lowest possible tiers.",
  },
  {
    id: 'combat-reflexes',
    name: 'Combat Reflexes',
    cost: 6,
    prerequisite: 'Level 4+, Instinct 16+',
    description:
      'Your exceptional agility and battle experience have honed your reflexes:\n\nAttribute Score Increase. Your Instinct Score is increased by 2 to a maximum of 30.\n\nYou can take one additional Reaction each round.\n\nRepeatable. You can take this Discipline more than once, to a maximum of three times total.\n\nFont of Life\n(Prerequisites: Level 7+, Conviction 16+)\nBP Cost: \nYou become a spring of healing and life, and excel at keeping things alive. Life blossoms in your step, and death flees in your wake. Every time you cast a healing Arte, you roll a d10:\n\nIf you roll a 7 or higher, you do not expend the Aether used to cast the Arte.\n\nIf you roll a 3 or less, the Arte heals for the maximum amount at the Tier it was cast, and the Aether is expended as normal.\n\nOtherwise the Aether is expended as normal. Whenever there is an unconscious creature (with 0 Hit Points) within 60 feet of you, you can cast Word Of Restoration at Tier-1 without expending Aether targeting that creature. You may do this an amount of times equal to your Conviction Modifier. You recover all expended uses of this Technique after completing a Full Rest.\n\nCasting Word Of Restoration using this Technique does not activate a d10 roll as described above.',
  },
  {
    id: 'bonded-souls',
    name: 'Bonded Souls',
    cost: 4,
    prerequisite: 'None',
    description:
      'You have Soul Bonded with one of your allies. This means that your hit points are interchangeable. As a Quick Action on your turn, as long as you are 60 feet from your Bonded ally you can reduce your hit points by any amount from the hit points you have left, and your Bonded ally will gain the exact same amount of hit points, and they can do the same for you on their turn.\n\nAdditionally, if your Bonded takes damage from an attack, you can use your Reaction to take the damage instead and reduce the damage they take to 0 if they are within 60 feet of you. Your Bonded is able to do the same. If this ability is used, the resistances and vulnerabilities of the initial target are used for damage calculation.\n\nTo access this Discipline, another creature, usually another party member, must take this Discipline at the same time that you do. (If xp is uneven so that one character would get it first, then the higher level character can hold back on earning the effects of this Discipline until the lower level character gets it as well)',
  },
  {
    id: 'battle-iq',
    name: 'Battle IQ',
    cost: 5,
    prerequisite: 'Focus 12+',
    description:
      'Your knowledge of battle has made you well versed in enemy techniques. You gain the following:\n\nAttribute Score Increase. Your Focus Score increases by 2, to a maximum of 30.\n\nWhile not wearing armor, your AC equals (10 + your Instinct Modifier + your Focus modifier).\n\nYou can add your Focus Modifier, rather than your Instinct, to your AC while wearing Light Armor.',
  },
  {
    id: 'critical-speed',
    name: 'Critical Speed',
    cost: 7,
    prerequisite: 'Level 7+, Instinct 14+',
    description:
      "You move during combat with blinding and lethal speed. You gain the following benefits:\n\nWhile wearing Light or no armor, you gain a bonus of +2 to your AC.\n\nYou score critical hits with rolls of 19-20 with melee weapons that lack the heavy or two-handed property.\n\nWhen you succeed on a Body Saving Throw to halve the damage of an effect you'd be affected by, you take no damage on a success instead.",
  },
  {
    id: 'defender',
    name: 'Defender',
    cost: 5,
    prerequisite: 'Proficiency with Heavy Armor, Shields',
    description:
      "You can become a greater party tank for your allies. You gain the following benefits:\n\nYour Hit Point maximum increases by an amount equal to your current Character Level. Whenever you gain a level thereafter, your hit point maximum increases by an additional 1 Hit Point.\n\nAs a Focused Action, you can provide partial cover to one allied creature within 5 feet of you of the same size or smaller than you. That creature has partial cover as long as they remain within 5 feet of you or until the start of your next turn.\n\nUpon seeing another creature attack a creature within 5 feet of you, as a Reaction, you can interpose a weapon or shield between them and the attack, increasing the target of the attack's AC by (1 + the weapon's Magic bonus if applicable) if you use a weapon, or by the AC bonus of your shield if you use it. While the target's AC is increased this way, if you use your shield, you lose the shield's AC bonus until the start of your next turn. The target of the attack has their AC increased this way until its attacker ends its turn or the target of the attack moves more than 5 feet away from you.",
  },
  {
    id: 'dagger-savant',
    name: 'Dagger Savant',
    cost: 4,
    prerequisite: 'None',
    description:
      'Your skill with a dagger reaches far beyond what is attainable through simple training. The weapon is like an extension of your own body, your movements and abilities with such seeming like second nature to you even while others find them bewildering to behold.\n\nYou gain advantage on any Sleight of Hand Checks to conceal a dagger on your person.\n\nThe range of your thrown daggers increases to 40/80. Attacking at Long Range with a thrown dagger no longer imposed Disadvantage.\n\nYou now ignore half cover and three-quarters cover when you attack a target within the normal range of your thrown daggers. When another creature successfully hits you with a melee attack whilst you have a dagger equipped, you can use your Reaction to parry and thus reduce the damage by 1d8. You may use this feature again after finishing a Quick or Full Rest.',
  },
  {
    id: 'dagger-expert',
    name: 'Dagger Expert',
    cost: 5,
    prerequisite: 'Level 4+, Dagger Savant',
    description:
      'Your mastery over daggers and other similar light blades allow them to become truly deadly instruments in your hands.\n\nYou gain a +2 bonus to attack rolls you make with a dagger.\n\nYou gain a +2 bonus to AC while you are wielding a separate dagger in each hand.\n\nWhen you engage in two-weapon fighting, you can add your attribute modifier to the damage of the second attack you make with a dagger.',
  },
  {
    id: 'dagger-mastery',
    name: 'Dagger Mastery',
    cost: 7,
    prerequisite: 'Level 7+, Dagger Expert',
    description:
      "You wield the lightest blades with the deadliest skill. You gain the following benefits:\n\nWhen wielding a light weapon, you gain a +3 bonus to initiative.\n\nYour throwing range for daggers increases to 60/120.\n\nYou gain a bonus equal to your Instinct Modifier on any Sleight of Hand checks to conceal a dagger on your person.\n\nWhen you use the Attack Action and attack with a dagger, you can use a Quick Action to make two additional attacks with that weapon. You don't add your ability modifier to the damage of the bonus attacks, unless that modifier is negative.",
  },
  {
    id: 'grim-wardlord',
    name: 'Grim Wardlord',
    cost: 10,
    prerequisite: 'Ability to cast the Arte Ward Of Mortality',
    description:
      "You want to protect your friends from the final sleep, so you've studied a mix of Warding Magicks and Necromancy to secure their existence as best you can.\n\nWard Of Mortality's range is increased 120 feet.\n\nWard Of Mortality's Duration is increased to 12 hours.\n\nWhen you cast Ward Of Mortality, you may target a creature that is already affected by Ward Of Mortality, in this case only 1 activates and expires each time they take fatal damage. Additionally, you may be under the effects of multiple Ward Of Mortality, even if they weren't cast by you.\n\nWhile Ward Of Mortality is active, the target is resistant to Necrotic damage.\n\nWhen Ward Of Mortality activates to stop damage or instant death from an enemy, it deals 4d4 Necrotic damage to the enemy.\n\nWhen Ward Of Mortality activates, the target gains 1d4 temporary hit points. If it expires, they gain 2d4 temporary hit points.",
  },
  {
    id: 'halberdier',
    name: 'Halberdier',
    cost: 6,
    prerequisite: 'Proficiency with Halberds, Might 14+',
    description:
      "You've trained hard until your halberd has become an extension of your body. You gain the following benefits when fighting with the halberd:\n\nYou roll a 2d8, instead of 2d6, for damage rolls with the halberd.\n\nWhen you take the Shove action when wielding a halberd, you have Advantage on the Athletics Check.\n\nWhenever you hit a mounted creature with a halberd, on a hit, the creature is knocked prone. The attack is critical if that creature or its mount has taken the Dash action on the previous turn.\n\nWhen a creature provokes an opportunity attack from you, you can attempt to Shove that creature, instead of making an attack.",
  },
  {
    id: 'heros-heart',
    name: "Hero's Heart",
    cost: 6,
    prerequisite: 'Presence 12+',
    description:
      'You have the heart of a hero granting you the following benefits:\n\nAttribute Score Increase. You increase your Presence Score by 2, up to a maximum of 30\n\nYou have Advantage on Saving Throws against poisons, being poisoned, frightened, paralyzed, stunned, and petrified.\n\nIf an ally within your movement speed range is selected to be attacked, using your Reaction, you use a flash of speed to step in front of the attack, making the target of the attack yourself. Due to the speed of this sprint, it is treated as the Disengage Action. You can use this ability a number of times equal to your Presence Modifier (minimum of one). You regain expended uses after completion of a Quick Rest.',
  },
  {
    id: 'intuitive',
    name: 'Intuitive',
    cost: 7,
    prerequisite: 'Level 7+, Resonance 16+',
    description:
      'Glimpses of the future begin to press in on your awareness. You gain the following benefits:\n\nAttribute Score Increase. Increase your Focus or Resonance Score by 1, to a maximum of 30.\n\nWhen you finish a Full Rest, roll two d20s and record the numbers rolled. You can replace any attack roll, saving throw, or ability check made by you or a creature that you can see with one of these foretelling rolls. You must choose to do so before the roll, and you can replace a roll in this way only once per turn. Each foretelling roll can be used only once. When you finish a Full Rest, you lose any unused foretelling rolls.',
  },
  {
    id: 'intense-focus',
    name: 'Intense Focus',
    cost: 7,
    prerequisite: 'Level 7+, Ability to cast Artes',
    description:
      "Your trained mind allows you to push a spell beyond its limits, so long as you can maintain focus:\n\nAttribute Score Increase. Increase your Focus, Conviction, or Resonance Score by 2, to a maximum of 30.\n\nYou may focus on an additional Arte that requires Concentration while one is currently active. Your DC for making concentration checks increases by 2 when this is occurring. This effect applies to Concentrated Mind if you possess the Discipline, increasing by an additional +2 for each additional Arte you are currently concentrating on.\n\nYou may add your Proficiency Bonus to Saves made to maintain Concentration. Additionally, when an Arte you have Concentration on reaches its maximum duration, you may make a DC 12 Mind Saving Throw to maintain Concentration and extend that spell's duration. If the spell's maximum duration is greater than 1 hour, you make this saving throw every 30 minutes; otherwise, you make this saving throw at the beginning of each of your turns. The DC of this save increases by +2 each consecutive time you pass, and the Arte ends when either you fail this save, or the DC reaches 20. If you are forced to make a Check to maintain Concentration as a result of taking damage while concentrating on an Arte beyond its normal duration, you have Disadvantage on that Check.",
  },
  {
    id: 'aether-boost',
    name: 'Aether Boost',
    cost: 6,
    prerequisite: 'Level 4+',
    description:
      "You've begun to tap into your body's life energy, granting you the ability to weaponize it in short bursts of power, speed, or endurance. \n\nAttribute Score Increase. Increase your Conviction Score by 1, to a maximum of 30 \n\nYou may choose between one of the following types of Aether Boosts to learn:\n\nBurst of Strength. Whenever you make a melee attack or Ability check using Strength, you may expend one hit die to add half of your proficiency bonus (rounded up) to the result (minimum of 1) to your damage roll, accuracy check, or the Ability check roll. You may only use this once per round. Additionally, you may also expend a hit die to count as one size larger for the amount you can push, drag, and lift for the next minute.\n\nBurst of Speed. Whenever you make a Dexterity Ability check or saving throw, you may expend one hit die to add half of your proficiency bonus (rounded up) to the result (minimum of 1). You may only use this once per round. Additionally, you may gain a sudden burst of speed whenever initiative is rolled, allowing you to expend a hit die and add the result to your roll. Finally, once per round, you may gain a sudden burst of speed whenever you use your movement action, by expending a hit die, you may move in any direction by an amount equal to your proficiency bonus times 5.\n\nBurst of Endurance. Whenever you would be attacked by a creature you are aware of, you may expend a hit die brace for the incoming attack. Until the start of your next turn, you may add an amount equal to your proficiency bonus to any Strength, and Constitution saving throws and half of that amount (rounded up) to your AC. You may use this once per round. Additionally, as a reaction, whenever you take damage, you may expend one hit die (without any modifiers) and reduce your damage taken by that amount.\n\nRepeatable. You can take this Discipline more than once, to a maximum of three times total; learning a new Boost you don't already possess, and upon taking this Discipline a second time, you may expend a maximum of two hit dice instead of one when using any Aether Boost Technique.",
  },
  {
    id: 'mercy',
    name: 'Mercy',
    cost: 6,
    prerequisite: 'None',
    description:
      "You have a peaceful approach to combat. You gain the following benefits:\n\nWhen you make an attack that would've reduced a creature to 0 hit points, you can spare the target. When you do so, the targets attitude towards you becomes indifferent, if it was hostile and friendly, if it was indifferent, and you have advantage on all Presence Rolls or Checks you make towards it for the next 24 hours or until you or an ally take any hostile conduct towards it (like attacking it or others, at the DM's discretion).\n\nWhen you hit a creature with an attack, you can choose to subdue the creature instead of causing damage. When you do so, the creature is automatically grappled and you can try to shove the creature as part of the same action.\n\nYou can disarm a creature. You must make an attack roll contested by the target's Athletics Check or Acrobatics Check. If you win the contest, the attack causes no damage or other ill effect, but the target drops the item.",
  },
  {
    id: 'versatile-weapon-master',
    name: 'Versatile Weapon Master',
    cost: 8,
    prerequisite: 'Proficiency with Martial Weapons',
    description:
      "You master the use of versatile weapons. When you take the Attack action with wielding a versatile weapon, you can enter an offensive or defensive stance which lasts until the start of your next turn while the weapons in your hand and you aren't incapacitated:\n\nOffensive Stance. When you hit with an attack while wielding your weapon in two hands, you can use your Quick Action to immediately make one Off-Strike attack wielding the same weapon in one hand. When you miss an attack while wielding your weapon in one hand, the target takes damage equal to your Might or Instinct Modifier (your choice).\n\nDefensive Stance. For each attack you make while wielding your weapon in two hands, you gain a +1 to your AC until the start of your next turn. Your reach for attack made while wielding the weapon in one hand is 5 feet greater than normal.",
  },
  {
    id: 'gladiatorial-fighting',
    name: 'Gladiatorial Fighting',
    cost: 3,
    prerequisite: 'Presence 12+',
    description:
      'You are adept at the tricks and tactics commonly found in an arena. You gain the following benefits:\n\nYou can use a net to make melee weapon attacks. You can not attack with a net while it is restraining a target.\n\nNets you wield have a DC of (8 + your Proficiency Bonus + your Might or Instinct Modifier) and an AC equal to (10 + your Proficiency Bonus).\n\nOnce per turn, when you hit a creature that is Restrained, Prone, Blinded, or Frightened, you can add an additional 1d6 to the Damage roll.',
  },
  {
    id: 'spellbreaker-combat-style',
    name: 'Spellbreaker Combat Style',
    cost: 5,
    prerequisite: 'Resonance 12+, Arte Flourishing Combat Style or Arte Wielding Combat Style',
    description:
      "You have mastered the means to turn aside an Arte with just the weapon you wield. When you are targeted by an Arte or within the area of an Arte that is cast, you can use your Reaction to attempt to strike the Arte and disrupt it. You make an Attack Roll contested by the caster's Spell Save DC. On a success, the spell fails. You can successfully counter a spell this way twice, regaining expended uses of it when you complete a Full Rest.",
  },
  {
    id: 'whip-savant',
    name: 'Whip Savant',
    cost: 7,
    prerequisite: 'Proficiency with Whips',
    description:
      "You are adept at using whips in combat, gaining the following benefits:\n\nYou treat whips as though they have the light property.\n\nWhenever you deal damage to a creature with a whip attack, you can use a Quick Action to impose Disadvantage on that creature's next attack roll before your next turn.\n\nBefore you make an attack roll with a whip, you can choose to take a -5 penalty to the attack roll. If the attack hits, you disarm the target, forcing it to drop anything it is holding.",
  },
  {
    id: 'whip-mastery',
    name: 'Whip Mastery',
    cost: 6,
    prerequisite: 'Level 4+, Whip Savant',
    description:
      "Whips you wield are not just a weapon to you, but an extension of yourself. When you attack with a whip, it deals an additional 1d4 Slashing damage. You can use your whip to interact with objects with 15 feet of you as if you were using your hands.\n\nOnce per turn when you hit an enemy with a whip you can force them to make an Athletics or Acrobatics Check contested by the attack roll you hit them with. On a failure they suffer one of the following effects:\n\nYou trip the target, knocking them prone.\n\nYou force the target to drop one item of your choice that it's holding.\n\nYou wrap your whip around the target, preventing them from moving away from you. Until the start of your next turn, or until you attack with the whip again, the target cannot be moved away from you",
  },
  {
    id: 'oracle',
    name: 'Oracle',
    cost: 6,
    prerequisite: 'Resonance 14+',
    description:
      'You see minor glimpses of what is to come and how to twist fate.\n\nWhen you finish a Full Rest, roll a D20 and record the number rolled. You can replace any Attack Roll, Saving Throw, or Ability Check made by you or a creature that you can see with the foretold roll; you must choose to do so before the roll and must wait until the end of your next Full Rest to roll a new foretelling roll.\n\nAs a Reaction, choose one creature you can see and decide if they will have good or ill fortune. Until the start of your next turn, choose whether that creature has a d4 either added to or subtracted from all Ability Checks or Saving Throws that make.',
  },
  {
    id: 'false-prophet',
    name: 'False Prophet',
    cost: 5,
    prerequisite: 'Presence 14+',
    description:
      "Your words can carry heavy weight to those susceptible enough to your fraudulent ways. You can even be so convincing that fate itself twists to meet your false prophecies.\n\nYou gain proficiency in the Deception skill. If you are already proficient in the skill, you gain Expertise instead.\n\nYou learn the Distortion cantrip and can cast it without using components.\n\nAs an Action, you may choose one creature who can hear you and prophesize either good or bad fortunes. You make a Deception Check contested by the target's Intuition Check. You make your roll with Disadvantage if the target does not understand the language you speak your fortune in. If your check succeeds, your target is convinced by your words and treats the next Natural 1 that they roll as a Natural 20 if you predicted good fortunes or the next Natural 20 that they roll as a Natural 1 if you predicted bad fortunes. Whether or not the target is convinced, once you use this feature, you cannot use this again until you finish a Quick or Full Rest.",
  },
  {
    id: 'seekers-practice',
    name: "Seeker's Practice",
    cost: 5,
    prerequisite: 'Level 4+',
    description:
      'To be good is not good enough, you trained harder and that practice shows.\n\nChoose a skill that you are proficient with. You gain Expertise in that skill and the associated Attribute Score increases by 1.\n\nWhen you use the Ability Score chosen in the first part of this Discipline to make either an Ability Check or a Saving Throw you may choose to add a d4 bonus prior to making your roll. You may use this feature a number of times equal to your Proficiency Bonus, regaining all expended uses on the completion of a Full Rest.',
  },
  {
    id: 'seekers-quarry',
    name: "Seeker's Quarry",
    cost: 6,
    prerequisite: "Level 7+, Seeker's Practice",
    description:
      "No matter the odds, the gentle breath of fate can guide you to that which you seek.\n\nYou have Advantage on Investigation, Perception, and Survivalism Checks made to follow or track a creature.\n\nYou learn the Quarry Mark Arte and can cast it without Aether, and you must finish a Full Rest before you can cast it in this way again. You can also cast Quarry Mark using any Aether you have of the appropriate amount.\n\nBy spending 1 minute performing a magical ceremony (as if you were concentrating on an Arte) and naming a specific creature or object that is familiar to you, you learn its location and the distance and direction relative to you. This only gives you the creature or object's immediate location and will not show you if it has moved from that spot. If the creature or object you named is in a different form, such as being under the effects of a polymorph Arte, this Arte doesn't locate the target. You must complete a Rest before doing this ceremony again.",
  },
  {
    id: 'brutish-muscle',
    name: 'Brutish Muscle',
    cost: 5,
    prerequisite: 'Might 13+',
    description:
      'People are intimidated by the mere sight of your muscles. You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Presence score by 2, to a maximum of 30.\n\nWhenever you make an Intimidation Check, you gain a bonus to the roll equal to your Might Modifier.\n\nYou have Advantage on all melee weapon attacks against creatures that are Frightened of you.',
  },
  {
    id: 'boxer',
    name: 'Boxer',
    cost: 5,
    prerequisite: 'Might or Conviction 12+',
    description:
      'Your time spent getting punched in the face and punching other people in the face has hardened you. You gain the following benefits:\n\nAttribute Score Increase. Increase your Might or Conviction Score by 2, to a maximum of 30.\n\nYou have Resistance to non-magical Bludgeoning damage.\n\nWhen you score a critical hit with an unarmed strike to a creature you can force that creature to make a Body Saving Throw against a DC equal to (8 + your Proficiency Bonus + your Might Modifier) or be knocked prone.',
  },
  {
    id: 'bullseye',
    name: 'Bullseye',
    cost: 4,
    prerequisite: 'Instinct 12+',
    description:
      'Your skill and flair with thrown weapons fuels is fearsome. You gain the following benefits:\n\nIncrease your Instinct or Presence Score by 2, to a maximum of 30.\n\nYou gain proficiency in the Acrobatics or Performance skill.\n\nAs a Quick Action on your turn, you can attempt a DC 15 Performance check. On a success, you gain a bonus to all attack and damage rolls you make with Darts or thrown Daggers equal to your Presence Modifier until the end of your turn.',
  },
  {
    id: 'forceful-personality',
    name: 'Forceful Personality',
    cost: 6,
    prerequisite: 'Presence 14+',
    description:
      'You are incredibly difficult to magically control or influence. You gain the following benefits:\n\nIncrease your Focus and Presence Score by 2, to a maximum of 30.\n\nYou have Advantage on all Saving Throws you make against being Charmed, Frightened, or Possessed.\n\nWhen you succeed on a Saving Throw against being Charmed, Frightened, or Possessed by a creature, you can use your Reaction to deal Psychic damage to the creature equal to (Your Proficiency Bonus + Focus or Presence Modifier)',
  },
  {
    id: 'healing-factor',
    name: 'Healing Factor',
    cost: 6,
    prerequisite: 'Conviction 14+',
    description:
      "You're difficult to put down, bouncing back from injuries faster than most. You gain the following benefits:\n\nAttribute Score Increase. Increase your Conviction Score by 2, to a maximum of 30.\n\nYour maximum number of Hit Dice increases by a number equal to your Conviction Modifier. This does not increase your maximum hit points.\n\nAs a Focused Action, you can expend a number of Hit Dice equal to your Proficiency Bonus and regain Hit Points as if you were taking a Quick Rest. Once you do this, you can not do so again until you complete a Full Rest.",
  },
  {
    id: 'master-of-arms',
    name: 'Master Of Arms',
    cost: 5,
    prerequisite: 'Level 4+',
    description:
      'Your skill with a variety of weapons makes you excel at training and rallying others. You gain the following benefits:\n\nAttribute Score Increase. Increase your Might, Instinct, Focus, or Presence Score by 1, to a maximum of 30.\n\nAs a Quick Action on your turn, you can rally your allies to attack. All creatures of your choice within 30 feet of you that can see or hear. They gain Advantage on all weapon attacks they make before the end of your next turn. Once you use this ability, you can not use it again until you complete a Quick or Full Rest.\n\nOver the course of an hour, you can instruct a number of creatures equal to your level in the use of a simple weapon which you are proficient with. At the end of that hour, all creatures you instructed gain proficiency with that weapon. For the next 24 hours, whenever that creature makes an attack with that weapon, they may use your Proficiency Bonus in place of their own.',
  },
  {
    id: 'shyifter-humanoid',
    name: 'Shyifter (Humanoid)',
    cost: 10,
    prerequisite: 'Presence 12+',
    description:
      "Through one means or another, you've the abilities of a Shyifter, a rare kind of individual able to change their physical appearance at-will. \n\nAttribute Score Increase. Increase your Presence Score by 2, to a maximum of 30.\n\nUsing a Quick Action, a number of times equal to your Presence Modifier, you can Shyft for the next 4 hours; becoming one size-class smaller or larger relative to your true form, can change your hair, eye, or skin color, and other similar characteristics, but retain your original Movements, Attribute Scores, Talents, Proficiencies, and Saving Throws. You do not gain additional racial features as a result of adopting the form of another race. You can revert back to your true form with a Quick Action, and regain all expended uses on the completion of a Full Rest.\n\nWhile Shyifted, you gain Advantage on Deception, Intimidation, Persuasion, and Performance Checks made against a creature unaware of your Shyift.",
  },
  {
    id: 'shyifter-beast',
    name: 'Shyifter (Beast)',
    cost: 10,
    prerequisite: 'Presence 12+',
    description:
      "Through one means or another, you've the abilities of a Shyifter, a rare kind of individual able to change their physical appearance at-will. \n\nAttribute Score Increase. Increase your Presence Score by 2, to a maximum of 30.\n\nUsing a Quick Action, a number of times equal to your Presence Modifier, you can Shyft for the next 4 hours, becoming one size-class smaller or larger relative to your true form, as you become a chosen creature with the Beast-Tag (selected upon taking this Discipline). The chosen creature can not be changed once selected, but its hair, eye, skin or pelt color, and other similar characteristics can. You retain your original Movements, Attribute Scores, Talents, Proficiencies, and Saving Throws. You gain additional traits and features as a result of adopting the chosen form. You can revert back to your true form with a Quick Action, and regain all expended uses on the completion of a Full Rest.",
  },
];
