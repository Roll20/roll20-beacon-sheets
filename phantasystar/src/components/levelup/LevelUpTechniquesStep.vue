<script setup>
import { computed, ref } from 'vue'
import { useLevelUp } from '@/composables/useLevelUp.js'
import { levelUpPools, levelUpEligible } from '@/builder/levelUp.js'
import { openCompendium } from '@/utility/openCompendium.js'
import StepFlag from '@/components/builder/StepFlag.vue'

const { store, ctx, paths, techniques } = useLevelUp()
const lu = computed(() => store.lu)
const professionName = computed(() => ctx.value.profession?.pageName ?? '')
const pools = computed(() => levelUpPools(ctx.value, lu.value, paths.value))
const picks = computed(() => lu.value.techniques.picks)

const showAll = ref(false)
const search = ref('')

const picked = (pool) => String(picks.value[pool.key] ?? '').split('|').filter(Boolean)
const elsewhere = (pool, name) => pools.value.some((p) => p.key !== pool.key && picked(p).includes(name))
const full = (pool) => picked(pool).length >= Math.min(pool.count, levelUpEligible(ctx.value, pool, techniques.value).length)

const offered = (pool) => {
  const wanted = search.value.trim().toLowerCase()
  return levelUpEligible(ctx.value, pool, techniques.value, { showAll: showAll.value })
    .filter((t) => !wanted || t.name.toLowerCase().includes(wanted) || picked(pool).includes(t.name))
}

const ranks = (pool) => (pool.minRank === pool.maxRank ? `Rank ${pool.minRank}` : `Ranks ${pool.minRank}–${pool.maxRank}`)

const toggle = (pool, name) => {
  const now = picked(pool)
  const next = now.includes(name) ? now.filter((n) => n !== name) : now.length >= pool.count ? null : [...now, name]
  if (!next) return
  const all = { ...picks.value }
  if (next.length) all[pool.key] = next.join('|')
  else delete all[pool.key]
  lu.value.techniques.picks = all
}

const open = ref({})
const toggleOpen = (key) => { open.value = { ...open.value, [key]: !open.value[key] } }
</script>

<template>
  <div class="techniques">
    <p v-if="!pools.length" class="status">No new techniques to choose at these levels.</p>

    <template v-else>
      <div class="tools">
        <input v-model="search" type="search" class="search" placeholder="Search" aria-label="Search techniques" />
        <label class="show-all"><input v-model="showAll" type="checkbox" /> Show All Professions</label>
      </div>

      <section v-for="(pool, n) in pools" :key="pool.key" class="pool">
        <header class="pool__head">
          <StepFlag :done="full(pool)" :mark="n + 1" />
          <span class="pool__label">{{ pool.label }}</span>
          <span class="pool__ranks">{{ ranks(pool) }}</span>
          <span class="pool__count">{{ picked(pool).length }}/{{ pool.count }}</span>
        </header>
        <ul class="rows">
          <li v-for="t in offered(pool)" :key="t.name" class="row" :class="{ 'row--on': picked(pool).includes(t.name) }">
            <button
              type="button"
              class="pick"
              :aria-pressed="picked(pool).includes(t.name)"
              :aria-label="`${picked(pool).includes(t.name) ? 'Remove' : 'Choose'} ${t.name}`"
              :disabled="!picked(pool).includes(t.name) && (picked(pool).length >= pool.count || elsewhere(pool, t.name))"
              @click="toggle(pool, t.name)"
            >{{ picked(pool).includes(t.name) ? '✓' : '' }}</button>
            <button type="button" class="row__name" :aria-expanded="!!open[`${pool.key}|${t.name}`]" @click="toggleOpen(`${pool.key}|${t.name}`)">
              {{ t.name }}
            </button>
            <span class="row__rank">{{ t.rank === 0 ? 'Prime' : `Rank ${t.rank}` }}</span>
            <span class="row__meta">{{ [t.castingTime, t.range, t.duration].filter(Boolean).join(' · ') }}</span>
            <span v-if="!t.professions.includes(pool.profession || professionName)" class="row__other" :title="t.professions.join(', ')">Other List</span>
            <div v-if="open[`${pool.key}|${t.name}`]" class="row__text">
              <p v-for="(para, i) in t.text" :key="i">{{ para }}</p>
              <a v-if="t.url" class="book" :href="t.url" target="_blank" rel="noopener" @click.prevent="openCompendium(t.url)">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M6 2h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h11v-2h2v3a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V4a2 2 0 0 1 2-2Zm2 4v2h8V6H8Z"/></svg>
                Open in Compendium
              </a>
            </div>
          </li>
          <li v-if="!offered(pool).length" class="empty">No techniques match.</li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.status { margin: 0; padding: 18px 12px; text-align: center; color: var(--ps-text-muted); }
.status--error { color: var(--ps-red); }

.section-title { @include ps-heading(15px); margin: 0 0 6px; }

.granted { margin-bottom: 12px; }
.granted__list { display: flex; flex-wrap: wrap; gap: 4px; margin: 0; }
.chip { @include ps-chip; font-size: 10.5px; }

.tools {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.search {
  @include ps-control(26px);
  text-align: left;
  padding: 0 8px;
  width: 200px;
}

.show-all { font-size: 12px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }

.pool { margin-bottom: 14px; }

.pool__head {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 2px;
  background: var(--ps-paper);
  border-bottom: 2px solid var(--ps-line);
}

.pool__label { @include ps-heading(14px); }
.pool__ranks { @include ps-chip; }
.pool__count { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--ps-text-muted); }

.rows { list-style: none; margin: 0; padding: 0; }

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  padding: 4px 2px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);

  &--on { background: var(--ps-panel-alt); }
}

.pick {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1.5px solid var(--ps-line);
  border-radius: 4px;
  background: var(--ps-field);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;

  &[aria-pressed='true'] { background: var(--ps-blue); border-color: var(--ps-blue); }
  &:disabled { opacity: 0.35; cursor: default; }
}

.row__name {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  color: var(--ps-heading);
  min-width: 110px;
  text-align: left;

  &:hover { text-decoration: underline; }
}

.row__rank { @include ps-chip; }
.row__meta { font-size: 11px; color: var(--ps-text-muted); }
.row__other { @include ps-chip; color: var(--ps-gold-dark); }

.row__text {
  flex-basis: 100%;
  padding: 2px 0 4px 28px;
  font-size: 12px;
  line-height: 1.5;

  p { margin: 0 0 4px; }
}

.book {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ps-heading);
  text-decoration: none;

  &:hover { text-decoration: underline; }
}

.empty { padding: 8px 4px; font-size: 12px; color: var(--ps-text-muted); }

</style>
