import { type Character, type CompendiumDragDropData, type Dispatch, type Settings, type UpdateArgs } from '@roll20/beacon-sdk';
import type { PiniaPluginContext } from 'pinia';
import { type Ref, type App } from 'vue';
export type InitValues = {
    id: string;
    character: Character;
    settings: Settings;
    compendiumDrop: CompendiumDragDropData | null;
};
export declare const initValues: InitValues;
export declare const beaconPulse: Ref<number>;
export declare const blockUpdate: Ref<boolean>;
export declare const dispatchRef: import("vue").ShallowRef<any>;
export declare const dropUpdate: Ref<Dispatch>;
export declare const settingsSheet: Ref<boolean>;
export declare const createRelay: ({ devMode, primaryStore, logMode, }: {
    devMode?: boolean | undefined;
    primaryStore?: string | undefined;
    logMode?: boolean | undefined;
}) => Promise<{
    relayPinia: (context: PiniaPluginContext) => {
        characters: {
            [id: string]: Character;
        };
        addHandler: (id: string, fn: import("@roll20/beacon-sdk").InternalEventHandler) => void;
        removeHandler: (id: string) => void;
        update: (update: UpdateArgs) => Promise<void>;
        updateCharacter: (update: UpdateArgs) => Promise<void>;
        updateSharedSettings: (update: import("@roll20/beacon-sdk").SharedSettingsChangeArgs) => Promise<void>;
        subscribe: (subscribe: import("@roll20/beacon-sdk").SubscribeArgs) => Promise<Character>;
        perform: (perform: import("@roll20/beacon-sdk").PerformActionArgs) => Promise<void>;
        getComputed: (computed: import("@roll20/beacon-sdk").ComputedArgs) => Promise<import("@roll20/beacon-sdk").ComputedResult>;
        setComputed: (computed: import("@roll20/beacon-sdk").ComputedArgs) => Promise<import("@roll20/beacon-sdk").ComputedResult>;
        compendiumRequest: (data: {
            query: string;
        }) => Promise<import("@roll20/beacon-sdk").CompendiumResults>;
        debouncedCompendiumRequest: (data: {
            query: string;
        }) => Promise<import("@roll20/beacon-sdk").CompendiumResults>;
        roll: (roll: import("@roll20/beacon-sdk").RollArgs) => Promise<import("@roll20/beacon-sdk").RollReturnValue>;
        post: (post: import("@roll20/beacon-sdk").PostArgs) => Promise<string>;
        query: (query: import("@roll20/beacon-sdk").QueryArgs) => Promise<{
            results: import("@roll20/beacon-sdk").QueryResults;
            errors: [string];
        }>;
        getTokens: (args: import("@roll20/beacon-sdk").GetTokensArgs) => Promise<import("@roll20/beacon-sdk").GetTokensResults>;
        updateTokensByCharacter: (args: import("@roll20/beacon-sdk").UpdateTokensByCharacterArgs) => Promise<void>;
        updateTokensByIds: (args: import("@roll20/beacon-sdk").UpdateTokensByIdsArgs) => Promise<void>;
        addToTracker: (args: import("@roll20/beacon-sdk").AddToTrackerArgs) => Promise<void>;
        setContainerSize: (args: import("@roll20/beacon-sdk").SetContainerSizeArgs) => Promise<void>;
        addActionsToHost: (args: import("@roll20/beacon-sdk").AddActionsToHostArgs) => void;
        getActions: (args: import("@roll20/beacon-sdk").GetActionsArgs) => Promise<import("@roll20/beacon-sdk").GetActionsResults>;
        autoLinkText: (args: {
            text: string;
        }) => Promise<string>;
        openDialogFromLink: (args: {
            urlString: string;
        }) => void;
        legacyActionButton: (args: import("@roll20/beacon-sdk").LegacyActionArgs) => void;
        legacyDeleteRepeatingRow: (args: import("@roll20/beacon-sdk").LegacyRowDeletedArgs) => void;
        sendSheetworkerMessage: (message: any) => void;
        setSilent: () => void;
        mancerContext?: import("@roll20/beacon-sdk").MancerContext | undefined;
    } | undefined;
    relayVue: {
        install(app: App): void;
    };
}>;
