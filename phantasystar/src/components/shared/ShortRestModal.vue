<script setup>
import { ref, computed, watch } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { formatModifier } from '@/rules/index.js'
import SheetModal from './SheetModal.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const spent = ref(0)
const regained = ref(0)
const rolling = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      spent.value = 0
      regained.value = 0
    }
  },
)

const hpMax = computed(() => Number(sheet.hp.max) || 0)
const atFull = computed(() => (Number(sheet.hp.current) || 0) >= hpMax.value)
const canSpend = computed(
  () => !rolling.value && sheet.hitDice.remaining > 0 && !atFull.value && sheet.hitDice.die !== '—',
)

const spend = async () => {
  if (!canSpend.value) return
  rolling.value = true
  try {
    const result = await rolls.spendHitDie()
    if (result) {
      spent.value += 1
      regained.value += result.after - result.before
    }
  } finally {
    rolling.value = false
  }
}
</script>

<template>
  <SheetModal
    :open="open"
    title="Short Rest"
    width="340px"
    done-label="Finish Rest"
    @close="$emit('close')"
  >
    <dl class="figures">
      <div>
        <dt>Hit Dice</dt>
        <dd>{{ sheet.hitDice.remaining }} / {{ sheet.hitDice.total }} &times; {{ sheet.hitDice.die }}</dd>
      </div>
      <div>
        <dt>CON</dt>
        <dd>{{ formatModifier(Number(sheet.abilities.constitution) || 0) }}</dd>
      </div>
      <div>
        <dt>HP</dt>
        <dd>{{ sheet.hp.current }} / {{ sheet.hp.max }}</dd>
      </div>
    </dl>

    <button type="button" class="spend" :disabled="!canSpend" @click="spend">
      Spend a Hit Die
    </button>

    <p v-if="spent" class="tally">
      {{ spent }} spent &middot; +{{ regained }} HP
    </p>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.figures {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin: 0 0 12px;

  > div {
    @include ps-well;
    padding: 4px 6px;
  }

  dt { @include ps-caption; font-size: 9px; }
  dd { margin: 2px 0 0; font-size: 15px; font-weight: 700; color: var(--ps-heading); }
}

.spend {
  @include ps-button;
  display: block;
  width: 100%;

  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:disabled:hover { background: var(--ps-fill); }
}

.tally {
  margin: 8px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--ps-text);
}
</style>
