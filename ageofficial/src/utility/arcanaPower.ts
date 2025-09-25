import { useAbilityScoreStore } from "@/sheet/stores/abilityScores/abilityScoresStore";
import getRollResult from "./getRollResult";
import { computed, ref } from "vue";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";

export async function rollPowerFatigueTest(powerCost: number, focus: number): Promise<any> {
    const ability = useAbilityScoreStore();
    const halfPower = Math.floor(powerCost/2);
    const components = [
      { label: `Base Roll`, sides: 6, count:3, alwaysShowInBreakdown: true },
      { label: 'Willpower', value: ability.WillpowerBase },
      { label: 'Focus', value: focus ? focus : 0 },
    ];   
    return components
}

export const powerFatiguePenalty = computed(() => {
    const settings = useSettingsStore();
    const char = useCharacterStore()
    const penalty = ref(0);
    penalty.value = settings.userPowerFatigue && char.powerFatigue ? char.powerFatigue : 0;
    return penalty.value;
});