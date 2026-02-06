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

</script>
<style lang="scss">
.box__content {
  position: relative;
}
</style>
