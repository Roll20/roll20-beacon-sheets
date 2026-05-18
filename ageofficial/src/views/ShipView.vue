<template>
    <div class="ship-view">
        <div class="ship-view-avatar-mobile">
            <img :src="meta.avatar" />
        </div>
        <div class="ship-view-cntr">
            <img ref="avatarImg" class="ship-view-avatar" :src="meta.avatar" />
            <div>
                <h1>{{ meta.name }}</h1>
                <div style="display: flex; gap:10px; flex-wrap: wrap;" class="age-ship-details">
                    <div class="age-ship-chip">
                        <span class="age-ship-chip-label">Size</span>
                        <span class="age-ship-chip-value">{{ computedShipSize.size }}</span>
                    </div>
                    <div class="age-ship-chip">
                        <span class="age-ship-chip-label">Hull</span>
                        <span class="age-ship-chip-value">{{ computedShipSize.hull }}</span>
                    </div>
                    <div class="age-ship-chip">
                        <span class="age-ship-chip-label">Crew</span>
                        <span class="age-ship-chip-value">{{ computedShipSize.crewMin }} ({{ computedShipSize.crewAvg }})</span>
                    </div>
                    <div class="age-ship-chip">
                        <span class="age-ship-chip-label">Sensors</span>
                        <span class="age-ship-chip-value">
                            {{ ship.sensorsCurrent }}
                            <span v-if="ship.losses.sensors > 0" class="age-ship-chip-base">(base {{ ship.sensorsBase }})</span>
                        </span>
                    </div>
                    <div class="age-ship-chip">
                        <span class="age-ship-chip-label">Drives</span>
                        <span class="age-ship-chip-value">
                            <span v-for="drive in ship.drive" :key="drive._id">{{ drive.type }}</span>
                            <span v-if="ship.seriousLosses.reactorOffline" class="age-chip-offline">OFFLINE</span>
                        </span>
                    </div>
                </div>
            </div>
            <button type="button" class="ship-config-btn age-icon-btn" @click="showModal = true">
                <font-awesome-icon :icon="['fa', 'gear']" />
            </button>
        </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap:15px;">
        <div class="ship-view-cntr" style="display: flex; flex-wrap: wrap; flex:1;">
            <div style="flex:1; min-width: 220px;">

                <!-- Combat Actions Card -->
                <div class="section-card" style="margin-bottom: 15px;">
                    <h4>Actions</h4>
                    <!-- Action Buttons -->
                    <div class="age-ship-actions">
                        <button class="age-btn" @click="onElectronicWarfare">
                            Electronic Warfare
                        </button>
                        <button class="age-btn" @click="onEvasion">
                            Evasion<span v-if="highGBonusInput > 0" class="age-btn-badge">+{{ highGBonusInput }}</span>
                        </button>
                        <button class="age-btn" @click="onPointDefense"
                            v-tippy="{ content: ship.pdcFiredThisRound ? 'TN+2: PDCs already fired this round' : 'Point defense test' }">
                            Point Defense<span v-if="ship.pdcFiredThisRound" class="age-btn-badge">TN+2</span>
                        </button>
                        <button class="age-btn" @click="onDamageControl">
                            Damage Control
                        </button>
                    </div>

                    <button class="age-btn" style="width:100%; margin-top:8px;"
                        @click="ship.rollHull()"
                        :disabled="!computedShipSize.hull"
                        v-tippy="{ content: 'Roll hull dice: ' + (computedShipSize.hull || 'set ship length first') }">
                        Roll Hull <span v-if="computedShipSize.hull" class="age-btn-badge">{{ computedShipSize.hull }}</span>
                    </button>

                    <button class="age-btn age-btn--dim" style="width:100%; margin-top:8px;"
                        @click="ship.resetPdcFiredThisRound()"
                        v-tippy="{ content: 'Clear PDC-fired flag and begin a new combat round' }">
                        New Round
                    </button>
                </div>

                <!-- Stunts Card -->
                <div class="section-card" style="margin-bottom: 15px;">
                    <h4>Stunt Points</h4>
                    <ShipStuntsView />
                </div>
            </div>
        </div>

        <div class="age-ship-details" style="flex:2;">
            <ShipTabsView />
            <!-- Loss Conditions Card — full width below the main columns -->
    <div class="section-card" style="margin-top: 15px; display: flex; flex-direction: row; gap: 20px;">
        <div style="flex: 2;">
            <h4 style="font-size: 14px;">Losses</h4>
            <div class="age-ship-losses">
                <div v-for="loss in shipLossTypes" :key="loss.key" class="age-ship-loss-row">
                    <span class="age-ship-loss-label">{{ loss.label }}</span>
                    <button class="age-icon-btn" @click="ship.adjustLoss(loss.key, -1)"
                        :disabled="ship.losses[loss.key] === 0">−</button>
                    <span class="age-ship-loss-value" :class="{ 'age-ship-loss-active': ship.losses[loss.key] > 0 }">
                        {{ ship.losses[loss.key] }}
                    </span>
                    <button class="age-icon-btn" @click="ship.adjustLoss(loss.key, 1)"
                        :disabled="ship.losses[loss.key] === 6">+</button>
                </div>
            </div>
        </div>
        <div style="flex:1;">
            <h4 style="font-size: 14px;">Serious Losses</h4>
            <div class="age-ship-serious-losses">
                <label v-for="sl in seriousLossTypes" :key="sl.key" class="age-checkbox-toggle-row">
                    <input type="checkbox"
                        :checked="ship.seriousLosses[sl.key]"
                        @change="ship.toggleSeriousLoss(sl.key)" />
                    <span :class="{ 'age-ship-loss-active': ship.seriousLosses[sl.key] }">{{ sl.label }}</span>
                </label>
            </div>
            <button class="age-btn age-btn--dim" style="width:100%; margin-top:8px;"
                @click="ship.resetAllLosses()"
                v-tippy="{ content: 'Clear all loss conditions' }">
                Clear All Losses
            </button>
        </div>


    </div>
        </div>
    </div>

    

    <Teleport to="body">
        <ShipModelVue v-if="showModal" :show="showModal" :maxWidth="'500px'" :type="modalText.type" @close="closeModal">
            <template #header>
                <h3 class="age-details-header">{{ modalText.header }}</h3>
            </template>
        </ShipModelVue>
    </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';

import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import ShipModelVue from '@/components/ship/ShipModelVue.vue';
import ShipTabsView from '@/components/tabs/ShipTabsView.vue';
import { useShipStore } from '@/sheet/stores/character/shipStore';
import ShipStuntsView from '@/components/ship/ShipStuntsView.vue';
import { highGAllowed } from '@/sheet/stores/modifiersCheck/ships';

const settings = useSettingsStore();
const meta = useMetaStore();
const ship = useShipStore();
const showModal = ref(false);
const modalText = ref({ type: 'shipDetails', header: 'Ship Info' });

const computedShipSize = computed(() => ship.computedShipSize);

// Enemy sensors value drives Evasion and Point Defense target numbers
const enemySensorsInput = ref(0);
// High-G bonus added to Evasion roll (also applies to enemy evasion vs this ship that round)
const highGBonusInput = ref(0);

const closeModal = () => { showModal.value = false; };

const onElectronicWarfare = () => ship.rollElectronicWarfare();

const onEvasion = () => ship.rollEvasion(enemySensorsInput.value, highGBonusInput.value);

const onPointDefense = () => ship.rollPointDefense(enemySensorsInput.value);

const onDamageControl = () => ship.rollDamageControl();

const shipLossTypes = [
    { key: 'collateral',    label: 'Collateral'     },
    { key: 'hull',          label: 'Hull'            },
    { key: 'maneuverability', label: 'Maneuverability' },
    { key: 'sensors',       label: 'Sensors'         },
    { key: 'weaponsSystem', label: 'Weapons System'  },
];

const seriousLossTypes = [
    { key: 'reactorOffline',    label: 'Reactor Offline'      },
    { key: 'railgunsOffline',   label: 'Railguns Offline'     },
    { key: 'torpedoesOffline',  label: 'Torpedoes Offline'    },
    { key: 'pdcsOffline',       label: 'PDCs Offline'         },
];
</script>

<style scoped>
    .ship-view {
        margin-bottom: 15px;
        & .ship-view-cntr {
            display: grid;
            grid-template-columns: 200px auto;
            gap: 20px;
            position: relative;
            background-color: rgba(255, 255, 255, 0.75);
            padding: 10px;
            border-radius: 12px;
        }
        & .ship-view-avatar {
            width: 200px;
            height: 135px;
            object-fit: cover;
            border-radius: 10px;
            position: relative;
        }
        & .ship-view-avatar-mobile { display: none; }
        & .ship-config-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 3;
        }
    }

    .age-ship-chip {
        clip-path: polygon(0% calc(0% + 10px), calc(0% + 10px) 0%, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
        display: flex;
        min-width: 100px;
        & .age-ship-chip-label {
            font-size: 1.25rem;
            padding: 4px 10px 2px;
            background-color: var(--theme-primary);
            color: #fff;
            height: 100%;
            align-items: center;
            display: flex;
            font-family: 'Spectrashell', serif;
            font-weight: 400;
            letter-spacing: 1px;
        }
        & .age-ship-chip-value {
            font-size: 1.25rem;
            padding: 7px 16px 3px 10px;
            background-color: var(--theme-secondary);
            height: 100%;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            line-height: 100%;
            width: 100%;
            & span:not(:last-child)::after {
                margin-right: 4px;
                content: ",";
            }
        }
        & .age-ship-chip-base {
            font-size: 0.8rem;
            font-weight: 400;
            opacity: 0.65;
        }
    }

    .age-chip-offline {
        font-size: 0.7rem;
        background: #c0392b;
        color: #fff;
        padding: 1px 5px;
        border-radius: 3px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .age-ship-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 10px;
        & button { flex: 1; }
    }

    .age-btn-badge {
        font-size: 0.7em;
        background: rgba(0,0,0,0.15);
        padding: 1px 5px;
        border-radius: 3px;
        margin-left: 5px;
    }

    .age-btn--dim {
        opacity: 0.6;
        font-size: 0.85rem;
    }
    .age-btn--dim:hover { opacity: 0.9; }

    .age-ship-combat-context {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 4px;
    }
    .age-ship-context-row {
        display: flex;
        align-items: center;
        gap: 10px;
        & .age-input-label { flex: 1; font-size: 0.9rem; margin: 0; }
        & .age-num-input { width: 64px; text-align: center; }
    }
    .age-ship-warning {
        font-size: 0.8rem;
        color: #c0392b;
        font-style: italic;
    }

    .age-ship-losses {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .age-ship-loss-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .age-ship-loss-label {
        flex: 1;
        font-size: 0.9rem;
    }
    .age-ship-loss-value {
        min-width: 22px;
        text-align: center;
        font-weight: 600;
        font-size: 1rem;
    }
    .age-ship-loss-active {
        color: #c0392b;
    }

    .age-ship-serious-losses {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 12px 0;
    }
    .age-checkbox-toggle-row {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        user-select: none;
    }

    @media (max-width: 600px) {
        .ship-view {
            margin-bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            & .ship-view-cntr {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                padding-top: 28px;
                z-index: 1;
                position: relative;
                margin: 5px;
            }
            & .ship-view-avatar { display: none; }
            & .ship-view-avatar-mobile {
                display: block;
                width: calc(100% - 50px);
                height: auto;
                place-items: center;
                margin-bottom: -25px;
                z-index: 2;
                position: relative;
                text-align: center;
                & img {
                    max-width: 80dvw;
                    width: 100%;
                    border-radius: 10px;
                }
            }
            & .ship-config-btn {
                position: absolute;
                top: 2px;
                right: 2px;
                opacity: .75;
            }
            & .ship-config-btn:hover, & .ship-config-btn:focus { opacity: 1; }
            & .age-ship-chip-label { font-size: 1.35rem; }
            & .age-ship-chip-value {
                padding-top: 2px;
                font-size: 1.25rem;
                align-items: center;
            }
        }
        .age-ship-details {
            place-content: center;
            margin: 0 5px;
        }
        .age-ship-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            & button { flex: 1; }
        }
    }
</style>
