import { defineStore } from 'pinia';
import { ref } from 'vue';

export enum PatronTier {
  None = 'None',
  Copper = 'Copper',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Founder = 'Founder',
}

const PATRON_TIER_VALUES: Record<PatronTier, number> = {
  [PatronTier.None]: 0,
  [PatronTier.Copper]: 1,
  [PatronTier.Silver]: 2,
  [PatronTier.Gold]: 3,
  [PatronTier.Platinum]: 4,
  [PatronTier.Founder]: 5,
};

const PATREON_API_BASE = 'https://patreon-bridge.polyhedral-tools.workers.dev';

//const ONE_DAY_MS = 24 * 60 * 60 * 1000;
//Below is just 15 seconds for testing purposes
const ONE_DAY_MS = 15 * 1000;

export const useVersionStore = defineStore('version', () => {
  const version = ref(0.1);
  const nickname = ref('');
  const characterBackups = ref<Record<string, unknown>>({});
  const isPatron = ref(false);
  const patronTier = ref<PatronTier>(PatronTier.None);
  const lastPremiumVerification = ref<string | null>(null);

  const checkPremiumStatus = async () => {
    // Lazy import to avoid circular dependency
    const { initValues, sharedSettingsRef, dispatchRef } = await import('@/relay/relay');

    const playerId = initValues.settings?.currentUserId;
    const campaignIdValue = initValues.settings?.campaignId;

    if (!playerId || !campaignIdValue) return;

    // Fast unlock if sharedSettings already marks campaign as premium
    if (sharedSettingsRef.value?.isCampaignPremium) {
      isPatron.value = true;
      patronTier.value = PatronTier.Platinum;

      // Re-verify campaign claim if more than a day since last check
      const lastCampaignCheck = sharedSettingsRef.value?.lastCampaignVerification;
      if (!lastCampaignCheck || Date.now() - new Date(lastCampaignCheck).getTime() > ONE_DAY_MS) {
        try {
          const campaignVerifyUrl = new URL(`${PATREON_API_BASE}/verify-campaign`);
          campaignVerifyUrl.searchParams.set('campaign_id', String(campaignIdValue));
          
          const res = await fetch(campaignVerifyUrl.toString());
          const data = await res.json();

          if (!data.claimed) {
            // If campaign no longer claimed, revoke premium
            isPatron.value = false;
            patronTier.value = PatronTier.None;
            const revokedSettings = { ...sharedSettingsRef.value, isCampaignPremium: false, campaignClaimedBy: null, lastCampaignVerification: null };
            await dispatchRef.value?.updateSharedSettings({ settings: revokedSettings as any });
            sharedSettingsRef.value = revokedSettings;
          } else {
            // If campaign still valid, update timestamp
            const refreshedSettings = { ...sharedSettingsRef.value, lastCampaignVerification: new Date().toISOString() };
            await dispatchRef.value?.updateSharedSettings({ settings: refreshedSettings as any });
            sharedSettingsRef.value = refreshedSettings;
          }
        } catch (err) {
          console.warn('Campaign re-verification failed:', err);
        }
      }

      lastPremiumVerification.value = new Date().toISOString();
      return;
    }

    // skip network call if last verification was less than a day ago
    if (lastPremiumVerification.value && isPatron.value) {
      const elapsed = Date.now() - new Date(lastPremiumVerification.value).getTime();
      if (elapsed < ONE_DAY_MS) return;
    }

    try {
      const verifyUrl = new URL(`${PATREON_API_BASE}/verify`);
      verifyUrl.searchParams.set('player_id', String(playerId));
      const verifyRes = await fetch(verifyUrl.toString());
      const data = await verifyRes.json();

      if (data.status === 'active') {
        isPatron.value = true;
        patronTier.value = (data.tier as PatronTier) || PatronTier.None;
        lastPremiumVerification.value = new Date().toISOString();
      } else {
        isPatron.value = false;
        patronTier.value = PatronTier.None;
        lastPremiumVerification.value = null;
      }
    } catch (err) {
      console.error('Failed to verify Patreon status:', err);
    }
  };

  const claimCampaign = async () => {
    const { initValues, sharedSettingsRef, dispatchRef } = await import('@/relay/relay');

    const playerId = initValues.settings?.currentUserId;
    const campaignIdValue = initValues.settings?.campaignId;

    if (!playerId || !campaignIdValue) return;

    try {
      const claimRes = await fetch(`${PATREON_API_BASE}/claim-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: String(playerId),
          campaign_id: String(campaignIdValue),
        }),
      });
      const claimData = await claimRes.json();

      if (claimData.success === true) {
        const claimedSettings = { ...sharedSettingsRef.value, isCampaignPremium: true, campaignClaimedBy: String(playerId), lastCampaignVerification: new Date().toISOString() };
        await dispatchRef.value?.updateSharedSettings({ settings: claimedSettings as any });
        sharedSettingsRef.value = claimedSettings;
        return { success: true };
      } else if (claimData.error === 'limit_reached') {
        console.warn('Patreon campaign claim limit reached (max 3 campaigns).');
        return { success: false, error: 'limit_reached' };
      }
      return { success: false, error: claimData.error };
    } catch (err) {
      console.error('Failed to claim campaign:', err);
      return { success: false, error: 'network' };
    }
  };

  const unclaimCampaign = async () => {
    const { initValues, sharedSettingsRef, dispatchRef } = await import('@/relay/relay');

    const playerId = initValues.settings?.currentUserId;
    const campaignIdValue = initValues.settings?.campaignId;

    if (!playerId || !campaignIdValue) return;

    try {
      const res = await fetch(`${PATREON_API_BASE}/unclaim-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: String(playerId),
          campaign_id: String(campaignIdValue),
        }),
      });
      const data = await res.json();

      if (data.success === true) {
        const unclaimedSettings = { ...sharedSettingsRef.value, isCampaignPremium: false, campaignClaimedBy: null, lastCampaignVerification: null };
        await dispatchRef.value?.updateSharedSettings({ settings: unclaimedSettings as any });
        sharedSettingsRef.value = unclaimedSettings;
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error('Failed to unclaim campaign:', err);
      return { success: false, error: 'network' };
    }
  };

  return {
    version,
    nickname,
    characterBackups,
    isPatron,
    patronTier,
    patronTierValue: () => PATRON_TIER_VALUES[patronTier.value],
    lastPremiumVerification,
    checkPremiumStatus,
    claimCampaign,
    unclaimCampaign,
  };
});