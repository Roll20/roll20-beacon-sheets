import { defineStore } from 'pinia';
import { ref } from 'vue';

export type BioHydrate = {
  bio: {
    friends: string;
    enemies: string;
    title: string;
    species: string;
    looks: string;
    likes: string;
  };
};

export const useBioStore = defineStore('bio', () => {
  const friends = ref('');
  const enemies = ref('');
  const title = ref('New Hero');
  const species = ref('Human');
  const looks = ref('');
  const likes = ref('');

  const dehydrate = () => {
    return {
      bio: {
        friends: friends.value,
        enemies: enemies.value,
        title: title.value,
        species: species.value,
        looks: looks.value,
        likes: likes.value,
      },
    };
  };

  const hydrate = (hydrateStore: BioHydrate) => {
    friends.value = hydrateStore.bio.friends ?? friends.value;
    enemies.value = hydrateStore.bio.enemies ?? enemies.value;
    title.value = hydrateStore.bio.title ?? title.value;
    species.value = hydrateStore.bio.species ?? species.value;
    looks.value = hydrateStore.bio.looks ?? looks.value;
    likes.value = hydrateStore.bio.likes ?? likes.value;
  };

  return {
    friends,
    enemies,
    title,
    species,
    looks,
    likes,
    dehydrate,
    hydrate,
  };
});
