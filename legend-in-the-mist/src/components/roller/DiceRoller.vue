<template>
  <div class="roller">
    <img src="data:image/png;base64,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" alt="Dice Icon"/>
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

const getTrackerValue = (tracker:Tracker, type: 'tag' | 'status') => {
  const multiplier = tracker.mode === 'bonus' ? 1 : tracker.mode === 'penalty' ? -1 : 0;
  if (multiplier === 0) return 0;
  for (let i = 6; i >= 1; i--) {
    const key = `level_${i}` as const;
    if ((tracker.stages as any)?.[key]) {
      return i * multiplier;
    }
  }
  return type === 'tag' ? multiplier : 0;
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
  const statuses = trackers.trackers.filter(tracker => tracker.mode && Object.values(tracker.stages).filter(value => value).length > 0);
  const tags = trackers.trackers.filter(tracker => tracker.mode && Object.values(tracker.stages).filter(value => value).length === 0);
  const allStatusesBonus = statuses.filter(tracker => getTrackerValue(tracker, 'status') !== 0).map(tracker => {
    return { name: tracker.name, value: getTrackerValue(tracker, 'status') };
  });
  const tagsBonus = tags.filter(tracker => getTrackerValue(tracker, 'tag') !== 0).map(tracker => {
    return { name: tracker.name, value: getTrackerValue(tracker, 'tag') };
  });
  const scratchedTagsBonus = tags.filter(tracker => getTrackerValue(tracker, 'tag') !== 0 && tracker.scratched).map(tracker => {
    return { name: `scratched ${tracker.name}`, value: 2 };
  });
  const statusesBonus = (() => {
    const positives = allStatusesBonus.filter(b => b.value > 0);
    const negatives = allStatusesBonus.filter(b => b.value < 0);
    const maxPositive = positives.reduce((best, curr) => (curr.value > best.value ? curr : best), positives[0]);
    const minNegative = negatives.reduce((best, curr) => (curr.value < best.value ? curr : best), negatives[0]);
    return [maxPositive, minNegative].filter(Boolean);
  })();
  return [...themeBonus, ...backpackBonus, ...statusesBonus, ...tagsBonus, ...scratchedTagsBonus].map(b => {
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