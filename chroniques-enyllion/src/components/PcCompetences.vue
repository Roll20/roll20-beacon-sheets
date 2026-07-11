<script setup>
import { ref, computed } from 'vue'
import { useSkillsStore } from '@/stores/skillsStore.js'
import { SKILLS } from '@/data/skills.js'
import { CARAC_KEYS } from '@/stores/statsStore.js'
import { whisper, confirmRemove } from '@/utility/rolls.js'

const skills = useSkillsStore()
const search = ref('')

const matches = (nom) => {
  const q = search.value.trim().toLowerCase()
  return !q || (nom || '').toLowerCase().includes(q)
}

const filteredSkills = computed(() => SKILLS.filter((s) => matches(s.nom)))
const filteredCustom = computed(() => skills.customSkills.filter((s) => matches(s.nom)))

// Compétences épinglées (cochées), fixes + personnalisées, normalisées pour l'affichage et le jet.
const checkedSkills = computed(() => {
  const fixed = SKILLS.filter((s) => skills.entries[s.id]?.checked).map((s) => ({
    key: s.id,
    nom: s.nom,
    carac: s.carac,
    bonus: skills.entries[s.id].bonus,
    description: skills.entries[s.id].description
  }))
  const custom = skills.customSkills
    .filter((s) => s.checked)
    .map((s) => ({ key: s._id, nom: s.nom, carac: s.carac, bonus: s.bonus, description: s.description }))
  return [...fixed, ...custom]
})

const roll = (descriptor) => skills.rollSkill(descriptor)
</script>

<template>
  <div class="competences">
    <!-- Carte des compétences épinglées -->
    <section class="area pinned-card" v-if="checkedSkills.length">
      <h2 class="section-title">Compétences épinglées</h2>
      <div class="skill-row header">
        <span></span>
        <span class="c-name">Compétence</span>
        <span class="c-attr">Carac</span>
        <span class="c-bonus">Bonus</span>
        <span class="c-desc">Description</span>
      </div>
      <div class="skill-row" v-for="s in checkedSkills" :key="s.key">
        <span class="roll-cell">
          <button class="roll-btn" :title="'Jet de ' + s.nom" @click="roll(s)">🎲</button>
          <button class="roll-btn whisper-btn" :title="'Jet privé (MJ)'" @click="whisper(() => roll(s))">🤫</button>
        </span>
        <span class="c-name">{{ s.nom || '—' }}</span>
        <span class="c-attr">{{ s.carac }}</span>
        <span class="c-bonus center">{{ s.bonus }}</span>
        <span class="c-desc">{{ s.description }}</span>
      </div>
    </section>

    <!-- Liste complète -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Compétences</h2>
        <input class="search" type="text" v-model="search" placeholder="🔍 Rechercher une compétence…" />
      </div>

      <div class="skill-row header">
        <span class="c-pin">★</span>
        <span></span>
        <span class="c-name">Compétence</span>
        <span class="c-attr">Carac</span>
        <span class="c-bonus">Bonus/Malus</span>
        <span class="c-desc">Description</span>
      </div>

      <!-- Compétences fixes -->
      <div class="skill-row" v-for="s in filteredSkills" :key="s.id">
        <input class="c-pin" type="checkbox" v-model="skills.entries[s.id].checked" title="Épingler" />
        <span class="roll-cell">
          <button class="roll-btn" :title="'Jet de ' + s.nom" @click="roll({ nom: s.nom, carac: s.carac, bonus: skills.entries[s.id].bonus, description: skills.entries[s.id].description })">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => roll({ nom: s.nom, carac: s.carac, bonus: skills.entries[s.id].bonus, description: skills.entries[s.id].description }))">🤫</button>
        </span>
        <span class="c-name">{{ s.nom }}</span>
        <span class="c-attr">{{ s.carac }}</span>
        <input class="c-bonus" type="number" v-model.number="skills.entries[s.id].bonus" />
        <input class="c-desc" type="text" v-model="skills.entries[s.id].description" />
      </div>

      <!-- Compétences personnalisées -->
      <template v-if="filteredCustom.length || !search">
        <div class="custom-sep">Compétences personnalisées</div>
        <div class="skill-row custom" v-for="c in filteredCustom" :key="c._id">
          <input class="c-pin" type="checkbox" v-model="c.checked" title="Épingler" />
          <span class="roll-cell">
            <button class="roll-btn" :title="'Jet de ' + c.nom" @click="roll(c)">🎲</button>
            <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => roll(c))">🤫</button>
          </span>
          <input class="c-name" type="text" v-model="c.nom" placeholder="Nom" />
          <select class="c-attr-sel" v-model="c.carac">
            <option v-for="k in CARAC_KEYS" :key="k" :value="k">{{ k }}</option>
          </select>
          <input class="c-bonus" type="number" v-model.number="c.bonus" />
          <input class="c-desc" type="text" v-model="c.description" placeholder="Description" />
          <button class="del" title="Supprimer" @click="confirmRemove(() => skills.removeCustomSkill(c._id))">✕</button>
        </div>
        <button class="add" @click="skills.addCustomSkill">+ Compétence personnalisée</button>
      </template>
    </section>
  </div>
</template>

<style scoped lang="scss">
.competences {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.head .section-title {
  margin: 0;
  border: none;
}
.search {
  flex: 0 1 280px;
  height: 1.9rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.85rem;
}
.skill-row {
  display: grid;
  grid-template-columns: 1.4rem 3.6rem 2fr 3.5rem 4rem 1fr;
  gap: 0.4rem;
  align-items: center;
  padding: 0.15rem 0;
  border-bottom: 1px solid rgba(58, 38, 22, 0.25);
}
/* La carte des épinglées n'a pas la colonne case à cocher */
.pinned-card .skill-row {
  grid-template-columns: 3.6rem 2fr 3.5rem 4rem 1fr;
}
.skill-row.custom {
  grid-template-columns: 1.4rem 3.6rem 2fr 3.5rem 4rem 1fr 1.7rem;
}
.roll-cell {
  display: flex;
  gap: 2px;
}
.roll-cell .roll-btn {
  flex: 1;
  padding: 0 0.1rem;
  font-size: 0.75rem;
}
.skill-row.header {
  font-family: var(--font-head);
  font-size: 0.8rem;
  color: var(--ink-soft);
  border-bottom: 1px solid var(--brown);
  padding-bottom: 0.3rem;
}
.c-pin {
  text-align: center;
}
input.c-pin[type='checkbox'] {
  width: 1.1rem;
  height: 1.1rem;
  justify-self: center;
}
.c-name {
  font-size: 0.9rem;
}
.c-attr {
  text-align: center;
  font-family: var(--font-head);
  font-size: 0.85rem;
  color: var(--ink);
  font-weight: 700;
}
.c-attr-sel {
  height: 1.7rem;
  text-align: center;
}
.center {
  text-align: center;
}
input {
  font-size: 0.85rem;
  height: 1.7rem;
  padding: 0.15rem 0.3rem;
}
.c-bonus {
  text-align: center;
}
.roll-btn {
  height: 1.7rem;
  font-size: 0.8rem;
}
.del {
  height: 1.7rem;
  width: 1.7rem;
}
.custom-sep {
  font-family: var(--font-head);
  font-weight: 700;
  color: var(--ink);
  margin: 0.8rem 0 0.3rem;
  border-top: 1px solid var(--brown);
  padding-top: 0.5rem;
}
.add {
  margin-top: 0.5rem;
}
</style>
