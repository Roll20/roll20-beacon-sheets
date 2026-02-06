<template>
  <div class="core-view">
    <div class="rows">
      <div class="boxed-stats">
        <InspirationTracker />
        <BoxedScore
          :score="initiative"
          :label="$t('titles.initiative')"
          type="modifier"
          :rollArgs="initiativeRollArgs"
        />
        <BoxedScore :score="passivePerception" :label="$t('titles.passive-perception')" />
        <details class="show-more">
          <summary class="show-more__button"></summary>
          <div class="show-more__content">
            <BoxedScore :score="passiveInsight" :label="$t('titles.passive-insight')" />
            <BoxedScore :score="passiveInvestigation" :label="$t('titles.passive-investigation')" />
            <BoxedScore :score="proficiencyBonus" :label="$t('titles.proficiency-bonus')" />
          </div>
        </details>
      </div>
      <div class="cols cols--a-s-s">
        <AbilitiesSection />
        <div class="rows">
          <SavingThrowsSection />
          <SkillsSection />
          <CustomSkillSection />
        </div>
      </div>
      <OtherProficienciesSection />
    </div>
    <div class="rows">
      <BiographySection />
      <div class="cols cols--c-a-i-f">
        <div class="rows">
          <CombatSection />
          <ActionsSection />
          <EffectsSection />
          <CurrencySection />
          <EquipmentSection />
          <AttunementSection />
          <CompanionsSection />
        </div>
        <div class="rows">
          <DefensesSection />
          <ConditionsSection />
          <SensesSection />
          <ResourcesSection />
          <HitDiceSection />
          <FeaturesSection />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSheetStore } from '@/sheet/stores';

import BiographySection from '@/components/biography/BiographySection.vue';
import { computed } from 'vue';
import CompanionsSection from '@/components/companions/CompanionsSection.vue';

import AbilitiesSection from '@/components/abilities/AbilitiesSection.vue';

import SavingThrowsSection from '@/components/savings/SavingThrowsSection.vue';
import SkillsSection from '@/components/skills/SkillsSection.vue';

import FeaturesSection from '@/components/features/FeaturesSection.vue';

import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import ActionsSection from '@/components/actions/ActionsSection.vue';
import ResourcesSection from '@/components/resources/resourcesSection.vue';
import EquipmentSection from '@/components/equipment/EquipmentSection.vue';
import EffectsList from '@/components/effects/EffectsList.vue';
import CombatSection from '@/components/combat/CombatSection.vue';
import CurrencySection from '@/components/currency/CurrencySection.vue';
import CustomSkillSection from '@/components/skills/CustomSkillSection.vue';
import BoxedScore from '@/components/shared/BoxedScore.vue';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';

import DefensesSection from '@/components/defenses/DefensesSection.vue';
import OtherProficienciesSection from '@/components/proficiencies/OtherProficienciesSection.vue';
import AttunementSection from '@/components/attunement/AttunementSection.vue';
import ConditionsSection from '@/components/conditions/ConditionsSection.vue';
import SensesSection from '@/components/senses/SensesSection.vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { ref } from 'vue';
import InspirationTracker from '@/components/combat/InspirationTracker.vue';
import { useI18n } from 'vue-i18n';
import { effectKeys } from '@/effects.config';
import HitDiceSection from '@/components/hitdice/HitDiceSection.vue';
import EffectsSection from '@/components/effects/EffectsSection.vue';


const { t } = useI18n();

const proficienciesStore = useProficienciesStore();
const abilitiesStore = useAbilitiesStore();
const metaStore = useMetaStore();

const proficiencyBonus = computed(() =>
  useEffectsStore().getModifiedValue(
    useProgressionStore().getProficiencyBonus,
    effectKeys['proficiency-bonus'],
  ),
);
const passivePerception = computed(() =>
  proficienciesStore.getPassiveProficiency(proficienciesStore.getProficiencyByLabel('perception')),
);
const passiveInsight = computed(() =>
  proficienciesStore.getPassiveProficiency(proficienciesStore.getProficiencyByLabel('insight')),
);
const passiveInvestigation = computed(() =>
  proficienciesStore.getPassiveProficiency(
    proficienciesStore.getProficiencyByLabel('investigation'),
  ),
);

const initiative = computed(() => {
  const initiative = proficienciesStore.initiative;
  return proficienciesStore.getProficiencyModifier(initiative);
});
const json = computed(() => JSON.stringify(useEffectsStore().effects, null, 2));

const inspiration = ref(useCombatStore().inspiration);

const initiativeRollArgs = computed(() => {
  const initiativeProf = proficienciesStore.initiative;
  if (!initiativeProf) return {};

  const bonuses = [];
  const ability = proficienciesStore.getProficiencyAbility(initiativeProf);
  if (ability) {
    const modifiedScore = abilitiesStore.getModifiedAbilityScore(ability);
    const rawAbilityBonus = Math.floor((modifiedScore.value.final - 10) / 2);
    bonuses.push({ label: t(`titles.abilities.${ability.label}`), value: rawAbilityBonus });
  }

  const modifiedValue = proficienciesStore.getProficiencyModifier(initiativeProf);
  modifiedValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  return {
    rollName: t('titles.initiative'),
    subtitle: t('rolls.initiative-check'),
    bonuses: bonuses,
    rollBonusKeys: [
      effectKeys['initiative-roll'],
      effectKeys['dexterity-check-roll'],
      effectKeys['check-roll'],
    ],
    actionDieKeys: [
      effectKeys['initiative-action-die'],
      effectKeys['dexterity-check-action-die'],
      effectKeys['check-action-die'],
    ],
    addToTracker: true,
    tokenId: metaStore.token?.id,
    characterName: metaStore.name,
    isCompanion: false,
    avatar: metaStore.avatar,
  };
});

const clear = () => {
  useEffectsStore().effects = [];
};

useSheetStore();
</script>

<style lang="scss">
@use '../common/scss/vars.scss' as vars;

.core-view {
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: var(--size-gap-large);

  > .cols,
  .rows > .cols {
    gap: var(--size-gap-large);
  }
  > .rows {
    gap: var(--size-gap-large);
  }
  .cols {
    &--a-s-s {
      grid-template-columns: min-content 1fr;
    }
    &--c-a-i-f {
      grid-template-columns: 1fr 1fr;
    }
  }
  .rows {
    > .section + .section {
      margin-top: var(--size-gap-medium);
    }
  }
  .boxed-stats {
    margin-bottom: var(--size-gap-medium);
  }
}
</style>
