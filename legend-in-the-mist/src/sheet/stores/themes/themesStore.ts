import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { spine } from '@/spine/spine';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import _ from 'lodash';

type OriginThemebooks = typeof spine.themes['Origin']['types'][number];
type AdventureThemebooks = typeof spine.themes['Adventure']['types'][number];
type GreatnessThemebooks = typeof spine.themes['Greatness']['types'][number];
type VariableThemebooks = typeof spine.themes['Variable']['types'][number]; 

export type Tag = {
  _id: string;
  name: string;
  type: 'Power' | 'Weakness';
  checked: boolean;
  scratched: boolean;
}

export type QuestImprovement = 'abandon' | 'improve' | 'milestone';
type QuestValue = 0 | 1 | 2 | 3;
type SharedTheme = {
  _id: string;
  name: string;
  tags: Tag[];
  quest: {
    description: string;
    abandon: QuestValue;
    improve: QuestValue;
    milestone: QuestValue;
  }
}

type OriginImprovement = {
  _id: string;
  name: typeof spine.themes['Origin']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type AdventureImprovement = {
  _id: string;
  name: typeof spine.themes['Adventure']['improvements'][number] | '';
  description?: string;
  checked: boolean;
}
type GreatnessImprovement = {
  _id: string;
  name: typeof spine.themes['Greatness']['improvements'][number] | '';
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
type SpecialImprovement = GenericImprovement | OriginImprovement | AdventureImprovement | GreatnessImprovement | VariableImprovement | FellowshipImprovement;

export type ThemeMight = typeof spine.themeMights[number];
type OriginTheme = SharedTheme & {
  might: 'Origin';
  themebook: OriginThemebooks | VariableThemebooks | '';
  specialImprovements: (OriginImprovement | VariableImprovement | GenericImprovement)[];
  isFellowship: false;
}
type AdventureTheme = SharedTheme & {
  might: 'Adventure';
  themebook: AdventureThemebooks | VariableThemebooks | '';
  specialImprovements: (AdventureImprovement | VariableImprovement | GenericImprovement)[];
  isFellowship: false;
}
type GreatnessTheme = SharedTheme & {
  might: 'Greatness';
  themebook: GreatnessThemebooks | VariableThemebooks | '';
  specialImprovements: (GreatnessImprovement | VariableImprovement | GenericImprovement)[];
  isFellowship: false;
}
type FellowshipTheme = SharedTheme & {
  isFellowship: true;
  specialImprovements: (FellowshipImprovement | GenericImprovement)[];
}

export type Theme = OriginTheme | AdventureTheme | GreatnessTheme | FellowshipTheme;

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
    scratched: false,
    checked: false,
    ...override,
  });
  const getEmptyTheme = (isFellowship: boolean = false): Theme => {
    const powerLines = isFellowship ? 11 : 20;
    const newTheme: Theme = {
      _id: uuidv4(),
      name: '',
      isFellowship: true,
      tags: [
        ...Array.from({ length: powerLines }, () => getEmptyTag()),
        ...Array.from({ length: 4 }, () => getEmptyTag({ type: 'Weakness' })),
      ],
      quest: {
        description: '',
        abandon: 0,
        improve: 0,
        milestone: 0,
      },
      specialImprovements: Array.from({ length: isFellowship ? 6 : 6 }, () => getEmptySpecialImprovement()),
    }
    return isFellowship ?
      newTheme
    : {
      ...newTheme,
      isFellowship,
      might: 'Origin',
      themebook: '',
    } as Theme;
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
    [getEmptyTheme(), getEmptyTheme(), getEmptyTheme(), getEmptyTheme(), getEmptyTheme(true)],
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