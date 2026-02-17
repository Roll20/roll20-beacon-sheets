<template>
  <Teleport to="body">
    <div v-if="show" class="modal-mask" @click.self="$emit('close')">
      <div class="modal-container taintedgrail">
        <div class="modal-header">
          <h3>{{ selectedStatLabel }} Bonus Editor</h3>
          <button class="btn-close" aria-label="Close bonus editor" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="formula-block">
            <div class="formula-title">Current Stance: {{ currentStanceLabel }}</div>
            <div class="formula-rule" v-if="props.stat === 'potential'">
              Potential is based on creativity score (>= 5 -> 3, >= 2 -> 2, otherwise 1).
            </div>
            <div class="formula-line" v-if="props.stat === 'potential'">
              Potential = {{ character.potentialBase }} + {{ currentBonuses.potential }} = {{ character.potential }}
            </div>
            <div class="formula-rule" v-if="props.stat === 'defense'">
              Base formula: Reason + Awareness + 5 <br />
              Modifier:
              <span v-if="currentStanceLabel === 'Standard'">0 <br /></span>
              <span v-if="currentStanceLabel === 'Offensive'">Base - Potential <br /></span>
              <span v-if="currentStanceLabel === 'Defensive' || currentStanceLabel === 'Movement'">Base + Potential <br /></span>
            </div>
            <div class="formula-line" v-if="props.stat === 'defense'">
              Defense = {{ character.standardDefense }} + {{ defenseModifierDisplay }} + {{ currentBonuses.defense }} =
              {{ character.defense }}
            </div>
            <div class="formula-rule" v-if="props.stat === 'speed'">Base rule: Speed base = Combativeness + Awareness.</div>
            <div class="formula-line" v-if="props.stat === 'speed'">
              Speed = {{ character.speedBase }} + {{ currentBonuses.speed }} = {{ character.speed }}
            </div>
          </div>

          <table class="combat-bonus-table">
            <thead>
              <tr>
                <th>Stance</th>
                <th>{{ selectedStatLabel }} Bonus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stance in stanceRows" :key="stance.key" :class="{ 'is-current-stance': stance.key === character.fightingStance }">
                <td>{{ stance.label }}</td>
                <td>
                  <input
                    type="number"
                    :value="character.combatBonuses[stance.key][props.stat]"
                    @input="(event) => updateBonus(stance.key, props.stat, event)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore, type FightingStance } from '@/sheet/stores/character/characterStore';

const props = defineProps<{
  show: boolean;
  stat: 'potential' | 'defense' | 'speed';
}>();

defineEmits<{
  close: [];
}>();

const character = useCharacterStore();

const stanceRows: { key: FightingStance; label: string }[] = [
  { key: 'standard', label: 'Standard' },
  { key: 'offensive', label: 'Offensive' },
  { key: 'defensive', label: 'Defensive' },
  { key: 'movement', label: 'Movement' },
];

const currentStanceLabel = computed(() => {
  const current = stanceRows.find((stance) => stance.key === character.fightingStance);
  return current?.label ?? 'Standard';
});

const currentBonuses = computed(() => {
  return character.combatBonuses[character.fightingStance];
});

const selectedStatLabel = computed(() => {
  if (props.stat === 'defense') return 'Defense';
  if (props.stat === 'speed') return 'Speed';
  return 'Potential';
});

const defenseModifierDisplay = computed(() => {
  const modifier = character.defenseStanceModifier;
  if (modifier === 0) {
    return '0';
  }

  return modifier > 0 ? `+${modifier}` : `${modifier}`;
});

const updateBonus = (stance: FightingStance, stat: 'potential' | 'defense' | 'speed', event: Event) => {
  const target = event.target as HTMLInputElement;
  character.setCombatBonus(stance, stat, Number(target.value) || 0);
};
</script>

<style scoped lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  width: min(500px, 92vw);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.modal-header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0.75rem 1rem 1rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:before {
  content: '×';
  font-size: 1.5rem;
  line-height: 1;
}

.btn-close:hover {
  color: #333;
}

.formula-block {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.02);
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
}

.formula-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.formula-line {
  margin-top: 1rem;
  margin-bottom: 0.15rem;
  font-size: 1rem;
  color: #4d3921;
}

.formula-rule {
  margin-bottom: 0.2rem;
  font-size: 0.82rem;
  color: #5f5f5f;
}

.combat-bonus-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.combat-bonus-table th,
.combat-bonus-table td {
  padding: 0.35rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.combat-bonus-table th {
  background-color: rgba(0, 0, 0, 0.5);
  color: #f0f0e0;
  font-weight: 600;
  text-align: center;
}

.combat-bonus-table tbody tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.05);
}

.combat-bonus-table .is-current-stance {
  background-color: rgba(0, 0, 0, 0.08) !important;
  border-left: 3px solid rgba(0, 0, 0, 0.25);
}

.combat-bonus-table td {
  vertical-align: middle;
}

.combat-bonus-table td:nth-child(2) {
  text-align: center;
}

.combat-bonus-table input {
  width: 72px;
  margin: 0 auto;
  padding: 0.25rem;
  border: 1px solid #7a7971;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
