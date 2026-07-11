<script setup>
import { computed } from 'vue'
import { useEnemyStore } from '@/stores/enemyStore.js'
import { EFFECT_NAMES, postMessage, whisper, confirmRemove } from '@/utility/rolls.js'

// type = 'monster' | 'dragon' | 'demon'
const props = defineProps({ type: { type: String, required: true }, label: { type: String, required: true } })
const enemy = useEnemyStore()
const list = computed(() => enemy[props.type])

const CARACS = [
  ['FO', 'Force'],
  ['DEX', 'Dextérité'],
  ['PO', 'Pouvoir']
]
const ENCOUNTER = ['-Choisir-', 'Cathéméral', 'Diurne', 'Nocturne']

// Affiche la fiche de la créature au chat (sans jet).
const showCreature = (c) => {
  let text = c.description || ''
  if (c.image) text += `${text ? '<br/>' : ''}<a href="${c.image}">Image</a>`
  return postMessage({ name: c.name || props.label, text })
}
</script>

<template>
  <div class="creatures">
    <section class="area">
      <div class="head">
        <h2 class="section-title">{{ label }}</h2>
        <button class="add" @click="enemy.addCreature(type)">+ Ajouter</button>
      </div>

      <div class="creature" v-for="c in list" :key="c._id">
        <div class="row">
          <button class="roll-btn wide" title="Afficher la fiche au chat" @click="showCreature(c)">📜 Fiche</button>
          <label class="f-grow">Nom<input type="text" v-model="c.name" /></label>
          <label class="xs">PV<input type="number" v-model.number="c.hp" /></label>
          <label class="xs">XP<input type="number" v-model.number="c.xp" /></label>
          <label class="sm">Rencontre
            <select v-model="c.encounter">
              <option v-for="(e, i) in ENCOUNTER" :key="i" :value="String(i)">{{ e }}</option>
            </select>
          </label>
          <button class="del" @click="confirmRemove(() => enemy.removeCreature(type, c._id))">✕</button>
        </div>
        <div class="row">
          <label class="f-grow2">Description<input type="text" v-model="c.description" /></label>
          <label class="f-grow2">Image (URL)<input type="text" v-model="c.image" /></label>
        </div>

        <div class="caracs">
          <div class="carac" v-for="[key, lbl] in CARACS" :key="key">
            <div class="carac-name">{{ key }}</div>
            <input type="number" v-model.number="c[key]" />
            <button class="roll-btn small" :title="'Jet de ' + lbl" @click="enemy.rollCreatureCarac(c, key, lbl)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => enemy.rollCreatureCarac(c, key, lbl))">🤫</button>
          </div>
        </div>

        <div class="sub-head">
          <span class="subtitle">Attaques</span>
          <button class="add small" @click="enemy.addCreatureAttack(c)">+ Attaque</button>
        </div>
        <div class="row" v-for="atk in c.attacks" :key="atk._id">
          <button class="roll-btn" title="Jet de dégâts" @click="enemy.rollCreatureAttack(c, atk)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => enemy.rollCreatureAttack(c, atk))">🤫</button>
          <label class="f-grow">Attaque<input type="text" v-model="atk.name" /></label>
          <label class="dmg">Dégâts
            <span class="dmg-fields">
              <input type="number" v-model.number="atk.dmgDice" /> d
              <input type="number" v-model.number="atk.dmgType" /> +
              <input type="number" v-model.number="atk.dmgMod" />
            </span>
          </label>
          <label class="eff">Effet
            <select v-model.number="atk.effect">
              <option v-for="(name, i) in EFFECT_NAMES" :key="i" :value="i">{{ name }}</option>
            </select>
          </label>
          <label class="xs">%<input type="number" v-model.number="atk.effectPct" /></label>
          <label class="dmg">Tours
            <span class="dmg-fields">
              <input type="number" v-model.number="atk.effectTurnsDice" /> d
              <input type="number" v-model.number="atk.effectTurnsType" /> +
              <input type="number" v-model.number="atk.effectTurnsMod" />
            </span>
          </label>
          <label class="xs">Mod dég.<input type="number" v-model.number="atk.effectDmgMod" /></label>
          <button class="del" @click="confirmRemove(() => enemy.removeCreatureAttack(c, atk._id))">✕</button>
        </div>

        <div class="sub-head">
          <span class="subtitle">Sorts</span>
          <button class="add small" @click="enemy.addCreatureSpell(c)">+ Sort</button>
        </div>
        <div class="row" v-for="sp in c.spells" :key="sp._id">
          <button class="roll-btn" title="Lancer le sort" @click="enemy.rollCreatureSpell(c, sp)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => enemy.rollCreatureSpell(c, sp))">🤫</button>
          <label class="f-grow">Nom du sort<input type="text" v-model="sp.name" /></label>
          <label class="xs">Niveau<input type="number" v-model.number="sp.lvl" /></label>
          <label class="f-grow2">Description<input type="text" v-model="sp.description" /></label>
          <button class="del" @click="confirmRemove(() => enemy.removeCreatureSpell(c, sp._id))">✕</button>
        </div>
        <hr />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.creatures {
  padding: 1rem;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.section-title {
  margin: 0;
}
.subtitle {
  margin: 0;
}
.sub-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.6rem 0 0.2rem;
}
.creature {
  border: 1px solid var(--brown);
  border-radius: 0.5rem;
  padding: 0.6rem;
  margin-bottom: 0.6rem;
  background: rgba(255, 250, 235, 0.15);
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
  flex: 1 1 120px;
}
.f-grow2 {
  flex: 2 1 200px;
}
input,
select {
  font-size: 0.85rem;
  height: 1.7rem;
  padding: 0.1rem 0.3rem;
}
.xs input {
  width: 3.4rem;
  text-align: center;
}
.sm select {
  width: 7rem;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin: 0.4rem 0;
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
.roll-btn.wide {
  width: auto;
  padding: 0 0.6rem;
}
.add.small {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
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
