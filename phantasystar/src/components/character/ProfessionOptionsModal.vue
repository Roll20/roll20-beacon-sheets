<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useAppStore } from '@/stores/index.js'
import {
  ABILITIES, HIT_DICE, INITIATE_TECH_ABILITIES, formatModifier,
} from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'
import ProfessionStatInput from '@/components/shared/ProfessionStatInput.vue'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()
const app = useAppStore()

const setStat = (key, value) => {
  sheet.professionStats = { ...sheet.professionStats, [key]: value }
}

const hitDie = computed({
  get: () => sheet.professionStats.hitDie ?? '',
  set: (value) => setStat('hitDie', value === '' ? null : Number(value)),
})

const techAbility = computed({
  get: () => sheet.professionStats.techAbility ?? '',
  set: (value) => setStat('techAbility', value),
})

const techAbilities = ABILITIES.filter((a) => INITIATE_TECH_ABILITIES.includes(a.id))

const dash = (v) => (v === null || v === undefined ? '—' : v)

const levelRows = computed(() => [
  { stat: 'attackBonus', label: 'Attack Bonus', result: formatModifier(sheet.attackBonusValue) },
  { stat: 'techBonus', label: 'Tech Bonus', result: formatModifier(sheet.techBonusValue) },
  { stat: 'techniquesKnown', label: 'Techniques Known', result: dash(sheet.techniquesKnownValue) },
  { stat: 'maxTechRank', label: 'Max Tech Rank', result: dash(sheet.maxTechRankValue) },
  { stat: 'advancedRank', label: 'Advanced Rank', result: dash(sheet.advancedRankValue) },
  { stat: 'maxTP', label: 'Max TP', result: sheet.maxTP },
])
</script>

<template>
  <SheetModal :open="open" title="Profession Options" width="460px" @close="$emit('close')">
    <div class="rows">
      <label class="row">
        <span class="name">Hit Die</span>
        <select v-model="hitDie" class="control">
          <option value="">&mdash;</option>
          <option v-for="d in HIT_DICE" :key="d" :value="d">d{{ d }}</option>
        </select>
        <span class="result" />
      </label>

      <label class="row">
        <span class="name">Tech Ability</span>
        <select v-model="techAbility" class="control">
          <option value="">None</option>
          <option v-for="a in techAbilities" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
        <span class="result" />
      </label>

      <div class="row row--saves">
        <span class="name">Saving Throws</span>
        <div class="saves">
          <label v-for="a in ABILITIES" :key="a.id" class="save">
            <input
              type="checkbox"
              :checked="!!sheet.saveProficiencies[a.id]"
              @change="sheet.toggleSaveProficiency(a.id)"
            />
            <span>{{ a.abbr }}</span>
          </label>
        </div>
      </div>
    </div>

    <h3 class="sub">Level {{ sheet.effectiveLevel }}</h3>
    <div class="rows">
      <label v-for="r in levelRows" :key="r.stat" class="row">
        <span class="name">{{ r.label }}</span>
        <ProfessionStatInput :stat="r.stat" :label="r.label" class="control control--num" />
        <span class="result">{{ r.result }}</span>
      </label>

      <div v-if="sheet.hasProfessionTable" class="row">
        <span class="name">Level Table</span>
        <span class="table-state">Compendium</span>
        <ConfirmDelete class="del" title="Remove the level table" @confirm="sheet.clearProfessionTable()" />
      </div>
    </div>

    <h3 class="sub">{{ sheet.profession || 'Profession' }}</h3>
    <div class="rows">
      <label class="row row--check">
        <span class="name">Starting Equipment Taken</span>
        <input v-model="sheet.startingEquipmentTaken" type="checkbox" class="check" />
      </label>
      <div v-if="sheet.path" class="row">
        <span class="name">Path</span>
        <span class="table-state">{{ sheet.path }}</span>
        <ConfirmDelete class="del" title="Remove the path" @confirm="app.removePath()" />
      </div>
      <div v-if="sheet.profession" class="row">
        <span class="name">Profession</span>
        <span class="table-state">{{ sheet.profession }}</span>
        <ConfirmDelete class="del" title="Remove the profession" @confirm="app.removeProfession()" />
      </div>
    </div>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.rows { display: flex; flex-direction: column; }

.row {
  @include ps-list-row;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px 44px;
  gap: var(--ps-gap);
  align-items: center;

  &--saves { grid-template-columns: minmax(0, 1fr) auto; }
  &--check { grid-template-columns: minmax(0, 1fr) auto; cursor: pointer; }
}

.name { font-size: var(--ps-fs-body); color: var(--ps-text); }

.control { @include ps-control; }
.control--num { text-align: center; }

.control.changed { border-color: var(--ps-gold-dark); font-weight: 700; }

.result {
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  color: var(--ps-heading);
}

.saves { display: flex; flex-wrap: wrap; gap: 4px 10px; justify-content: flex-end; }

.save {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;

  input { @include ps-pip-check(13px); }
  span { @include ps-caption; font-size: 9.5px; }
}

.sub {
  @include ps-list-head;
  margin: 12px 0 4px;
}

.check { @include ps-pip-check(14px); }

.table-state { font-size: var(--ps-fs-body); color: var(--ps-text-muted); text-align: center; }

.del {
  justify-self: center;
  border: none;
  background: none;
  color: var(--ps-text-muted);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;

  &:hover { color: var(--ps-red); }
}
</style>
