import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';

export type Tracker = {
  _id: string;
  name: string;
  mode?: 'bonus' | 'penalty';
  stages: {
    level_1: boolean;
    level_2: boolean;
    level_3: boolean;
    level_4: boolean;
    level_5: boolean;
    level_6: boolean;
  }
};

type TrackersStoreHydratate = {
  trackers: Record<string, Tracker>;
}

export const trackersStore = defineStore('trackers', () => {
  const getEmptyTracker = (): Tracker => ({
    _id: uuidv4(),
    name: '',
    stages: {
      level_1: false,
      level_2: false,
      level_3: false,
      level_4: false,
      level_5: false,
      level_6: false,
    }
  });

  const deleteTracker = (trackerId: string) => {
    trackers.value = trackers.value.filter(t => t._id !== trackerId);
  };
  const updateTracker = (override: Partial<Tracker> = {}) => {
    const existing = trackers.value.find(t => override._id && t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else  {
      trackers.value.push({
        ...getEmptyTracker(),
        ...override,
      } as Tracker);
    }
  };

  const dehydrate = (): TrackersStoreHydratate => {
    return {
      trackers: arrayToObject(trackers.value)
    }
  };

  const hydrate = (payload: TrackersStoreHydratate) => {
    trackers.value = payload.trackers ? objectToArray(payload.trackers) : trackers.value;
  };

  const trackers = ref<Tracker[]>([]);
  
  return {
    getEmptyTracker,
    
    deleteTracker,
    updateTracker,

    trackers,

    dehydrate,
    hydrate,
  }
});