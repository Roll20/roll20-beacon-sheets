import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMetaStore } from '../meta/metaStore';

describe('useMetaStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should initialize with default values', () => {
        const store = useMetaStore();

        expect(store.id).toBe('');
        expect(store.name).toBe('');
        expect(store.avatar).toBe('');
        expect(store.bio).toBe('');
        expect(store.gmNotes).toBe('');
        expect(store.token).toEqual({});
        expect(store.campaignId).toBeUndefined();
        expect(store.permissions.isOwner).toBe(false);
        expect(store.permissions.isGM).toBe(false);
    });

    describe('Hydration', () => {
        it('should hydrate store with provided data', () => {
            const store = useMetaStore();
            const mockData = {
                id: 'char-123',
                name: 'Test Character',
                avatar: 'avatar-url',
                bio: 'Test bio',
                gmNotes: 'GM notes',
                token: { bar1_value: 10 },
            };

            store.hydrate(mockData);

            expect(store.id).toBe('char-123');
            expect(store.name).toBe('Test Character');
            expect(store.avatar).toBe('avatar-url');
            expect(store.bio).toBe('Test bio');
            expect(store.gmNotes).toBe('GM notes');
            expect(store.token).toEqual({ bar1_value: 10 });
        });

        it('should safely handle null or undefined payload', () => {
            const store = useMetaStore();
            store.name = 'Original Name';
            
            store.hydrate(null as any);
            store.hydrate(undefined as any);

            expect(store.name).toBe('Original Name');
        });

        it('should preserve existing values when properties are missing or undefined', () => {
            const store = useMetaStore();
            store.name = 'Existing Name';
            store.avatar = 'existing-avatar';

            store.hydrate({
                id: 'new-id',
                name: undefined as any,
                avatar: undefined as any,
                bio: 'New bio',
                gmNotes: '',
                token: {},
            });

            expect(store.id).toBe('new-id');
            expect(store.name).toBe('Existing Name');
            expect(store.avatar).toBe('existing-avatar');
            expect(store.bio).toBe('New bio');
        });

        it('should NOT hydrate campaignId from character data', () => {
            const store = useMetaStore();
            store.campaignId = undefined;

            store.hydrate({
                id: '1',
                name: 'test',
                avatar: '',
                bio: '',
                gmNotes: '',
                token: {},
                // @ts-ignore - simulating extra data
                campaignId: 9999
            });

            expect(store.campaignId).toBeUndefined();
        });
    });

    describe('Dehydration', () => {
        it('should dehydrate store to serializable object', () => {
            const store = useMetaStore();
            store.name = 'Test Name';
            store.avatar = 'avatar.png';
            store.bio = 'Bio text';
            store.gmNotes = 'Notes';
            store.campaignId = 456;

            const dehydrated = store.dehydrate();

            expect(dehydrated).toEqual({
                name: 'Test Name',
                avatar: 'avatar.png',
                bio: 'Bio text',
                gmNotes: 'Notes',
                campaignId: 456,
            });
        });

        it('should not include sensitive or environment data in dehydrated output', () => {
            const store = useMetaStore();
            store.id = 'test-id';
            store.token = { bar1_value: "20"};
            store.permissions.isGM = true;

            const dehydrated = store.dehydrate();

            expect(dehydrated).not.toHaveProperty('id');
            expect(dehydrated).not.toHaveProperty('token');
            expect(dehydrated).not.toHaveProperty('permissions');
        });
    });

    describe('State Management', () => {
        it('should allow updating permissions reactively', () => {
            const store = useMetaStore();
            
            store.permissions.isGM = true;
            store.permissions.isOwner = true;

            expect(store.permissions.isGM).toBe(true);
            expect(store.permissions.isOwner).toBe(true);
        });
    });
});