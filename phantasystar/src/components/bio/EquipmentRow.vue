<script setup>
import { computed } from 'vue'
import { useBioStore } from '@/stores/bioStore.js'
import { useAppStore } from '@/stores/index.js'
import { ITEM_GRADES, ITEM_TYPES, ARMOR_CATEGORIES } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const props = defineProps({
  id: { type: String, required: true },
  open: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle-open', 'toggle-editing'])

const store = useBioStore()
const app = useAppStore()

const item = computed(() => store.equipment.find((e) => e._id === props.id) ?? null)

const typeName = computed(() => ITEM_TYPES.find((t) => t.id === item.value?.itemType)?.name ?? '')
const categoryName = computed(() =>
  item.value?.itemType === 'armor'
    ? ARMOR_CATEGORIES.find((c) => c.id === item.value.category)?.name ?? ''
    : '',
)
const attack = computed(() => app.linkedAttack(item.value))

const hasGrade = computed(() => String(item.value?.grade ?? '') !== '')
const quantity = computed(() => Number(item.value?.quantity) || 1)
const weight = computed(() => String(item.value?.weight ?? '').trim())

const paragraphs = computed(() =>
  String(item.value?.text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
)
</script>

<template>
  <div v-if="item" class="item" :class="{ open }">
    <div class="line">
      <input
        :checked="item.equipped"
        type="checkbox"
        class="pip"
        title="Equipped"
        @change="store.setEquipped(item._id, $event.target.checked)"
      />
      <button
        type="button"
        class="name"
        :title="open ? 'Hide description' : 'Show description'"
        @click="emit('toggle-open')"
      >
        <span class="caret" :class="{ turned: open }">&#9656;</span>
        {{ item.name || 'Unnamed item' }}
      </button>
      <span class="stats">
        <span class="stat">{{ typeName }}<template v-if="categoryName"> ({{ categoryName }})</template></span>
        <span v-if="hasGrade" class="stat"><b>Grade</b>{{ item.grade }}</span>
        <span v-if="quantity > 1" class="stat">&times;{{ quantity }}</span>
        <span v-if="weight" class="stat">{{ weight }} lb.</span>
      </span>
      <ConfirmDelete class="del" title="Remove" @confirm="store.removeItem(item._id)" />
    </div>

    <div v-if="open && editing" class="editor">
      <label class="f f--wide">
        <span>Name</span>
        <input :value="item.name" @input="app.setItemField(item, 'name', $event.target.value)" />
      </label>
      <label class="f">
        <span>Item Type</span>
        <select :value="item.itemType" @change="app.setItemType(item, $event.target.value)">
          <option v-for="t in ITEM_TYPES" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </label>
      <label class="f">
        <span>Grade</span>
        <select :value="item.grade" @change="app.setItemField(item, 'grade', $event.target.value)">
          <option value="">&mdash;</option>
          <option v-for="g in ITEM_GRADES" :key="g.grade" :value="String(g.grade)">{{ g.grade }}</option>
        </select>
      </label>
      <label class="f">
        <span>#</span>
        <input v-model.number="item.quantity" type="number" min="1" class="num" />
      </label>
      <label class="f">
        <span>Wt.</span>
        <input v-model.number="item.weight" type="number" min="0" step="0.5" class="num" />
      </label>

      <template v-if="item.itemType === 'armor'">
        <label class="f">
          <span>Category</span>
          <select v-model="item.category">
            <option v-for="c in ARMOR_CATEGORIES" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
        <label class="f">
          <span>Strength</span>
          <input v-model="item.strength" type="number" class="num" />
        </label>
        <label class="f f--check">
          <input v-model="item.stealthDisadvantage" type="checkbox" />
          <span>Stealth Disadv.</span>
        </label>
      </template>

      <p v-if="attack" class="link"><b>Attack</b>{{ attack.name || 'Unnamed attack' }}</p>

      <label class="f f--full">
        <span>Description</span>
        <textarea v-model="item.text" rows="3" />
      </label>
      <label class="f f--full">
        <span>Notes</span>
        <input v-model="item.notes" />
      </label>
    </div>

    <div v-else-if="open" class="body">
      <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
      <p v-if="item.notes" class="notes">{{ item.notes }}</p>
    </div>

    <div v-if="open" class="editbar">
      <button
        type="button"
        class="mini"
        :title="editing ? 'Stop editing' : 'Edit this item'"
        @click="emit('toggle-editing')"
      >
        {{ editing ? 'Done' : 'Edit' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.item {
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.28);
  padding: 0 2px;

  &:last-child { border-bottom: none; }
  &.open { background: var(--ps-row-open); }
}

.line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
}

.pip { @include ps-pip-check; cursor: pointer; }

.name {
  flex: 1 1 110px;
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

.stats {
  flex: 0 1 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 2px 10px;
  min-width: 0;
}

.stat {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-size: 10.5px;
  color: var(--ps-text-muted);
  white-space: nowrap;

  > b { @include ps-caption; font-size: 9px; }
}

.del {
  @include ps-icon-button(13px, var(--ps-red));
  color: var(--ps-red);
  padding: 0;
}

.body {
  padding: 0 4px 4px 32px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--ps-text);

  p { margin: 0 0 4px; white-space: pre-line; }
  .notes { color: var(--ps-text-muted); }
}

.editor {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 5px 8px;
  padding: 3px 4px 4px 32px;
}

.f {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; }

  input:not([type='checkbox']), select, textarea { @include ps-control(22px); text-align: left; }
  .num { text-align: center; }

  textarea {
    height: auto;
    padding: 3px 4px;
    resize: vertical;
    line-height: 1.35;
  }

  &--wide { grid-column: span 2; }
  &--full { grid-column: 1 / -1; }

  &--check {
    flex-direction: row;
    align-items: center;
    gap: 5px;
    align-self: end;
    padding-bottom: 4px;

    input { @include ps-pip-check; }
  }
}

.link {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 10.5px;
  color: var(--ps-text);

  b { @include ps-caption; font-size: 9px; margin-right: 4px; }
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
</style>
