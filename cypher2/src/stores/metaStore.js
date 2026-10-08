import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

/* Every Character, regardless of sheet, has these meta fields
 * and they must be saved to firebase in this specific way.
 * This store can be reused as-is for any other Vue project.
 * */
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

  // Handles retrieving these values from the store
  const dehydrate = () => {
    return {
      name: name.value,
      avatar: avatar.value,
      bio: bio.value,
      gmNotes: gmNotes.value,
      campaignId: campaignId.value
    }
  }

  // Handles updating these values in the store.
  const hydrate = (hydrateStore) => {
    // An absent profile field keeps its value. A null one is a clear: the SDK types bio
    // and gmNotes as string | null, and keeping the old text would save it straight back
    // (ddd-i0q8 audit). '' is every profile field's blank.
    const incoming = (value, current) => (value === undefined ? current : value ?? '')
    id.value = hydrateStore.id ?? id.value
    name.value = incoming(hydrateStore.name, name.value)
    avatar.value = incoming(hydrateStore.avatar, avatar.value)
    bio.value = incoming(hydrateStore.bio, bio.value)
    gmNotes.value = incoming(hydrateStore.gmNotes, gmNotes.value)

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
    campaignId,
    dehydrate,
    hydrate
  }
})
