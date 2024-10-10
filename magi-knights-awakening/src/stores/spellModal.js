import { defineStore, acceptHMRUpdate  } from 'pinia'
import { ref } from 'vue'

export const useSpellEditStore = defineStore('spellModal',() => {
  const id = ref('');
  const show = ref(false);
  return {
    show, id
  }
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSpellEditStore, import.meta.hot))
}