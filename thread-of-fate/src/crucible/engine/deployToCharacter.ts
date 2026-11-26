/**
 * Deploy a Crucible entity onto the CURRENT Roll20 character - the same workflow
 * as opening an NPC sheet in Roll20's D&D system:
 *
 *   GM: Journal -> Add Character -> open its sheet -> Crucible -> Library ->
 *   "Deploy to this sheet".
 *
 * What it does:
 *  1. Binds the entity in the crucibleCharacter store (the master store's normal
 *     dehydrate then persists attributes.crucible / cruciblePlay, plus the
 *     character's name / avatar / bio / gmNotes).
 *  2. Sets the character's default token: bars linked to the crucible_* computed
 *     values, size from the creature's grid footprint, art, name, vision, aura.
 *  3. Registers token-bar actions with the host (Initiative, action menus, phases)
 *     so the GM can run the creature straight from the token.
 */

import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { TokenBarConfig } from '@/crucible/schemas/crucibleRoll20.schema';
import { generateTokenActions } from './generateTokenActions';
import { buildGmNotesText } from './convertEntityToRoll20';

/** Grid squares -> pixels (Roll20 default 70px squares). */
const GRID_PX = 70;

const barLink = (bar: TokenBarConfig): string | undefined =>
  bar.computed !== 'none' && bar.linked ? bar.computed : undefined;

/** The token payload for dispatch.updateTokensByCharacter. */
export function buildTokenPayload(entity: CrucibleEntitySchema): Record<string, unknown> {
  const token = entity.token;
  const payload: Record<string, unknown> = {
    name:
      entity.roll20.concealName && entity.roll20.concealedAs
        ? entity.roll20.concealedAs
        : entity.identity.name,
    showname: token.showNameplate,
    showplayers_name: token.nameplateVisibility === 'all',
    width: token.gridWidth * GRID_PX,
    height: token.gridHeight * GRID_PX,
    bar1_link: barLink(token.bar1),
    bar2_link: barLink(token.bar2),
    bar3_link: barLink(token.bar3),
    showplayers_bar1: token.bar1.visibility === 'all',
    showplayers_bar2: token.bar2.visibility === 'all',
    showplayers_bar3: token.bar3.visibility === 'all',
  };
  const art = token.imageUrl || entity.identity.portrait;
  if (art) payload.imgsrc = art;
  if (token.auraRadius > 0) {
    payload.aura1_radius = String(token.auraRadius);
    payload.aura1_color = token.auraColor;
  }
  if (token.nightVisionRange > 0) {
    payload.has_night_vision = true;
    payload.night_vision_distance = token.nightVisionRange;
  }
  if (token.lightRadius > 0) {
    payload.emits_bright_light = true;
    payload.bright_light_distance = token.lightRadius;
    if (token.lightDimRadius > 0) {
      payload.emits_low_light = true;
      payload.low_light_distance = token.lightDimRadius;
    }
  }
  if (token.markers.length) payload.statusmarkers = token.markers.join(',');
  // Drop undefined values - the host treats missing keys as "leave unchanged".
  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key];
  }
  return payload;
}

export interface DeployResult {
  ok: boolean;
  steps: string[];
  warnings: string[];
}

/**
 * Push token defaults + token actions to the Roll20 host for a character that
 * has a Crucible entity bound. The attribute payload itself flows through the
 * master store's normal dehydrate; this handles the host-side extras.
 */
export async function deployTokenAndActions(
  dispatch: Dispatch,
  characterId: string,
  entity: CrucibleEntitySchema,
): Promise<DeployResult> {
  const steps: string[] = [];
  const warnings: string[] = [];

  // --- Default token ---------------------------------------------------------
  try {
    await dispatch.updateTokensByCharacter({
      characterId,
      token: buildTokenPayload(entity) as never,
    });
    steps.push('Token defaults set (bars, size, name, vision).');
  } catch (e) {
    warnings.push(`Could not update tokens: ${(e as Error).message ?? e}`);
  }

  // --- Token-bar actions -----------------------------------------------------
  const macros = generateTokenActions(entity).filter((m) => m.tokenAction);
  let added = 0;
  for (const macro of macros) {
    try {
      dispatch.addActionsToHost({
        name: macro.name,
        actionId: `${macro.action}:${String(macro.args.actionId ?? macro.args.category ?? '')}`,
        sheetAction: {
          characterId,
          action: macro.action,
          args: Object.values(macro.args).map(String),
        },
        locations: ['tokenActionBar'],
      });
      added++;
    } catch (e) {
      warnings.push(`Could not add token action "${macro.name}": ${(e as Error).message ?? e}`);
      break;
    }
  }
  if (added) steps.push(`${added} token actions registered.`);

  return { ok: warnings.length === 0, steps, warnings };
}

/** GM-notes text for the deployed character (secrets stay off player channels). */
export { buildGmNotesText };
