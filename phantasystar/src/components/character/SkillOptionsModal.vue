<script setup>
import { computed, reactive } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { ABILITIES, MAX_CUSTOM_SKILLS } from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()

const draft = reactive({ name: '', ability: 'intelligence' })

const canAdd = computed(() => sheet.customSkills.length < MAX_CUSTOM_SKILLS)

const add = () => {
  const name = draft.name.trim()
  if (!name) return
  sheet.addCustomSkill({ name, ability: draft.ability })
  draft.name = ''
}

const customName = (id) => sheet.customSkills.find((c) => c._id === id)?.name ?? ''
</script>

<template>
  <SheetModal :open="open" title="Skill Options" width="560px" @close="$emit('close')">
    <div class="head">
      <span>Skill</span>
      <span>Ability</span>
      <span>Other Bonus</span>
      <span>Double Ranks</span>
      <span />
    </div>

    <div class="rows">
      <div
        v-for="(skill, i) in sheet.skillRoster"
        :key="skill.id"
        class="row"
        :class="{ odd: i % 2 === 1 }"
      >
        <input
          v-if="skill.custom"
          :id="`skill-name-${skill.id}`"
          class="name name--edit"
          :aria-label="`${skill.name} name`"
          :value="customName(skill.id)"
          placeholder="New Skill"
          @input="sheet.renameCustomSkill(skill.id, $event.target.value)"
        />
        <label v-else :for="`skill-ability-${skill.id}`" class="name">{{ skill.name }}</label>

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

        <label class="double">
          <input
            type="checkbox"
            :aria-label="`${skill.name} double ranks`"
            :checked="!!sheet.skills[skill.id].doubled"
            @change="sheet.setSkillDoubled(skill.id, $event.target.checked)"
          />
        </label>

        <button
          v-if="skill.custom"
          type="button"
          class="remove"
          :aria-label="`Remove ${skill.name}`"
          title="Remove"
          @click="sheet.removeCustomSkill(skill.id)"
        >&times;</button>
        <span v-else />
      </div>
    </div>

    <form v-if="canAdd" class="add" @submit.prevent="add">
      <input v-model="draft.name" placeholder="Skill" aria-label="New skill" />
      <select v-model="draft.ability" aria-label="New skill ability">
        <option v-for="ability in ABILITIES" :key="ability.id" :value="ability.id">
          {{ ability.name }}
        </option>
      </select>
      <button type="submit" class="add__go">+ Add</button>
    </form>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.head,
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(96px, 150px) 64px 84px 18px;
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

.name--edit { @include ps-control; text-align: left; padding: 0 6px; }

.ability,
.misc { @include ps-control; }

.ability.changed { border-color: var(--ps-gold-dark); font-weight: 700; }

.misc { text-align: center; }

.double {
  display: flex;
  justify-content: center;
  cursor: pointer;

  input { cursor: pointer; }
}

.remove {
  @include ps-icon-button(13px, var(--ps-red));
  justify-self: center;
  color: var(--ps-red);
  padding: 0 2px;
}

.add {
  display: flex;
  gap: 5px;
  margin-top: 8px;

  input, select { @include ps-control(24px); text-align: left; padding: 0 6px; }
  input { flex: 1 1 auto; }
  select { flex: 0 1 150px; }

  &__go {
    @include ps-caption;
    flex: 0 0 auto;
    font-size: 9px;
    background: var(--ps-field);
    border: var(--ps-border-thin);
    border-radius: var(--ps-radius-sm);
    padding: 0 8px;
    cursor: pointer;

    &:hover { background: var(--ps-panel-alt); }
  }
}

@media (max-width: 520px) {
  .head { display: none; }

  .row {
    grid-template-columns: minmax(0, 1fr) 64px 32px 18px;
    row-gap: 2px;
    padding: 6px 4px;
  }

  .name { grid-column: 1 / -1; font-weight: 700; }
}
</style>
