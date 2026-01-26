<template>
  <div class="spell-view__spell-name">
    <details class="accordion">
      <summary class="accordion__summary">
        <div class="spell-item__summary-grid">
          <SidebarLink
            componentName="SpellSidebar"
            :props="{ spell }"
            :options="{ title: t('actions.edit-spell'), hasSave: true, hasDelete: true }"
            :label="spell.name"
            class="spell-item__name"
            v-if="!spell._id.includes('upcast')"
          />
          <span class="spell-item__name spell-item__name--upcast" v-else>{{ spell.name }}</span>
          <button
            class="spell-item__chat-button"
            :title="t('titles.icons.send-to-chat')"
            @click.stop="spellsStore.sendSpellInfoToChat(spell._id,t)"
          >
            <SvgIcon icon="chat" />
          </button>
          <span class="spell-item__damage" v-if="damagePool.value.final.length > 0">
            <DicePool :pool="damagePool" :rollArgs="damageRollArgs" />
          </span>
          <span class="spell-item__damage" v-else>-</span>
          <span class="spell-item__attack-bonus" v-if="spell.isAttack">
            <RollModifier
              :finalBonus="attackBonus.value.final"
              :rollArgs="rollArgs"
              @rolled="handleAttackRolled"
            />
          </span>
          <span class="spell-item__dc" v-else-if="spell.saving !== 'none'">
            <button class="button--link" @click.stop="spellsStore.sendSpellInfoToChat(spell._id,t)">
              DC {{ saveDC.value.final }}
            </button>
          </span>
          <span v-else></span>
        </div>
      </summary>
      <div class="accordion__details">
        <p v-if="spell.school">
          <strong>{{ $t('titles.school') }}:</strong> {{ spell.school }}
        </p>
        <p v-if="spell.castingTime">
          <strong>{{ $t('titles.casting-time') }}:</strong> {{ spell.castingTime }}
          <template v-if="spell.ritual">
            {{ $t('descriptions.or') }} {{ $t('titles.ritual') }}</template
          >
        </p>
        <p v-if="spell.range">
          <strong>{{ $t('titles.range') }}:</strong> {{ spell.range }}
        </p>
        <p v-if="spell.components.length > 0">
          <strong>{{ $t('titles.components') }}:</strong>
          {{ spell.components.map((c) => $t(`abbreviations.spell-components.${c}`)).join(', ')
          }}<span v-if="spell.material"> ({{ spell.material }})</span>
        </p>
        <p v-if="spell.duration">
          <strong>{{ $t('titles.duration') }}: </strong>
          <template v-if="spell.concentration">{{ $t('titles.concentration') }}, </template>
          {{ spell.duration }}
        </p>
        <hr />
        <div
          v-if="spell.description.default"
          class="description"
          v-html="parsedDescription"
          @click="handleCompendiumClick"
        ></div>
        <div v-if="spell.description.upcast">
          <strong>{{ $t('titles.at-higher-levels') }}.</strong>
          <div
            v-if="spell.description.upcast"
            class="description"
            v-html="parsedHigherLevelDescription"
          ></div>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SidebarLink from '@/components/shared/SidebarLink.vue';
import type { Spell } from '@/sheet/stores/spells/spellsStore';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { computed, getCurrentInstance } from 'vue';
import RollModifier from '@/components/shared/RollModifier.vue';
import DicePool from '@/components/shared/DicePool.vue';

import { getEntryByLabel } from '@/utility/getEntryBy';
import { useAbilitiesStore, type AbilityData } from '@/sheet/stores/abilities/abilitiesStore';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { effectKeys } from '@/effects.config';
import {
  getRollProperties,
  type D20RollArgs,
  type DamageRollArgs,
  type LabeledBonus,
} from '@/utility/roll';
import SvgIcon from '../shared/SvgIcon.vue';
import { evaluateDiceFormula } from '@/sheet/stores/formulas';
import { parseSimpleMarkdown } from '@/utility/markdownParser';

const { appContext } = getCurrentInstance()!;

const props = defineProps<{
  spell: Spell & { isFromEffect?: boolean; sourceEffectId?: string; sourceEffectLabel?: string };
}>();
const spellsStore = useSpellsStore();

const attackBonus = computed(() => spellsStore.getSourceAttackBonus(props.spell.spellSourceId));
const damagePool = computed(() => spellsStore.getSpellDamage(props.spell));
const saveDC = computed(() => spellsStore.getSourceDC(props.spell.spellSourceId));

const { t } = useI18n();

const parsedDescription = computed(() => parseSimpleMarkdown(props.spell.description.default));
const parsedHigherLevelDescription = computed(() =>
  parseSimpleMarkdown(props.spell.description.upcast),
);

const handleAttackRolled = (result: 'crit-success' | 'crit-fail' | undefined) => {
  spellsStore.setLastSpellAttackResult(props.spell._id, result);
};

const rollArgs = computed((): D20RollArgs => {
  const spell = props.spell;
  const source = spellsStore.sources.find((s) => s._id === spell.spellSourceId);
  const t = useI18n().t;

  if (!source)
    return {
      rollName: '',
      subtitle: '',
      bonuses: [],
    };

  const bonuses: LabeledBonus[] = [];
  if (source.type === 'ability') {
    const ability = getEntryByLabel(source.ability, useAbilitiesStore().abilities) as AbilityData;
    const modifiedScore = useAbilitiesStore().getModifiedAbilityScore(ability);
    const rawAbilityBonus = Math.floor((modifiedScore.value.final - 10) / 2);
    bonuses.push({ label: t(`titles.abilities.${source.ability}`), value: rawAbilityBonus });

    const proficiencyBonus = Math.floor(useProgressionStore().getProficiencyBonus);
    if (proficiencyBonus !== 0) {
      bonuses.push({ label: t('titles.proficiency-bonus'), value: proficiencyBonus });
    }
  } else if (source.type === 'flat') {
    bonuses.push({ label: t('titles.base-score'), value: source.flat });
  }

  const modifiedValue = spellsStore.getSourceAttackBonus(source._id);
  modifiedValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  const rollBonusKeys = [
    effectKeys['spell-attack-roll'],
    effectKeys['attack-roll'],
    effectKeys[`${spell.attackType}-spell-attack-roll`],
    effectKeys[`${spell.attackType}-attack-roll`],
  ].filter(Boolean);

  const actionDieKeys = [
    effectKeys['spell-attack-action-die'],
    effectKeys['attack-action-die'],
    effectKeys[`${spell.attackType}-spell-attack-action-die`],
    effectKeys[`${spell.attackType}-attack-action-die`],
  ].filter(Boolean);

  return {
    rollName: spell.name,
    subtitle: t('rolls.attack-roll'),
    bonuses: bonuses,
    critRange: spellsStore.getSpellCritRange(spell).value.final,
    sourceType: 'spell',
    properties: getRollProperties(spell, t, saveDC.value.value.final),
    description: spell.description.default,
    rollBonusKeys,
    actionDieKeys,
  };
});

const damageRollArgs = computed((): DamageRollArgs => {
  const spell = props.spell;

  const damageModifierKeys = [
    effectKeys.damage,
    effectKeys['spell-damage'],
    effectKeys[`${spell.attackType}-spell-damage`],
    effectKeys[`${spell.attackType}-damage`],
  ].filter(Boolean);

  const damageRollKeys = [
    effectKeys['damage-roll'],
    effectKeys['spell-damage-roll'],
    effectKeys[`${spell.attackType}-spell-damage-roll`],
    effectKeys[`${spell.attackType}-damage-roll`],
  ].filter(Boolean);

  return {
    rollName: spell.name,
    subtitle: t('rolls.damage-roll'),
    damageRolls: spell.damage.map((roll) => ({
      ...roll,
      damage: evaluateDiceFormula(roll.damage),
      critDamage: roll.critDamage ? evaluateDiceFormula(roll.critDamage) : '',
    })),
    canCrit: spell.isAttack,
    isCrit:
      spellsStore.lastSpellAttack?.spellId === spell._id &&
      spellsStore.lastSpellAttack.resultType === 'crit-success',
    whisper: false,
    sourceType: 'spell',
    damageModifierKeys,
    damageRollKeys,
    properties: getRollProperties(spell, t, saveDC.value.value.final),
    description: spell.description.default,
    t: t,
  };
});
const handleCompendiumClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.dataset.compendiumLink) {
    event.preventDefault();
    appContext.config.globalProperties.$openCompendiumPopout(target.dataset.compendiumLink);
  }
};
</script>
<style lang="scss" scoped>
.accordion__summary {
  .sidebar-link {
    text-align: left;
  }
}
.spell-item__summary-grid {
  display: grid;
  grid-template-columns: 1fr min-content 80px 50px;
  gap: 5px 10px;
  align-items: center;
  width: 100%;
}
.spell-item__chat-button {
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
.spell-item__name {
  justify-self: start;
  &--upcast {
    opacity: 0.8;
    cursor: not-allowed;
  }
}
.spell-item__damage {
  justify-self: center;
}
.spell-item__dc,
.spell-item__attack-bonus {
  justify-self: end;
  font-weight: bold;
}
.spell-item {
  &__dc,
  &__attack-bonus,
  &__damage {
    justify-self: center;
    align-self: center;
  }
}
</style>
