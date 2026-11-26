<script setup>
import { computed } from 'vue'
import SheetModal from './SheetModal.vue'

const props = defineProps({
  offer: { type: Object, default: null },
})
const emit = defineEmits(['take'])

const mst = (n) => `${Number(n || 0).toLocaleString()} mst`

const optionA = computed(() => {
  const a = props.offer?.a
  if (!a) return null
  return [...a.items.map((i) => i.name), ...(a.meseta ? [mst(a.meseta)] : [])]
})
</script>

<template>
  <SheetModal
    :open="!!offer"
    :title="`${offer?.profession ?? ''} Starting Equipment`"
    width="380px"
    done-label="Skip"
    @close="emit('take', null)"
  >
    <div class="options">
      <button v-if="optionA" type="button" class="option" @click="emit('take', 'a')">
        <span class="letter">A</span>
        <span class="body">
          <span class="items">{{ optionA.join(', ') }}</span>
          <span v-if="offer.a.choices.length" class="choose">+ {{ offer.a.choices.join('; ') }}</span>
        </span>
      </button>
      <button v-if="offer?.b" type="button" class="option" @click="emit('take', 'b')">
        <span class="letter">B</span>
        <span class="body"><span class="items">{{ mst(offer.b.meseta) }}</span></span>
      </button>
    </div>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.options { display: flex; flex-direction: column; gap: 8px; }

.option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  text-align: left;
  background: var(--ps-field);
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  padding: 8px 10px;
  cursor: pointer;
  font-family: inherit;
  color: var(--ps-text);

  &:hover { background: var(--ps-gold-light); }
}

.letter { @include ps-heading(18px); flex: 0 0 auto; line-height: 1; }

.body { display: flex; flex-direction: column; gap: 3px; font-size: 12px; }

.choose { font-size: 11px; color: var(--ps-text-muted); }
</style>
