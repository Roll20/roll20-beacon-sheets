<template>
  <div class="npc-proficiency-item">
    <span class="npc-proficiency-item__label">{{ label }}</span>
    <div class="npc-proficiency-item__control">
      <RollModifier v-if="!editMode" :finalBonus="finalBonus.value.final" :rollArgs="rollArgs" />
      <input
        v-else
        type="number"
        :value="baseBonus"
        :placeholder="placeholder"
        @input="
          $emit(
            'update:baseBonus',
            ($event.target as HTMLInputElement).value === ''
              ? null
              : Number(($event.target as HTMLInputElement).value),
          )
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import RollModifier from '@/components/shared/RollModifier.vue';
import { useI18n } from 'vue-i18n';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { effectKeys } from '@/effects.config';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  baseBonus: number | null;
  placeholder: string;
  finalBonus: ModifiedValue;
  editMode: boolean;
  npcId: string;
  group: 'saving-throws' | 'skills';
  skillKey: string;
}>();

defineEmits(['update:baseBonus']);

const { t } = useI18n();
const store = useNpcStore();

const rollArgs = computed((): D20RollArgs => {
  const npc = store.npcs.find((n) => n._id === props.npcId);
  if (!npc) return { rollName: '', subtitle: '', bonuses: [] };

  const bonuses: LabeledBonus[] = [];
  const effectsTotal = props.finalBonus.value.modifiers.reduce((sum, mod) => sum + mod.value, 0);
  const baseModifier = props.finalBonus.value.final - effectsTotal;

  if (baseModifier !== 0) {
    bonuses.push({ label: t('titles.base-score'), value: baseModifier });
  }
  props.finalBonus.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });
  
  // Determine the correct subtitle and effect keys based on the proficiency group.
  let rollBonusKeys: string[] = [];
  let actionDieKeys: string[] = [];
  let subtitle = '';
  if (props.group === 'saving-throws') {
    subtitle = t('rolls.savings');
    rollBonusKeys = [
      effectKeys[`${props.skillKey}-roll` as keyof typeof effectKeys],
      effectKeys['saving-roll']
    ]
    actionDieKeys = [
      effectKeys[`${props.skillKey}-action-die` as keyof typeof effectKeys],
      effectKeys['saving-action-die'],
    ]
  } else if (props.group === 'skills') {
    subtitle = t('rolls.default-skills');
    rollBonusKeys = [
      effectKeys[`${props.skillKey}-roll` as keyof typeof effectKeys],
      effectKeys['skill-roll'],
      effectKeys['check-roll'],
    ]
    actionDieKeys = [
      effectKeys[`${props.skillKey}-action-die` as keyof typeof effectKeys],
      effectKeys['skill-action-die'],
      effectKeys['check-action-die'],
    ]
  }

  return {
    rollName: props.label,
    subtitle,
    bonuses,
    rollBonusKeys,
    actionDieKeys,
    critRange: 20,
    effectsSource: npc.effects,
    characterName: npc.name,
  };
});
</script>

<style lang="scss" scoped>
.npc-proficiency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.npc-proficiency-item__control input {
  width: 50px;
  text-align: right;
}
</style>
