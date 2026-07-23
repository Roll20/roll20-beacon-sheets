import { computed, ref } from "vue";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";

export const powerFatiguePenalty = computed(() => {
  const settings = useSettingsStore();
  const char = useCharacterStore();
  const penalty = ref(0);
  penalty.value =
    settings.userPowerFatigue && char.powerFatigue ? char.powerFatigue : 0;
  return penalty.value;
});
