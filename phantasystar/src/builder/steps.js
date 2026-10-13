import { needsMet } from './draft.js';
import { ABILITY_IDS, abilitiesDone, currentLimited } from './abilities.js';
import { currentFeats, featsBasis } from './feats.js';
import { skillsBasis } from './skills.js';
import { hpReady } from './hp.js';
import { techniquesBasis } from './techniques.js';
import { equipmentBasis } from './equipment.js';

const DEFAULT_NAME = 'New Character';

const named = (name) => {
  const n = String(name ?? '').trim();
  return n !== '' && n !== DEFAULT_NAME;
};

const need = (d, key) => (d.profession?.needs?.[key] ?? 0) + (d.path?.needs?.[key] ?? 0);

export const abilityPoints = (d) => need(d, 'later:abilities') - Object.keys(currentFeats(d)).length - need(d, 'later:abilityPicks');

export const limitedDone = (d) => Object.keys(currentLimited(d)).length >= need(d, 'later:abilityPicks');

export const featsDone = (d) => !Object.keys(currentFeats(d)).length || d.abilities.featsFor === featsBasis(d);

const filled = (...values) => values.some((v) => String(v ?? '').trim() !== '');

export const STEPS = [
  {
    id: 'concept',
    label: 'Concept',
    title: 'Create a Concept',
    guide: 'Choose a few words that sum up your character. You can change this at any time during or after your build.',
    done: (d) => named(d.concept.name),
  },
  {
    id: 'species',
    label: 'Species',
    title: 'Choose a Species',
    guide: 'Characters come from a variety of worlds, cultures, and environments. Each species has distinct physical characteristics and features. Your choice determines your size, speed, senses and traits.',
    category: 'Species',
    cards: true,
    done: (d) => needsMet(d.species, d),
  },
  {
    id: 'background',
    label: 'Background',
    title: 'Choose a Background',
    guide: 'What events shaped you up to now? Your background represents your past experiences and the characteristics you gained from them. Your choice provides skill ranks, proficiencies and starting gear.',
    category: 'Backgrounds',
    done: (d) => needsMet(d.background, d),
  },
  {
    id: 'profession',
    label: 'Profession',
    title: 'Choose a Profession',
    guide: 'Every hero is part of a profession, which determines their primary capabilities. Your choice of profession determines your hit points, bonuses, features and techniques.',
    category: 'Professions',
    cards: true,
    done: (d) => needsMet(d.profession, d) && hpReady(d.hp, d.level, d.hp.die),
  },
  {
    id: 'abilities',
    label: 'Abilities',
    title: 'Determine Abilities',
    guide: 'Your abilities define your physical and mental characteristics. Each ability has a modifier. A modifier of 0 is considered average, while positive and negative numbers are degrees above and below that. Choose a starting modifier below for each ability, then add 1 to two of them.',
    done: (d) => abilitiesDone(d.abilities, abilityPoints(d)) && featsDone(d) && limitedDone(d),
  },
  {
    id: 'skills',
    label: 'Skills',
    title: 'Assign Skill Ranks',
    guide: 'Assign the skill ranks and proficiencies you gained from your origin (species and background), profession and starting level.',
    done: (d) => !!d.skills.doneFor && d.skills.doneFor === skillsBasis(d),
  },
  {
    id: 'techniques',
    label: 'Techniques',
    title: 'Choose Techniques',
    guide: 'Choose the techniques granted by your profession. Some professions gain techniques at higher level while others don\'t gain any techniques.',
    done: (d) => !!d.techniques.doneFor && d.techniques.doneFor === techniquesBasis(d),
  },
  {
    id: 'equipment',
    label: 'Equipment',
    title: 'Choose Starting Equipment',
    guide: 'Choose between (A) your profession\'s starting equipment, or (B) a flat sum of money you can use to buy your own gear instead.',
    done: (d) => !!d.equipment.doneFor && d.equipment.doneFor === equipmentBasis(d),
  },
  {
    id: 'story',
    label: 'Story',
    title: 'Finalize Your Origin',
    guide: 'Beyond the numbers, who are you? A story bond is a connection to an ideal, event, person, or place that helps drive your sense of purpose. Choose at least one story bond (see Chap. 3 or create your own), define relevant events in your past and describe how you look.',
    done: (d) => filled(d.story.storyBonds, d.story.history, d.story.appearance),
  },
];

export const stepsFor = () => STEPS;

export const stepDone = (step, draft) => !!step.done(draft);

export const unfinishedSteps = (draft) => stepsFor(draft).filter((s) => !stepDone(s, draft));

export const isBlankCharacter = (sheet = {}) =>
  !String(sheet.species ?? '').trim()
  && !String(sheet.background ?? '').trim()
  && !String(sheet.profession ?? '').trim()
  && (Number(sheet.level) || 1) === 1
  && !(Number(sheet.xp) > 0)
  && ABILITY_IDS.every((id) => !Number(sheet.abilities?.[id]))
  && !(sheet.features?.length)
  && !(sheet.attacks?.length);
