<script setup>
import { useGrimoireStore } from '@/stores/grimoireStore.js'
import { whisper, confirmRemove } from '@/utility/rolls.js'

const grim = useGrimoireStore()
const FAM_CARACS = [
  ['FO', 'Force'],
  ['DEX', 'Dextérité'],
  ['CON', 'Constitution'],
  ['PO', 'Pouvoir'],
  ['PE', 'Perception']
]
</script>

<template>
  <div class="grimoire">
    <!-- Sorts -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Grimoire</h2>
        <button class="add" @click="grim.addSpell">+ Ajouter</button>
      </div>
      <div class="row" v-for="s in grim.spells" :key="s._id">
        <button class="roll-btn" title="Lancer le sort" @click="grim.rollSpell(s)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => grim.rollSpell(s))">🤫</button>
        <label class="f-grow">Nom du sort<input type="text" v-model="s.name" /></label>
        <label class="xs">Niveau<input type="number" v-model.number="s.lvl" /></label>
        <label class="f-grow2">Description<input type="text" v-model="s.description" /></label>
        <button class="del" @click="confirmRemove(() => grim.removeSpell(s._id))">✕</button>
      </div>
    </section>

    <!-- Familiers -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Familiers</h2>
        <button class="add" @click="grim.addFamiliar">+ Ajouter</button>
      </div>
      <div class="familiar" v-for="f in grim.familiars" :key="f._id">
        <div class="row">
          <button class="invoke" :title="'Invoquer ' + (f.name || 'le familier')" @click="grim.invokeFamiliar(f)">✨ Invoquer</button>
          <label class="f-grow">Nom<input type="text" v-model="f.name" /></label>
          <label class="f-grow">Type<input type="text" v-model="f.type" /></label>
          <label class="xs">Niveau<input type="number" v-model.number="f.lvl" /></label>
          <label class="xs">Durée<input type="number" v-model.number="f.duration" /></label>
          <label class="chk">Jet de pouvoir<input type="checkbox" v-model="f.requiresPowerRoll" /></label>
          <button class="del" @click="confirmRemove(() => grim.removeFamiliar(f._id))">✕</button>
        </div>
        <label class="full">Description<textarea rows="2" v-model="f.description"></textarea></label>

        <div class="subtitle">Caractéristiques</div>
        <div class="caracs">
          <div class="carac" v-for="[key, label] in FAM_CARACS" :key="key">
            <div class="carac-name">{{ key }}</div>
            <input type="number" v-model.number="f[key]" />
            <button class="roll-btn small" :title="'Jet de ' + label" @click="grim.rollFamiliarCarac(f, key, label)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => grim.rollFamiliarCarac(f, key, label))">🤫</button>
          </div>
        </div>

        <div class="sub-head">
          <span class="subtitle">Compétences</span>
          <button class="add small" @click="grim.addFamSkill(f)">+ Compétence</button>
        </div>
        <div class="row" v-for="sk in f.skills" :key="sk._id">
          <label class="f-grow">Compétence<input type="text" v-model="sk.name" /></label>
          <label class="sm">Caractéristique<input type="text" v-model="sk.carac" /></label>
          <label class="xs">Bonus<input type="number" v-model.number="sk.bonus" /></label>
          <label class="f-grow2">Description<input type="text" v-model="sk.description" /></label>
          <button class="del" @click="confirmRemove(() => grim.removeFamSkill(f, sk._id))">✕</button>
        </div>

        <div class="sub-head">
          <span class="subtitle">Attaques</span>
          <button class="add small" @click="grim.addFamAttack(f)">+ Attaque</button>
        </div>
        <div class="row" v-for="atk in f.attacks" :key="atk._id">
          <button class="roll-btn" title="Jet de dégâts" @click="grim.rollFamiliarAttack(f, atk)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => grim.rollFamiliarAttack(f, atk))">🤫</button>
          <label class="f-grow">Nom de l'attaque<input type="text" v-model="atk.name" /></label>
          <label class="dmg">Dégâts
            <span class="dmg-fields">
              <input type="number" v-model.number="atk.dmgDice" /> d
              <input type="number" v-model.number="atk.dmgType" /> +
              <input type="number" v-model.number="atk.dmgMod" />
            </span>
          </label>
          <label class="f-grow2">Description<input type="text" v-model="atk.description" /></label>
          <button class="del" @click="confirmRemove(() => grim.removeFamAttack(f, atk._id))">✕</button>
        </div>

        <div class="sub-head">
          <span class="subtitle">Sorts</span>
          <button class="add small" @click="grim.addFamSpell(f)">+ Sort</button>
        </div>
        <div class="row" v-for="sp in f.spells" :key="sp._id">
          <button class="roll-btn" title="Lancer le sort" @click="grim.rollFamiliarSpell(f, sp)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => grim.rollFamiliarSpell(f, sp))">🤫</button>
          <label class="f-grow">Nom du sort<input type="text" v-model="sp.name" /></label>
          <label class="xs">Niveau<input type="number" v-model.number="sp.lvl" /></label>
          <label class="f-grow2">Description<input type="text" v-model="sp.description" /></label>
          <button class="del" @click="confirmRemove(() => grim.removeFamSpell(f, sp._id))">✕</button>
        </div>
        <hr />
      </div>
    </section>

    <!-- Relations -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Relations</h2>
        <button class="add" @click="grim.addRelation">+ Ajouter</button>
      </div>
      <div class="row" v-for="r in grim.relations" :key="r._id">
        <label class="f-grow">Nom<input type="text" v-model="r.name" /></label>
        <label class="sm">Loyauté<input type="text" v-model="r.loyaute" /></label>
        <label class="sm">Localisation<input type="text" v-model="r.location" /></label>
        <label class="f-grow2">Description<input type="text" v-model="r.description" /></label>
        <button class="del" @click="confirmRemove(() => grim.removeRelation(r._id))">✕</button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.grimoire {
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
.subtitle {
  margin: 0.6rem 0 0.3rem;
}
.sub-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.6rem 0 0.2rem;
}
.sub-head .subtitle {
  margin: 0;
}
.add.small {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
}
.familiar {
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
  flex: 1 1 140px;
}
.f-grow2 {
  flex: 2 1 200px;
}
.full {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.7rem;
}
input,
select,
textarea {
  font-size: 0.85rem;
  padding: 0.1rem 0.3rem;
}
input,
select {
  height: 1.7rem;
}
.xs input {
  width: 3.2rem;
  text-align: center;
}
.sm input {
  width: 6rem;
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
  grid-template-columns: repeat(5, 1fr);
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
.invoke {
  cursor: pointer;
  font-family: var(--font-head);
  font-weight: 700;
  background: var(--brown-dark);
  color: var(--parchment-light);
  border: 1px solid #000;
  border-radius: 0.3rem;
  height: 1.7rem;
  padding: 0 0.6rem;
  align-self: flex-end;
  &:hover {
    background: var(--brown);
  }
}
.chk {
  align-items: center;
}
.chk input[type='checkbox'] {
  width: 1.1rem;
  height: 1.1rem;
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
