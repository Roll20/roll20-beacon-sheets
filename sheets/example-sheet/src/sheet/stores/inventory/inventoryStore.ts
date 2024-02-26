import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ComputedRef } from 'vue';
import type { Ref } from "vue";
import { useAbilityScoreStore } from "@/sheet/stores/abilityScores/abilityScoresStore";
import type { AbilityScore } from "@/sheet/stores/abilityScores/abilityScoresStore";
import { arrayToObject, objectToArray } from "@/utility/objectify";
import { v4 as uuidv4 } from "uuid";
import sendToChat from "@/utility/sendToChat";

export type Item = {
		_id: string;
		type: "weapon" | "armor" | "item" | "spell" | 'consumable';
		slots: number;
		name: string;
		description: string;
		quantity: number;
}

export type Weapon = Item & {
		equipped: boolean;
		damage: string;
		abilityScore?: AbilityScore;
}

export type Armor = Item & {
		equipped: boolean;
		defenseMod: number;
}

export type AnyItem = Item | Weapon | Armor;

export type InventoryHydrate = {
		inventory: {
				carryCapacityBonus: number;
				items: Record<string, Item>;
				itemsStowed: Record<string, Item>;
				cash: number;
		}
};

export const useInventoryStore = defineStore("inventory", () => {
		const abilityScoresStore = useAbilityScoreStore()

		const carryCapacityBonus: Ref<number> = ref(0);
		const carryCapacity: ComputedRef<number> = computed(() => 10 + carryCapacityBonus.value + Number(abilityScoresStore.abilityScores.Endurance.base));
		const items: Ref<Array<AnyItem>> = ref([]);
		const itemsStowed: Ref<Array<AnyItem>> = ref([]);
		const cash = ref(0);
		
		const totalEncumbrance = computed( () => items.value.reduce((accum, item) => accum + item.slots, 0));
		const isOverburdened = computed(() => totalEncumbrance.value > carryCapacity.value);
		const equippedWeapon: ComputedRef<Weapon | undefined> = computed(() => {
				const weapon = items.value.filter((item) => item.type ==='weapon').find((weapon) => (weapon as Weapon).equipped)
				return weapon as Weapon;
		})
		const equippedArmor: ComputedRef<Armor | undefined> = computed(() => {
				const armor = items.value.filter((item) => item.type ==='armor').find((armor) => (armor as Armor).equipped)
				return armor as Armor;
		})

		const equipItem = (_id: string) => {
				const item = (items.value.find(item => item._id === _id))
				if(!item) return;
				if(item.type === 'weapon') equipWeapon(item as Weapon)
				if(item.type === 'armor') equipArmor(item as Armor)
		}
		const unEquipItem = (_id: string) => {
			const item = (items.value.find(item => item._id === _id));
			if (item) item.equipped = false;
		}
		const equipWeapon = (weapon: Weapon) => {
				if(!weapon) return;
				if(equippedWeapon.value) {
						equippedWeapon.value.equipped = false;
				}
				weapon.equipped = true;
		}
		const equipArmor = (armor: Armor) => {
				if(!armor) return;
				if(equippedArmor.value) {
						equippedArmor.value.equipped = false;
				}
				armor.equipped = true;
		}

		const addItem = (stowed: boolean = false) => {
				const listToUse = stowed ? itemsStowed.value : items.value
				const emptyItem:Item = {
						_id: uuidv4(),
						slots: 1,
						name: `New Item ${listToUse.length +1}`,
						description: '',
						type: 'item',
						quantity: 1,
				}
				listToUse.push(emptyItem);
		}
		// Switches an item between the regular and stowed inventories.
		const swapItem = (_id: string, stowed: boolean) => {
				const listFrom = stowed ? itemsStowed.value : items.value;
				const listTo = stowed ? items.value : itemsStowed.value;
				const indexToSwap = listFrom.findIndex(item => item._id === _id);
				unEquipItem(_id);
				if(indexToSwap < 0) return;
				listTo.push(listFrom[indexToSwap]);
				listFrom.splice(indexToSwap, 1);
		}
		const removeItem = (_id: string, stowed: boolean) => {
				const listFrom = stowed ? itemsStowed.value : items.value;
				const indexToRemove = listFrom.findIndex(item => item._id === _id);
				if(indexToRemove >= 0)
					listFrom.splice(indexToRemove, 1)
		}

		/*
		* Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id
		* */
		const dehydrate = () => {
				return {
						inventory: {
								items: arrayToObject(items.value),
								itemsStowed: arrayToObject(itemsStowed.value),
								cash: cash.value,
								carryCapacityBonus: carryCapacityBonus.value,
						}
				};
		};
		const printItem = async (_id: string) => {
				const item = items.value.find(item => item._id === _id) || itemsStowed.value.find(item => item._id === _id);
				if(!item) return;
				await sendToChat({
						title: item.name,
						subtitle: item.type,
						traits: ['Inventory', item.type],
						textContent: item.description,
				})
				// TODO: Add sheet-action for Consumable items to subtract 1.
		}
		/*
		* Since the items array is coming is an object, we convert it back into an array before saving here.
		* */
		const hydrate = (hydrateStore: InventoryHydrate) => {
				carryCapacityBonus.value = hydrateStore.inventory.carryCapacityBonus || carryCapacityBonus.value;
				items.value = objectToArray(hydrateStore.inventory.items) || items.value;
				itemsStowed.value = objectToArray(hydrateStore.inventory.itemsStowed) || itemsStowed.value;
				cash.value = hydrateStore.inventory.cash || cash.value;
		};

		return {
				carryCapacity,
				carryCapacityBonus,
				items,
				itemsStowed,
				totalEncumbrance,
				isOverburdened,
				equippedWeapon,
				equippedArmor,

				equipItem,
				swapItem,
				addItem,
				removeItem,
				printItem,

				dehydrate,
				hydrate,
		};
});
