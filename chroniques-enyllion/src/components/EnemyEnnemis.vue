<script setup>
import { useEnemyStore } from '@/stores/enemyStore.js'
import { CARAC_LABELS } from '@/stores/statsStore.js'
import { EFFECT_NAMES, whisper, confirmRemove } from '@/utility/rolls.js'

const enemy = useEnemyStore()
const ARMOR_PARTS = [
  ['head', 'Tête'],
  ['torso', 'Torse'],
  ['arms', 'Bras'],
  ['hands', 'Mains'],
  ['legs', 'Jambes'],
  ['feet', 'Pieds']
]
</script>

<template>
  <div class="ennemis">
    <section class="area">
      <div class="head">
        <h2 class="section-title">Ennemis</h2>
        <button class="add" @click="enemy.addEnnemi">+ Ajouter</button>
      </div>

      <div class="ennemi" v-for="e in enemy.ennemis" :key="e._id">
        <div class="row">
          <label class="f-grow">Nom<input type="text" v-model="e.name" /></label>
          <label class="f-grow">Race<input type="text" v-model="e.race" /></label>
          <label class="f-grow">Classe<input type="text" v-model="e.class" /></label>
          <label class="f-grow">Guilde<input type="text" v-model="e.guild" /></label>
          <button class="del" @click="confirmRemove(() => enemy.removeEnnemi(e._id))">✕</button>
        </div>

        <div class="caracs">
          <div class="carac" v-for="key in enemy.ENNEMI_CARACS" :key="key">
            <div class="carac-name">{{ key }}</div>
            <input type="number" v-model.number="e[key]" />
            <button class="roll-btn small" :title="'Jet de ' + CARAC_LABELS[key]" @click="enemy.rollEnnemiCarac(e, key, CARAC_LABELS[key])">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => enemy.rollEnnemiCarac(e, key, CARAC_LABELS[key]))">🤫</button>
          </div>
        </div>

        <div class="two">
          <div>
            <div class="subtitle">Armure</div>
            <div class="armor">
              <label v-for="[k, lbl] in ARMOR_PARTS" :key="k" class="xs">{{ lbl }}<input type="number" v-model.number="e.armor[k]" /></label>
            </div>
          </div>
          <div>
            <div class="subtitle">Bourse</div>
            <div class="bourse">
              <label class="xs">Or<input type="number" v-model.number="e.gold" /></label>
              <label class="xs">Argent<input type="number" v-model.number="e.silver" /></label>
              <label class="xs">Cuivre<input type="number" v-model.number="e.copper" /></label>
            </div>
          </div>
        </div>

        <div class="sub-head">
          <span class="subtitle">Armes</span>
          <button class="add small" @click="enemy.addEnnemiWeapon(e)">+ Arme</button>
        </div>
        <div class="row" v-for="w in e.weapons" :key="w._id">
          <button class="roll-btn" title="Jet de dégâts" @click="enemy.rollEnnemiWeapon(e, w)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => enemy.rollEnnemiWeapon(e, w))">🤫</button>
          <label class="f-grow">Nom<input type="text" v-model="w.name" /></label>
          <label class="dmg">Dégâts
            <span class="dmg-fields">
              <input type="number" v-model.number="w.dmgDice" /> d
              <input type="number" v-model.number="w.dmgType" /> +
              <input type="number" v-model.number="w.dmgMod" />
            </span>
          </label>
          <label class="xs">Niv.<input type="number" v-model.number="w.lvl" /></label>
          <label class="xs">Portée<input type="number" v-model.number="w.range" /></label>
          <label class="eff">Effet
            <select v-model.number="w.effect">
              <option v-for="(name, i) in EFFECT_NAMES" :key="i" :value="i">{{ name }}</option>
            </select>
          </label>
          <label class="xs">%<input type="number" v-model.number="w.effectPct" /></label>
          <label class="dmg">Tours
            <span class="dmg-fields">
              <input type="number" v-model.number="w.effectTurnsDice" /> d
              <input type="number" v-model.number="w.effectTurnsType" /> +
              <input type="number" v-model.number="w.effectTurnsMod" />
            </span>
          </label>
          <label class="xs">Mod dég.<input type="number" v-model.number="w.effectDmgMod" /></label>
          <button class="del" @click="confirmRemove(() => enemy.removeEnnemiWeapon(e, w._id))">✕</button>
        </div>

        <div class="sub-head">
          <span class="subtitle">Sorts</span>
          <button class="add small" @click="enemy.addEnnemiSpell(e)">+ Sort</button>
        </div>
        <div class="row" v-for="sp in e.spells" :key="sp._id">
          <button class="roll-btn" title="Lancer le sort" @click="enemy.rollEnnemiSpell(e, sp)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => enemy.rollEnnemiSpell(e, sp))">🤫</button>
          <label class="f-grow">Nom du sort<input type="text" v-model="sp.name" /></label>
          <label class="xs">Niveau<input type="number" v-model.number="sp.lvl" /></label>
          <label class="f-grow2">Description<input type="text" v-model="sp.description" /></label>
          <button class="del" @click="confirmRemove(() => enemy.removeEnnemiSpell(e, sp._id))">✕</button>
        </div>
        <hr />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.ennemis {
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
.ennemi {
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
  grid-template-columns: repeat(8, 1fr);
  gap: 0.4rem;
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
.two {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin: 0.4rem 0;
}
.armor {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.3rem;
}
.armor input {
  width: 100%;
  text-align: center;
}
.bourse {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
}
.bourse input {
  width: 100%;
  text-align: center;
}
.add.small {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
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
