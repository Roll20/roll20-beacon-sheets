<template>
    <div class="input-group age-biography-section">
        <!-- <span class="age-input-label">Personal Details & History</span> -->
        <h3 class="age-bio-header">Personal Details & History</h3>
        <div class="age-bio-quill">
            <QuillEditor ref="quillEditor" contentType="html" toolbar="" :options="{
                modules: {
                    keyboard: {
                        bindings: {
                            enter: {
                                key: 13, // 'Enter' key
                                handler: (range, context) => {
                                // Default behavior of Quill (inserts a single paragraph)
                                const quill = this.$refs.quillEditor.quill;
                                quill.formatLine(range.index, 1, 'block', true);
                                },
                            },
                        },
                    },
                },
                scrollingContainer: true}" v-model:content="bio.detailsHistory" />
        </div>
        <!-- <textarea class="form-control age-bio-textarea" data-testid="test-attack-description"
        placeholder="Description" v-model="bio.detailsHistory" rows="5" />
     -->
    <hr />
    
        <h3 class="age-bio-header">Relationships</h3>
        <!-- <span class="age-input-label">Relationships</span> -->
        <div class="age-bio-quill">
            <QuillEditor ref="quillEditor" contentType="text" toolbar="" :options="{
                modules: {
                    keyboard: {
                        bindings: {
                            enter: {
                                key: 13, // 'Enter' key
                                handler: (range, context) => {
                                // Default behavior of Quill (inserts a single paragraph)
                                const quill = this.$refs.quillEditor.quill;
                                quill.formatLine(range.index, 1, 'block', true);
                                },
                            },
                        },
                    },
                },
            scrollingContainer: true}" v-model:content="bio.relationships" />
        </div>
        <!-- <textarea class="form-control age-bio-textarea" data-testid="test-attack-description"
        placeholder="Description" v-model="bio.relationships" rows="5" /> -->
    
    <hr />
    
        <h3 class="age-bio-header">Goals & Ties</h3>
        <!-- <span class="age-input-label">Relationships</span> -->
         <div class="age-bio-quill">
            <QuillEditor ref="quillEditor" contentType="html" toolbar="" :options="{
                modules: {
                    keyboard: {
                        bindings: {
                            enter: {
                                key: 13, // 'Enter' key
                                handler: (range, context) => {
                                // Default behavior of Quill (inserts a single paragraph)
                                const quill = this.$refs.quillEditor.quill;
                                quill.formatLine(range.index, 1, 'block', true);
                                },
                            },
                        },
                    },
                },
                scrollingContainer: true}" v-model:content="bio.goalsTies" />
         </div>
        <!-- <textarea class="form-control age-bio-textarea" data-testid="test-attack-description"
        placeholder="Description" v-model="bio.goalsTies" rows="5" /> -->
    <hr />

    <h3 class="age-bio-header">Appearance & Other Details</h3>
    <div class="age-bio-appearance">
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Age</span>
            <input type="number" class="form-control" aria-label="Age" aria-describedby="basic-addon1" v-model="bio.age">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Height</span>
            <input type="text" class="form-control" aria-label="Height" aria-describedby="basic-addon1" v-model="bio.height">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Weight</span>
            <input type="text" class="form-control" aria-label="Weight" aria-describedby="basic-addon1" v-model="bio.weight">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Gender</span>
            <input type="text" class="form-control" aria-label="Gender" aria-describedby="basic-addon1" v-model="bio.gender">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Sex</span>
            <input type="text" class="form-control" aria-label="Sex" aria-describedby="basic-addon1" v-model="bio.sex">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Pronouns</span>
            <input type="text" class="form-control" aria-label="Pronouns" aria-describedby="basic-addon1" v-model="bio.pronouns">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Skin</span>
            <input type="text" class="form-control" aria-label="Skin Color" aria-describedby="basic-addon1" v-model="bio.skin">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Eye</span>
            <input type="text" class="form-control" aria-label="Eye Color" aria-describedby="basic-addon1" v-model="bio.eyes">
        </div>
        <div class="mb-3 col">
            <span class="age-input-label" id="basic-addon1">Hair</span>
            <input type="text" class="form-control" aria-label="Hair Color" aria-describedby="basic-addon1" v-model="bio.hair">
        </div>
    </div>
    </div>
</template>
<script setup>
import { useBioStore } from '@/sheet/stores/bio/bioStore';
const bio = useBioStore();
const quillModules = {modules: {
                    keyboard: {
                        bindings: {
                        enter: {
                            key: 13, // 'Enter' key
                            handler: (range, context) => {
                            // Default behavior of Quill (inserts a single paragraph)
                            const quill = this.$refs.quillEditor.quill;
                            quill.formatLine(range.index, 1, 'block', true);
                            },
                        },
                        },
                    },
                }}
</script>