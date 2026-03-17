import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { spine } from '@/spine/spine';
import { type Tag } from '@/sheet/stores/themes/themesStore';

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

type Item = Tag;

type Fullfilment = {
  _id: string;
  description?: string;
}

type Special = {
  _id: string;
  name: string;
  description?: string;
  checked: boolean;
}

export type Essences = { 
  'real': boolean;
  'spiritualist': boolean;
  'avatar': boolean;
  'conduit': boolean;
  'transhuman': boolean;
  'singularity': boolean;
  'cyborg': boolean;
  'nexus': boolean;
};

type PromiseValue = 0 | 1 | 2 | 3 | 4 | 5;
type HeroStoreHydratate = {
  player: string;
  fellowshipRelations: Record<string, FellowshipRelation>;
  promise: PromiseValue;
  quintessences: Record<string, Quintessence>;
  backpack: Record<string, Item>;
  notes: string;
  fulfillments: Record<string, Fullfilment>;
  specials: Record<string, Special>;
  essences: Essences;
}

export const heroStore = defineStore('hero', () => {
  const getEmptyItem = (): Item => ({
    _id: uuidv4(),
    name: '',
    type: 'Power',
    burnt: false,
    checked: false,
  });
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
  const getEmptySpecial = (override: Partial<Special> = {}): Special => ({
    _id: uuidv4(),
    name: '',
    checked: false,
    ...override,
  });

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
      fulfillments: arrayToObject(fulfillments.value),
      specials: arrayToObject(specials.value),
      essences: essences.value,
    }
  };

  const hydrate = (payload: HeroStoreHydratate) => {
    player.value = payload.player ?? player.value;
    fellowshipRelations.value = objectToArray(payload.fellowshipRelations) ?? fellowshipRelations.value;
    promise.value = payload.promise;
    quintessences.value = objectToArray(payload.quintessences) ?? quintessences.value;
    backpack.value = objectToArray(payload.backpack) ?? backpack.value;
    notes.value = payload.notes ?? notes.value;
    fulfillments.value = objectToArray(payload.fulfillments) ?? fulfillments.value;
    specials.value = objectToArray(payload.specials) ?? specials.value;
    essences.value = payload.essences ?? essences.value;
  };

  const firstName = ref<string>('');
  const lastName = ref<string>('');
  const player = ref<string>('');
  const fellowshipRelations = ref<FellowshipRelation[]>(
    Array.from({ length: 6 }, () => getEmptyRelation())
  );
  const promise = ref<PromiseValue>(0);
  const quintessences = ref<Quintessence[]>(
    Array.from({ length: 4 }, () => getEmptyQuintessence())
  );
  const backpack = ref<Item[]>(
    Array.from({ length: 11 }, () => getEmptyItem())
  );
  const notes = ref<string>('');
  const fulfillments = ref<Fullfilment[]>(
    Array.from({ length: 10 }, () => ({
      _id: uuidv4(),
      description: '',
    }))
  );
  const specials = ref<Special[]>(Array.from({ length: 3 }, () => getEmptySpecial()));
  const essences = ref<Essences>({
    real: false,
    spiritualist: false,
    avatar: false,
    conduit: false,
    transhuman: false,
    singularity: false,
    cyborg: false,
    nexus: false,
  });

  return {
    getEmptyItem,
    getEmptyRelation,
    getEmptyQuintessence,
    getEmptySpecial,
    
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
    fulfillments,
    specials,
    essences,

    dehydrate,
    hydrate,
  }
});