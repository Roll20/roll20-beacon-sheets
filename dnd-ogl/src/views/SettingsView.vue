<template>
  <div class="settings-view">
    <h2 class="settings-view__title">{{ $t('patreon.settings-title') }}</h2>

    <section class="settings-view__section" v-if="patron.isPatron">
      <h3>{{ $t('patreon.status-title') }}</h3>
      <p class="settings-view__tier">
        {{ $t('patreon.tier-label') }} <strong>{{ tierLabel }}</strong>
      </p>

      <div class="settings-view__campaign" v-if="patron.patronTierValue() >= 4">
        <h4>{{ $t('patreon.campaign-premium-title') }}</h4>
        <p v-if="isCampaignClaimed" class="settings-view__status settings-view__status--active">
          {{ $t('patreon.campaign-claimed') }}
        </p>
        <p v-if="isCampaignClaimed && !isCampaignClaimedByCurrentPlayer" class="settings-view__info">
          {{ $t('patreon.campaign-claimed-by-other') }}
        </p>
        <p v-else-if="!isCampaignClaimed" class="settings-view__status">
          {{ $t('patreon.campaign-not-claimed') }}
        </p>

        <button
          v-if="!isCampaignClaimed"
          class="settings-view__btn settings-view__btn--claim"
          :disabled="loading"
          @click="handleClaim"
        >
          {{ loading ? $t('patreon.claiming') : $t('patreon.claim-campaign') }}
        </button>
        <button
          v-else
          class="settings-view__btn settings-view__btn--unclaim"
          :disabled="loading || !canUnclaimCampaign"
          @click="handleUnclaim"
        >
          {{ loading ? $t('patreon.removing') : $t('patreon.unclaim-campaign') }}
        </button>

        <p v-if="errorMsg" class="settings-view__error">{{ errorMsg }}</p>
      </div>
    </section>

    <section class="settings-view__section" v-else>
      <p>{{ $t('patreon.no-subscription') }}</p>
      <a href="https://patreon.polyhedral.tools/" target="_blank">
        <p>
          https://patreon.polyhedral.tools/
        </p>
      </a>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVersionStore, PatronTier } from '@/sheet/stores/version/versionStore';
import { sharedSettingsRef, initValues } from '@/relay/relay';

const { t: $t } = useI18n();

const patron = useVersionStore();

const loading = ref(false);
const errorMsg = ref('');

const isCampaignClaimed = computed(() => {
  return !!sharedSettingsRef.value?.isCampaignPremium;
});

const isCampaignClaimedByCurrentPlayer = computed(() => {
  const claimedBy = sharedSettingsRef.value?.campaignClaimedBy;
  const currentPlayerId = initValues.settings?.currentUserId;
  return claimedBy === String(currentPlayerId);
});

const canUnclaimCampaign = computed(() => {
  return isCampaignClaimed.value && isCampaignClaimedByCurrentPlayer.value;
});

const tierLabel = computed(() => {
  switch (patron.patronTier) {
    case PatronTier.None:
      return $t('patreon.tiers.none');
    case PatronTier.Copper:
      return $t('patreon.tiers.copper');
    case PatronTier.Silver:
      return $t('patreon.tiers.silver');
    case PatronTier.Gold:
      return $t('patreon.tiers.gold');
    case PatronTier.Platinum:
      return $t('patreon.tiers.platinum');
    case PatronTier.Founder:
      return $t('patreon.tiers.founder');
    default:
      return $t('patreon.tiers.unknown');
  }
});

const handleClaim = async () => {
  loading.value = true;
  errorMsg.value = '';
  const result = await patron.claimCampaign();
  if (result?.error === 'limit_reached') {
    errorMsg.value = $t('patreon.errors.limit-reached');
  } else if (result?.error) {
    errorMsg.value = $t('patreon.errors.claim-failed');
  }
  loading.value = false;
};

const handleUnclaim = async () => {
  loading.value = true;
  errorMsg.value = '';
  const result = await patron.unclaimCampaign();
  if (result?.error) {
    errorMsg.value = $t('patreon.errors.unclaim-failed');
  }
  loading.value = false;
};
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
