<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Reviewing Your Character</h2>
      <p class="tof-muted">
        Congratulations, you've defined yourself! Let's review the fate you've woven before you step
        into the story.
      </p>
    </div>

    <div class="tof-panel" v-if="errors.length">
      <h3 class="tof-h3 tof-warn" style="margin-top: 0">You seem to be missing some stuff!</h3>
      <p class="tof-warn">Complete everything below so you can start the best story ever:</p>
      <ul class="warnlist">
        <li v-for="(e, i) in errors" :key="i" class="tof-warn">
          <button class="linkbtn" @click="store.visit(e.step)">[{{ STEP_LABELS[e.step] }}]</button>
          {{ e.message }}
        </li>
      </ul>
    </div>
    <div class="tof-panel" v-if="softWarnings.length">
      <ul class="warnlist">
        <li v-for="(wn, i) in softWarnings" :key="i" class="tof-warn--soft">
          <button class="linkbtn" @click="store.visit(wn.step)">
            [{{ STEP_LABELS[wn.step] }}]
          </button>
          {{ wn.message }}
        </li>
      </ul>
    </div>

    <div class="tof-panel summary">
      <div class="summary__head">
        <img v-if="d.bio.avatarImage" :src="d.bio.avatarImage" class="summary__avatar" alt="" />
        <div>
          <h3 class="tof-h3" style="margin: 0">{{ d.identity.name || 'Unnamed' }}</h3>
          <div class="tof-small tof-muted">
            {{ raceLabel }} - {{ philosophyLabel }} - Level {{ store.level }}
          </div>
          <div v-if="d.bio.howYouDie" class="tof-small" style="color: #d98a8a">
            You will die {{ d.bio.howYouDie }}
          </div>
        </div>
        <div class="summary__stats">
          <div>
            <span class="bignum">{{ store.derived.health }}</span
            ><span>Health</span>
          </div>
          <div>
            <span class="bignum">{{ store.derived.stamina }}</span
            ><span>Stamina</span>
          </div>
          <div>
            <span class="bignum">{{ store.derived.armorClass }}</span
            ><span>AC</span>
          </div>
        </div>
      </div>

      <div class="tof-grid tof-grid--2 summary__grid">
        <div>
          <h4 class="tof-h3">Attributes</h4>
          <div v-for="a in ATTRIBUTES" :key="a.key" class="kv">
            <span>{{ a.label }}</span
            ><span>{{ store.finalScores[a.key] }} ({{ fmt(store.modifiers[a.key]) }})</span>
          </div>
        </div>
        <div>
          <h4 class="tof-h3">Classes & Aspects</h4>
          <div v-if="classList.length">
            <div v-for="c in classList" :key="c">{{ c }}</div>
          </div>
          <div v-else class="tof-muted">Level 0, unclassed</div>
          <div v-for="a in aspectList" :key="a" class="tof-small">✦ {{ a }}</div>

          <h4 class="tof-h3">Race</h4>
          <div>{{ raceLabel }}</div>

          <h4 class="tof-h3">Philosophy</h4>
          <div>{{ philosophyLabel }}</div>
        </div>
      </div>

      <div class="summary__grid">
        <h4 class="tof-h3">Background</h4>
        <div v-if="bgList.length">
          <span v-for="b in bgList" :key="b" class="tof-tag">{{ b }}</span>
        </div>
        <div v-else class="tof-muted">No background traits chosen.</div>

        <h4 class="tof-h3">Equipment ({{ d.equipment.setting }})</h4>
        <div>
          <span v-for="item in equipmentList" :key="item" class="tof-tag">{{ item }}</span>
        </div>

        <h4 class="tof-h3">Artes</h4>
        <div v-if="arteList.length">
          <span v-for="a in arteList" :key="a" class="tof-tag">{{ a }}</span>
        </div>
        <div v-else class="tof-muted">
          {{ store.isCaster ? 'No Artes selected.' : 'Not a caster.' }}
        </div>

        <h4 class="tof-h3">Talents</h4>
        <div class="skillgrid">
          <div
            v-for="s in skills"
            :key="s.name"
            class="skillrow"
            :class="{ 'skillrow--prof': s.tier !== 'none' }"
          >
            <span class="skillrow__name">
              <span class="skillrow__dot" :class="`skillrow__dot--${s.tier}`" />{{ s.name }}
            </span>
            <span class="skillrow__bonus"
              >{{ fmt(s.bonus) }} <span class="tof-muted">{{ s.abbr }}</span></span
            >
          </div>
        </div>
        <p class="tof-small tof-muted">
          * proficient - * expertise, aggregated from race, class, background &amp; philosophy.
        </p>

        <h4 class="tof-h3">Defenses, Senses &amp; Speeds</h4>
        <div class="tof-small deflist">
          <div v-if="agg.resistances.length">
            <strong>Resistances:</strong> {{ agg.resistances.join(', ') }}
          </div>
          <div v-if="agg.immunities.length">
            <strong>Immunities:</strong> {{ agg.immunities.join(', ') }}
          </div>
          <div v-if="agg.vulnerabilities.length">
            <strong>Vulnerable:</strong> {{ agg.vulnerabilities.join(', ') }}
          </div>
          <div><strong>Senses:</strong> {{ sensesLine }}</div>
          <div>
            <strong>Movement:</strong> {{ store.derived.movementSpeed
            }}<span v-if="agg.extraSpeeds.length">, plus {{ agg.extraSpeeds.join(', ') }}</span>
          </div>
          <div v-if="agg.effectiveWealth != null">
            <strong>Starting Wealth:</strong> {{ agg.effectiveWealth }}
          </div>
        </div>

        <h4 class="tof-h3">Abilities &amp; Features Gained ({{ agg.abilities.length }})</h4>
        <details>
          <summary class="tof-label" style="cursor: pointer">Show all</summary>
          <div
            v-for="(a, i) in agg.abilities"
            :key="i"
            class="tof-small"
            style="padding: 0.15rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06)"
          >
            <strong>{{ a.name }}</strong> <span class="tof-muted">, {{ a.source }}</span>
          </div>
        </details>
      </div>
    </div>

    <div class="tof-panel finalbar">
      <p v-if="store.ready" class="tof-ok">
        Wowie! You got cool stuff!! Your thread is ready to be woven.
      </p>
      <p v-else class="tof-warn">
        Make sure to complete the required steps above before you begin.
      </p>
      <div class="finalbar__btns">
        <button class="tof-btn tof-btn--primary" :disabled="!store.ready" @click="startStory">
          {{ PRODUCT.finalReviewCta }}
        </button>
        <button class="tof-btn tof-btn--ghost" @click="downloadPdf">Export PDF Sheet</button>
        <button class="tof-btn tof-btn--ghost" @click="downloadJson">Export JSON</button>
        <button class="tof-btn tof-btn--ghost" @click="copySummary">Copy Summary</button>
      </div>
      <p v-if="toast" class="tof-small tof-ok">{{ toast }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { STEP_LABELS } from '@/maker/draftModel';
import { PRODUCT } from '@/maker/data/constants';
import { ATTRIBUTES } from '@/maker/data/attributes';
import { formatModifier } from '@/maker/rules/stats';
import { skillRows } from '@/maker/rules/proficiency';
import { traitAggregation } from '@/maker/rules/aggregation';
import {
  classById,
  raceById,
  philosophyById,
  aspectById,
  armorById,
  shieldById,
  weaponById,
  arteById,
  backgroundTraitById,
  subraceById,
} from '@/maker/data';

const store = useDraftStore();
const d = computed(() => store.draft);
const fmt = formatModifier;
const toast = ref('');

const errors = computed(() => store.warnings.filter((w) => w.severity === 'error'));
const softWarnings = computed(() => store.warnings.filter((w) => w.severity !== 'error'));
const skills = computed(() => skillRows(d.value));
const agg = computed(() => traitAggregation(d.value));
const sensesLine = computed(() => {
  const r = d.value.race.selectedRaceId ? raceById[d.value.race.selectedRaceId] : null;
  const base = r && r.senses !== 'None' ? [r.senses] : [];
  const all = [...base, ...agg.value.senses];
  return all.length ? [...new Set(all)].join(', ') : 'Normal vision';
});

const raceLabel = computed(() => {
  const r = d.value.race.selectedRaceId ? raceById[d.value.race.selectedRaceId] : null;
  if (!r) return 'No race';
  const sub = d.value.race.selectedSubraceId
    ? subraceById(r.id, d.value.race.selectedSubraceId)
    : null;
  return sub ? `${sub.name} ${r.name}` : r.name;
});
const philosophyLabel = computed(() => {
  if (d.value.philosophy.custom) return d.value.philosophy.custom.name || 'Custom Philosophy';
  const p = d.value.philosophy.selectedPhilosophyId
    ? philosophyById[d.value.philosophy.selectedPhilosophyId]
    : null;
  return p ? `${p.name} (${p.title})` : 'No philosophy';
});
const classList = computed(() =>
  d.value.classBuild.classes
    .filter((c) => c.classId)
    .map((c) => `${classById[c.classId]?.name ?? c.classId} ${c.level}`),
);
const aspectList = computed(() =>
  d.value.classBuild.aspects
    .filter((a) => a.aspectId)
    .map((a) => aspectById[a.aspectId]?.name ?? a.aspectId),
);
const bgList = computed(() =>
  d.value.background.selectedTraits.map(
    (t) => `${backgroundTraitById[t.traitId]?.name ?? t.traitId} (${t.cost})`,
  ),
);
const arteList = computed(() =>
  d.value.artes.selectedArteIds.map((id) => arteById[id]?.name ?? id),
);
const equipmentList = computed(() => {
  const items: string[] = [];
  if (d.value.equipment.selectedArmorId)
    items.push(armorById[d.value.equipment.selectedArmorId]?.name);
  if (d.value.equipment.selectedShieldId)
    items.push(shieldById[d.value.equipment.selectedShieldId]?.name);
  d.value.equipment.selectedWeaponIds.forEach((id) => items.push(weaponById[id]?.name));
  Object.values(d.value.equipment.packChoices).forEach((v) => v && items.push(v));
  d.value.equipment.customItems.forEach((v) => items.push(v));
  return items.filter(Boolean);
});

function startStory() {
  if (!store.ready) return;
  store.enterFinale(); // step into the dawn, the Overture finale pulls up the sheet
}
async function downloadPdf() {
  const { exportCharacterPdf } = await import('@/maker/rules/pdfExport');
  await exportCharacterPdf(store.draft);
}
function downloadJson() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(d.value.identity.name || 'character').replace(/\s+/g, '_')}.thread-of-fate.json`;
  a.click();
  URL.revokeObjectURL(url);
}
async function copySummary() {
  const lines = [
    `${d.value.identity.name || 'Unnamed'}, ${raceLabel.value}, ${philosophyLabel.value}, Level ${
      store.level
    }`,
    `HP ${store.derived.health} - Stamina ${store.derived.stamina} - AC ${store.derived.armorClass}`,
    ATTRIBUTES.map(
      (a) => `${a.label} ${store.finalScores[a.key]} (${fmt(store.modifiers[a.key])})`,
    ).join(', '),
    classList.value.join(', '),
  ];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    toast.value = 'Summary copied to clipboard.';
  } catch {
    toast.value = 'Could not access clipboard.';
  }
}
</script>

<style scoped lang="scss">
.warnlist {
  margin: 0.25rem 0 0;
  padding-left: 1rem;
}
.linkbtn {
  background: none;
  border: none;
  color: var(--tof-gold);
  cursor: pointer;
  padding: 0;
  font: inherit;
}
.summary__head {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.summary__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--tof-panel-border-strong);
}
.summary__stats {
  display: flex;
  gap: 1.25rem;
  margin-left: auto;
}
.summary__stats > div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bignum {
  font-family: var(--tof-font-heading);
  font-size: 1.5rem;
  color: var(--tof-gold);
}
.summary__grid {
  margin-top: 0.5rem;
}
.kv {
  display: flex;
  justify-content: space-between;
  padding: 0.15rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.finalbar {
  text-align: center;
}
.finalbar__btns {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.skillgrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.1rem 1.25rem;
  margin: 0.4rem 0;
}
@media (max-width: 720px) {
  .skillgrid {
    grid-template-columns: 1fr;
  }
}
.skillrow {
  display: flex;
  justify-content: space-between;
  padding: 0.12rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.85rem;
}
.skillrow--prof {
  color: var(--tof-cream);
}
.skillrow__name {
  display: flex;
  align-items: center;
}
.skillrow__bonus {
  font-variant-numeric: tabular-nums;
}
.skillrow__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.45rem;
  background: rgba(255, 255, 255, 0.15);
  display: inline-block;
}
.skillrow__dot--proficient {
  background: var(--tof-gold);
}
.skillrow__dot--expert {
  background: #9fe0a6;
  box-shadow: 0 0 6px #9fe0a6;
}
</style>
