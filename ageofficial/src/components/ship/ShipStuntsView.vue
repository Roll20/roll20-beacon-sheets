<template>
    <!-- SP point trackers -->
    <div @mouseenter="spHover = true" @mouseleave="spHover = false"
        style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:5px;">
        <div v-for="role of ROLES" :key="role.key" style="text-align:center;">
            <div class="age-ship-container-content">
                <div style="display:flex;flex-direction:row;align-items:center;position:relative;">
                    <div style="flex:1;width:15px;">
                        <button class="age-icon-btn age-reset-btn"
                            v-if="ship.shipStunts[role.key] > 0 && spHover"
                            @click="ship.resetShipStunts(role.key)"
                            v-tippy="{ content: 'Reset ' + role.name + ' stunt points to 0' }">
                            <font-awesome-icon :icon="['fa', 'rotate']" />
                        </button>
                    </div>
                    <input class="age-input age-num-input" type="number" v-model="ship.shipStunts[role.key]"
                        min="0" autocomplete="off" />
                    <div class="age-container-content-corner-top-right"></div>
                    <div class="age-container-content-corner-bottom-left"></div>
                </div>
            </div>
            <h4 class="age-subsection-header">{{ role.name }}</h4>
        </div>
    </div>

    <!-- Stunt definitions per role -->
    <!-- <div v-for="role of ROLES" :key="'stunts-' + role.key" class="age-stunt-role-section">
        <div class="age-stunt-role-header">
            <h5 class="age-subsection-header" style="margin:0;">{{ role.name }} Stunts</h5>
            <button type="button" class="age-icon-btn"
                @click="openNew(role.key)"
                v-tippy="{ content: 'Add ' + role.name + ' stunt' }">
                <font-awesome-icon :icon="['fa', 'plus']" />
            </button>
        </div>

        <div v-if="stuntsForRole(role.key).length === 0" class="age-empty-list">
            No stunts added.
        </div>

        <table v-else class="age-stunt-table">
            <thead>
                <tr>
                    <th class="age-stunt-col-sp">SP</th>
                    <th>Name</th>
                    <th class="age-stunt-col-actions"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="stunt in stuntsForRole(role.key)" :key="stunt._id">
                    <td class="age-stunt-col-sp">{{ stunt.sp }}</td>
                    <td>
                        <div class="age-stunt-name">{{ stunt.name }}</div>
                        <div class="age-stunt-desc" v-html="stunt.description"></div>
                    </td>
                    <td class="age-stunt-col-actions">
                        <button type="button" class="age-icon-btn"
                            @click="sendStuntToChat(stunt)"
                            v-tippy="{ content: 'Send to chat' }">
                            <font-awesome-icon :icon="['fa', 'comment']" />
                        </button>
                        <button type="button" class="age-icon-btn"
                            @click="openEdit(stunt)"
                            v-tippy="{ content: 'Edit' }">
                            <font-awesome-icon :icon="['fa', 'gear']" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div> -->

    <!-- Add / Edit modal -->
    <Teleport to="body">
        <ship-model-vue v-if="showModal" :show="showModal" :maxWidth="'fit-content'" @close="closeModal">
            <template #header>
                <h3 class="age-details-header">{{ modalMode === 'new' ? 'Add Stunt' : 'Edit Stunt' }}</h3>
            </template>
            <template #body>
                <div class="row" style="margin:0;">
                    <div class="mb-3 col-12 col-sm-4" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">Role</span>
                        <select v-model="stuntObj.role" class="age-atk-select form-select">
                            <option v-for="r of ROLES" :key="r.key" :value="r.key">{{ r.name }}</option>
                        </select>
                    </div>
                    <div class="mb-3 col-12 col-sm-4" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">SP Cost</span>
                        <input type="number" class="form-control" v-model.number="stuntObj.sp" min="1" />
                    </div>
                    <div class="mb-3 col-12 col-sm-4" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">Name</span>
                        <input type="text" class="form-control" v-model="stuntObj.name" />
                    </div>
                </div>
                <div class="row">
                    <div class="mb-5 col">
                        <span class="age-input-label">Description</span>
                        <QuillEditor ref="quillEditor" contentType="html" toolbar=""
                            v-model:content="stuntObj.description" />
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="modal-footer-actions">
                    <button class="confirm-btn" @click="saveStunt">
                        <span v-if="modalMode === 'new'">Create</span>
                        <span v-else>Update</span>
                    </button>
                    <div class="delete-container" v-if="modalMode === 'edit'">
                        <button class="delete-icon-btn delete" @click="deleteStunt"
                            v-tippy="{ content: 'Delete stunt' }">
                            <font-awesome-icon :icon="['fa', 'trash-alt']" />
                        </button>
                    </div>
                </div>
            </template>
        </ship-model-vue>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useShipStore } from '@/sheet/stores/character/shipStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import ShipModelVue from './ShipModelVue.vue';
import { QuillEditor } from '@vueup/vue-quill';
import sendToChat from '@/utility/sendToChat';

const ship = useShipStore();
const meta = useMetaStore();
const spHover = ref(false);
const showModal = ref(false);
const modalMode = ref('new');

const ROLES = [
    { key: 'commander', name: 'Commander' },
    { key: 'pilot',     name: 'Pilot'     },
    { key: 'engineer',  name: 'Engineer'  },
    { key: 'gunner',    name: 'Gunner'    },
    { key: 'sensors',   name: 'Sensors'   },
];

const emptyStunt = (role = 'commander') => ({ _id: '', role, sp: 1, name: '', description: '' });
const stuntObj = ref(emptyStunt());

const stuntsForRole = (roleKey) =>
    ship.stuntDefs
        .filter((s) => s.role === roleKey)
        .sort((a, b) => a.sp - b.sp);

const openNew = (roleKey) => {
    stuntObj.value = emptyStunt(roleKey);
    modalMode.value = 'new';
    showModal.value = true;
};

const openEdit = (stunt) => {
    stuntObj.value = { ...stunt };
    modalMode.value = 'edit';
    showModal.value = true;
};

const closeModal = () => {
    stuntObj.value = emptyStunt();
    showModal.value = false;
};

const saveStunt = () => {
    if (modalMode.value === 'new') {
        ship.addStuntDef({ ...stuntObj.value, _id: uuidv4() });
    } else {
        ship.updateStuntDef({ ...stuntObj.value });
    }
    closeModal();
};

const deleteStunt = () => {
    ship.deleteStuntDef(stuntObj.value._id);
    closeModal();
};

const sendStuntToChat = async (stunt) => {
    const roleName = ROLES.find((r) => r.key === stunt.role)?.name ?? stunt.role;
    await sendToChat({
        characterName: meta.name,
        title: stunt.name,
        subtitle: `${roleName} Stunt — ${stunt.sp} SP`,
        description: stunt.description,
        traits: [roleName, `${stunt.sp} SP`],
    });
};
</script>

<style scoped>
.age-ship-container-content {
    background: #FFF;
    width: fit-content;
    place-self: center;
    display: flex;
    flex-direction: row;
}
.sheet-darkmode .age-ship-container-content {
    background: #282828;
}
.age-reset-btn {
    top: 4px;
}
.age-stunt-role-section {
    margin-top: 16px;
}
.age-stunt-role-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
}
.age-stunt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}
.age-stunt-table th,
.age-stunt-table td {
    padding: 4px 6px;
    vertical-align: top;
    border-bottom: 1px solid rgba(0,0,0,0.1);
}
.age-stunt-col-sp {
    width: 36px;
    text-align: center;
    font-weight: 700;
}
.age-stunt-col-actions {
    width: 64px;
    text-align: right;
    white-space: nowrap;
}
.age-stunt-name {
    font-weight: 600;
}
.age-stunt-desc {
    opacity: 0.75;
    margin-top: 2px;
}
.age-empty-list {
    font-size: 0.85rem;
    opacity: 0.6;
    padding: 2px 0;
}
</style>
