import type { Token } from '@roll20-official/beacon-sdk';
import { defineStore } from 'pinia';
import { reactive, ref, type Ref } from 'vue';
import type { MetaHydrate } from '@/schemas/hydrate/meta';

export const metaStore = defineStore('meta', () => {
  const id = ref('');
  const name = ref('');
  const avatar = ref('');
  const bio = ref('');
  const gmNotes = ref('');
  const token: Ref<Token> = ref({});
  const campaignId = ref();

  const permissions = reactive({
    isOwner: false,
    isGM: false,
  });

  

  const dehydrate = () => {
    return {
      id: id.value,
      name: name.value,
      avatar: avatar.value,
      bio: bio.value,
      gmNotes: gmNotes.value,
      campaignId: campaignId.value,
    };
  };

  const hydrate = (hydrateStore: MetaHydrate) => {
    id.value = hydrateStore.id ?? id.value;
    name.value = hydrateStore.name ?? name.value;
    avatar.value = hydrateStore.avatar ?? avatar.value;
    bio.value = hydrateStore.bio ?? bio.value;
    gmNotes.value = hydrateStore.gmNotes ?? gmNotes.value;

    token.value = hydrateStore.token ?? token.value;
  };

  const firebase = {
    id,
    name,
    avatar,
    bio,
    gmNotes,
    token,
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
    firebase,
    dehydrate,
    hydrate,
  };
});
