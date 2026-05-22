import { defineStore } from 'pinia';
import { ref } from 'vue';

export enum PatronTier {
  None = 'None',
  Apprentice = 'Apprentice',
  GuildMember = 'GuildMember',
  MasterCrafter = 'MasterCrafter',
}

const PATRON_TIER_VALUES: Record<PatronTier, number> = {
  [PatronTier.None]: 0,
  [PatronTier.Apprentice]: 1,
  [PatronTier.GuildMember]: 2,
  [PatronTier.MasterCrafter]: 3,
};

//const PATREON_API_BASE = 'https://patreon-bridge.sheet-smith.workers.dev';

//const ONE_DAY_MS = 24 * 60 * 60 * 1000;
//Below is just 15 seconds for testing purposes
//const ONE_DAY_MS = 15 * 1000;

export const useVersionStore = defineStore('version', () => {
  const version = ref(0.1);
  const nickname = ref('');
  const characterBackups = ref<Record<string, unknown>>({});
  const isPatron = ref(false);
  const patronTier = ref<PatronTier>(PatronTier.None);
  const lastPremiumVerification = ref<string | null>(null);

  /*const checkPremiumStatus = async () => {
    // Lazy import to avoid circular dependency
    const { initValues, sharedSettingsRef, dispatchRef } = await import('@/relay/relay');

    const playerId = initValues.settings?.currentUserId;
    const campaignIdValue = initValues.settings?.campaignId;

    if (!playerId || !campaignIdValue) return;

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
  };*/

  

  return {
    version,
    nickname,
    characterBackups,
    isPatron,
    patronTier,
    patronTierValue: () => PATRON_TIER_VALUES[patronTier.value],
    lastPremiumVerification
  };
});