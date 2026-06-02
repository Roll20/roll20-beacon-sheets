<template>
  <div class="settings-view">
    <h2 class="settings-view__title">{{ $t('patreon.settings-title') }}</h2>

    <section class="settings-view__section" v-if="patron.isPatron">
      <h3>{{ $t('patreon.status-title') }}</h3>
      <p class="settings-view__tier">
        {{ $t('patreon.tier-label') }} <strong>{{ tierLabel }}</strong>
      </p>
    </section>

    <section class="settings-view__section" v-else>
      <p>{{ $t('patreon.no-subscription') }}</p>
      <a href="https://patreon.sheet-smith.tools/" target="_blank">
        <p>
          https://patreon.sheet-smith.tools/
        </p>
      </a>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVersionStore, PatronTier } from '@/sheet/stores/version/versionStore';

const { t: $t } = useI18n();

const patron = useVersionStore();


const tierLabel = computed(() => {
  switch (patron.patronTier) {
    case PatronTier.None:
      return $t('patreon.tiers.none');
    case PatronTier.Apprentice:
      return $t('patreon.tiers.apprentice');
    case PatronTier.GuildMember:
      return $t('patreon.tiers.guild-member');
    case PatronTier.MasterCrafter:
      return $t('patreon.tiers.master-crafter');
    default:
      return $t('patreon.tiers.unknown');
  }
});

</script>

<style lang="scss" scoped>
.settings-view {
  padding: var(--size-gap-large);
  max-width: 600px;
  margin: 0 auto;

  &__title {
    font-family: var(--font-family-title);
    text-transform: uppercase;
    margin-bottom: var(--size-gap-large);
  }

  &__section {
    background-color: var(--color-disabled);
    border-radius: var(--size-border-radius-medium);
    padding: var(--size-gap-large);
    margin-bottom: var(--size-gap-large);
  }

  &__tier {
    margin-bottom: var(--size-gap-medium);
  }

  &__campaign {
    margin-top: var(--size-gap-medium);
    padding-top: var(--size-gap-medium);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__status {
    margin-bottom: var(--size-gap-medium);

    &--active {
      color: #4caf50;
    }
  }

  &__btn {
    padding: var(--size-gap-small) var(--size-gap-large);
    border: none;
    border-radius: var(--size-border-radius-medium);
    cursor: pointer;
    font-family: var(--font-family-title);
    text-transform: uppercase;
    font-size: var(--size-font-medium);

    &--claim {
      background-color: #4caf50;
      color: white;
    }

    &--unclaim {
      background-color: #f44336;
      color: white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    color: #f44336;
    margin-top: var(--size-gap-small);
    font-size: var(--size-font-small);
  }

  &__info {
    color: #ff9800;
    margin-top: var(--size-gap-small);
    margin-bottom: var(--size-gap-medium);
    font-size: var(--size-font-small);
  }
}
</style>
