<script setup>
import { useInventoryStore } from '@/stores/inventoryStore.js'
import { EFFECT_NAMES, whisper, confirmRemove } from '@/utility/rolls.js'

const inv = useInventoryStore()

const COVERED_PARTS = ['-Aucun-', 'Tête', 'Torse', 'Bras', 'Jambes', 'Pieds', 'Mains']
const LOCATIONS = ['-Aucun-', 'Ceinture', 'Sacoche', 'Dos', 'Sac à dos', 'Poche', 'Bourse', 'Maison']
</script>

<template>
  <div class="equip">
    <!-- Armes de mêlée -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Armes de mêlée</h2>
        <button class="add" @click="inv.addMelee">+ Ajouter</button>
      </div>
      <div class="row weapon" v-for="w in inv.melee" :key="w._id">
        <button class="roll-btn" title="Jet de dégâts" @click="inv.rollDamage(w)">🎲</button>
        <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => inv.rollDamage(w))">🤫</button>
        <label class="f-grow">Nom<input type="text" v-model="w.name" /></label>
        <label class="dmg">Dégâts
          <span class="dmg-fields">
            <input type="number" v-model.number="w.dmgDice" /> d
            <input type="number" v-model.number="w.dmgType" /> +
            <input type="number" v-model.number="w.dmgMod" />
          </span>
        </label>
        <label class="xs">Niv.<input type="number" v-model.number="w.lvl" /></label>
        <label class="xs">Poids<input type="number" v-model.number="w.weight" /></label>
        <label class="sm">Prix<input type="text" v-model="w.price" /></label>
        <label class="chk">Porté<input type="checkbox" v-model="w.wear" /></label>
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
        <button class="del" @click="confirmRemove(() => inv.removeMelee(w._id))">✕</button>
      </div>
    </section>

    <!-- Armes à distance -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Armes à distance</h2>
        <button class="add" @click="inv.addDist">+ Ajouter</button>
      </div>
      <div class="row weapon" v-for="w in inv.dist" :key="w._id">
        <button class="roll-btn" title="Jet de dégâts" @click="inv.rollDamage(w)">🎲</button>
        <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => inv.rollDamage(w))">🤫</button>
        <label class="f-grow">Nom<input type="text" v-model="w.name" /></label>
        <label class="dmg">Dégâts
          <span class="dmg-fields">
            <input type="number" v-model.number="w.dmgDice" /> d
            <input type="number" v-model.number="w.dmgType" /> +
            <input type="number" v-model.number="w.dmgMod" />
          </span>
        </label>
        <label class="xs">Portée<input type="number" v-model.number="w.range" /></label>
        <label class="chk">Chargeur
          <span class="dmg-fields">
            <input type="number" v-model.number="w.munRemain" /> /
            <input type="number" v-model.number="w.munTotal" />
          </span>
        </label>
        <label class="sm">Prix<input type="text" v-model="w.price" /></label>
        <label class="chk">Porté<input type="checkbox" v-model="w.wear" /></label>
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
        <button class="del" @click="confirmRemove(() => inv.removeDist(w._id))">✕</button>
      </div>
    </section>

    <!-- Munitions -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Munitions</h2>
        <button class="add" @click="inv.addMunition">+ Ajouter</button>
      </div>
      <div class="row weapon" v-for="w in inv.munitions" :key="w._id">
        <button class="roll-btn" title="Jet de dégâts" @click="inv.rollDamage(w)">🎲</button>
        <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => inv.rollDamage(w))">🤫</button>
        <label class="f-grow">Nom<input type="text" v-model="w.name" /></label>
        <label class="xs">Qté<input type="number" v-model.number="w.qty" /></label>
        <label class="dmg">Dégâts
          <span class="dmg-fields">
            <input type="number" v-model.number="w.dmgDice" /> d
            <input type="number" v-model.number="w.dmgType" /> +
            <input type="number" v-model.number="w.dmgMod" />
          </span>
        </label>
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
        <button class="del" @click="confirmRemove(() => inv.removeMunition(w._id))">✕</button>
      </div>
    </section>

    <!-- Armures -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Armures</h2>
        <button class="add" @click="inv.addArmor">+ Ajouter</button>
      </div>
      <div class="row" v-for="a in inv.armor" :key="a._id">
        <label class="f-grow">Armure<input type="text" v-model="a.name" /></label>
        <label class="xs">PA<input type="number" v-model.number="a.pa" /></label>
        <label class="xs">Niv.<input type="number" v-model.number="a.lvl" /></label>
        <label class="eff">Parties couvertes
          <select v-model="a.coveredParts">
            <option v-for="(name, i) in COVERED_PARTS" :key="i" :value="String(i)">{{ name }}</option>
          </select>
        </label>
        <label class="xs">Poids<input type="number" v-model.number="a.weight" /></label>
        <label class="sm">Prix<input type="text" v-model="a.price" /></label>
        <label class="chk">Porté<input type="checkbox" v-model="a.wear" /></label>
        <button class="del" @click="confirmRemove(() => inv.removeArmor(a._id))">✕</button>
      </div>
    </section>

    <!-- Équipement -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Équipement</h2>
        <button class="add" @click="inv.addEqp">+ Ajouter</button>
      </div>
      <div class="row" v-for="e in inv.equipment" :key="e._id">
        <label class="f-grow">Nom<input type="text" v-model="e.name" /></label>
        <label class="xs">Qté<input type="number" v-model.number="e.qty" /></label>
        <label class="xs">Poids/u<input type="number" v-model.number="e.weight" /></label>
        <label class="xs">Total<input type="number" :value="(Number(e.qty)||0)*(Number(e.weight)||0)" disabled /></label>
        <label class="sm">Prix/u<input type="text" v-model="e.price" /></label>
        <label class="eff">Localisation
          <select v-model="e.location">
            <option v-for="(name, i) in LOCATIONS" :key="i" :value="i === 0 ? '' : name">{{ name }}</option>
          </select>
        </label>
        <label class="chk">Porté<input type="checkbox" v-model="e.wear" /></label>
        <button class="del" @click="confirmRemove(() => inv.removeEqp(e._id))">✕</button>
      </div>
      <div class="total-weight">Poids total de l'équipement : <strong>{{ inv.totalEqpWeight }}</strong></div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.equip {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.4rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(58, 38, 22, 0.25);
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
input,
select {
  font-size: 0.85rem;
  height: 1.7rem;
  padding: 0.1rem 0.3rem;
}
.xs input {
  width: 3.2rem;
  text-align: center;
}
.sm input {
  width: 4.5rem;
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
.chk {
  align-items: center;
}
.chk input[type='checkbox'] {
  width: 1.1rem;
  height: 1.1rem;
}
.roll-btn {
  height: 1.7rem;
  width: 2rem;
  align-self: flex-end;
}
.del {
  height: 1.7rem;
  width: 1.7rem;
  align-self: flex-end;
}
.total-weight {
  margin-top: 0.6rem;
  text-align: right;
  font-size: 0.9rem;
  color: var(--ink);
}
</style>
