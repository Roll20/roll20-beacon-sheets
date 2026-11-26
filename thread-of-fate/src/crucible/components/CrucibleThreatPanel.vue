<template>
  <div class="tof-panel">
    <h3 class="tof-h2">Threat &amp; Balance</h3>

    <div
      v-if="partyCheck"
      class="cru-threat__verdict"
      :class="`cru-threat__verdict--${partyCheck.difficulty}`"
    >
      <strong>{{ difficultyLabel }}</strong>
      <span class="tof-small">
        for {{ partyCheck.partySize }} PCs - enemy threat {{ partyCheck.enemyThreat }} vs budget
        {{ partyCheck.budget }}
      </span>
    </div>

    <template v-if="recommendation">
      <div class="cru-threat__grid tof-small">
        <div>
          <span class="tof-muted">Threat Rating</span> {{ recommendation.threatRatingLow }}-{{
            recommendation.threatRatingHigh
          }}
        </div>
        <div><span class="tof-muted">PB</span> +{{ recommendation.proficiencyBonus }}</div>
        <div>
          <span class="tof-muted">HP</span> {{ recommendation.hitPointsLow }}-{{
            recommendation.hitPointsHigh
          }}
        </div>
        <div>
          <span class="tof-muted">AC</span> {{ recommendation.armorClassLow }}-{{
            recommendation.armorClassHigh
          }}
        </div>
        <div>
          <span class="tof-muted">DPR</span> {{ recommendation.damagePerRoundLow }}-{{
            recommendation.damagePerRoundHigh
          }}
        </div>
        <div>
          <span class="tof-muted">Save DC</span> {{ recommendation.saveDcLow }}-{{
            recommendation.saveDcHigh
          }}
        </div>
        <div><span class="tof-muted">AP</span> {{ recommendation.actionPoints }}</div>
        <div><span class="tof-muted">Apex</span> {{ recommendation.allowApex ? 'Yes' : 'No' }}</div>
      </div>
      <p class="tof-small">{{ recommendation.reason }}</p>
      <p v-for="(w, i) in recommendation.warnings" :key="i" class="tof-warn tof-small">{{ w }}</p>
    </template>

    <details v-if="lines.length" class="cru-threat__math">
      <summary class="tof-small">Show the math</summary>
      <div v-for="(line, i) in lines" :key="i" class="cru-threat__mathline">
        <div class="tof-small">
          <strong>{{ line.label }}: {{ line.value }}</strong>
          <span class="tof-muted"> - {{ line.rule }}</span>
        </div>
        <div
          v-for="(d, j) in line.detail ?? []"
          :key="j"
          class="tof-small tof-muted cru-threat__detail"
        >
          {{ d }}
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ThreatMathLine,
  ThreatRecommendation,
} from '@/crucible/schemas/crucibleThreat.schema';
import { DIFFICULTY_LABELS, type EncounterDifficulty } from '@/crucible/schemas/crucibleCommon';

const props = defineProps<{
  partyCheck: {
    budget: number;
    partySize: number;
    enemyThreat: number;
    difficulty: EncounterDifficulty;
  } | null;
  recommendation: ThreatRecommendation | null;
}>();

const difficultyLabel = computed(() =>
  props.partyCheck ? DIFFICULTY_LABELS[props.partyCheck.difficulty] : '',
);
const lines = computed<ThreatMathLine[]>(() => props.recommendation?.lines ?? []);
</script>

<style scoped lang="scss">
.cru-threat__verdict {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  margin-bottom: 0.6rem;
  border: 1px solid var(--tof-panel-border-strong);
  &--easy {
    color: #9fd89f;
  }
  &--medium {
    color: var(--tof-gold);
  }
  &--hard {
    color: #f0a05a;
  }
  &--deadly {
    color: #f07070;
  }
}
.cru-threat__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem 0.8rem;
  margin-bottom: 0.5rem;
  span.tof-muted {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}
.cru-threat__math {
  margin-top: 0.5rem;
}
.cru-threat__mathline {
  padding: 0.25rem 0;
  border-bottom: 1px dashed var(--tof-panel-border);
}
.cru-threat__detail {
  padding-left: 0.9rem;
}
</style>
