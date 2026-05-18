<template>
    <div v-if="ship.weapons.length === 0" class="age-no-content-text">
        <h3>You have no weapons!! Load up!</h3>
        <button class="link-btn age-icon-btn" @click="openModal('new')"
            style="background: none; font-weight: bold; border:none; font-size: 3rem;"
            v-tippy="{ content: 'Add Weapon' }">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
        </button>
    </div>

    <div v-else style="padding: 15px 0 0; position: relative;">
        <button class="link-btn age-icon-btn" @click="openModal('new')"
            style="background: none; font-weight: bold; border:none; font-size: 1.5rem; position: absolute; right: 10px; top: -5px;"
            v-tippy="{ content: 'Add Weapon' }">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
        </button>
        <div class="accordion age-accordion">
            <ShipAccordionEntryView
                v-for="(wpn, index) in shipWeaponAttacks"
                :key="wpn._id"
                :weapon="wpn"
                :id="wpn._id"
                :index="index"
                :type="'weapon'"
                :systemOffline="isWeaponSystemOffline(wpn.type)"
                @edit="openModal('edit', wpn)"
            />
        </div>
    </div>

    <Teleport to="body">
        <ship-model-vue v-if="showModal" :show="showModal" :maxWidth="'fit-content'" @close="closeModal">
            <template #header>
                <h3 class="age-details-header">{{ modalMode === 'new' ? 'Add Weapon' : 'Edit Weapon' }}</h3>
            </template>
            <template #body>
                <div class="row" style="margin:0">
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column; padding: 0 2px;">
                        <span class="age-input-label">Name</span>
                        <input type="text" class="form-control" aria-label="Weapon Name" v-model="weaponObj.name" />
                    </div>
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column; padding: 0 2px;">
                        <span class="age-input-label">Type</span>
                        <select v-model="weaponObj.type" class="age-atk-select form-select">
                            <option v-for="wt of weaponTypes" :value="wt.value" :key="wt.value">{{ wt.label }}</option>
                        </select>
                    </div>
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column; padding: 0 2px;">
                        <span class="age-input-label">Range</span>
                        <select v-model="weaponObj.range" class="age-atk-select form-select">
                            <option v-for="wr of weaponRanges" :value="wr.value" :key="wr.value">{{ wr.label }}</option>
                        </select>
                    </div>
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column; padding: 0 2px;">
                        <span class="age-input-label">Damage</span>
                        <input type="text" class="form-control" placeholder="e.g. 3d6" aria-label="Weapon Damage" v-model="weaponObj.damage" />
                    </div>
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column; padding: 0 2px;">
                        <span class="age-input-label">Attacks Per Round</span>
                        <input type="number" class="form-control" min="1" aria-label="Attacks Per Round" v-model.number="weaponObj.attacksPerRound" />
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="modal-footer-actions">
                    <button class="confirm-btn" @click="saveWeapon">
                        <span v-if="modalMode === 'new'">Create</span>
                        <span v-else>Update</span>
                    </button>
                    <div class="delete-container" v-if="modalMode === 'edit'">
                        <button class="delete-icon-btn delete" title="Delete" @click="deleteWeaponEntry"
                            v-tippy="{ content: 'Delete Weapon' }">
                            <font-awesome-icon :icon="['fa', 'trash-alt']" />
                        </button>
                    </div>
                </div>
            </template>
        </ship-model-vue>
    </Teleport>
</template>

<script setup>
import { useShipStore } from '@/sheet/stores/character/shipStore';
import ShipAccordionEntryView from './ShipAccordionEntryView.vue';
import ShipModelVue from './ShipModelVue.vue';
import { computed, ref } from 'vue';

const ship = useShipStore();
const modalMode = ref('new');
const showModal = ref(false);

const emptyWeapon = () => ({
    _id: '',
    name: '',
    type: '',
    range: '',
    damage: '',
    attacksPerRound: 1,
    offline: false,
});

const weaponObj = ref(emptyWeapon());

const weaponRanges = [
    { value: 'close',  label: 'Close'  },
    { value: 'medium', label: 'Medium' },
    { value: 'long',   label: 'Long'   },
];

const weaponTypes = [
    { value: 'grapplers', label: 'Grapplers'             },
    { value: 'pdc',       label: 'Point Defense Cannons' },
    { value: 'railguns',  label: 'Railguns'              },
    { value: 'torpedoes', label: 'Torpedoes'             },
];

function openModal(mode, weapon = null) {
    modalMode.value = mode;
    weaponObj.value = weapon ? { ...weapon } : emptyWeapon();
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    weaponObj.value = emptyWeapon();
}

function saveWeapon() {
    if (modalMode.value === 'new') {
        ship.addWeapon(weaponObj.value);
    } else {
        ship.updateWeapon(weaponObj.value);
    }
    closeModal();
}

function deleteWeaponEntry() {
    ship.deleteWeapon(weaponObj.value._id);
    closeModal();
}

// Returns true if the weapon's system-level serious loss is active
function isWeaponSystemOffline(type) {
    if (type === 'railguns')  return ship.seriousLosses.railgunsOffline;
    if (type === 'torpedoes') return ship.seriousLosses.torpedoesOffline;
    if (type === 'pdc')       return ship.seriousLosses.pdcsOffline;
    return false;
}

const shipWeaponAttacks = computed(() => {
    if (!ship.weapons) return [];
    return [...ship.weapons].sort((a, b) => a.name.localeCompare(b.name));
});
</script>

<style scoped>
    .age-no-content-text {
        display: grid;
        align-items: center;
        justify-content: center;
        padding-top: 10px;
    }
</style>
