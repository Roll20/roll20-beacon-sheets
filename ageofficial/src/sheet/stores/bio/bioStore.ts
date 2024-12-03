import { defineStore } from 'pinia';
import { ref } from 'vue';

/* Very simple store that just stores and syncs some strings with text-inputs on the sheet. */
export type BioHydrate = {
  bio: {
    socialClass: string;
    background: string;
    level: number;
    ancestry: string;
    customAncestry:string;
    profession: string;
    age: number | undefined;
    height: string;
    weight: string;    
    gender: string;
    sex:string;
    pronouns: string;
    skin: string;
    eyes: string;
    hair:string;    
    goalsTies: string;
    relationships: string;
    detailsHistory: string;
    threat?:string;
    aliases?:string;
    type: string;
    drive?:string;
  };
};

export const useBioStore = defineStore('bio', () => {
  const socialClass = ref('');
  const background = ref('');
  const level = ref(1);
  const ancestry = ref('');
  const customAncestry = ref('');
  const profession = ref('');
  const age = ref();
  const height = ref('');
  const weight = ref('');
  const gender = ref('');
  const sex = ref('');
  const pronouns = ref('');
  const skin = ref('');
  const eyes = ref('');
  const hair = ref('');
  const goalsTies = ref('');
  const relationships = ref('');
  const detailsHistory = ref('');
  const threat = ref('');
  const aliases = ref('');
  const type = ref('Character')
  const drive = ref('');

  const dehydrate = () => {
    return {
      bio: {
        socialClass: socialClass.value,
        background: background.value,
        level: level.value,
        ancestry: ancestry.value,
        customAncestry: customAncestry.value,
        profession: profession.value,
        age: age.value,
        height: height.value,
        weight: weight.value,
        gender: gender.value,
        sex: sex.value,
        pronouns: pronouns.value,
        skin: skin.value,
        eyes: eyes.value,
        hair: hair.value,
        goalsTies: goalsTies.value,
        relationships: relationships.value,
        detailsHistory: detailsHistory.value,
        threat: threat.value,
        aliases: aliases.value,
        type: type.value,
        drive: drive.value,
      },
    };
  };

  const hydrate = (hydrateStore: BioHydrate) => {
    socialClass.value = hydrateStore.bio.socialClass ?? socialClass.value;
    background.value = hydrateStore.bio.background ?? background.value;
    level.value = hydrateStore.bio.level ?? level.value;
    ancestry.value = hydrateStore.bio.ancestry ?? ancestry.value;
    customAncestry.value = hydrateStore.bio.customAncestry ?? customAncestry.value;
    profession.value = hydrateStore.bio.profession ?? profession.value;
    age.value = hydrateStore.bio.age ?? age.value;
    height.value = hydrateStore.bio.height ?? height.value;
    weight.value = hydrateStore.bio.weight ?? weight.value;
    gender.value = hydrateStore.bio.gender ?? gender.value;
    sex.value = hydrateStore.bio.sex ?? sex.value;
    pronouns.value = hydrateStore.bio.pronouns ?? pronouns.value;
    skin.value = hydrateStore.bio.skin ?? skin.value;
    eyes.value = hydrateStore.bio.eyes ?? eyes.value;
    hair.value = hydrateStore.bio.hair ?? hair.value;
    goalsTies.value = hydrateStore.bio.goalsTies  ??  goalsTies.value;
    relationships.value = hydrateStore.bio.relationships  ??  relationships.value;
    detailsHistory.value = hydrateStore.bio.detailsHistory  ?? detailsHistory.value;
    threat.value = hydrateStore.bio.threat ?? threat.value;
    aliases.value = hydrateStore.bio.aliases ?? aliases.value;
    type.value = hydrateStore.bio.type ?? type.value;
    drive.value = hydrateStore.bio.drive ?? drive.value;
  };

  return {
    socialClass,
    background,
    level,
    ancestry,
    customAncestry,
    profession,
    age,
    gender,
    height,
    weight,
    sex,
    pronouns,
    skin,
    eyes,
    hair,
    goalsTies,
    relationships,
    detailsHistory,
    threat,
    aliases,
    type,
    drive,
    dehydrate,
    hydrate,
  };
});