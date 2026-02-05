<template>
  <div class="roller">
    <img src="https://i.postimg.cc/tCn9fhD4/dice.png" alt="Dice Icon" />
    <div class="roller__spacer"></div>
    <div class="roller__power">
      <h3 class="title">Power</h3>
      <span class="value" v-tooltip="totalPowerDetails">{{ summedPower }}</span>
    </div>
    <div class="roller__spacer"></div>
    <div class="roller__custom-bonus">
      <h3 class="title">Modifier</h3>
      <IncrementorInput v-model="customBonus" />
    </div>
    <div class="roller__spacer"></div>   
    <button @click="roll" class="title roller__roll">Roll</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import IncrementorInput from '@/components/shared/IncrementorInput.vue';
import { trackersStore, type Tracker } from '@/sheet/stores/trackers/trackersStore';
import { themesStore } from '@/sheet/stores/themes/themesStore';
import rollToChat from '@/utility/rollToChat';
import { type DiceComponent, type CommonParameters } from '@/rolltemplates/rolltemplates';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { heroStore } from '@/sheet/stores/hero/heroStore';

const meta = metaStore();
const themes = themesStore();
const trackers = trackersStore();
const hero = heroStore();

const getTrackerValue = (tracker:Tracker) => {
  const multiplier = tracker.mode === 'bonus' ? 1 : tracker.mode === 'penalty' ? -1 : 0;
  if (multiplier === 0) return 0;
  for (let i = 6; i >= 1; i--) {
    const key = `level_${i}` as const;
    if ((tracker.stages as any)?.[key]) {
      return i * multiplier;
    }
  }
  return multiplier;
};

const customBonus = ref(0);
const power = computed(() => {
  const themeBonus = themes.themes.reduce((acc: Array<{ name: string; value: number }>, theme) => [
    ...acc,
    ...theme.tags.filter(t => t.checked).map(t => { return { name: t.name, value: t.type === 'Power' ? 1 : -1 };}),
    ...theme.tags.filter(t => t.checked && t.scratched).map(t => { return { name: `Scratched ${t.name}`, value: 2 };})
  ], []);
  const backpackBonus = [
    ...hero.backpack.filter(t => t.checked).map(t => { return { name: t.name, value: t.type === 'Power' ? 1 : -1 };}),
    ...hero.backpack.filter(t => t.checked && t.scratched).map(t => { return { name: `Scratched ${t.name}`, value: 2 };})
  ];
  const allTrackerBonus = trackers.trackers.filter(tracker => getTrackerValue(tracker) !== 0).map(tracker => {
    return { name: tracker.name, value: getTrackerValue(tracker) };
  });
  const trackerBonus = (() => {
    const positives = allTrackerBonus.filter(b => b.value > 0);
    const negatives = allTrackerBonus.filter(b => b.value < 0);
    const maxPositive = positives.reduce((best, curr) => (curr.value > best.value ? curr : best), positives[0]);
    const minNegative = negatives.reduce((best, curr) => (curr.value < best.value ? curr : best), negatives[0]);
    return [maxPositive, minNegative].filter(Boolean);
  })();
  return [...themeBonus, ...backpackBonus, ...trackerBonus].map(b => {
    return { name: `${b.name} (${b.value > 0 ? '+' : ''}${b.value})`, value: b.value };
  });
});
const summedPower = computed(() => {
  return power.value.reduce((acc, curr) => acc + curr.value, 0);
});
const totalPowerDetails = computed(() => {
  return power.value.map(p => p.name).join(', ');
});

const uncheckThemes = () => {
  themes.themes.forEach(theme => {
    theme.tags.forEach(tag => {
      tag.checked = false;
    });
  });
};
const uncheckTrackers = () => {
  trackers.trackers.forEach(tracker => {
    tracker.mode = undefined;
  });
};
const roll = () => {
  const components: DiceComponent[] = [
    { sides: 6, count: 1 },
    { sides: 6, count: 1 }
  ];
  power.value.forEach(p => {
    components.push({ label: p.name.replace(/\s\(.+?\)$/g, ''), value: p.value });
  });
  if(customBonus.value !== 0 && !isNaN(customBonus.value)) {
    components.push({ label: 'Custom Modifier', value: customBonus.value });
  }
  const rollParameters: CommonParameters & { components: DiceComponent[] } = {
    components,
    title: ''
  }
  if(meta.name) {
    rollParameters.characterName = meta.name;
  }
  rollToChat(rollParameters);
  customBonus.value = 0;
  uncheckThemes();
  uncheckTrackers();
}
</script>

<style lang="scss" scoped>
.roller {
  background-color: #e3e3e3;
  border-radius: 5px 5px 0 0;
  border: 2px solid white;
  border-bottom: 0;
  box-sizing: border-box;
  padding: 10px;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  img {
    margin-bottom: -7px;
  }
  button {
    font-size: var(--font-size-xlarge);
    padding: 5px 15px;
    cursor: pointer;
  }
  &__spacer {
    width: 1px;
    min-height: 35px;
    background-color: #ccc;
    display: none;
  }
  &__power {
    width: 60px;
  }
  &__custom-bonus {
    width: 100px;
  }
  .roller__power, .roller__custom-bonus { 
    .title {
      text-align: center;
    }
    .value {
      display: block;
      text-align: center;
      font-family: Arial, Helvetica, sans-serif;
      margin-top: 1px;
      cursor: help;
      font-size: var(--font-size-xlarge);
    }
    .value, :deep(.incrementor-input) {
      .button-minus, .button-plus {
        border-radius: 3px!important;
        &:hover {
          background-color: #995c47;
          color: var(--color-herocard-title);
        }
      }
      input {
        font-size: var(--font-size-xlarge);
      }
    }
  }
  &__roll {
    background-color: #995c47;
    border-radius: 5px;
    color: var(--color-herocard-title);
    border: 2px solid #7a402d;
    width: 100px;
    margin-left: 10px;
    &:hover {
      background-color: #b1715b;
      border-color: #995c47;
    }
  }
}
</style>