<template>
  <input
    type="text"
    v-model.lazy="inputValue"
    v-tooltip="tooltipInfo"
    @keydown="handleKeydown"
    @click.alt.exact="() => { if (allowAdvancedEditing) isEditingExpression = true }"
    @blur="isEditingExpression = false"
    :class="[
      props.unstyled ? '' : 'w-full',
      !props.unstyled && 'rounded-md border px-3 py-2',
      props.modifiedValue.error
        ? (props.unstyled ? 'text-red-900' : 'border-red-500 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500')
        : (props.unstyled ? '' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500')
    ]"
    :placeholder="String(modifiedValue.rawValue)"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { calculateModifiedValue, type ModifiedValue } from '@/system/effects/calculateModifiedValue';
import { simplify } from 'mathjs';
import { characterStore } from '@/sheet/stores';
import i18n from '@/i18n/i18n';

const { t } = i18n.global;

const props = withDefaults(defineProps<{
  modifiedValue?: ModifiedValue;
  allowAdvancedEditing?: boolean;
  unstyled?: boolean;
  min?: number;
  max?: number;
}>(), {
  modifiedValue: () => ({ value: 0, modifiers: [], baseValue: 0 }),
  allowAdvancedEditing: () => false,
  unstyled: () => false,
  min: undefined,
  max: undefined
});

const emit = defineEmits<{
  (e: 'update:baseValue', value: number | string): void;
}>();

const isEditingExpression = ref(false);

const handleKeydown = (event: KeyboardEvent) => {
  
  if (isEditingExpression.value || props.modifiedValue.error) return;

  
  if (
    event.key.length > 1 || 
    event.ctrlKey || 
    event.metaKey || 
    event.altKey
  ) {
    return;
  }

  const inputElement = event.target as HTMLInputElement;
  const cursorPosition = inputElement.selectionStart;

  
  if (event.key === '-') {
    const hasMinus = inputElement.value.includes('-');
    const selectionCoversMinus = hasMinus && 
      (inputElement.value.substring(inputElement.selectionStart || 0, inputElement.selectionEnd || 0).includes('-'));

    if (cursorPosition !== 0 || (hasMinus && !selectionCoversMinus)) {
      event.preventDefault();
    }
    return;
  }

  
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
};

const adjustFormula = (formula: string, delta: number): string => {
  if (delta === 0) return formula;

  const varMap: Record<string, string> = {};
  let tempVarCounter = 0;

  
  const replacedFormula = formula.replace(/@\{([a-zA-Z0-9_-]+)\}/g, (match) => {
    if (!varMap[match]) {
      const tempVar = `var_${tempVarCounter++}`;
      varMap[match] = tempVar;
    }
    return varMap[match];
  });

  
  const expressionToSimplify = `(${replacedFormula}) + (${delta})`;

  try {
    const simplified = simplify(expressionToSimplify).toString();

    
    let restored = simplified;
    const sortedVars = Object.entries(varMap).sort((a, b) => b[1].length - a[1].length);
    for (const [original, temp] of sortedVars) {
      const pattern = new RegExp(`(?<![a-zA-Z0-9_])${temp}(?![a-zA-Z0-9_])`, 'g');
      restored = restored.replace(pattern, original);
    }

    
    return restored
      .replace(/\+/g, ' + ')
      .replace(/(?<!@\{[^{}]*)-/g, ' - ') 
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    
    const sign = delta >= 0 ? ' + ' : ' - ';
    return `${formula}${sign}${Math.abs(delta)}`;
  }
};

const inputValue = computed({
  get: () => isEditingExpression.value ? props.modifiedValue.baseValue : props.modifiedValue.value,
  set: (newValue: string | number) => {
    if (isEditingExpression.value || props.modifiedValue.error) {
      
      emit('update:baseValue', newValue);
      return;
    }

    const valStr = String(newValue).trim();
    const attr = props.modifiedValue.attributes?.[0];

    if (valStr === '') {
      emit('update:baseValue', '');
      if (attr) {
        const sheet = characterStore();
        sheet.effects.remove(`${attr}_custom`);
      }
      return;
    }

    let parsedNewValue = Number(newValue);
    if (isNaN(parsedNewValue)) {
      
      emit('update:baseValue', newValue);
      return;
    }

    if (props.min !== undefined && parsedNewValue < props.min) parsedNewValue = props.min;
    if (props.max !== undefined && parsedNewValue > props.max) parsedNewValue = props.max;

    if (attr) {
      const sheet = characterStore();
      const customEffectId = `${attr}_custom`;
      const existingEffect = sheet.effects.effects.value.find((e: any) => e._id === customEffectId);
      const existingCustomValue = existingEffect ? Number(existingEffect.value) || 0 : 0;

      const currentTotal = Number(props.modifiedValue.value);
      if (!isNaN(currentTotal)) {
        const newCustomValue = parsedNewValue - currentTotal + existingCustomValue;
        sheet.effects.updateEffect({
          _id: customEffectId,
          attribute: attr as any,
          value: newCustomValue,
          operation: 'add',
          label: t('sheet.custom_adjustment')
        });
      } else {
        const currentBase = Number(props.modifiedValue.baseValue);
        if (!isNaN(currentBase)) {
          sheet.effects.updateEffect({
            _id: customEffectId,
            attribute: attr as any,
            value: parsedNewValue - currentBase,
            operation: 'add',
            label: t('sheet.custom_adjustment')
          });
        } else {
          emit('update:baseValue', parsedNewValue);
        }
      }
    } else {
      
      const currentTotal = Number(props.modifiedValue.value);
      const currentBase = Number(props.modifiedValue.baseValue);

      if (!isNaN(currentBase)) {
        if (!isNaN(currentTotal)) {
          const modifiersSum = currentTotal - currentBase;
          const newBase = parsedNewValue - modifiersSum;
          emit('update:baseValue', newBase);
        } else {
          emit('update:baseValue', parsedNewValue);
        }
      } else {
        if (!isNaN(currentTotal)) {
          const delta = parsedNewValue - currentTotal;
          const adjusted = adjustFormula(String(props.modifiedValue.baseValue), delta);
          emit('update:baseValue', adjusted);
        } else {
          emit('update:baseValue', parsedNewValue);
        }
      }
    }
  }
});

const tooltipInfo = computed(() => {
  if (props.modifiedValue.error) {
    return props.modifiedValue.error;
  }
  if (!props.modifiedValue.modifiers || props.modifiedValue.modifiers.length === 0) {
    return 'No modifiers';
  }
  
  const hasValidBase = props.modifiedValue.baseValue !== undefined && props.modifiedValue.baseValue !== null && props.modifiedValue.baseValue !== '';
  const isBaseZero = props.modifiedValue.baseValue === 0 || props.modifiedValue.baseValue === '0';
  
  let baseContent = '';
  if (hasValidBase && !isBaseZero) {
    baseContent = `Base: ${props.modifiedValue.baseValue}<br/>`;
  }

  const content = baseContent +
    props.modifiedValue.modifiers.map(m => {
      let name = m.name;
      if (isBaseZero && name === 'Custom Adjustment') {
        name = 'Base';
      }
      return `${name}: ${m.value}`;
  }).join('<br/>');

  return { content, html: true };
});
</script>
