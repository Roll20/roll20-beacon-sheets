<template>
    <div class="accordion age-accordion">
        <div v-if="shipStore.qualityFlaws.length === 0" class="age-no-content-text">
            <h3>No qualities or flaws added.</h3>
            <button class="link-btn age-icon-btn" @click="openNew"
                style="background: none; font-weight: bold; border: none; font-size: 3rem;"
                v-tippy="{ content: 'Add Quality/Flaw' }">
                <font-awesome-icon :icon="['fa', 'circle-plus']" />
            </button>
        </div>

        <template v-else>
        <div class="age-section-header">
            <h5 class="mt-3">Qualities &amp; Flaws</h5>
            <button type="button" class="age-icon-btn" @click="openNew" v-tippy="{ content: 'Add Quality/Flaw' }">
                <font-awesome-icon :icon="['fa', 'plus']" />
            </button>
        </div>

        <div class="accordion-item"
            v-for="(qf, index) in shipStore.qualityFlaws"
            :key="qf._id"
        >
            <div class="accordion-header attack attack__row age-ship-qf-header">
                <div>
                    <span>{{ qf.name }}</span>
                    <span class="age-qf-badge" :class="qf.type">{{ qf.type ? qf.type.charAt(0).toUpperCase() + qf.type.slice(1) : '—' }}</span>
                </div>
                <div style="display:grid;align-items:center;grid-template-columns:1fr;height:100%;">
                    <button type="button" class="config-btn age-icon-btn" @click="sendQFToChat(qf)"
                        v-tippy="{ content: 'Share ' + qf.name + ' in chat' }">
                        <font-awesome-icon :icon="['fa', 'comment']" />
                    </button>
                </div>
                <div style="display:grid;align-items:center;grid-template-columns:1fr;height:100%;">
                    <button type="button" class="config-btn age-icon-btn" @click="openEdit(qf)"
                        v-tippy="{ content: 'Edit ' + qf.name }">
                        <font-awesome-icon :icon="['fa', 'gear']" />
                    </button>
                </div>
                <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" :data-bs-target="'#collapseQF-' + index"
                    aria-expanded="false" :aria-controls="'collapseQF-' + index">
                </button>
            </div>
            <div :id="'collapseQF-' + index"
                class="accordion-collapse age-accordion-collapse collapsed collapse"
                data-bs-parent="#age-qf-accordion">
                <div class="accordion-body">
                    <div class="age-quality-accordion">
                        <span v-html="DOMPurify.sanitize(qf.description || '—')"></span>
                    </div>
                </div>
            </div>
        </div>
        </template>
    </div>

    <Teleport to="body">
        <ship-model-vue v-if="showModal" :show="showModal" :maxWidth="'fit-content'" @close="closeModal">
            <template #header>
                <h3 class="age-details-header">{{ modalMode === 'new' ? 'Add Quality/Flaw' : 'Edit Quality/Flaw' }}</h3>
            </template>
            <template #body>
                <div class="row" style="margin:0">
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">Name</span>
                        <input type="text" class="form-control" v-model="qfObj.name" aria-label="Quality/Flaw Name" />
                    </div>
                    <div class="mb-3 col-12 col-sm-6" style="flex-direction:column;padding:0 2px;">
                        <span class="age-input-label">Type</span>
                        <select v-model="qfObj.type" class="age-atk-select form-select">
                            <option value="">— Select —</option>
                            <option value="quality">Quality</option>
                            <option value="flaw">Flaw</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="mb-5 col">
                        <span class="age-input-label">Description</span>
                        <QuillEditor ref="quillEditor" contentType="html" toolbar="" v-model:content="qfObj.description" />
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="modal-footer-actions">
                    <button class="confirm-btn" @click="saveQF">
                        <span v-if="modalMode === 'new'">Create</span>
                        <span v-else>Update</span>
                    </button>
                    <div class="delete-container" v-if="modalMode === 'edit'">
                        <button class="delete-icon-btn delete" title="Delete" @click="deleteQF"
                            v-tippy="{ content: 'Delete Quality/Flaw' }">
                            <font-awesome-icon :icon="['fa', 'trash-alt']" />
                        </button>
                    </div>
                </div>
            </template>
        </ship-model-vue>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';
import ShipModelVue from './ShipModelVue.vue';
import { useShipStore } from '@/sheet/stores/character/shipStore';
import { QuillEditor } from '@vueup/vue-quill';
import sendToChat from '@/utility/sendToChat';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';

const shipStore = useShipStore();
const showModal = ref(false);
const modalMode = ref('new');

const emptyQF = () => ({ _id: '', name: '', description: '', type: '' });
const qfObj = ref(emptyQF());

const openNew = () => {
    qfObj.value = emptyQF();
    modalMode.value = 'new';
    showModal.value = true;
};

const openEdit = (qf) => {
    qfObj.value = { ...qf };
    modalMode.value = 'edit';
    showModal.value = true;
};

const closeModal = () => {
    qfObj.value = emptyQF();
    showModal.value = false;
};

const saveQF = () => {
    if (modalMode.value === 'new') {
        shipStore.addQF({ ...qfObj.value, _id: uuidv4() });
    } else {
        shipStore.updateQF({ ...qfObj.value });
    }
    closeModal();
};

const deleteQF = () => {
    shipStore.deleteQF(qfObj.value._id);
    closeModal();
};

async function sendQFToChat(qf) {
    await sendToChat({
        characterName: useMetaStore().name,
        title: qf.name,
        subtitle: qf.type ? qf.type.charAt(0).toUpperCase() + qf.type.slice(1) : 'Quality/Flaw',
        description: qf.description || '',
    });
}
</script>

<style scoped>
.age-ship-qf-header {
    display: grid;
    grid-template-columns: 3fr 25px 25px 40px;
    align-items: center;
    min-width: 100%;
    gap: 5px;
    padding-left: 5px;
}
.age-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.age-no-content-text {
    display: grid;
    align-items: center;
    justify-content: center;
    padding-top: 10px;
}
.age-qf-badge {
    font-size: 0.85rem;
    padding: 1px 5px;
    border-radius: 3px;
    margin-left: 6px;
    font-weight: 600;
    vertical-align: middle;
}
.age-qf-badge.quality {
    background: #2980b9;
    color: #fff;
}
.age-qf-badge.flaw {
    background: #c0392b;
    color: #fff;
}

</style>
