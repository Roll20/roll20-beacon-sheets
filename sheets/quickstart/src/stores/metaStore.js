import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { DEFAULT_AVATAR_URL, DEFAULT_CHARACTER_NAME } from '@/stores/index.js'

/* Every Character, regardless of sheet, has these meta fields
 * and they must be saved to firebase in this specific way.
 * This store can be reused as-is for any other Vue project.
 * */
export const useMetaStore = defineStore('meta', () => {
  const id = ref('');
  const name = ref(DEFAULT_CHARACTER_NAME);
  const avatar = ref(DEFAULT_AVATAR_URL);
  const bio = ref('');
  const gmNotes = ref('');
  const token = ref({});
  const campaignId = ref(null);

  const permissions = reactive({
    isOwner: false,
    isGM: false,
  });

  // Stubs for store consistency

  const dehydrate = () => {
    return {
      name: name.value,
      avatar: avatar.value,
      bio: bio.value,
      gmNotes: gmNotes.value,
      campaignId: campaignId.value
    };
  };

  const hydrate = (hydrateStore) => {
    id.value = hydrateStore.id ?? id.value;
    name.value = hydrateStore.name ?? name.value;
    avatar.value = hydrateStore.avatar ?? avatar.value;
    bio.value = hydrateStore.bio ?? bio.value;
    gmNotes.value = hydrateStore.gmNotes ?? gmNotes.value;

    token.value = hydrateStore.token ?? token.value;
  };

  return {
    id,
    name,
    avatar,
    bio,
    gmNotes,
    token,
    permissions,
    campaignId,
    dehydrate,
    hydrate,
  };
});
