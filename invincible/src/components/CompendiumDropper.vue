<template>
  <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4 max-w-xl mx-auto my-6 font-sans">
    <div class="border-b border-gray-100 pb-3">
      <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        Compendium Dropper Simulator
      </h3>
      <p class="text-sm text-gray-500 mt-1">Mock and test drag-and-drop payloads against Zod schemas.</p>
    </div>

    
    <div class="space-y-1.5">
      <label for="category" class="text-sm font-semibold text-gray-700">Target Category</label>
      <select
        id="category"
        v-model="selectedCategoryIndex"
        class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option v-for="(item, idx) in compendium" :key="item.category" :value="idx">
          {{ item.category }}
        </option>
      </select>
    </div>

    
    <div class="space-y-1.5">
      <label class="text-sm font-semibold text-gray-700">Drop Payload (JSON or Raw Text)</label>
      <div class="border border-gray-300 rounded-md overflow-hidden shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <codemirror
          v-model="payloadText"
          :extensions="cmExtensions"
          :style="{ height: '200px' }"
        />
      </div>
      <div class="flex justify-end">
        <button
          type="button"
          @click="loadExample"
          class="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 font-semibold transition"
        >
          Load Example Template
        </button>
      </div>
    </div>

    
    <div v-if="payloadText.trim()" class="space-y-2">
      <div v-if="validation.success" class="p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <div>
          <div class="text-sm font-bold text-green-800">Payload Valid</div>
          <div class="text-sm text-green-700 mt-1 font-mono break-all">{{ JSON.stringify(validation.data) }}</div>
        </div>
      </div>
      <div v-else class="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <div class="text-sm font-bold text-red-800">Validation Failed</div>
          <div class="text-sm text-red-700 mt-1">{{ validation.error }}</div>
        </div>
      </div>
    </div>

    
    <div class="flex items-center gap-2 text-base text-gray-700 select-none">
      <input
        type="checkbox"
        id="clearOnDrop"
        v-model="clearOnDrop"
        class="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
      />
      <label for="clearOnDrop" class="cursor-pointer font-medium">Clear on Drop</label>
    </div>

    
    <button
      type="button"
      @click="triggerDrop"
      :disabled="!validation.success"
      class="w-full px-4 py-2 bg-primary text-gray-900 font-semibold rounded-md shadow-sm transition hover:bg-opacity-90 active:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-1.5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Simulate Drop & Apply
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { z } from 'zod';
import { compendium } from '@/schemas/compendium';
import { validateEntry, applyCompendiumData, getCompendiumWrapperPlaceholder, makeSchemaPartial } from '@/utility/compendiumDrop';
import { Codemirror } from 'vue-codemirror';
import { lintGutter } from '@codemirror/lint';
import { jsonSchema } from 'codemirror-json-schema';
import { disableErrorLogging } from 'best-effort-json-parser';

try {
  disableErrorLogging();
} catch (e) {
  console.warn('Failed to disable JSON parser error logging:', e);
}

const selectedCategoryIndex = ref(0);
const payloadText = ref('');
const clearOnDrop = ref(true);

const currentItem = computed(() => compendium[selectedCategoryIndex.value]);

const cmExtensions = computed(() => {
  if (!currentItem.value) return [];
  try {
    const wrappedZodSchema = z.object({
      categoryName: z.string().optional(),
      'data-payload': makeSchemaPartial(currentItem.value.schema),
      'data-children': z.array(
        z.object({
          categoryName: z.string(),
          'data-payload': z.record(z.string(), z.any()).optional(),
          'data-children': z.array(z.any()).optional()
        }).passthrough()
      ).optional()
    }).passthrough();

    const schemaObj = z.toJSONSchema(wrappedZodSchema);
    return [lintGutter(), ...jsonSchema(schemaObj as any)];
  } catch (err) {
    console.error('Failed to generate json schema for codemirror:', err);
    return [lintGutter()];
  }
});

const validation = computed(() => {
  if (!currentItem.value) {
    return { success: false, error: 'No category selected' };
  }
  return validateEntry(payloadText.value, currentItem.value.schema);
});

watch(selectedCategoryIndex, () => {
  payloadText.value = '';
});

function loadExample() {
  if (!currentItem.value) return;
  payloadText.value = getCompendiumWrapperPlaceholder(currentItem.value);
}

function triggerDrop() {
  if (!validation.value.success || !currentItem.value) return;

  try {
    if (currentItem.value.onApply) {
      currentItem.value.onApply(validation.value.data.node?.data ?? validation.value.data);
    } else {
      const rawTarget = currentItem.value.target;
      const resolvedTarget = typeof rawTarget === 'function' ? rawTarget() : rawTarget;
      applyCompendiumData(validation.value.data, resolvedTarget);
    }
    
    if (clearOnDrop.value) {
      payloadText.value = '';
    }
  } catch (err: any) {
    console.error('Failed to apply drop:', err);
  }
}
</script>
