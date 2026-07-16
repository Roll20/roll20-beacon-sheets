<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/index.js'
import { useUiStore } from '@/stores/uiStore.js'
import { initValues, dispatchRef } from '@/relay/relay.js'

// Taille de fenêtre par défaut demandée à Roll20 (l'iframe est gérée par l'hôte).
const DEFAULT_SIZE = { width: 880, height: 760 }
watch(
  dispatchRef,
  (d) => {
    if (d && d.setContainerSize) d.setContainerSize(DEFAULT_SIZE)
  },
  { immediate: true }
)

import PcPrincipal from '@/components/PcPrincipal.vue'
import PcCompetences from '@/components/PcCompetences.vue'
import PcEquipement from '@/components/PcEquipement.vue'
import PcGrimoire from '@/components/PcGrimoire.vue'
import PcNecromancie from '@/components/PcNecromancie.vue'
import PcNotes from '@/components/PcNotes.vue'

import NpcPrincipal from '@/components/NpcPrincipal.vue'
import NpcEquipement from '@/components/NpcEquipement.vue'
import NpcGrimoire from '@/components/NpcGrimoire.vue'

import EnemyCreatures from '@/components/EnemyCreatures.vue'
import EnemyEnnemis from '@/components/EnemyEnnemis.vue'

// IMPORTANT : instancier le store maître `app` branche le dispatch et la sauvegarde.
useAppStore()
const ui = useUiStore()

// Vrai quand l'hôte (Roll20) affiche cette feuille en mode « paramètres ».
const isSettings = computed(() => !!initValues.settings?.settingsSheet)

// Panneau de paramètres ouvert via la roue crantée.
const showSettings = ref(false)

const fiches = [
  { id: 'pj', label: 'PJ' },
  { id: 'pnj', label: 'PNJ' },
  { id: 'ennemi', label: 'Ennemi' }
]
const pcTabs = [
  { id: 'principal', label: 'Principal' },
  { id: 'competences', label: 'Compétences' },
  { id: 'equipment', label: 'Équipement' },
  { id: 'grimoire', label: 'Grimoire' },
  { id: 'necromancy', label: 'Nécromancie' },
  { id: 'notes', label: 'Notes' }
]
const npcTabs = [
  { id: 'principal', label: 'Principal' },
  { id: 'equipment', label: 'Équipement' },
  { id: 'grimoire', label: 'Grimoire' }
]
const enemyTabs = [
  { id: 'monster', label: 'Monstres' },
  { id: 'dragon', label: 'Dragons' },
  { id: 'demon', label: 'Démons' },
  { id: 'ennemi', label: 'Ennemis' }
]

// Onglets visibles selon les options (masquage Grimoire / Nécromancie).
const tabVisible = (id) =>
  (id !== 'grimoire' || ui.showGrimoire) && (id !== 'necromancy' || ui.showNecromancy)
const visiblePcTabs = computed(() => pcTabs.filter((t) => tabVisible(t.id)))
const visibleNpcTabs = computed(() => npcTabs.filter((t) => tabVisible(t.id)))
const activePcTab = computed(() => (tabVisible(ui.pcTab) ? ui.pcTab : 'principal'))
const activeNpcTab = computed(() => (tabVisible(ui.npcTab) ? ui.npcTab : 'principal'))
</script>

<template>
  <!-- ====== Mode PARAMÈTRES : choix du type de feuille uniquement ====== -->
  <div v-if="isSettings" class="enyllion-sheet settings-sheet">
    <h2 class="settings-title">Type de feuille</h2>
    <nav class="fichebar">
      <button
        v-for="f in fiches"
        :key="f.id"
        class="fiche-tab"
        :class="{ active: ui.fiche === f.id }"
        @click="ui.fiche = f.id"
      >
        {{ f.label }}
      </button>
    </nav>
  </div>

  <!-- ====== Mode NORMAL : la feuille du type choisi ====== -->
  <div v-else class="enyllion-sheet sheet-root">
    <header class="sheet-header">
      <span class="sheet-title">Les Chroniques d'Enyllion</span>
      <img class="sheet-logo" src="/images/logo_enyllion.png" alt="Enyllion" />
      <button class="gear" :class="{ open: showSettings }" title="Paramètres" @click="showSettings = !showSettings">⚙</button>

      <!-- Panneau de paramètres -->
      <div v-if="showSettings" class="settings-panel">
        <div class="settings-group">
          <div class="settings-label">Type de feuille</div>
          <div class="fichebar">
            <button
              v-for="f in fiches"
              :key="f.id"
              class="fiche-tab"
              :class="{ active: ui.fiche === f.id }"
              @click="ui.fiche = f.id"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-label">Affichage</div>
          <label class="opt"><input type="checkbox" v-model="ui.showGrimoire" /> Onglet Grimoire</label>
          <label class="opt"><input type="checkbox" v-model="ui.showNecromancy" /> Onglet Nécromancie</label>
        </div>
        <div class="settings-group">
          <div class="settings-label">Sécurité</div>
          <label class="opt"><input type="checkbox" v-model="ui.confirmDelete" /> Confirmer avant suppression</label>
        </div>
      </div>
    </header>

    <!-- ===== Fiche PJ ===== -->
    <template v-if="ui.fiche === 'pj'">
      <nav class="tabbar">
        <button v-for="t in visiblePcTabs" :key="t.id" class="tab" :class="{ active: activePcTab === t.id }" @click="ui.pcTab = t.id">{{ t.label }}</button>
      </nav>
      <PcPrincipal v-if="activePcTab === 'principal'" />
      <PcCompetences v-else-if="activePcTab === 'competences'" />
      <PcEquipement v-else-if="activePcTab === 'equipment'" />
      <PcGrimoire v-else-if="activePcTab === 'grimoire'" />
      <PcNecromancie v-else-if="activePcTab === 'necromancy'" />
      <PcNotes v-else-if="activePcTab === 'notes'" />
    </template>

    <!-- ===== Fiche PNJ ===== -->
    <template v-else-if="ui.fiche === 'pnj'">
      <nav class="tabbar">
        <button v-for="t in visibleNpcTabs" :key="t.id" class="tab" :class="{ active: activeNpcTab === t.id }" @click="ui.npcTab = t.id">{{ t.label }}</button>
      </nav>
      <NpcPrincipal v-if="activeNpcTab === 'principal'" />
      <NpcEquipement v-else-if="activeNpcTab === 'equipment'" />
      <NpcGrimoire v-else-if="activeNpcTab === 'grimoire'" />
    </template>

    <!-- ===== Fiche Ennemi ===== -->
    <template v-else>
      <nav class="tabbar">
        <button v-for="t in enemyTabs" :key="t.id" class="tab" :class="{ active: ui.enemyTab === t.id }" @click="ui.enemyTab = t.id">{{ t.label }}</button>
      </nav>
      <EnemyCreatures v-if="ui.enemyTab === 'monster'" type="monster" label="Monstres" />
      <EnemyCreatures v-else-if="ui.enemyTab === 'dragon'" type="dragon" label="Dragons" />
      <EnemyCreatures v-else-if="ui.enemyTab === 'demon'" type="demon" label="Démons" />
      <EnemyEnnemis v-else-if="ui.enemyTab === 'ennemi'" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.sheet-root {
  min-height: 200px;
  padding-bottom: 1rem;
}
.settings-sheet {
  padding: 1rem;
}
.settings-title {
  font-family: var(--font-title);
  font-size: 1.4rem;
  color: var(--ink);
  text-align: center;
  margin: 0 0 0.5rem;
}
.sheet-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 2px solid #000;
}
.gear {
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  cursor: pointer;
  font-size: 1.3rem;
  line-height: 1;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 250, 235, 0.3);
  color: var(--ink);
  border: 1px solid var(--brown-dark);
  border-radius: 0.4rem;
  transition: transform 0.2s;
  &:hover {
    background: rgba(255, 250, 235, 0.6);
  }
  &.open {
    background: var(--brown-dark);
    color: var(--parchment-light);
    transform: rotate(45deg);
  }
}
.settings-panel {
  position: absolute;
  top: 2.8rem;
  right: 0.6rem;
  z-index: 20;
  min-width: 220px;
  background: var(--parchment-light);
  border: 1px solid var(--brown-dark);
  border-radius: 0.5rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  padding: 0.75rem;
}
.settings-group + .settings-group {
  margin-top: 0.75rem;
  border-top: 1px solid var(--brown);
  padding-top: 0.75rem;
}
.settings-label {
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--ink);
  margin-bottom: 0.4rem;
  text-align: center;
}
.opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-label);
  font-size: 0.9rem;
  color: var(--ink);
  padding: 0.2rem 0;
  cursor: pointer;
}
.opt input[type='checkbox'] {
  width: 1.1rem;
  height: 1.1rem;
}
.sheet-title {
  font-family: var(--font-title);
  font-size: 1.7rem;
  color: var(--ink);
  text-align: center;
}
.sheet-logo {
  width: 70px;
  height: auto;
}
.fichebar {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.settings-panel .fiche-tab {
  flex: 1 1 auto;
  padding: 0.4rem 0.8rem;
  font-size: 0.95rem;
}
.fiche-tab {
  cursor: pointer;
  font-family: var(--font-title);
  font-size: 1.05rem;
  background: rgba(255, 250, 235, 0.3);
  color: var(--ink);
  border: 1px solid var(--brown-dark);
  border-radius: 0.4rem;
  padding: 0.4rem 1.4rem;
  &:hover {
    background: rgba(255, 250, 235, 0.55);
  }
  &.active {
    background: var(--brown-dark);
    color: var(--parchment-light);
  }
}
.tabbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
  padding: 0.6rem 1rem 0;
}
.tab {
  cursor: pointer;
  font-family: var(--font-head);
  font-size: 0.9rem;
  background: rgba(255, 250, 235, 0.35);
  color: var(--ink);
  border: 1px solid var(--brown-dark);
  border-radius: 0.4rem 0.4rem 0 0;
  padding: 0.4rem 0.9rem;
  &:hover {
    background: rgba(255, 250, 235, 0.6);
  }
  &.active {
    background: var(--brown-dark);
    color: var(--parchment-light);
    font-weight: 700;
  }
}
</style>
