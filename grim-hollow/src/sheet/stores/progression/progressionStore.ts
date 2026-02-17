import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import {
  arrayToObject,
  objectToArray,
  indexedObjectToArray,
  arrayToIndexedObject,
} from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import { getEntryById } from '@/utility/getEntryBy';
import {
  useSpellsStore,
  type SpellCastingProgression,
  type StandardSpellSource,
} from '../spells/spellsStore';
import { config } from '@/config';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { useFeaturesStore } from '../features/faturesStore';
import { dropClassFeatures } from '@/compendium/dropClass';
import { type CascadeData } from '@/compendium/drop';
import { dropAncestryFeatures } from '@/compendium/dropRace';
import { add, transform } from 'lodash';
import { dropBackgroundFeatures } from '@/compendium/dropBackground';
import { effectKeys } from '@/effects.config';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { dropTransformationFeatures } from '@/compendium/dropTransformation';
import { re } from 'mathjs';

export type FeatureId = {
  level: number;
  expirantionLevel?: number;
  id: string;
};

export type ClassProgression = {
  _id: string;
  name: string;
  sourceBook: number;
  hitDie: string;
  hitPoints: number[];
  level: number;
  subclass: string;
  subclassSourceBook?: number;
  subclassUnlockLevel: number;
  label: '';
  spellcasting: SpellCastingProgression;
  subclassSpellcasting: SpellCastingProgression;
  spellSourceId: string;
  featureIds: FeatureId[];
  subclassFeatureIds: FeatureId[];
  compendiumData: {
    class: string | null;
    subclass: string | null;
  };
};

export type TransformationProgression = {
  name: string;
  sourceBook: number;
  featureIds: FeatureId[];
  level: number;
  compendiumData: {
    transformation: string | null;
  }
};

export type RaceProgression = {
  name: string;
  subrace: string;
  sourceBook: number;
  subraceSourceBook: number;
  featureIds: FeatureId[];
  subraceFeatureIds: FeatureId[];
  compendiumData: {
    race: string | null;
    subrace: string | null;
  };
};

export type BackgroundProgression = {
  name: string;
  sourceBook: number;
  featureIds: FeatureId[];
  compendiumData: string | null;
};

export type AdvancementeMode = 'milestone' | 'experience';

export type ProgressionHydrate = {
  classes: Record<
    string,
    Omit<ClassProgression, 'featureIds' | 'hitPoints'> & {
      featureIds: Record<string, FeatureId>;
      subclassFeatureIds: Record<string, FeatureId>;
      hitPoints: Record<string, number>;
    }
  >;
  transformation: Omit<TransformationProgression, 'featureIds'> & {
    featureIds: Record<string, FeatureId>;
  };
  ancestry: Omit<RaceProgression, 'featureIds' | 'subraceFeatureIds'> & {
    featureIds: Record<string, FeatureId>;
    subraceFeatureIds: Record<string, FeatureId>;
  };
  HitPointsMode: HitPointsMode;
  experiencePoints: number;
  advancementeMode: AdvancementeMode;
  hitDice: HitDice;
  background: Omit<BackgroundProgression, 'featureIds'> & {
    featureIds: Record<string, FeatureId>;
  };
};

export type HitPointsMode = 'average' | 'rolled' | 'manual';

export type HitDieSize = (typeof config.hitDieSize)[number];
export type HitDiceCollection = Record<HitDieSize, number>;

export type HitDice = {
  mode: 'automatic' | 'manual';
  total: HitDiceCollection;
  used: HitDiceCollection;
};

export const useProgressionStore = defineStore('progression', () => {
  const classes: Ref<Array<ClassProgression>> = ref([]);
  const transformation: Ref<TransformationProgression> = ref({
    name: '',
    sourceBook: -1,
    featureIds: [],
    level: 0,
    compendiumData: {
      transformation: null,
    }
  });
  const ancestry: Ref<RaceProgression> = ref({
    name: '',
    sourceBook: -1,
    subrace: '',
    subraceSourceBook: -1,
    featureIds: [],
    subraceFeatureIds: [],
    compendiumData: {
      race: null,
      subrace: null,
    },
  });
  const hitPointsMode: Ref<HitPointsMode> = ref('average');
  const experiencePoints: Ref<number> = ref(0);
  const advancementeMode = ref<AdvancementeMode>('experience');
  const background = ref<BackgroundProgression>({
    name: '',
    sourceBook: -1,
    featureIds: [],
    compendiumData: null,
  });

  const hitDice: Ref<HitDice> = ref({
    mode: 'automatic',
    total: Object.fromEntries(config.hitDieSize.map((size) => [size, 0])) as HitDiceCollection,
    used: Object.fromEntries(config.hitDieSize.map((size) => [size, 0])) as HitDiceCollection,
  });

  const getHitDice: ComputedRef<Partial<HitDiceCollection>> = computed(() => {
    if (hitDice.value.mode === 'manual') {
      // return Object.fromEntries(
      //   Object.entries(hitDice.value.total).filter(([_, value]) => value && value > 0),
      // );
      return Object.fromEntries(
        Object.entries(hitDice.value.total),
      );
    } else {
      const allHitDice = classes.value.reduce((acc: Record<HitDieSize, number>, cls) => {
        const size = cls.hitDie as HitDieSize;
        acc[size] = (acc[size] || 0) + (cls.level || 0);
        return acc;
      }, Object.fromEntries(config.hitDieSize.map((size) => [size, 0])) as Record<HitDieSize, number>);

      const effectsStore = useEffectsStore();
      const finalHitDice: Partial<HitDiceCollection> = {};

      (Object.keys(allHitDice) as HitDieSize[]).forEach((size) => {
        const baseTotal = allHitDice[size];

        const effectKeyName = `${size.replace('1', '')}-hit-dice`;
        const effectKey = effectKeys[effectKeyName as keyof typeof effectKeys];

        const modified = effectsStore.getModifiedValue(baseTotal, effectKey).value.final;

        // if (modified > 0) {
        //   finalHitDice[size] = modified;
        // }
        finalHitDice[size] = modified;
      });

      return finalHitDice;
    }
  });

  const getLevel = computed(() =>
    classes.value.reduce((level, cls) => level + (cls.level || 0), 0),
  );

  const getProficiencyBonus = computed(() => {
    const level = getLevel.value;
    return level === 0 ? 0 : Math.ceil(level / 4) + 1;
  });

  const trimWithEllipsis = (str: string, maxLength: number): string => {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  };

  const getClassesSummary = computed(() => {
    const summary = classes.value
      .map((cls) => `${cls.subclass} ${cls.name} ${cls.level}`)
      .join(',')
      .trim();

    return trimWithEllipsis(summary, 13);
  });

  const getTransformationSummary = computed(() => {
    if(transformation.value.name && transformation.value.level && transformation.value.level > 0) return `${transformation.value.name} ${transformation.value.level}`;
    return '';
  });

  const getAncestrySummary = computed(() => {
    if (!ancestry.value.subrace) {
      return ancestry.value.name;
    } else if (!ancestry.value.name) {
      return '';
    } else {
      return ancestry.value.subrace.toLowerCase().includes(ancestry.value.name.toLowerCase())
        ? ancestry.value.subrace
        : `${ancestry.value.subrace} ${ancestry.value.name}`;
    }
  });

  const getEmptyBackground = (): BackgroundProgression => {
    return {
      name: '',
      sourceBook: -1,
      featureIds: [],
      compendiumData: null,
    };
  };

  const getEmptyClass = (): ClassProgression => {
    return {
      _id: uuidv4(),
      name: '',
      sourceBook: -1,
      hitDie: config.hitDieSize[0],
      hitPoints: [],
      level: 1,
      subclass: '',
      subclassSourceBook: -1,
      subclassUnlockLevel: -1,
      label: '',
      spellcasting: 'none',
      subclassSpellcasting: 'none',
      spellSourceId: uuidv4(),
      featureIds: [],
      subclassFeatureIds: [],
      compendiumData: {
        class: null,
        subclass: null,
      },
    };
  };

  const updateClass = (patch: Partial<ClassProgression>): void => {
    let cls = patch._id
      ? (getEntryById(patch._id, classes.value) as ClassProgression | undefined)
      : false;
    if (!cls) {
      cls = { ...getEmptyClass(), ...patch };
      classes.value.push(cls);
    } else {
      Object.assign(cls, patch);
    }

    if (cls.hitDie && cls.level) {
      const size = parseInt(cls.hitDie.split('d')[1]);
      const amountOfDice = parseInt(cls.hitDie.split('d')[0]);

      const currentHP = cls.hitPoints || [];

      const hitPoints = Array.from({ length: cls.level ?? 1 }, (_, i) => {
        if (hitPointsMode.value === 'average') {
          return i === 0 ? size * amountOfDice : (Math.ceil(size / 2) + 1) * amountOfDice;
        } else if (hitPointsMode.value === 'rolled') {
          if (currentHP[i]) return currentHP[i];
          const diceRoll = new DiceRoll(cls!.hitDie);
          diceRoll.roll();
          return diceRoll.total;
        } else {
          return currentHP[i] || 0;
        }
      });
      cls.hitPoints = hitPoints;
    } else {
      cls.hitPoints = [];
    }
  };

  const removeClassFeatures = (
    _id: string,
    classFeatures: boolean = true,
    subclassFeatures: boolean = true,
    aboveLevel?: number,
  ) => {
    const existing = classes.value.find((cls) => cls._id === _id);
    if (!existing) return;

    const featuresStore = useFeaturesStore();

    if (classFeatures) {
      if (aboveLevel) {
        existing.featureIds
          .filter((id) => id.level > aboveLevel)
          .forEach((fid) => featuresStore.remove(fid.id));
        existing.featureIds = existing.featureIds.filter((id) => id.level <= aboveLevel);

        //Expired Features
        existing.featureIds
          .filter((id) => id.expirantionLevel && id.expirantionLevel < existing.level + 1)
          .forEach((fid) => featuresStore.remove(fid.id));
        existing.featureIds = existing.featureIds.filter(
          (id) => !id.expirantionLevel || id.expirantionLevel >= existing.level - 1,
        );
      } else {
        existing.featureIds.forEach((fid) => featuresStore.remove(fid.id));
        existing.featureIds = [];
      }
    }

    if (subclassFeatures) {
      if (aboveLevel) {
        existing.subclassFeatureIds
          .filter((id) => id.level > aboveLevel)
          .forEach((fid) => featuresStore.remove(fid.id));
        existing.subclassFeatureIds = existing.subclassFeatureIds.filter(
          (id) => id.level <= aboveLevel,
        );

        //Expired Features
        existing.subclassFeatureIds
          .filter((id) => id.expirantionLevel && id.expirantionLevel < existing.level + 1)
          .forEach((fid) => featuresStore.remove(fid.id));
        existing.subclassFeatureIds = existing.subclassFeatureIds.filter(
          (id) => !id.expirantionLevel || id.expirantionLevel >= existing.level - 1,
        );
      } else {
        existing.subclassFeatureIds.forEach((fid) => featuresStore.remove(fid.id));
        existing.subclassFeatureIds = [];
      }
    }
  };

  const removeClassSpellSource = (_id: string) => {
    const existing = classes.value.find((cls) => cls._id === _id);
    if (!existing || !existing.spellSourceId) return;

    const spellsStore = useSpellsStore();
    const source = spellsStore.sources.find((s) => s._id === existing.spellSourceId) as
      | StandardSpellSource
      | undefined;
    if (!source) return;
    spellsStore.removeSource(source);
  };

  const removeClass = (_id: string) => {
    const indexToRemove = classes.value.findIndex((cls) => cls._id === _id);
    if (indexToRemove >= 0) {
      removeClassFeatures(_id);
      removeClassSpellSource(_id);
      classes.value.splice(indexToRemove, 1);
    }
  };

  const removeSubclass = (_id: string) => {
    const existing = classes.value.find((cls) => cls._id === _id);
    if (!existing) return;

    removeClassFeatures(_id, false, true);
    existing.subclass = '';
    existing.subclassSourceBook = undefined;
    existing.compendiumData.subclass = null;
  };

  const addFeaturesToClass = async (
    _id: string,
    startingLevel: number,
    endingLevel: number = startingLevel,
    classFeatures: boolean = true,
    subclassFeatures: boolean = true,
    onlyExpired: boolean = false,
  ) => {
    const existing = classes.value.find((cls) => cls._id === _id);
    if (!existing) return;

    const cascade: CascadeData | undefined =
      existing?.spellSourceId &&
      useSpellsStore().sources.find((s) => s._id === existing?.spellSourceId)
        ? {
            spellSourceId: existing.spellSourceId,
          }
        : undefined;
    try {
      const classData = existing.compendiumData.class
        ? JSON.parse(existing.compendiumData.class)
        : {};
      const subclassData = existing.compendiumData.subclass
        ? JSON.parse(existing.compendiumData.subclass)
        : {};

      if (classFeatures) {
        for (let lvl = startingLevel; lvl <= endingLevel; lvl++) {
          await dropClassFeatures({
            features: classData,
            updatedClass: existing,
            levelOverride: lvl,
            updateSubclass: false,
            onlyExpired,
            cascade,
          });
        }
      }
      if (subclassFeatures) {
        for (let lvl = startingLevel; lvl <= endingLevel; lvl++) {
          await dropClassFeatures({
            features: subclassData,
            updatedClass: existing,
            levelOverride: lvl,
            updateSubclass: true,
            onlyExpired,
            cascade,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to parse class features from compendium data', error);
    }
  };

  const addFeaturesToTransformation = async (startingLevel: number, endingLevel: number = startingLevel, onlyExpired: boolean = false, previousLevels?: number[]) => {
    try {
      const transformationData = transformation.value.compendiumData.transformation ? JSON.parse(transformation.value.compendiumData.transformation) : {};

      const cascade = {
        source: transformation.value.name
      }
      for(let lvl = startingLevel; lvl <= endingLevel; lvl++) {
        await dropTransformationFeatures({features:transformationData, levelOverride:lvl, onlyExpired, previousLevels, cascade});
      }
    } catch (error) {
      console.warn("Failed to parse transformation features from compendium data", error);
    }
  }

  const addFeaturesToAncestry = async (startingLevel: number, endingLevel: number = startingLevel, raceFeatures: boolean = true, subraceFeatures: boolean = true, onlyExpired: boolean = false, previousLevels?: number[]) => {
    try {
      const raceData = ancestry.value.compendiumData.race
        ? JSON.parse(ancestry.value.compendiumData.race)
        : {};
      const subraceData = ancestry.value.compendiumData.subrace
        ? JSON.parse(ancestry.value.compendiumData.subrace)
        : {};

      if (raceFeatures) {
        const cascade = {
          source: ancestry.value.name,
        };
        for (let lvl = startingLevel; lvl <= endingLevel; lvl++) {
          await dropAncestryFeatures({
            features: raceData,
            levelOverride: lvl,
            updateSubrace: false,
            onlyExpired,
            previousLevels,
            cascade,
          });
        }
      }
      if (subraceFeatures) {
        const cascade = {
          source: ancestry.value.subrace || ancestry.value.name,
        };
        for (let lvl = startingLevel; lvl <= endingLevel; lvl++) {
          await dropAncestryFeatures({
            features: subraceData,
            levelOverride: lvl,
            updateSubrace: true,
            onlyExpired,
            previousLevels,
            cascade,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to parse ancestry features from compendium data', error);
    }
  };

  const levelUpClass = (_id: string, levels: number = 1) => {
    const existing = classes.value.find((cls) => cls._id === _id);
    if (!existing) return;
    const previousLevel = existing.level || 1;
    const newLevel = Math.min(Math.max(previousLevel + levels, 1), 20);
    const update = {
      ...existing,
      level: newLevel,
    };
    if (newLevel > previousLevel) {
      updateClass(update);
      addFeaturesToClass(_id, previousLevel + 1, newLevel, true, true, false);
      removeClassFeatures(_id, true, true, newLevel); //Removing expired features
    } else {
      updateClass(update);
      addFeaturesToClass(_id, 1, update.level, true, true, true); //Re-adding expired features
      if (update.subclassUnlockLevel > 0 && newLevel < update.subclassUnlockLevel) {
        removeSubclass(_id);
      } else {
        removeClassFeatures(_id, true, true, newLevel);
      }
    }
  };
  const removeTransformation = () => {
    if(transformation.value.featureIds.length) {
      const featuresStore = useFeaturesStore();
      transformation.value.featureIds.forEach(fid => featuresStore.remove(fid.id));
    }
    transformation.value = {
      name: '',
      sourceBook: -1,
      featureIds: [],
      level: 0,
      compendiumData: {
        transformation: null,
      }
    }
  }
  const removeSubrace = () => {
    if (ancestry.value.subraceFeatureIds.length) {
      const featuresStore = useFeaturesStore();
      ancestry.value.subraceFeatureIds.forEach((fid) => featuresStore.remove(fid.id));
    }
    ancestry.value = {
      ...ancestry.value,
      subrace: '',
      subraceFeatureIds: [],
      subraceSourceBook: -1,
      compendiumData: {
        ...ancestry.value.compendiumData,
        subrace: null,
      },
    };
  };
  const removeRace = () => {
    removeSubrace();
    if (ancestry.value.featureIds.length) {
      const featuresStore = useFeaturesStore();
      ancestry.value.featureIds.forEach((fid) => featuresStore.remove(fid.id));
    }
    ancestry.value = {
      name: '',
      sourceBook: -1,
      subrace: '',
      subraceSourceBook: -1,
      featureIds: [],
      subraceFeatureIds: [],
      compendiumData: {
        race: null,
        subrace: null,
      },
    };
  };

  const removeAncestryFeatures = (aboveLevel: number) => {
    const featuresStore = useFeaturesStore();
    if (ancestry.value.featureIds.length) {
      const expiredFeatures = ancestry.value.featureIds.filter((fid) => fid.level > aboveLevel);
      expiredFeatures.forEach((fid) => featuresStore.remove(fid.id));
      ancestry.value.featureIds = ancestry.value.featureIds.filter(
        (fid) => fid.level <= aboveLevel,
      );
    }
    if (ancestry.value.subraceFeatureIds.length) {
      const expiredFeatures = ancestry.value.subraceFeatureIds.filter(
        (fid) => fid.level > aboveLevel,
      );
      expiredFeatures.forEach((fid) => featuresStore.remove(fid.id));
      ancestry.value.subraceFeatureIds = ancestry.value.subraceFeatureIds.filter(
        (fid) => fid.level <= aboveLevel,
      );
    }
  };

  const removeTransformationFeatures = (aboveLevel: number) => {
    const featuresStore = useFeaturesStore();
    if(transformation.value.featureIds.length) {
      const expiredFeatures = transformation.value.featureIds.filter(fid => fid.level > aboveLevel);
      expiredFeatures.forEach(fid => featuresStore.remove(fid.id));
      transformation.value.featureIds = transformation.value.featureIds.filter(fid => fid.level <= aboveLevel);
    }
  }
  const removeTransformationExpiredFeatures = (expirationLevel: number) => {
    const featuresStore = useFeaturesStore();
    if(transformation.value.featureIds.length) {
      const expiredFeatures = transformation.value.featureIds.filter(fid => fid.expirantionLevel && fid.expirantionLevel <= expirationLevel);
      expiredFeatures.forEach(fid => featuresStore.remove(fid.id));
      transformation.value.featureIds = transformation.value.featureIds.filter(fid => !fid.expirantionLevel || fid.expirantionLevel > expirationLevel);
    }
  }

  const removeAncestryExpiredFeatures = (expirationLevel: number) => {
    const featuresStore = useFeaturesStore();
    if (ancestry.value.featureIds.length) {
      const expiredFeatures = ancestry.value.featureIds.filter(
        (fid) => fid.expirantionLevel && fid.expirantionLevel <= expirationLevel,
      );
      expiredFeatures.forEach((fid) => featuresStore.remove(fid.id));
      ancestry.value.featureIds = ancestry.value.featureIds.filter(
        (fid) => !fid.expirantionLevel || fid.expirantionLevel > expirationLevel,
      );
    }
    if (ancestry.value.subraceFeatureIds.length) {
      const expiredFeatures = ancestry.value.subraceFeatureIds.filter(
        (fid) => fid.expirantionLevel && fid.expirantionLevel <= expirationLevel,
      );
      expiredFeatures.forEach((fid) => featuresStore.remove(fid.id));
      ancestry.value.subraceFeatureIds = ancestry.value.subraceFeatureIds.filter(
        (fid) => !fid.expirantionLevel || fid.expirantionLevel > expirationLevel,
      );
    }
  };

  const addFeaturesToBackground = async (
    startingLevel: number,
    endingLevel: number = startingLevel,
    onlyExpired: boolean = false,
    previousLevels?: number[],
  ) => {
    try {
      const backgroundData = background.value.compendiumData
        ? JSON.parse(background.value.compendiumData)
        : {};

      for (let lvl = startingLevel; lvl <= endingLevel; lvl++) {
        await dropBackgroundFeatures({
          features: backgroundData,
          levelOverride: lvl,
          onlyExpired,
          previousLevels,
        });
      }
    } catch (error) {
      console.warn('Failed to parse background features from compendium data', error);
    }
  }

  const removeBackground = () => {
    if (background.value.featureIds.length) {
      const featuresStore = useFeaturesStore();
      background.value.featureIds.forEach((fid) => featuresStore.remove(fid.id));
    }
    background.value = getEmptyBackground();
  };

  const removeBackgroundFeatures = (aboveLevel: number) => {
    const featuresStore = useFeaturesStore();
    if (background.value.featureIds.length) {
      const expiredFeatures = background.value.featureIds.filter((fid) => fid.level > aboveLevel);
      expiredFeatures.forEach((fid) => featuresStore.remove(fid.id));
      background.value.featureIds = background.value.featureIds.filter(
        (fid) => fid.level <= aboveLevel,
      );
    }
  };

  const removeBackgroundExpiredFeatures = (expirationLevel: number) => {
    const featuresStore = useFeaturesStore();
    if (background.value.featureIds.length) {
      const expiredFeatures = background.value.featureIds.filter(
        (fid) => fid.expirantionLevel && fid.expirantionLevel <= expirationLevel,
      );
      expiredFeatures.forEach((fid) => featuresStore.remove(fid.id));
      background.value.featureIds = background.value.featureIds.filter(
        (fid) => !fid.expirantionLevel || fid.expirantionLevel > expirationLevel,
      );
    }
  };

  const dehydrate = (): ProgressionHydrate => {
    const dehydratedClasses = classes.value.map((cls) => ({
      ...cls,
      hitPoints: arrayToIndexedObject(cls.hitPoints),
      featureIds: arrayToIndexedObject(cls.featureIds),
      subclassFeatureIds: arrayToIndexedObject(cls.subclassFeatureIds),
    }));

    const dehydratedTransformation = {
      ...transformation.value,
      featureIds: arrayToIndexedObject(transformation.value.featureIds),
    }

    const dehydratedAncestry = {
      ...ancestry.value,
      featureIds: arrayToIndexedObject(ancestry.value.featureIds),
      subraceFeatureIds: arrayToIndexedObject(ancestry.value.subraceFeatureIds),
    };

    const dehydratedBackground = {
      ...background.value,
      featureIds: arrayToIndexedObject(background.value.featureIds),
    };

    return {
      classes: arrayToObject(dehydratedClasses),
      transformation: dehydratedTransformation,
      ancestry: dehydratedAncestry,
      HitPointsMode: hitPointsMode.value,
      experiencePoints: experiencePoints.value,
      advancementeMode: advancementeMode.value,
      hitDice: hitDice.value,
      background: dehydratedBackground
    };
  };

  const hydrate = (payload: ProgressionHydrate) => {
    const classesHydration = payload?.classes
      ? objectToArray(payload.classes).map((cls) => ({
          ...cls,
          hitPoints: indexedObjectToArray(cls.hitPoints as Record<string, number>),
          featureIds: indexedObjectToArray(cls.featureIds as Record<string, FeatureId>),
          subclassFeatureIds: indexedObjectToArray(
            cls.subclassFeatureIds as Record<string, FeatureId>,
          ),
        }))
      : classes.value;
    
    const transformationHydration = payload?.transformation
      ? {
          ...payload.transformation,
          featureIds: indexedObjectToArray(payload.transformation.featureIds as Record<string, FeatureId>),
        }
      : transformation.value;

    const raceHydration = payload?.ancestry
      ? {
          ...payload.ancestry,
          featureIds: indexedObjectToArray(
            payload.ancestry.featureIds as Record<string, FeatureId>,
          ),
          subraceFeatureIds: indexedObjectToArray(
            payload.ancestry.subraceFeatureIds as Record<string, FeatureId>,
          ),
        }
      : ancestry.value;

    const backgroundHydration = payload?.background
      ? {
          ...payload.background,
          featureIds: indexedObjectToArray(
            payload.background.featureIds as Record<string, FeatureId>,
          ),
        }
      : background.value;

    classes.value = classesHydration;
    transformation.value = transformationHydration;
    ancestry.value = raceHydration;
    hitPointsMode.value = payload?.HitPointsMode ?? hitPointsMode.value;
    experiencePoints.value = payload?.experiencePoints ?? experiencePoints.value;
    advancementeMode.value = payload?.advancementeMode ?? advancementeMode.value;
    hitDice.value = payload?.hitDice ?? hitDice.value;
    background.value = backgroundHydration ?? background.value;
  };

  return {
    classes,
    transformation,
    ancestry,
    hitPointsMode,
    experiencePoints,
    advancementeMode,
    hitDice,
    background,

    getEmptyClass,
    getEmptyBackground,
    getHitDice,
    getClassesSummary,
    getTransformationSummary,
    getAncestrySummary,
    getLevel,
    getProficiencyBonus,
    addFeaturesToClass,
    addFeaturesToTransformation,
    addFeaturesToAncestry,
    levelUpClass,
    removeTransformationFeatures,
    removeTransformationExpiredFeatures,
    removeAncestryFeatures,
    removeAncestryExpiredFeatures,
    removeClass,
    removeSubclass,
    removeClassFeatures,
    updateClass,
    removeTransformation,
    removeSubrace,
    removeRace,

    addFeaturesToBackground,
    removeBackground,
    removeBackgroundFeatures,
    removeBackgroundExpiredFeatures,

    dehydrate,
    hydrate,
  };
});
