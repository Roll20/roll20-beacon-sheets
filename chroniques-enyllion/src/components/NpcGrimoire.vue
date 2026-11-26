<script setup>
import { useNpcStore } from '@/stores/npcStore.js'
import { whisper, confirmRemove } from '@/utility/rolls.js'

const npc = useNpcStore()
</script>

<template>
  <div class="npc-grim">
    <!-- Sorts -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Grimoire</h2>
        <button class="add" @click="npc.addSpell">+ Sort</button>
      </div>
      <div class="row" v-for="s in npc.spells" :key="s._id">
        <button class="roll-btn" title="Lancer le sort" @click="npc.rollSpell(s)">🎲</button>
          <button class="roll-btn whisper-btn" title="Jet privé (MJ)" @click="whisper(() => npc.rollSpell(s))">🤫</button>
        <label class="f-grow">Nom du sort<input type="text" v-model="s.name" /></label>
        <label class="xs">Niveau<input type="number" v-model.number="s.lvl" /></label>
        <label class="f-grow2">Description<input type="text" v-model="s.description" /></label>
        <button class="del" @click="confirmRemove(() => npc.removeSpell(s._id))">✕</button>
      </div>
    </section>

    <!-- Relations -->
    <section class="area">
      <div class="head">
        <h2 class="section-title">Relations</h2>
        <button class="add" @click="npc.addRelation">+ Relation</button>
      </div>
      <div class="row" v-for="r in npc.relations" :key="r._id">
        <label class="f-grow">Nom<input type="text" v-model="r.name" /></label>
        <label class="sm">Loyauté<input type="text" v-model="r.loyaute" /></label>
        <label class="sm">Localisation<input type="text" v-model="r.location" /></label>
        <label class="f-grow2">Description<input type="text" v-model="r.description" /></label>
        <button class="del" @click="confirmRemove(() => npc.removeRelation(r._id))">✕</button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.npc-grim {
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
  padding: 0.3rem 0;
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
.f-grow2 {
  flex: 2 1 200px;
}
input {
  font-size: 0.85rem;
  height: 1.7rem;
  padding: 0.1rem 0.3rem;
}
.xs input {
  width: 4rem;
  text-align: center;
}
.sm input {
  width: 6rem;
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
