<template>
  <NineSlicedBox theme="inspiration">
    <div class="section section--inspiration">
      <div class="section__header">
        <h3>{{ $t('titles.inspiration') }}</h3>
      </div>
      <div class="section__score">
        <RangeBar
          :count="combat.inspiration"
          :max="1"
          @update="(n:number) => (combat.inspiration = n)"
          icon="dragon"
        />
      </div>
    </div>
  </NineSlicedBox>
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import RangeBar from '../shared/RangeBar.vue';
import { useI18n } from 'vue-i18n';
import StyledBox from '../shared/StyledBox.vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';

const { t } = useI18n();
const combat = useCombatStore();

const resetInspiration = () => {
  combat.inspiration = 0;
};
</script>

<style lang="scss" scoped>
.section--inspiration {
  display: grid;
  grid-template-columns: 1fr 48px;
  align-items: center;
  .section__header {
    h3 {
      text-align: left;
      padding: 0 10px;
    }
  }
  .range-bar {
    :deep(.range-bar__option) {
      border-color: transparent!important;
      width: 24px;
      height: 24px;
      .svg-icon {
        width: 100%;
        height: 100%;
      }
    }
    :deep(.range-bar__option--checked) {
      border-color: transparent!important;
      .svg-icon {
        svg {
          fill: var(--rollbonus-color);
        }
      }
    }
  }
}
</style>