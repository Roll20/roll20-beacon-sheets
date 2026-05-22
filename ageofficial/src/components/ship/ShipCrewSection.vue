<template>
    <h5 class="mt-3">Role Tests</h5>
        <div  class="age-crew-role-test">

            <div v-for="role in shipCrewRoles" :key="role.value">
                <button class="age-ship-crew-roll-btn" @click="onStuntRoll(role)">
                        {{ role.label }}<font-awesome-icon :icon="['fa', 'dice']" style="margin-left:3px;" />
                    </button>
                <!-- <button>
                    <span>{{ role.label }}</span>
                </button> -->
            </div>
        </div>
    <div v-if="ship.crew.length === 0" class="age-no-crew-text">
        <h3>
            You have no crew!!
        </h3>
        <button class="link-btn age-icon-btn" @click="openModal('new','crew')" style="background: none; font-weight: bold;border:none; font-size: 3rem;" v-tippy="{ content: 'Add Crew' }">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
        </button>
    </div>
    <div v-else>
        <h5 class="mt-3" style="position: relative;">
            Members
            <button class="link-btn age-icon-btn" @click="openModal('options',null)" style="background: none; font-weight: bold;border:none; font-size: 1.5rem;position: absolute;
    right: 10px; top: -2px;" v-tippy="{ content: 'Add Crew' }">
                <font-awesome-icon :icon="['fa', 'circle-plus']" />
            </button>
        </h5>
        <div class="accordion">
            <div v-for="(member, index) in ship.crew" :key="index" class="age-crew-member-entry" @click="openCrewEdit(member)">
                <span class="age-crew-member-entry__name">{{ member.name }}</span>
                <div class="age-crew-member-entry__roles">
                    <span v-for="primary of member.ability" :key="primary" class="age-crew-member-entry__role">
                        {{ primary.focusValue }}
                    </span>
                </div>
                <div>
                    <button type="button" class="ship-config-btn age-icon-btn" @click.stop="openCrewEdit(member)" v-tippy="{ content: 'Edit Crew Member' }">
                        <font-awesome-icon :icon="['fa', 'gear']" />
                    </button>
                </div>
            </div>
        </div>
        <h5 class="mt-3" style="position: relative">
            Stunts
            <button class="link-btn age-icon-btn" @click="openStuntNew()" style="background: none; font-weight: bold;border:none; font-size: 1.5rem;position: absolute;
    right: 10px; top: -2px;" v-tippy="{ content: 'Add Crew Stunt' }">
                <font-awesome-icon :icon="['fa', 'circle-plus']" />
            </button>
        </h5>
        <div v-if="ship.stuntDefs.length === 0" class="age-empty-stunt-list">
            No stunts added.
        </div>
        <div v-else class="accordion age-accordion">
            <div v-for="(stunt, index) in ship.stuntDefs" :key="stunt._id" class="accordion-item">
                <div class="accordion-header attack attack__row age-ship-stunt-header">
                    <div>
                        <span>{{ stunt.name }}</span>
                        <span class="age-stunt-role-badge">{{ roleLabel(stunt.role) }}</span>
                    </div>
                    <div style="display:grid;align-items:center;height:100%;"
                        v-tippy="{ content: ship.shipStunts[stunt.role] < stunt.sp ? 'Not enough stunt points (' + ship.shipStunts[stunt.role] + ' available)' : ship.shipStunts[stunt.role] + ' SP available' }">
                        <button class="age-btn"
                            :disabled="ship.shipStunts[stunt.role] < stunt.sp"
                            :class="{ 'age-btn-disabled': ship.shipStunts[stunt.role] < stunt.sp }"
                            @click="ship.shipStunts[stunt.role] -= stunt.sp">
                            {{ stunt.sp }} SP <font-awesome-icon :icon="['fa', 'dice']" style="margin-left:3px;" />
                        </button>
                    </div>
                    <div style="display:grid;align-items:center;height:100%;">
                        <button type="button" class="config-btn age-icon-btn" @click="sendStuntToChat(stunt)"
                            v-tippy="{ content: 'Share ' + stunt.name + ' in chat' }">
                            <font-awesome-icon :icon="['fa', 'comment']" />
                        </button>
                    </div>
                    <div style="display:grid;align-items:center;height:100%;">
                        <button type="button" class="config-btn age-icon-btn" @click="openStuntEdit(stunt)"
                            v-tippy="{ content: 'Edit ' + stunt.name }">
                            <font-awesome-icon :icon="['fa', 'gear']" />
                        </button>
                    </div>
                    <button class="accordion-button collapsed" type="button"
                        data-bs-toggle="collapse" :data-bs-target="'#collapseStunt-' + index"
                        aria-expanded="false" :aria-controls="'collapseStunt-' + index">
                    </button>
                </div>
                <div :id="'collapseStunt-' + index"
                    class="accordion-collapse age-accordion-collapse collapsed collapse">
                    <div class="accordion-body">
                        <div class="age-quality-accordion">
                            <span v-html="DOMPurify.sanitize(stunt.description || '—')"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <ship-model-vue v-if="showModal" :show="showModal" :maxWidth="modalMode === 'options' ? 'fit-content' :'90dvw'" :type="modalText.type" @close="closeModal" @registerCrewMember="registerCrewMember">
            <template #header>
                <h3 class="age-details-header">{{ modalText.header }}</h3>
            </template>
            <template #body>
                <div class="age-ship-crew-options" v-if="modalMode === 'options'">
                    <button v-for="cO in shipCrewOptions" :key="cO.value" class="age-quality-select-btn" @click="selectedModalOption = cO.value; modalMode = 'new';">
                        <div :class="'age-quality-section age-ship-crew-'+cO.value"></div>
                        <div>
                            {{ cO.label }}
                        </div>
                </button>
                </div>
                <div v-if="selectedModalOption === 'stunt'" class="row" style="margin:0">
                    <div class="mb-3 col-12 col-sm-4" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">Role</span>
                        <select v-model="stuntEntry.role" class="age-atk-select form-select">
                            <option v-for="r in shipCrewRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
                        </select>
                    </div>
                    <div class="mb-3 col-12 col-sm-4" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">SP Cost</span>
                        <input type="number" class="form-control" v-model.number="stuntEntry.sp" min="1" />
                    </div>
                    <div class="mb-3 col-12 col-sm-4" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">Name</span>
                        <input type="text" class="form-control" v-model="stuntEntry.name" />
                    </div>
                    <div class="mb-5 col-12" style="padding:0 2px;">
                        <span class="age-input-label">Description</span>
                        <QuillEditor contentType="html" toolbar="" v-model:content="stuntEntry.description" />
                    </div>
                </div>
                <div v-if="selectedModalOption === 'crew' " class="row" style="margin:0">
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column;padding: 0 2px;">
                        <span id="basic-addon1" class="age-input-label">Name</span>
                        <div>
                            <input type="text" class="form-control" aria-label="Crew Member Name" v-model="crewMember.name"  aria-describedby="basic-addon1">
                        </div>
                    </div>
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction: column;padding: 0 2px;">
                        <span id="basic-addon1" class="age-input-label">Role Abilities</span>
                        <div>
                            <VueMultiselect
                                v-model="crewMemberRoles"
                                :options="shipCrewRoles"
                                 :multiple="true"
                                 :close-on-select="false"
                                 :showLabels="false"
                                 :searchable="false"
                                 :optionHeight="10"
                                 :custom-label="customLabel"
                                 :limit="2"
                                :limit-text="limitText"
                                 @update:modelValue="updateSelected"
                                 style="width: 100%; max-width: 300px;">
                                 <!-- <template #option="props">
                                    <div class="option__desc" style="height:10px; min-height: 0; padding: 0;">
                                        <span class="option__title" style="font-size: 12px; padding:0">
                                        {{ props.option.label }}</span></div>
                                </template> -->
                                </VueMultiselect>
                            <!-- <select  id="bio.profession" v-model="crewMember.role" class="age-atk-select form-select">
                                <option v-for="role of shipCrewRoles" :value="role.value" :key="role.value">{{ role.label }}</option>
                            </select> -->
                        </div>          
                    </div>
                        <div v-for="(ability, ind) of crewMember.ability" :key="ind" class="row">
                            <div class="mb-3 col-12 col-sm-3" style="flex-direction: column;padding: 0 2px;">
                                <span id="basic-addon1" class="age-input-label">{{ ability.ability }}</span>
                                <div>
                                    <input type="number" class="form-control" aria-label="Crew Member Ability Value" v-model="crewMember.ability[ind].value"  aria-describedby="basic-addon1">
                                </div>
                            </div>
                            <div class="mb-3 col-5 col-sm-3" style="flex-direction: column;padding: 0 2px;">
                        <span id="basic-addon1" class="age-input-label" style="margin-left: 10px; white-space: nowrap;">
                            {{ ability.ability }}
                            ({{ ability.focusValue }})
                        </span>
                            <div class="input-group">
                                <label class="age-checkbox-toggle" style="margin:5px 1rem;">
                                    <input type="checkbox"  v-model="crewMember.ability[ind].focus" />
                                    <span class="slider round" ></span>
                                </label>
                                <span class="age-toggle-label" style="white-space: nowrap;">Focus</span>
                            </div>   
                            </div> 
                            <div class="mb-3 col-7 col-sm-3" style="flex-direction: column;padding: 0 2px;">
                            <span id="basic-addon1" class="age-input-label">&nbsp;</span>
                            <div class="input-group">
                                <label class="age-checkbox-toggle" style="margin:5px 1rem;">
                                    <input type="checkbox"  v-model="crewMember.ability[ind].doubleFocus" />
                                    <span class="slider round" ></span>
                                </label>
                                <span class="age-toggle-label" style="white-space: nowrap;">Double Focus</span>
                            </div>   
                            </div>
                            <div class="mb-3 col-7 col-sm-3" style="flex-direction: column;padding: 0 2px;">
                            <span id="basic-addon1" class="age-input-label">Primary Role</span>
                            <div class="input-group">
                                <label class="age-checkbox-toggle" style="margin:5px 1rem;">
                                    <input type="checkbox"  v-model="crewMember.ability[ind].primary" />
                                    <span class="slider round" ></span>
                                </label>
                                <span class="age-toggle-label" style="white-space: nowrap;">Primary Role</span>
                            </div>   
                            </div>
                        </div>
                </div>
            </template>
            <template #footer>
                <div v-if="modalMode !== 'options'" class="modal-footer-actions">
                    <button class="confirm-btn" @click="registerCrew">
                        <span v-if="modalMode === 'new'">Create</span>  
                        <span v-else>Update</span>  
                    </button>
                    <div class="delete-container" v-if="modalMode === 'edit'">
                        <button class="delete-icon-btn delete" title="Delete" @click="deleteCrewEntry" v-tippy="{ 'content': 'Delete Crew'}">
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
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';
import ShipModelVue from './ShipModelVue.vue';
import VueMultiselect from 'vue-multiselect';
import { QuillEditor } from '@vueup/vue-quill';
import sendToChat from '@/utility/sendToChat';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';

const ship = useShipStore();
const showModal = ref(false);
const modalMode = ref('new');
const selectedModalOption = ref(null);
const modalText = computed(() => {
    if (selectedModalOption.value === 'stunt') {
        return { type: 'crew', header: modalMode.value === 'new' ? 'Add Stunt' : 'Edit Stunt' };
    }
    if (modalMode.value === 'options') return { type: 'crew', header: 'Add' };
    if (modalMode.value === 'new') return { type: 'crew', header: 'Add Crew Member' };
    return { type: 'crew', header: 'Edit Crew Member' };
});
const crewMember = ref({
    name: null,
    role: [],
    ability: []
});

const emptyStunt = () => ({ _id: '', role: 'commander', sp: 1, name: '', description: '' });
const stuntEntry = ref(emptyStunt());

const shipCrewRoles = [
    { _id: 1,label: 'Commander', value: 'commander', ability: 'Communication', focus: 'Leadership' },
    { _id: 2,label: 'Pilot', value: 'pilot', ability: 'Dexterity', focus: 'Piloting' },
    { _id: 3,label: 'Engineer', value: 'engineer', ability: 'Intelligence', focus: 'Engineering' },
    { _id: 4,label: 'Sensors', value: 'sensors', ability: 'Intelligence', focus: 'Technology' },
    { _id: 5,label: 'Gunner', value: 'gunner', ability: 'Accuracy', focus: 'Gunnery' }
];

const crewMemberRoles = ref([]);

const shipCrewOptions = [
    { label: 'Crew Stunt', value: 'stunt' },
    { label: 'Crew Member', value: 'crew' },
];

const customLabel = (option) => {
    return `${option.label}`
}
const limitText = () => {
    return `and ${crewMemberRoles.value.length - 2} more`
}
const openModal = (mode, option) => {
    modalMode.value = mode;
    selectedModalOption.value = option;
    showModal.value = true;
};

const openCrewEdit = (member) => {
    crewMember.value = { ...member, ability: (member.ability || []).map(a => structuredClone(a)) };
    selectedModalOption.value = 'crew';
    modalMode.value = 'edit';
    crewMemberRoles.value = (member.ability || [])
        .map(a => shipCrewRoles.find(r => String(r._id) === String(a._id)))
        .filter(Boolean);
    showModal.value = true;
};

const roleLabel = (roleKey) =>
    shipCrewRoles.find((r) => r.value === roleKey)?.label ?? roleKey;

const openStuntNew = () => {
    stuntEntry.value = emptyStunt();
    selectedModalOption.value = 'stunt';
    modalMode.value = 'new';
    showModal.value = true;
};

const openStuntEdit = (stunt) => {
    stuntEntry.value = { ...stunt };
    selectedModalOption.value = 'stunt';
    modalMode.value = 'edit';
    showModal.value = true;
};

const closeModal = () => {
    crewMember.value = { name: null, role: null, ability: [] };
    stuntEntry.value = emptyStunt();
    showModal.value = false;
    crewMemberRoles.value = [];
}

const updateSelected = (value) => {
    crewMember.value.ability = value.map(v => {
        const existing = crewMember.value.ability.find(a => String(a._id) === String(v._id));
        return existing ?? {
            _id: String(v._id),
            ability: v.ability,
            value: 0,
            focusValue: v.focus,
            focus: false,
            doubleFocus: false,
            primary: false,
        };
    });
};

const registerCrew = () => {
    if (selectedModalOption.value === 'stunt') {
        if (modalMode.value === 'edit') {
            ship.updateStuntDef({ ...stuntEntry.value });
        } else {
            ship.addStuntDef({ ...stuntEntry.value, _id: uuidv4() });
        }
    } else {
        modalMode.value === 'edit' ? ship.updateCrewMember(crewMember.value) : ship.addCrewMember(crewMember.value);
    }
    closeModal();
};

const deleteCrewEntry = () => {
    if (selectedModalOption.value === 'stunt') {
        ship.deleteStuntDef(stuntEntry.value._id);
    } else {
        ship.deleteCrewMember(crewMember.value._id);
    }
    closeModal();
};

const onStuntRoll = (role) => {
    ship.rollCrewTest(role.value);
}

async function sendStuntToChat(stunt) {
    await sendToChat({
        characterName: useMetaStore().name,
        title: stunt.name,
        subtitle: roleLabel(stunt.role) + ' Stunt',
        keyValues: {
            'SP Cost': stunt.sp ?? 1,
        },
        description: stunt.description || '',
    });
}
</script>
<style scoped lang="scss">
    .age-no-crew-text {
        display: grid;
        align-items: center;
        justify-content: center;
        padding-top: 10px;
    }
    .age-ship-crew-options {
        display: flex;
        gap: 15px;
    }
    .age-quality-select-btn {
        flex: 1;
    }
    .age-ship-stunt-header {
        display: grid;
        grid-template-columns: 3fr auto 40px 40px 55px;
        align-items: center;
        min-width: 100%;
        gap: 5px;
        padding-left: 5px;
    }
    .age-crew-member-entry {
        color: var(--bs-accordion-color);
        background-color: var(--bs-accordion-bg);
        border: 1px solid var(--bs-accordion-border-color);
        display: grid;
        grid-template-columns: 2fr 1fr 40px;
        gap: 10px;
        align-items: center;
        padding: 0 5px;
        &__name {
            font-weight: 500;
            font-size: 1.1rem;
            line-height: 1;
        }
        &__roles {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        &__role {
            text-transform: capitalize;
            font-size: 0.8rem;
            line-height: 1;
        }
    }
    .age-crew-member-entry:first-of-type {
        border-top-left-radius: var(--bs-accordion-border-radius);
        border-top-right-radius: var(--bs-accordion-border-radius);
    }
    .age-crew-member-entry:last-of-type {
        border-bottom-right-radius: var(--bs-accordion-border-radius);
        border-bottom-left-radius: var(--bs-accordion-border-radius);
    }
    .age-crew-role-test {
        display: flex;
        gap:5px 20px;
        flex-wrap: wrap;
    }
    .age-ship-crew-roll-btn {
        display: flex;
        background:var(--theme-primary);
        color:#FFF;
        border: none;
        height: -webkit-fill-available;
        font-size: 12px;
    }
    .age-empty-stunt-list {
        font-size: 0.85rem;
        opacity: 0.6;
        padding: 2px 0;
    }
    .age-stunt-role-badge {
        font-size: 0.85rem;
        padding: 1px 5px;
        border-radius: 3px;
        margin-left: 6px;
        font-weight: 600;
        vertical-align: middle;
        background: var(--theme-primary);
        color: #fff;
        opacity: 0.8;
    }

    /* ensure deep selector only once */
    :deep(.multiselect__strong) {
        font-weight: 400 !important;
        float: right;
        margin-right: -20px;
    }
</style>