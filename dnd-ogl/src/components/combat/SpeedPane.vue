<template>
  <div class="speed box">
    <div class="box__header">
      <SidebarLink
        componentName="SpeedSidebar"
        :options="{
          title: t('actions.edit-speed'),
          hasSave: true,
        }"
        :label="`${t('titles.speed')}`"
      />
    </div>
    <div class="box__content">
      <span class="speed__value">{{ walkSpeed }}</span>
      <SvgIcon class="info-icon" icon="info" v-if="otherSpeedsTooltip" v-tooltip="{ theme: 'info', content: otherSpeedsTooltip, html: true }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { config } from '@/config';
import SvgIcon from '../shared/SvgIcon.vue';

const { t } = useI18n();
const combat = useCombatStore();
const walkSpeed = computed(() => combat.getSpeed('walk').value.final);

const otherSpeedsTooltip = computed(() => {
  const otherSpeedEntries = config.speeds
    .filter((key) => key !== 'walk')
    .map((key) => {
      const calculated = combat.getSpeed(key);
      const description = combat.speed[key]?.description;
      if (calculated.value.final > 0) {
        let entry = `${t(`titles.speeds.${key}`)}: ${calculated.value.final}`;
        if (description) {
          entry += ` (${description})`;
        }
        return `<span>${entry}</span>`;
      }
      return null;
    })
    .filter(Boolean);

  return otherSpeedEntries.length > 0 ? otherSpeedEntries.join('<br/>') : null;
});
</script>

<style lang="scss">
.box__content {
  position: relative;
}
</style>
