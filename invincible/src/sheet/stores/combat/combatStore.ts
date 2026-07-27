import { defineStore } from 'pinia';
import { computed, ref, watch, nextTick } from 'vue';
import { CombatHydrateSchema, type CombatHydrate, type InitEntryItem } from '@/schemas/hydrate/combat';
import { genericDehydrate, genericHydrate } from '@/utility/store';
import { ruleSets } from '@/system';
import { health_max_formula, resolve_max_formula, slugfest_damage_formula } from '@/system/combat/combat';
import { v4 as uuidv4 } from 'uuid';
import type { InjuryItem } from '@/schemas/hydrate/injury';
import { criticalInjuries as criticalInjuriesTable } from '@/system/injuries/criticalInjuries';
import { dispatchRef, initValues } from '@/relay/relay';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import rollToChat from '@/utility/rollToChat';
import getRollResult from '@/utility/getRollResult';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';

export const modifiedHealthMax = computed(() => {
  try {
    return combatStore().computedHealthMax;
  } catch {
    return 0;
  }
});
export const modifiedResolveMax = computed(() => {
  try {
    return combatStore().computedResolveMax;
  } catch {
    return 0;
  }
});
export const modifiedSlugfestDamage = computed(() => {
  try {
    return combatStore().computedSlugfestDamage;
  } catch {
    return 0;
  }
});

export const combatStore = defineStore('combat', () => {
  const health = ref(2);
  const healthMax = ref(health_max_formula);
  const resolve = ref(2);
  const resolveMax = ref(resolve_max_formula);
  const slugfestDamage = ref(slugfest_damage_formula);
  const armor = ref(0);
  const initiative:InitEntryItem[] = [];

  
  const criticalInjuries = ref<InjuryItem[]>([]);

  
  const bloodSplats = ref<Array<{ _id?: string, x: number, y: number, size: number, threshold: number, seed: number }>>([]);

  let ignoreWatchers = false;

  const rollCriticalInjury = async (modifier: number) => {
    const isAlreadyDead = criticalInjuries.value.some(inj => !inj.isPlaceholder && inj.roll !== undefined && inj.roll >= 12);
    if (isAlreadyDead) return;

    
    const tempId = uuidv4();
    criticalInjuries.value.push({
      _id: tempId,
      name: 'Rolling Injury...',
      description: '',
      healingTime: '-',
      isPlaceholder: true,
      effects: { value: [] }
    });

    const prevCritsCount = criticalInjuries.value.filter(inj => !inj.isPlaceholder).length;
    let rollVal = 0;
    let resolvedComponents: any[] = [];

    const dispatch = dispatchRef.value;
    if (dispatch && typeof dispatch.roll === 'function' && typeof dispatch.post === 'function') {
      const components: any[] = [
        {
          sides: 6,
          count: 1,
          label: 'Base D6'
        }
      ];

      if (modifier > 0) {
        components.push({
          value: modifier,
          label: 'Excess Damage Modifier',
          alwaysShowInBreakdown: true
        });
      }

      if (prevCritsCount > 0) {
        components.push({
          value: prevCritsCount,
          label: 'Previous Critical Injuries Modifier',
          alwaysShowInBreakdown: true
        });
      }

      try {
        const result = await getRollResult(components, dispatch);
        rollVal = result.total;
        resolvedComponents = result.components;
      } catch (err) {
        console.error('[combat] SDK roll failed, falling back to local roll:', err);
        const d6 = Math.floor(Math.random() * 6) + 1;
        rollVal = d6 + modifier + prevCritsCount;
        resolvedComponents = [
          { sides: 6, count: 1, value: d6, label: 'Base D6' }
        ];
        if (modifier > 0) resolvedComponents.push({ value: modifier, label: 'Excess Damage Modifier', alwaysShowInBreakdown: true });
        if (prevCritsCount > 0) resolvedComponents.push({ value: prevCritsCount, label: 'Previous Critical Injuries Modifier', alwaysShowInBreakdown: true });
      }
    } else {
      
      const d6 = Math.floor(Math.random() * 6) + 1;
      rollVal = d6 + modifier + prevCritsCount;
      resolvedComponents = [
        { sides: 6, count: 1, value: d6, label: 'Base D6' }
      ];
      if (modifier > 0) resolvedComponents.push({ value: modifier, label: 'Excess Damage Modifier', alwaysShowInBreakdown: true });
      if (prevCritsCount > 0) resolvedComponents.push({ value: prevCritsCount, label: 'Previous Critical Injuries Modifier', alwaysShowInBreakdown: true });
    }

    
    const originalRollVal = rollVal;
    let maxRoll = 0;
    criticalInjuries.value.forEach(injury => {
      if (!injury.isPlaceholder && injury.roll && injury.roll > maxRoll) {
        maxRoll = injury.roll;
      }
    });

    
    if (maxRoll > 0 && rollVal <= maxRoll) {
      rollVal = maxRoll + 1;
    }

    const finalRoll = Math.max(1, rollVal);
    const tableIndex = Math.min(finalRoll - 1, criticalInjuriesTable.length - 1);
    const selectedInjury = criticalInjuriesTable[tableIndex];

    
    if (finalRoll > originalRollVal && resolvedComponents.length > 0) {
      resolvedComponents.push({
        value: finalRoll - originalRollVal,
        label: 'Shift-Up Adjustment',
        alwaysShowInBreakdown: true
      });
    }

    const newInjury: InjuryItem = {
      _id: uuidv4(),
      roll: finalRoll,
      name: selectedInjury.name,
      description: selectedInjury.description,
      healingTime: selectedInjury.healingTime,
      effects: {
        label: selectedInjury.effects?.label,
        disabled: selectedInjury.effects?.disabled ?? false,
        value: (selectedInjury.effects?.value ?? []).map(eff => ({
          ...eff,
          _id: uuidv4()
        }))
      }
    };

    
    const idx = criticalInjuries.value.findIndex(inj => inj._id === tempId);
    if (idx !== -1) {
      criticalInjuries.value[idx] = newInjury;
    } else {
      criticalInjuries.value.push(newInjury);
    }
    
    normalizeCriticalInjuries();

    
    if (dispatch && typeof dispatch.post === 'function') {
      const meta = metaStore();
      const characterName = meta.name;

      const rollTemplate = createRollTemplate({
        type: 'roll',
        parameters: {
          title: `Critical Injury: ${selectedInjury.name}`,
          characterName,
          components: resolvedComponents,
          description: selectedInjury.description || '',
        },
      });

      try {
        await dispatch.post({
          characterId: initValues.character?.id || '',
          content: rollTemplate,
        });
      } catch (err) {
        console.error('[combat] failed to post critical injury template:', err);
      }
    }
  };

  const normalizeCriticalInjuries = () => {
    
    criticalInjuries.value.sort((a, b) => (a.roll || 0) - (b.roll || 0));

    
    const allEffects: Array<{ effect: any; parentInjury: any }> = [];
    criticalInjuries.value.forEach(injury => {
      if (injury.isPlaceholder) return;
      if (injury.effects && Array.isArray(injury.effects.value)) {
        injury.effects.value.forEach(eff => {
          eff.disabled = false;
          allEffects.push({ effect: eff, parentInjury: injury });
        });
      }
    });

    
    const groups: Record<string, typeof allEffects> = {};
    allEffects.forEach(item => {
      const attr = item.effect.attribute;
      if (!groups[attr]) {
        groups[attr] = [];
      }
      groups[attr].push(item);
    });

    
    Object.keys(groups).forEach(attr => {
      const group = groups[attr];
      if (group.length <= 1) return;

      let worstItem = group[0];
      group.forEach(item => {
        const currentVal = Number(item.effect.value);
        const worstVal = Number(worstItem.effect.value);
        
        
        if (currentVal >= worstVal) {
          worstItem = item;
        }
      });

      
      group.forEach(item => {
        if (item !== worstItem) {
          item.effect.disabled = true;
        }
      });
    });
  };

  const computedHealthMax = computed(() => Number(ruleSets.health_max().value) ?? 0);
  const computedResolveMax = computed(() => Number(ruleSets.resolve_max().value) ?? 0);
  const computedSlugfestDamage = computed(() => Number(ruleSets.slugfest_damage().value) ?? 0);

  
  watch(
    [health, computedHealthMax],
    ([newHealth, newMax], [oldHealth, oldMax]) => {
      if (ignoreWatchers) return;
      if (newHealth === undefined) return;
      const max = Math.max(newMax, 0);

      
      if (oldMax !== undefined && oldMax > 0 && newMax > oldMax) {
        const diff = newMax - oldMax;
        health.value += diff;
        return;
      }

      if (newHealth > max) {
        health.value = max;
        return;
      }

      const prevHealth = oldHealth !== undefined ? oldHealth : newHealth;

      if (newHealth < 0) {
        const damageAmount = Math.abs(newHealth);
        rollCriticalInjury(damageAmount);
        health.value = 0;
      } else if (newHealth === 0 && prevHealth > 0) {
        rollCriticalInjury(0);
      }
    }
  );

  watch(
    [resolve, computedResolveMax],
    ([newResolve, newMax], [oldResolve, oldMax]) => {
      if (ignoreWatchers) return;
      const max = Math.max(newMax, 0);

      
      if (oldMax !== undefined && oldMax > 0 && newMax > oldMax) {
        const diff = newMax - oldMax;
        resolve.value += diff;
        return;
      }

      if (newResolve > max) {
        resolve.value = max;
      }
      if (newResolve < 0) {
        resolve.value = 0;
      }
    }
  );

  
  watch(
    () => criticalInjuries.value.length,
    () => {
      normalizeCriticalInjuries();
    }
  );

  const firebase = {
    health,
    healthMax,
    resolve,
    resolveMax,
    slugfestDamage,
    armor,
    initiative,
    criticalInjuries,
    bloodSplats,
  };

  const dehydrate = (): CombatHydrate => genericDehydrate(firebase, CombatHydrateSchema);
  const hydrate = (snapshot: CombatHydrate) => {
    ignoreWatchers = true;
    genericHydrate(snapshot, firebase, CombatHydrateSchema);
    normalizeCriticalInjuries();
    nextTick(() => {
      ignoreWatchers = false;
    });
  };

  return {
    health,
    healthMax,
    resolve,
    resolveMax,
    slugfestDamage,
    armor,
    initiative,
    criticalInjuries,
    bloodSplats,
    firebase,
    dehydrate,
    hydrate,
    rollCriticalInjury,
    normalizeCriticalInjuries,
    computedHealthMax,
    computedResolveMax,
    computedSlugfestDamage,
  };
});
