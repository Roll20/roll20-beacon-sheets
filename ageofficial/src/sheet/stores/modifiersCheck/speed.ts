import { computed, ref } from "vue";
import { useItemStore } from "../character/characterQualitiesStore";
import { useConditionsStore } from "../conditions/conditionsStore";
import { useAbilityScoreStore } from "../abilityScores/abilityScoresStore";
import { useModifiersStore } from "../modifiers/modifiersStore";

// Speed Mod calculation with the item modifiers and speed conditions
export const speedMod = computed(() => {
  const store = useItemStore();

  // Sum up the item modifiers that affect "Defense"
  const qMods = store.items.reduce((armorMod, itm) => {
    if (!itm.modifiers) return armorMod;
    itm.modifiers.forEach((mod: any) => {
      if (mod.option === "Speed") {
        armorMod += Number(mod.variable);
      }
    });
    return armorMod;
  }, 0);

  // Combine item modifiers with speed conditions
  return qMods + speedConditions();
});

// Speed conditions calculation
const speedConditions = (): number => {
  const conditionsStore = useConditionsStore();
  const conditions = conditionsStore.conditions; // Reactive condition store
  const values: any[] = [];

  conditions.forEach((con) => {
    if (!con.modifiers) return;
    const ability = useAbilityScoreStore();

    // Handle stringified modifiers
    if (typeof con.modifiers === "string") {
      JSON.parse((con.modifiers as string).replace("$__$", "")).forEach(
        (cm: any) => {
          if (cm.modifiedValue === "Speed") {
            if (typeof cm.penalty === "number") {
              values.push(-cm.penalty);
            } else {
              const pVal = ability[cm.penalty + "Base"]; // Assuming 'ability' is available in the scope
              values.push(-pVal);
            }
          }
        }
      );
    } else {
      const ability = useAbilityScoreStore();
      // Handle array of modifiers
      con.modifiers.forEach((cm: any) => {
        if (cm.modifiedValue === "Speed") {
          if (typeof cm.penalty === "number") {
            values.push(-cm.penalty);
          } else {
            const pVal = ability[cm.penalty + "Base"];
            values.push(-pVal);
          }
        }
      });
    }
  });
  const mods = useModifiersStore();
  mods.modifiers.forEach((mod) => {
    if (mod.option === "Speed" && mod.enabled) {
      values.push(mod.bonus || mod.penalty || 0);
    }
  });
  // If any modifiers affecting Speed are found, sum them up
  if (values.length > 0) {
    return values.reduce((a, b) => a + b, 0);
  } else {
    return 0; // Default value if no Speed modifiers are found
  }
};
