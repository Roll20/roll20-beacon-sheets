import { defineStore } from "pinia";
import { ref } from "vue";

export type SettingsHydrate = {
		settings: {
				encumbrancePenalty: number;
		}
};

export const useSettingsStore = defineStore("settings", () => {

		const encumbrancePenalty = ref(-4)

		const dehydrate = () => {
				return {
						settings: {
								encumbrancePenalty: encumbrancePenalty.value,
						}
				};
		};

		const hydrate = (hydrateStore: SettingsHydrate) => {
				encumbrancePenalty.value = hydrateStore.settings.encumbrancePenalty || encumbrancePenalty.value;
		};

		return {
				encumbrancePenalty,
				dehydrate,
				hydrate,
		};
});
