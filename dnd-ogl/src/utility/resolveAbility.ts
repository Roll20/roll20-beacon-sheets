import type { SpellSource, StandardSpellSource } from '@/sheet/stores/spells/spellsStore';
import type { NpcSpellSource } from '@/sheet/stores/npc/npcStore';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';

type AnySpellSource = SpellSource | NpcSpellSource;

/**
 * Resolves 'spellcasting' into a concrete ability or returns the base ability/none
 */
export const resolveAbility = (
  abilityKey: string | undefined | null,
  sourceId: string | undefined,
  sources: AnySpellSource[]
): AbilityKey | 'none' => {
  if (abilityKey !== 'spellcasting') {
    return (abilityKey as AbilityKey) || 'none';
  }

  const source = sources.find((s) => s._id === sourceId);
  
  const finalSource = source || sources[0];

  if (finalSource && (finalSource as StandardSpellSource).type === 'ability') {
    return (finalSource as StandardSpellSource).ability;
  }

  return 'none';
};