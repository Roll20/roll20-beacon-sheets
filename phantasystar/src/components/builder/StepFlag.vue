<script setup>
defineProps({
  done: { type: Boolean, default: false },
  mark: { type: [String, Number], default: '' },
})
</script>

<template>
  <span class="flag" :class="done ? 'flag--done' : 'flag--todo'" :aria-label="done ? 'Done' : 'Unfinished'">
    {{ done ? '✓' : mark }}
  </span>
</template>

<style scoped lang="scss">
.flag {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-family: var(--ps-font);
  font-size: 11px;
  font-weight: 800;
  font-variant: normal;
  line-height: 1;

  &--todo { background: var(--ps-blue); color: var(--ps-on-fill); }
  &--done { background: var(--ps-green); color: var(--ps-on-green-fill, var(--ps-on-fill)); }
}
</style>
