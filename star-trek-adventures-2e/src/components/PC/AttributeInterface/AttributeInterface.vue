<template>
  <div v-if="!editing">
    <label>{{ label }}</label>
    <input type="number" disabled :value="total">
  </div>
  <div v-else>
    <label>{{ label }} Base:</label>
    <input 
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
      class="icon-button icon-button--calculate"
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

</style>