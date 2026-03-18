<template>
  <div class="roller">
    <div class="roller__icons">
      <SvgIcon icon="Self" />
      <SvgIcon icon="Mythos" />
      <SvgIcon icon="Noise" />
    </div>
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
import SvgIcon from '../shared/SvgIcon.vue';

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
    ...theme.tags.filter(t => t.checked && t.burnt).map(t => { return { name: `Burnt ${t.name}`, value: 2 };})
  ], []);
  const backpackBonus = [
    ...hero.backpack.filter(t => t.checked).map(t => { return { name: t.name, value: t.type === 'Power' ? 1 : -1 };}),
    ...hero.backpack.filter(t => t.checked && t.burnt).map(t => { return { name: `Burnt ${t.name}`, value: 2 };})
  ];
  const statuses = trackers.trackers.filter(tracker => tracker.mode && Object.values(tracker.stages).filter(value => value).length > 0);
  const tags = trackers.trackers.filter(tracker => tracker.mode && Object.values(tracker.stages).filter(value => value).length === 0);
  const allStatusesBonus = statuses.filter(tracker => getTrackerValue(tracker, 'status') !== 0).map(tracker => {
    return { name: tracker.name, value: getTrackerValue(tracker, 'status') };
  });
  const tagsBonus = tags.filter(tracker => getTrackerValue(tracker, 'tag') !== 0).map(tracker => {
    return { name: tracker.name, value: getTrackerValue(tracker, 'tag') };
  });
  const statusesBonus = (() => {
    const positives = allStatusesBonus.filter(b => b.value > 0);
    const negatives = allStatusesBonus.filter(b => b.value < 0);
    const maxPositive = positives.reduce((best, curr) => (curr.value > best.value ? curr : best), positives[0]);
    const minNegative = negatives.reduce((best, curr) => (curr.value < best.value ? curr : best), negatives[0]);
    return [maxPositive, minNegative].filter(Boolean);
  })();
  return [...themeBonus, ...backpackBonus, ...statusesBonus, ...tagsBonus].map(b => {
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
  --color-palette-highlight: var(--color-palette-neon);

  background-color: rgb(41 36 53 / 90%);
  border-radius: 5px 5px 0 0;
  border: 2px solid rgb(var(--color-palette-foreground) / 0.15);
  border-bottom: 0;
  box-sizing: border-box;
  padding: 10px;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  box-shadow: 0 0 10px rgb(var(--color-palette-shadow));
  backdrop-filter: blur(2px);
  &__icons {
    display: flex;
    gap: 10px;
    height: 24px;
    padding: 0 5px 0 10px;
    .svg-icon {
      width: auto;
      height: 100%;
      fill: var(--color-text-tertiary);
      transition: fill 0.3s ease;
    }
  }
  &:hover {
    .roller__icons {
      .svg-icon {
        width: auto;
        height: 100%;
        &--Self {
          fill: rgb(var(--color-self));
        }
        &--Mythos {
          fill: rgb(var(--color-mythos));
        }
        &--Noise {
          fill: rgb(var(--color-noise));
        }
      }
    }
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
    padding-top: 1px;
    min-height: 100%;
    box-sizing: border-box;
  }
  &__custom-bonus {
    width: 100px;
    //margin-top: 2px;
  }
  .roller__power, .roller__custom-bonus { 
    .title {
      text-align: center;
    }
    .value {
      display: block;
      text-align: center;
      margin-top: 1px;
      cursor: help;
      color: var(--color-text-primary);
      font-size: var(--font-size-xlarge);
      font-family: var(--font-family-title);
    }
    .value, :deep(.incrementor-input) {
      .button-minus, .button-plus {
        border-radius: 3px!important;
        font-family: var(--font-family-title);
        font-size: var(--font-size-xlarge);
        color: var(--color-text-secondary);
        box-sizing: border-box;
        height: 2.5rem;
        line-height: 1.25rem;
        border: 1px solid transparent;
        display: grid;
        &:hover {
          border: 1px solid rgb(var(--color-palette-highlight));
          color: rgb(var(--color-palette-highlight));
          background: rgb(var(--color-palette-shadow) / 0.25);
        }
      }
      input {
        color: var(--color-text-primary);
        font-size: var(--font-size-xlarge);
        font-family: var(--font-family-title);
      }
    }
  }
  .title:not(.roller__roll) {
    font-size: 10px;
    font-family: var(--font-family-body);
    color: var(--color-text-secondary);
  }
  &__roll {
    background-color: rgb(var(--color-palette-foreground) / 0.05);
    border-radius: 5px;
    color: var(--color-herocard-title);
    border: 2px solid rgb(var(--color-palette-foreground) / 0.15);
    width: 100px;
    margin-left: 10px;
    color: var(--color-text-primary);
    font-size: var(--font-size-xlarge);
    font-family: var(--font-family-body);
    text-transform: uppercase;
    font-weight: normal;
    height: 39px;
    &:hover {
      background-color: rgb(var(--color-palette-shadow) / 0.25);
      border: 2px solid rgb(var(--color-palette-highlight));
      color: rgb(var(--color-palette-highlight));
    }
  }
}
</style>