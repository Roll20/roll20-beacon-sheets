<script setup>
import { useCharacterStore } from '@/stores/characterStore.js'
import { ABILITIES } from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()
</script>

<template>
  <SheetModal :open="open" title="Skill Options" width="560px" @close="$emit('close')">
    <div class="head">
      <span>Skill</span>
      <span>Ability</span>
      <span>Other Bonus</span>
    </div>

    <div class="rows">
      <div
        v-for="(skill, i) in sheet.skillRoster"
        :key="skill.id"
        class="row"
        :class="{ odd: i % 2 === 1 }"
      >
        <label :for="`skill-ability-${skill.id}`" class="name">{{ skill.name }}</label>

        <select
          :id="`skill-ability-${skill.id}`"
          class="ability"
          :class="{ changed: skill.overridden }"
          :value="skill.ability"
          @change="sheet.setSkillAbility(skill.id, $event.target.value)"
        >
          <option v-for="ability in ABILITIES" :key="ability.id" :value="ability.id">
            {{ ability.name }}
          </option>
        </select>

        <input
          class="misc"
          type="number"
          :aria-label="`${skill.name} other bonus`"
          :value="sheet.skills[skill.id].misc"
          @input="sheet.setSkillMisc(skill.id, $event.target.value)"
        />
      </div>
    </div>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.head,
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(96px, 150px) 64px;
  gap: var(--ps-gap);
  align-items: center;
}

.head { @include ps-list-head; }

.rows { display: flex; flex-direction: column; }

.row { @include ps-list-row; }

.name {
  font-size: var(--ps-fs-body);
  color: var(--ps-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ability,
.misc { @include ps-control; }

.ability.changed { border-color: var(--ps-gold-dark); font-weight: 700; }

.misc { text-align: center; }

@media (max-width: 520px) {
  .head { display: none; }

  .row {
    grid-template-columns: minmax(0, 1fr) 64px;
    row-gap: 2px;
    padding: 6px 4px;
  }

  .name { grid-column: 1 / -1; font-weight: 700; }
}
</style>
