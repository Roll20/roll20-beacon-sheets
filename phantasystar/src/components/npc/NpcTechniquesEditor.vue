<script setup>
import { useNpcStore } from '@/stores/npcStore.js'
import { ABILITIES, TECHNIQUE_USES, techniqueUsesLabel, AT_WILL } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const npc = useNpcStore()

const settleId = (t) => {
  if (!t.id && t.name) t.id = npc.slugId(t.name)
}
</script>

<template>
  <div class="techs">
    <div class="grid">
      <label>
        <span>Tech ability</span>
        <select v-model="npc.techniques.ability">
          <option value="">&mdash;</option>
          <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </label>
      <label>
        <span>Attack</span>
        <input v-model.number="npc.techniques.attack" type="number" />
      </label>
      <label>
        <span>Save DC</span>
        <input v-model.number="npc.techniques.saveDC" type="number" />
      </label>
      <label class="wide">
        <span>Note</span>
        <input v-model="npc.techniques.note" />
      </label>
    </div>

    <div v-for="group in npc.techniques.groups" :key="group._id" class="group">
      <div class="group__head">
        <select v-model="group.uses" class="group__uses">
          <option v-for="u in TECHNIQUE_USES" :key="u" :value="u">{{ techniqueUsesLabel(u) }}</option>
        </select>
        <button type="button" class="add" @click="npc.addCreatureTechnique(group._id)">+ Technique</button>
        <ConfirmDelete class="del" title="Remove group" @confirm="npc.removeTechniqueGroup(group._id)" />
      </div>

      <div v-for="t in group.list" :key="t._id" class="tech">
        <div class="tech__top">
          <input v-model="t.name" class="tech__name" placeholder="Technique" @change="settleId(t)" />
          <label class="small"><span>Rank</span><input v-model.number="t.rank" type="number" min="0" /></label>
          <ConfirmDelete class="del" title="Remove" @confirm="npc.removeCreatureTechnique(group._id, t._id)" />
        </div>
        <div class="tech__grid">
          <label><span>Casting time</span><input v-model="t.castingTime" /></label>
          <label><span>Range</span><input v-model="t.range" /></label>
          <label><span>Duration</span><input v-model="t.duration" /></label>
          <label class="check"><input v-model="t.attack" type="checkbox" /><span>Tech attack</span></label>
          <label>
            <span>Save</span>
            <select v-model="t.saveAbility">
              <option value="">&mdash;</option>
              <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.abbr }}</option>
            </select>
          </label>
          <label><span>On a success</span><input v-model="t.saveEffect" :disabled="!t.saveAbility" /></label>
          <label><span>Damage</span><input v-model="t.damage" /></label>
          <label><span>Type</span><input v-model="t.damageType" /></label>
          <label><span>Healing</span><input v-model="t.healing" /></label>
          <label class="wide"><span>Note</span><input v-model="t.note" /></label>
        </div>
        <textarea v-model="t.text" rows="2" />
      </div>
    </div>

    <div class="foot">
      <button type="button" class="add" @click="npc.addTechniqueGroup(AT_WILL)">+ Group</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

label {
  display: flex;
  flex-direction: column;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; margin-bottom: 1px; }
}

input:not([type='checkbox']), select, textarea {
  @include ps-well;
  width: 100%;
  min-width: 0;
  height: 24px;
  font-size: 12px;
  text-align: left;
  padding: 0 5px;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  &:disabled { opacity: 0.45; }
}

input[type='checkbox'] { @include ps-pip-check; }

textarea { height: auto; padding: 4px 5px; line-height: 1.45; resize: vertical; }

input[type='number'] { text-align: center; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 6px 10px;

  .wide { grid-column: 1 / -1; }
}

.group {
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px solid var(--ps-gold);

  &__head { display: flex; align-items: center; gap: 8px; }
  &__uses { width: 140px; font-weight: 700; }
}

.tech {
  padding: 6px 0 6px 10px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);

  &:last-child { border-bottom: none; }

  &__top { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 4px; }
  &__name { flex: 1; font-weight: 700; }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 5px 8px;
    margin-bottom: 4px;

    .wide { grid-column: 1 / -1; }
  }
}

.small { width: 60px; }

.check {
  flex-direction: row;
  align-items: center;
  gap: 4px;
  align-self: end;
  padding-bottom: 4px;

  > span { margin: 0; }
}

.foot { display: flex; justify-content: flex-end; margin-top: 8px; }

.add {
  @include ps-caption;
  margin-left: auto;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 9px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.foot .add { margin-left: 0; }

.del {
  border: none;
  background: none;
  color: var(--ps-text-muted);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;

  &:hover { color: var(--ps-red); }
}
</style>
