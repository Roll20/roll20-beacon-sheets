import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { Ref } from 'vue';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import type { AbilityScore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import sendToChat from '@/utility/sendToChat';
import { useSettingsStore } from '../settings/settingsStore';

/*
 * This store handles 2 "repeating"/lists of Items in the Inventory. Carried and Stowed.
 * There are 3 types, Generic Item/Weapon/Armor, each with many shared fields and some unique ones
 *  */
export type Item = {
  _id: string;
  ordinal?:number;
  type: 'weapon' | 'armor' | 'item' | 'shield' | 'consumable';
  slots: number;
  name: string;
  description: string;
  quantity: number;
  cost:string;
};

export type Weapon = Item & {
  attackOrdinal?:number;
  equipped: boolean;
  damage: string;
  abilityScore?: AbilityScore;
  weaponType?: string;
  ability?:string;
  weaponGroup?:string;
  weaponGroupAbility?:string;
  shortRange?:number | null;
  longRange?:number | null;
  reload?:string;
  configurable:boolean
  minStr?: number;
  damageType?:string;
  damageSource?:string;
};

export type Armor = Item & {
  equipped: boolean;
  defenseMod: number;
  armorPenalty: number;
  strain:number;
};

export type AnyItem = Item | Weapon | Armor;

export type InventoryHydrate = {
  inventory: {
    carryCapacityBonus: number;
    items: Record<string, Item>;
    itemsStowed: Record<string, Item>;
    cash: Currency;
  };
};

export type Currency = {
  tn?:number,
  gold?:number,
  silver?:number,
  copper?:number,
}

export const useInventoryStore = defineStore('inventory', () => {
  const abilityScoresStore = useAbilityScoreStore();

  const carryCapacityBonus: Ref<number> = ref(0);
  // Example for a calculated field. Carrying capacity is 10 + Endurance + arbitrary bonus slots.
  const carryCapacity: ComputedRef<number> = computed(
    // () => 10 + carryCapacityBonus.value + Number(abilityScoresStore.abilityScores.Endurance.base),
    () => 10 + carryCapacityBonus.value ,
  );
  const items: Ref<Array<AnyItem>> = ref([]);
  const itemsStowed: Ref<Array<AnyItem>> = ref([]);
  // const cash = ref(0);
  const cash = ref<Currency>({
    tn: 0,
    gold: 0,
    silver: 0,
    copper: 0
  });
  

  // Total encumbrance is the sum of the slots used by all inventory items.
  const totalEncumbrance = computed(() =>
    items.value.reduce((accum, item) => accum + item.slots, 0),
  );
  // Calculating whether encumbrance exceeds carrying capacity.
  const isOverburdened = computed(() => totalEncumbrance.value > carryCapacity.value);

  // This one checks if any weapon is marked as "equipped" and will treat it as the active weapon.
  const equippedWeapon: ComputedRef<Weapon | undefined> = computed(() => {
    const weapon = items.value
      .filter((item) => item.type === 'weapon')
      .find((weapon) => (weapon as Weapon).equipped);
    return weapon as Weapon;
  });
  const equippedArmor: ComputedRef<Armor | undefined> = computed(() => {
    const armor = items.value
      .filter((item) => item.type === 'armor')
      .find((armor) => (armor as Armor).equipped);
    return armor as Armor;
  });
  const equippedShield: ComputedRef<Armor | undefined> = computed(() => {
    const shield = items.value
      .filter((item) => item.type === 'shield')
      .find((shield) => (shield as Armor).equipped);
    return shield as Armor;
  });

  // Marks a piece of weapon or armor as equipped. It also un-equips whatever was equipped before, if any.
  const equipItem = (_id: string) => {
    const item = items.value.find((item) => item._id === _id);
    if (!item) return;
    if (item.type === 'weapon') equipWeapon(item as Weapon);
    if (item.type === 'armor') equipArmor(item as Armor);
    if (item.type === 'shield') equipShield(item as Armor);
  };
  const isWeapon = (item: AnyItem) => {
    return item.type === 'weapon';
  };
  const isArmor = (item: AnyItem) => {
    return item.type === 'armor';
  };
  const isShield = (item: AnyItem) => {
    return item.type === 'shield';
  };
  const unEquipItem = (_id: string) => {
    const item = items.value.find((item) => item._id === _id);
    if (item) {
      if (isWeapon(item)) (item as Weapon).equipped = false;
      if (isArmor(item)) (item as Armor).equipped = false;
      if (isShield(item)) (item as Armor).equipped = false;
    }
  };
  const equipWeapon = (weapon: Weapon) => {
    if (!weapon) return;
    if (equippedWeapon.value) {
      equippedWeapon.value.equipped = false;
    }
    weapon.equipped = true;
  };
  const equipArmor = (armor: Armor) => {
    if (!armor) return;
    // if (equippedArmor.value) {
    //   equippedArmor.value.equipped = false;
    // }
    armor.equipped = true;
  };
  const equipShield = (shield: Armor) => {
    if (!shield) return;
    shield.equipped = true;
  };

  // Inserts a new blank item into either carried or stowed inventory.
  const addItem = (newItem:any) => {
    const settings = useSettingsStore();
    const emptyItem: Item = {
      _id: uuidv4(),
      slots: 1,
      name: newItem ? newItem.name : '',
      description: newItem ? newItem.description : '',
      type: newItem ? newItem.type : '',
      quantity: newItem ? newItem.quantity : '',
      cost: newItem.cost || ''
    };
    if(newItem.type === 'weapon'){
      Object.assign(emptyItem,{
        damage: newItem ? newItem.damage : '',
        abilityScore: newItem ? newItem.abilityScore : '',
        weaponType: newItem ? newItem.weaponType : '',
        ability: newItem ? newItem.ability : '',
        weaponGroup: newItem ? newItem.weaponGroup : '',
        weaponGroupAbility:newItem ? newItem.weaponGroupAbility : '',
        shortRange:newItem ? newItem.shortRange : '',
        longRange:newItem ? newItem.longRange : '',
        reload:newItem ? newItem.reload : '',
        minStr: newItem.minStr || 0,
        configurable:true,
      })
      if(settings.gameSystem === 'mage'){
        Object.assign(emptyItem,{
          damageType: newItem ? newItem.damageType : '',
          damageSource: newItem ? newItem.damageSource : '',
        })
      }
    }
    if(newItem.type === 'armor'){
      Object.assign(emptyItem,{
        defenseMod: newItem ? newItem.defenseMod : '',
        armorPenalty: newItem ? newItem.armorPenalty : '',
        strain: newItem ? newItem.strain : '',
      })
    }    
    if(newItem.type === 'shield'){
      Object.assign(emptyItem,{
        defenseMod: newItem ? newItem.defenseMod : ''
      })
    }
    items.value.push(emptyItem);
  };
  // Switches an item between the regular and stowed inventories. Goes to the bottom spot of it's new list.
  const swapItem = (_id: string, stowed: boolean) => {
    const listFrom = stowed ? itemsStowed.value : items.value;
    const listTo = stowed ? items.value : itemsStowed.value;
    const indexToSwap = listFrom.findIndex((item) => item._id === _id);
    unEquipItem(_id);
    if (indexToSwap < 0) return;
    listTo.push(listFrom[indexToSwap]);
    listFrom.splice(indexToSwap, 1);
  };
  const removeItem = (_id: string, stowed: boolean) => {
    const listFrom = stowed ? itemsStowed.value : items.value;
    const indexToRemove = listFrom.findIndex((item) => item._id === _id);
    if (indexToRemove >= 0) listFrom.splice(indexToRemove, 1);
  };

  /*
   * Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id.
   * */
  const dehydrate = () => {
    return {
      inventory: {
        items: arrayToObject(items.value),
        itemsStowed: arrayToObject(itemsStowed.value),
        cash: cash.value,
        carryCapacityBonus: carryCapacityBonus.value,
      },
    };
  };
  // Shows a template with the item details.
  const printItem = async (_id: string) => {
    const item =
      items.value.find((item) => item._id === _id) ||
      itemsStowed.value.find((item) => item._id === _id);
    if (!item) return;
    console.log(item)
    await sendToChat({
      title: item.name,
      subtitle: item.type,
      traits: ['Inventory', item.type],
      description: item.description,
    });
    // TODO: Add sheet-action for Consumable items to subtract 1.
  };
  /*
   * Since the items array is coming is an object, we convert it back into an array before saving here.
   * */
  const hydrate = (hydrateStore: InventoryHydrate) => {
    carryCapacityBonus.value =
      hydrateStore.inventory.carryCapacityBonus || carryCapacityBonus.value;
    items.value = objectToArray(hydrateStore.inventory.items) || items.value;
    itemsStowed.value = objectToArray(hydrateStore.inventory.itemsStowed) || itemsStowed.value;
    cash.value = hydrateStore.inventory.cash || cash.value;
  };

  return {
    carryCapacity,
    carryCapacityBonus,
    cash,
    items,
    itemsStowed,
    totalEncumbrance,
    isOverburdened,
    equippedWeapon,
    equippedArmor,
    equippedShield,

    equipItem,
    unEquipItem,
    swapItem,
    addItem,
    removeItem,
    printItem,

    dehydrate,
    hydrate,
  };
});
