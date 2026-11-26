<script setup>
import { computed, ref, watch } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useCatalog, loadCategory } from '@/composables/useCatalog.js'
import { kitOf, equipmentPicks, kitGear, starterWeapon } from '@/builder/equipment.js'
import { weaponProficiencies, keyCurrent } from '@/builder/skills.js'
import { builderSetting, inSetting } from '@/builder/setting.js'
import { compendiumUrl } from '@/builder/catalog.js'
import { openCompendium } from '@/utility/openCompendium.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import PendingChoice from '../PendingChoice.vue'
import StepFlag from '../StepFlag.vue'

const builder = useBuilderStore()
const { lists } = useCatalog()

const CATEGORIES = { species: 'Species', background: 'Backgrounds', profession: 'Professions' }
for (const category of [...Object.values(CATEGORIES), 'Items']) loadCategory(category)

const loading = computed(() => [...Object.values(CATEGORIES), 'Items'].some((c) => !lists[c] || lists[c].status === 'loading'))

const pages = computed(() => Object.fromEntries(Object.entries(CATEGORIES).map(([kind, category]) => {
  const name = builder.draft[kind]?.pageName
  return [kind, name ? (lists[category]?.options ?? []).find((o) => o.pageName === name) ?? null : null]
})))

const chapterUrl = computed(() => compendiumUrl({
  pageName: 'Equipment', categoryName: 'Rules', expansionId: pages.value.profession?.expansionId ?? '',
}))

const equipment = computed(() => builder.draft.equipment)
const kit = computed(() => kitOf(pages.value.profession))
const chosen = computed(() => equipment.value.picks)

const kitPicks = computed(() => (equipment.value.kit === 'a' ? kit.value?.a?.picks ?? [] : []))
const picks = computed(() => equipmentPicks({
  professionName: builder.draft.profession?.pageName ?? '',
  kitPicks: kitPicks.value,
  backgroundName: builder.draft.background?.pageName ?? '',
  backgroundPicks: pages.value.background?.payload?.equipmentPicks ?? [],
}, chosen.value))

const itemName = (payload) => payload?.item?.name ?? payload?.armor?.name ?? payload?.shield?.name ?? ''
const kitLines = computed(() => ({
  a: [
    ...(kit.value?.a?.items ?? []).map(itemName).filter(Boolean),
    ...kitGear(kit.value?.a?.picks ?? []).map((g) => `${g.name} (${g.quantity})`),
    ...(kit.value?.a?.choices ?? []).filter((c) => !/ammunition/i.test(c)),
  ],
  b: [],
}))

const setKit = (id) => {
  if (equipment.value.kit === id) return
  const keep = Object.fromEntries(Object.entries(chosen.value).filter(([k]) => !k.startsWith('profession:')))
  builder.draft.equipment = { ...equipment.value, kit: id, picks: keep }
}

const showAll = ref(false)
const proficient = computed(() => new Set(weaponProficiencies(pages.value).map((w) => w.id)))
const setting = computed(() => builderSetting(builder.draft, sharedSettings.setting))
const weapons = computed(() => (lists.Items?.options ?? [])
  .filter((o) => inSetting(o, setting.value))
  .map(starterWeapon).filter(Boolean)
  .sort((a, b) => a.weaponType.localeCompare(b.weaponType) || a.name.localeCompare(b.name)))
const weaponOptions = computed(() => weapons.value
  .filter((w) => showAll.value || proficient.value.has(w.type))
  .map((w) => ({
    value: w.name,
    name: setting.value === 'any' && w.setting ? `${w.name} (${w.weaponType}, ${w.setting})` : `${w.name} (${w.weaponType})`,
  })))

const asChoice = (p) => ({
  key: p.key,
  label: p.label.charAt(0).toUpperCase() + p.label.slice(1),
  count: p.count,
  options: p.type === 'weapon' ? weaponOptions.value
    : p.type === 'option' ? p.options.map((o) => ({ value: o, name: o }))
      : (p.from ?? []).map((n) => ({ value: n, name: n })),
})

const setPick = (key, value) => {
  const next = { ...chosen.value }
  if (value) next[key] = value
  else delete next[key]
  for (const k of Object.keys(next)) if (k.startsWith(`${key}:`)) delete next[k]
  builder.draft.equipment.picks = next
}

const slots = (p) => String(chosen.value[p.key] ?? '').split('|').slice(0, p.count)
const slotsDone = (p) => slots(p).filter(Boolean).length >= p.count
const setSlot = (p, i, value) => {
  const next = Array.from({ length: p.count }, (_, j) => slots(p)[j] ?? '')
  next[i] = value
  setPick(p.key, next.some(Boolean) ? next.join('|') : '')
}

const kitPicksShown = computed(() => picks.value.filter((p) => p.key.startsWith('profession:')))
const backgroundPicksShown = computed(() => picks.value.filter((p) => p.key.startsWith('background:')))

const meseta = computed(() => (pages.value.background?.payload?.meseta ?? 0)
  + (equipment.value.kit ? kit.value?.[equipment.value.kit]?.meseta ?? 0 : 0))

watch([loading, () => builder.draft.profession?.pageName, () => builder.draft.background?.pageName], () => {
  if (loading.value) return
  const kept = Object.fromEntries(Object.entries(chosen.value).filter(([k]) => keyCurrent(builder.draft, k)))
  if (JSON.stringify(kept) !== JSON.stringify(chosen.value)) builder.draft.equipment.picks = kept
}, { immediate: true })

</script>

<template>
  <p v-if="loading" class="status">Loading equipment…</p>
  <p v-else-if="!builder.draft.profession" class="status">Choose a profession first; its starting equipment appears here.</p>

  <div v-else class="equipment">
    <section v-if="kit">
      <h3 class="section-title">
        {{ builder.draft.profession.pageName }} Starting Equipment
        <a
          class="book"
          :href="chapterUrl"
          target="_blank"
          rel="noopener"
          title="Chapter 5: Equipment"
          aria-label="Open Chapter 5: Equipment in the Compendium"
          @click.prevent="openCompendium(chapterUrl)"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M6 2h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h11v-2h2v3a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V4a2 2 0 0 1 2-2Zm2 4v2h8V6H8Z"/></svg>
        </a>
      </h3>
      <div class="kits">
        <button
          v-for="id in ['a', 'b']"
          :key="id"
          type="button"
          class="kit"
          :class="{ 'kit--on': equipment.kit === id }"
          :aria-pressed="equipment.kit === id"
          @click="setKit(id)"
        >
          <span class="kit__head">
            <span class="kit__letter">{{ id.toUpperCase() }}</span>
            <span v-if="equipment.kit === id" class="kit__check">✓</span>
          </span>
          <ul v-if="kitLines[id].length" class="kit__lines">
            <li v-for="line in kitLines[id]" :key="line">{{ line }}</li>
          </ul>
          <span class="kit__meseta">{{ (kit[id]?.meseta ?? 0).toLocaleString() }} mst</span>
        </button>
      </div>

      <div v-if="kitPicksShown.length" class="pending">
        <label v-if="kitPicksShown.some((p) => p.type === 'weapon')" class="show-all">
          <input v-model="showAll" type="checkbox" /> Show All Weapons
        </label>
        <template v-for="(p, n) in kitPicksShown" :key="p.key">
          <div v-if="p.type === 'weapon'" class="slots">
            <StepFlag :done="slotsDone(p)" :mark="n + 1" />
            <span class="slots__label">{{ asChoice(p).label }}</span>
            <select
              v-for="i in p.count"
              :key="i"
              class="slots__select"
              :value="slots(p)[i - 1] ?? ''"
              :aria-label="`Weapon ${i}`"
              @change="setSlot(p, i - 1, $event.target.value)"
            >
              <option value="">Choose…</option>
              <option v-for="o in weaponOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
            </select>
          </div>
          <PendingChoice
            v-else
            :number="n + 1"
            :choice="asChoice(p)"
            :model-value="chosen[p.key] ?? ''"
            @update:model-value="setPick(p.key, $event)"
          />
        </template>
      </div>
    </section>

    <section v-if="pages.background">
      <h3 class="section-title">{{ pages.background.pageName }} Equipment</h3>
      <p class="fixed">
        {{ [...(pages.background.payload?.equipment ?? []).map((e) => e.name), `${(pages.background.payload?.meseta ?? 0).toLocaleString()} mst`].join(', ') }}
      </p>
      <div v-if="backgroundPicksShown.length" class="pending">
        <PendingChoice
          v-for="(p, n) in backgroundPicksShown"
          :key="p.key"
          :number="n + 1"
          :choice="asChoice(p)"
          :model-value="chosen[p.key] ?? ''"
          @update:model-value="setPick(p.key, $event)"
        />
      </div>
    </section>

    <p class="purse">Starting Meseta <strong>{{ meseta.toLocaleString() }} mst</strong></p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.status { margin: 0; padding: 18px 12px; text-align: center; color: var(--ps-text-muted); }

.section-title { @include ps-heading(15px); margin: 12px 0 6px; display: flex; align-items: center; gap: 8px; }

.book {
  display: inline-flex;
  color: var(--ps-heading);
  opacity: 0.8;

  &:hover { opacity: 1; }
}
section:first-child .section-title { margin-top: 0; }

.kits {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
}

.kit {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border: 2px solid var(--ps-line);
  border-radius: 8px;
  background: var(--ps-panel);
  color: var(--ps-text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  &:hover { border-color: var(--ps-gold); }
  &--on,
  &--on:hover { border-color: var(--ps-blue); background: var(--ps-panel-alt); }
}

.kit__head { display: flex; align-items: center; justify-content: space-between; }
.kit__letter { @include ps-heading(18px); }

.kit__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ps-blue);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.kit__lines {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.5;

  li::first-letter { text-transform: uppercase; }
}

.kit__meseta { margin-top: auto; font-weight: 700; font-size: 13px; color: var(--ps-heading); }

.show-all { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; margin: 4px 0; cursor: pointer; }

.slots {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);
}

.slots__label { font-weight: 700; color: var(--ps-heading); font-size: 13px; flex: 1 1 140px; }

.slots__select {
  @include ps-control(26px);
  text-align: left;
  min-width: 180px;
  cursor: pointer;
}

.fixed { margin: 0 0 6px; font-size: 12px; }

.purse {
  margin: 14px 0 0;
  padding-top: 8px;
  border-top: 2px solid var(--ps-line);
  font-size: 13px;

  strong { @include ps-heading(16px); margin-left: 6px; }
}

@media (max-width: 560px) {
  .kits { grid-template-columns: 1fr; }
}
</style>
