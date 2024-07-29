<template>
  <button 
    v-if="!editing"
    class="attribute-view"
  >
      <label 
        class="attribute-view__label"
        :for="`attribute-view-${attribute.toLowerCase()}`"
      >
        {{ label }}
      </label>
      <span 
        class="attribute-view__total"
        data-testid="attribute-view-total"
      >
        {{ total }}
      </span>
  </button>
  <div 
    v-else
    class="attribute-edit"
  >
    <label
      class="attribute-edit__label"
      >
      {{ label }} Base:
    </label>
    <input 
      class="attribute-edit__base"
      v-model="attributeBase"
      type="number"
    >
    <button 
      @click="setModifyingToAttribute()"
      @mouseover="showTooltip = true"
      @focus="showTooltip=true"
      @blur="showTooltip=false"
      @mouseleave="showTooltip = false"
      ref="reference"
      class="icon-button icon-button--calculate attribute-edit__modifiers-button"
    >
      <label class="sr-only">
        Modifiers
      </label>
    </button>
    <ul 
      v-if="showTooltip"
      ref="floating"
      :style="floatingStyles"
      class="modifiers-display"
      data-testid="modifiers-tooltip"
    >
      <li 
        v-for="modifier, index in modifiers"
        :data-testid="`popover-modifier-${index}`"
        class="modifiers-display__modifier-wrapper"
        >
        <div 
          v-if="modifier.operation && modifier.value"
          class="modifiers-display__modifier-value"
          :data-testid="`popover-modifier-${index}-value`"
        >
          <span>{{ getOperationSymbol(modifier.operation) }}</span>
          <span>{{ modifier.value }}</span>
        </div>
        <div
          :data-testid="`popover-modifier-${index}-note`"
          class="modifiers-display__note"
        >
          {{ modifier.note ?? "Custom Value" }}
        </div>
      </li>
    </ul>
  </div>

</template>

<script setup lang="ts">
import { AttributeModifier, useAttributeStore } from '@/sheet/stores/attributeStore/attributeStore';
import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
import { AttributeKey, AttributesEnum } from '@/system/gameTerms';
import { getOperationSymbol } from '@/utility/getSymbols';
import { offset, useFloating } from '@floating-ui/vue';
import { computed, ref } from 'vue';

export type AttributeInterfaceProps = {
  attribute: AttributeKey
}

const props = defineProps<AttributeInterfaceProps>();

const uiStore = useUIStore();
const attributeStore = useAttributeStore();

const editing = computed(() => {
  return uiStore.editMode
});

const attribute = computed(() => props.attribute);
const total = computed(() => attributeStore[attribute.value])
const label = computed(() => attributeStore.fields[attribute.value].label)
const modifiers = computed<Partial<AttributeModifier>[]>(() => 
  attributeStore.fields[attribute.value].modifiers 
  || [{note: `No ${AttributesEnum[attribute.value]} Modifiers. Click to add some!`}]
)

const attributeBase = computed({
  get: () => attributeStore.fields[attribute.value].base,
  set: (newValue) => {
    attributeStore.fields[attribute.value].base = newValue
  }
})

const setModifyingToAttribute = () => {
  uiStore.modifyingStat = attribute.value;
}

const reference = ref(null);
const floating = ref(null);
const showTooltip = ref(false)

const {floatingStyles} = useFloating(reference, floating, {
  placement: "right",
  middleware: [offset(16)]
})

</script>

<style lang="scss">
@use "../../../common/scss/common.scss";
@use "../../../common/scss/vars.scss";

.modifiers-display {
  padding: 8px;
  background: var(--popover-background);
  max-width: 20%;
}

.attribute-view {
  cursor: pointer;

  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;
  justify-items: center;

  background: white;

  padding: 2px;

  border: 1px solid var(--primary-border-color);
  border-radius: 4px;

  * {
    cursor: pointer;
  }

  &__label {
    text-transform: uppercase;
    color: var(--primary-text-color);
  }

  &__total {
    grid-column: span 1;
    width: 100%;
    box-sizing: border-box;
    text-align: center;

    border: none;
    padding: 0;

    -moz-appearance: textfield;
    &::-webkit-outer-spin-button
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }
}

.attribute-edit {
  display: grid;
  grid-column: span 6;
  grid-template-columns: subgrid;

  justify-items: center;

  &__label {
    grid-column: span 3;
    color: var(--label-color);
  }

  &__base {
    grid-column: span 2;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }
}
</style>