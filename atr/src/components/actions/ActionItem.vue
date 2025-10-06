<template>
  <div class="action-item">
    <details class="accordion">
      <summary class="accordion__summary">
        <div class="cols">
          <SidebarLink
            componentName="ActionSidebar"
            :props="{ action: action }"
            :options="{
              title: t('actions.edit-action'),
              hasSave: true,
              hasDelete: true,
            }"
            :label="action.name"
            class="action-summary__name"
          />
          <button
            v-if="action.description || action.target || action.range"
            class="action-item__chat-button"
            :title="t('titles.icons.send-to-chat')"
            @click.stop="actionsStore.sendActionInfoToChat(action._id,t)"
          >
            <SvgIcon icon="chat" />
          </button>
          <span class="action-item__damage" v-if="damage.value.final.length > 0">
            <DicePool :pool="damage" :rollArgs="damageRollArgs" />
          </span>
          <span class="action-item__damage" v-else>-</span>
          <span class="action-item__attack-bonus" v-if="action.isAttack">
            <RollModifier
              :finalBonus="attackBonus.value.final"
              :rollArgs="rollArgs"
              @rolled="handleAttackRolled"
            />
          </span>
          <span class="action-item__attack-bonus" v-else-if="isSave(action)">
            <button
              class="button--link"
              @click.stop="actionsStore.sendActionInfoToChat(action._id,t)"
            >
              DC {{ actionDC.value.final }}
            </button>
          </span>
          <span class="action-item__damage" v-else>-</span>
        </div>
      </summary>
      <div class="accordion__details">
        <p v-if="action.saving !== 'none'">
          <strong>{{ $t('titles.saving-throw') }}:</strong>
          {{ $t(`titles.abilities.${action.saving}`) }} DC {{ actionDC.value.final }}
        </p>
        <p v-if="action.range">
          <strong>{{ $t('titles.range') }}:</strong> {{ action.range }}
        </p>
        <p v-if="action.target">
          <strong>{{ $t('titles.target') }}:</strong> {{ action.target }}
        </p>
        <p v-if="action.ammo">
          <strong>{{ $t('titles.ammo') }}:</strong> {{ action.ammo }}
        </p>
        <div v-if="action.description" class="description" v-html="parsedDescription"></div>

        <div v-if="actionTags.length" class="tags">
          <span v-for="tag in actionTags" :key="tag._id" class="tag-pill">
            {{ tag.text }}
          </span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { useActionsStore, type Action } from '@/sheet/stores/actions/actionsStore';
import { computed } from 'vue';
import RollModifier from '../shared/RollModifier.vue';
import DicePool from '../shared/DicePool.vue';
import { useI18n } from 'vue-i18n';
import type { Tag } from '@/sheet/stores/tags/tagsStore';
import SidebarLink from '../shared/SidebarLink.vue';
import { effectKeys } from '@/effects.config';
import { type D20RollArgs, type DamageRollArgs, getRollProperties, type LabeledBonus, performD20Roll } from '@/utility/roll';
import { getEntryByLabel } from '@/utility/getEntryBy';
import { type AbilityData, useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { createComponentsFromFormula } from '@/utility/diceParser';
import { getDiceFromExpression } from '@/utility/getDiceFromExpression';
import SvgIcon from '../shared/SvgIcon.vue';
import { evaluateDiceFormula, parseFormulaAndEvaluate } from '@/sheet/stores/formulas';
import { parseSimpleMarkdown } from '@/utility/markdownParser';

const { t } = useI18n();
const props = defineProps<{
  action: Action & { isFromEffect?: boolean; sourceEffectId?: string; sourceEffectLabel?: string };
}>();

const parsedDescription = computed(() => parseSimpleMarkdown(props.action.description));

const actionsStore = useActionsStore();

const isSave = (action: Action) => action.saving !== 'none' && action.savingDc;
const attackBonus = computed(() => useActionsStore().getActionBonus(props.action._id));
const actionDC = computed(() => useActionsStore().getActionDC(props.action._id));

const damage = computed(() => useActionsStore().getActionDamage(props.action._id));

const actionTags = computed<Tag[]>(() => {
  return actionsStore.getActionTags(props.action.tagId);
});

const handleAttackRolled = (result: 'crit-success' | 'crit-fail' | undefined) => {
  actionsStore.setLastAttackResult(props.action._id, result);
};

const damageRollArgs = computed((): DamageRollArgs => {
  const action = props.action;

  const damageModifierKeys = [
    effectKeys.damage,
    effectKeys[`${action.attackType}-damage`],
    effectKeys[`${action.sourceType}-damage`],
    effectKeys[`${action.attackType}-${action.sourceType}-damage`],
  ].filter(Boolean);

  const damageRollKeys = [
    effectKeys['damage-roll'],
    effectKeys[`${action.attackType}-damage-roll`],
    effectKeys[`${action.sourceType}-damage-roll`],
    effectKeys[`${action.attackType}-${action.sourceType}-damage-roll`],
  ].filter(Boolean);

  return {
    rollName: action.name,
    subtitle: t('rolls.damage-roll'),
    damageRolls: action.damage.map((roll) => ({
      ...roll,
      damage: evaluateDiceFormula(roll.damage),
      critDamage: roll.critDamage ? evaluateDiceFormula(roll.critDamage) : '',
    })),
    canCrit: action.isAttack,
    isCrit:
      actionsStore.lastAttack?.actionId === action._id &&
      actionsStore.lastAttack.resultType === 'crit-success',
    whisper: false,
    sourceType: 'action',
    damageModifierKeys,
    damageRollKeys,
    properties: getRollProperties(action, t, actionDC.value.value.final),
    description: action.description,
    t: t,
  };
});

const rollArgs = computed((): D20RollArgs => {
  const action = props.action;
  const t = useI18n().t;

  const bonuses: LabeledBonus[] = [];
  if (action.attackAbility && action.attackAbility !== 'none') {
    const ability = getEntryByLabel(
      action.attackAbility,
      useAbilitiesStore().abilities,
    ) as AbilityData;
    const modifiedScore = useAbilitiesStore().getModifiedAbilityScore(ability);
    const rawAbilityBonus = Math.floor((modifiedScore.value.final - 10) / 2);
    bonuses.push({ label: t(`titles.abilities.${action.attackAbility}`), value: rawAbilityBonus });
  }

  const proficiencyBonus = Math.floor(
    useProgressionStore().getProficiencyBonus * action.attackProficiency,
  );
  if (proficiencyBonus !== 0) {
    bonuses.push({ label: t('titles.proficiency-bonus'), value: proficiencyBonus });
  }

  if (action.attackBonus) {
    bonuses.push({
      label: t('titles.attack-bonus'),
      value: parseFormulaAndEvaluate(action.attackBonus),
    });
  }

  const modifiedValue = actionsStore.getActionBonus(action._id);
  modifiedValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  const rollBonusKeys = [
    effectKeys['attack-roll'],
    effectKeys[`${action.attackType}-attack-roll`],
    effectKeys[`${action.sourceType}-attack-roll`],
    effectKeys[`${action.attackType}-${action.sourceType}-attack-roll`],
  ].filter(Boolean);

  const actionDieKeys = [
    effectKeys['attack-action-die'],
    effectKeys[`${action.attackType}-attack-action-die`],
    effectKeys[`${action.sourceType}-attack-action-die`],
    effectKeys[`${action.attackType}-${action.sourceType}-attack-action-die`],
  ].filter(Boolean);

  return {
    rollName: action.name,
    subtitle: t('rolls.attack-roll'),
    bonuses: bonuses,
    rollBonusKeys: rollBonusKeys,
    actionDieKeys: actionDieKeys,
    critRange: actionsStore.getActionCritRange(action).value.final,
    properties: getRollProperties(action, t, actionDC.value.value.final),
    description: action.description,
    sourceType: 'action',
  };
});
</script>

<style lang="scss" scoped>
.action-item {
  display: flex;
  align-items: center;
  &__label {
    cursor: pointer;
    font-weight: bold;
  }
  .cols {
    grid-template-columns: 1fr min-content 80px 30px;
    gap: 5px 10px;
    .sidebar-link {
      justify-self: left;
    }
  }
  .accordion__summary {
    .sidebar-link {
      text-align: left;
    }
  }
  &__chat-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    .svg-icon {
      width: 1rem;
      height: 1rem;
      color: var(--color-tertiary);
      &:hover {
        color: var(--color-highlight);
      }
    }
  }

  &__dc,
  &__attack-bonus,
  &__damage {
    justify-self: center;
    align-self: center;
  }
}
</style>
