<template>
  <div class="sheet-locked">
    <div class="sheet-locked__card">
      <h2 class="sheet-locked__title">{{ $t('sheet-locked.title') }}</h2>
      <p class="sheet-locked__message">
        {{ $t('sheet-locked.message') }}
      </p>
      <p class="sheet-locked__hint">
        {{ $t('sheet-locked.hint') }}
      </p>
      <a href="https://patreon.polyhedral.tools/" target="_blank">
        <p>
          https://patreon.polyhedral.tools/
        </p>
      </a>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.sheet-locked {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: var(--size-gap-large);

  &__card {
    text-align: center;
    background-color: var(--color-disabled);
    border-radius: var(--size-border-radius-medium);
    padding: var(--size-gap-large) calc(var(--size-gap-large) * 2);
    max-width: 500px;
  }

  &__logo {
    max-width: 120px;
    height: auto;
    margin-bottom: var(--size-gap-medium);
    opacity: 0.6;
  }

  &__title {
    font-family: var(--font-family-title);
    text-transform: uppercase;
    margin-bottom: var(--size-gap-medium);
  }

  &__message {
    margin-bottom: var(--size-gap-medium);
    font-size: var(--size-font-medium);
  }

  &__hint {
    font-size: var(--size-font-small);
    opacity: 0.7;
  }
}
</style>
