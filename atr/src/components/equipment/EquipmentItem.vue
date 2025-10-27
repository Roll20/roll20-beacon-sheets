<template>
  <div class="equipment-item">
    <details class="accordion">
      <summary class="accordion__summary">
        <div class="equipment-item__summary-grid">
          <input
            type="checkbox"
            class="equipment-item__equipped"
            :checked="equipment.equipped"
            @change="
              store.update({
                _id: equipment._id,
                equipped: ($event.target as HTMLInputElement).checked,
              })
            "
            :title="$t('titles.equipped')"
            @click.stop
          />
          <SidebarLink
            componentName="EquipmentSidebar"
            :props="{ equipment: equipment }"
            :options="{
              title: t('actions.edit-equipment'),
              hasSave: true,
              hasDelete: true,
            }"
            :label="`${equipment.name} (${equipment.quantity})`"
            class="equipment-item__name"
          />
          <span class="equipment-item__weight">
            {{ (equipment.weight * equipment.quantity).toFixed(1) }} {{ $t('titles.unit-lbs') }}
          </span>
        </div>
      </summary>
      <div class="accordion__details equipment-item__details">
        <div
          v-if="equipment.description"
          class="description"
          v-html="parsedDescription"
        ></div>
        <div v-if="equipmentTags.length" class="tags">
          <span v-for="tag in equipmentTags" :key="tag._id" class="tag-pill">
            {{ tag.text }}
          </span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { type Equipment, useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { computed } from 'vue';
import { useTagsStore, type Tag } from '@/sheet/stores/tags/tagsStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { parseSimpleMarkdown } from '@/utility/markdownParser';

const { t } = useI18n();

const props = defineProps<{
  equipment: Equipment;
}>();

const store = useEquipmentStore();
const tagsStore = useTagsStore();
const parsedDescription = computed(() => parseSimpleMarkdown(props.equipment.description));


const equipmentTags = computed<Tag[]>(() => {
  const group = tagsStore.tagGroups.find((g) => g._id === props.equipment.tagId);
  return group ? group.tags : [];
});
</script>

<style lang="scss" scoped>
.equipment-item {
  &__summary-grid {
    display: grid;
    grid-template-columns: min-content 1fr max-content;
    gap: var(--size-gap-medium);
    align-items: center;
    width: 100%;
  }

  &__name {
    font-weight: bold;
    justify-self: start;
  }

  &__weight {
    color: var(--color-tertiary);
    justify-self: end;
  }
  
  padding-left: 0;
    padding-top: 0.5rem;
  
  &__description {
    white-space: pre-wrap;
    color: var(--color-secondary);
    font-size: var(--size-font-small);
  }
}
</style>
