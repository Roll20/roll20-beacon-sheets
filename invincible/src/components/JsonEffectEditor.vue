<template>
  <codemirror
    v-model="modelValue"
    :extensions="cmExtensions"
    @blur="emit('blur')"
    :style="{ height: '200px' }"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { z } from 'zod';
import { Codemirror } from 'vue-codemirror';
import { lintGutter } from '@codemirror/lint';
import { jsonSchema } from 'codemirror-json-schema';
import { validKeys } from '@/schemas/common/SingleEffectSchema';
import { operationPriority } from '@/system/effects/operationPriority';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur'): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const UnifiedSingleEffectSchema = z.object({
  _id: z.string().optional(),
  attribute: z.enum(validKeys as any),
  operation: z.enum(Object.keys(operationPriority) as any),
  value: z.union([z.number(), z.string(), z.string().array()]),
  disabled: z.boolean().optional(),
  label: z.string().optional(),
  isFormula: z.boolean().optional(),
});

const schemaObj = z.toJSONSchema(z.array(UnifiedSingleEffectSchema));

const cmExtensions = [lintGutter(), ...jsonSchema(schemaObj as any)];
</script>
