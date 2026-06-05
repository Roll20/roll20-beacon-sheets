import { computed, ref } from "vue";
import type { Ref } from "vue";

import { useItemStore } from "../character/characterQualitiesStore";
import { useAbilityScoreStore } from "../abilityScores/abilityScoresStore";
import { useCharacterStore } from "../character/characterStore";
import { useModifiersStore } from "../modifiers/modifiersStore";
import type { Modifier } from "../modifiers/modifiersStore";
import { useSettingsStore } from "../settings/settingsStore";
import { getMinSpCost } from "@/utility/spCost";

export const baseDamageBonus = computed(() => 0);

export const damageMod = computed(() => {
  const char = useCharacterStore();
  const store = useItemStore();
  const damageOptions: Ref<Array<Modifier>> = ref([]);
  const favoredStuntMods: Ref<Array<Modifier>> = ref([]);
  const mods = useModifiersStore();
  mods.modifiers.forEach((mod) => {
    if (mod.option === "Damage" && mod.modifiedValue === "Roll") {
      const parent = store.items.filter((itm) => itm._id === mod.parentId)[0];

      if (
        mod.source === "Favored Stunt" &&
        getMinSpCost(String(parent.spCost || "0")) <= char.stunts
      ) {
        mod.label = parent.name;
        mod.source = parent.type;
        mod.spCost =
          parent.spCost !== undefined ? Number(parent.spCost) : undefined;
        mod.stuntType = parent.stuntType;
        damageOptions.value.push(mod);
      } else {
        if (!parent) return;
        mod.label = parent.name;
        mod.source = parent.type;
        if (parent.type !== "Favored Stunt") {
          damageOptions.value.push(mod);
        }
      }
      if (
        mod.source === "Favored Stunt" &&
        getMinSpCost(String(parent.spCost || "0")) <= char.stunts
      ) {
        favoredStuntMods.value.push(mod);
      }
    }
  });
  return createCombinedDmgMods(damageOptions.value, favoredStuntMods.value);
});

function createCombinedDmgMods(
  array1: Modifier[],
  array2: Modifier[]
): Modifier[] {
  const array3 = [...array1];

  array2.forEach((mod2) => {
    const matchingMod = array1.find((mod1) => mod1._id === mod2._id);

    if (!matchingMod) {
      array3.push(mod2);
    } else {
      array1.forEach((mod1) => {
        if (mod1._id !== mod2._id) {
          if (mod1.source !== mod2.source) {
            array3.push({
              ...mod1,
              label: `${mod1.label} + ${mod2.label}`,
              roll: mergeDice([
                mod1.variable ? (mod1.variable as string) : mod1.roll || "",
                mod2.variable ? (mod2.variable as string) : mod2.roll || "",
              ]),
              source: mod1.source,
              spCost: mod2.spCost,
            });
          }
        }
      });
    }
  });

  return array3;
}

function mergeDice(rolls: string[]): string {
  const diceMap: Record<string, number> = {};
  let totalModifier = 0;

  function processRoll(roll: string) {
    const regex = /^(\d*)d(\d+)([+-]\d+)?$/;
    const match = roll.match(regex);

    if (match) {
      const num = Number(match[1] || 1);
      const sides = Number(match[2]);
      const modifier = Number(match[3] || 0);

      if (diceMap[sides]) {
        diceMap[sides] += num;
      } else {
        diceMap[sides] = num;
      }

      totalModifier += modifier;
    }
  }

  rolls.forEach((roll) => processRoll(roll));

  const combinedDice = Object.entries(diceMap).map(
    ([sides, num]) => `${num}d${sides}`
  );
  if (totalModifier !== 0) {
    combinedDice.push(`${totalModifier > 0 ? "+" : ""}${totalModifier}`);
  }

  return combinedDice.join(" + ");
}

export const damageBonus = computed(() => {
  const mods = useModifiersStore();
  const totalBonus = ref(0);
  mods.modifiers.forEach((mod) => {
    if (mod.option === "Damage" && mod.modifiedValue !== "Roll") {
      switch (mod.sourceType) {
        case "Condition":
          totalBonus.value += Number(mod.bonus || 0) + Number(mod.penalty || 0);
          break;
        default:
          totalBonus.value += Number(mod.bonus || 0) + Number(mod.penalty || 0);
          break;
      }
    }
  });
  return totalBonus.value;
});

export const attackToHit = (attack: any) => {
  const settings = useSettingsStore();
  const ability = useAbilityScoreStore();
  const quals = useItemStore();
  const abilityBase = ref(
    attack.option === "Custom Attack" && attack.weaponType === "Spell Ranged"
      ? `${"Accuracy"}Base`
      : `${attack.weaponGroupAbility}Base`
  );
  return computed(() => {
    let toHit = 0;
    if (settings.aimToggle === "always") toHit += settings.aimValue;
    if (settings.aim) toHit += settings.aimValue;
    quals.items.forEach((qual) => {
      if (
        qual.type === "Ability Focus" &&
        (qual.name === attack.weaponGroup ||
          qual.customName === attack.name ||
          qual.name === attack.name)
      ) {
        if (qual.doubleFocus) {
          toHit += 4;
        } else if (qual.focus) {
          toHit += 2;
        }
      }
    });
    // @ts-ignore
    toHit += Number(ability[abilityBase.value] || 0);
    return toHit;
  });
};

export const attackFocus = (attack: any) => {
  const focusBonus = ref(0);
  const quals = useItemStore();
  quals.items.forEach((qual) => {
    if (
      qual.type === "Ability Focus" &&
      (qual.name === attack.weaponGroup || qual.customName === attack.name)
    ) {
      if (qual.doubleFocus) {
        focusBonus.value += 4;
      } else if (qual.focus) {
        focusBonus.value += 2;
      }
    }
  });
  return focusBonus.value;
};
