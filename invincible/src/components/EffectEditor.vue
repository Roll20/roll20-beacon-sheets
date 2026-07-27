<template>
  <div class="effect-editor flex flex-col gap-2">
    
    <div class="effect-editor-header flex flex-col sm:flex-row justify-between items-start sm:items-center border-2 border-black bg-zinc-100 p-2 font-space-grotesk font-black uppercase text-xs gap-2">
      <div class="flex gap-[10px] items-center">
        <div class="relative w-[24px] h-[24px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center bg-white">
          <input type="checkbox" v-model="localDisabled" @change="validateAndSave" class="absolute top-0 left-0 w-full h-full opacity-0 box-border cursor-pointer" />
          <span v-if="localDisabled" class="material-symbols-outlined text-base font-black select-none text-black">check</span>
        </div>
        <span class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider select-none">Disabled</span>
      </div>

      <div v-if="modes.length > 1" class="mode-tabs flex border-2 border-black bg-zinc-200 p-0.5 gap-0.5 self-stretch sm:self-auto">
        <button 
          v-for="modeOption in modes" 
          :key="modeOption"
          @click="switchMode(modeOption)"
          type="button"
          :class="[
            'px-3 py-1 text-xs font-black uppercase tracking-wider transition-all cursor-pointer focus:outline-none', 
            mode === modeOption ? 'bg-primary-container text-primary-foreground border border-black' : 'bg-white hover:text-black text-zinc-400 border border-transparent'
          ]"
        >
          {{ modeOption }}
        </button>
      </div>
    </div>

    
    <LazyTextarea
      v-if="mode === 'text'"
      v-model="localText"
      @blur="prettifyText(); validateAndSave()"
      :placeholder="placeholder"
      class="w-full border-2 border-black p-2 min-h-[150px] font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
      :class="error ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-black'"
      spellcheck="false"
    />

    
    <div v-else-if="mode === 'json'" :class="['border-2 border-black overflow-hidden bg-white', error ? 'border-red-500' : 'border-black']">
      <JsonEffectEditor
        v-model="localText"
        @blur="validateAndSave"
      />
    </div>

    
    <div v-else-if="mode === 'builder'" class="visual-builder border-2 border-black p-3 bg-zinc-50 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
      <div v-if="!Array.isArray(parsedEffects) || parsedEffects.length === 0" class="text-xs font-black uppercase tracking-wider font-space-grotesk text-zinc-400 italic text-center py-6 bg-white border-2 border-dashed border-zinc-400">
        No effects configured yet.
      </div>
      
      <div v-else v-for="(effect, index) in parsedEffects" :key="index" class="effect-row flex flex-wrap gap-x-4 gap-y-2 items-end bg-white p-3 border-2 border-black relative group transition-all hover:bg-zinc-50">
        
        <div class="flex-1 min-w-[150px]">
          <label class="block font-space-grotesk font-black uppercase text-[10px] text-zinc-500 mb-1 tracking-wider">Attribute</label>
          <select v-model="effect.attribute" @change="syncFromBuilder" class="w-full text-sm border-2 border-black font-bold p-1.5 bg-white focus:outline-none cursor-pointer">
            <option v-for="key in validKeys" :key="key" :value="key">{{ key }}</option>
          </select>
        </div>

        <div class="flex-1 min-w-[140px]">
          <label class="block font-space-grotesk font-black uppercase text-[10px] text-zinc-500 mb-1 tracking-wider">Operation</label>
          <select v-model="effect.operation" @change="syncFromBuilder" class="w-full text-sm border-2 border-black font-bold p-1.5 bg-white focus:outline-none cursor-pointer">
            <option v-for="op in Object.keys(operationPriority)" :key="op" :value="op">{{ op }}</option>
          </select>
        </div>

        <div class="flex-1 min-w-[120px]">
          <label class="block font-space-grotesk font-black uppercase text-[10px] text-zinc-500 mb-1 tracking-wider">Value</label>
          <input
            v-if="effect.operation?.endsWith('-formula')"
            type="text"
            v-model="effect.value"
            @blur="syncFromBuilder"
            v-tooltip="formulaErrors[index]
              ? (formulaErrors[index].isValid ? `= ${formulaErrors[index].value}` : formulaErrors[index].error)
              : ''"
            :class="[
              'w-full text-sm border-2 border-black focus:outline-none p-1.5 bg-white placeholder-zinc-400 font-mono font-bold',
              formulaErrors[index] && !formulaErrors[index].isValid
                ? 'border-red-500 bg-red-50 text-red-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-black focus:ring-1 focus:ring-black'
            ]"
            placeholder="formula expression"
          />
          <input
            v-else
            type="number"
            v-model.number="effect.value"
            @blur="syncFromBuilder"
            class="w-full text-sm border-2 border-black p-1.5 bg-white focus:outline-none font-bold placeholder-zinc-400 focus:ring-1 focus:ring-black"
            placeholder="0"
            step="any"
          />
        </div>

        <div class="flex-1 min-w-[120px]">
          <label class="block font-space-grotesk font-black uppercase text-[10px] text-zinc-500 mb-1 tracking-wider">Label</label>
          <input
            type="text"
            v-model="effect.label"
            @blur="syncFromBuilder"
            class="w-full text-sm border-2 border-black p-1.5 bg-white focus:outline-none font-bold placeholder-zinc-400 focus:ring-1 focus:ring-black"
            placeholder="optional label"
          />
        </div>
        
        <div class="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 mt-2 sm:mt-0 pb-1">
           <div class="flex gap-[10px] items-center cursor-pointer">
             <div class="relative w-[24px] h-[24px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center bg-white">
               <input type="checkbox" v-model="effect.disabled" @change="syncFromBuilder" class="absolute top-0 left-0 w-full h-full opacity-0 box-border cursor-pointer" />
               <span v-if="effect.disabled" class="material-symbols-outlined text-base font-black select-none text-black">check</span>
             </div>
             <span class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider select-none">Disable</span>
           </div>

           <button @click="removeEffect(index)" class="text-zinc-500 hover:text-white p-1.5 bg-white hover:bg-red-800 border-2 border-black action-shadow-xs transition-all cursor-pointer focus:outline-none" title="Remove Effect">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
           </button>
        </div>
      </div>
      
      <button @click="addEffect" class="mt-1 text-xs font-black font-space-grotesk uppercase tracking-wider text-black bg-white hover:bg-zinc-100 p-2 border-2 border-black action-shadow-xs transition-colors flex items-center gap-1 cursor-pointer focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Effect Node
      </button>
    </div>

    
    <div v-if="error" class="error text-red-800 text-sm mt-1 bg-red-50 p-2.5 border-2 border-red-600 flex items-start gap-2 font-bold font-space-grotesk uppercase tracking-wide">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, defineAsyncComponent } from 'vue';
import { z } from 'zod';
import { EffectCollectionSchema, type EffectCollection } from '@/schemas/common/EffectCollection';
import { v4 as uuidv4 } from 'uuid';
import { interpolationKeys } from '@/system/interpolation/interpolationKeys';
import { validKeys, EffectStringSchema } from '@/schemas/common/SingleEffectSchema';
import { operationPriority } from '@/system/effects/operationPriority';
import { parseEffectString } from '@/system/effects/parseEffectString';
import { resolveExpression } from '@/system/expression/resolveExpression';
import LazyTextarea from '@/components/LazyTextarea.vue';

const JsonEffectEditor = defineAsyncComponent(() => import('@/components/JsonEffectEditor.vue'));

const MODE_OPTIONS = ['text', 'json', 'builder'] as const;
type EditorMode = typeof MODE_OPTIONS[number];

const props = withDefaults(
  defineProps<{
    modelValue: EffectCollection | string;
    placeholder?: string;
    modes?: EditorMode[];
  }>(),
  {
    placeholder: 'attribute-name+=10;',
    modes: () => ['text', 'json', 'builder'] as EditorMode[],
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: EffectCollection | string): void;
}>();

const mode = ref<EditorMode>(props.modes[0] || 'text');
const localText = ref('');
const localDisabled = ref(false);
const error = ref('');
const parsedEffects = ref<any[]>([]);

const formulaErrors = computed(() =>
  parsedEffects.value.map(eff => {
    if (!eff.operation?.endsWith('-formula') || !eff.value) return null;
    const valueStr = String(eff.value);
    
    if (eff.attribute && valueStr.includes(`@{${eff.attribute}}`)) {
      return {
        expression: valueStr,
        isValid: false,
        value: valueStr,
        error: `Formula for '${eff.attribute}' cannot reference @{${eff.attribute}}.`,
      };
    }
    return resolveExpression(valueStr);
  })
);

const operationToOperator: Record<string, string> = {
  'set-base':  '=',
  'set':       '==',
  'set-final': '===',
  'add':       '+=',
  'subtract':  '-=',
  'multiply':  '*=',
  'set-min':   '>=',
  'set-max':   '<=',
};

function effectsToString(effects: any[]): string {
  return effects.map(eff => {
    const baseOp = String(eff.operation).replace('-formula', '');
    const operator = operationToOperator[baseOp] ?? '=';
    const val = eff.isFormula || typeof eff.value === 'string' && isNaN(Number(eff.value))
      ? `"${eff.value}"`
      : eff.value;
    const label = eff.label ? ` [${eff.label}]` : '';
    return `${eff.attribute} ${operator} ${val}${label};`;
  }).join('\n');
}

function stripIds(effects: any): any {
  if (!Array.isArray(effects)) return effects;
  return effects.map(eff => {
    if (eff && typeof eff === 'object') {
      const copy = { ...eff };
      delete copy._id;
      return copy;
    }
    return eff;
  });
}

function reconcileWithOriginalIds(newEffects: any[]): any[] {
  let originalEffects: any[] = [];
  if (props.modelValue && typeof props.modelValue === 'object') {
    const val = (props.modelValue as any).value;
    if (Array.isArray(val)) {
      originalEffects = val;
    } else if (typeof val === 'string' && val.startsWith('[')) {
      try {
        originalEffects = JSON.parse(val);
      } catch {
        originalEffects = [];
      }
    }
  }

  return newEffects.map((eff, index) => {
    if (eff && typeof eff === 'object') {
      const original = originalEffects[index];
      const _id = eff._id || (original && original._id) || uuidv4();
      return {
        ...eff,
        _id
      };
    }
    return eff;
  });
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (typeof newVal === 'string') {
      localText.value = newVal;
      localDisabled.value = false;
      parsedEffects.value = [];
    } else if (newVal !== undefined && newVal !== null) {
      if (typeof newVal.value === 'string') {
        localText.value = newVal.value;
      } else if (Array.isArray(newVal.value)) {
        if (mode.value === 'text') {
          localText.value = effectsToString(newVal.value);
        } else {
          localText.value = JSON.stringify(stripIds(newVal.value), null, 2);
        }
      } else {
        localText.value = JSON.stringify(newVal.value, null, 2);
      }
      localDisabled.value = newVal.disabled || false;
      if (mode.value === 'builder') {
        parsedEffects.value = reconcileWithOriginalIds(parseCurrentToEffects());
      }
    } else {
      localText.value = '';
      localDisabled.value = false;
      parsedEffects.value = [];
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modes,
  (newModes) => {
    if (newModes && newModes.length && !newModes.includes(mode.value)) {
      mode.value = newModes[0];
    }
  },
  { deep: true }
);

function prettifyText() {
  const effects = parseCurrentToEffects();
  if (effects.length > 0) {
    localText.value = effectsToString(effects);
  }
}

function parseCurrentToEffects(): any[] {
  const trimmed = localText.value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed); } catch { return []; }
  }
  return parseEffectString(trimmed);
}

const switchMode = (newMode: EditorMode) => {
  if (newMode === mode.value) return;

  
  let effects: any[] = [];
  if (mode.value === 'builder') {
    effects = parsedEffects.value;
    
    effects = effects.map(eff => {
      let val = eff.value;
      if (val !== '' && !isNaN(Number(val))) val = Number(val);
      return { ...eff, value: val };
    });
  } else {
    effects = parseCurrentToEffects();
  }

  
  effects = reconcileWithOriginalIds(effects);

  
  if (newMode === 'text') {
    localText.value = effectsToString(effects);
  } else if (newMode === 'json') {
    localText.value = effects.length ? JSON.stringify(stripIds(effects), null, 2) : '';
  } else if (newMode === 'builder') {
    parsedEffects.value = effects;
  }

  mode.value = newMode;
};

const addEffect = () => {
  parsedEffects.value.push({
    _id: uuidv4(),
    attribute: Object.keys(interpolationKeys)[0],
    operation: 'add',
    value: 0,
  });
  syncFromBuilder();
};

const removeEffect = (index: number) => {
  parsedEffects.value.splice(index, 1);
  syncFromBuilder();
};

const syncFromBuilder = () => {
  const cleanedEffects = parsedEffects.value.map(eff => {
    const isFormula = String(eff.operation).endsWith('-formula');
    
    let val = eff.value;
    if (val !== '' && !isNaN(Number(val))) {
      val = Number(val);
    }
    
    const out: any = {
      _id: eff._id || uuidv4(),
      attribute: eff.attribute,
      operation: eff.operation,
      value: val,
    };

    if (eff.disabled) out.disabled = true;
    if (eff.label) out.label = eff.label;
    if (isFormula) out.isFormula = true;

    return out;
  });
  
  
  localText.value = JSON.stringify(stripIds(cleanedEffects), null, 2);
  validateAndSave();
};

const validateAndSave = () => {
  let valueToValidate: any = [];
  
  const trimmed = localText.value.trim();
  
  if (mode.value === 'text' && trimmed) {
    const stringResult = EffectStringSchema.safeParse(trimmed);
    if (!stringResult.success) {
      error.value = stringResult.error.issues ? stringResult.error.issues.map((err: any) => err.message).join('; ') : stringResult.error.message;
      return;
    }
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      valueToValidate = reconcileWithOriginalIds(parsed);
    } catch (err: any) {
      error.value = err.message || 'Invalid JSON';
      return;
    }
  } else if (trimmed) {
    try {
      const parsed = parseEffectString(trimmed);
      valueToValidate = reconcileWithOriginalIds(parsed);
    } catch {
      
    }
  }

  const dataToValidate: any = {
    value: valueToValidate,
    disabled: localDisabled.value,
  };

  if (typeof props.modelValue === 'object' && props.modelValue !== null && 'label' in props.modelValue) {
    dataToValidate.label = props.modelValue.label;
  }

  const result = EffectCollectionSchema.safeParse(dataToValidate);
  
  if (result.success) {
    error.value = '';
    
    if (typeof result.data.value !== 'string' && mode.value === 'json') {
      const currentStripped = JSON.stringify(stripIds(result.data.value), null, 2);
      if (localText.value.trim() !== currentStripped.trim()) {
        localText.value = currentStripped;
      }
    }
    
    emit('update:modelValue', result.data);
  } else {
    error.value = result.error.issues ? result.error.issues.map((err: any) => err.message).join('; ') : result.error.message;
  }
};
</script>

<style lang="scss" scoped>

</style>
