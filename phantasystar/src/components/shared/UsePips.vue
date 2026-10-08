<script setup>
const props = defineProps({
  total: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  label: { type: String, default: 'Uses' },
})
const emit = defineEmits(['set'])

const click = (n) => emit('set', props.used === n ? n - 1 : n)
</script>

<template>
  <span class="pips" role="group" :aria-label="label">
    <button
      v-for="n in total"
      :key="n"
      type="button"
      class="pip"
      :class="{ spent: n <= used }"
      :aria-pressed="n <= used"
      :aria-label="`${label} ${n}`"
      @click="click(n)"
    />
  </span>
</template>

<style scoped lang="scss">
.pips {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  vertical-align: middle;
}

.pip {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 1.2px solid var(--ps-line);
  border-radius: 50%;
  background: var(--ps-field);
  cursor: pointer;

  &:hover { background: var(--ps-gold-light); }
  &.spent { background: var(--ps-blue); border-color: var(--ps-blue); }
}
</style>
