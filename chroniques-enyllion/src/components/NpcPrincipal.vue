<script setup>
import { useNpcStore } from '@/stores/npcStore.js'
import { whisper, confirmRemove } from '@/utility/rolls.js'
import { CARAC_KEYS, CARAC_LABELS } from '@/stores/statsStore.js'
import { RACES, CLASSES } from '@/data/options.js'

const npc = useNpcStore()
</script>

<template>
  <div class="npc">
    <!-- Infos -->
    <section class="area">
      <h2 class="section-title">PNJ</h2>
      <div class="infos-grid">
        <label>Nom<input type="text" v-model="npc.infos.name" /></label>
        <label>Sexe<input type="text" v-model="npc.infos.sex" /></label>
        <label>Race
          <select v-model="npc.infos.race">
            <option v-for="r in RACES" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </label>
        <label>Ethnie<input type="text" v-model="npc.infos.ethnie" /></label>
        <label>Classe
          <select v-model="npc.infos.class">
            <option v-for="c in CLASSES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </label>
        <label>Divinité<input type="text" v-model="npc.infos.divinity" /></label>
        <label>Âge<input type="text" v-model="npc.infos.age" /></label>
        <label>Guilde<input type="text" v-model="npc.infos.guild" /></label>
        <label>XP<input type="number" v-model.number="npc.infos.xp" /></label>
        <label>Niveau<input type="number" v-model.number="npc.infos.level" /></label>
      </div>
    </section>

    <!-- Caractéristiques -->
    <section class="area">
      <h2 class="section-title">Caractéristiques</h2>
      <div class="caracs-grid">
        <div class="carac" v-for="key in CARAC_KEYS" :key="key">
          <div class="carac-name">{{ key }}</div>
          <div class="carac-sub">{{ CARAC_LABELS[key] }}</div>
          <div class="carac-fields">
            <label class="small">Base<input type="number" v-model.number="npc.caracs[key].base" /></label>
            <label class="small">Modifié<input type="number" v-model.number="npc.caracs[key].mod" /></label>
          </div>
          <button class="roll-btn" :title="'Jet de ' + CARAC_LABELS[key]" @click="npc.rollCarac(key, CARAC_LABELS[key])">🎲 Jet</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => npc.rollCarac(key, CARAC_LABELS[key]))">🤫</button>
        </div>
      </div>
    </section>

    <div class="two-col">
      <!-- Santé -->
      <section class="area">
        <h2 class="section-title">Santé</h2>
        <div class="hp-row">
          <label class="small">PV actuels<input type="number" v-model.number="npc.hpActual" /></label>
          <span class="slash">/</span>
          <label class="small">Total<input type="number" v-model.number="npc.hpTotal" /></label>
        </div>
        <div class="effet-row">
          <span class="effet-label">Statut :</span>
          <span class="effet-value">{{ npc.effetSante }}</span>
          <span class="malus" v-if="npc.malusSante">({{ npc.malusSante }})</span>
        </div>
      </section>

      <!-- Résistance magique -->
      <section class="area">
        <h2 class="section-title">Résistance magique</h2>
        <div class="resmag-grid">
          <label>Résistance<input type="text" v-model="npc.resMag.resistance" /></label>
          <label>Faiblesse<input type="text" v-model="npc.resMag.faiblesse" /></label>
        </div>
      </section>
    </div>

    <!-- Attributs -->
    <section class="area">
      <h2 class="section-title">Attributs</h2>
      <textarea rows="3" v-model="npc.attributs" placeholder="Langages, traits, etc."></textarea>
    </section>

    <!-- Compétences -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Compétences</h2>
        <button class="add" @click="npc.addSkill">+ Compétence</button>
      </div>
      <div class="row" v-for="s in npc.skills" :key="s._id">
        <button class="roll-btn" title="Jet de compétence" @click="npc.rollSkill(s)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => npc.rollSkill(s))">🤫</button>
        <label class="f-grow">Nom<input type="text" v-model="s.name" /></label>
        <label class="xs">Carac
          <select v-model="s.carac">
            <option v-for="k in CARAC_KEYS" :key="k" :value="k">{{ k }}</option>
          </select>
        </label>
        <label class="xs">Bonus<input type="number" v-model.number="s.bonus" /></label>
        <label class="f-grow2">Description<input type="text" v-model="s.description" /></label>
        <button class="del" @click="confirmRemove(() => npc.removeSkill(s._id))">✕</button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.npc {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
.infos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
input,
select {
  height: 1.9rem;
  padding: 0.2rem 0.4rem;
  font-size: 0.9rem;
}
.caracs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
.carac {
  text-align: center;
  background: rgba(255, 250, 235, 0.3);
  border: 1px solid var(--brown);
  border-radius: 0.5rem;
  padding: 0.5rem;
}
.carac-name {
  font-family: var(--font-title);
  font-size: 1.15rem;
  color: var(--ink);
}
.carac-sub {
  font-family: var(--font-label);
  font-size: 0.7rem;
  color: var(--ink-soft);
  margin-bottom: 0.35rem;
}
.carac-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}
.small {
  min-width: 0;
}
.small input {
  width: 100%;
  text-align: center;
}
.roll-btn {
  margin-top: 0.4rem;
  width: 100%;
  padding: 0.3rem;
  font-size: 0.8rem;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.hp-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5rem;
}
.hp-row .slash {
  font-family: var(--font-title);
  font-size: 1.4rem;
  color: var(--ink);
  padding-bottom: 0.2rem;
}
.effet-row {
  text-align: center;
  margin-top: 0.7rem;
  font-size: 0.9rem;
}
.effet-label {
  font-family: var(--font-label);
  color: var(--ink-soft);
}
.effet-value {
  color: var(--ink);
  font-weight: 700;
}
.malus {
  color: var(--red);
  margin-left: 0.25rem;
}
.resmag-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
textarea {
  width: 100%;
  padding: 0.4rem;
  font-size: 0.9rem;
  resize: vertical;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.head .section-title {
  margin: 0;
  border: none;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.4rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(58, 38, 22, 0.25);
}
.f-grow {
  flex: 1 1 140px;
}
.f-grow2 {
  flex: 2 1 200px;
}
.xs input,
.xs select {
  width: 4rem;
  height: 1.7rem;
  text-align: center;
}
.row input {
  height: 1.7rem;
  font-size: 0.85rem;
}
.roll-btn,
.del {
  height: 1.7rem;
  align-self: flex-end;
}
.del {
  width: 1.7rem;
}
</style>
