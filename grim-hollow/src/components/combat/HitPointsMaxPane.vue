<template>
  <div class="hit-points-max box">
    <div class="box__header">
      <SidebarLink
        componentName="HitPointsSidebar"
        :options="{
          title: $t('actions.edit-hit-points'),
          hasSave: true,
        }"
        :label="`${$t('titles.hit-points-max')}`"
      />
    </div>
    <div class="box__content">
      <span>{{ combat.getHitPointsMax().value.final }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';



const { t } = useI18n();
const combat = useCombatStore();
</script>
<style lang="scss">
</style>
