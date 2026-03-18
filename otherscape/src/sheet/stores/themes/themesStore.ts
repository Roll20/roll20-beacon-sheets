import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { spine } from '@/spine/spine';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import _ from 'lodash';

type SelfThemebooks = typeof spine.themes['Self']['types'][number];
type MythosThemebooks = typeof spine.themes['Mythos']['types'][number];
type NoiseThemebooks = typeof spine.themes['Noise']['types'][number];
type VariableThemebooks = typeof spine.themes['Variable']['types'][number]; 

export type Tag = {
  _id: string;
  name: string;
  type: 'Power' | 'Weakness';
  checked: boolean;
  burnt: boolean;
}

export type QuestImprovement = 'decay' | 'upgrade';
type QuestValue = 0 | 1 | 2 | 3;
type SharedTheme = {
  _id: string;
  name: string;
  tags: Tag[];
  quest: {
    description: string;
    decay: QuestValue;
    upgrade: QuestValue;
  }
}

type SelfImprovement = {
  _id: string;
  name: typeof spine.themes['Self']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type MythosImprovement = {
  _id: string;
  name: typeof spine.themes['Mythos']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type NoiseImprovement = {
  _id: string;
  name: typeof spine.themes['Noise']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type VariableImprovement = {
  _id: string;
  name: typeof spine.themes['Variable']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type FellowshipImprovement = {
  _id: string;
  name: typeof spine.themes['Fellowship']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type GenericImprovement = {
  _id: string;
  name: string;
  description?: string;
  checked: boolean;
}
type SpecialImprovement = GenericImprovement | SelfImprovement | MythosImprovement | NoiseImprovement | VariableImprovement | FellowshipImprovement;

export type ThemeMight = typeof spine.themeMights[number];
type SelfTheme = SharedTheme & {
  might: 'Self';
  themebook: SelfThemebooks | VariableThemebooks | '';
  specialImprovements: (SelfImprovement | VariableImprovement | GenericImprovement)[];
  isFellowship: false;
  isLoadout: false;
}
type MythosTheme = SharedTheme & {
  might: 'Mythos';
  themebook: MythosThemebooks | VariableThemebooks | '';
  specialImprovements: (MythosImprovement | VariableImprovement | GenericImprovement)[];
  isFellowship: false;
  isLoadout: false;
}
type NoiseTheme = SharedTheme & {
  might: 'Noise';
  themebook: NoiseThemebooks | VariableThemebooks | '';
  specialImprovements: (NoiseImprovement | VariableImprovement | GenericImprovement)[];
  isFellowship: false;
  isLoadout: false;
}
type FellowshipTheme = SharedTheme & {
  isFellowship: true;
  isLoadout: false;
  specialImprovements: (FellowshipImprovement | GenericImprovement)[];
}
type LoadoutTheme = SharedTheme & {
  isFellowship: false;
  isLoadout: true;
  specialImprovements: (GenericImprovement)[];
}

export type Theme = SelfTheme | MythosTheme | NoiseTheme | FellowshipTheme | LoadoutTheme;

type ThemeStoreHydratate = {
  themes: Record<string, Theme & {
    tags: Record<string, Tag>;
    specialImprovements: Record<string, SpecialImprovement>;
  }>
}

export const themesStore = defineStore('themes', () => {
  const getEmptySpecialImprovement = (override: Partial<GenericImprovement> = {}): GenericImprovement => ({
    _id: uuidv4(),
    name: '',
    checked: false,
    ...override,
  });
  const getEmptyTag = (override: Partial<Tag> = {}): Tag => ({
    _id: uuidv4(),
    name: '',
    type: 'Power',
    burnt: false,
    checked: false,
    ...override,
  });
  const getEmptyTheme = (isFellowship: boolean = false, isLoadout: boolean = false): Theme => {
    const powerLines = isLoadout ? 40 : 20;
    const newTheme: Theme = {
      _id: uuidv4(),
      name: '',
      isFellowship: true,
      isLoadout: false,
      tags: [
        ...Array.from({ length: powerLines }, () => getEmptyTag()),
        ...Array.from({ length: 2 }, () => getEmptyTag({ type: 'Weakness' })),
      ],
      quest: {
        description: '',
        decay: 0,
        upgrade: 0,
      },
      specialImprovements: Array.from({ length: isFellowship ? 6 : 6 }, () => getEmptySpecialImprovement()),
    }
    if(isFellowship) {
      return newTheme;
    } else if(isLoadout) {
      return {
        ...newTheme,
        isFellowship: false,
        isLoadout: true,
      } as Theme;
    } else {
      return {
        ...newTheme,
        isFellowship,
        isLoadout,
        might: 'Self',
        themebook: '',
      } as Theme;
    }
  };

  const deleteTheme = (themeId: string) => {
    themes.value = themes.value.filter(t => t._id !== themeId);
  };
  const updateTheme = (override: Partial<Theme>) => {
    const existing = themes.value.find(t => t._id === override._id);
    if (existing) {
      Object.assign(existing, override);
    } else  {
      themes.value.push({
        ...getEmptyTheme(),
        ...override,
      } as Theme);
    }
  };

  const dehydrate = (): ThemeStoreHydratate => {
    return {
      themes: arrayToObject(themes.value.map(t => ({
        ...t,
        tags: arrayToObject(t.tags),
        specialImprovements: arrayToObject(t.specialImprovements),
      }))),
    };
  };

  const hydrate = (payload: ThemeStoreHydratate) => {
    themes.value = payload.themes ? objectToArray(payload.themes).map(t => ({
      ...t,
      tags: objectToArray(t.tags),
      specialImprovements: objectToArray(t.specialImprovements),
    })) : themes.value;
  };

  const themes = ref<Theme[]>(
    [getEmptyTheme(), getEmptyTheme(), getEmptyTheme(), getEmptyTheme(), getEmptyTheme(true), getEmptyTheme(false, true)],
  );
  
  return {
    getEmptySpecialImprovement,
    getEmptyTag,
    getEmptyTheme,
    
    deleteTheme,
    updateTheme,

    themes,

    dehydrate,
    hydrate,
  }
});