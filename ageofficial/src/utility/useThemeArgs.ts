import { computed } from "vue";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";

export function useThemeArgs() {
  const settings = useSettingsStore();
  const char = useCharacterStore();
  return computed(() => ({
    cthulhuMythos: settings.theme === "cthulhuMythos",
    technofantasy: settings.theme === "technofantasy",
    cyberpunk: settings.theme === "cyberpunk",
    threefold: settings.theme === "threefold",
    powers: settings.theme === "powers",
    originFaction: char.originFaction,
  }));
}
