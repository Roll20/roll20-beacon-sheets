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

  /*describe('checkPremiumStatus', () => {
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


    // /verify endpoint (direct player/campaign check)

    it('should set patron status when /verify returns active', async () => {
      mockFetch([{ json: () => ({ status: 'active', tierValue: PatronTier.MasterCrafter, tier: 'MasterCrafter' }) }]);
      const store = useVersionStore();

      await store.checkPremiumStatus();

      expect(store.isPatron).toBe(true);
      expect(store.patronTier).toBe(PatronTier.MasterCrafter);
      expect(store.lastPremiumVerification).not.toBeNull();
    });

    it('should clear patron status when /verify returns inactive', async () => {
      mockFetch([{ json: () => ({ status: 'inactive', tierValue: 0, tier: null }) }]);
      const store = useVersionStore();
      // Pre-set as patron to verify it gets cleared
      store.isPatron = true;
      store.patronTier = PatronTier.MasterCrafter;

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
      store.patronTier = PatronTier.MasterCrafter;
      store.lastPremiumVerification = new Date().toISOString();

      await store.checkPremiumStatus();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(store.isPatron).toBe(true);
    });

    it('should re-fetch when last verification is older than 24h', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const fetchSpy = mockFetch([
        { json: () => ({ status: 'active', tierValue: PatronTier.GuildMember, tier: 'GuildMember' }) },
      ]);
      const store = useVersionStore();
      store.isPatron = true;
      store.patronTier = PatronTier.MasterCrafter;
      store.lastPremiumVerification = twoDaysAgo;

      await store.checkPremiumStatus();

      expect(fetchSpy).toHaveBeenCalled();
      expect(store.patronTier).toBe(PatronTier.GuildMember);
    });

    it('should NOT skip network when lastPremiumVerification exists but isPatron is false', async () => {
      const fetchSpy = mockFetch([
        { json: () => ({ status: 'active', tierValue: PatronTier.Apprentice, tier: 'Apprentice' }) },
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
      expect(PatronTier.Apprentice).toBe('Apprentice');
      expect(PatronTier.GuildMember).toBe('GuildMember');
      expect(PatronTier.MasterCrafter).toBe('MasterCrafter');
    });
  });*/



  
});
