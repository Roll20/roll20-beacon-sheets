<script setup>
import { computed } from 'vue'
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import {
  NPC_SHIP_ABILITIES,
  npcShipAbilityText,
  npcShipAbilityTitle,
  getStarshipSize,
  formatModifier,
} from '@/rules/index.js'
import InlineNumber from '@/components/shared/InlineNumber.vue'

defineEmits(['edit'])

const ship = useNpcShipStore()
const meta = useMetaStore()
const rolls = useSheetRolls()

const subtitle = computed(() => {
  const size = getStarshipSize(ship.size)?.name ?? ''
  return size ? `${size} starship` : 'Starship'
})

const sections = computed(() =>
  [
    { kind: 'trait', title: 'Traits', entries: ship.traits },
    { kind: 'action', title: 'Actions', entries: ship.actions },
    { kind: 'reaction', title: 'Reactions', entries: ship.reactions },
  ].filter((s) => s.entries.length),
)
</script>

<template>
  <div class="block">
    <header class="head">
      <button type="button" class="edit" @click="$emit('edit')">Edit</button>
      <h1>{{ meta.name || 'Unnamed' }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </header>

    <div class="top">
      <span><em>Defense</em> {{ ship.defense }}</span>
      <span><em>Speed</em> {{ ship.speed }}</span>
      <span>
        <em>Hull Points</em>
        <InlineNumber v-model="ship.hull.current" aria-label="Current Hull Points" />
        / {{ ship.hull.max }}
      </span>
      <span>
        <em>Structural Integrity</em>
        <InlineNumber v-model="ship.si.current" aria-label="Current Structural Integrity" />
        / {{ ship.si.max }}
      </span>
      <span><em>Maneuver Defense</em> {{ ship.maneuverDefense }}</span>
      <button
        type="button"
        class="inline-roll"
        title="Roll initiative"
        @click="rolls.rollNpcShipInitiative()"
      >
        <em>Initiative</em> {{ formatModifier(ship.initiative) }} ({{ ship.initiativeValue }})
      </button>
    </div>

    <div class="crew">
      <div v-for="slot in NPC_SHIP_ABILITIES" :key="slot.id" class="slot">
        <div class="slot__label">{{ slot.label }}</div>
        <button
          type="button"
          class="slot__value"
          :title="npcShipAbilityTitle(slot.id)"
          @click="rolls.rollNpcShipAbility(slot.id)"
        >
          {{ npcShipAbilityText(ship.crew[slot.id]?.mod) }}
        </button>
      </div>
    </div>

    <dl class="details">
      <dt>Piloting</dt>
      <dd>
        <button
          type="button"
          class="inline-roll"
          title="Roll a piloting maneuver check"
          @click="rolls.rollNpcShipPiloting()"
        >
          {{ formatModifier(ship.piloting) }}
        </button>
        , DC {{ ship.saveDC }}
        <small v-if="ship.saveDCIsCustom">(as printed)</small>
      </dd>

      <template v-if="ship.saves.length">
        <dt>Saving Throws</dt>
        <dd class="list">
          <button
            v-for="save in ship.saves"
            :key="save._id"
            type="button"
            class="inline-roll"
            :title="save.name ? `${save.name} saving throw` : 'Saving throw'"
            @click="rolls.rollNpcShipSave(save)"
          >
            {{ save.name || 'Save' }} {{ formatModifier(save.bonus) }}
          </button>
        </dd>
      </template>

      <template v-if="ship.skills.length">
        <dt>Skills</dt>
        <dd class="list">
          <button
            v-for="skill in ship.skills"
            :key="skill._id"
            type="button"
            class="inline-roll"
            :title="`Roll ${skill.name || 'this skill'}`"
            @click="rolls.rollNpcShipSkill(skill)"
          >
            {{ skill.name || 'Skill' }} {{ formatModifier(skill.bonus) }}
          </button>
        </dd>
      </template>

      <dt>Sensor Range</dt>
      <dd>{{ ship.sensorRange }}, passive Perception {{ ship.passivePerception }}</dd>
    </dl>

    <p v-if="ship.notes" class="notes">{{ ship.notes }}</p>

    <section v-for="section in sections" :key="section.kind" class="entries">
      <h2>{{ section.title }}</h2>
      <div v-for="entry in section.entries" :key="entry._id" class="entry">
        <p class="entry__line">
          <strong>{{ entry.name || 'Unnamed' }}.</strong>
          <button
            v-if="entry.isAttack"
            type="button"
            class="inline-roll"
            :title="`Roll an attack with ${entry.name || 'this action'}`"
            @click="rolls.rollNpcShipAttack(entry)"
          >
            {{ formatModifier(entry.attackPower) }} to hit
          </button>
          <span v-if="entry.isAttack && entry.range" class="range">range {{ entry.range }}</span>
          <button
            v-if="entry.damage"
            type="button"
            class="inline-roll"
            :title="`Roll ${entry.damage} damage`"
            @click="rolls.rollNpcShipDamage(entry)"
          >
            {{ ship.damageEntry(entry) }}
          </button>
        </p>
        <p v-if="entry.text" class="entry__text">{{ entry.text }}</p>
        <button
          type="button"
          class="post"
          :title="`Post ${entry.name || 'this'} to chat`"
          @click="rolls.postNpcShipEntry(entry, section.title)"
        >
          Post
        </button>
      </div>
    </section>

    <p v-if="!sections.length" class="empty">
      No traits or actions
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.block {
  @include ps-panel;
  padding: 12px 14px;
  max-width: 760px;
}

.head {
  position: relative;
  border-bottom: 2px solid var(--ps-gold);
  padding-bottom: 5px;
  margin-bottom: 7px;

  h1 { @include ps-heading(22px); margin: 0; padding-right: 56px; color: var(--ps-heading); }
  .subtitle { margin: 1px 0 0; font-size: 11px; font-style: italic; color: var(--ps-text-muted); }
}

.edit {
  position: absolute;
  top: 0;
  right: 0;
  @include ps-caption;
  font-size: 9px;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 10px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}


.top {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px 16px;
  font-size: 12.5px;
  padding-bottom: 7px;
  border-bottom: 1.5px solid rgba(var(--ps-line-soft-rgb), 0.35);

  em { @include ps-caption; font-style: normal; margin-right: 3px; }
  small { color: var(--ps-text-muted); font-size: 10.5px; }

  .inline-roll { text-align: left; }
}

.crew {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;
  padding: 8px 0;
  border-bottom: 1.5px solid rgba(var(--ps-line-soft-rgb), 0.35);
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &__label { @include ps-caption; font-size: 9.5px; }

  &__value {
    @include ps-well;
    width: 100%;
    height: 24px;
    font-size: 12px;
    font-weight: 700;
    color: var(--ps-heading);
    cursor: pointer;

    &:hover { background: var(--ps-panel-alt); }
  }
}

.details {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2px 10px;
  margin: 8px 0 0;
  font-size: 12px;
  padding-bottom: 7px;
  border-bottom: 1.5px solid rgba(var(--ps-line-soft-rgb), 0.35);

  dt { @include ps-caption; align-self: baseline; }
  dd { margin: 0; }
  small { color: var(--ps-text-muted); }
}

.list { display: flex; flex-wrap: wrap; gap: 4px; }

.inline-roll {
  background: none;
  border: none;
  border-bottom: 1px dotted var(--ps-blue);
  color: var(--ps-blue);
  font-size: inherit;
  font-family: inherit;
  padding: 0 1px;
  cursor: pointer;

  &:hover { background: var(--ps-field); }
}

.notes {
  margin: 7px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--ps-text);
  white-space: pre-wrap;
}

.entries {
  margin-top: 9px;

  h2 {
    @include ps-heading(14px);
    margin: 0 0 3px;
    border-bottom: 1px solid var(--ps-gold);
    color: var(--ps-heading);
  }
}

.entry {
  position: relative;
  padding: 4px 46px 4px 0;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.18);

  &:last-child { border-bottom: none; }

  &__line { margin: 0; font-size: 12.5px; display: flex; flex-wrap: wrap; gap: 5px; align-items: baseline; }
  &__text { margin: 2px 0 0; font-size: 11.5px; line-height: 1.5; white-space: pre-wrap; }

  .range { font-size: 11px; color: var(--ps-text-muted); }
}

.post {
  position: absolute;
  top: 4px;
  right: 0;
  @include ps-caption;
  font-size: 8.5px;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 1px 6px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.empty { font-size: 11.5px; color: var(--ps-text-muted); padding: 10px 0 0; margin: 0; }

@media (max-width: 620px) {
  .top { grid-template-columns: minmax(0, 1fr); }
  .crew { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
