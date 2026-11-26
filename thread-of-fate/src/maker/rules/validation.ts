import type { ValidationWarning } from '@/maker/types';
import type { CharacterDraft } from '@/maker/draftModel';
import { LEVEL_CONFIG } from '@/maker/data/constants';
import { classById } from '@/maker/data';
import { allAssigned, isValidPointBuy } from './stats';
import {
  baseScores,
  hasCasterAccess,
  selectedRace,
  totalLevel,
  growthPointsAvailable,
  growthAllocated,
} from './selectors';
import { bpRemaining, missingDetails } from './backgroundPoints';

/** Produce all validation warnings for the current draft. */
export function validateDraft(draft: CharacterDraft): ValidationWarning[] {
  const w: ValidationWarning[] = [];
  const err = (step: ValidationWarning['step'], code: string, message: string) =>
    w.push({ step, code, message, severity: 'error' });
  const warn = (step: ValidationWarning['step'], code: string, message: string) =>
    w.push({ step, code, message, severity: 'warning' });

  // --- Stats ---
  if (draft.stats.method === 'rolling' && !draft.stats.chosenRollSetId) {
    err('stats', 'no-roll-set', "You haven't locked in a rolled array yet.");
  }
  if (!allAssigned(draft.stats.assigned)) {
    err('stats', 'unassigned', 'Not all six attributes have been assigned.');
  }
  if (draft.stats.method === 'pointBuy' && !isValidPointBuy(baseScores(draft))) {
    err(
      'stats',
      'invalid-point-buy',
      'Your point-buy spend is invalid (check min/max and points).',
    );
  }

  // --- Background ---
  if (bpRemaining(draft.background.selectedTraits) < 0) {
    err('background', 'bp-overspent', 'You have overspent your Background Points.');
  }
  if (missingDetails(draft.background.selectedTraits).length > 0) {
    warn('background', 'bp-details', 'Some Background traits still need a detail/selection.');
  }

  // --- Equipment ---
  if (!draft.equipment.setting) {
    warn('equipment', 'no-setting', 'No tech setting selected.');
  }

  // --- Philosophy ---
  const hasPhilosophy =
    !!draft.philosophy.selectedPhilosophyId ||
    (draft.philosophy.custom && draft.philosophy.custom.name.trim());
  if (!hasPhilosophy) {
    err('philosophy', 'no-philosophy', 'Make sure to choose a Philosophy!');
  }

  // --- Race ---
  if (!draft.race.selectedRaceId) {
    err('race', 'no-race', 'No race selected.');
  } else {
    const race = selectedRace(draft);
    if (race && race.subraces.length > 0 && !draft.race.selectedSubraceId) {
      err('race', 'no-subrace', `${race.name} has subraces, choose one.`);
    }
    if (race?.skillChoices && draft.race.selectedSkills.length < race.skillChoices.count) {
      warn('race', 'race-skills', `Choose ${race.skillChoices.count} racial talent proficiencies.`);
    }
  }

  // --- Class ---
  const level = totalLevel(draft);
  if (draft.classBuild.startingLevel >= 1 && draft.classBuild.classes.length === 0) {
    err('class', 'no-class', 'Level 1+ characters must choose a class.');
  }
  if (draft.classBuild.startingLevel === 0 && draft.classBuild.classes.length > 0) {
    warn('class', 'level0-class', 'Level 0 characters do not have a class.');
  }
  if (draft.classBuild.classes.length > 1 && level < LEVEL_CONFIG.multiclassUnlock) {
    err(
      'class',
      'early-multiclass',
      `Multiclassing unlocks at level ${LEVEL_CONFIG.multiclassUnlock}.`,
    );
  }
  if (draft.classBuild.classes.length > LEVEL_CONFIG.maxClasses) {
    err(
      'class',
      'too-many-classes',
      `A character may have at most ${LEVEL_CONFIG.maxClasses} classes.`,
    );
  }
  if (draft.classBuild.aspects.length > LEVEL_CONFIG.maxAspects) {
    err(
      'class',
      'too-many-aspects',
      `A character may have at most ${LEVEL_CONFIG.maxAspects} aspects.`,
    );
  }
  if (draft.classBuild.aspects.length > 0 && level < LEVEL_CONFIG.aspectUnlock) {
    err(
      'class',
      'early-aspect',
      `Aspects are chosen starting at level ${LEVEL_CONFIG.aspectUnlock}.`,
    );
  }
  // Class skill selection
  const primary = draft.classBuild.classes[0]?.classId
    ? classById[draft.classBuild.classes[0].classId]
    : null;
  if (primary?.skillChoices && draft.classBuild.classSkills.length < primary.skillChoices.count) {
    warn(
      'class',
      'class-skills',
      `Choose ${primary.skillChoices.count} talent proficiencies from ${primary.name}'s list.`,
    );
  }
  // Growth / ASI allocation
  const growthAvail = growthPointsAvailable(level);
  const growthUsed = growthAllocated(draft);
  if (growthUsed > growthAvail) {
    err(
      'class',
      'growth-over',
      `You've allocated more Growth points than you have (${growthUsed}/${growthAvail}).`,
    );
  } else if (growthAvail > 0 && growthUsed < growthAvail) {
    warn(
      'class',
      'growth-unspent',
      `You have ${growthAvail - growthUsed} unspent Growth point(s).`,
    );
  }

  // --- Artes ---
  if (hasCasterAccess(draft) && draft.artes.selectedArteIds.length === 0) {
    warn('artes', 'no-artes', "Your caster hasn't selected any Artes yet.");
  }

  // --- Bio ---
  if (!draft.identity.name.trim()) {
    err('bio', 'no-name', 'Your character needs a name.');
  }

  return w;
}

export function warningsForStep(warnings: ValidationWarning[], step: string) {
  return warnings.filter((x) => x.step === step);
}

export function isReadyToStart(warnings: ValidationWarning[]): boolean {
  return !warnings.some((x) => x.severity === 'error');
}
