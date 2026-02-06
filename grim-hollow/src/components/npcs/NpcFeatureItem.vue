<template>
  <details v-if="!editMode" class="accordion">
    <summary class="accordion__summary">
      <strong>{{ feature.name }}</strong>
    </summary>
    <div class="accordion__details">
      <div v-if="feature.description" class="description" v-html="parsedDescription"></div>
    </div>
  </details>

  <div v-else class="npc-feature-editor">
    <div class="npc-feature-editor__form">
      <div class="npc-feature-editor__row">
        <input
          v-model="feature.name"
          :placeholder="t('titles.name')"
          class="npc-feature-editor__input npc-feature-editor__input--name"
          required
        />
        <button @click="$emit('remove')" class="npc-feature-editor__remove-button">×</button>
      </div>
      <textarea
        v-model="feature.description"
        :placeholder="t('titles.description')"
        rows="3"
        class="npc-feature-editor__textarea"
      ></textarea>
      <textarea
        v-model="effectsJson"
        :placeholder="t('titles.effects')"
        rows="4"
        class="npc-feature-editor__textarea"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
import { type Npc, type NpcFeature } from '@/sheet/stores/npc/npcStore';
import { stripIds } from '@/utility/jsonTools';
import { parseSimpleMarkdown } from '@/utility/markdownParser';

const { t } = useI18n();
const props = defineProps<{
  feature: NpcFeature;
  localNpc: Npc;
  editMode: boolean;
}>();
const emit = defineEmits(['remove']);

const parsedDescription = computed(() => parseSimpleMarkdown(props.feature.description));

/**
 * A computed property that returns the associated effects as a JSON string.
 * - get: Finds the effect, strips its internal IDs, and returns it as a formatted JSON string.
 * - set: Parses the JSON string and updates the effect in the localNpc's effects array.
 * It creates the effect object on-demand when editing if it doesn't already exist.
 */
const effectsJson = computed({
  get() {
    const effect = props.localNpc.effects.find((e) => e._id === props.feature.effectId);
    if (!effect) return '{}';
    const cleanEffect = stripIds(JSON.parse(JSON.stringify(effect)));
    return JSON.stringify(cleanEffect, null, 2);
  },
  set(newJson) {
    if (!props.localNpc) return;
    let effectIndex = props.localNpc.effects.findIndex((e) => e._id === props.feature.effectId);

    // If the effect doesn't exist, create it on-demand before applying changes.
    if (effectIndex === -1) {
      const newEffect: Effect = {
        _id: props.feature.effectId,
        label: props.feature.name,
        description: '',
        enabled: false,
        toggleable: false,
        removable: false,
        effects: [],
      };
      props.localNpc.effects.push(newEffect);
      effectIndex = props.localNpc.effects.length - 1;
    }

    try {
      const parsedEffect = JSON.parse(newJson);
      const originalEffect = props.localNpc.effects[effectIndex];

      parsedEffect._id = originalEffect._id;
      (parsedEffect.effects || []).forEach((singleEffect: any, index: number) => {
        const originalSingle = originalEffect.effects?.[index];
        singleEffect._id = originalSingle?._id ?? uuidv4();
      });

      ['actions', 'resources', 'spellSources', 'spells', 'pickers'].forEach((key) => {
        if (parsedEffect[key] && Array.isArray(parsedEffect[key])) {
          parsedEffect[key].forEach((item: any) => {
            if (!item._id) item._id = uuidv4();
          });
        }
      });

      if (!parsedEffect.label) {
        parsedEffect.label = props.feature.name;
      }

      props.localNpc.effects[effectIndex] = parsedEffect;
    } catch (e) {
      /* ignore invalid json*/
    }
  },
});
</script>
<style lang="scss" scoped>
.npc-feature-editor {
  border: 1px dashed #1e90ff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.npc-feature-editor__form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.npc-feature-editor__row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.npc-feature-editor__input,
.npc-feature-editor__textarea {
  width: 100%;
  box-sizing: border-box;
}
.npc-feature-editor__input--name {
  font-weight: bold;
}
.npc-feature-editor__remove-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}
</style>
