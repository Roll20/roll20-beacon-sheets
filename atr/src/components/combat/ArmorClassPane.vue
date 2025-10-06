<template>
  <div class="armor-class box">
    <div class="box__header">
      <SidebarLink
        componentName="ArmorClassSidebar"
        :options="{
          title: t('actions.edit-armor-class'),
          hasSave: true,
        }"
        :label="`${t('titles.armor-class')}`"
      />
    </div>
    <div class="box__content">
      <span>{{ combat.getArmorClass().value.final }}</span>
      <SvgIcon class="info-icon" icon="info" v-if="hasBallisticInformation" v-tooltip="{ theme: 'info', content: getAllArmorClasses, html: true }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import SvgIcon from '../shared/SvgIcon.vue';

const { t } = useI18n();
const combat = useCombatStore();

const hasBallisticInformation = computed(() => {
  return (
    (combat.getBallisticArmorClass().value.final && combat.getBallisticArmorClass().value.final !== 10) ||
    combat.getBallisticResistance().value.final > 0
  );
});

const getAllArmorClasses = computed(() => {
  if (!hasBallisticInformation.value) {
    return '';
  } else {
    const acs = [
      `<span>${t('titles.base-ac')}: ${combat.getArmorClass().value.final}</span>`,
      `<span>${t('titles.ballistic-ac')}: ${combat.getBallisticArmorClass().value.final}</span>`,
      `<span>${t('titles.ballistic-resistance')}: ${combat.getBallisticResistance().value.final}</span>`,
    ];
    return acs.join('<br/>');
  }
});
</script>
<style lang="scss">
.box__content {
  position: relative;
}
</style>
