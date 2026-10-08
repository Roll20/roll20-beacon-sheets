<script setup>
defineProps({
  ranks: { type: Number, default: 0 },
  cap: { type: Number, default: 6 },
  total: { type: Number, default: 6 },
})
defineEmits(['set'])
</script>

<template>
  <div class="pips" role="group" aria-label="Skill ranks">
    <button
      v-for="n in total"
      :key="n"
      type="button"
      class="pip"
      :class="{ filled: n <= ranks, locked: n > cap }"
      :disabled="n > cap"
      :aria-label="`Rank ${n}`"
      :aria-pressed="n <= ranks"
      @click="$emit('set', n)"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.pips {
  display: flex;
  gap: 3px;
  align-items: center;
}

.pip {
  width: 13px;
  height: 13px;
  padding: 0;
  border: 1.2px solid var(--ps-line);
  border-radius: 3px;
  background: var(--ps-field);
  cursor: pointer;

  &:hover:not(:disabled) { background: var(--ps-gold-light); }
  &.filled { background: var(--ps-blue); border-color: var(--ps-blue); }
  &.locked {
    border-color: var(--ps-disabled);
    background: repeating-linear-gradient(
      45deg, transparent, transparent 2px,
      var(--ps-disabled) 2px, var(--ps-disabled) 3px
    );
    cursor: not-allowed;
  }
}
</style>
