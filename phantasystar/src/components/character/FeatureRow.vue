<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { FEATURE_GROUPS } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const props = defineProps({
  id: { type: String, required: true },
  open: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle-open', 'toggle-editing'])

const sheet = useCharacterStore()

const feature = computed(() => sheet.features.find((f) => f._id === props.id) ?? null)

const paragraphs = computed(() =>
  String(feature.value?.text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
)

const levelInput = computed({
  get: () => feature.value?.level ?? '',
  set: (value) => {
    const n = Number(value)
    feature.value.level = value === '' || !Number.isInteger(n) || n < 1 || n > 20 ? null : n
  },
})
</script>

<template>
  <div v-if="feature" class="feature" :class="{ open }">
    <div class="line">
      <button
        type="button"
        class="name"
        :title="open ? 'Hide description' : 'Show description'"
        @click="emit('toggle-open')"
      >
        <span class="caret" :class="{ turned: open }">&#9656;</span>
        {{ feature.name || 'Unnamed feature' }}
      </button>
      <span v-if="feature.level" class="level">Level {{ feature.level }}</span>
      <ConfirmDelete class="del" title="Remove" @confirm="sheet.removeFeature(feature._id)" />
    </div>

    <div v-if="open && editing" class="editor">
      <label class="f f--wide">
        <span>Name</span>
        <input v-model="feature.name" />
      </label>
      <label class="f">
        <span>Group</span>
        <select v-model="feature.group">
          <option v-for="g in FEATURE_GROUPS" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>Level</span>
        <input v-model="levelInput" type="number" min="1" max="20" />
      </label>
      <label class="f f--full">
        <span>Description</span>
        <textarea v-model="feature.text" rows="4" />
      </label>
    </div>

    <div v-else-if="open" class="body">
      <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
    </div>

    <div v-if="open" class="editbar">
      <button
        type="button"
        class="mini"
        :title="editing ? 'Stop editing' : 'Edit this feature'"
        @click="emit('toggle-editing')"
      >
        {{ editing ? 'Done' : 'Edit' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.feature {
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.28);
  padding: 0 2px;

  &:last-child { border-bottom: none; }
  &.open { background: var(--ps-row-open); }
}

.line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
}

.name {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--ps-fs-body);
  font-weight: 700;
  color: var(--ps-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover { color: var(--ps-blue); }
}

.caret {
  display: inline-block;
  font-size: 9px;
  color: var(--ps-heading-soft);
  transition: transform 0.12s ease;

  &.turned { transform: rotate(90deg); }
}

.level {
  @include ps-caption;
  flex: 0 0 auto;
  font-size: 9px;
}

.del {
  @include ps-icon-button(13px, var(--ps-red));
  color: var(--ps-red);
  padding: 0;
}

.body {
  padding: 0 4px 4px 13px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--ps-text);

  p { margin: 0 0 4px; white-space: pre-line; }
}

.editor {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) 56px;
  gap: 5px 8px;
  padding: 3px 4px 4px 13px;
}

.f {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; }

  input, select, textarea { @include ps-control(22px); }
  input { text-align: left; }

  textarea {
    height: auto;
    padding: 3px 4px;
    resize: vertical;
    text-align: left;
    line-height: 1.35;
  }

  &--narrow input { text-align: center; }
  &--full { grid-column: 1 / -1; }
}

.editbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 4px 3px;
}

.mini {
  @include ps-caption;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 6px;
  cursor: pointer;
  font-size: 9px;

  &:hover { background: var(--ps-panel-alt); }
}

@container (max-width: 260px) {
  .editor { grid-template-columns: minmax(0, 1fr) 56px; }
  .f--wide { grid-column: 1 / -1; }
}
</style>
