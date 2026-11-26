<script setup>
defineProps({
  title: { type: String, default: '' },
  inset: { type: Boolean, default: false },
  fill: { type: String, default: '' },
  grow: { type: Boolean, default: false },
})
</script>

<template>
  <div class="ps-panel-wrap">
    <div v-if="title && !inset" class="ps-panel-head">
      <h2 class="ps-heading">{{ title }}</h2>
      <div v-if="$slots.actions" class="ps-panel-actions"><slot name="actions" /></div>
    </div>
    <div
      class="ps-panel"
      :class="{ 'ps-panel--grow': grow }"
      :style="fill ? { background: fill } : null"
    >
      <div
        v-if="title && inset"
        class="ps-panel-band"
        :class="{ 'ps-panel-band--actions': $slots.actions }"
      >
        <span class="ps-panel-band__title">{{ title }}</span>
        <div v-if="$slots.actions" class="ps-panel-actions ps-panel-actions--band">
          <slot name="actions" />
        </div>
      </div>
      <div class="ps-panel-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.ps-panel-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ps-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-gap);
  margin: 0 0 3px 4px;
}

.ps-panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;

  &--band {
    grid-column: 3;
    justify-self: end;

    :deep(button) { padding: 0 2px; }
  }
}

.ps-heading {
  @include ps-heading;
  color: var(--ps-title);
  margin: 0;
}

.ps-panel {
  @include ps-panel;
  flex: 1;
  min-width: 0;
  overflow: hidden;

  &--grow {
    display: flex;
    flex-direction: column;

    > .ps-panel-body { flex: 1; min-height: 0; }
  }
}

.ps-panel-band {
  @include ps-heading(15px);

  &--actions {
    display: grid;
    grid-template-columns: 1fr minmax(0, auto) 1fr;
    align-items: center;
    column-gap: 4px;

    .ps-panel-band__title {
      grid-column: 2;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  text-align: center;
  padding: 3px 6px;
  background: var(--ps-paper);
  border-bottom: var(--ps-border);
}

.ps-panel-body {
  padding: 8px;
}
</style>
