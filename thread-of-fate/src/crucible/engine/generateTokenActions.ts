/**
 * Token action macros for a Crucible entity.
 *
 * Every macro maps to a sheet action (see relay actions in src/relay/), so it works
 * both in the Crucible sheet UI and as a Roll20 token button. Large statblocks
 * collapse into menu macros past roll20.macroMenuThreshold so the token bar does
 * not flood - one button per action on a mythic boss would be twenty buttons.
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleMacroSpec } from '@/crucible/schemas/crucibleRoll20.schema';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import { ACTION_CATEGORY_LABELS } from '@/crucible/schemas/crucibleAction.schema';

const actionMacro = (
  entity: CrucibleEntitySchema,
  action: CrucibleActionInstance,
  menu: string | undefined,
): CrucibleMacroSpec => ({
  name: action.name,
  action: 'crucible_use_action',
  args: { entityId: entity.id, actionId: action.id },
  tokenAction: !menu,
  gmOnly: action.gmOnly ?? false,
  menu,
});

export function generateTokenActions(entity: CrucibleEntitySchema): CrucibleMacroSpec[] {
  const macros: CrucibleMacroSpec[] = [];

  // Always-present basics.
  macros.push({
    name: 'Initiative',
    action: 'crucible_roll_initiative',
    args: { entityId: entity.id },
    tokenAction: true,
    gmOnly: false,
  });

  const lists: [keyof typeof ACTION_CATEGORY_LABELS, CrucibleActionInstance[]][] = [
    ['core', entity.actions],
    ['quick', entity.quickActions],
    ['reaction', entity.reactions],
    ['apex', entity.apexActions],
    ['overture', entity.overtureActions],
  ];

  const totalActions = lists.reduce((s, [, l]) => s + l.length, 0);
  const useMenus = totalActions > entity.roll20.macroMenuThreshold;

  for (const [category, list] of lists) {
    if (!list.length) continue;
    const menuName = useMenus ? ACTION_CATEGORY_LABELS[category] : undefined;
    if (useMenus) {
      macros.push({
        name: ACTION_CATEGORY_LABELS[category],
        action: 'crucible_action_menu',
        args: { entityId: entity.id, category },
        tokenAction: true,
        gmOnly: category === 'apex' || category === 'overture' ? true : false,
      });
    }
    for (const action of list) macros.push(actionMacro(entity, action, menuName));
  }

  if (entity.magic.isCaster && entity.magic.knownArteIds.length) {
    macros.push({
      name: 'Artes',
      action: 'crucible_action_menu',
      args: { entityId: entity.id, category: 'artes' },
      tokenAction: true,
      gmOnly: false,
    });
  }

  macros.push({
    name: 'Defenses',
    action: 'crucible_show_defenses',
    args: { entityId: entity.id },
    tokenAction: !useMenus,
    gmOnly: false,
  });
  macros.push({
    name: 'Talent Check',
    action: 'crucible_roll_talent',
    args: { entityId: entity.id },
    tokenAction: false,
    gmOnly: false,
  });

  if (entity.boss?.phases.length) {
    macros.push({
      name: 'Next Phase',
      action: 'crucible_phase_transition',
      args: { entityId: entity.id },
      tokenAction: true,
      gmOnly: true,
    });
  }

  const hasRecharge = [...entity.actions, ...entity.quickActions, ...entity.apexActions].some(
    (a) => a.recharge,
  );
  if (hasRecharge) {
    macros.push({
      name: 'Recharge',
      action: 'crucible_recharge',
      args: { entityId: entity.id },
      tokenAction: true,
      gmOnly: true,
    });
  }

  if (entity.loot.entries.length || entity.loot.currency) {
    macros.push({
      name: 'Loot',
      action: 'crucible_loot',
      args: { entityId: entity.id },
      tokenAction: false,
      gmOnly: true,
    });
  }

  macros.push({
    name: 'GM Note',
    action: 'crucible_gm_note',
    args: { entityId: entity.id },
    tokenAction: false,
    gmOnly: true,
  });

  return macros;
}

/** Names of the token-bar buttons only (what actually lands on the token). */
export function tokenBarMacroNames(entity: CrucibleEntitySchema): string[] {
  return generateTokenActions(entity)
    .filter((m) => m.tokenAction)
    .map((m) => m.name);
}
