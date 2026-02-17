import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';

type Meta = {
  rating: number | null;
  roles: string;
  description?: string;
}

type Limit = {
  _id: string;
  name: string;
  value: number;
  description?: string;
}

type TagOrStatus = {
  _id: string;
  name: string;
  value?: number;
}

type Might = {
  _id: string;
  type: 'Origin' | 'Adventure' | 'Greatness';
  description: string;
}

type SpecialFeature = {
  _id: string;
  name: string;
  description: string;
}

type Consequence = {
  _id: string;
  description: string;
}
export type Threat = {
  _id: string;
  name: string;
  description: string;
  consequences: Consequence[];
}

type ChallengeStoreHydratate = {
  sheetType: 'character' | 'challenge' | undefined;
  meta: Meta;
  limits: Record<string, Limit>;
  tagsAndStatuses: Record<string, TagOrStatus>;
  mighties: Record<string, Might>;
  specialFeatures: Record<string, SpecialFeature>;
  threats: Record<string, Omit<Threat, 'consequences'> & {consequences: Record<string, Consequence>}>;
}

export const challengeStore = defineStore('challenge', () => {
  const getEmptyMeta = (): Meta => {
    return {
      rating: null,
      roles: '',
    };
  };
  const getEmptyLimit = (): Limit => {
    return {
      _id: uuidv4(),
      name: '',
      value: 0,
    };
  };
  const getEmptyTagOrStatus = (): TagOrStatus => {
    return {
      _id: uuidv4(),
      name: '',
    };
  };
  const getEmptyMight = (): Might => {
    return {
      _id: uuidv4(),
      type: 'Origin',
      description: '',
    };
  };
  const getEmptySpecialFeature = (): SpecialFeature => {
    return {
      _id: uuidv4(),
      name: '',
      description: '',
    };
  };
  const getEmptyConsequence = (): Consequence => {
    return {
      _id: uuidv4(),
      description: '',
    };
  };
  const getEmptyThreat = (): Threat => {
    return {
      _id: uuidv4(),
      name: '',
      description: '',
      consequences: [],
    };
  }

  const deleteLimit = (limitId: string) => {
    limits.value = limits.value.filter(t => t._id !== limitId);
  };
  const deleteTagOrStatus = (tagOrStatusId: string) => {
    tagsAndStatuses.value = tagsAndStatuses.value.filter(t => t._id !== tagOrStatusId);
  };
  const deleteMight = (mightId: string) => {
    mighties.value = mighties.value.filter(t => t._id !== mightId);
  }
  const deleteSpecialFeature = (specialFeatureId: string) => {
    specialFeatures.value = specialFeatures.value.filter(t => t._id !== specialFeatureId);
  };
  const deleteConsequence = (threatId: string, consequenceId: string) => {
    const threat = threats.value.find(t => t._id === threatId);
    if (threat) {
      threat.consequences = threat.consequences.filter(c => c._id !== consequenceId);
    }
  };
  const deleteThreat = (threatId: string) => {
    threats.value = threats.value.filter(t => t._id !== threatId);
  };

  const updateLimit = (override: Partial<Limit>) => {
    const existing = limits.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else {
      limits.value.push({
        ...getEmptyLimit(), 
        ...override,
      } as Limit);
    }
  };

  const updateTagOrStatus = (override: Partial<TagOrStatus>) => {
    const existing = tagsAndStatuses.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else {
      tagsAndStatuses.value.push({
        ...getEmptyTagOrStatus(),
        ...override,
      } as TagOrStatus);
    }
  };

  const updateMight = (override: Partial<Might>) => {
    const existing = mighties.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else {
      mighties.value.push({
        ...getEmptyMight(),
        ...override,
      } as Might);
    }
  };

  const updateSpecialFeature = (override: Partial<SpecialFeature>) => {
    const existing = specialFeatures.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else {
      specialFeatures.value.push({
        ...getEmptySpecialFeature(),
        ...override,
      } as SpecialFeature);
    }
  };

  const updateThreat = (override: Partial<Threat>) => {
    const existing = threats.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else {
      threats.value.push({
        ...getEmptyThreat(),
        ...override,
      } as Threat);
    }
  };

  const dehydrate = (): ChallengeStoreHydratate => {
    return {
      sheetType: sheetType.value,
      meta: meta.value,
      limits: arrayToObject(limits.value),
      tagsAndStatuses: arrayToObject(tagsAndStatuses.value),
      mighties: arrayToObject(mighties.value),
      specialFeatures: arrayToObject(specialFeatures.value),
      threats: arrayToObject(threats.value.map(t => ({
        ...t,
        consequences: arrayToObject(t.consequences),
      }))),
    }
  };

  const hydrate = (payload: ChallengeStoreHydratate) => {
    sheetType.value = payload.sheetType || sheetType.value;
    meta.value = payload.meta || meta.value;
    limits.value = objectToArray(payload.limits) || limits.value;
    tagsAndStatuses.value = objectToArray(payload.tagsAndStatuses) || tagsAndStatuses.value;
    mighties.value = objectToArray(payload.mighties) || mighties.value;
    specialFeatures.value = objectToArray(payload.specialFeatures) || specialFeatures.value;
    threats.value = objectToArray(payload.threats).map(t => ({
      ...t,
      consequences: objectToArray(payload.threats[t._id]?.consequences) || [],
    })) || threats.value;
  };

  const mode = ref<'edit' | 'view'>('view');
  const sheetType = ref<'character' | 'challenge' | undefined>(undefined);
  const meta = ref<Meta>(getEmptyMeta());
  const limits = ref<Limit[]>([]);
  const tagsAndStatuses = ref<TagOrStatus[]>([]);
  const mighties = ref<Might[]>([]);
  const specialFeatures = ref<SpecialFeature[]>([]);
  const threats = ref<Threat[]>([]);

  return {
    getEmptyMeta,
    getEmptyLimit,
    getEmptyTagOrStatus,
    getEmptySpecialFeature,
    getEmptyConsequence,
    getEmptyThreat,

    deleteLimit,
    deleteTagOrStatus,
    deleteMight,
    deleteSpecialFeature,
    deleteConsequence,
    deleteThreat,

    updateLimit,
    updateTagOrStatus,
    updateMight,
    updateSpecialFeature,
    updateThreat,
    
    mode,
    sheetType,
    meta,
    limits,
    tagsAndStatuses,
    mighties,
    specialFeatures,
    threats,
    
    dehydrate,
    hydrate,
  }
});