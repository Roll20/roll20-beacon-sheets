import { defineStore } from 'pinia'
import { ref } from 'vue'

/*
 * État d'interface persisté : type de fiche affichée (PJ / PNJ / Ennemi) et sous-onglets.
 * Équivalent des champs currentMainTab / sheetTab de la fiche legacy.
 */
const uiStore = () => {
  const fiche = ref('pj') // 'pj' | 'pnj' | 'ennemi'
  const pcTab = ref('principal')
  const npcTab = ref('principal')
  const enemyTab = ref('monster')

  // Options de la roue crantée.
  const showGrimoire = ref(true)
  const showNecromancy = ref(true)
  const confirmDelete = ref(false)

  const dehydrate = () => ({
    fiche: fiche.value,
    pcTab: pcTab.value,
    npcTab: npcTab.value,
    enemyTab: enemyTab.value,
    showGrimoire: showGrimoire.value,
    showNecromancy: showNecromancy.value,
    confirmDelete: confirmDelete.value
  })
  const hydrate = (data = {}) => {
    fiche.value = data.fiche ?? fiche.value
    pcTab.value = data.pcTab ?? pcTab.value
    npcTab.value = data.npcTab ?? npcTab.value
    enemyTab.value = data.enemyTab ?? enemyTab.value
    showGrimoire.value = data.showGrimoire ?? showGrimoire.value
    showNecromancy.value = data.showNecromancy ?? showNecromancy.value
    confirmDelete.value = data.confirmDelete ?? confirmDelete.value
  }

  return {
    fiche,
    pcTab,
    npcTab,
    enemyTab,
    showGrimoire,
    showNecromancy,
    confirmDelete,
    dehydrate,
    hydrate
  }
}

export const useUiStore = defineStore('ui', uiStore)
