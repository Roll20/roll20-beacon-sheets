<template>
  <VDropdown :distance="6">
    <button :class="{ 'filter-button': true, 'filter-button--active': filterValues.length > 0 }">
      <SvgIcon icon="filter" />
    </button>

    <template #popper>
      <div class="container">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="filterValues.length === 0"
            @change="filterValues = []"
          />
          {{ $t('titles.all') }}
        </label>
        <hr/>
        <div class="filter-list">
          <label v-for="(filterOption, index) in filterOptions" :key="filterOption.label" class="filter-list__item">
            <input type="checkbox" v-model="filterValues" :value="index"/>
            {{ filterOption.label }}
          </label>
        </div>
      </div>
    </template>
  </VDropdown>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SvgIcon from './SvgIcon.vue';

type FilterOption = {
  label: string;
  property: string;
  value: any;
}

const props = defineProps<{
  list: any[];
  filterOptions: FilterOption[];
}>();

const filterValues = ref([]);

const activeFilters = computed(() => filterValues.value.map(index => props.filterOptions[index]));

const filteredList = computed(() => {
  if(activeFilters.value.length === 0) return props.list;
  
  return props.list.filter(item => {
    return activeFilters.value.some(option => {
      return item[option.property] === option.value;
    });
  });
});

defineExpose({
  filteredList
});

</script>

<style lang="scss" scoped>
.container {
  padding: 10px;
}
.filter-button {
  width: 12px;
  height: 12px;
  .svg-icon {
    width: 100%;
    height: 100%;
  }
  :deep(.svg-icon) {
    svg {
      fill: var(--styledbox-detail);
    }
  }
  &--active {
    :deep(.svg-icon) {
      svg {
        fill: var(--color-highlight);
      }
    }
  }
}
hr {
  border: none;
  border-top: 1px solid #CCC;
}
.filter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  &__item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>