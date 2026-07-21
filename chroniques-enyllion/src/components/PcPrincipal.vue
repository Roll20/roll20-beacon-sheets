<script setup>
import { useMetaStore } from '@/stores/metaStore.js'
import { useStatsStore } from '@/stores/statsStore.js'
import { CARAC_KEYS, CARAC_LABELS } from '@/stores/statsStore.js'
import { RACES, CLASSES } from '@/data/options.js'
import { whisper } from '@/utility/rolls.js'

const meta = useMetaStore()
const stats = useStatsStore()
</script>

<template>
  <div class="principal">
    <!-- Infos personnage -->
    <section class="area">
      <h2 class="section-title">Infos personnage</h2>
      <div class="infos-grid">
        <label>Nom<input type="text" v-model="meta.name" /></label>
        <label>Sexe<input type="text" v-model="stats.infos.pcSex" /></label>
        <label>Race
          <select v-model="stats.infos.pcRace">
            <option v-for="r in RACES" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </label>

        <label>Ethnie<input type="text" v-model="stats.infos.pcEthnie" /></label>
        <label>Age<input type="text" v-model="stats.infos.pcAge" /></label>
        <label>Classe
          <select v-model="stats.infos.pcClass">
            <option v-for="c in CLASSES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </label>

        <label>Lieu de naissance<input type="text" v-model="stats.infos.pcBornPlace" /></label>
        <label>Poids<input type="text" v-model="stats.infos.pcWeigth" /></label>
        <label>Spécialité<input type="text" v-model="stats.infos.pcSpeciality" /></label>

        <label>Divinité<input type="text" v-model="stats.infos.pcDivinity" /></label>
        <label>Taille<input type="text" v-model="stats.infos.pcHeight" /></label>
        <label>Guilde<input type="text" v-model="stats.infos.pcGuild" /></label>

        <label>Classe sociale<input type="text" v-model="stats.infos.pcSocialClass" /></label>
        <label>Exp<input type="number" v-model.number="stats.infos.pcExperience" /></label>
        <label>Niveau<input type="number" :value="stats.level" disabled title="Calculé automatiquement depuis l'expérience" /></label>
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
            <label class="small">Base<input type="number" v-model.number="stats.caracs[key].base" /></label>
            <label class="small">Modifié<input type="number" v-model.number="stats.caracs[key].mod" /></label>
          </div>
          <div class="roll-row">
            <button class="roll-btn" :title="'Jet de ' + CARAC_LABELS[key]" @click="stats.rollCarac(key, CARAC_LABELS[key])">🎲 Jet</button>
            <button class="roll-btn whisper-btn" :title="'Jet privé (MJ) de ' + CARAC_LABELS[key]" @click="whisper(() => stats.rollCarac(key, CARAC_LABELS[key]))">🤫</button>
          </div>
        </div>
      </div>
    </section>

    <div class="two-col">
      <!-- Santé -->
      <section class="area">
        <h2 class="section-title">Santé</h2>
        <div class="hp-row">
          <label class="small">Actuels<input type="number" v-model.number="stats.hpActual" /></label>
          <span class="slash">/</span>
          <label class="small">Total<input type="number" v-model.number="stats.hpTotal" /></label>
        </div>
        <div class="statut">Statut</div>
        <div class="jauge">
          <span
            v-for="n in 19"
            :key="n"
            class="seg"
            :class="{ on: n <= stats.santeLevel, ['lvl-' + n]: true }"
            :title="'Niveau ' + n"
          ></span>
        </div>
        <div class="effet-row">
          <span class="effet-label">Effet :</span>
          <span class="effet-value">{{ stats.effetSante }}</span>
          <span class="malus" v-if="stats.malusSante">({{ stats.malusSante }})</span>
        </div>
      </section>

      <!-- Bourse -->
      <section class="area">
        <h2 class="section-title">Bourse</h2>
        <div class="bourse-grid">
          <label>Dragons d'or<input type="number" v-model.number="stats.goldPieces" /></label>
          <label>Phénix d'argent<input type="number" v-model.number="stats.silverPieces" /></label>
          <label>Chiens de cuivre<input type="number" v-model.number="stats.copperPieces" /></label>
        </div>
      </section>
    </div>

    <div class="two-col">
      <!-- Honneur -->
      <section class="area">
        <h2 class="section-title">Honneur</h2>
        <div class="centered">
          <label class="small">Honneur (0-20)<input type="number" min="0" max="20" v-model.number="stats.honneur" /></label>
        </div>
        <div class="jauge">
          <span
            v-for="n in 20"
            :key="n"
            class="seg honneur"
            :class="{ on: n <= stats.honEchFill }"
          ></span>
        </div>
        <div class="effet-row">
          <span class="effet-label">Alignement :</span>
          <span class="effet-value">{{ stats.alignement }}</span>
        </div>
      </section>

      <!-- Affinité divine -->
      <section class="area">
        <h2 class="section-title">Affinité divine</h2>
        <div class="centered">
          <label class="small">Affinité (0-10)<input type="number" min="0" max="10" v-model.number="stats.affDiv" /></label>
        </div>
        <div class="jauge">
          <span
            v-for="n in 11"
            :key="n"
            class="seg affdiv"
            :class="{ on: n <= stats.affDivFill }"
          ></span>
        </div>
      </section>
    </div>

    <!-- Attributs -->
    <section class="area">
      <h2 class="section-title">Attributs</h2>
      <div class="attr-grid">
        <label>Trait de caractère 1<input type="text" v-model="stats.attributs.pcTraitsCarac1" /></label>
        <label>Trait de caractère 2<input type="text" v-model="stats.attributs.pcTraitsCarac2" /></label>
        <label>Langage natif<input type="text" v-model="stats.attributs.pcNativeLanguage" /></label>
      </div>
      <label class="full">Langages parlés
        <textarea rows="3" v-model="stats.attributs.pcLanguages"></textarea>
      </label>
    </section>

    <div class="two-col">
      <!-- Caractéristiques de race -->
      <section class="area">
        <h2 class="section-title">Caractéristiques de race</h2>
        <div class="race-row header">
          <span>Caractéristique</span>
          <span>Bonus/Malus</span>
        </div>
        <div class="race-row" v-for="(row, i) in stats.caracRace" :key="i">
          <input type="text" v-model="row.nom" />
          <input type="number" v-model.number="row.bonus" />
        </div>
      </section>

      <!-- Résistance magique -->
      <section class="area">
        <h2 class="section-title">Résistance magique</h2>
        <div class="resmag-grid">
          <label>Résistance<input type="text" v-model="stats.resMag.resistance" /></label>
          <label>Faiblesse<input type="text" v-model="stats.resMag.faiblesse" /></label>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.principal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
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

.infos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
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
  min-width: 0; /* permet aux champs de rétrécir dans la grille */
}
.small input {
  width: 100%;
  text-align: center;
}
.roll-row {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.4rem;
}
.roll-row .roll-btn {
  flex: 1;
  padding: 0.3rem;
  font-size: 0.8rem;
}
.whisper-btn {
  flex: 0 0 auto !important;
  padding: 0.3rem 0.5rem;
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
.statut {
  font-family: var(--font-head);
  text-align: center;
  margin: 0.6rem 0 0.3rem;
  color: var(--ink);
}
.jauge {
  display: flex;
  gap: 2px;
  justify-content: center;
}
.seg {
  width: 14px;
  height: 18px;
  background: rgba(58, 38, 22, 0.25);
  border: 1px solid var(--brown-dark);
  border-radius: 2px;
  display: inline-block;
}
/* Dégradé vert -> jaune -> rouge selon la gravité */
.seg.on {
  background: #2e9e2e;
}
.seg.on.lvl-5,
.seg.on.lvl-6,
.seg.on.lvl-7,
.seg.on.lvl-8,
.seg.on.lvl-9 {
  background: #b8b81f;
}
.seg.on.lvl-10,
.seg.on.lvl-11,
.seg.on.lvl-12,
.seg.on.lvl-13,
.seg.on.lvl-14 {
  background: #e07a00;
}
.seg.on.lvl-15,
.seg.on.lvl-16,
.seg.on.lvl-17,
.seg.on.lvl-18,
.seg.on.lvl-19 {
  background: #c41818;
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

.bourse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.centered {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.seg.honneur {
  width: 11px;
}
.seg.honneur.on {
  background: #3f6dbf;
}
.seg.affdiv.on {
  background: #c9a227;
}

.attr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}
.full {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
textarea {
  padding: 0.3rem 0.4rem;
  resize: vertical;
  font-size: 0.9rem;
}

.race-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}
.race-row.header {
  font-family: var(--font-head);
  font-size: 0.8rem;
  color: var(--ink-soft);
  text-align: center;
}

.resmag-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
</style>
