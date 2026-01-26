<template>
  <div class="class-item">
    <div class="columns columns-4">
      <label class="span-3">
        {{ $t('titles.name') }}
        <input
          :value="classData.name"
          @change="e => updateField('name', (e.target as HTMLInputElement).value)"
          required
          :readonly="isClassLocked"
        />
      </label>
      <label class="span-1">
        {{ $t('titles.level') }}:
        <div class="columns columns-5">
        <select
          class="span-3"
          :value="classData.level"
          @input="e => updateField('level', parseInt((e.target as HTMLSelectElement).value))"
        >
          <option v-for="i in 20" :key="i" :value="i">{{ i }}</option>
        </select>
        <button type="button" class="span-2 button button--negative" @click="$emit('remove')"><SvgIcon icon="delete" /></button>
        </div>
      </label>
      <label class="span-2">
        {{ $t('titles.subclass') }}
        <input
          :value="classData.subclass"
          @input="e => updateField('subclass', (e.target as HTMLInputElement).value)"
          :readonly="isSubclassLocked || isClassLocked"
          :placeholder="subclassPlaceholder"
        />
      </label>
      <label class="span-2">
        {{ $t('titles.hit-die') }}
        <select
          :value="classData.hitDie"
          @change="e => updateField('hitDie', (e.target as HTMLSelectElement).value)"
        >
          <option v-for="size in config.hitDieSize" :key="size" :value="`${size}`">{{ size }}</option>
        </select>
      </label>
      <label class="span-2">
        {{ $t('titles.spellcasting') }}
        <select
          :value="classData.spellcasting"
          @change="e => updateField('spellcasting', (e.target as HTMLSelectElement).value as SpellCastingProgression)"
        >
          <option value="none">{{ $t('titles.none') }}</option>
          <option v-for="caster in Object.keys(config.casterTypes)" :key="caster" :value="caster">{{ $t(`titles.spellcasting-types.${caster}`) }} {{ $t(`titles.spellcasting-types.${caster}-examples`) }}</option>
        </select>
      </label>
      <label class="span-2">
        {{ $t('titles.spellcasting-ability') }}
        <select
          :disabled="classData.spellcasting === 'none'"
          :value="spellSourceData.ability"
          @change="e => updateSpellSourceField('ability', (e.target as HTMLSelectElement).value as AbilityKey)"
        >
          <option v-for="ability in config.abilities" :key="ability" :value="ability">
            {{ t(`titles.abilities.${ability}`) }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClassProgression } from '@/sheet/stores/progression/progressionStore';
import type {
  SpellCastingProgression,
  SpellSource,
  StandardSpellSource,
} from '@/sheet/stores/spells/spellsStore';
import { computed } from 'vue';
import { config } from '@/config';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { useI18n } from 'vue-i18n';
import SvgIcon from '../shared/SvgIcon.vue';

const { t } = useI18n();
const props = defineProps<{
  classData: ClassProgression;
  spellSourceData: StandardSpellSource;
}>();

const isClassLocked = computed(() => {
  return props.classData.compendiumData.class ? true : false;
});

const isSubclassLocked = computed(() => {
  return props.classData.compendiumData.subclass || (props.classData.subclassUnlockLevel > 0 && props.classData.level < props.classData.subclassUnlockLevel) ? true : false;
});

const subclassPlaceholder = computed(() => {
  if (props.classData.subclassUnlockLevel && props.classData.subclassUnlockLevel > props.classData.level) {
    return t('descriptions.unlocks-at-level', { level: props.classData.subclassUnlockLevel });
  }
  return '';
});


const emit = defineEmits<{
  (e: 'update', value: Partial<ClassProgression>): void;
  (e: 'updateSpellSource', value: Partial<SpellSource>): void;
  (e: 'remove'): void;
}>();

function updateField<K extends keyof ClassProgression>(key: K, value: ClassProgression[K]) {
  emit('update', { _id: props.classData._id, [key]: value });
}

function updateSpellSourceField<K extends keyof StandardSpellSource>(
  key: K,
  value: StandardSpellSource[K],
) {
  emit('updateSpellSource', { _id: props.spellSourceData._id, [key]: value });
}

const hp = computed(() => {
  if (!props.classData.hitPoints) return '';
  return props.classData.hitPoints.join(', ');
});
</script>

<style lang="scss" scoped>
.class-item {
  padding: 1rem;
  border: 1px solid var(--color-tertiary);
  border-radius: 5px;
  &:has(.button:hover) {
    border-color: var(--color-negative);
  }
}
label:has(input[readonly]) {
  position: relative;
  input {
    cursor: not-allowed;
    outline: none;
  }
  &:after {
    content: '🔒';
    position: absolute;
    right: 4px;
    bottom: 4px;
    font-size: var(--size-font-large);
  }
}
</style>
