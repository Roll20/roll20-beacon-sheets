<script setup>

import { useSheetStore } from '@/stores/sheetStore';

import SplitMods from '@/components/SplitMods.vue';
import BackgroundItems from '@/components/BackgroundItems.vue';
import ImageBackedLabel from '@/components/ImageBackedLabel.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import NotchContainer from '@/components/NotchContainer.vue';
import GoalTallies from '@/components/GoalTallies.vue';

const sheet = useSheetStore();
</script>

<template>
  <div class="backgroundItems-view">
    <BackgroundItems />
  </div>
  <h4>Goal Tallies</h4>
    <NotchContainer class="tallies">
      <GoalTallies name="club" />
    </NotchContainer>
</template>
