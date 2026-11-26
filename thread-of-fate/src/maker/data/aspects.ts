import type { AspectDef } from '@/maker/types';

/**
 * Aspects (chosen at level 3, gaining features at 3/7/10/15/20), transcribed from
 * "Convergence Aspect Listing.md". Organized by role section.
 *
 * STATUS: Tank role complete (Bulwark, Templar, Graveguard, Warlord). The remaining
 * Tank aspects (Barbarian, ...) and the other seven roles' aspects are being imported
 * in subsequent passes, the Aspect step is data-driven, so this is purely data entry.
 */
export const ASPECTS: AspectDef[] = [
  {
    id: 'tank-bulwark',
    name: 'Bulwark',
    role: 'tank',
    availableTo: ['Tank', 'Bruiser', 'Scout'],
    prerequisite: 'Requires Proficiency with Shields, 14 Conviction',
    flavor:
      'Since the dawn of mortal-kind, walls have kept homes warm and cities safe. When that safety is threatened by a far-off foe, the wall is sent to halt the advance. In the midst of warfare, there is no greater asset than a Bulwark between you and your imminent death.',
    features: [
      {
        level: 3,
        name: 'Palisade',
        quote: '"Be The Wall Against Which The Siege Breaks.", Tiberius, 27th Lion of Fallstar',
        description:
          "When calculating your Armor Class, you may use your Might modifier instead of your Instinct modifier; while doing so, treat any worn armor's Attribute Cap as 1 higher. While you wield a shield you can add your Proficiency Bonus to your AC.",
      },
      {
        level: 3,
        name: 'Rampart',
        quote:
          '"Let Your Steel Bash Their Blood And Bone.", Requiem Fallstar, First Emperor of The Fallstar Imperium',
        description:
          'You may make an Off-Strike with a shield as if proficient, using Might for Attack and Damage. Once per turn, when a melee attack misses you, make a shield attack without a Reaction. A shield without stated damage deals 1d4 Bludgeoning.',
      },
      {
        level: 7,
        name: 'Against The Grain',
        quote:
          '"Between the volley of fire and the lives of the innocent, there is only you.", Verse 13:2 of The Knights of Avalon',
        description:
          'Once per turn, when an ally within 15 ft. is targeted by an attack, without a Reaction you push them 5 ft. aside and take their place, becoming the target.',
      },
      {
        level: 10,
        name: 'Force of Will',
        quote:
          '"It Is Only Failure When You Give Up.", Cain Hawthornell, The Skeleton King of Omen',
        description:
          'Once per Full Rest, when you start your turn at 0 HP, gain a level of Fatigued to rise again with HP equal to twice your Might Modifier.',
      },
      {
        level: 15,
        name: 'Let The Storm Come',
        quote:
          '"The needs of the many were met, at the price of the few.", A Brief History of Vigilo',
        description:
          'A number of times equal to your Proficiency Bonus, when a ranged attack hits allies within 60 ft., Reaction: take all that damage yourself. Recharges on a Quick Rest.',
      },
      {
        level: 20,
        name: 'Standfast',
        quote:
          '"Let my weapons and armor become symbols of peace and hope.", Alastor, Prince of The Dawn',
        description:
          'Use Force of Will 3 times per Full Rest; when used, each ally within 150 ft. who can see you heals (Proficiency Bonus + Might + Presence) HP.',
      },
      {
        level: 20,
        name: 'Past This Line',
        quote:
          '"I am the Shield, the Palisade, the Aegis. And I will not fall.", Unknown AEGIS unit, The Battle of Catharsis',
        description:
          'Once per Full Rest (Focused Action), for 1 minute grant allies within 60 ft. AC & temp HP (behind you) or to-hit & damage (ahead of you) equal to your Might Modifier; use Against The Grain unlimited within range; Force of Will heals to full; shield attacks force a Body Save or knock prone.',
      },
    ],
  },
  {
    id: 'tank-templar',
    name: 'Templar',
    role: 'tank',
    availableTo: ['Tank', 'Coordinator', 'Healer'],
    prerequisite: 'Requires at least 12 Resonance, 14 Conviction',
    flavor:
      'Faith, Devotion, and Martyrdom lie at the core of every Templar. Faith in what they believe, devotion to their cause and those around them, and, when the time comes, paying the ultimate price for something greater than themselves.',
    features: [
      {
        level: 3,
        name: 'Benediction',
        quote:
          '"What matters now is that the banner is in your hands. Make it count.", Zuro, Third God of Health',
        description:
          'Gain Purity Points equal to (Templar level + Proficiency Bonus), restored on a Full Rest. Purity Save DC = (6 + PB + Conviction + Resonance). Spend on Cleansing Guard (Reaction, 2 PP: reduce damage 1d8/PP and cleanse a minor condition) and Sanctity (Focused Action, 1 PP: a 10-ft ward granting +PB to AC and saves vs conditions).',
      },
      {
        level: 3,
        name: 'Zealot',
        quote:
          '"Faith is all we have, and that is enough.", Commander Heimlarck, First Siege of Fallstar',
        description:
          'When calculating Armor Class, add a bonus equal to half your Resonance Modifier.',
      },
      {
        level: 7,
        name: 'Blessed Blade',
        quote: '"The goal is to make your enemies martyrs first.", The History of Gods, Book 1',
        description:
          'On a successful unarmed or weapon strike, deal additional Radiant damage equal to your Proficiency Bonus; you may expend Purity Points to add +1d8 each.',
      },
      {
        level: 10,
        name: 'Call to Arms',
        quote:
          '"When the bell tolls for a thirteenth time, the people answer.", The Book of Klaus Kane, Verse 7:2',
        description:
          'Focused Action, 6 Purity: allies within 30 ft. heal (PB + Resonance + Conviction); enemies make a Body Save vs your Purity DC or are Deafened 1 min and take (PB + Resonance) Thunder (half, no deafen on success).',
      },
      {
        level: 15,
        name: 'Burning Sigil',
        quote: '"Burn The Icons of Your Enemy.", Godbreaker Cornalian Vailauri',
        description:
          'Once per Full Rest (Quick Action): mark a recently hit target. For 10 minutes your attacks inflict Burning (1d12 fire instead of 1d8), adding a die (max your PB) and refreshing on each hit; their aura-like effects are negated while Burning.',
      },
      {
        level: 20,
        name: 'Final Oath',
        quote:
          '"In The Fire of War, You Will Be Reborn...", Rhamurilk Turkesh, Fourth Prince of The Scarlet King',
        description:
          'Upon your death, enemies within 100 ft. take (PB x Resonance x Might) True damage and those who see you are Blinded until the end of their next turn.',
      },
      {
        level: 20,
        name: 'Threefold Vow',
        quote: '"Faith, Devotion, and Martyrdom.", The Templar\'s Vow',
        description:
          'Using any Purity ability on an ally grants them Blessed Blade until end of their next turn; the range of Cleansing Guard, Sanctity, and Call to Arms doubles; Blessed Blade deals 3d8/PP and Burning Sigil deals 3d12.',
      },
    ],
  },
  {
    id: 'tank-graveguard',
    name: 'Graveguard',
    role: 'tank',
    availableTo: ['Tank', 'Bruiser', 'Caster'],
    prerequisite: 'Requires Proficiency with Occultism',
    flavor:
      'Graves are hollow and the dead walk once more, but a chosen few retain their minds. Having touched the other side, they gained abilities most consider heretical. In the thin line between life and death stands the Graveguard, ever at the gates of the great beyond.',
    features: [
      {
        level: 3,
        name: 'Not Quite Dead',
        quote:
          '"...the dead tore themselves from their slumber, yearning for the flesh that they had lost.", Explorer\'s Guide to Sungkili',
        description:
          "You and allies within 30 ft. aren't auto-attacked by weaker undead. Gain +1 Aether now and every other Aspect level; if not a caster you become a Low-Caster using Presence, gaining the Eldritch list + Hexcraft School (2 cantrips, 3 Tier-1; +1 spell per Aspect level; +cantrips at 7/10/15/20).",
      },
      {
        level: 3,
        name: 'Not Quite Alive',
        quote: '"...the common prejudice still remains outside of city centers.", The Nightly Star',
        description:
          'You no longer need to eat, drink, sleep, or breathe (but must eat your weight in raw humanoid flesh monthly). Resistance to Necrotic, Immunity to Poison/Poisoned, Vulnerable to Radiant. Gain an Exhaustion Buffer of 2 points.',
      },
      {
        level: 7,
        name: 'Nail In The Coffin',
        quote: '"RISE, MY FLESHMOUND!", Specter Nekros Corpus, Third God of Death',
        description:
          'A number of times equal to your PB per Full Rest, when you slay a non-undead with PB <= yours, raise it as a mindless servant under your command. No limit on the number controlled; command as a Quick Action.',
      },
      {
        level: 10,
        name: 'The Other Side',
        quote: '"Remember... you are born to die...", The Book of True Death',
        description:
          'Gain two Necromancy Cantrips and the Artes Six Feet Down (Tier 2, rot DoT on a failed Mind Save) and Borrowed Time (Tier 4, make an ally count as undead for 1 day).',
      },
      {
        level: 15,
        name: 'The Walking Undead',
        quote: '"When facing the undead, always go for the head.", Memoir of The Hunter',
        description:
          'Freely remove/reattach limbs and control them remotely up to 300 ft. (blindsight 10 ft., your speeds except Fly); replace limbs from corpses; add your PB to rolled HP gained on level up.',
      },
      {
        level: 20,
        name: 'The Dead Rising',
        quote: '"No necromancer is more feared than Specter.", The Magnus Arcanic',
        description:
          'Immunity to Necrotic; on a rest gain temp HP equal to your enthralled undead count. Action: explode an enthralled undead (30-ft Body Save vs your Black Artes DC for half its max HP as Necrotic; you heal half if in range).',
      },
      {
        level: 20,
        name: 'Profane Host',
        quote: '"Death will take your breath, but never your will.", Archlich Glanganar',
        description:
          'Radiate a 60-ft aura granting allies Immunity to Necrotic/Poison and +Presence AC; hostiles within become Vulnerable to Radiant and have Disadvantage on Body Saves.',
      },
    ],
  },
  {
    id: 'tank-warlord',
    name: 'Warlord',
    role: 'tank',
    availableTo: ['Tank', 'Controller', 'Coordinator'],
    prerequisite: 'Requires Proficiency with Leadership, 15 Conviction',
    flavor:
      'A commander who bends the battlefield, and those upon it, to their will, leading from the front and turning the tide through sheer force of command.',
    features: [
      {
        level: 3,
        name: 'Imperium Eternal',
        quote:
          '"There is an order to this realm. With you in chains and me, a God, above.", Grant Dawnshield, Emperor of Erebus',
        description:
          'Against a higher-level/PB enemy, add half the difference (round up) to your AC. A number of times equal to your PB, heal (Might + Proficiency) as a Quick Action; recharges on a Quick Rest.',
      },
      {
        level: 3,
        name: 'Song of War',
        quote:
          '"There are only two types of people: the fearful and the dead.", Requiem Fallstar, First Emperor of Fallstar',
        description:
          'Advantage on Saves vs Frightened/Charmed and on Mind Saves. Hostiles within 10 ft. have Disadvantage attacking anyone but you.',
      },
      {
        level: 7,
        name: 'Blaze of Glory',
        quote: '"Quiet life, or blaze of glory?", Unknown',
        description:
          'When struck by two consecutive attacks, regain 2 Action Points and immediately take the Attack Action. Uses equal to half your PB (round down), restored on a Quick Rest.',
      },
      {
        level: 10,
        name: 'Lead From The Front',
        quote: '"The Jarl\'s hand held the sigil high in his death grip.", The Story of Harlgard',
        description:
          "When an ally within 50 ft. fails a d20 roll, spend a Stamina Point to let them reroll with Advantage; or impose Disadvantage on an enemy's successful roll.",
      },
      {
        level: 15,
        name: 'Bend To My Will',
        quote: '"The Hero Decides The History.", Faust Fallstar, First Emperor of the New Imperium',
        description:
          'In Mass Combat, units under your command gain (Proficiency + Might) to-hit and AC. You may coup de grace a prone enemy commander below 10% max HP.',
      },
      {
        level: 20,
        name: 'Warpath',
        quote:
          '"War is a good thing! ...cut them out before they overgrow those who actually matter.", The Caretaker',
        description:
          'In combat, as a free action on your turn, give your Action Points to party members within 90 ft. (split as you choose; deafened creatures unaffected).',
      },
      {
        level: 20,
        name: 'The First Horseman',
        quote: '"...he rode out as a conqueror bent on conquest.", Unknown',
        description:
          'Against numerically superior forces, your party gains +PB AC and (Might + Proficiency) temp HP at combat start. You and allies have Advantage on attacks within 30 ft. and immunity to Frightened/Charmed/Paralyzed; enemies within 60 ft. have Disadvantage on Body & Mind Saves.',
      },
    ],
  },
  {
    id: 'tank-barbarian',
    name: 'Barbarian',
    role: 'tank',
    availableTo: ['Tank', 'Bruiser'],
    prerequisite: 'Requires at least 13 Might, 15 Conviction',
    flavor:
      'Fueled by frenzy and bloodlust, these titans charge through enemy ranks with maddened glee. Barbarians embody the spirit of rage, channeling it like a force of nature to overwhelm foes with impossible strength and persistence.',
    features: [
      {
        level: 3,
        name: 'Raging Warrior',
        description:
          'Quick Action: enter a Rage (Enraged for 1 min), be willing on chosen effects, Advantage on Might checks & Body Saves, +PB weapon damage on hits, and resistance to a chosen physical damage type. Uses equal to your Proficiency Bonus per Full Rest.',
      },
      {
        level: 3,
        name: 'Offense Is The Best Defense',
        description:
          'While wearing no armor, add your Might Modifier to AC in addition to your Instinct Modifier (shields still apply).',
      },
      {
        level: 7,
        name: 'Brutality',
        description:
          'Critical hits deal triple damage instead of double, and inflict a stack of Bleed for 1 minute (or until an Action tends the wound).',
      },
      {
        level: 10,
        name: 'Raging Endurance',
        description:
          'While Enraged, if you drop to 0 HP without dying, make a DC 10 Body Save to drop to 1 HP instead. DC +5 each use, resetting on a Full Rest.',
      },
      {
        level: 15,
        name: 'Furious Might',
        description:
          'If a Might check total is lower than your Might score, you may use your Might score in place of the result.',
      },
      {
        level: 20,
        name: 'Greater Brutality',
        description:
          'Crits deal quadruple damage and inflict two Bleed stacks + one Sluggish for 1 minute.',
      },
      {
        level: 20,
        name: 'Champion of Rage',
        description:
          'Might score +5 (raising your max if needed). While Enraged, gain Resistance to all damage and Immunity to your chosen damage type.',
      },
    ],
  },
  {
    id: 'tank-black-bullet',
    name: 'Black Bullet',
    role: 'tank',
    availableTo: ['Tank', 'Blaster', 'Coordinator'],
    prerequisite: 'Requires at least 14 Instinct, Proficiency with Combat Blades & Firearms',
    flavor:
      'The Black Trigger takes the best of the sword and the gun and merges them into a single seamless weapon of war, the Bulletblade. Up close or at a distance, the Black Bullet meets each challenge with a roll of the cylinder.',
    features: [
      {
        level: 3,
        name: 'Tool of War',
        quote: '"I thought I\'d make you something special!", Nergal, to Mars Veteo',
        description:
          "Over an hour with smith's tools, convert a Combat Blade or Firearm into a Bulletblade (Weighty: non-Black-Triggers can't add proficiency to attacks with it).",
      },
      {
        level: 3,
        name: 'Bulletblade Artes',
        description:
          'Maintain Cartridges equal to (PB + Focus), restored on a Full Rest (half on Quick Rest). Black Trigger Save DC = 6 + PB + Focus + Might. Start with Gunner Shot (90 ft. d10 Thunder, scaling), Burst Strike (2d8 fire + prone on a melee hit), and Heart of Stone (Reaction: reduce damage 1d8 + Conviction). Firing a cartridge grants 5 temp HP.',
      },
      {
        level: 7,
        name: 'Double-Tap',
        quote: '"It has two barrels for a reason!", Zoli Blackblade',
        description:
          'On a melee hit, fire a cartridge (Quick Action) to force a Body Save: Abdomen Tear (Disadvantage on next Body Save), Eye Gouge (Blinded), or Jugular Rip (no verbal Artes) until end of your next turn.',
      },
      {
        level: 10,
        name: 'Expanded Arsenal',
        quote: '"Bring a bigger gun...", Maxwell Luxford',
        description:
          "Learn a number of new Bulletblade Artes equal to your Focus Modifier: Blasting Zone (30-ft cone), Rough Divide (30-ft mobility), Fated Circle (15-ft burst + push), Royal Guard (ward an ally, split their damage), Cylinder Salvo (extra Gunner Shots), Hunter's Brand (mark for bonus damage), Bonfire's Rest (regen 1d4/turn).",
      },
      {
        level: 15,
        name: 'Bombardment',
        quote: '"Here comes the good part!", Anura',
        description:
          'Use Burst Strike, Blasting Zone, or Double-Tap with your Gunner Shot as though attacking in melee range.',
      },
      {
        level: 20,
        name: 'Rapid Reload',
        quote: '"Think they\'ll stop shootin\' long enough for us to shoot back?", Ace Casino',
        description:
          'Gain Proficiency (or Expertise) in Sleight of Hand. Quick Action: recover half your max cartridges, once per Full Rest.',
      },
      {
        level: 20,
        name: "Deadman's Stand",
        quote: '"It only ends when you stop getting up...", Balmung',
        description:
          'When reduced to 0 HP without dying, fire a cartridge to drop to 1 instead with resistance to all damage until your next turn. While you have temp HP, gain AC equal to your Focus Modifier.',
      },
    ],
  },
  {
    id: 'bruiser-druid',
    name: 'Druid',
    role: 'bruiser',
    availableTo: ['Bruiser', 'Caster', 'Scout'],
    prerequisite: 'Requires Expertise with Naturalism, Proficiency with Animal Magnetism',
    flavor:
      'A wielder of the magic of the land, speaking the tongue of beasts, calling fey companions, and taking the shapes of the wild.',
    features: [
      {
        level: 3,
        name: 'Tongue of the Land',
        description:
          'You learn Druidic; by speaking it you can convey simple ideas to Beast-tag creatures.',
      },
      {
        level: 3,
        name: 'The Magic of the Land',
        description:
          'Gain +1 Aether now and each Aspect level. If not a caster, become a Mid-Caster using Conviction; gain the Divine list + Shapechanging group (2 cantrips, (Conviction+1) Tier-1 Artes). Druidic Artes Attack = PB + Conviction + Focus; Save DC = 6 + PB + Conviction + Resonance. Use a Totem or wooden wand/rod/staff as a focus.',
      },
      {
        level: 3,
        name: 'Primal Companion',
        description:
          'Once per Full Rest, cast Call Familiar as a Full Cast; the familiar is a Fey (not Beast) and lasts a number of hours equal to your Proficiency Bonus.',
      },
      {
        level: 7,
        name: 'Primal Shape',
        description:
          "Focused Action, 1 Aether: assume the form of a Beast you've seen (PB <= half yours), for hours equal to half your Aspect level. Uses equal to your Proficiency Bonus. You take the beast's statistics but keep your mind, PB, and mental scores; can't cast Artes; gain its Ground/Climb speeds.",
      },
      {
        level: 10,
        name: 'Primal Shape Improvement',
        description: "You gain access to a creature's swim speed when you transform into it.",
      },
      {
        level: 10,
        name: 'Known To The Land',
        description:
          "Foraging an hour always yields a day's food/water for one. Add your Conviction Modifier to downtime training/crafting done immersed in nature.",
      },
      {
        level: 15,
        name: 'Primal Shape Improvement (Flight)',
        description: "You gain access to a creature's fly speed when you transform into it.",
      },
      {
        level: 15,
        name: "Sage's Lifeforce",
        description:
          'Your primal magic slows your aging: for every 10 years that pass, your body ages 1.',
      },
      {
        level: 20,
        name: 'Primal Mastery',
        description:
          "Gain all of a creature's speeds when transforming; use Primal Shape unlimited times (first use between rests costs no Aether); cast Artes while shaped; and transform into Plants (PB <= half yours).",
      },
    ],
  },
  {
    id: 'bruiser-martial-artist',
    name: 'Martial Artist',
    role: 'bruiser',
    availableTo: ['Bruiser', 'Tank', 'Scout'],
    prerequisite: 'Requires at least 12 Resonance, 13 Conviction',
    flavor:
      'A disciple of body and spirit who channels a mystical energy called Ki through unarmed and affixed strikes, flowing between elemental stances.',
    features: [
      {
        level: 3,
        name: 'Spiritual Defenses',
        description:
          'While wearing no armor and no shield, add your Resonance Modifier to your AC and all Saving Throws.',
      },
      {
        level: 3,
        name: 'Martial Arts',
        description:
          'Gain a Martial Arts die (d4, scaling d6/d8/d10/d12 at 7/10/15/20). Affixed/Natural weapons gain Finesse and may use the die; make a Natural-weapon Off-Strike even without Light. Gain Ki Points = (Aspect level + Resonance). Ki DC = 6 + PB + Resonance + Conviction. Stances: Fire (1 Ki: extra Off-Strike), Earth (1 Ki: Dodge for 1 less AP), Wind (1 Ki: Dash/Disengage for 1 less AP), Water (2 Ki: heal your Martial Arts die).',
      },
      {
        level: 7,
        name: 'Light On The Foot',
        description:
          'All your speeds +10 ft.; move along vertical surfaces and across liquids without falling (+5 more at 10/15/20).',
      },
      {
        level: 7,
        name: 'Resonant Strike',
        description:
          'On a weapon hit, spend 1 Ki, target makes a Soul Save vs your Ki DC or is Stunned until end of your next turn (or spend 5 Ki to Sever instead).',
      },
      {
        level: 10,
        name: 'Ki-Empowered Weapons',
        description:
          'Your Natural/Affixed weapons count as magical and add your Resonance Modifier to attack and damage rolls.',
      },
      {
        level: 10,
        name: "Wanderer's Tongue",
        description:
          'You understand all spoken languages, and any creature that understands a language can understand you.',
      },
      {
        level: 15,
        name: 'Eternal Meditation',
        description:
          'You no longer suffer the frailty of old age (or magical aging) and need no food or water.',
      },
      {
        level: 15,
        name: 'Empty Vessel',
        description:
          'Spend 5 Ki (Focused Action): become Invisible for 1 minute with Resistance to all damage but Force.',
      },
      {
        level: 20,
        name: 'Pure Body, Still Mind, Perfect Soul',
        description:
          'Immune to disease and poison; end a Charmed/Frightened/Taunted effect as a Focused Action; spend 1 Ki to reroll a failed save; and Body Saves for half damage instead take none on success, half on failure.',
      },
    ],
  },
  {
    id: 'bruiser-deathbringer',
    name: 'Deathbringer',
    role: 'bruiser',
    availableTo: ['Bruiser', 'Scout', 'Controller'],
    prerequisite: 'Requires Proficiency with Stealth, 16 Instinct',
    flavor:
      "Ghosts who strike, disappear, and strike again. When a Deathbringer falls, they ensure Hell isn't lonely.",
    features: [
      {
        level: 3,
        name: 'Bloodletter',
        quote: '"May your strikes be everlasting..."',
        description:
          'A physical strike inflicts Bleeding 1 minute (1d6 of the same type per stack); each strike adds a stack and resets the timer. Uses equal to your Proficiency Bonus.',
      },
      {
        level: 3,
        name: 'Reap What You Sow',
        quote: '"...and their death, violent.", The Horseman of Death',
        description:
          'Quick Action: become invisible in dim light/darkness; gain blindsense 60 ft. Focused Action: teleport 30 ft. (uses equal to your Instinct Modifier, recharge on a Quick Rest).',
      },
      {
        level: 7,
        name: 'Grim Harvest',
        quote: '"Scythes cull crops and souls just the same...", The Baron of Blood',
        description:
          'Attune a weapon: it deals +(PB)d10 Necrotic, can be summoned from any realm for no action and counts as magical, and you become Trained (or gain Mastery) with it.',
      },
      {
        level: 10,
        name: 'Bringer of Oblivion',
        quote: '"Bring forth the gates to The Dark Below.", The Eye of The King',
        description:
          'Uses equal to your Instinct Modifier: a 30-ft area within 60 ft., enemies make a Soul Save (DC 10 + PB + Instinct) or are Deafened, Blinded, and Restrained.',
      },
      {
        level: 15,
        name: 'Tear the Veil',
        description:
          'Once per long rest, throw the arcane grenade "Veilbreaker" up to 120 ft.; a 20-ft radius tear deals your Grim Harvest Necrotic damage.',
      },
      {
        level: 20,
        name: 'The Pale Hand',
        quote: '"Death has no hold on me, for I am the Grim Reaper.", The Godhunter',
        description:
          'Focused Action: hands from the lower planes Grapple + knock Prone (DC 10 + PB + Instinct). Each round prone, the target takes your Grim Harvest Necrotic and Bleeds. Uses equal to your Instinct Modifier.',
      },
      {
        level: 20,
        name: 'Final Judgement',
        quote: '"Prepare To Meet Your God.", Aldulic, Right Hand of The Emperor',
        description:
          'Gain 30 ft. Teleport speed; running turns you invisible and free of opportunity attacks; substitute physical damage for Necrotic; and once per Full Rest teleport allies with you when you use Reap What You Sow.',
      },
    ],
  },
  {
    id: 'bruiser-berserker',
    name: 'Berserker',
    role: 'bruiser',
    availableTo: ['Bruiser', 'Tank'],
    prerequisite: 'Requires at least 15 Might, 13 Conviction',
    flavor: 'Brutish, violent, and unbreakable, the one you want on your side in a bar-fight.',
    features: [
      {
        level: 3,
        name: 'Feel No Pain',
        quote: '"I DON\'T CARE I\'M MISSING AN ARM, LET ME KILL HIM!", Tiberius, Lion of Fallstar',
        description:
          'Immunity to Stunned and Frightened. Ignore the effects of a number of Fatigued levels equal to half your PB (round up), though you still count as having them.',
      },
      {
        level: 3,
        name: 'Neverending Endurance',
        description:
          'Calculate Stamina using the maximum of your largest hit die instead of half. Your Natural Weapons deal (half PB, round up)d4 Bludgeoning.',
      },
      {
        level: 7,
        name: 'Fury of My Fist',
        quote: '"He\'s choking on the ale AND his blood!", Alastor, Prince of Dawn',
        description:
          'Brawler DC = 8 + PB + Might. With a Natural Weapon, replace an attack with: Low-Blow (Stun), Headbutt (Paralyze, you take half damage), Eye-Gouge (Blind), Drop Kick (extra damage + Prone), or One-Two-Three (throw 15 ft. + Prone).',
      },
      {
        level: 10,
        name: 'Unstoppable Force',
        quote: '"I AM THE BATTERING RAM!", Teon Loneclaw',
        description:
          'Double damage to objects and structures. Spend 3 AP to charge a 60-ft line, dealing Natural Weapon damage (Body Save vs Brawler DC for half).',
      },
      {
        level: 15,
        name: 'Immoveable Object',
        quote: '"...you will break against my shield.", Cayde Fallstar',
        description:
          'Immunity to Prone; Advantage on Saves vs forced movement and on Might Checks.',
      },
      {
        level: 20,
        name: 'The Only Failure Is Death...',
        description:
          'Once per Full Rest, when you would fall to 0 HP, instead regain half your max HP and for 1 minute gain Advantage on melee attacks and Resistance to Acid/Cold/Fire/Lightning.',
      },
      {
        level: 20,
        name: '...And Death Cannot Hold You',
        description:
          'Below half HP, gain Resistance to all damage; spend 1 Stamina to remain at 1 HP against an attack that would drop you to 0.',
      },
    ],
  },
  {
    id: 'bruiser-pit-fighter',
    name: 'Pit Fighter',
    role: 'bruiser',
    availableTo: ['Bruiser', 'Scout', 'Controller'],
    prerequisite: 'Requires at least 12 Might, 15 Presence',
    flavor:
      'A warrior of showmanship and battle, wherever there is a ring, there is a Pit Fighter, spreading inspiration and terror in equal measure.',
    features: [
      {
        level: 3,
        name: 'The Art Of Death',
        description:
          "In one-on-one combat (or vs a target who hasn't attacked others), when that target misses you, make a Natural-Weapon attack against them; Advantage on Body Saves vs their effects.",
      },
      {
        level: 3,
        name: 'Love Of The Sport',
        description:
          'You suffer no negative effects of Prone. Focused Action: a special takedown Grapple (Body Save vs Gladiator DC = 6 + PB + Might + Presence) drags you both Prone; attacks vs the grappled target have Advantage.',
      },
      {
        level: 7,
        name: 'Brutal Finish',
        description:
          "On a melee hit (uses equal to your PB per Full Rest), a Finisher: Break The Back (Paralyze + Prone), Catch This (throw 20 ft. for (Might)d6 to those hit), or Kneecap'd (remove ground speed).",
      },
      {
        level: 10,
        name: 'Ruthless Reprisal',
        quote: '"My Turn.", Strange, Wolf Of Fallstar',
        description:
          'When an attack damages you off your turn, gain a bonus Action Point next turn (max half your PB, round up).',
      },
      {
        level: 15,
        name: 'Showmanship And Survival',
        description:
          'Gain Proficiency in Performance and add your Might Modifier to it. Go extra days without sleep/food/water equal to your Might Modifier.',
      },
      {
        level: 20,
        name: 'Grudge Match',
        description:
          'During a Full Rest, designate an Archnemesis: Advantage on attacks against and saves from them, they have Disadvantage on saves from you, and +Might AC against their attacks.',
      },
      {
        level: 20,
        name: 'No Mercy',
        description:
          'When you reduce an enemy to 0 HP, enemies within 120 ft. are Frightened and allies gain Advantage on their next d20. Killing your Archnemesis grants +30 ft. movement and lasting Advantage with the means you used.',
      },
    ],
  },
  {
    id: 'bruiser-blade-dancer',
    name: 'Blade Dancer',
    role: 'bruiser',
    availableTo: ['Bruiser', 'Blaster', 'Scout'],
    prerequisite: 'Requires at least 14 Instinct, 14 Resonance',
    flavor:
      'A master who flows between floating weapons and the elements. Despite how strong your armor is, under a thousand blows it will break.',
    features: [
      {
        level: 3,
        name: 'Of Ice and Light',
        description:
          'Attune a weapon and project Aether-construct clones equal to your PB. Melee: +Resonance AC, and once per turn after a melee hit make a bonus attack with Advantage. Ranged: ranged attacks vs you have Disadvantage, and once per turn after a ranged hit make a bonus attack with Advantage.',
      },
      {
        level: 3,
        name: 'Of Fire and Iron',
        description:
          'Choose a color for your clones to change their damage type: Red->Fire, Blue->Cold, White->Radiant, Black->Necrotic, Green->Acid, Yellow->Lightning, Purple->Thunder.',
      },
      {
        level: 7,
        name: 'Radiant Mirage',
        description:
          'Reaction when hit: brighten your weapons, move 15 ft. evading opportunity attacks, and force a Body Save (DC 8 + Instinct + PB) in a 30-ft radius or Blind. Uses equal to your Instinct Modifier per Full Rest.',
      },
      {
        level: 10,
        name: 'Necrotic Rhythm',
        description:
          'Melee: use clones as floating steps for (Instinct x 5) ft. Ranged: Focused Action, move a clone (Instinct x 10) ft. and teleport to it.',
      },
      {
        level: 15,
        name: 'Acid Cascade',
        description:
          "A successful strike vs Medium/Heavy armor lowers the target's AC by 1 (up to your PB total), until they complete a Full Rest.",
      },
      {
        level: 20,
        name: 'Storm of Steel',
        description:
          'Once per Full Rest, designate a 60-ft radius within 300 ft.; for 1 minute your clones deal your weapon dice there (Body Save DC 8 + PB + Instinct + Resonance for half).',
      },
      {
        level: 20,
        name: 'The Coda',
        description:
          'Melee: clones can Grapple enemies within 30 ft. (Body Save) and you may step 5 ft. without provoking after a hit. Ranged: suppress a 30-ft cone for 1 minute, damaging enemies who move through it.',
      },
    ],
  },
  {
    id: 'caster-battle-mage',
    name: 'Battle Mage',
    role: 'caster',
    availableTo: ['Tank', 'Bruiser', 'Caster', 'Scout'],
    prerequisite: 'Requires at least 13 Instinct, 13 Focus',
    flavor:
      'Mages taken from their towers to the battlefield, compensating for a lack of combat training with storms of arcane energy.',
    features: [
      {
        level: 3,
        name: 'Weaved In War',
        description:
          'Gain +1 Aether now and every other Aspect level; if not a caster, become a Low-Caster using Focus with the Arcane list + Enhancement school (2 cantrips, 3 Tier-1). Cantrips Full Cast for 1 AP. Battle-Artes Attack = PB + (Focus x 2); Save DC = 6 + PB + Focus + Resonance. Use a Martial weapon as a focus.',
      },
      {
        level: 3,
        name: 'Runes and Ruin',
        description:
          "On an Arte attack hit, hold its damage/effect as a glowing rune to trigger later (at the target's turn or a condition you set).",
      },
      {
        level: 7,
        name: 'Spellsmite',
        description:
          "During a Full Rest, imbue a cantrip into a weapon with charges equal to (PB + Resonance); spend a charge on a hit to add the cantrip's effects.",
      },
      {
        level: 10,
        name: 'Surge',
        description:
          'After a Spellsmite hit, move half your speed without provoking and gain +Focus AC until your next turn.',
      },
      {
        level: 15,
        name: 'Summons and Shield',
        description:
          'Gain a small ghostly familiar (AC 10 + PB + Focus; HP 4 + PB + Focus) you can use as a living shield to absorb damage.',
      },
      {
        level: 20,
        name: 'Force Multiplier',
        description:
          'Focused Action: disarm a creature within 60 ft. (Body Save vs your Battle-Artes DC), or hurl an unwielded item into a creature (Battle-Artes Attack for weapon damage + PB + Resonance).',
      },
      {
        level: 20,
        name: 'Threader of The Loom',
        description:
          'Once per Full Rest (Quick Action), for 1 min: enemies have Disadvantage on saves from you, you have Advantage on Mind Saves, regain Aether equal to Focus, and resist all damage but Force/Psychic.',
      },
    ],
  },
  {
    id: 'caster-dread-lord',
    name: 'Dread-Lord',
    role: 'caster',
    availableTo: ['Caster', 'Controller', 'Healer', 'Coordinator'],
    prerequisite: 'Requires at least 14 Focus, 12 Resonance',
    flavor:
      'Those who tread a dark and forbidden path, turning the inevitability of death into a weapon and calling forth legions of undead to serve their will.',
    features: [
      {
        level: 3,
        name: 'Fell-Magicks',
        description:
          'Gain +2 Aether each Aspect level; become a High-Caster using Focus with the Eldritch list + Necromancy school (2 cantrips, 3 Tier-1; +2 Artes per level). Fell-Magicks Attack = PB + (Focus x 2); Save DC = 6 + PB + Focus + Resonance.',
      },
      {
        level: 3,
        name: 'Servant & Lord',
        description:
          'Raise Large-or-smaller Humanoid/Beast corpses (PB <= half yours) to serve until destroyed, up to your PB at once. They gain Necrotic resistance, Poison immunity, and Blindsense 30 ft. Command as a Quick Action within 60 ft. Scales at 11th & 15th (bigger creatures, more undead, PB up to yours).',
      },
      {
        level: 7,
        name: 'Given Unto Death',
        description:
          "Convert any Arte's damage to Necrotic. When you deal Necrotic, the target makes a Mind Save (DC 6 + PB + Focus + Presence) or is Frightened for 1 min with a stack of Doomed and Sluggish.",
      },
      {
        level: 10,
        name: 'Good Help',
        description:
          "When raising an Undead, grant one benefit: Freed of Flesh, Lord's Grace, Profane Defiance, Service Rendered, Feast Of Death, Scream of the Damned, Detonating Dead, or Undead Fortitude.",
      },
      {
        level: 15,
        name: 'Wrest Undeath',
        description:
          'Focused Action: assert control over a Medium-or-smaller undead within 60 ft. (Soul Save DC 8 + Occultism) for 8 hours. Control a number equal to (Focus + half Dread-Lord level).',
      },
      {
        level: 20,
        name: 'Befitting a Lord',
        description:
          'Servant & Lord may imbue three Good Help benefits; Necromancy Artes may grant two.',
      },
      {
        level: 20,
        name: 'Artist of the Fell-Dead',
        description:
          'Necromancy Necrotic Artes gain Immunity Bypass 0.5; or conjuring Artes may raise additional undead equal to your PB.',
      },
    ],
  },
  {
    id: 'caster-chronomancer',
    name: 'Chronomancer',
    role: 'caster',
    availableTo: ['Caster', 'Controller', 'Coordinator'],
    prerequisite: 'Requires at least 12 Resonance, 15 Presence',
    flavor:
      'Practitioners of a forbidden, awe-inspiring magic that manipulates the flow of time. To the master, the How and Where matter little, they choose the When.',
    features: [
      {
        level: 3,
        name: 'Time-Touched',
        description:
          'Gain +2 Aether each Aspect level; become a High-Caster using Presence with the Paracausal list + Time-Magic group (2 cantrips, 3 Tier-1; +2 Artes per level). Chronomancy Attack = PB + Presence + Focus; Save DC = 6 + PB + Presence + Resonance.',
      },
      {
        level: 3,
        name: 'Fragmented Sekonds',
        description:
          'Casting a Chronomancy/Time-Magic Arte grants a Fragmented Sekond (hold up to half Presence, round up). Convert them to Action Points for yourself or an ally within 30 ft. Uses equal to your Focus Modifier per Full Rest.',
      },
      {
        level: 7,
        name: "Observer's Collapse",
        description:
          'Radiate a 15-ft aura granting you and allies Advantage on Saves vs harmful conditions.',
      },
      {
        level: 10,
        name: 'The Right Thread...',
        description:
          'Reaction (1 Sekond): an ally within 60 ft. who fails a roll rerolls with +Presence.',
      },
      {
        level: 10,
        name: '...At The Right Moment',
        description:
          'Reaction (1 Sekond): a hostile within 60 ft. who succeeds a roll rerolls with -Presence.',
      },
      {
        level: 15,
        name: 'Paradox Cast',
        description:
          'When casting a Chronomancy/Time-Magic Arte, spend extra Aether (= tier) to simultaneously cast a second Arte of a different school. Doubles the ranges of your three time auras/abilities.',
      },
      {
        level: 20,
        name: 'Chrono-Collapse',
        description:
          "Once per Full Rest, expend all Fragmented Sekonds to turn Observer's Collapse into a Chrono-Anomaly: you and allies gain bonus Surprise Rounds (half the Sekonds spent) while everything outside is Time-Stopped.",
      },
    ],
  },
  {
    id: 'caster-pact-mage',
    name: 'Pact Mage',
    role: 'caster',
    availableTo: ['All'],
    prerequisite: 'Requires at least 12 Presence',
    flavor:
      'A spellcaster bound to a patron, channeling borrowed power through an artifact and forbidden Eldritch pacts.',
    features: [
      {
        level: 3,
        name: 'Pact-Aether',
        description:
          'Gain Aether equal to twice your highest Artes Tier; count as a High-Caster. Upcasting costs 1 Aether per Tier (you must cast at your highest Tier). Gain the Eldritch list (2 cantrips, 2 Tier-1) + one patron Artes group. Pact Attack = PB + Presence + Focus; Save DC = 6 + PB + Presence + Resonance.',
      },
      {
        level: 3,
        name: 'Pact Artifact',
        description:
          'Your patron grants an artifact (changeable on level up): Armory (summon a weapon or armor), Chain (a binding familiar that can attack), Grimoire (3 cantrips + Aether), String (a pact instrument granting Performance + buffs), or Flesh (+max HP and half-Conviction AC).',
      },
      {
        level: 7,
        name: 'Eldritch Rituals',
        description:
          'Perform 1-minute rituals (1 Aether, once each per Full Rest): Mystic Cunning (regain up to half your max Aether) and Question Patron (ask your patron up to five yes/no questions).',
      },
      {
        level: 10,
        name: 'Eldritch Sight',
        description: 'Gain Devilsight 120 ft. (or +120 ft. if you already have it).',
      },
      {
        level: 10,
        name: 'Seeker of the Unknown',
        description:
          "After 1 hour studying extraplanar/magical lore, replace a relevant check's total with (Aspect level + Focus + Presence).",
      },
      {
        level: 15,
        name: 'Arcanum Artes',
        description:
          'Choose an Arte one Tier above your maximum; cast it once per long rest without Aether. A second Arcanum at maximum Tier 15.',
      },
      {
        level: 20,
        name: 'Summon Domain',
        description:
          'Focused Action: create a 100-ft-radius Eldritch Domain (a cut-off pocket dimension) for 1 minute; on initiative 20 each round, cast a Tier-5+ Arte, impose Disadvantage, or deal cantrip damage. Once per Full Rest.',
      },
    ],
  },
  {
    id: 'caster-blood-bender',
    name: 'Blood Bender',
    role: 'caster',
    availableTo: ['All'],
    prerequisite: 'Requires at least 12 Resonance, 15 Conviction',
    flavor:
      "If it can bleed, it can die, but the Blood Bender's enemies die first. Living urban legends who pull minerals from blood and return harm exponentially.",
    features: [
      {
        level: 3,
        name: 'Sanguine Sorcery',
        description:
          'Gain +1 Aether each Aspect level; become a Mid-Caster using Resonance with the Arcane list + Hemomancy group. Blood Attack = PB + Resonance + Focus; Save DC = 6 + PB + (Resonance x 2). Deal 1d4 to yourself for a Bleed stack; Techniques: Heartpiercer ((PB)d8 piercing), Fleshcarver (15-ft cone (PB)d6 slashing), Veincrush (10-ft (PB)d12 bludgeoning). While Bleeding, Hemomancy Artes cost half.',
      },
      {
        level: 3,
        name: 'Vital Vindication',
        description:
          'Heal an ally using a creature corpse (<=1 day old): Small 1d6 -> Gargantuan 10d6, + PB + Conviction.',
      },
      {
        level: 7,
        name: 'Of Crimson And Bone',
        description:
          'When an enemy within 30 ft. is below 10% HP, "invert" them (Coup de Grace); you or an ally within 100 ft. heals half their remaining HP.',
      },
      {
        level: 10,
        name: 'Heartbeat, And Lack Thereof',
        description:
          "Focused Action: stop a lower-PB creature's heart (Mind Save vs your DC). While you Concentrate (1 AP/turn), they gain a Fatigued level each round.",
      },
      {
        level: 15,
        name: 'Siphoning The Soul',
        description:
          'Vital Vindication now heals double and grants the target Advantage on their next d20.',
      },
      {
        level: 20,
        name: 'Veins and Strings',
        description:
          'Heartbeat may instead force a Body Save or puppet the target under your control for 1 minute.',
      },
      {
        level: 20,
        name: 'Fulfilled Flesh',
        description:
          'Sanguine techniques deal +Resonance dice; Of Crimson And Bone gains +100 ft. range and Frightens nearby enemies; Heartbeat works on any PB.',
      },
    ],
  },
  {
    id: 'caster-ritualist',
    name: 'Ritualist',
    role: 'caster',
    availableTo: ['Caster', 'Controller', 'Coordinator'],
    prerequisite: 'Requires at least 13 Focus, 13 Resonance',
    flavor:
      "Preparation is key. To anyone who finds themselves on the end of a Ritualist's runes, one thing is clear: the battle's victor was already decided.",
    features: [
      {
        level: 3,
        name: 'Glyphcaster',
        description:
          'Gain +1 Aether each Aspect level; become a Mid-Caster using Focus with the Arcane list + Ward group. Glyph Attack = PB + (Focus x 2); Save DC = 6 + PB + Focus + Resonance. Out of combat (10 min), place Glyphs equal to your PB within 1000 ft. that each hold an Arte, triggering on a condition you set.',
      },
      {
        level: 3,
        name: 'Complacency is Death',
        description:
          'Rests take half as long (and you can go twice as long without rest); lose a Fatigued level on a Quick Rest; concentrate on one additional Arte; carve cantrip Runes during a Full Rest.',
      },
      {
        level: 7,
        name: 'Arcane Circuits',
        description: 'Connect Glyphs with leylines so triggering one can chain-activate others.',
      },
      {
        level: 10,
        name: 'Rune of Ruin',
        description:
          'Inscribe cantrip runes (= PB) onto a throwable object that erupts with all of them at once. Recharges on a Full Rest.',
      },
      {
        level: 15,
        name: 'Engraved Weapon',
        description:
          'Carve runes into weapons (= Resonance Modifier): magical, glowing, Enhancement Bonus = PB, summonable to hand as a Free Action.',
      },
      {
        level: 20,
        name: 'Runic Armor',
        description:
          'Turn clothing/armor into Runic Armor: Advantage on saves vs magic, bonus Aether (PB + Resonance), and +PB AC. Remade each Full Rest.',
      },
      {
        level: 20,
        name: 'Ritual of Empowerment',
        description:
          'Once per Full Rest (8-hour ritual), create a 60-ft Empowerment Circle: affixed glyphs reusable, enemies take double from Engraved Weapons, and allies gain Aether each round.',
      },
    ],
  },
  {
    id: 'caster-metamagus',
    name: 'Metamagus',
    role: 'caster',
    availableTo: ['Caster', 'Blaster', 'Coordinator'],
    prerequisite: 'Requires at least 12 Resonance, 14 Focus',
    flavor:
      'Where others fail, the Metamagus succeeds, combining Artes for stronger effects and manipulating reality through the Aether. The most feared spellcasters in the Forest of White Trees.',
    features: [
      {
        level: 3,
        name: 'Shifting Possibilities',
        description:
          'Gain +2 Aether each other Aspect level; become a High-Caster using Resonance with the Arcane list + Aethermancy group. Metamagicks Attack = PB + Resonance + Focus; Save DC = 6 + PB + (Resonance x 2). For +1 Aether, modify an Arte: double range, halve casting time, change damage type, remove a component, or +1 round duration.',
      },
      {
        level: 3,
        name: 'Reforge and Refine',
        description:
          'Create a Signature Cantrip from any Tier-1 Arte (cast free) with permanent Shifting Possibilities choices.',
      },
      {
        level: 7,
        name: 'Evolving Equilibrium',
        description:
          'New modifications: cast as a Reaction at half effect, double one effect of the Arte, or add a second target within 15 ft.',
      },
      {
        level: 10,
        name: 'Infusing Formations',
        description:
          'Reaction when an Arte attack hits you: your next Arte attack deals bonus damage equal to half the damage you took. Uses equal to your PB per Full Rest.',
      },
      {
        level: 15,
        name: 'Fluxing Overclock',
        description:
          'Hold an instantaneous Arte to "Overclock" it (Concentration, up to 1 min): each round stacks doubled range/radius, +1 damage die, and +1 DC. Uses equal to half your PB.',
      },
      {
        level: 20,
        name: 'Manifestation of Mortality',
        description:
          'Once per Full Rest (Focused Action), for 1 min: Aether regen (PB + Resonance)/turn, fly 30 ft., Artes gain an extra target, resist all Empowered damage, and blind enemies within 100 ft. (Soul Save).',
      },
      {
        level: 20,
        name: 'The Great Loom',
        description:
          'Your Signature Cantrip may change once per long rest, may be any Arte of Tier 5 or lower you can cast, and may be cast as a Reaction when you/an ally is attacked, fails a Save, or an enemy gains a condition.',
      },
    ],
  },
  {
    id: 'caster-elementalist',
    name: 'Elementalist',
    role: 'caster',
    availableTo: ['Caster'],
    prerequisite: 'Requires at least 14 Resonance, 12 Focus',
    flavor:
      'A caster who binds themselves to a single element, bending fire, frost, storm, or stone to overwhelming, inevitable mastery.',
    features: [
      {
        level: 3,
        name: 'Elemental Attunement',
        description:
          'Permanently choose an element (Fire, Cold, Poison, Bludgeoning, Lightning, Acid, or Thunder). Convert your damaging Artes to it; gain Resistance to it; your elemental Artes ignore nonmagical environmental resistance.',
      },
      {
        level: 3,
        name: 'Elemental Signature',
        description:
          'Once per turn, dealing elemental damage applies an Elemental Mark (one per creature) with a per-element effect: Fire (PB damage next turn), Cold (-10 ft. speed), Poison (Disadvantage attack), Bludgeoning (-1 attack, stacking), Lightning (-2 next Save), Acid (-1 AC, stacking), Thunder (no Reactions).',
      },
      {
        level: 7,
        name: 'Elemental Confluence',
        description:
          'When a Marked creature takes your elemental damage again, re-trigger the Mark and force a Save (DC 8 + PB + Resonance) or be afflicted with a condition by element (Fire->Burning, Cold->Restrained, Poison->Poisoned, Bludgeoning->Blinded, Lightning->Sluggish 2, Acid->Weakened, Thunder->Prone).',
      },
      {
        level: 10,
        name: 'Elemental Domain',
        description:
          'Quick Action, 2 Aether: a 15-ft zone within 60 ft. for 1 min, hostiles take your Focus in your element each turn, Marked creatures have Disadvantage on Saves, and you may Mark two creatures per spell.',
      },
      {
        level: 15,
        name: 'Ascendant Element',
        description:
          'Immunity Bypass 0.5 for your element; Marks last 1 min; once per turn apply a Mark to any creature you target with an Arte (even without damage).',
      },
      {
        level: 20,
        name: 'Avatar Of The Elements',
        description:
          'Once per combat (Quick Action), embody your element for 1 min: Immunity to it, all Artes auto-Mark, and Domains double in radius.',
      },
      {
        level: 20,
        name: 'Singular Cataclysm',
        description:
          'Once per Full Rest, turn a Tier-5+ Arte into a Cataclysm: doubled area, maximized damage dice, auto-Marks all targets, and Stuns already-Marked creatures (no extra Aether cost).',
      },
    ],
  },
  {
    id: 'scout-ranger',
    name: 'Ranger',
    role: 'scout',
    availableTo: ['Scout', 'Blaster', 'Caster'],
    prerequisite: 'Requires at least 14 Instinct, 12 Conviction',
    flavor:
      'A hunter of the wilds who marks their quarry and runs it to ground, blending primal magic with peerless tracking.',
    features: [
      {
        level: 3,
        name: "Primal Hunter's Magic",
        description:
          'Gain +1 Aether every other Aspect level; become a Low-Caster using Conviction with the Divine list + Curse/Sensor groups. Learn Quarry Mark (free once per Full Rest). Primal Attack = PB + Conviction + Focus; Save DC = 6 + PB + Conviction + Resonance.',
      },
      {
        level: 3,
        name: 'Favored Hunt',
        description:
          'Favor Bonus = half PB; Favor Die d4 (scaling d6/d8/d10/d12 at 7/10/15/20). Choose a Favored creature type: add Favor Bonus to attacks and relevant talent checks against them, Favor Die to damage, and learn one of their languages.',
      },
      {
        level: 7,
        name: 'Master of Traversal',
        description:
          'Gain a climb or swim speed equal to your base speed (and +10 ft.); ignore nonmagical difficult terrain; Advantage on Initiative; wilderness travel and foraging benefits.',
      },
      {
        level: 7,
        name: 'Favored Target',
        description:
          'A weapon hit can mark a non-Favored creature as your Favored Target for 1 min (one at a time). Uses equal to your PB per Full Rest.',
      },
      {
        level: 10,
        name: 'Eye of the Hunter',
        description: 'Crit on a 19-20; add your Favor Die to crit damage; gain Blindsense 15 ft.',
      },
      {
        level: 10,
        name: 'Temper Expectations',
        description: 'On your first turn in combat, treat all creatures as your Favored Hunt.',
      },
      {
        level: 15,
        name: 'Greater Hunt',
        description:
          'Add another creature type to your Favored Hunt; spend 1 Aether to use Favored Target when out of uses.',
      },
      {
        level: 15,
        name: 'Predictive Adaptation',
        description:
          'Advantage on Saving Throws against the Artes and abilities of your Favored Hunt.',
      },
      {
        level: 20,
        name: 'Ultimate Eye',
        description:
          'On your first turn, target up to three creatures with Favored Target (one use); using it again adds targets to your Favored Hunt rather than replacing them.',
      },
    ],
  },
  {
    id: 'scout-rogue',
    name: 'Rogue',
    role: 'scout',
    availableTo: ['Scout', 'Blaster', 'Coordinator'],
    prerequisite: 'Requires at least 14 Instinct, Proficiency in Stealth & Sleight Of Hand',
    flavor:
      'A master of larceny and opportunism who turns a moment of distraction into a devastating strike.',
    features: [
      {
        level: 3,
        name: 'Tools of the Thief',
        description:
          "Proficiency with Thieves' Tools (craftable on a Full Rest); learn Cipher Speech to hide messages in ordinary conversation.",
      },
      {
        level: 3,
        name: 'Advantaged Strike',
        description:
          'Once per turn, deal +1d6 to a creature you hit with Advantage (or with an ally within 5 ft. of it); not with Two-Handed/Heavy weapons. Scales to 3d6/5d6/7d6/9d6 at 7/10/15/20.',
      },
      {
        level: 7,
        name: 'Cunning',
        description:
          "Dash, Disengage, and Hide cost 1 less Action Point. If you haven't moved, reduce your speed to 0 (Quick Action) for Advantage on your next attack.",
      },
      {
        level: 7,
        name: 'Varied Expert',
        description:
          "Choose two Proficient skills (or one + Thieves' Tools); increase each by one proficiency step.",
      },
      {
        level: 10,
        name: 'Reliable Skills',
        description: 'On a Proficient talent check, treat a d20 of 9 or lower as a 10.',
      },
      {
        level: 15,
        name: 'Slippery Mindset',
        description:
          'Body Saves for half damage instead take none on success, half on failure; gain Proficiency (or +1 step) in Mind Saves.',
      },
      {
        level: 20,
        name: 'Spatial Awareness',
        description:
          "Gain Blindsense 30 ft.; no attack roll may have Advantage against you while you aren't Incapacitated.",
      },
    ],
  },
  {
    id: 'scout-guerilla',
    name: 'Guerilla',
    role: 'scout',
    availableTo: ['Scout', 'Blaster', 'Controller'],
    prerequisite: 'Requires at least 12 Instinct, 14 Focus',
    flavor:
      'Against warlords, empires, and tyrants, the Guerilla fights to overthrow monsters, through deception, ambush, and hit-and-run, the smallest drop of blood can create a storm.',
    features: [
      {
        level: 3,
        name: 'Vassal of None',
        description:
          'Advantage on Stealth in ordinary attire; gain an extra Surprise Round in an Ambush, and your Surprise-Round attacks have Advantage.',
      },
      {
        level: 3,
        name: 'Research and Recon',
        description:
          'On a Perception success vs a creature/structure/shift, learn an attribute or ability, its immediate intentions, or usable environmental hazards.',
      },
      {
        level: 7,
        name: 'Hit-and-Run',
        description:
          'Speeds +5 x PB. A weapon hit lets you move 10 ft. without provoking; moving your full speed grants Advantage on your next attack.',
      },
      {
        level: 10,
        name: 'Insurgent Saboteur',
        description:
          'During a Full Rest, craft a gadget: Smoke Bomb (obscure), Noisemakers (distraction), Tripwire Traps (Noise/Snare/Flash), Sticky Bomb ((PB)d6 fire), or Collapsing Kit (structure collapse).',
      },
      {
        level: 15,
        name: 'S.E.R.E.',
        description:
          'Advantage on Grapple Checks and Body Saves; Body Saves take no damage on success (or gain Proficiency/Expertise); resistance to a chosen physical type; Proficiency (or Expertise) in Investigation.',
      },
      {
        level: 20,
        name: 'Undo The Tyrant',
        description:
          'Against tagged enemies, gain bonuses: Royal/Noble (Charm immunity, Advantage Mind Saves), Commander (allies gain temp HP), Baron/Archduke (no forced flight), Champion (temp HP + Advantage on a kill).',
      },
      {
        level: 20,
        name: 'Usurper',
        description:
          "Once per Full Rest, Reaction: cancel a Royal/Noble/Commander/Baron/Archduke/Champion creature's Feature/Ability/Apex Action and regain a use of one of your own.",
      },
    ],
  },
  {
    id: 'scout-longinus',
    name: 'Longinus',
    role: 'scout',
    availableTo: ['Scout', 'Tank', 'Bruiser'],
    prerequisite: 'Requires at least 13 Instinct or 13 Might',
    flavor:
      'A polearm master who forges a fate-piercing spear and descends from the sky to strike the hearts of the mighty.',
    features: [
      {
        level: 3,
        name: "Destiny's Spearhead",
        description:
          'Become Trained with Spear/Polearm groups and ritually enhance one into a Longinus: Finesse, Reach(5) (stacking), Empowered, +1 to Attack and Damage. One at a time.',
      },
      {
        level: 3,
        name: 'Fate Piercer',
        description:
          'Quick Action: leap 30 ft. up and land at a point within 30 ft., attacking a creature there (half damage on a miss). Uses equal to your Instinct Modifier per Full Rest.',
      },
      {
        level: 7,
        name: 'Prophesized Prey',
        description:
          'Choose a tag (Celestial, Fiend, Dragon, or Kaiju): Advantage on attacks/contests/saves against it, and move half your speed without provoking on a hit.',
      },
      {
        level: 7,
        name: 'Feint of Foresight',
        description:
          'Reaction: make a melee Longinus attack against a creature that enters your reach.',
      },
      {
        level: 10,
        name: 'Imminent Impalement',
        description:
          'Once per turn, a Longinus hit deals +(half Focus)d10 Piercing and forces a Body Save (DC 6 + PB + Might + Instinct) or be grappled regardless of size.',
      },
      {
        level: 10,
        name: "Fate's Fracture",
        description:
          'When you use Fate Piercer, hostiles in a 15-ft radius make a Save or take (Instinct)d6 Piercing and be Restrained by spectral lances (half, no restrain on success).',
      },
      {
        level: 15,
        name: 'Reverie of Reverence',
        description:
          '+10 movement; Fate Piercer may land a distance equal to your movement (min 40 ft.).',
      },
      {
        level: 20,
        name: "Destiny's Defense",
        description:
          'You and allies within your Longinus reach have Partial Cover; Reaction: an intercepting strike can deflect or reduce an attack against an ally in range.',
      },
      {
        level: 20,
        name: 'Fated Fall',
        description:
          'Crit on 18-20 with your Longinus, and crits deal triple damage instead of double.',
      },
    ],
  },
  {
    id: 'scout-infiltrator',
    name: 'Infiltrator',
    role: 'scout',
    availableTo: ['Scout', 'Controller', 'Coordinator'],
    prerequisite: 'Requires at least 13 Instinct, 15 Presence',
    flavor:
      'Agents who sneak behind enemy lines, destroy logistics, and assassinate commanders, a virus that destabilizes until the enemy breaks from within.',
    features: [
      {
        level: 3,
        name: 'Insider Threat',
        description:
          'Advantage on Deception, Advantage on attacks vs Surprised creatures, and Proficiency with Disguise Kits.',
      },
      {
        level: 3,
        name: 'Chameleon',
        description:
          'Invisible in dim light/darkness; enemies have Disadvantage to find you in crowds; disguise with materials in the wild (Advantage on Stealth while disguised).',
      },
      {
        level: 7,
        name: 'Codebreaker',
        description:
          "Proficiency in Thieves' Tools, Advantage on Lockpicking/Codebreaking, and once per Full Rest a hidden Focus check for a GM hint (false hint on a failure).",
      },
      {
        level: 10,
        name: 'Silencer',
        description:
          "Alter a weapon: silent (attacks don't break stealth), Master Training, and Conceal (undetectable while hidden). One at a time.",
      },
      {
        level: 15,
        name: 'Sleeper Agent',
        description:
          'Over 8 hours, indoctrinate a creature (PB <= yours) into a Sleeper Agent with an Activation Phrase you set. Control a number equal to your PB.',
      },
      {
        level: 20,
        name: 'Embedded Entry',
        description:
          'Enemies have Disadvantage on Intuition to see through you; bank Trust Points (= Presence) to impose Disadvantage, grant yourself Advantage, or turn an enemy against an ally.',
      },
      {
        level: 20,
        name: 'A Liar, A Thief, And A Traitor',
        description:
          'On a betrayal: you and allies gain Advantage vs Surprised enemies, and hostiles within 30 ft. make a Mind Save or be Stunned 1 minute.',
      },
    ],
  },
  {
    id: 'scout-gambler',
    name: 'Gambler',
    role: 'scout',
    availableTo: ['Scout', 'Caster', 'Controller'],
    prerequisite: 'Requires at least 12 Instinct, 14 Presence',
    flavor:
      'A caster who courts Lady Luck herself, turning coin-flips, loaded dice, and marked cards into magic and mayhem.',
    features: [
      {
        level: 3,
        name: 'Heart of The Cards',
        description:
          'Gain +1 Aether each Aspect level; become a Mid-Caster using Presence with the Paracausal list + Conjuring/Illusory groups. Gambler Attack = PB + Presence + Focus; Save DC = 6 + PB + Presence + Resonance. Expertise in a Game Set; Proficiency in Sleight of Hand & Deception; a number of times equal to PB, flip a coin instead of a d20 for the worst outcome or a natural 20.',
      },
      {
        level: 3,
        name: 'Ace In The Hole',
        description:
          'After a Full Rest, gain a single natural-20 to use as a Reaction. Your game set becomes the Wild Draw cantrip (spectral pieces dealing damage by type).',
      },
      {
        level: 7,
        name: 'Call The Bluff',
        description:
          'When a creature makes a Deception/Intimidation/Persuasion check on you or an ally within 30 ft., force a Mind Save or expose the lie (Disadvantage on social checks for 1 min). Uses equal to your PB.',
      },
      {
        level: 10,
        name: "The Fool's Gambit",
        description:
          'A number of times equal to your PB, choose to critically fail a save or take an automatic crit, then your next Save auto-passes or the next attack against you auto-misses.',
      },
      {
        level: 15,
        name: 'Loaded Dice, Marked Cards',
        description:
          'Once per turn on a miss, Reaction: make a free attack or impose Disadvantage on their next d20. Wild Draw now deals d8s.',
      },
      {
        level: 20,
        name: 'All In',
        description:
          'Once per Full Rest, declare "All In": you and allies hold actions to act together next turn, then flip a coin, all natural 1s or all natural 20s.',
      },
      {
        level: 20,
        name: 'The House Always Wins',
        description:
          'Once per Full Rest, for 1 min: Rigged Odds (force a reroll and choose which result, uses = PB), House Edge (grant Advantage), and The House Never Busts (at 0 HP, drop to 1 and free Wild Draw attack).',
      },
    ],
  },
  {
    id: 'scout-courier',
    name: 'Courier',
    role: 'scout',
    availableTo: ['Scout', 'Bruiser', 'Coordinator'],
    prerequisite: 'Requires at least 12 Instinct, 12 Conviction',
    flavor:
      'Quick wit, speed, and efficiency, the Courier gets a message across no matter how much blood is spilled on the road.',
    features: [
      {
        level: 3,
        name: 'Pathfinder',
        description:
          "+10 ft. speed; Advantage on Survivalism while traveling; can't be surprised while traveling; spot hidden dangers on a map with Investigation.",
      },
      {
        level: 3,
        name: 'Harbinger',
        description:
          'Out of combat your speed is doubled. Gain the Messaging cantrip, ignore nonmagical difficult terrain, ward a letter/object against tampering, and when you Dash an ally may move half their speed as a Reaction.',
      },
      {
        level: 7,
        name: 'Bearer of Bad News',
        description:
          'Quick Action: speak a grim truth to a creature within 30 ft., Mind Save (DC 8 + PB + Presence) or Frightened until end of its next turn. Uses equal to your PB.',
      },
      {
        level: 10,
        name: 'Guaranteed Delivery',
        description:
          'Once per Full Rest: for 8 hours gain Advantage on navigation/route checks, +25% travel speed, and the first hazard that would drop you to 0 HP drops you to 1 instead.',
      },
      {
        level: 15,
        name: 'Out of My Way',
        description:
          "Move freely through enemies' spaces; when you take the Attack Action you may also shove a creature within 5 ft. prone.",
      },
      {
        level: 20,
        name: 'Where The Winds Blow',
        description:
          'Always sense the direction of a sworn delivery target on your plane; once per Full Rest, double overland travel for 24 hours and auto-avoid natural hazards.',
      },
      {
        level: 20,
        name: 'Getting The Message Across',
        description:
          "Once per Full Rest, declare a target within 60 ft.: it can't gain Advantage to resist or become immune, you gain Advantage (or +Instinct to your DC), and it can't reduce the damage. They understand your intent even without a shared language.",
      },
    ],
  },
  {
    id: 'blaster-sharpshooter',
    name: 'Sharpshooter',
    role: 'blaster',
    availableTo: ['Blaster', 'Bruiser', 'Scout'],
    prerequisite: 'Requires at least 14 Instinct, 12 Focus',
    flavor:
      "An enemy that can't see you can't kill you; one you out-range can't hit you. The Sharpshooter has one job, putting targets six feet under.",
    features: [
      {
        level: 3,
        name: 'Deadeye',
        description:
          'Reaction: mark up to your Focus Modifier in creatures in range, immediately making a free Advantage attack against each that deals +(Focus)d6 piercing on a hit. If one hits, reroll a missed Deadeye attack. Uses equal to your PB.',
      },
      {
        level: 3,
        name: 'One Shot, One Kill',
        description:
          'Declare before an attack: focus all remaining Action Points/attacks into a single attack, multiplying the damage by that number on a hit. On a miss, you lose them all and your turn ends.',
      },
      {
        level: 7,
        name: 'Overwatch',
        description:
          'Declare Overwatch: gain Reactions at end of turn equal to unused Action Points, used to attack when an enemy attacks, moves into range, or an ally fails a save. Uses equal to your PB.',
      },
      {
        level: 10,
        name: 'High Ground',
        description:
          'While 10+ ft. above your enemies, you count as having Greater Cover and your attacks against them have Advantage.',
      },
      {
        level: 15,
        name: 'Ricochet Shot',
        description:
          'On a ranged hit, ricochet to a second creature within 15 ft. (separate attack, half the original damage). Uses equal to your PB.',
      },
      {
        level: 20,
        name: "No-Man's Land",
        description:
          'Once per Full Rest, declare a 30-ft area for 1 min: ignore cover and low-light/fog/smoke/invisibility there; enemies that move or attack provoke ranged opportunity attacks (up to PB/round); +(PB)d6 once per turn.',
      },
      {
        level: 20,
        name: 'Pinpoint',
        description:
          'Once per Full Rest, an attack automatically hits as a critical, ignoring cover, resistance, and temporary HP (only crit immunity applies).',
      },
    ],
  },
  {
    id: 'blaster-bombardier',
    name: 'Bombardier',
    role: 'blaster',
    availableTo: ['Blaster', 'Controller'],
    prerequisite: 'Requires at least 13 Instinct, 13 Focus',
    flavor:
      'Mortals love building monuments, the Bombardier loves blowing them to kingdom come even more.',
    features: [
      {
        level: 3,
        name: 'Siegebreaker',
        description:
          '4x damage to structures/objects with explosives; analyze a building (1 min) to know where to place charges for maximum damage.',
      },
      {
        level: 3,
        name: 'Explosive Payload',
        description:
          'During a Full Rest, craft Explosive Payloads (= PB): Focused Action to throw (10-ft radius, Body Save DC 8 + PB + Instinct for (PB)d6, half on success). Chain bottles to add +10 ft. radius and +(PB)d6 each.',
      },
      {
        level: 7,
        name: 'Shock and Awe',
        description:
          'A failed Save vs your explosion Stuns for 1 min and shatters armor (-PB AC until repaired on a Full Rest).',
      },
      {
        level: 10,
        name: 'Scorched Earth',
        description:
          'Your explosions leave Burning Ground until your next turn (PB Fire damage on enter/start; nonmagical terrain ignites).',
      },
      {
        level: 15,
        name: 'Danger Close',
        description:
          'You and allies are immune to your explosives; Payload range 270 ft., dice become d12s, remade on a Quick Rest, and you craft (PB + Instinct) of them.',
      },
      {
        level: 20,
        name: 'Overpressure',
        description:
          "Choose each Payload's element: Fire (Burning), Ice (Petrify save), Acid (destroy items), Necrotic (max HP loss), Radiant (Blind save), or Lightning (chains to a nearby enemy).",
      },
      {
        level: 20,
        name: 'Hellfire',
        description:
          'Once per Full Rest (Focused Action): a 90-ft-radius, 400-ft-high pillar of cursed flame, Body Save (DC 6 + PB + Instinct + Focus) or take 12d12 Fire + 12d12 Necrotic and Blazing Entropy (3d10 Fire/turn, no healing). Immunity Bypass 0.5.',
      },
    ],
  },
  {
    id: 'blaster-railcaster',
    name: 'Railcaster',
    role: 'blaster',
    availableTo: ['Blaster', 'Caster', 'Controller'],
    prerequisite: 'Requires at least 14 Resonance, 12 Focus',
    flavor:
      'With enough kinetic energy, even a wooden spoon can kill a god. The Railcaster turns raw Aether into an arcane railgun that hurls the world at its foes.',
    features: [
      {
        level: 3,
        name: 'The Kinetic Railgun',
        description:
          'Gain +2 Aether each Aspect level; become a High-Caster using Resonance with the Paracausal list + Aethermancy/Kinetomancy groups. Create/dismiss a Kinetic Railgun (free action) that fires unattended objects as Empowered Bludgeoning: Tiny (PB)xd4, Small xd6, Medium xd8. Acceleration Save DC = 6 + PB + (Resonance x 2).',
      },
      {
        level: 3,
        name: 'Mass Accelerator',
        description:
          'When firing a Small-or-larger object, overcharge for +(PB + Instinct) damage, taking (PB) Bludgeoning recoil.',
      },
      {
        level: 7,
        name: 'Overpenetration',
        description:
          'Reshape an object (lowering its size by one): Flatten for Slashing or Sharpen for Piercing damage.',
      },
      {
        level: 10,
        name: 'Through-and-Through',
        description:
          'Overcharged attacks deal double to structures/objects (and continue if destroyed); creatures make a Body Save (DC 8 + Prof + Focus) or take full damage, are knocked back 10 ft. prone, and the projectile carries on.',
      },
      {
        level: 15,
        name: 'Linebreaker',
        description: 'Wield objects up to Huge: Large (PB)xd10, Huge xd12.',
      },
      {
        level: 20,
        name: 'Perfect Trajectory',
        description:
          'Range 300/900 ft.; arc an attack to strike from above with Advantage, ignoring cover, landing at the start of your next turn. Uses equal to your PB.',
      },
      {
        level: 20,
        name: 'Event Horizon',
        description:
          'Once per Rest, hurl a singularity up to 900 ft.; over 1 min creatures in a 100-ft radius are pulled 15 ft. closer (Body Save) and take (PB + Focus)d12 Force each round within 10 ft.',
      },
    ],
  },
  {
    id: 'blaster-heartseeker',
    name: 'Heartseeker',
    role: 'blaster',
    availableTo: ['Blaster', 'Healer', 'Controller'],
    prerequisite: 'Requires at least 13 Focus, 14 Conviction',
    flavor:
      'Hearts, lungs, brains, and kneecaps keep a body running. The Heartseeker keeps them working in allies and breaks them in enemies, a quick, efficient death.',
    features: [
      {
        level: 3,
        name: 'Critical Point',
        description:
          'See clearly to a mile, gain Darksight 30 ft., and see through flesh to find organs/joints within 90 ft. Heartseeker Save DC = 8 + PB + Focus.',
      },
      {
        level: 3,
        name: 'Kneecapper',
        description:
          'Crit on 19-20. On a crit, strike a vital part (Body Save vs Heartseeker DC): Heart (Weakened), Lung (no move/Reactions), Head (Stunned), or Joint (Disadvantage on Body Saves & attacks) until end of its next turn.',
      },
      {
        level: 7,
        name: 'Good As New',
        description:
          'Reaction when an ally in range takes damage: snap their bones back into place for temp HP equal to (PB + Focus). Uses equal to your PB per Rest.',
      },
      {
        level: 10,
        name: 'Struck Nerves',
        description:
          'On a hit, trigger Fight or Flight, enemies make a Mind Save or rage/flee; allies gain Advantage on Body Saves & attacks, or double movement + free Disengage. Uses equal to your PB per Rest.',
      },
      {
        level: 15,
        name: 'Organ Taker',
        description:
          'Crit range widens to 18-20; Good As New heals double; moving half your speed when Kneecapper triggers.',
      },
      {
        level: 20,
        name: 'Last Beat',
        description:
          'When you kill an enemy, you and an ally within 90 ft. heal (Prof x enemy PB); witnesses make a Mind Save or are Stunned 1 round.',
      },
      {
        level: 20,
        name: 'Dead to Rights',
        description:
          "Once per Full Rest, when an ally within 90 ft. drops to 0 HP, make a free attack (sprinting into range if needed) against the attacker, dealing Force damage equal to the ally's max HP regardless of the hit; a crit lets you choose two Kneecapper points.",
      },
    ],
  },
  {
    id: 'controller-swarm-of-one',
    name: 'Swarm-of-One',
    role: 'controller',
    availableTo: ['Controller', 'Bruiser', 'Scout'],
    prerequisite: 'Requires at least 12 Focus, 14 Presence',
    flavor:
      'A Broodmaster commanding an amorphous biomass of children, disgusting terror and a softer, parental hivemind in one.',
    features: [
      {
        level: 3,
        name: 'One Will, Many Bodies',
        description:
          'Become Broodmaster of a colony, gaining a benefit: Spider (climb 60 ft.), Rat (Instinct prof), Ant (Might prof), Termite (2x structures), Snails (halve enemy movement within 30 ft.), Mice (Poison damage), Beetles (+Presence AC), or Constructs (Focus prof). Broodswarm DC = 6 + PB + Focus + Presence.',
      },
      {
        level: 3,
        name: 'Bound Brood',
        description:
          'A number of times equal to your PB, when you fail a Save, miss an attack, or are hit, your brood assists to succeed or dodge.',
      },
      {
        level: 7,
        name: 'Many-Headed Monster',
        description:
          'Your swarm shares telepathy and can scout up to a mile away; sense through it within 120 ft.',
      },
      {
        level: 10,
        name: 'Living Network',
        description:
          'On a kill, a 30-ft feeding frenzy for 1 min, enemies make a Body Save or fall Prone and take (PB)d10 Necrotic; the area is empowered difficult terrain and attacks vs enemies there have Advantage.',
      },
      {
        level: 15,
        name: 'Net Of Claws',
        description:
          "Unleash swarm tactics: The Great Wall (10-ft cube of Full Cover), The Colony's Catch (15-ft grapple zone), Swarming Torrent (60-ft cone, prone + (PB)d10), or The Amorphous Horror (120-ft Frighten aura).",
      },
      {
        level: 20,
        name: 'The Flock',
        description:
          'Your AoEs double and colony benefits upgrade (e.g., Spider climb 120 ft., Termite 4x structures, Beetles +Prof + Presence AC).',
      },
      {
        level: 20,
        name: 'The Shepherd',
        description:
          'Once per Full Rest, when you would die, most of your brood dies instead (you lose Aspect features until it regrows over a Full Rest).',
      },
    ],
  },
  {
    id: 'controller-graviturge',
    name: 'Graviturge',
    role: 'controller',
    availableTo: ['Controller', 'Caster'],
    prerequisite: 'Requires at least 14 Focus, 12 Resonance',
    flavor:
      'A master of gravitons who changes the laws of physics at will, their enemies share the fate of unstable realms: crushed and broken into nothing.',
    features: [
      {
        level: 3,
        name: 'Downbeat',
        description:
          'Gain +2 Aether every other Aspect level; become a High-Caster using Focus with the Paracausal list + Kinetomancy group/Spatial school. Kinetomancer Attack = PB + (Focus x 2); Save DC = 6 + PB + Focus + Resonance. Damaging an Arte applies Gravitic Pressure (-10 speed, forced descent; stacks to -20).',
      },
      {
        level: 3,
        name: 'Inversion',
        description:
          'Reaction when a creature within 60 ft. jumps/flies/is moved/falls: invert its gravity (pull down prone, pull toward a surface, or reverse movement). Uses equal to your Focus Modifier per Full Rest.',
      },
      {
        level: 7,
        name: 'Decrescendo',
        description:
          "A creature under Gravitic Pressure that fails a Save or doesn't move gains a Crushing Weight stack (max 3; each -1 attacks/saves and -5 ft. speed).",
      },
      {
        level: 10,
        name: 'Crescendo',
        description:
          'Quick Action: intensify gravity in a 20-ft sphere for 1 min, difficult terrain, Crushing-Weight creatures take PB Force/turn, and prone creatures spend double to stand. Once per Full Rest.',
      },
      {
        level: 15,
        name: 'Arpeggio',
        description:
          "Once per round, increase a Pressure'd creature's forced movement by 10 ft. and change its direction; collisions deal Focus Force damage and knock both prone.",
      },
      {
        level: 20,
        name: 'Full Orchestration',
        description:
          "Once per combat (Quick Action), apply Gravitic Pressure to any number of creatures for 1 min: they can't gain Advantage, flying speed becomes 0, and 3-stack creatures are Restrained.",
      },
      {
        level: 20,
        name: 'That Glorious Symphony',
        description:
          "When a Pressure'd creature drops to 0 HP, choose Collapse (nearby enemies gain Pressure + a stack) or Resonance (an ally gains Advantage and free movement); during Full Orchestration, choose both.",
      },
    ],
  },
  {
    id: 'controller-mesmer',
    name: 'Mesmer',
    role: 'controller',
    availableTo: ['Controller', 'Coordinator'],
    prerequisite: 'Requires at least 12 Focus, 14 Presence',
    flavor:
      'Reality is belief, and the battle of nations mere theater. There are no more strings on you, puppet, now rewrite their script.',
    features: [
      {
        level: 3,
        name: 'The Mask',
        description:
          'Wear one Mask (Quick Action to swap): Authority (enemies -2 Saves vs you), Salvation (allies Advantage on their first Save each round), or Dread (a hostile that fails a roll gets Disadvantage on its next of that type).',
      },
      {
        level: 3,
        name: 'Reality Is Negotiable',
        description:
          'Once per round, Reaction: a creature within 60 ft. that succeeds a Save or hits rerolls and takes the lower result (failure -> Disadvantage next; success -> Psychic = PB).',
      },
      {
        level: 7,
        name: 'Hall of Mirrors',
        description:
          'Quick Action: a 20-ft Mirrored Space for 1 min, enemies treat all as having Partial Cover; a miss forces a Mind Save or the attack is redirected at random. Once per Full Rest.',
      },
      {
        level: 10,
        name: 'Madness is Freedom',
        description:
          'Reaction when a hostile fails a Save or acts under Disadvantage: impose a Delusion, False Threat, False Safety, or False Clarity until end of its next turn.',
      },
      {
        level: 15,
        name: 'The Fractured and Broken',
        description:
          'When a hostile fails two rolls in a round or is hit by two Mesmer effects, declare it Fractured (no Advantage, speed 0, all obscured); a further failure makes it Broken (loses an AP, no Legendary Resistance).',
      },
      {
        level: 20,
        name: 'All The World Is A Stage',
        description:
          'Once per combat, declare a Scene Change for 1 min: allies treat 9-or-lower as 10, enemies treat 11-or-higher as 10, and you choose which result a reroll uses (not natural 1s/20s).',
      },
      {
        level: 20,
        name: 'Put On A Smile',
        description:
          'When the Stage ends, choose Curtain Call (enemies within 60 ft. Mind Save or Stunned) or Encore (allies regain a Reaction/Action Point). Broken creatures auto-fail.',
      },
    ],
  },
  {
    id: 'controller-chain-of-the-abyss',
    name: 'Chain of the Abyss',
    role: 'controller',
    availableTo: ['Controller', 'Bruiser'],
    prerequisite: 'Requires at least 14 Might, 12 Focus',
    flavor:
      'A chosen Authority of Morvan, wielding the abilities of domination to rise to the top of the pyramid, to become a King, a Commander, an Unknowable God.',
    features: [
      {
        level: 3,
        name: 'Blackstone Shackles',
        description:
          'Once per round, a melee hit can Shackle a creature: -10 speed, no Disengage, Disadvantage to resist your forced movement (stacks to -20).',
      },
      {
        level: 3,
        name: 'Hooked Chains',
        description:
          'Once per round, a hit on a Shackled creature: Reel In (pull 10 ft.), Cast Down (Prone), or Bind (Body Save or Grappled).',
      },
      {
        level: 7,
        name: 'Sinking Pit',
        description:
          "Quick Action: a 15-ft Sinking Pit for 1 min, difficult terrain, Shackled creatures' speed becomes 0, and prone creatures take PB Bludgeoning/Necrotic at the start of their turn. Once per Full Rest.",
      },
      {
        level: 10,
        name: 'Dragging Darkness',
        description:
          'Reaction when a hostile within 20 ft. flees or escapes a grapple/forced movement: Body Save or be pulled 10 ft., knocked Prone, and take Necrotic = Focus (half movement + no Reactions on success).',
      },
      {
        level: 15,
        name: 'Soul Snare',
        description:
          'When a Grappled/Prone/Shackled creature fails a Save, ensnare its soul: no Advantage, -2 attacks/saves, and Psychic/Necrotic = PB at the start of its turn.',
      },
      {
        level: 20,
        name: 'Barbed Below',
        description:
          'Forced movement you impose on afflicted creatures deals +PB damage; attempts to teleport/reposition take 2x PB Force and fail.',
      },
      {
        level: 20,
        name: 'Hook, Line, and Sinker',
        description:
          "Once per combat, declare dominion for 1 min: Shackle any number of creatures you hit (speed 0), Grappled/Prone creatures are Restrained; when it ends they're knocked Prone and you gain temp HP (PB x Focus).",
      },
    ],
  },
  {
    id: 'controller-gaoler',
    name: 'Gaoler',
    role: 'controller',
    availableTo: ['Controller', 'Tank'],
    prerequisite: 'Requires at least 14 Might, 12 Focus',
    flavor:
      'A warden of the battlefield who places enemies under mandate and locks them down, there is no appeal, and no escape.',
    features: [
      {
        level: 3,
        name: 'Iron Mandate',
        description:
          'Quick Action: place a creature within 30 ft. under Mandate for 1 min, no Disengage, -10 speed, -2 to attacks vs anyone but you. One at a time.',
      },
      {
        level: 3,
        name: 'Lock and Key',
        description:
          'Once per round, Reaction when a Mandated creature moves 10+ ft. or uses a Quick Action/Reaction: speed becomes 0, the action fails (no resource spent), or it takes PB Force/Bludgeoning.',
      },
      {
        level: 7,
        name: 'Cellblock',
        description:
          'Quick Action: a 15-ft Cellblock for 1 min, difficult terrain, no Advantage, and leaving requires a Body Save or movement ends. Once per Full Rest.',
      },
      {
        level: 10,
        name: 'Sentence Served',
        description:
          'Once per round, when a Mandated creature fails a Save or fails to leave a Cellblock, impose Sentenced: no Reactions, -2 Saves, and Bludgeoning/Psychic = Focus at the start of its turn.',
      },
      {
        level: 15,
        name: 'No Appeal',
        description:
          'When a Mandated/Cellblocked creature succeeds a Save or negates your effect, force a reroll for the lower result (once per creature/round); a failure makes it Sentenced.',
      },
      {
        level: 20,
        name: 'Maximum Security',
        description:
          "Once per combat, escalate for 1 min: Mandate up to three creatures (speed 0, can't teleport/reposition); when it ends they're knocked Prone.",
      },
      {
        level: 20,
        name: 'Life Without Parole',
        description:
          "Once per combat, revoke a hostile creature's Action/Apex Action within 30 ft., the Action Points are lost and it is Stunned until end of its turn.",
      },
    ],
  },
  {
    id: 'controller-suppressor',
    name: 'Suppressor',
    role: 'controller',
    availableTo: ['Controller', 'Blaster'],
    prerequisite: 'Requires at least 14 Instinct, 12 Focus',
    flavor:
      'A master of area denial who carves the battlefield into kill zones no one dares cross.',
    features: [
      {
        level: 3,
        name: 'Kill Zone',
        description:
          "Quick Action: a 15-ft Kill Zone for 1 min, hostiles take Force/Fire = PB on entering and at the start of their turn, and can't benefit from Partial Cover. One at a time.",
      },
      {
        level: 3,
        name: 'Suppressive Fire',
        description:
          'Once per round, damaging a creature in your Kill Zone imposes Suppressed: -10 movement, Disadvantage on Opportunity Attacks, no Advantage on its next attack.',
      },
      {
        level: 7,
        name: 'Snapshot',
        description:
          'Reaction when a Suppressed creature first leaves a Kill Zone or attacks someone other than you: deal (PB + Focus) Force, no attack roll.',
      },
      {
        level: 10,
        name: 'Firestorm Pattern',
        description:
          'Maintain two Kill Zones; a creature in both takes damage from both and is Restrained until end of its turn (zones may overlap).',
      },
      {
        level: 15,
        name: 'No Safe Ground',
        description:
          'Leaving a Kill Zone forces a Body Save or (Focus)d6 Force and movement ends (half + -10 speed on success).',
      },
      {
        level: 20,
        name: 'Saturation Doctrine',
        description:
          "Once per encounter, enter a flowstate for 1 min: maintain three Kill Zones, their damage rises to (PB + Focus), and Suppressed creatures can't take Reactions.",
      },
      {
        level: 20,
        name: 'Area Denial Absolute',
        description:
          'Once per encounter, when a creature starts its turn in a Kill Zone, deal maximum damage, knock it Prone, and end its movement (no action).',
      },
    ],
  },
  {
    id: 'healer-luminary',
    name: 'Luminary',
    role: 'healer',
    availableTo: ['Healer', 'Blaster', 'Controller'],
    prerequisite: 'Requires at least 14 Conviction, 12 Presence',
    flavor:
      'The idealized figure of Light and Restoration, whose radiance does not merely burn, it reveals, and what is revealed cannot endure its judgment.',
    features: [
      {
        level: 3,
        name: 'Radiant Brand',
        description:
          "Dealing Radiant damage can Brand a creature for 1 min: it sheds light, can't be Invisible, is easier to track, and takes +PB Radiant the first time it's damaged each round. One Brand per creature.",
      },
      {
        level: 3,
        name: 'Lumen Discharge',
        description:
          'When you deal Radiant to a Branded creature, detonate the Brand: +Radiant (Presence + Focus), and enemies within 10 ft. make a Body Save for half that. Uses equal to your PB.',
      },
      {
        level: 7,
        name: 'Beacon of Condemnation',
        description:
          'A Branded creature takes -Presence to Saves and Disadvantage vs Blind/Restrain/Frighten; when it fails a Save, an ally within 30 ft. gains temp HP = Presence.',
      },
      {
        level: 10,
        name: 'Field of Revelation',
        description:
          'Quick Action: a 20-ft Field for 1 min, hostiles take PB Radiant and may be auto-Branded; allies gain Advantage vs Illusions/Charm. Uses equal to your Presence Modifier.',
      },
      {
        level: 15,
        name: 'Apotheosis of Light',
        description:
          'Instead of Radiant Brand, apply Apotheosis: PB Radiant at the start of each turn and the creature takes Radiant as one die higher (or double flat). Once per creature per Full Rest.',
      },
      {
        level: 20,
        name: 'Crown of the Unveiled',
        description:
          "While conscious, hostiles within 30 ft. can't be Invisible; Branded creatures there have Disadvantage attacking anyone but you; Radiant Brand's light doubles.",
      },
      {
        level: 20,
        name: 'Final Illumination',
        description:
          'Once per Full Rest (Reaction/Quick Action): a 30-ft column for one round, Soul Save or (Presence + Focus)d10 Radiant and Blinded; damaged creatures gain Apotheosis (ignoring immunity); all your Brands may detonate free.',
      },
    ],
  },
  {
    id: 'healer-plague-doctor',
    name: 'Plague Doctor',
    role: 'healer',
    availableTo: ['Healer', 'Coordinator', 'Controller'],
    prerequisite: 'Requires at least 14 Focus, 13 Resonance',
    flavor:
      "A raven of grim omen, to the faithful they bring healing and cures; to their enemies, disease, poison, and a doctor's note to the afterlife.",
    features: [
      {
        level: 3,
        name: 'Pestilence',
        description:
          'Dealing damage or healing can apply a Pestilence stack (max = PB) for 1 min. Hostiles take -1 attacks/saves and PB Poison per stack at turn start; allies gain PB temp HP and may ignore the next Fatigued/Poisoned/Diseased.',
      },
      {
        level: 3,
        name: 'Oncoming Epidemic',
        description:
          'When a creature hits max Pestilence stacks, spread a stack to another within 30 ft. (immediate hostile/friendly effect). Uses per round equal to your Resonance Modifier.',
      },
      {
        level: 7,
        name: 'Ratborn Remedy',
        description:
          'When a Pestilence/Poison effect damages a hostile: heal an ally (PB + Focus), grant Advantage on a save, or (if it dies) spread a stack. Once per creature per round.',
      },
      {
        level: 10,
        name: 'Fever Dream',
        description:
          'Quick Action: a 20-ft zone for 1 min, hostiles make a Mind Save or gain a stack and become Poisoned; allies gain Poison Resistance and double Pestilence benefits. Uses equal to your Resonance Modifier.',
      },
      {
        level: 15,
        name: 'Black Lung',
        description:
          'At 3+ stacks: -10 speed, Disadvantage on Concentration, and a Body Save or lose a Reaction. At 0 HP, transfer remaining stacks to a creature within 30 ft.',
      },
      {
        level: 20,
        name: "The Crow's Beak",
        description:
          "Once per Full Rest, declare a Pestilence creature's Save a failure (removing its stacks); if that drops it to 0 HP, an ally within 60 ft. heals half its max HP and loses a condition.",
      },
      {
        level: 20,
        name: 'Sickrooms And Shadows',
        description:
          "While conscious, a 30-ft aura: hostiles' healing is halved, allies' temp HP gains +Focus, and Hit Point changes let you add/remove a Pestilence stack (once per round).",
      },
    ],
  },
  {
    id: 'healer-saintbound',
    name: 'Saintbound',
    role: 'healer',
    availableTo: ['Healer', 'Tank', 'Bruiser'],
    prerequisite: 'Requires at least 14 Conviction, 12 Presence',
    flavor:
      'A vessel of sanctified burden who draws suffering away from the faithful and bears it as their own.',
    features: [
      {
        level: 3,
        name: 'Anointed',
        description:
          'After a Full Rest, Anoint yourself or a willing creature: Resistance to the first damage each round, and the first time it would drop below half HP it stays at half + gains Presence temp HP.',
      },
      {
        level: 3,
        name: 'Relicbearer',
        description:
          'When an ally within 30 ft. takes damage, reduce it by your Conviction Modifier and take that much Radiant (ignores Resistance/Immunity; halved for the Anointed). Once per creature per round.',
      },
      {
        level: 7,
        name: "Martyr's Voice",
        description:
          'When you take Relicbearer damage or an ally drops to 0 HP, impose Disadvantage on a hostile or grant an ally (PB + Presence) temp HP. Uses per round equal to your Presence Modifier.',
      },
      {
        level: 10,
        name: 'Blessed Burden',
        description:
          "Store damage you'd take from Saintbound features (up to PB x Conviction); release as Absolution (distribute as healing) or Censure (Radiant with Immunity Bypass 0.5).",
      },
      {
        level: 15,
        name: 'Hallowed Ground',
        description:
          'While conscious, a 30-ft aura: allies resist the first hit each round, and hostiles that damage allies take Presence Radiant (doubled for the Anointed).',
      },
      {
        level: 20,
        name: 'Merciful Murder',
        description:
          "Once per Full Rest, Reaction: negate lethal damage to an ally; the attacker takes that much Radiant and makes a Soul Save or is Stunned (and can't be resurrected by non-artifact means if slain).",
      },
      {
        level: 20,
        name: 'Chosen',
        description:
          "The first time you'd drop to 0 HP each combat, stay at 1, ignore conditions, and for 1 min: Resistance to all, auto-pass Concentration, and all damage taken becomes Blessed Burden (no limit). Then you fall.",
      },
    ],
  },
  {
    id: 'healer-hospitaller',
    name: 'Hospitaller',
    role: 'healer',
    availableTo: ['Healer', 'Bruiser', 'Scout', 'Coordinator'],
    prerequisite: 'Requires at least 12 Conviction, 12 Focus',
    flavor:
      'A battlefield medic who renders aid in the worst conditions and keeps the line from collapsing.',
    features: [
      {
        level: 3,
        name: 'Field Medic',
        description:
          'When you heal a creature, also grant one (two if it was at 0 HP): stand from Prone free, move half speed without provoking, or Advantage on its next Save.',
      },
      {
        level: 3,
        name: 'Altruistic Almanac',
        description:
          'While conscious, you and allies within 30 ft. gain Advantage on Medicine/Survival/Athletics and ignore hazard difficult terrain; Reaction to let an ally ignore Disadvantage.',
      },
      {
        level: 7,
        name: 'Lay On Steel',
        description:
          "Reaction when an ally within 30 ft. is hit: reduce the damage by (PB + Focus) and impose Disadvantage on the attacker's next attack. Uses equal to your Conviction Modifier.",
      },
      {
        level: 10,
        name: 'Sharing Sacrifice',
        description:
          'When you heal an ally, take True damage equal to half the healing; they gain Focus temp HP and Resistance to their next damage (doubled temp HP if used with Lay On Steel).',
      },
      {
        level: 15,
        name: 'Shelter and Sanctuary',
        description:
          'Quick Action: a mobile 15-ft sanctuary for 1 min, half cover, Conviction healing at turn start, partial cover on leaving. Move it 15 ft. each turn. Uses equal to your Focus Modifier.',
      },
      {
        level: 20,
        name: 'Unbroken Line',
        description:
          'Once per encounter, allies within 30 ft. who would drop to 0 HP instead drop to 1, may move + attack/act, and gain Advantage on Saves & no-Prone until your next turn (you gain a Fatigued level).',
      },
      {
        level: 20,
        name: 'Cura Et Gladius',
        description:
          'While conscious, healing grants the target +2 attacks/saves and bonus damage = PB on their next hit; reducing a hostile to 0 HP heals an ally Focus HP.',
      },
    ],
  },
  {
    id: 'healer-runesurgeon',
    name: 'Runesurgeon',
    role: 'healer',
    availableTo: ['All'],
    prerequisite: 'Requires at least 14 Focus, 12 Presence',
    flavor: 'A healer who inscribes runes on flesh and fate alike, pain is the most reliable ink.',
    features: [
      {
        level: 3,
        name: 'Sigiled Safehaven',
        description:
          'Quick Action: inscribe a Sigil of Shelter on an ally for 1 min, reduce the first damage each round by PB, reduce forced movement, and once drop to 1 HP instead of 0. Maintain a number equal to your Presence Modifier.',
      },
      {
        level: 3,
        name: 'Scar-Scribe',
        description:
          'Dealing damage or healing inscribes a Scar-Rune: Rune of Vigor (friendly: temp HP + bonus healing) or Rune of Ruin (hostile: bonus damage + Disadvantage on next Save).',
      },
      {
        level: 7,
        name: 'Branded Blade',
        description:
          'When an ally bearing a Scar-Rune hits a target, the rune jumps: Vigor heals the attacker and transfers as Ruin; Ruin deals Radiant/Force and transfers as Vigor.',
      },
      {
        level: 10,
        name: 'Mark of Mending',
        description:
          'Convert an expiring Scar-Rune into a Mark of Mending: Presence healing at turn start, Advantage on Death Saves, and bonus damage = half PB. Maintain a number equal to your Presence Modifier.',
      },
      {
        level: 15,
        name: 'Flesh and Fate',
        description:
          'Reaction: when a runed creature makes a Save, add a d6 (success -> resistance/immunity to the effect; failure -> no extra penalty). A hostile failing a Save lets you Sigil an ally.',
      },
      {
        level: 20,
        name: 'Brand Of Power',
        description:
          "Once per Full Rest, overwrite an ally's runes with a Brand of Power for 1 min: Advantage on attacks/saves, Focus healing at turn start, and +2xPB damage on its first hit (then a level of Exhaustion).",
      },
      {
        level: 20,
        name: 'Bearer Of A Thousand Marks',
        description:
          'Maintain twice your normal limit of runes; transfer all runes from a dying creature to another within 30 ft.; and apply two rune effects at once.',
      },
    ],
  },
  {
    id: 'healer-paraclete',
    name: 'Paraclete',
    role: 'healer',
    availableTo: ['Healer', 'Caster', 'Controller'],
    prerequisite: 'Requires at least 14 Focus, 13 Presence',
    flavor:
      'An arbiter of consequence who forbids outcomes from occurring, suspending damage and fate until the bill comes due on their terms.',
    features: [
      {
        level: 3,
        name: 'Edict of Stay',
        description:
          'When an ally within 30 ft. would take damage or a condition, suspend it until the end of their next turn (they gain Presence temp HP). One Stay per creature.',
      },
      {
        level: 3,
        name: 'Gentle Intercession',
        description:
          'When a Stayed effect resolves, choose Mercy (reduce damage by PB), Deferral (extend one round), or Transfer (redirect to a hostile within 30 ft.). Uses per round equal to your Presence Modifier.',
      },
      {
        level: 7,
        name: 'Voice of Delay',
        description:
          'When a hostile fails a Save you caused, Stay the effect even if immediate, it gains Disadvantage on attacks and no Advantage; allies who succeed under a Stay gain Focus temp HP.',
      },
      {
        level: 10,
        name: 'Suspended Sentence',
        description:
          'Quick Action: a 20-ft Suspension Field for 1 min, the first damage/condition each round is Stayed, resolving only when the creature leaves or the field ends. Uses equal to your Presence Modifier.',
      },
      {
        level: 15,
        name: 'Inevitability Deferred',
        description:
          'When a creature would resolve Stayed effects, collapse them all at once or erase one (collapsing heals allies / damages hostiles by Presence x number resolved).',
      },
      {
        level: 20,
        name: 'Final Intercession',
        description:
          "Once per Full Rest, creatures within 60 ft. that would drop to 0 HP stay at 1, all their effects Stayed indefinitely; for 1 min they gain Advantage on Saves and can't be Stunned/Paralyzed/Unconscious. When it ends, all resolve at once.",
      },
      {
        level: 20,
        name: "The Paraclete's Judgment",
        description:
          "While conscious, chosen creatures with Stayed effects can't crit; allies resolve Stays with Advantage on saves, hostiles with Disadvantage. Resolving a Stay lets you Edict another effect.",
      },
    ],
  },
  {
    id: 'coordinator-bard',
    name: 'Bard',
    role: 'coordinator',
    availableTo: ['Coordinator', 'Blaster', 'Caster'],
    prerequisite: 'Requires at least 13 Focus, 15 Presence',
    flavor:
      'A weaver of spellsong who inspires allies and bends magic to the rhythm of performance.',
    features: [
      {
        level: 3,
        name: 'The Magic of Music',
        description:
          'Gain +1 Aether each Aspect level; become a Mid-Caster using Presence with the Arcane list + Boon group. Spellsong Attack = PB + Presence + Focus; Save DC = 6 + PB + Presence + Resonance. Use any instrument as a focus.',
      },
      {
        level: 3,
        name: 'An Inspiring Song',
        description:
          'Quick Action (1 Aether): grant an Inspiration Die (d6, scaling d8/d10/d12 at 7/10/15) to add to one d20 Test within 10 min. Uses equal to your Presence Modifier.',
      },
      {
        level: 7,
        name: 'Master of Few, Novice of All',
        description:
          'Add half your PB (round down) to any Attribute check that lacks your Proficiency Bonus; increase two proficient skills by one step.',
      },
      {
        level: 10,
        name: 'Blanketing Presence',
        description:
          'Focused Action (1 Aether): a performance until end of next turn, you and allies within 50 ft. who can hear you gain Advantage on Saves vs Charmed/Enraged/Frightened/Taunted. Continue as a Quick Action.',
      },
      {
        level: 15,
        name: 'Magic Is My Muse',
        description:
          'Learn three Artes from any one list or group (Tier you can cast or cantrips) as if on your list.',
      },
      {
        level: 20,
        name: 'Musical Majesty',
        description:
          'Learn two Elder Tongue Artes (cast each free once per Full Rest, with an extra target within 10 ft.); learn two more Muse Artes; gain +1 caster level.',
      },
      {
        level: 20,
        name: 'Symphony Of Success',
        description:
          'Focused Action: choose allies (= Presence) within 90 ft. for 1 min, +Focus to attacks/saves and free casting up to a Tier equal to your Resonance Modifier (or reduce higher-Tier costs by it).',
      },
    ],
  },
  {
    id: 'coordinator-scribe',
    name: 'Scribe',
    role: 'coordinator',
    availableTo: ['All'],
    prerequisite: 'Requires at least 14 Focus, 14 Presence',
    flavor:
      'A bureaucrat of battle who writes faster than reality can object, momentum is a matter of documentation.',
    features: [
      {
        level: 3,
        name: 'Page-Turner',
        description:
          'Once per round, "Note" a roll type vs a hostile after an ally succeeds (or it fails vs an ally); the next different ally making that roll vs that target gains Advantage.',
      },
      {
        level: 3,
        name: 'Written Law',
        description:
          'Maintain one Law (swap as a Quick Action): Sequence (first ally each round +2 attacks/saves), Continuity (after a success, next ally +10 speed and ignores OAs), or Precedent (first hostile to fail a roll type has Disadvantage next time).',
      },
      {
        level: 7,
        name: 'Perfect Copy',
        description:
          "Reaction: copy an ally's Advantage/bonus/temp HP to another ally within 30 ft. Uses per round equal to your Presence Modifier.",
      },
      {
        level: 10,
        name: 'Rewritten',
        description:
          'Reaction when a creature within 60 ft. fails a d20: reroll (success -> PB temp HP; failure -> Disadvantage next). Uses equal to your Focus Modifier per Full Rest.',
      },
      {
        level: 15,
        name: 'In The Margin',
        description:
          'Once per round, adjust an Advantage/Disadvantage roll within 30 ft. (treat an Advantage die as a 10, or ignore a Disadvantage die), and mark a creature Noted.',
      },
      {
        level: 20,
        name: 'Quill and Ink',
        description:
          'Once per combat, for 1 min: Page-Turner Notes two results/round, Perfect Copy ignores its limit, and Rewritten needs no Reaction (then Rewritten is spent until a Full Rest).',
      },
      {
        level: 20,
        name: 'Well Read',
        description:
          "While conscious, allies within 30 ft. ignore Disadvantage on their first roll each round; hostiles can't gain Advantage the first time each round; repeated actions take -2.",
      },
    ],
  },
  {
    id: 'coordinator-bannerlord',
    name: 'Bannerlord',
    role: 'coordinator',
    availableTo: ['Coordinator', 'Tank', 'Bruiser'],
    prerequisite: 'Proficiency with Medium and Heavy Armor, 14 Conviction',
    flavor:
      'A standard-bearer who turns bodies and banners into fortifications and refuses to let the line fall.',
    features: [
      {
        level: 3,
        name: 'Standard Bearer',
        description:
          "Quick Action: plant/carry a Standard, allies within 20 ft. gain +1 AC & Saves and can't be Frightened; you gain Resistance to physical damage from non-empowered sources. One at a time.",
      },
      {
        level: 3,
        name: 'Shield Wall',
        description:
          'While within 10 ft. of an ally, you both gain Partial Cover and hostiles treat adjacent spaces as difficult terrain (Greater Cover for you with 3+ allies near).',
      },
      {
        level: 7,
        name: 'Hold The Line',
        description:
          'Once per round, when a hostile within 20 ft. of your Standard leaves your side or forces an ally to move: speed 0, Disadvantage on its next attack, or no Reactions.',
      },
      {
        level: 10,
        name: 'Rally Point',
        description:
          'Quick Action: designate your Standard a Rally Point for 1 min, allies starting their turn within 20 ft. gain Presence temp HP and may reroll a failed Save; a creature reduced to 0 there drops to 1 (ending it). Once per Full Rest.',
      },
      {
        level: 15,
        name: 'Defiant Defense',
        description:
          "Within 20 ft. of your Standard, allies resist the first damage each round and attackers take -2 (doubled while you're below half HP).",
      },
      {
        level: 20,
        name: 'Line In The Sand',
        description:
          "Once per combat, fortify around your Standard for 1 min: allies within 30 ft. can't be moved, hostiles face difficult terrain and no Advantage, and the first damage each round is reduced by PB (then the Standard is destroyed until a Full Rest).",
      },
      {
        level: 20,
        name: 'Valiant Last Stand',
        description:
          "The first time you'd drop to 0 HP near your Standard, stay at 1 and for 1 min gain Resistance to all, ignore conditions, and grant allies within 30 ft. Advantage on attacks/saves. Then you fall.",
      },
    ],
  },
  {
    id: 'coordinator-logistician',
    name: 'Logistician',
    role: 'coordinator',
    availableTo: ['Coordinator', 'Scout', 'Controller'],
    prerequisite: 'Requires at least 12 Focus, 12 Presence',
    flavor:
      'A quartermaster of war who keeps allies supplied, positioned, and operating at peak efficiency, even in a skirmish, they fight on the scale of campaigns.',
    features: [
      {
        level: 3,
        name: 'Supply And Demand',
        description:
          "Once per round, when a creature within 60 ft. expends a limited resource, declare a Supply Shift: +2 to an ally's next d20 Test or -2 to a hostile's.",
      },
      {
        level: 3,
        name: 'Reserve Stock',
        description:
          "After a Full Rest, gain Reserve Tokens (= Focus, min 1). Reaction: spend one to replenish an ally's Reaction, Action Point, Aether, Stamina, class resource, or charge within 30 ft.",
      },
      {
        level: 7,
        name: 'Resupply',
        description:
          'Quick Action: an ally within 30 ft. regains a non-once-per-rest feature, gains Presence temp HP, and moves half speed without provoking. Uses equal to your Presence Modifier.',
      },
      {
        level: 10,
        name: 'Marching Order',
        description:
          'Assign allies within 60 ft. a role: Vanguard (+10 speed, Advantage Initiative), Support (aid grants Advantage), or Rear Guard (resist first damage each round).',
      },
      {
        level: 15,
        name: 'Optimize and Improve',
        description:
          'Once per round, when an ally succeeds via Advantage/reroll/bonus from a Coordinator: extend it to another roll, convert it to a flat +5, or share it with another ally.',
      },
      {
        level: 20,
        name: 'How Wars Are Won',
        description:
          "While conscious, allies gain an extra Reaction or Action Point each round; hostiles can't regain Reactions off-turn; and the first non-once-per-rest feature each ally spends between rests isn't expended.",
      },
      {
        level: 20,
        name: 'Contingency Plan',
        description:
          'Once per Full Rest, on a catastrophic failure (party wipe, lost objective): reposition allies within 30 ft., restore them to half HP, and end their conditions, then combat ends or becomes a retreat scene.',
      },
    ],
  },
  {
    id: 'coordinator-silver-tongue',
    name: 'Silver-Tongue',
    role: 'coordinator',
    availableTo: ['Coordinator', 'Controller'],
    prerequisite: 'Requires at least 12 Focus, 16 Presence',
    flavor:
      'A master manipulator whose words bind, beguile, and rewrite outcomes, never truly unprepared for what to say.',
    features: [
      {
        level: 3,
        name: 'Smooth Talk',
        description:
          'Advantage on Persuasion/Deception/Leadership. Once per round on a social success: the creature takes -2 to its next Save, Disadvantage on its next contest, or you gain Advantage on your next interaction.',
      },
      {
        level: 3,
        name: 'Charm and Guile',
        description:
          "When you impose Charmed/Frightened/Enraged/Taunted, the target rolls the initial Save with Disadvantage; on a success it's instead Hesitant (-10 movement, no Reactions) until end of its next turn.",
      },
      {
        level: 7,
        name: 'Voice Of Reason',
        description:
          'Reaction when a creature within 30 ft. targets someone: Mind/Soul Save or it must pick a different target or a non-hostile Action (Disadvantage on a success). Uses equal to your Presence Modifier.',
      },
      {
        level: 10,
        name: 'Too Good To Refuse',
        description:
          "When a creature accepts a choice you present, it is Bound by Agreement for 1 min: Disadvantage on Saves vs you, can't knowingly act against you, and takes (Focus)d8 Psychic + Stunned if it breaks the deal. Once per encounter per creature.",
      },
      {
        level: 15,
        name: 'Twist The Knife',
        description:
          'Once per round, when a creature fails a Save vs you or is Bound/Hesitant: extend the duration a round, impose Disadvantage on its next attack/save, or deal (PB + Presence) Psychic.',
      },
      {
        level: 20,
        name: 'The Fish And The Shark',
        description:
          "Once per combat/scene, swap a roll outcome within 30 ft. (failure<->success) with an in-character justification the DM finds plausible (can't affect instant death, mythic phases, or world-ending consequences).",
      },
      {
        level: 20,
        name: 'Deal With The Devil',
        description:
          'Once per campaign arc, on a failed roll, propose an outcome and accept a DM-chosen concession; if convinced, the failure becomes a success and the concession becomes canon (otherwise you still gain Advantage on your next roll).',
      },
    ],
  },
];
