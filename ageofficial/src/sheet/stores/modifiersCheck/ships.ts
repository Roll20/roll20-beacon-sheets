import { computed } from 'vue';
import { useShipStore } from '@/sheet/stores/character/shipStore';

// Penalty to Dexterity (Piloting) rolls from maneuverability loss stacks
export const maneuverabilityPenalty = computed(() => -useShipStore().losses.maneuverability);

// Net reduction to sensorsCurrent from sensor loss stacks
export const sensorsPenalty = computed(() => -useShipStore().losses.sensors);

// Combined evasion modifier: maneuverability loss + reactor offline flat penalty
export const evasionPenalty = computed(() => {
    const ship = useShipStore();
    return -ship.losses.maneuverability + (ship.seriousLosses.reactorOffline ? -2 : 0);
});

// Whether High-G Maneuvers are allowed (blocked by Reactor Offline serious loss)
export const highGAllowed = computed(() => !useShipStore().seriousLosses.reactorOffline);

// Per-stack penalty to weapon damage from weapons system loss
export const weaponsSystemDamageMod = computed(() => -useShipStore().losses.weaponsSystem);
