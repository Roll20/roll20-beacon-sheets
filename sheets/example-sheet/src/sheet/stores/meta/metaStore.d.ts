import type { Token } from '@roll20/beacon-sdk';
import { type Ref } from 'vue';
export type MetaHydrate = {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    gmNotes: string;
    token: Record<string, any>;
};
export declare const useMetaStore: import("pinia").StoreDefinition<"meta", import("pinia")._UnwrapAll<Pick<{
    id: Ref<string>;
    name: Ref<string>;
    avatar: Ref<string>;
    bio: Ref<string>;
    gmNotes: Ref<string>;
    token: Ref<Token>;
    permissions: {
        isOwner: boolean;
        isGM: boolean;
    };
    campaignId: Ref<null>;
    dehydrate: () => {
        name: string;
        avatar: string;
        bio: string;
        gmNotes: string;
        campaignId: null;
    };
    hydrate: (hydrateStore: MetaHydrate) => void;
}, "id" | "name" | "avatar" | "bio" | "gmNotes" | "token" | "permissions" | "campaignId">>, Pick<{
    id: Ref<string>;
    name: Ref<string>;
    avatar: Ref<string>;
    bio: Ref<string>;
    gmNotes: Ref<string>;
    token: Ref<Token>;
    permissions: {
        isOwner: boolean;
        isGM: boolean;
    };
    campaignId: Ref<null>;
    dehydrate: () => {
        name: string;
        avatar: string;
        bio: string;
        gmNotes: string;
        campaignId: null;
    };
    hydrate: (hydrateStore: MetaHydrate) => void;
}, never>, Pick<{
    id: Ref<string>;
    name: Ref<string>;
    avatar: Ref<string>;
    bio: Ref<string>;
    gmNotes: Ref<string>;
    token: Ref<Token>;
    permissions: {
        isOwner: boolean;
        isGM: boolean;
    };
    campaignId: Ref<null>;
    dehydrate: () => {
        name: string;
        avatar: string;
        bio: string;
        gmNotes: string;
        campaignId: null;
    };
    hydrate: (hydrateStore: MetaHydrate) => void;
}, "hydrate" | "dehydrate">>;
