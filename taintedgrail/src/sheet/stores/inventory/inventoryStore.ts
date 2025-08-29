import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import sendToChat from '@/utility/sendToChat';
import { v4 as uuidv4 } from 'uuid';
import { useWaysStore } from '../ways/waysStore';
import sendUserError from '@/utility/sendUserError';

/**
 * All of these category types (should) correspond with the Roll20 TG compendium categories,
 * since we get the category name from the DropData.
 * This way we don't have to define the category type in the item object.
 */
export enum CategoryType {
  WEAPON = 'Weapons',
  ARMOR = 'Armors',
  SPELL = 'Spells',
  // All the below ones are "show in chat" items and only need a name and description.
  EQUIPMENT = 'Equipment',
  TORMENT = 'Torments',
  ROUT = 'Routs',
  ADVANTAGE = 'Advantages',
  DISADVANTAGE = 'Disadvantages',
  PREMISE = 'Premises',
  AWAKENING = 'Awakenings',
  RISE = 'Rises',
  ASCENSION = 'Ascensions',
}

export type Item = {
  _id: string;
  type: CategoryType;
  name: string;
  description: string;
  quantity: number;
  icon: string;
};

export type Weapon = Item & {
  domain: string;
  discipline?: string;
  damage: string;
  range: string;
};

export type Armor = Item & {
  standardProtection: number;
  offensiveProtection: number;
  defensiveProtection: number;
};

export type Spell = Item & {
  discipline: string; // Druidism, Low Magic, Sorcery, Wyrd Magic
  mpCost: number;
  castTime: string;
};

export type AnyItem = Item | Weapon | Armor | Spell;

export type InventoryHydrate = {
  inventory: {
    weapons: Record<string, Weapon>;
    armors: Record<string, Armor>;
    spells: Record<string, Spell>;
    equipment: Record<string, Item>;
    torments: Record<string, Item>;
    routs: Record<string, Item>;
    advantages: Record<string, Item>;
    disadvantages: Record<string, Item>;
    premises: Record<string, Item>;
    awakenings: Record<string, Item>;
    rises: Record<string, Item>;
    ascensions: Record<string, Item>;
    riches: number;
  };
};

export const useInventoryStore = defineStore('inventory', () => {
  const weapons: Ref<Array<Weapon>> = ref([]);
  const armors: Ref<Array<Armor>> = ref([]);
  const spells: Ref<Array<Spell>> = ref([]);
  const equipment: Ref<Array<Item>> = ref([]);
  const torments: Ref<Array<Item>> = ref([]);
  const routs: Ref<Array<Item>> = ref([]);
  const advantages: Ref<Array<Item>> = ref([]);
  const disadvantages: Ref<Array<Item>> = ref([]);
  const premises: Ref<Array<Item>> = ref([]);
  const awakenings: Ref<Array<Item>> = ref([]);
  const rises: Ref<Array<Item>> = ref([]);
  const ascensions: Ref<Array<Item>> = ref([]);
  const riches: Ref<number> = ref(0);

  // Mapper to not need giant switch/if statement blocks.
  const categoryArrayMap = {
    [CategoryType.WEAPON]: weapons,
    [CategoryType.ARMOR]: armors,
    [CategoryType.SPELL]: spells,
    [CategoryType.EQUIPMENT]: equipment,
    [CategoryType.TORMENT]: torments,
    [CategoryType.ROUT]: routs,
    [CategoryType.ADVANTAGE]: advantages,
    [CategoryType.DISADVANTAGE]: disadvantages,
    [CategoryType.PREMISE]: premises,
    [CategoryType.AWAKENING]: awakenings,
    [CategoryType.RISE]: rises,
    [CategoryType.ASCENSION]: ascensions,
  } as const;

  const createGenericItem = (item: any, categoryName: CategoryType): AnyItem => ({
    _id: uuidv4(),
    type: categoryName,
    name: item.properties.Name,
    description: item.properties.Description || '',
    quantity: item.properties.Quantity || 1,
    icon: item.properties['data-builderImage'] || '',
  });

  const enrichWeapon = (baseItem: AnyItem, item: any): Weapon =>
    ({
      ...baseItem,
      domain: item.properties['data-Domain'],
      discipline: item.properties['data-Discipline'],
      damage: item.properties.Damage || '',
      range: item.properties.Range || '',
    } as Weapon);

  const enrichArmor = (baseItem: AnyItem, item: any): Armor =>
    ({
      ...baseItem,
      standardProtection: item.properties['data-StandardProtection'],
      offensiveProtection: item.properties['data-OffensiveProtection'],
      defensiveProtection: item.properties['data-DefensiveProtection'],
    } as Armor);

  const enrichSpell = (baseItem: AnyItem, item: any): Spell =>
    ({
      ...baseItem,
      discipline: item.properties['data-Discipline'] || '',
      mpCost: parseInt(item.properties['data-MpCost']) || 0,
      castTime: item.properties['Casting Time'] || '',
    } as Spell);
  const addItem = async (item: any, categoryName: CategoryType) => {
    const { getDisciplineByName } = useWaysStore();

    const targetArray = categoryArrayMap[categoryName];
    if (!targetArray) {
      console.error('addItem -> unknown item type', item);
      return;
    }

    const baseItem = createGenericItem(item, categoryName);
    let enrichedItem: AnyItem;

    let canAdd = true;
    // Check if the player has the discipline if it's required.
    if (categoryName === CategoryType.WEAPON || categoryName === CategoryType.SPELL) {
      const discipline = item.properties['data-Discipline'];
      if (discipline && discipline !== '') {
        const disciplineObject = getDisciplineByName(discipline);
        canAdd = disciplineObject !== undefined;
        if (!canAdd) {
          await sendUserError({
            title: `Unable to add ${categoryName}: ${baseItem.name}`,
            textContent: `You do not have the ${discipline} discipline.`,
          });
          return;
        }
      }
    }

    // Check if the player already has a torment or rout (only one of each)
    if (categoryName === CategoryType.TORMENT) {
      if (torments.value.length > 0) {
        await sendUserError({
          title: `Unable to add ${categoryName}: ${baseItem.name}`,
          textContent: `You can only have one torment.`,
        });
        return;
      }
    } else if (categoryName === CategoryType.ROUT) {
      if (routs.value.length > 0) {
        await sendUserError({
          title: `Unable to add ${categoryName}: ${baseItem.name}`,
          textContent: `You can only have one rout.`,
        });
        return;
      }
    }

    switch (categoryName) {
      case CategoryType.WEAPON:
        enrichedItem = enrichWeapon(baseItem, item);
        break;
      case CategoryType.ARMOR:
        enrichedItem = enrichArmor(baseItem, item);
        break;
      case CategoryType.SPELL:
        enrichedItem = enrichSpell(baseItem, item);
        break;
      default:
        enrichedItem = baseItem;
        break;
    }

    if (canAdd) {
      targetArray.value.push(enrichedItem as any);
    }
  };

  const removeItem = (item: AnyItem) => {
    const targetArray = categoryArrayMap[item.type];
    if (!targetArray) {
      console.error('removeItem -> unknown item type', item);
      return;
    }

    targetArray.value = targetArray.value.filter((existingItem) => existingItem._id !== item._id);
  };

  // Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id.
  const dehydrate = () => {
    return {
      inventory: {
        weapons: arrayToObject(weapons.value),
        armors: arrayToObject(armors.value),
        spells: arrayToObject(spells.value),
        equipment: arrayToObject(equipment.value),
        torments: arrayToObject(torments.value),
        routs: arrayToObject(routs.value),
        advantages: arrayToObject(advantages.value),
        disadvantages: arrayToObject(disadvantages.value),
        premises: arrayToObject(premises.value),
        awakenings: arrayToObject(awakenings.value),
        rises: arrayToObject(rises.value),
        ascensions: arrayToObject(ascensions.value),
        riches: riches.value,
      },
    };
  };

  // Since the items array is coming is an object, we convert it back into an array before saving here.
  const hydrate = (hydrateStore: InventoryHydrate) => {
    weapons.value = objectToArray(hydrateStore.inventory.weapons) || weapons.value;
    armors.value = objectToArray(hydrateStore.inventory.armors) || armors.value;
    spells.value = objectToArray(hydrateStore.inventory.spells) || spells.value;
    equipment.value = objectToArray(hydrateStore.inventory.equipment) || equipment.value;
    torments.value = objectToArray(hydrateStore.inventory.torments) || torments.value;
    routs.value = objectToArray(hydrateStore.inventory.routs) || routs.value;
    advantages.value = objectToArray(hydrateStore.inventory.advantages) || advantages.value;
    disadvantages.value = objectToArray(hydrateStore.inventory.disadvantages) || disadvantages.value;
    premises.value = objectToArray(hydrateStore.inventory.premises) || premises.value;
    awakenings.value = objectToArray(hydrateStore.inventory.awakenings) || awakenings.value;
    rises.value = objectToArray(hydrateStore.inventory.rises) || rises.value;
    ascensions.value = objectToArray(hydrateStore.inventory.ascensions) || ascensions.value;
    riches.value = hydrateStore.inventory.riches || riches.value;
  };

  return {
    weapons,
    armors,
    spells,
    equipment,
    torments,
    routs,
    advantages,
    disadvantages,
    premises,
    awakenings,
    rises,
    ascensions,
    riches,

    addItem,
    removeItem,
    dehydrate,
    hydrate,
  };
});
