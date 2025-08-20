import { defineStore } from 'pinia';
import { ref } from 'vue';

/* Very simple store that just stores and syncs some strings with text-inputs on the sheet. */
export type BioHydrate = {
  bio: {
    avatar: string;
    name: string;
    player: string;
    age: string;
    origin: string;
    occupation: string;
    experience: string;
    description: string;
    color: string;
    ways: {
      combativeness: number;
      creativity: number;
      awareness: number;
      reason: number;
      conviction: number;
    };
  };
};

export const useBioStore = defineStore('bio', () => {
	const avatar = ref('');
  const name = ref('');
  const player = ref('');
  const age = ref('');
  const origin = ref('');
  const occupation = ref('');
  const experience = ref('');
  const description = ref('');
  const color = ref('');
  const ways = ref({
    combativeness: 0,
    creativity: 0,
    awareness: 0,
    reason: 0,
    conviction: 0,
  });

  const dehydrate = () => {
    return {
      bio: {
        avatar: avatar.value,
        name: name.value,
        player: player.value,
        age: age.value,
        origin: origin.value,
        occupation: occupation.value,
        experience: experience.value,
        description: description.value,
        color: color.value,
        ways: ways.value,
      },
    };
  };

  const hydrate = (hydrateStore: BioHydrate) => {
	avatar.value = hydrateStore.bio.avatar ?? avatar.value;
  name.value = hydrateStore.bio.name ?? name.value;
    player.value = hydrateStore.bio.player ?? player.value;
    age.value = hydrateStore.bio.age ?? age.value;
    origin.value = hydrateStore.bio.origin ?? origin.value;
    occupation.value = hydrateStore.bio.occupation ?? occupation.value;
    experience.value = hydrateStore.bio.experience ?? experience.value;
    description.value = hydrateStore.bio.description ?? description.value;
    color.value = hydrateStore.bio.color ?? color.value;
    ways.value = hydrateStore.bio.ways ?? ways.value;
  };

  return {
    avatar,
    name,
    player,
    age,
    origin,
    occupation,
    experience,
    description,
    color,
    ways,
    dehydrate,
    hydrate,
  };
});
