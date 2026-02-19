<template>
  <teleport to="body">
    <div v-if="store.isOpen" class="roll-dialog__overlay" @click.self="store.close">
      <div class="roll-dialog">
        <div class="roll-dialog__header">
          <h3 class="roll-dialog__title">{{ store.rollArgs?.rollName }}</h3>
          <button
            class="roll-dialog__close-button"
            @click="store.close"
            :title="t('actions.close')"
          >
            <SvgIcon icon="close" />
          </button>
        </div>

        <div class="roll-dialog__content">
          <div class="roll-dialog__breakdown">
            <h4 class="roll-dialog__breakdown-title">{{ t('rolls.details') }}</h4>
            <ul class="roll-dialog__breakdown-list">
              <li
                v-for="(item, index) in breakdown"
                :key="index"
                class="roll-dialog__breakdown-item"
              >
                <span>{{ item.label }}</span>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="roll-dialog__controls">
          <div v-if="hitDiceCost > 0" class="sanguomancy-section">
            <h4 class="sanguomancy-section__title">
              {{ t('titles.hit-dice') }}
              <span :class="{ 'text-error': currentSelectedTotal !== hitDiceCost }">
                ({{ currentSelectedTotal }} / {{ hitDiceCost }})
              </span>
            </h4>
            <div class="sanguomancy-section__grid">
              <div
                v-for="size in config.hitDieSize"
                :key="size"
                class="sanguomancy-item"
                :class="{
                  'sanguomancy-item--disabled':
                    (availableHitDice[size] || 0) === 0 && hitDiceSelection[size] === 0,
                }"
              >
                <label>{{ size }} ({{ availableHitDice[size] || 0 }})</label>
                <input
                  type="number"
                  v-model.number="hitDiceSelection[size]"
                  min="0"
                  :max="availableHitDice[size] || 0"
                />
              </div>
            </div>
          </div>
          <div class="roll-dialog__roll-type">
            <label for="rollTypeSelect">{{ t('rolls.roll-type') }}</label>
            <select
              v-if="store.rollType === 'd20'"
              id="rollTypeSelect"
              v-model="store.selectedMode"
            >
              <option :value="0">{{ t('rolls.normal') }}</option>
              <option :value="1">{{ t('rolls.advantage') }}</option>
              <option :value="-1">{{ t('rolls.disadvantage') }}</option>
            </select>
            <select
              v-if="store.rollType === 'damage'"
              id="rollTypeSelect"
              v-model="store.selectedMode"
            >
              <option :value="false">{{ t('titles.damage') }}</option>
              <option v-if="(store.rollArgs as DamageRollArgs).canCrit" :value="true">
                {{ t('rolls.crit') }}
              </option>
            </select>
          </div>
          <div class="roll-dialog__bonus-input">
            <label for="additionalBonus">{{ t('titles.additional-bonus') }}</label>
            <input
              id="additionalBonus"
              type="text"
              v-model="store.additionalBonus"
              placeholder="e.g., 5 or 1d4+2"
            />
          </div>
        </div>
        <div class="roll-dialog__config">
          <ToggleSwitch v-model="combat.useRollDialog" :disabled="false" class="toggle-switch--small"/>
          {{ t('descriptions.always-show-roll-dialog') }}
        </div>
        <div class="roll-dialog__footer">
          <button class="button button--primary button--full-width" @click="handleRoll">
            {{ t('actions.roll') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRollDialogStore } from '@/sheet/stores/dialogs/rollDialogStore';
import { useI18n } from 'vue-i18n';
import SvgIcon from './SvgIcon.vue';
import {
  getD20RollBreakdown,
  getDamageRollBreakdown,
  performD20Roll,
  performDamageRoll,
} from '@/utility/roll';
import { createComponentsFromFormula } from '@/utility/diceParser';
import type { D20RollArgs, DamageRollArgs, LabeledBonus } from '@/utility/roll';
import { jsonClone } from '@/utility/jsonTools';
import { type DiceComponent } from '@/rolltemplates/rolltemplates';
import { parseFormula } from '@/sheet/stores/formulas';
import { HitDieSize, useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { config } from '@/config';
import ToggleSwitch from './ToggleSwitch.vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';

const store = useRollDialogStore();
const combat = useCombatStore();
const { t } = useI18n();

const progressionStore = useProgressionStore();
const hitDiceSelection = ref<Record<string, number>>({});
const hitDiceCost = ref(0);

const availableHitDice = computed(() => {
  const used = progressionStore.hitDice.used;
  const total = progressionStore.getHitDice;
  const avail: Record<string, number> = {};
  config.hitDieSize.forEach((size) => {
    const sizeKey = size as HitDieSize;
    const current = used[sizeKey] || 0;
    const max = total[sizeKey] || 0;

    avail[size] = Math.min(current, max);
  });
  return avail;
});

const currentSelectedTotal = computed(() => {
  return Object.values(hitDiceSelection.value).reduce((sum, val) => sum + (val || 0), 0);
});

const resetHitDiceSelection = () => {
  hitDiceSelection.value = config.hitDieSize.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {} as Record<string, number>);
  hitDiceCost.value = 0;
};

const applyGreedySelection = (cost: number) => {
  const sizesDesc = [...config.hitDieSize].reverse();
  let remaining = cost;

  const newSelection = { ...hitDiceSelection.value };

  for (const size of sizesDesc) {
    if (remaining <= 0) break;
    const avail = availableHitDice.value[size] || 0;
    const take = Math.min(avail, remaining);
    newSelection[size] = take;
    remaining -= take;
  }
  hitDiceSelection.value = newSelection;
};

watch(
  () => store.rollArgs,
  (newArgs) => {
    resetHitDiceSelection();
    if (!newArgs || store.rollType !== 'damage') return;

    const args = newArgs as DamageRollArgs;
    let cost = 0;
    args.damageRolls?.forEach((roll: any) => {
      const formula = roll.originalFormula || roll.damage;
      const match = formula.match(/hit-dice:(\d+)/);
      if (match) {
        cost = parseInt(match[1], 10);
      }
    });

    if (cost > 0) {
      hitDiceCost.value = cost;
      applyGreedySelection(cost);
    }
  },
  { immediate: true },
);

const breakdown = computed(() => {
  if (!store.rollArgs) return [];
  const items: { label: string; value: string }[] = [];

  if (store.rollType === 'd20') {
    const args = store.rollArgs as D20RollArgs;
    const { baseComponents, effectRollBonuses } = getD20RollBreakdown(args);

    baseComponents.forEach((bonus) => {
      items.push({
        label: bonus.label,
        value: bonus.value > 0 ? `+${bonus.value}` : String(bonus.value),
      });
    });

    effectRollBonuses.forEach((comp) => {
      const isDice = !!comp.sides;
      const value = isDice ? `${Math.abs(comp.count!)}d${comp.sides}` : String(comp.value);
      const sign = (isDice ? comp.count! : comp.value!) < 0 ? '-' : '+';
      items.push({ label: comp.label!, value: `${sign} ${value.replace('-', '')}` });
    });
  } else if (store.rollType === 'damage') {
    const args = store.rollArgs as DamageRollArgs;
    const { baseComponents, flatBonuses, rollBonuses } = getDamageRollBreakdown(args);

    baseComponents.forEach((comp) => {
      items.push({ label: comp.label, value: String(comp.value) });
    });

    flatBonuses.forEach((mod) => {
      items.push({ label: mod.name, value: mod.value > 0 ? `+${mod.value}` : String(mod.value) });
    });

    rollBonuses.forEach((comp) => {
      const isDice = !!comp.sides;
      const value = isDice ? `${Math.abs(comp.count!)}d${comp.sides}` : String(comp.value);
      const sign = (isDice ? comp.count! : comp.value!) < 0 ? '-' : '+';
      items.push({ label: comp.label!, value: `${sign} ${value.replace('-', '')}` });
    });
  }
  return items;
});

const handleRoll = async () => {
  if (!store.rollArgs) return;

  if (store.rollType === 'd20') {
    const newArgs = jsonClone(store.rollArgs as D20RollArgs);
    const resolvedBonus = parseFormula(store.additionalBonus);
    const bonusComponents = createComponentsFromFormula(resolvedBonus, t('titles.bonus'));

    const diceToAdd: DiceComponent[] = bonusComponents.filter((c) => c.sides);
    const flatBonusesToAdd: LabeledBonus[] = bonusComponents
      .filter((c) => !c.sides && c.value)
      .map((c) => ({ label: c.label || t('titles.additional-bonus'), value: c.value! }));

    if (!newArgs.bonuses) newArgs.bonuses = [];
    newArgs.bonuses.push(...flatBonusesToAdd);
    newArgs.additionalComponents = diceToAdd;
    newArgs.advantage = store.selectedMode as -2 | -1 | 0 | 1;

    await performD20Roll(newArgs);
  } else if (store.rollType === 'damage') {
    const newArgs = jsonClone(store.rollArgs as DamageRollArgs);
    if (hitDiceCost.value > 0) {
      if (currentSelectedTotal.value !== hitDiceCost.value) return;

      const parts = Object.entries(hitDiceSelection.value)
        .filter(([_, count]) => count > 0)
        .map(([size, count]) => {
          const dieLabel = size.substring(1);
          return `${count}${dieLabel}`;
        });

      const replacementFormula = parts.length > 0 ? parts.join('+') : '0';

      newArgs.damageRolls?.forEach((roll: any) => {
        const sourceFormula = roll.originalFormula || roll.damage;
        roll.damage = sourceFormula.replace(/@?\{hit-dice:\d+\}/g, replacementFormula);
      });

      //  updates store to reduce used hit dice. Undecided if this should be automatic like below or manual
      /*Object.entries(hitDiceSelection.value).forEach(([size, count]) => {
        if (count > 0) {
          const key = size as HitDieSize;
          const current = progressionStore.hitDice.used[key] || 0;
          progressionStore.hitDice.used[key] = Math.max(0, current - count);
        }
      });*/
    }
    const resolvedBonusDamage = parseFormula(store.additionalBonus);
    newArgs.additionalComponents = createComponentsFromFormula(
      resolvedBonusDamage,
      t('titles.damage'),
    );
    newArgs.isCrit = store.selectedMode as boolean;
    newArgs.t = t;

    await performDamageRoll(newArgs);
  }
  store.close();
};
</script>

<style lang="scss" scoped>
.roll-dialog {
  &__overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  &__config {
    display: grid;
    grid-template-columns: max-content 1fr;
    margin: 1rem 1rem 0 1rem;
    padding: 1rem;
    gap: 10px;
    border-top: 1px solid var(--color-tertiary);
    border-bottom: 1px solid var(--color-tertiary);
    font-family: Arial, Helvetica, sans-serif;
  }

  & {
    background: var(--color-background);
    width: 350px;
    max-width: 90%;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-tertiary-container);
    background: var(--color-box);
    color: var(--color-box-detail);
    border-radius: 8px 8px 0 0;
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
  }

  &__close-button {
    background: none;
    border: none;
    cursor: pointer;
    .svg-icon {
      width: 1rem;
      height: 1rem;
      fill: var(--color-box-detail);
    }
  }

  &__content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__breakdown-title {
    margin: 0 0 0.5rem;
    border-bottom: 1px solid var(--color-tertiary-container);
    padding-bottom: 0.5rem;
  }

  &__breakdown-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 150px;
    overflow-y: auto;
  }

  &__breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    &:not(:last-child) {
      border-bottom: 1px solid var(--color-background-secondary);
    }
  }

  &__bonus-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-tertiary);
      border-radius: 4px;
    }
  }

  &__controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    align-items: flex-end;
  }

  &__roll-type,
  &__bonus-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  &__roll-type {
    padding-left: 1rem;
  }
  &__bonus-input {
    padding-right: 1rem;
  }

  .sanguomancy-section {
    grid-column: 1 / -1;
    padding: 0 1rem;
    &__title {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      border-bottom: 1px solid var(--color-tertiary);
    }
    &__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }
    .sanguomancy-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      label {
        font-size: 0.8rem;
        font-weight: bold;
      }
      input {
        width: 100%;
        text-align: center;
      }
      &--disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
    .text-error {
      color: var(--color-negative);
    }
  }

  select,
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-tertiary);
    border-radius: 4px;
  }

  &__footer {
    display: flex;
    justify-content: center;
    padding: 1rem;
    border-top: 1px solid var(--color-tertiary-container);
    background-color: var(--color-background-secondary);
    border-radius: 0 0 8px 8px;
    gap: 0.5rem;

    .button--full-width {
      width: 100%;
    }
  }
}
</style>
