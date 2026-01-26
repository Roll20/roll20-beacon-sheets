<template>
  <div class="resting">
    <button class="button" @click="handleRestClick('short')">
      <template v-if="confirmLR">
        {{ $t('actions.cancel') }}
      </template>
      <template v-else-if="!confirmSR">
        {{ $t('titles.short-rest') }}
      </template>
      <template v-else>
        {{ $t('actions.confirm') }} ({{ countdown }})
      </template>
    </button>
    <button class="button" @click="handleRestClick('long')">
      <template v-if="confirmSR">
        {{ $t('actions.cancel') }}
      </template>
      <template v-else-if="!confirmLR">
        {{ $t('titles.long-rest') }}
      </template>
      <template v-else>
        {{ $t('actions.confirm') }} ({{ countdown }})
      </template>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useResourcesStore } from '@/sheet/stores/resources/resourcesStore';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { parseFormulaAndEvaluate } from '@/sheet/stores/formulas';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useI18n } from 'vue-i18n';
import { dispatchRef, initValues } from '@/relay/relay';
import { type Dispatch } from '@roll20-official/beacon-sdk';

const { t } = useI18n();

const combat = useCombatStore();
const progression = useProgressionStore();
const resources = useResourcesStore();
const spells = useSpellsStore();

const confirmSR = ref(false);
const confirmLR = ref(false);
const countdown = ref(3);
let timer: ReturnType<typeof setInterval> | null = null;

const handleRestClick = (type: 'short' | 'long') => {
  if (!confirmSR.value && !confirmLR.value) {
    if (type === 'short') {
      confirmSR.value = true;
    } else {
      confirmLR.value = true;
    }
    countdown.value = 3;
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        confirmSR.value = false;
        confirmLR.value = false;
        clearInterval(timer!);
        timer = null;
      }
    }, 1000);
  } else {
    if((type === 'short' && confirmSR.value) || (type === 'long' && confirmLR.value)) {
      rest[type]();
    }
    confirmSR.value = false;
    confirmLR.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
};

  const sendRestInfoToChat = async (type: 'short' | 'long') => {
    const rollTemplate = createRollTemplate({
      type: 'chat',
      parameters: {
        characterName: useMetaStore().name,
        title: `${type === 'short' ? t('titles.short-rest') : t('titles.long-rest')}`,
        sourceType: 'spell',
        description: t(`descriptions.resting.${type}`),
      },
    });

    const dispatch = dispatchRef.value as Dispatch;
    await dispatch.post({
      characterId: initValues.character.id,
      content: rollTemplate,
    });
  };

const rest = {
  short: () => {

    //Resources
    resources.resources.forEach((res) => {
      const max = parseFormulaAndEvaluate(res.max);
      let newCount = res.count;

      if (res.refreshOnShortRest === 'all') {
        newCount = max;
      } else if (res.refreshOnShortRest === 'fixed-value' && res.refreshOnShortRestAmount) {
        const diceRoll = new DiceRoll(res.refreshOnShortRestAmount);
        newCount = Math.min(max, res.count + diceRoll.total);
      }

      if (newCount !== res.count) {
        resources.update({ 
          _id: res._id, 
          count: newCount, 
          sourceEffectId: (res as any).sourceEffectId 
        });
      }
    });

    //Pact Slots;
    const slots = spells.getSlots;
    slots.pact.forEach((slot, index) => {
      spells.slots.used[index] = Math.min(spells.slots.used[index] + slot, slots.all[index]);
    });

    sendRestInfoToChat('short');
  },
  long: () => {
    combat.life.hitPoints = combat.getHitPointsMax().value.final;

    //Hit Dice
    const hitDice = progression.getHitDice;
    Object.entries(hitDice).forEach(([size, dice]) => {
      const recovered = Math.ceil(dice / 2);
      const key = size as keyof typeof progression.hitDice.used;
      progression.hitDice.used[key] = Math.min(dice, (progression.hitDice.used[key] || 0) + recovered);
    });

    //Resources
    resources.resources.forEach((res) => {
      const max = parseFormulaAndEvaluate(res.max);
      let newCount = res.count;

      if (res.refreshOnLongRest === 'all') {
        newCount = max;
      } else if (res.refreshOnLongRest === 'fixed-value' && res.refreshOnLongRestAmount) {
        const diceRoll = new DiceRoll(res.refreshOnLongRestAmount);
        newCount = Math.min(max, res.count + diceRoll.total);
      }
      
      if (newCount !== res.count) {
        resources.update({ 
          _id: res._id, 
          count: newCount, 
          sourceEffectId: (res as any).sourceEffectId 
        });
      }
    });

    //Spell Slots
    const slots = spells.getSlots;
    slots.standard.forEach((slot, index) => {
      spells.slots.used[index] = Math.min(spells.slots.used[index] + slot, slots.all[index]);
    });

    //Exaustion && Inhalation
    combat.exhaustion = Math.max(0, combat.exhaustion - 1);
    combat.inhalation = Math.max(0, combat.inhalation - 1);
    
    sendRestInfoToChat('long');
  },
}
</script>

<style lang="scss" scoped>
.resting {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--size-gap-medium);
  .button {
    padding: 10px 10px;
    width: 100%;
    border: 1px solid var(--color-secondary);
  }
}
</style>