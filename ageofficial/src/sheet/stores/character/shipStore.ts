import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import rollToChat from '@/utility/rollToChat';
import { useMetaStore } from '../meta/metaStore';

export type ShipLosses = {
    collateral: number;
    hull: number;
    maneuverability: number;
    sensors: number;
    weaponsSystem: number;
};

export type ShipSeriousLosses = {
    reactorOffline: boolean;
    railgunsOffline: boolean;
    torpedoesOffline: boolean;
    pdcsOffline: boolean;
};

export type ShipWeapon = {
    _id: string;
    name: string;
    type: 'railguns' | 'torpedoes' | 'pdc' | 'grapplers' | '';
    range: 'close' | 'medium' | 'long' | '';
    damage: string;
    attacksPerRound: number;
    offline: boolean;
};

export type ShipHydrate = {
    type?: string;
    drive?: Record<string, { _id: string; type: string; }> | Array<{ _id: string; type: string; }>;
    sensorsBase?: number;
    hullBase?: string;
    hullPenalty?: number;
    length?: number;
    weapons?: Record<string, ShipWeapon>;
    crew?: Record<string, CrewHydrate>;
    qualityFlaws?: Record<string, QualityFlawHydrate>;
    shipStunts?: { commander: number; pilot: number; engineer: number; gunner: number; sensors: number; };
    stuntDefs?: Record<string, ShipStuntDef>;
    losses?: ShipLosses;
    seriousLosses?: ShipSeriousLosses;
    pdcFiredThisRound?: boolean;
};

export type CrewHydrate = {
    _id: string;
    name: string;
    primaryRole?: string;
    ability?: Array<{
        _id: string | number;
        ability: string;
        value: number;
        focusValue: string;
        focus?: boolean;
        doubleFocus?: boolean;
        primary?: boolean;
    }>;
};

export type QualityFlawHydrate = {
    _id: string;
    name: string;
    description: string;
    type: 'quality' | 'flaw' | '';
};

export type ShipStuntDef = {
    _id: string;
    role: 'commander' | 'pilot' | 'engineer' | 'gunner' | 'sensors';
    sp: number;
    name: string;
    description: string;
};

// Maps role key → the focus name stored on crew ability entries
const roleFocusMap: Record<string, string> = {
    pilot: 'Piloting',
    engineer: 'Engineering',
    sensors: 'Technology',
    commander: 'Leadership',
    gunner: 'Gunnery',
};

export const useShipStore = defineStore('ship', () => {
    const type = ref('');
    const drive = ref<{ _id: string; type: string; }[]>([]);
    const length = ref<number>(0);
    const sensorsBase = ref<number>(0);
    const hullBase = ref<string>('');
    const hullPenalty = ref<number>(0);
    const crew = ref<CrewHydrate[]>([]);
    const qualityFlaws = ref<QualityFlawHydrate[]>([]);
    const stuntDefs = ref<ShipStuntDef[]>([]);
    const weapons = ref<ShipWeapon[]>([]);
    const shipStunts = ref<{ commander: number; pilot: number; engineer: number; gunner: number; sensors: number; }>({ commander: 0, pilot: 0, engineer: 0, gunner: 0, sensors: 0 });
    const pdcFiredThisRound = ref<boolean>(false);

    const losses = ref<ShipLosses>({
        collateral: 0,
        hull: 0,
        maneuverability: 0,
        sensors: 0,
        weaponsSystem: 0,
    });

    const seriousLosses = ref<ShipSeriousLosses>({
        reactorOffline: false,
        railgunsOffline: false,
        torpedoesOffline: false,
        pdcsOffline: false,
    });

    // Derived from sensorsBase minus sensor loss stacks
    const sensorsCurrent = computed(() => Math.max(0, sensorsBase.value - losses.value.sensors));

    const shipSizeOptions = [
        { size: 'Tiny',     length: 0,       hull: '1',    crewMin: 1,    crewAvg: 2    },
        { size: 'Small',    length: 5.001,   hull: '1d3',  crewMin: 1,    crewAvg: 2    },
        { size: 'Medium',   length: 10.001,  hull: '1d6',  crewMin: 2,    crewAvg: 4    },
        { size: 'Large',    length: 25.001,  hull: '2d6',  crewMin: 4,    crewAvg: 16   },
        { size: 'Huge',     length: 50.001,  hull: '3d6',  crewMin: 16,   crewAvg: 64   },
        { size: 'Gigantic', length: 100.001, hull: '4d6',  crewMin: 64,   crewAvg: 512  },
        { size: 'Colossal', length: 250.001, hull: '5d6',  crewMin: 256,  crewAvg: 2048 },
        { size: 'Titanic',  length: 500.001, hull: '6d6',  crewMin: 1024, crewAvg: 8192 },
    ];

    const computedShipSize = computed(() =>
        Object.values(shipSizeOptions)
            .reverse()
            .find((s) => (length.value !== null ? s.length <= length.value : false)) || { size: '', length: 0, hull: '', crewMin: 0, crewAvg: 0 }
    );

    // Find the primary-role crew member for a given role key and return their ability score + focus bonus.
    // Falls back to any crew member with the role if no primary is set.
    const getCrewAbilityForRole = (roleKey: string): { abilityValue: number; focusBonus: number } => {
        const focusName = roleFocusMap[roleKey];
        if (!focusName) return { abilityValue: 0, focusBonus: 0 };

        const getAbilities = (member: CrewHydrate) =>
            Array.isArray(member.ability) ? member.ability : objectToArray(member.ability || {});

        // Prefer primary role holder
        for (const member of crew.value) {
            for (const ab of getAbilities(member)) {
                if (ab.focusValue === focusName && ab.primary) {
                    return { abilityValue: Number(ab.value) || 0, focusBonus: ab.doubleFocus ? 4 : ab.focus ? 2 : 0 };
                }
            }
        }
        // Fall back to any crew member assigned to this role
        for (const member of crew.value) {
            for (const ab of getAbilities(member)) {
                if (ab.focusValue === focusName) {
                    return { abilityValue: Number(ab.value) || 0, focusBonus: ab.doubleFocus ? 4 : ab.focus ? 2 : 0 };
                }
            }
        }
        return { abilityValue: 0, focusBonus: 0 };
    };

    // === Ship Combat Rolls ===
    // Electronic Warfare: 3d6 + Intelligence (Technology focus) + Sensors vs TN 11
    const rollElectronicWarfare = async () => {
        const { abilityValue, focusBonus } = getCrewAbilityForRole('sensors');
        await rollToChat({
            characterName: useMetaStore().name,
            title: 'Electronic Warfare',
            subtitle: 'Intelligence (Technology) + Sensors vs TN 11',
            rollType: 'standard',
            hideSuccessText: true,
            traits: ['Ship', 'Electronic Warfare'],
            targetNumber: 11,
            components: [
                { label: 'Base Roll', sides: 6, count: 3, alwaysShowInBreakdown: true },
                { label: 'Intelligence', value: abilityValue },
                { label: 'Technology Focus', value: focusBonus },
                { label: 'Sensors', value: sensorsCurrent.value },
            ],
        });
    };

    // Evasion: 3d6 + Dexterity (Piloting focus) vs TN 10 + enemy sensors
    // Penalties from maneuverability losses and reactor offline serious loss are applied automatically.
    // High-G bonus (+1–+6) boosts the roll but also helps enemies evade this ship's attacks that round.
    const rollEvasion = async (enemySensors: number, highGBonus: number = 0) => {
        const { abilityValue, focusBonus } = getCrewAbilityForRole('pilot');
        const maneuverPenalty = -losses.value.maneuverability;
        const reactorPenalty = seriousLosses.value.reactorOffline ? -2 : 0;
        const tn = 10 + enemySensors;
        const components: any[] = [
            { label: 'Base Roll', sides: 6, count: 3, alwaysShowInBreakdown: true },
            { label: 'Dexterity', value: abilityValue },
            { label: 'Piloting Focus', value: focusBonus },
        ];
        if (maneuverPenalty < 0) components.push({ label: 'Maneuverability Loss', value: maneuverPenalty });
        if (reactorPenalty < 0) components.push({ label: 'Reactor Offline', value: reactorPenalty });
        if (highGBonus > 0) components.push({ label: 'High-G Maneuver', value: highGBonus });
        await rollToChat({
            characterName: useMetaStore().name,
            title: 'Evasion',
            subtitle: `Dexterity (Piloting) vs TN ${tn}${highGBonus > 0 ? ` — High-G +${highGBonus} (crew Con TN ${8 + highGBonus})` : ''}`,
            rollType: 'standard',
            hideSuccessText: true,
            traits: ['Ship', 'Evasion'],
            targetNumber: tn,
            components,
        });
    };

    // Point Defense: 3d6 + Sensors (current) vs TN 10 + enemy sensors
    // TN increases by +2 if PDCs already fired offensively this round.
    const rollPointDefense = async (enemySensors: number) => {
        const pdcPenalty = pdcFiredThisRound.value ? 2 : 0;
        const tn = 10 + enemySensors + pdcPenalty;
        await rollToChat({
            characterName: useMetaStore().name,
            title: 'Point Defense',
            subtitle: `Sensors vs TN ${tn}${pdcPenalty > 0 ? ' (+2 — PDCs already fired this round)' : ''}`,
            rollType: 'standard',
            hideSuccessText: true,
            traits: ['Ship', 'Point Defense'],
            targetNumber: tn,
            components: [
                { label: 'Base Roll', sides: 6, count: 3, alwaysShowInBreakdown: true },
                { label: 'Sensors (Current)', value: sensorsCurrent.value },
            ],
        });
    };

    // Damage Control: 3d6 + Intelligence (Engineering focus) vs TN 11
    // Advanced test — ST 5 removes one loss, ST 10 removes two losses.
    // Cannot remove Collateral or Hull losses.
    const rollDamageControl = async () => {
        const { abilityValue, focusBonus } = getCrewAbilityForRole('engineer');
        await rollToChat({
            characterName: useMetaStore().name,
            title: 'Damage Control',
            subtitle: 'Intelligence (Engineering) vs TN 11 — ST 5 (1 loss) / ST 10 (2 losses)',
            rollType: 'standard',
            hideSuccessText: true,
            traits: ['Ship', 'Damage Control'],
            targetNumber: 11,
            components: [
                { label: 'Base Roll', sides: 6, count: 3, alwaysShowInBreakdown: true },
                { label: 'Intelligence', value: abilityValue },
                { label: 'Engineering Focus', value: focusBonus },
            ],
        });
    };

    // Hull Roll: rolls the ship's hull dice formula (e.g. 2d6) with hull loss penalty applied
    const rollHull = async () => {
        const hullFormula = computedShipSize.value.hull;
        if (!hullFormula) return;
        const match = hullFormula.match(/^(\d+)d(\d+)$/);
        if (!match) return;
        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        const components: any[] = [
            { label: hullFormula, sides, count, alwaysShowInBreakdown: true },
        ];
        if (losses.value.hull > 0) {
            components.push({ label: 'Hull Loss', value: -losses.value.hull });
        }
        await rollToChat({
            characterName: useMetaStore().name,
            title: 'Hull Roll',
            subtitle: hullFormula + (losses.value.hull > 0 ? ` − ${losses.value.hull} (Hull Loss)` : ''),
            rollType: 'standard',
            hideSuccessText: true,
            traits: ['Ship', 'Hull'],
            components,
        });
    };

    // Generic crew role test — used by role test buttons in ShipCrewSection
    const rollCrewTest = async (roleKey: string) => {
        const { abilityValue, focusBonus } = getCrewAbilityForRole(roleKey);
        const roleLabel = roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
        const abilityLabel: Record<string, string> = {
            pilot: 'Dexterity (Piloting)',
            engineer: 'Intelligence (Engineering)',
            sensors: 'Intelligence (Technology)',
            commander: 'Communication (Leadership)',
            gunner: 'Accuracy (Gunnery)',
        };
        await rollToChat({
            characterName: useMetaStore().name,
            title: `${roleLabel} Test`,
            subtitle: abilityLabel[roleKey] || roleLabel,
            rollType: 'standard',
            hideSuccessText: true,
            traits: ['Ship', roleLabel],
            components: [
                { label: 'Base Roll', sides: 6, count: 3, alwaysShowInBreakdown: true },
                { label: 'Ability Score', value: abilityValue },
                { label: 'Focus', value: focusBonus },
            ],
        });
    };

    // === Loss Management ===

    const adjustLoss = (type: keyof ShipLosses, delta: number) => {
        const next = losses.value[type] + delta;
        losses.value[type] = Math.min(6, Math.max(0, next));
    };

    const toggleSeriousLoss = (type: keyof ShipSeriousLosses) => {
        seriousLosses.value[type] = !seriousLosses.value[type];
    };

    const resetPdcFiredThisRound = () => {
        pdcFiredThisRound.value = false;
    };

    const resetAllLosses = () => {
        losses.value = { collateral: 0, hull: 0, maneuverability: 0, sensors: 0, weaponsSystem: 0 };
        seriousLosses.value = { reactorOffline: false, railgunsOffline: false, torpedoesOffline: false, pdcsOffline: false };
    };

    // === Crew / QF / Weapon Management ===

    const addCrewMember = (member: CrewHydrate) => {
        if (!member._id) member._id = uuidv4();
        crew.value.push(member);
    };

    const updateCrewMember = (member: CrewHydrate) => {
        const index = crew.value.findIndex((m) => m._id === member._id);
        if (index !== -1) crew.value[index] = member;
    };

    const deleteCrewMember = (memberId: string) => {
        crew.value = crew.value.filter((m) => m._id !== memberId);
    };

    const addQF = (member: QualityFlawHydrate) => {
        if (!member._id) member._id = uuidv4();
        qualityFlaws.value.push(member);
    };

    const updateQF = (member: QualityFlawHydrate) => {
        const index = qualityFlaws.value.findIndex((m) => m._id === member._id);
        if (index !== -1) qualityFlaws.value[index] = member;
    };

    const deleteQF = (memberId: string) => {
        qualityFlaws.value = qualityFlaws.value.filter((m) => m._id !== memberId);
    };

    const addStuntDef = (stunt: ShipStuntDef) => {
        if (!stunt._id) stunt._id = uuidv4();
        stuntDefs.value.push(stunt);
    };

    const updateStuntDef = (stunt: ShipStuntDef) => {
        const index = stuntDefs.value.findIndex((s) => s._id === stunt._id);
        if (index !== -1) stuntDefs.value[index] = stunt;
    };

    const deleteStuntDef = (id: string) => {
        stuntDefs.value = stuntDefs.value.filter((s) => s._id !== id);
    };

    const addWeapon = (member: any) => {
        if (!member._id) member._id = uuidv4();
        if (member.offline === undefined) member.offline = false;
        weapons.value.push(member);
    };

    const updateWeapon = (member: any) => {
        const index = weapons.value.findIndex((m) => m._id === member._id);
        if (index !== -1) weapons.value[index] = member;
    };

    const deleteWeapon = (memberId: string) => {
        weapons.value = weapons.value.filter((m) => m._id !== memberId);
    };

    const resetShipStunts = (stuntType: 'commander' | 'pilot' | 'engineer' | 'gunner' | 'sensors') => {
        shipStunts.value[stuntType] = 0;
    };

    // === Serialization ===

    const dehydrate = () => {
        return {
            type: type.value,
            drive: arrayToObject(drive.value),
            length: length.value,
            sensorsBase: sensorsBase.value,
            hullBase: hullBase.value,
            hullPenalty: hullPenalty.value,
            crew: arrayToObject(crew.value.map(({ _id, name, primaryRole, ability }) => ({
                _id,
                name,
                primaryRole,
                ability: arrayToObject(ability || []),
            }))),
            qualityFlaws: arrayToObject(qualityFlaws.value),
            stuntDefs: arrayToObject(stuntDefs.value),
            weapons: arrayToObject(weapons.value),
            shipStunts: shipStunts.value,
            losses: losses.value,
            seriousLosses: seriousLosses.value,
            pdcFiredThisRound: pdcFiredThisRound.value,
        };
    };

    const hydrate = (hydrateStore: ShipHydrate) => {
        const crewArray = objectToArray(hydrateStore.crew || {});
        type.value = hydrateStore.type || '';
        const driveOptions = [
            { _id: '1', type: 'Epstein' },
            { _id: '2', type: 'Thrusters' },
        ];
        const rawDrives = objectToArray(hydrateStore.drive || {});
        drive.value = rawDrives
            .map((d: any) => driveOptions.find((o) => o._id === d._id) ?? d)
            .filter(Boolean);
        length.value = hydrateStore.length || 0;
        sensorsBase.value = hydrateStore.sensorsBase || 0;
        hullBase.value = hydrateStore.hullBase || '';
        hullPenalty.value = hydrateStore.hullPenalty || 0;
        crew.value = crewArray.map((c: any) => ({
            ...c,
            ability: Array.isArray(c.ability) ? c.ability : objectToArray(c.ability || {}),
        })) || [];
        qualityFlaws.value = objectToArray(hydrateStore.qualityFlaws || {}) || [];
        stuntDefs.value = objectToArray(hydrateStore.stuntDefs || {}) || [];
        weapons.value = objectToArray(hydrateStore.weapons || {}) || [];
        shipStunts.value = hydrateStore.shipStunts || { commander: 0, pilot: 0, engineer: 0, gunner: 0, sensors: 0 };
        losses.value = hydrateStore.losses ?? { collateral: 0, hull: 0, maneuverability: 0, sensors: 0, weaponsSystem: 0 };
        seriousLosses.value = hydrateStore.seriousLosses ?? { reactorOffline: false, railgunsOffline: false, torpedoesOffline: false, pdcsOffline: false };
        pdcFiredThisRound.value = hydrateStore.pdcFiredThisRound ?? false;
    };

    return {
        type,
        drive,
        length,
        sensorsBase,
        sensorsCurrent,
        hullBase,
        hullPenalty,
        crew,
        qualityFlaws,
        stuntDefs,
        addStuntDef,
        updateStuntDef,
        deleteStuntDef,
        shipStunts,
        losses,
        seriousLosses,
        pdcFiredThisRound,
        computedShipSize,
        addCrewMember,
        updateCrewMember,
        deleteCrewMember,
        addQF,
        updateQF,
        deleteQF,
        weapons,
        addWeapon,
        updateWeapon,
        deleteWeapon,
        rollElectronicWarfare,
        rollEvasion,
        rollPointDefense,
        rollDamageControl,
        rollHull,
        rollCrewTest,
        adjustLoss,
        toggleSeriousLoss,
        resetPdcFiredThisRound,
        resetAllLosses,
        resetShipStunts,
        dehydrate,
        hydrate,
    };
});
