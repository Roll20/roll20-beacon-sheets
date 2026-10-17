<template>
  <!-- display: contents lets each widget sit in the header row beside HP and Stunts. -->
  <div v-if="settings.anyPowerSource" class="mp-view">
    <PowerPoolBar
      v-for="id in settings.pointsPowerSources"
      :key="id"
      :source-id="id"
    />
    <PowerFatigueTracker v-if="settings.usesPowerFatigue" />
    <div v-if="settings.tracksEldritchPrice" class="bio-sub-fixed">
      <EldritchPriceView />
    </div>
  </div>
</template>
<script setup>
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import PowerPoolBar from "@/components/magic/PowerPoolBar.vue";
import PowerFatigueTracker from "@/components/magic/PowerFatigueTracker.vue";
import EldritchPriceView from "@/components/magic/EldritchPriceView.vue";

const settings = useSettingsStore();
</script>
<style scoped>
.mp-view {
  display: contents;
}
</style>
