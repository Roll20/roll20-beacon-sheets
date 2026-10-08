<script setup>
import { reactive, computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import {
  WEAPON_TYPES, TOOLS, VEHICLES, isWeaponProficient, hasWeaponMastery, weaponTypesFor,
} from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()

const coveredByParent = (type) => !!type.parent && !!sheet.proficiencies.weapon[type.parent]

const custom = (kind) => sheet.proficiencies.custom.filter((c) => c.kind === kind)

const parents = computed(() => weaponTypesFor(sheet.proficiencies).filter((w) => !w.parent))
const parentName = (id) => weaponTypesFor(sheet.proficiencies).find((w) => w.id === id)?.name ?? id

const draft = reactive({ weapon: '', weaponParent: '', tool: '', vehicle: '' })

const add = (kind) => {
  const name = draft[kind].trim()
  if (!name) return
  const parent = kind === 'weapon' ? draft.weaponParent : ''
  if (sheet.addProficiency(kind, { name, parent })) {
    draft[kind] = ''
    if (kind === 'weapon') draft.weaponParent = ''
  }
}
</script>

<template>
  <SheetModal :open="open" title="Proficiencies" width="460px" @close="$emit('close')">
    <h3 class="rule">Weapons</h3>
    <div class="weapons">
      <span class="head">Type</span>
      <span class="head">Proficient</span>
      <span class="head">Mastery</span>

      <template v-for="type in WEAPON_TYPES" :key="type.id">
        <span class="type" :class="{ variant: type.parent }">{{ type.name }}</span>
        <button
          type="button"
          class="toggle"
          :aria-pressed="isWeaponProficient(sheet.proficiencies, type.id) ? 'true' : 'false'"
          :disabled="coveredByParent(type)"
          :aria-label="`${type.name} proficiency`"
          @click="sheet.toggleProficiency('weapon', type.id)"
        />
        <button
          type="button"
          class="toggle toggle--mastery"
          :aria-pressed="hasWeaponMastery(sheet.proficiencies, type.id) ? 'true' : 'false'"
          :disabled="!isWeaponProficient(sheet.proficiencies, type.id) || (coveredByParent(type) && !!sheet.proficiencies.mastery[type.parent])"
          :aria-label="`${type.name} mastery`"
          @click="sheet.toggleProficiency('mastery', type.id)"
        />
      </template>

      <template v-for="c in custom('weapon')" :key="c._id">
        <span class="type type--custom" :class="{ variant: c.parent }">
          {{ c.name }}<small v-if="c.parent"> ({{ parentName(c.parent) }})</small>
        </span>
        <button
          type="button"
          class="remove"
          :aria-label="`Remove ${c.name}`"
          title="Remove"
          @click="sheet.removeCustomProficiency(c._id)"
        >&times;</button>
        <button
          type="button"
          class="toggle toggle--mastery"
          :aria-pressed="hasWeaponMastery(sheet.proficiencies, c.id) ? 'true' : 'false'"
          :aria-label="`${c.name} mastery`"
          @click="sheet.toggleCustomMastery(c._id)"
        />
      </template>
    </div>

    <form class="add" @submit.prevent="add('weapon')">
      <input v-model="draft.weapon" placeholder="Weapon type" aria-label="New weapon type" />
      <select v-model="draft.weaponParent" aria-label="Variant of">
        <option value="">Base type</option>
        <option v-for="w in parents" :key="w.id" :value="w.id">Variant of {{ w.name }}</option>
      </select>
      <button type="submit" class="add__go">+ Add</button>
    </form>

    <label class="other">
      <span>Other Weapons</span>
      <input v-model="sheet.proficiencies.otherWeapons" />
    </label>

    <h3 class="rule">Tools</h3>
    <div class="chips">
      <button
        v-for="t in TOOLS"
        :key="t.id"
        type="button"
        class="chip"
        :aria-pressed="sheet.proficiencies.tool[t.id] ? 'true' : 'false'"
        @click="sheet.toggleProficiency('tool', t.id)"
      >
        {{ t.name }}
      </button>
      <span v-for="c in custom('tool')" :key="c._id" class="chip chip--custom">
        {{ c.name }}
        <button type="button" class="remove" :aria-label="`Remove ${c.name}`" title="Remove"
                @click="sheet.removeCustomProficiency(c._id)">&times;</button>
      </span>
    </div>
    <form class="add" @submit.prevent="add('tool')">
      <input v-model="draft.tool" placeholder="Tool" aria-label="New tool" />
      <button type="submit" class="add__go">+ Add</button>
    </form>

    <h3 class="rule">Vehicles</h3>
    <div class="chips">
      <button
        v-for="v in VEHICLES"
        :key="v.id"
        type="button"
        class="chip"
        :aria-pressed="sheet.proficiencies.vehicle[v.id] ? 'true' : 'false'"
        @click="sheet.toggleProficiency('vehicle', v.id)"
      >
        {{ v.name }}
      </button>
      <span v-for="c in custom('vehicle')" :key="c._id" class="chip chip--custom">
        {{ c.name }}
        <button type="button" class="remove" :aria-label="`Remove ${c.name}`" title="Remove"
                @click="sheet.removeCustomProficiency(c._id)">&times;</button>
      </span>
    </div>
    <form class="add" @submit.prevent="add('vehicle')">
      <input v-model="draft.vehicle" placeholder="Vehicle type" aria-label="New vehicle type" />
      <button type="submit" class="add__go">+ Add</button>
    </form>

    <label class="other">
      <span>Other Tools / Vehicles</span>
      <input v-model="sheet.proficiencies.otherTools" />
    </label>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.rule {
  @include ps-caption;
  margin: 10px 0 5px;
  padding-bottom: 1px;
  border-bottom: 1px solid var(--ps-gold);
  font-size: 10px;

  &:first-child { margin-top: 0; }
}

.weapons {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 70px 70px;
  align-items: center;
  row-gap: 2px;
}

.head {
  @include ps-caption;
  font-size: 9px;
  text-align: center;

  &:first-child { text-align: left; }
}

.type {
  font-size: 11px;
  font-weight: 700;
  color: var(--ps-text);

  &.variant { padding-left: 12px; font-weight: 400; }
  small { font-weight: 400; color: var(--ps-text-muted); }
}

.toggle {
  justify-self: center;
  width: 13px;
  height: 13px;
  padding: 0;
  border: 1px solid var(--ps-line);
  border-radius: 3px;
  background: var(--ps-field);
  cursor: pointer;

  &[aria-pressed='true'] { background: var(--ps-blue); border-color: var(--ps-blue); }
  &--mastery[aria-pressed='true'] { background: var(--ps-gold); border-color: var(--ps-gold-dark); }
  &:disabled { cursor: default; opacity: 0.45; }
}

.remove {
  @include ps-icon-button(13px, var(--ps-red));
  justify-self: center;
  color: var(--ps-red);
  padding: 0 2px;
}

.chips {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 5px;
}

.chip {
  @include ps-chip(true);
  justify-content: center;
  padding: 4px 6px;
  font-size: 10px;
  white-space: normal;
  text-align: center;

  &--custom {
    gap: 4px;
    cursor: default;
    background: var(--ps-fill);
    border-color: var(--ps-fill);
    color: var(--ps-on-fill);

    &:hover { background: var(--ps-fill); }
    .remove { color: var(--ps-on-fill); }
  }
}

.add {
  display: flex;
  gap: 5px;
  margin-top: 6px;

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

.other {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;

  > span { @include ps-caption; font-size: 9px; }

  input {
    @include ps-control(24px);
    text-align: left;
    padding: 0 6px;
  }
}
</style>
