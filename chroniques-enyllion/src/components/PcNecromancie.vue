<script setup>
import { useNecromancyStore, BODY_PARTS, ORGANS } from '@/stores/necromancyStore.js'
import { whisper, confirmRemove } from '@/utility/rolls.js'

const necro = useNecromancyStore()
const UNDEAD_CARACS = [
  ['FO', 'Force'],
  ['DEX', 'Dextérité'],
  ['CON', 'Constitution'],
  ['PO', 'Pouvoir']
]
</script>

<template>
  <div class="necro">
    <div class="two-col">
      <!-- Parties du corps -->
      <section class="area">
        <h2 class="section-title">Parties du corps</h2>
        <div class="part-row header"><span>Nom</span><span>Compteur</span><span>Notes</span></div>
        <div class="part-row" v-for="[key, label] in BODY_PARTS" :key="key">
          <span class="part-name">{{ label }}</span>
          <input type="number" v-model.number="necro.bodyParts[key].counter" />
          <input type="text" v-model="necro.bodyParts[key].notes" />
        </div>
      </section>

      <!-- Organes -->
      <section class="area">
        <h2 class="section-title">Organes</h2>
        <div class="part-row header"><span>Nom</span><span>Compteur</span><span>Notes</span></div>
        <div class="part-row" v-for="[key, label] in ORGANS" :key="key">
          <span class="part-name">{{ label }}</span>
          <input type="number" v-model.number="necro.organs[key].counter" />
          <input type="text" v-model="necro.organs[key].notes" />
        </div>
      </section>
    </div>

    <!-- Âmes mineures -->
    <section class="area">
      <h2 class="section-title">Âmes mineures absorbées</h2>
      <div class="souls-minor">
        <label>Compteur<input type="number" v-model.number="necro.minorSoulCounter" /></label>
        <label>PV soignés<input type="number" v-model.number="necro.minorSoulHeal" /></label>
      </div>
    </section>

    <!-- Âmes capturées -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Âmes capturées</h2>
        <button class="add" @click="necro.addSoul">+ Ajouter</button>
      </div>
      <div class="row" v-for="s in necro.souls" :key="s._id">
        <label class="xs">Compteur<input type="number" v-model.number="s.counter" /></label>
        <label class="f-grow">Type<input type="text" v-model="s.type" /></label>
        <label class="xs">Niveau<input type="number" v-model.number="s.level" /></label>
        <button class="del" @click="confirmRemove(() => necro.removeSoul(s._id))">✕</button>
      </div>
    </section>

    <!-- Morts-vivants -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Morts-vivants créés</h2>
        <button class="add" @click="necro.addUndead">+ Ajouter</button>
      </div>
      <div class="undead" v-for="u in necro.undead" :key="u._id">
        <div class="row">
          <button class="roll-btn" title="Jet de dégâts" @click="necro.rollUndeadAttack(u)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => necro.rollUndeadAttack(u))">🤫</button>
          <label class="f-grow">Nom<input type="text" v-model="u.name" /></label>
          <label class="xs">Niveau<input type="number" v-model.number="u.level" /></label>
          <label class="dmg">Dégâts
            <span class="dmg-fields">
              <input type="number" v-model.number="u.dmgDice" /> d
              <input type="number" v-model.number="u.dmgType" /> +
              <input type="number" v-model.number="u.dmgMod" />
            </span>
          </label>
          <label class="xs">PdV<input type="number" v-model.number="u.hp" /></label>
          <label class="f-grow2">Description<input type="text" v-model="u.description" /></label>
          <button class="del" @click="confirmRemove(() => necro.removeUndead(u._id))">✕</button>
        </div>
        <div class="caracs">
          <div class="carac" v-for="[key, label] in UNDEAD_CARACS" :key="key">
            <div class="carac-name">{{ key }}</div>
            <input type="number" v-model.number="u[key]" />
            <button class="roll-btn small" :title="'Jet de ' + label" @click="necro.rollUndeadCarac(u, key, label)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => necro.rollUndeadCarac(u, key, label))">🤫</button>
          </div>
        </div>
        <hr />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.necro {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.section-title {
  margin: 0 0 0.5rem;
}
.part-row {
  display: grid;
  grid-template-columns: 5rem 5rem 1fr;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.3rem;
}
.part-row.header {
  font-family: var(--font-head);
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.part-name {
  font-family: var(--font-label);
  font-size: 0.9rem;
  color: var(--ink);
}
.souls-minor {
  display: flex;
  gap: 1rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.4rem;
  padding: 0.3rem 0;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.7rem;
}
.f-grow {
  flex: 1 1 140px;
}
.f-grow2 {
  flex: 2 1 200px;
}
input {
  font-size: 0.85rem;
  height: 1.7rem;
  padding: 0.1rem 0.3rem;
}
.xs input {
  width: 3.4rem;
  text-align: center;
}
.dmg-fields {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: var(--ink-soft);
  input {
    width: 2.8rem;
    text-align: center;
  }
}
.caracs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
.carac {
  text-align: center;
  background: rgba(255, 250, 235, 0.3);
  border: 1px solid var(--brown);
  border-radius: 0.4rem;
  padding: 0.3rem;
}
.carac-name {
  font-family: var(--font-head);
  font-weight: 700;
  color: var(--ink);
}
.carac input {
  width: 100%;
  text-align: center;
  margin: 0.2rem 0;
}
.roll-btn {
  height: 1.7rem;
  width: 2rem;
  align-self: flex-end;
}
.roll-btn.small {
  width: 100%;
}
.del {
  height: 1.7rem;
  width: 1.7rem;
  align-self: flex-end;
}
hr {
  border: none;
  border-top: 1px solid var(--brown);
  margin: 0.5rem 0 0;
}
</style>
