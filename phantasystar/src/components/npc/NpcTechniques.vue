<script setup>
import { ref, computed } from 'vue'
import { useNpcStore } from '@/stores/npcStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { ABILITIES, AT_WILL, techniqueUsesLabel, formatModifier } from '@/rules/index.js'
import UsePips from '@/components/shared/UsePips.vue'

const npc = useNpcStore()
const rolls = useSheetRolls()

const block = computed(() => npc.techniques)

const abilityName = computed(() => ABILITIES.find((a) => a.id === block.value.ability)?.name ?? '')

const stats = computed(() => {
  const parts = []
  if (abilityName.value) parts.push(abilityName.value)
  if (String(block.value.attack ?? '').trim() !== '') parts.push(`Attack ${formatModifier(Number(block.value.attack))}`)
  if (String(block.value.saveDC ?? '').trim() !== '') parts.push(`Save DC ${block.value.saveDC}`)
  return parts.join(' · ')
})

const openId = ref(null)
const openTech = computed(() => {
  for (const group of block.value.groups) {
    const technique = group.list.find((t) => t._id === openId.value)
    if (technique) return { group, technique }
  }
  return null
})
const toggle = (technique) => {
  openId.value = openId.value === technique._id ? null : technique._id
}

const detailLine = (t) =>
  [t.castingTime, t.range, t.duration].filter(Boolean).join(' · ')

const paragraphs = (text) =>
  String(text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
</script>

<template>
  <div class="techs">
    <p class="line">
      <strong>Techniques.</strong>
      <span v-if="stats" class="stats">{{ stats }}</span>
    </p>
    <p v-if="block.note" class="note">{{ block.note }}</p>

    <div v-for="group in block.groups" :key="group._id" class="group">
      <span class="group__label">{{ techniqueUsesLabel(group.uses) }}:</span>
      <span v-for="t in group.list" :key="t._id" class="tech">
        <button
          type="button"
          class="tech__name"
          :class="{ open: openId === t._id }"
          @click="toggle(t)"
        >
          {{ t.name || 'Unnamed' }}
        </button>
        <small v-if="t.rank !== '' && t.rank != null" class="tech__rank">(Rank {{ t.rank }})</small>
        <UsePips
          v-if="group.uses !== AT_WILL"
          :total="Number(group.uses)"
          :used="t.used"
          :label="`${t.name} uses`"
          @set="npc.setTechniqueUsed(t, $event)"
        />
      </span>
    </div>

    <div v-if="openTech" class="detail">
      <p class="detail__head">
        <strong>{{ openTech.technique.name || 'Technique' }}</strong>
        <span v-if="detailLine(openTech.technique)" class="detail__line">{{ detailLine(openTech.technique) }}</span>
      </p>
      <p v-for="(para, i) in paragraphs(openTech.technique.text)" :key="i" class="detail__text">{{ para }}</p>
      <p v-if="openTech.technique.note" class="detail__text"><em>{{ openTech.technique.note }}</em></p>
      <div class="detail__buttons">
        <button type="button" class="mini" @click="rolls.castNpcTechnique(openTech.technique, openTech.group)">
          Cast
        </button>
        <button
          v-if="openTech.technique.damage"
          type="button"
          class="mini"
          @click="rolls.rollNpcTechniqueDamage(openTech.technique)"
        >
          Damage
        </button>
        <button
          v-if="openTech.technique.healing"
          type="button"
          class="mini"
          @click="rolls.rollNpcTechniqueHealing(openTech.technique)"
        >
          Heal
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.techs {
  padding: 4px 0;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.18);
  font-size: 12.5px;
}

.line { margin: 0; display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }
.stats { font-size: 11.5px; color: var(--ps-text-muted); }
.note { margin: 2px 0 0; font-size: 11.5px; font-style: italic; }

.group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px 10px;
  margin-top: 3px;
  font-size: 11.5px;

  &__label { @include ps-caption; font-size: 9.5px; }
}

.tech {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &__name {
    background: none;
    border: none;
    border-bottom: 1px dotted var(--ps-blue);
    color: var(--ps-blue);
    font: inherit;
    font-style: italic;
    padding: 0 1px;
    cursor: pointer;

    &:hover, &.open { background: var(--ps-field); }
  }

  &__rank { color: var(--ps-text-muted); font-size: 10.5px; }
}

.detail {
  margin: 5px 0 2px;
  padding: 5px 7px;
  background: var(--ps-row-open);
  border-radius: var(--ps-radius-sm);

  &__head { margin: 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; }
  &__line { font-size: 10.5px; color: var(--ps-text-muted); }
  &__text { margin: 3px 0 0; font-size: 11.5px; line-height: 1.5; white-space: pre-line; }
  &__buttons { display: flex; gap: 5px; margin-top: 5px; }
}

.mini {
  @include ps-caption;
  font-size: 9px;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 8px;
  cursor: pointer;

  &:hover { background: var(--ps-fill); color: var(--ps-on-fill); }
}
</style>
