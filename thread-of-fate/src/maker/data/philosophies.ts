import type { PhilosophyDef } from '@/maker/types';

/**
 * Philosophies of Convergence, transcribed from "Philosophies Of Convergence.md".
 * Each replaces traditional alignment and grants talent proficiencies plus features.
 */
export const PHILOSOPHIES: PhilosophyDef[] = [
  {
    id: 'absurdism',
    name: 'Absurdism',
    title: 'The Absurdist',
    quote: "Don't think so hard, it's not meant to make sense.",
    overview:
      "The Absurdist operates in a world they fully accept as chaotic and irrational. If nothing has meaning, why stress? There's liberation in acceptance; they do not balk at their own insignificance, and even their own death is inconsequential.",
    features: [
      {
        name: 'Dauntless Acceptance',
        description:
          'When a Supernatural, Eldritch, or Metaphysical creature would force you or a nearby ally (within 30 ft.) to make a Mind or Soul Saving Throw, once per Full Rest you may add your Conviction Modifier to the roll.',
      },
      {
        name: 'Unerring Disposition',
        description:
          'You may make Saving Throws against the Charmed or Frightened Conditions with Advantage.',
      },
      {
        name: 'Education Through Exposure',
        description:
          'You gain Proficiency in Occultism and Theology (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'altruism',
    name: 'Altruism',
    title: 'The Bleeding Heart',
    quote: "If we don't care for each other, no one will. It's only right.",
    overview:
      'Driven by an innate concern for others, these selfless individuals do what they believe is best for everyone, satisfied by caring for their kin even if it means going without. Their nature lends deep insight into the needs of those around them.',
    features: [
      {
        name: 'Unconditional Kindness',
        description: 'N/A, feature text pending in the source.',
        todo: true,
      },
      {
        name: 'Empathic Impulse',
        description:
          'Advantage on Checks to assess the emotional or psychological state of a creature you engage with for at least five minutes.',
      },
      {
        name: 'Shirt Off My Back',
        description:
          'You gain Proficiency in Persuasion and Intuition (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'anarchism',
    name: 'Anarchism',
    title: 'The Anarchist',
    quote: 'Down with the establishment!',
    overview:
      'The Anarchist is driven by a singular ideal: Freedom. This pushes them to abolish any institution that furthers authority, coercion, or hierarchy. The spirit they carry for true freedom is something everyone can understand.',
    features: [
      {
        name: 'Antiestablishmentarianism',
        description:
          "Advantage on Intuition and Investigation Checks, and a bonus equal to your Focus Modifier on Checks/Saves to assess an institution and its staff's purpose and intentions.",
      },
      {
        name: 'Improvised Tactics',
        description:
          'When making a Tinkering Check to craft explosives or improvised weaponry, add half your Conviction modifier (rounded down).',
      },
      {
        name: 'Infamous Cookbook',
        description:
          'You gain Proficiency in Technology and Tinkering (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'cynicism',
    name: 'Cynicism',
    title: 'The Cynic',
    quote: "I do what I feel is right, your rules don't matter.",
    overview:
      'Cynics cast aside conventional desires for wealth, power, and glory in favor of a shamelessly naturalist approach to living. They reject conventional manners, tread where they like, and indulge in compulsive instinct.',
    features: [
      {
        name: 'Skeptical Insight',
        description:
          'When subjected to a Deception, Intimidation, Leadership, or Persuasion Check, impose a penalty on the roll DC equal to your Conviction Modifier.',
      },
      {
        name: 'Yeah, Sure, Whatever',
        description: 'Advantage on Saving Throws against being Enraged or Taunted.',
      },
      {
        name: 'Inspired by Instinct',
        description:
          'You gain Proficiency in Animal Magnetism and Naturalism (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'deontology',
    name: 'Deontology',
    title: 'The Lawbringer',
    quote: 'Duty is righteous, and I live to do my duty.',
    overview:
      'To maintain order, someone must impose the structure of rules, that drives the Lawbringer. They ensure social order is maintained by acting as its enforcer, putting their faith in the consensus "highest good" rather than consequences.',
    features: [
      {
        name: 'Something Of A Peacekeeper',
        description:
          'Advantage on Persuasion, Intuition, Investigation, and Leadership Checks made to interact with guards, officers, agents, or similar authority figures.',
      },
      {
        name: 'I Am The Law!',
        description:
          'When you make an Intimidation Check, add a bonus equal to your Conviction Modifier.',
      },
      {
        name: 'Serve & Protect',
        description:
          'You gain Proficiency in Investigation and Leadership (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'determinism',
    name: 'Determinism',
    title: 'The Analyst',
    quote: 'This is all a natural result of cause and effect, set in motion by a cascade.',
    overview:
      "The Analyst roots their mindset in raw causality, the natural results of things doing what they're meant to. Logic is their dogma, and reasonable deduction their tool for engaging with the world.",
    features: [
      {
        name: "It's Elementary!",
        description:
          'Spend an hour studying a creature, object, or structure to gain insight into how it works, how it got there, or how it was made. Usable a number of times equal to your Focus Modifier (not during a Rest).',
      },
      {
        name: 'The Game Is Afoot',
        description:
          'Advantage on Intuition and Investigation Checks to identify an unnatural characteristic of a subject.',
      },
      {
        name: 'A Forgone Conclusion',
        description:
          'You gain Proficiency in Investigation and Naturalism (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'egalitarianism',
    name: 'Egalitarianism',
    title: 'The Egalitarian',
    quote: "It doesn't matter where we come from or what we have, every life is equal.",
    overview:
      "The People's Person believes all people are equal regardless of opportunity, wealth, or status. They work to reduce the disparity brought about by social inequity.",
    features: [
      {
        name: 'Speaker Of The People',
        description:
          'Advantage on Persuasion and Leadership when engaging common/low-class creatures, but Disadvantage when engaging upper-class and high-society figures.',
      },
      {
        name: 'A Utopian Dream',
        description:
          'Once per Quick Rest, apply a bonus equal to your Conviction Modifier to a Persuasion or Leadership Check.',
      },
      {
        name: 'Reading The Room',
        description:
          'After 24 hours in a settlement you sense its general sentiment (Desperate -> Uplifted); a Check can reveal the cause.',
      },
    ],
  },
  {
    id: 'eternalism',
    name: 'Eternalism',
    title: 'The Displaced',
    quote: "It's all connected, we thought we knew but we had no idea...",
    overview:
      'The Displaced has been made aware of the infinite beyond their world, understanding that all events that were, are, and could be coexist simultaneously. Of all philosophies, they sit closest to the true nature of the Great Forest.',
    features: [
      {
        name: 'Not Where, But When',
        description:
          'On a Full Rest, roll 1d20 and record it; replace any attack roll, save, or check made by you or a creature you see (once per turn). Unused rolls are lost on a Full Rest.',
      },
      {
        name: 'One Had To Get It Right!',
        description:
          'Once per Full Rest, when you roll a natural 1, treat it as a natural 20 instead (your next natural 20 is not a Critical Success).',
      },
      {
        name: 'Time and Place',
        description:
          'You gain Proficiency in Arcana and Occultism (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'fatalism',
    name: 'Fatalism',
    title: 'The Fatebound',
    quote: "If it's writ in the stars, then it's meant to be, and therefore must be...",
    overview:
      'The Fatebound believe they are powerless to affect more than what they can immediately do, surrendering the natural order to powers incomprehensible. In this surrender they find a peace many spend years struggling to achieve. Fate and Destiny are their gods.',
    features: [
      {
        name: "It Hasn't Come To Pass",
        description:
          'Immunity to the Doomed Condition, and Advantage on Saving Throws against effects that would inflict the Severed Condition.',
      },
      {
        name: 'The Threads Of Fate',
        description:
          'After five minutes studying a creature, object, or structure, make an Intuition or Investigation Check to learn if it is Arcane, Divine, Eldritch, or Paracausal in origin.',
      },
      {
        name: 'The Powers That Be',
        description:
          'You gain Proficiency in Occultism and Theology (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'hedonism',
    name: 'Hedonism',
    title: 'The Self-Indulgent',
    quote: "Might as well enjoy ourselves, it's the whole point of living!",
    overview:
      'The Self-Indulgent lives by a simple creed: the point of life is to partake in every pleasure it has to offer. This philosophy grants insight into how pleasures drive and motivate people.',
    features: [
      {
        name: 'The Simple Pleasures',
        description:
          'After 5 minutes engaging a creature, make an Intuition Check to learn something it enjoys; use it to grant Advantage on a Persuasion, Deception, or Leadership Check to gain compliance.',
      },
      {
        name: 'Time Well Spent',
        description:
          'When resting while eating, sleeping, or indulging a hobby, gain the full benefits of that Rest in half the time.',
      },
      {
        name: 'What We Tell Ourselves',
        description:
          'You gain Proficiency in Deception and Intuition (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'idealism',
    name: 'Idealism',
    title: 'The Optimist',
    quote: "It only needs to be this way if we choose it...and we don't have to.",
    overview:
      "The Optimist does good not because they have to, but because they believe it's right. The stuff storybook heroes are made of, their contagiously upbeat energy inspires hope to the hopeless.",
    features: [
      {
        name: 'Doing Better',
        description:
          'When you complete a Quick or Full Rest, chosen friendly creatures within 100 ft. gain Advantage on a single Talent Check of their choice within the next hour.',
      },
      {
        name: 'An Ideal World',
        description:
          'Once per Full Rest, after rolling a Persuasion or Leadership Check you may add your Conviction Modifier.',
      },
      {
        name: 'Unto Utopia',
        description:
          'You gain Proficiency in Leadership; after a Rest, give an inspiring performance granting up to six allies within 30 ft. Temporary HP equal to your character level.',
      },
    ],
  },
  {
    id: 'materialism',
    name: 'Materialism',
    title: 'The Monist',
    quote: "We are all we are, and when it's done. It's done.",
    overview:
      'The Monist views life as a product of the physical world, soul and body as two parts of a single existence. Gods, Anomalies, and the Unknowable are abnormalities better off non-existent.',
    features: [
      {
        name: 'Atheistic Bend',
        description:
          'Advantage on Saving Throws against harmful effects from creatures with the Divine or Eldritch tags.',
      },
      {
        name: 'Everything Is Energy',
        description:
          'When casting Recovery, Warding, Enhancement, Spatial, or Chronomancy Artes, add half your Conviction Modifier (rounded down) to the effect.',
      },
      {
        name: 'Fundamental Elements',
        description:
          'You gain Proficiency in Arcana and Naturalism (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'nihilism',
    name: 'Nihilism',
    title: 'The Nihilist',
    quote: "Why bother? It's all meaningless after all.",
    overview:
      'The Nihilist argues that life is meaningless, morality baseless, and truth impossible to grasp. They hold a detached perspective and have little qualms about doing anything, even the socially reprehensible.',
    features: [
      {
        name: 'God Is Dead',
        description:
          'Gain a bonus to Saving Throws against effects from creatures with the Divine tag equal to your Conviction Modifier.',
      },
      {
        name: 'Moral Indifference',
        description:
          'Immune to effects that would alter your emotional state; Advantage on Saves against the Charmed and Frightened Conditions.',
      },
      {
        name: 'Callus Edge',
        description:
          'You gain Proficiency in Deception, Intimidation, and Performance (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'stoicism',
    name: 'Stoicism',
    title: 'The Stoic',
    quote: "There's a purpose to it all, guiding us all towards harmony.",
    overview:
      'The Stoic believes the universe has a natural flow and order, and that we should aspire to find virtuous balance with it. Cultivating emotional self-control and rational judgment is a virtue of the highest good.',
    features: [
      {
        name: 'Virtue Through Discipline',
        description:
          'Advantage on Saving Throws against the Charmed, Enraged, Frightened, and Taunted Conditions.',
      },
      {
        name: 'Internal Logos',
        description:
          'Advantage on Arcana, Occultism, and Theology Checks to assess unnatural or uncharacteristic qualities in your surroundings.',
      },
      {
        name: 'One With The Flow',
        description:
          'You gain Proficiency in Medicine and Naturalism (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'transhumanism',
    name: 'Transhumanism',
    title: 'The Futurist',
    quote: 'I labor today, for a better tomorrow...no matter the cost.',
    overview:
      'The Futurist has little heed for the now, their eyes are set on the future. They work to surpass mortal limits through magical alteration, augmentation, or experimentation; ethics are merely suggestions.',
    features: [
      {
        name: 'Hazard Of The Job',
        description:
          "You've developed a mild resistance to physical pain: Advantage on Saving Throws against the Stunned or Sluggish Conditions.",
      },
      {
        name: 'The Weakness Of Flesh',
        description:
          'Your Safe-Limit for Prosthesis and Cyberware increases by half your Presence Modifier (rounded down).',
      },
      {
        name: 'Tech Savvy',
        description:
          'You gain Proficiency in Driving, Tinkering, and Technology (Expertise if already proficient).',
      },
    ],
  },
  {
    id: 'utilitarianism',
    name: 'Utilitarianism',
    title: 'The Consequentialist',
    quote: "If it's for the greater good, I'll do what is needed.",
    overview:
      'The Consequentialist asks whether an action benefits the greatest number, regardless of the moral means used. This can lead to unethical choices, but it matters little to them as long as more people benefit in the long run.',
    features: [
      {
        name: 'Ends Justifies Means',
        description:
          'A number of times equal to your Focus Modifier, assess the collateral costs of an action with a successful Intuition or Investigation Check, gaining insight into its consequences.',
      },
      {
        name: 'Whatever The Cost',
        description:
          "Disadvantage on Death Saving Throws, but you receive additional healing from friendly sources equal to your Conviction Modifier + the source's Presence Modifier.",
      },
      {
        name: 'Motive and Intention',
        description:
          'You gain Proficiency in Historical Lore and Sleight Of Hand (Expertise if already proficient).',
      },
    ],
  },
];

/** Talent proficiencies each Philosophy grants (Expertise if already proficient). */
const PHILOSOPHY_SKILL_GRANTS: Record<string, string[]> = {
  absurdism: ['Occultism', 'Theology'],
  altruism: ['Persuasion', 'Intuition'],
  anarchism: ['Technology', 'Tinkering'],
  cynicism: ['Animal Magnetism', 'Naturalism'],
  deontology: ['Investigation', 'Leadership'],
  determinism: ['Investigation', 'Naturalism'],
  egalitarianism: [],
  eternalism: ['Arcana', 'Occultism'],
  fatalism: ['Occultism', 'Theology'],
  hedonism: ['Deception', 'Intuition'],
  idealism: ['Leadership'],
  materialism: ['Arcana', 'Naturalism'],
  nihilism: ['Deception', 'Intimidation', 'Performance'],
  stoicism: ['Medicine', 'Naturalism'],
  transhumanism: ['Driving', 'Tinkering', 'Technology'],
  utilitarianism: ['Historical Lore', 'Sleight of Hand'],
};
PHILOSOPHIES.forEach((p) => {
  p.grantsSkills = PHILOSOPHY_SKILL_GRANTS[p.id] ?? [];
});
