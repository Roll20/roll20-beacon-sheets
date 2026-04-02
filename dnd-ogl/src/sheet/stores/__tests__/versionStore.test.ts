import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useVersionStore, PatronTier } from '../version/versionStore';

// Mock the relay module
const mockUpdateSharedSettings = vi.fn();
const mockInitValues = {
  settings: { currentUserId: 'player-123', campaignId: 456 } as any,
};
const mockSharedSettingsRef = { value: {} as Record<string, any> };
const mockDispatchRef = { value: { updateSharedSettings: mockUpdateSharedSettings } };

vi.mock('@/relay/relay', () => ({
  get initValues() {
    return mockInitValues;
  },
  get sharedSettingsRef() {
    return mockSharedSettingsRef;
  },
  get dispatchRef() {
    return mockDispatchRef;
  },
}));

// mock global fetch
const mockFetch = (responses: Array<{ json: () => any; ok?: boolean }>) => {
  let callIndex = 0;
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    const res = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return { json: async () => res.json(), ok: res.ok ?? true } as Response;
  });
};

describe('useVersionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Reset mock relay state
    mockInitValues.settings = { currentUserId: 'player-123', campaignId: 456 } as any;
    mockSharedSettingsRef.value = {};
    mockUpdateSharedSettings.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const store = useVersionStore();

    expect(store.isPatron).toBe(false);
    expect(store.patronTier).toBe(PatronTier.None);
    expect(store.lastPremiumVerification).toBeNull();
  });

  describe('checkPremiumStatus', () => {
    // Early exit conditions

    it('should bail out when playerId is missing', async () => {
      mockInitValues.settings = { campaignId: 456 } as any;
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(store.isPatron).toBe(false);
    });

    it('should bail out when campaignId is missing', async () => {
      mockInitValues.settings = { currentUserId: 'player-123' } as any;
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(store.isPatron).toBe(false);
    });

    // sharedSettings fast path (campaign already marked premium)

    it('should fast-unlock when sharedSettings.isCampaignPremium is true and recent verification', async () => {
      mockSharedSettingsRef.value = {
        isCampaignPremium: true,
        lastCampaignVerification: new Date().toISOString(),
      };
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(store.isPatron).toBe(true);
      expect(store.patronTier).toBe(PatronTier.Platinum);
      expect(store.lastPremiumVerification).not.toBeNull();
      // No fetch needed within 24h
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should re-verify campaign when lastCampaignVerification is stale (>24h)', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      mockSharedSettingsRef.value = {
        isCampaignPremium: true,
        lastCampaignVerification: twoDaysAgo,
      };
      const fetchSpy = mockFetch([{ json: () => ({ claimed: true }) }]);
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(store.isPatron).toBe(true);
      expect(store.patronTier).toBe(PatronTier.Platinum);
      // Should have called /verify-campaign
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0][0]).toContain('/verify-campaign');
      // Should update the shared settings timestamp
      expect(mockUpdateSharedSettings).toHaveBeenCalledWith({
        settings: expect.objectContaining({ isCampaignPremium: true, lastCampaignVerification: expect.any(String) }),
      });
    });

    it('should revoke premium when campaign re-verification finds claim no longer valid', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      mockSharedSettingsRef.value = {
        isCampaignPremium: true,
        lastCampaignVerification: twoDaysAgo,
      };
      const fetchSpy = mockFetch([{ json: () => ({ claimed: false }) }]);
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(store.isPatron).toBe(false);
      expect(store.patronTier).toBe(PatronTier.None);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(mockUpdateSharedSettings).toHaveBeenCalledWith({
        settings: expect.objectContaining({ isCampaignPremium: false, campaignClaimedBy: null, lastCampaignVerification: null }),
      });
    });

    it('should re-verify when lastCampaignVerification is missing', async () => {
      mockSharedSettingsRef.value = {
        isCampaignPremium: true,
        // no lastCampaignVerification
      };
      const fetchSpy = mockFetch([{ json: () => ({ claimed: true }) }]);
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0][0]).toContain('/verify-campaign');
      expect(store.isPatron).toBe(true);
    });

    it('should still set isPatron even if campaign re-verification network call fails', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      mockSharedSettingsRef.value = {
        isCampaignPremium: true,
        lastCampaignVerification: twoDaysAgo,
      };
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
      const store = useVersionStore();

      await store.checkPremiumStatus();

      // Should still be patron despite verification failure
      expect(store.isPatron).toBe(true);
      expect(store.patronTier).toBe(PatronTier.Platinum);
    });

    // /verify endpoint (direct player/campaign check)

    it('should set patron status when /verify returns active', async () => {
      mockFetch([{ json: () => ({ status: 'active', tierValue: PatronTier.Gold, tier: 'Gold' }) }]);
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(store.isPatron).toBe(true);
      expect(store.patronTier).toBe(PatronTier.Gold);
      expect(store.lastPremiumVerification).not.toBeNull();
    });

    it('should clear patron status when /verify returns inactive', async () => {
      mockFetch([{ json: () => ({ status: 'inactive', tierValue: 0, tier: null }) }]);
      const store = useVersionStore();
      // Pre-set as patron to verify it gets cleared
      store.isPatron = true;
      store.patronTier = PatronTier.Gold;

      await store.checkPremiumStatus();

      expect(store.isPatron).toBe(false);
      expect(store.patronTier).toBe(PatronTier.None);
      expect(store.lastPremiumVerification).toBeNull();
    });

    it('should handle /verify network failure gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
      const store = useVersionStore();

      await store.checkPremiumStatus();

      // Should not throw, patron remains false
      expect(store.isPatron).toBe(false);
      expect(store.patronTier).toBe(PatronTier.None);
    });

    // 24-hour cache

    it('should skip network call when last verification is within 24h and isPatron is true', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const store = useVersionStore();
      store.isPatron = true;
      store.patronTier = PatronTier.Gold;
      store.lastPremiumVerification = new Date().toISOString();

      await store.checkPremiumStatus();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(store.isPatron).toBe(true);
    });

    it('should re-fetch when last verification is older than 24h', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const fetchSpy = mockFetch([
        { json: () => ({ status: 'active', tierValue: PatronTier.Silver, tier: 'Silver' }) },
      ]);
      const store = useVersionStore();
      store.isPatron = true;
      store.patronTier = PatronTier.Gold;
      store.lastPremiumVerification = twoDaysAgo;

      await store.checkPremiumStatus();

      expect(fetchSpy).toHaveBeenCalled();
      expect(store.patronTier).toBe(PatronTier.Silver);
    });

    it('should NOT skip network when lastPremiumVerification exists but isPatron is false', async () => {
      const fetchSpy = mockFetch([
        { json: () => ({ status: 'active', tierValue: PatronTier.Copper, tier: 'Copper' }) },
      ]);
      const store = useVersionStore();
      store.isPatron = false;
      store.lastPremiumVerification = new Date().toISOString();

      await store.checkPremiumStatus();

      expect(fetchSpy).toHaveBeenCalled();
      expect(store.isPatron).toBe(true);
    });

    // Tier values

    it('should correctly map tier enum values', () => {
      expect(PatronTier.None).toBe('None');
      expect(PatronTier.Copper).toBe('Copper');
      expect(PatronTier.Silver).toBe('Silver');
      expect(PatronTier.Gold).toBe('Gold');
      expect(PatronTier.Platinum).toBe('Platinum');
      expect(PatronTier.Founder).toBe('Founder');
    });
  });

  describe('claimCampaign', () => {
    it('should return success when claim succeeds', async () => {
      mockFetch([{ json: () => ({ success: true }) }]);
      const store = useVersionStore();

      const result = await store.claimCampaign();

      expect(result).toEqual({ success: true });
      expect(mockUpdateSharedSettings).toHaveBeenCalledWith({
        settings: expect.objectContaining({
          isCampaignPremium: true,
          campaignClaimedBy: expect.any(String),
          lastCampaignVerification: expect.any(String),
        }),
      });
    });

    it('should return limit_reached error', async () => {
      mockFetch([{ json: () => ({ error: 'limit_reached' }) }]);
      const store = useVersionStore();

      const result = await store.claimCampaign();

      expect(result).toEqual({ success: false, error: 'limit_reached' });
      expect(mockUpdateSharedSettings).not.toHaveBeenCalled();
    });

    it('should bail out when playerId is missing', async () => {
      mockInitValues.settings = { campaignId: 456 } as any;
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const store = useVersionStore();

      const result = await store.claimCampaign();

      expect(result).toBeUndefined();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should handle network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
      const store = useVersionStore();

      const result = await store.claimCampaign();

      expect(result).toEqual({ success: false, error: 'network' });
    });
  });

  describe('unclaimCampaign', () => {
    it('should return success when unclaim succeeds', async () => {
      mockFetch([{ json: () => ({ success: true }) }]);
      const store = useVersionStore();

      const result = await store.unclaimCampaign();

      expect(result).toEqual({ success: true });
      expect(mockUpdateSharedSettings).toHaveBeenCalledWith({
        settings: expect.objectContaining({
          isCampaignPremium: false,
          campaignClaimedBy: null,
          lastCampaignVerification: null,
        }),
      });
    });

    it('should bail out when campaignId is missing', async () => {
      mockInitValues.settings = { currentUserId: 'player-123' } as any;
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const store = useVersionStore();

      const result = await store.unclaimCampaign();

      expect(result).toBeUndefined();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should handle network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
      const store = useVersionStore();

      const result = await store.unclaimCampaign();

      expect(result).toEqual({ success: false, error: 'network' });
    });
  });
});
