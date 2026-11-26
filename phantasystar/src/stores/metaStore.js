import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export const useMetaStore = defineStore('meta', () => {
  const id = ref('')
  const name = ref('')
  const avatar = ref('')
  const bio = ref('')
  const gmNotes = ref('')
  const token = ref({})
  const campaignId = ref(null)
  const permissions = reactive({
    isOwner: false,
    isGM: false
  })

  const canEdit = computed(() => permissions.isOwner || permissions.isGM)

  const dehydrate = () => {
    return {
      name: name.value,
      avatar: avatar.value,
      bio: bio.value,
      gmNotes: gmNotes.value,
      campaignId: campaignId.value
    }
  }

  const hydrate = (hydrateStore) => {
    id.value = hydrateStore.id ?? id.value
    name.value = hydrateStore.name ?? name.value
    avatar.value = hydrateStore.avatar ?? avatar.value
    bio.value = hydrateStore.bio ?? bio.value
    gmNotes.value = hydrateStore.gmNotes ?? gmNotes.value

    token.value = hydrateStore.token ?? token.value
  }

  return {
    id,
    name,
    avatar,
    bio,
    gmNotes,
    token,
    permissions,
    canEdit,
    campaignId,
    dehydrate,
    hydrate
  }
})
