<script setup>
import { computed } from 'vue'
import { useNpcStore } from '@/stores/npcStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import {
  ABILITIES, CREATURE_SIZES, formatModifier, initiativeScore, bossUses, findCreatureTechnique,
} from '@/rules/index.js'
import InlineNumber from '@/components/shared/InlineNumber.vue'
import UsePips from '@/components/shared/UsePips.vue'
import NpcTechniques from './NpcTechniques.vue'

defineEmits(['edit'])

const npc = useNpcStore()
const meta = useMetaStore()
const rolls = useSheetRolls()

const sizeName = computed(
  () => CREATURE_SIZES.find((s) => s.id === npc.size)?.name ?? '',
)

const subtitle = computed(() => {
  const kind = [sizeName.value, npc.creatureType].filter(Boolean).join(' ')
  const tagged = npc.tags ? `${kind} (${npc.tags})` : kind
  return [tagged, npc.alignment].filter(Boolean).join(', ')
})

const sections = computed(() =>
  [
    { kind: 'trait', title: 'Traits', entries: npc.traits },
    { kind: 'action', title: 'Actions', entries: npc.actions, techniques: npc.techniques.enabled },
    { kind: 'specialAction', title: 'Special Actions', entries: npc.specialActions },
    { kind: 'reaction', title: 'Reactions', entries: npc.reactions },
    npc.legendary.enabled
      ? { kind: 'legendary', title: 'Legendary Actions', entries: npc.legendary.actions, pool: npc.legendary }
      : null,
    npc.boss.enabled
      ? { kind: 'boss', title: 'Boss Actions', entries: npc.boss.actions, pool: npc.boss }
      : null,
  ].filter((s) => s && (s.entries.length || s.techniques || s.pool)),
)

const poolTotal = (section) => (section.kind === 'boss' ? bossUses(section.pool) : section.pool.uses)
const canAfford = (section, entry) =>
  (section.pool.used || 0) + (entry.cost || 1) <= poolTotal(section)

const linkedTechnique = (entry) => findCreatureTechnique(npc.techniques, entry.technique)
</script>

<template>
  <div class="block">
    <header class="head">
      <button type="button" class="edit" @click="$emit('edit')">Edit</button>
      <h1>{{ meta.name || 'Unnamed' }}</h1>
      <div v-if="subtitle || npc.cr" class="subline">
        <p class="subtitle">{{ subtitle }}</p>
        <p v-if="npc.cr" class="cr">
          CR {{ npc.cr }}<template v-if="npc.xp != null"> ({{ npc.xp.toLocaleString() }} XP)</template>
        </p>
      </div>
    </header>

    <div class="combat">
      <span>
        <em>Defense</em> {{ npc.defense }}
        <small v-if="npc.defenseNote">({{ npc.defenseNote }})</small>
      </span>
      <span>
        <em>HP</em>
        <InlineNumber v-model="npc.hp.current" aria-label="Current HP" />
        / {{ npc.hp.max }}
        <small v-if="npc.hitDice">({{ npc.hitDice }})</small>
      </span>
      <span v-if="npc.speed"><em>Speed</em> {{ npc.speed }}</span>
      <button
        type="button"
        class="inline-roll"
        title="Roll initiative"
        @click="rolls.rollNpcInitiative()"
      >
        <em>Initiative</em> {{ formatModifier(npc.initiative) }}
        ({{ initiativeScore(npc.initiative) }})
      </button>
    </div>

    <div class="abilities">
      <div v-for="ability in ABILITIES" :key="ability.id" class="ability">
        <div class="ability__abbr">{{ ability.abbr }}</div>
        <button
          type="button"
          class="ability__mod"
          :title="`${ability.name} check`"
          @click="rolls.rollNpcAbility(ability.id)"
        >
          {{ formatModifier(npc.abilities[ability.id]) }}
        </button>
        <button
          type="button"
          class="ability__save"
          :class="{ proficient: npc.saveProficiencies[ability.id] }"
          :title="`${ability.name} saving throw`"
          @click="rolls.rollNpcSave(ability.id)"
        >
          {{ formatModifier(npc.saves[ability.id]) }}
        </button>
      </div>
    </div>

    <dl class="details">
      <template v-if="npc.skills.length">
        <dt>Skills</dt>
        <dd class="skills">
          <button
            v-for="skill in npc.skills"
            :key="skill._id"
            type="button"
            class="inline-roll"
            :title="`Roll ${skill.name || 'this skill'}`"
            @click="rolls.rollNpcSkill(skill)"
          >
            {{ skill.name || 'Skill' }} {{ formatModifier(skill.bonus) }}
          </button>
        </dd>
      </template>

      <template v-if="npc.resistances"><dt>Resistances</dt><dd>{{ npc.resistances }}</dd></template>
      <template v-if="npc.immunities"><dt>Immunities</dt><dd>{{ npc.immunities }}</dd></template>

      <dt>Senses</dt>
      <dd>
        <template v-if="npc.senses">{{ npc.senses }}, </template>
        passive Perception {{ npc.passivePerception }}
      </dd>

      <template v-if="npc.languages"><dt>Languages</dt><dd>{{ npc.languages }}</dd></template>
    </dl>

    <p v-if="npc.notes" class="notes">{{ npc.notes }}</p>


    <section v-for="section in sections" :key="section.kind" class="entries">
      <h2>
        {{ section.title }}
        <span v-if="section.pool" class="pool">
          <UsePips
            :total="poolTotal(section)"
            :used="section.pool.used"
            :label="`${section.title} uses`"
            @set="npc.setUsed(section.kind, $event)"
          />
          <label v-if="section.kind === 'boss'" class="enraged">
            <input v-model="npc.boss.enraged" type="checkbox" /> Enraged
          </label>
        </span>
      </h2>
      <p v-if="section.pool?.text" class="entry__text pool__text">{{ section.pool.text }}</p>

      <div v-for="entry in section.entries" :key="entry._id" class="entry">
        <p class="entry__line">
          <strong>{{ entry.name || 'Unnamed' }}<template v-if="section.pool && entry.cost > 1"> (Costs {{ entry.cost }} Actions)</template>.</strong>
          <button
            v-if="entry.isAttack"
            type="button"
            class="inline-roll"
            :title="`Roll an attack with ${entry.name || 'this action'}`"
            @click="rolls.rollNpcAttack(entry)"
          >
            {{ formatModifier(entry.attackPower) }} to hit
          </button>
          <span v-if="entry.isAttack && entry.range" class="range">{{ entry.range }}</span>
          <button
            v-if="entry.damage"
            type="button"
            class="inline-roll"
            :title="`Roll ${entry.damage} damage`"
            @click="rolls.rollNpcDamage(entry)"
          >
            {{ npc.damageEntry(entry) }}
          </button>
          <button
            v-if="linkedTechnique(entry)"
            type="button"
            class="inline-roll inline-roll--tech"
            :title="`Cast ${linkedTechnique(entry).name}`"
            @click="rolls.castNpcTechnique(linkedTechnique(entry))"
          >
            {{ linkedTechnique(entry).name }}
          </button>
        </p>
        <p v-if="entry.text" class="entry__text">{{ entry.text }}</p>
        <button
          v-if="section.pool"
          type="button"
          class="post"
          :disabled="!canAfford(section, entry)"
          :title="`Use ${entry.name || 'this'}`"
          @click="rolls.useNpcAction(section.kind, entry)"
        >
          Use
        </button>
        <button
          v-else
          type="button"
          class="post"
          :title="`Post ${entry.name || 'this'} to chat`"
          @click="rolls.postNpcEntry(entry, section.title)"
        >
          Post
        </button>
      </div>

      <NpcTechniques v-if="section.techniques" />
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
  .subline {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0 12px;
    margin-top: 1px;
  }
  .subtitle { margin: 0; font-size: 11px; font-style: italic; color: var(--ps-text-muted); }
  .cr { margin: 0; font-size: 11px; font-weight: 700; color: var(--ps-heading); }
}

.combat {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 12.5px;
  padding-bottom: 7px;
  border-bottom: 1.5px solid rgba(var(--ps-line-soft-rgb), 0.35);

  em { @include ps-caption; font-style: normal; margin-right: 3px; }
  small { color: var(--ps-text-muted); font-size: 10.5px; }
}


.abilities {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;
  padding: 8px 0;
  border-bottom: 1.5px solid rgba(var(--ps-line-soft-rgb), 0.35);
}

.ability {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &__abbr { @include ps-caption; font-size: 10px; }

  &__mod, &__save {
    @include ps-well;
    width: 100%;
    height: 24px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ps-derived, var(--ps-heading));
    cursor: pointer;

    &:hover { background: var(--ps-panel-alt); }
  }

  &__save {
    height: 20px;
    font-size: 11px;
    font-weight: 400;
    color: var(--ps-text-muted);

    &.proficient {
      font-weight: 700;
      color: var(--ps-derived, var(--ps-heading));
      border-color: var(--ps-gold-dark);
    }
  }
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

.skills { display: flex; flex-wrap: wrap; gap: 4px; }

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

.pool {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  vertical-align: middle;
}

.pool__text { margin: 0 0 3px; font-style: italic; }

.enraged {
  @include ps-caption;
  font-size: 9px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;

  input { @include ps-pip-check(10px, var(--ps-red)); }
}

.inline-roll--tech { font-style: italic; }

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

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.empty { font-size: 11.5px; color: var(--ps-text-muted); padding: 10px 0 0; margin: 0; }

@media (max-width: 620px) {
  .abilities { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
