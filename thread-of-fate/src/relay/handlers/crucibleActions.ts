/**
 * Beacon sheet actions for Crucible entities - what runs when a GM clicks a
 * token-action button in the VTT (registered via addActionsToHost at deploy).
 *
 * Each handler reads the entity from the character's own attributes.crucible,
 * exactly like the crucible_* computed getters, so token buttons keep working
 * even when the sheet iframe is closed (the relay runs headless).
 */

import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { allActions } from '@/crucible/schemas/crucibleEntity.schema';
import { migrateEntity } from '@/crucible/schemas/crucibleValidation';
import { computeCrucibleDerived } from '@/crucible/engine/computeCrucibleDerived';
import {
  crucibleRollInitiative,
  crucibleRollTalent,
  crucibleUseAction,
  crucibleRecharge,
  cruciblePhaseTransition,
  crucibleLootCard,
  crucibleGmNote,
  crucibleShowDefenses,
} from '@/crucible/engine/crucibleRolls';
import { ACTION_CATEGORY_LABELS } from '@/crucible/schemas/crucibleAction.schema';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { getCruciblePlay, emptyPlayState } from './crucibleComputed';

type ActionProps = { dispatch: Dispatch; character: Character };

/** Entity from a character's attributes, re-derived so rolls use live math. */
function entityOf(character: Character): CrucibleEntitySchema | null {
  const raw = character.attributes?.crucible;
  if (!raw || typeof raw !== 'object') return null;
  const entity = migrateEntity(raw as Record<string, unknown>);
  entity.derived = computeCrucibleDerived(entity);
  return entity;
}

const writePlay = (dispatch: Dispatch, character: Character, play: Record<string, unknown>) => {
  dispatch.update({
    character: {
      id: character.id,
      attributes: { updateId: 'TOKENCHANGE', cruciblePlay: play as never },
    },
  });
};

/**
 * Initiative: roll it, post the card, and drop the creature's token into the
 * turn tracker (token entry when one exists on the page, custom entry otherwise)
 * - the same flow as the D&D sheet's initiative button.
 */
async function rollInitiative({ dispatch, character }: ActionProps) {
  const entity = entityOf(character);
  if (!entity) return;
  const total = await crucibleRollInitiative(entity, { customDispatch: dispatch });
  try {
    const { tokens } = await dispatch.getTokens({ characterId: character.id });
    if (tokens.length) {
      await dispatch.addToTracker({ tokenId: tokens[0].id, value: total });
    } else {
      await dispatch.addToTracker({
        custom: { name: entity.identity.name || 'Creature' },
        value: total,
      });
    }
  } catch {
    // Standalone / no tracker available - the roll already posted to chat.
  }
}

async function useAction({ dispatch, character }: ActionProps, ...args: string[]) {
  const entity = entityOf(character);
  if (!entity) return;
  const [, actionId] = args; // args arrive as [entityId, actionId]
  if (!actionId) return;
  await crucibleUseAction(entity, actionId, { customDispatch: dispatch });
  // Mark spent recharges in play state so the sheet shows them.
  const action = allActions(entity).find((a) => a.id === actionId);
  if (action?.recharge) {
    const play = getCruciblePlay(character);
    writePlay(dispatch, character, {
      ...play,
      spentRecharges: { ...play.spentRecharges, [actionId]: true },
    });
  }
}

/** Post a whispered card listing a category's actions (menu for large statblocks). */
async function actionMenu({ dispatch, character }: ActionProps, ...args: string[]) {
  const entity = entityOf(character);
  if (!entity) return;
  const [, category] = args;
  const label =
    ACTION_CATEGORY_LABELS[category as keyof typeof ACTION_CATEGORY_LABELS] ?? 'Actions';
  const lists: Record<string, typeof entity.actions> = {
    core: entity.actions,
    quick: entity.quickActions,
    reaction: entity.reactions,
    apex: entity.apexActions,
    overture: entity.overtureActions,
  };
  const list = lists[category] ?? entity.actions;
  const html = createRollTemplate({
    type: 'chat',
    parameters: {
      characterName: entity.identity.name,
      title: label,
      textContent: list.map(
        (a) => `${a.name}${a.actionPointCost ? ` (${a.actionPointCost} AP)` : ''}`,
      ),
    },
  });
  await dispatch.post({
    characterId: character.id,
    content: html,
    options: { whisper: 'gm' },
  });
}

async function rollTalent({ dispatch, character }: ActionProps, ...args: string[]) {
  const entity = entityOf(character);
  if (!entity) return;
  const talentId = args[1] || Object.keys(entity.derived.talentBonuses)[0] || 'Perception';
  await crucibleRollTalent(entity, talentId, { customDispatch: dispatch });
}

async function showDefenses({ dispatch, character }: ActionProps) {
  const entity = entityOf(character);
  if (entity) await crucibleShowDefenses(entity, { customDispatch: dispatch });
}

/** Advance to the next phase (or the first when none is active) and persist it. */
async function phaseTransition({ dispatch, character }: ActionProps) {
  const entity = entityOf(character);
  const phases = entity?.boss?.phases ?? [];
  if (!entity || !phases.length) return;
  const play = getCruciblePlay(character);
  const currentIndex = phases.findIndex((p) => p.id === play.activePhaseId);
  const next = phases[Math.min(currentIndex + 1, phases.length - 1)];
  if (!next || next.id === play.activePhaseId) return;
  await cruciblePhaseTransition(entity, next, { customDispatch: dispatch });
  writePlay(dispatch, character, { ...play, activePhaseId: next.id });
}

/** Round start: roll every spent recharge and restore the ones that come back. */
async function recharge({ dispatch, character }: ActionProps) {
  const entity = entityOf(character);
  if (!entity) return;
  const play = getCruciblePlay(character);
  const spent = Object.keys(play.spentRecharges).filter((id) => play.spentRecharges[id]);
  if (!spent.length) return;
  const recovered = await crucibleRecharge(entity, spent, { customDispatch: dispatch });
  const nextSpent: Record<string, boolean> = { ...play.spentRecharges };
  for (const [id, back] of Object.entries(recovered)) {
    if (back) delete nextSpent[id];
  }
  writePlay(dispatch, character, { ...play, spentRecharges: nextSpent });
}

async function loot({ dispatch, character }: ActionProps) {
  const entity = entityOf(character);
  if (entity) await crucibleLootCard(entity, { customDispatch: dispatch });
}

async function gmNote({ dispatch, character }: ActionProps) {
  const entity = entityOf(character);
  if (entity) await crucibleGmNote(entity, { customDispatch: dispatch });
}

/** The relay `actions` config (Beacon SheetActions shape). */
export const crucibleSheetActions = {
  crucible_roll_initiative: { method: rollInitiative },
  crucible_use_action: { method: useAction },
  crucible_action_menu: { method: actionMenu },
  crucible_roll_talent: { method: rollTalent },
  crucible_show_defenses: { method: showDefenses },
  crucible_phase_transition: { method: phaseTransition },
  crucible_recharge: { method: recharge },
  crucible_loot: { method: loot },
  crucible_gm_note: { method: gmNote },
};

export { emptyPlayState };
