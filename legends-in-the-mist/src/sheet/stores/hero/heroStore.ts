import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { spine } from '@/spine/spine';

type FellowshipRelation = {
  _id: string;
  companion: string;
  tag: string;
};

type Quintessence = {
  _id: string;
  name: typeof spine.quintessences[number] | '';
  description?: string;
}

type Item = {
  _id: string;
  name: string;
  description?: string;
}

type PromiseValue = 0 | 1 | 2 | 3 | 4 | 5;
type HeroStoreHydratate = {
  player: string;
  fellowshipRelations: Record<string, FellowshipRelation>;
  promise: PromiseValue;
  quintessences: Record<string, Quintessence>;
  backpack: Record<string, Item>;
  notes: string;
}


export const heroStore = defineStore('hero', () => {
  const getEmptyItem = (): Item => {
    return {
      _id: uuidv4(),
      name: '',
    };
  };
  const getEmptyRelation = (): FellowshipRelation => {
    return {
      _id: uuidv4(),
      companion: '',
      tag: '',
    };
  };
  const getEmptyQuintessence = (): Quintessence => {
    return {
      _id: uuidv4(),
      name: '',
    };
  };

  const deleteItem = (itemId: string) => {
    backpack.value = backpack.value.filter(t => t._id !== itemId);
  };
  const deleteQuintessence = (quintessenceId: string) => {
    quintessences.value = quintessences.value.filter(t => t._id !== quintessenceId);
  }
  const updateItem = (override: Partial<Item>) => {
    const existing = backpack.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else  {
      backpack.value.push({
        ...getEmptyItem(),
        ...override,
      } as Item);
    }
  };
  const updateQuintessence = (override: Partial<Quintessence>) => {
    const existing = quintessences.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else {
      quintessences.value.push({
        ...getEmptyQuintessence(),
        ...override,
      } as Quintessence);
    }
  };

  const dehydrate = (): HeroStoreHydratate => {
    return {
      player: player.value,
      fellowshipRelations: arrayToObject(fellowshipRelations.value),
      promise: promise.value,
      quintessences: arrayToObject(quintessences.value),
      backpack: arrayToObject(backpack.value),
      notes: notes.value,
    }
  };

  const hydrate = (payload: HeroStoreHydratate) => {
    player.value = payload.player || player.value;
    fellowshipRelations.value = objectToArray(payload.fellowshipRelations) || fellowshipRelations.value;
    promise.value = payload.promise;
    quintessences.value = objectToArray(payload.quintessences) || quintessences.value;
    backpack.value = objectToArray(payload.backpack) || backpack.value;
    notes.value = payload.notes || notes.value;
  };

  const firstName = ref<string>('');
  const lastName = ref<string>('');
  const player = ref<string>('');
  const fellowshipRelations = ref<FellowshipRelation[]>(
    Array.from({ length: 5 }, () => getEmptyRelation())
  );
  const promise = ref<PromiseValue>(0);
  const quintessences = ref<Quintessence[]>(
    Array.from({ length: 4 }, () => getEmptyQuintessence())
  );
  const backpack = ref<Item[]>(
    Array.from({ length: 10 }, () => getEmptyItem())
  );
  const notes = ref<string>('');

  return {
    getEmptyItem,
    getEmptyRelation,
    getEmptyQuintessence,
    
    deleteItem,
    deleteQuintessence,
    updateItem,
    updateQuintessence,

    player,
    fellowshipRelations,
    promise,
    quintessences,
    backpack,
    notes,

    dehydrate,
    hydrate,
  }
});