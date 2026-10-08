<script setup>
import { ref } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { ABILITIES, formatModifier } from '@/rules/index.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import RankPips from '@/components/shared/RankPips.vue'
import SkillOptionsModal from './SkillOptionsModal.vue'

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const options = ref(false)

const abbrFor = (abilityId) => ABILITIES.find((a) => a.id === abilityId)?.abbr ?? ''
</script>

<template>
  <SheetPanel title="Skills">
    <template #actions>
      <button type="button" class="gear" title="Skill options" @click="options = true">
        &#9881;
      </button>
    </template>

    <div class="head">
      <span>Skill Name</span>
      <span class="ranks-head">+ Skill Ranks</span>
      <span>Modifier</span>
    </div>

    <div class="rows">
      <div
        v-for="(skill, i) in sheet.skillRoster"
        :key="skill.id"
        class="row"
        :class="{ odd: i % 2 === 1 }"
      >
        <button
          type="button"
          class="name"
          :title="`${skill.name} check`"
          @click="rolls.rollSkill(skill.id)"
        >
          {{ skill.name }} <span class="abil">({{ abbrFor(skill.ability) }})</span>
        </button>

        <RankPips
          :ranks="sheet.skills[skill.id].ranks"
          :cap="sheet.skillRankCap"
          @set="(n) => sheet.setSkillRanks(skill.id, n)"
        />

        <button
          type="button"
          class="mod"
          :title="`${skill.name} check`"
          @click="rolls.rollSkill(skill.id)"
        >
          {{ formatModifier(sheet.skillTotals[skill.id]) }}
        </button>
      </div>
    </div>

    <div class="foot">Max rank at level {{ sheet.effectiveLevel }}: {{ sheet.skillRankCap }}</div>

    <SkillOptionsModal :open="options" @close="options = false" />
  </SheetPanel>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.head {
  @include ps-list-head;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 46px;
  gap: 6px;
  align-items: center;
  .ranks-head { text-align: center; }
}

.gear { @include ps-gear-button; }

.rows { display: flex; flex-direction: column; }

.row {
  @include ps-list-row(25px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 46px;
  gap: 6px;
  align-items: center;
  padding: 2px 4px;
}

.name {
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--ps-fs-body);
  color: var(--ps-text);

  &:hover { color: var(--ps-blue); text-decoration: underline; }

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .abil { color: var(--ps-text-muted); font-size: 11px; }
}

.mod {
  @include ps-well;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  font-weight: 700;
  font-size: var(--ps-fs-body);
  cursor: pointer;
  color: var(--ps-derived, var(--ps-heading));

  &:hover { background: var(--ps-panel-alt); }
}

.foot {
  @include ps-caption;
  font-weight: 400;
  text-transform: none;
  color: var(--ps-text-muted);
  text-align: right;
  padding-top: 4px;
}
</style>
