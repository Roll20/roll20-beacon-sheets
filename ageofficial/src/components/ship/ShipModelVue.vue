<template>
    <Transition name="modal">
        <div v-if="show" class="modal-mask">
            <div class="model-cntr" :style="{ maxWidth: maxWidth ? maxWidth : '75vw' }">
                <div class="age-modal-header">
                <slot name="header">default header</slot>
                <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

                </div>
                <div class="modal-body">
                    <div v-if="type === 'shipDetails'">
                        <div class="row" style="margin:0">
                            <div class="mb-3 col-6" style="flex-direction: column;padding: 0 2px;">
                                <span id="basic-addon1" class="age-input-label">Name</span>
                                <div>
                                    <input type="text" class="form-control" aria-label="Ship Name" v-model="meta.name"  aria-describedby="basic-addon1">
                                </div>
                            </div>
                            <div class="mb-3 col-6" v-if="isGM" style="flex-direction: column;padding: 0 2px;">
                                <span id="basic-addon1" class="age-input-label">Type</span>
                                <div>
                                    <select  id="bio.profession" v-model="bio.type" class="age-atk-select form-select">
                                        <option value="AniMon">Animal or Monster</option>
                                        <option value="Character">Character</option>
                                        <option value="Ship">Ship</option>
                                    </select>
                                </div>          
                            </div>
                        </div>
                        
                        <div class="row" style="margin:0">
                            <div class="mb-3 col-6" style="flex-direction: column;padding: 0 2px;">
                                <span id="basic-addon1" class="age-input-label">Length (meters)</span>
                                <div>
                                    <div class="input-with-unit">
                                        <input id="shipLength" type="number" :min="0" class="form-control" aria-label="Ship Length" v-model="ship.length" aria-describedby="basic-addon1">
                                    </div>
                                     <div>
                                         <span style="margin-right: 6px;">Size: {{ computedShipSize.size }}</span>
                                         <span style="margin-right: 6px;">Hull: {{ computedShipSize.hull }}</span>
                                         <span>Crew: {{ computedShipSize.crewMin }} ({{ computedShipSize.crewAvg }})</span>
                                     </div>
                                </div>
                            </div>
                            <div class="mb-3 col-6" style="flex-direction: column;padding: 0 2px;">
                                <span id="basic-addon1" class="age-input-label">Sensors</span>
                                <div>
                                    <input type="number" class="form-control" aria-label="Ship Sensors" v-model.number="ship.sensorsBase"  aria-describedby="basic-addon1">
                                </div>
                            </div>
                            <div class="input-group mb-3" style="flex-direction: column;padding: 0 2px;">
                            <span id="basic-addon1" class="age-input-label">Drive</span>
                                <VueMultiselect
                                v-model="ship.drive"
                                :options="shipDrives"
                                  label="type"
                                  track-by="_id"
                                 :multiple="true"
                                 :close-on-select="false"
                                 :showLabels="false"
                                 :searchable="false"
                                 :optionHeight="10"
                                 style="width: 100%; max-width: 300px;">
                                 <!-- <template #option="props">
                                    <div class="option__desc" style="height:10px; min-height: 0; padding: 0;">
                                        <span class="option__title" style="font-size: 12px; padding:0">
                                        {{ props.option }}</span></div>
                                </template> -->
                                </VueMultiselect>
                        </div>
                        </div>
                    </div>
                    <div v-else>
                        <slot name="body"></slot>
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup>
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useShipStore } from '@/sheet/stores/character/shipStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { computed, ref } from 'vue';
import VueMultiselect from 'vue-multiselect'

    const props = defineProps({        
        show: Boolean,
        type: String,
        maxWidth: String
    })
    const ship = useShipStore();
    const meta = useMetaStore();
    const bio = useBioStore();
    const isGM = computed(() => meta.permissions.isGM);
    const computedShipSize = computed(() => ship.computedShipSize);
    const shipDrives = [
        { _id: '1', type: 'Epstein' },
        { _id: '2', type: 'Thrusters' },
    ];
    const dropdownOpen = ref(false);
</script>
<style>
    .model-cntr {
        min-width: 300px;
        margin: auto;
        padding: 20px 30px;
        background-color: #fff;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
        transition: all 0.3s ease;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        width: 100%;
        & .age-modal-header {
            display: flex;
            justify-content: space-between;
            text-transform: lowercase;
        }
        & .row {
            display: flex;
            flex-wrap: wrap;
        }
    }
    .input-with-unit {
        position: relative;
    }

  .input-with-unit input[type="number"] {
    padding-right: 2.5em; /* space for the unit */
    box-sizing: border-box;
  }

  .input-with-unit::after {
    content: "m"; /* your unit */
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    pointer-events: none; /* don't block clicks */
    font-size: 0.9em;
  }
  

  fieldset[disabled] .multiselect {
    pointer-events: none;
  }

  .multiselect__spinner {
    position: absolute;
    right: 1px;
    top: 1px;
  width: 40px;
  height: 38px;
    background: #fff;
    display: block;
  }

  .multiselect__spinner::before,
  .multiselect__spinner::after {
    position: absolute;
    content: "";
    top: 50%;
    left: 50%;
    margin: -8px 0 0 -8px;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    border-color: var(--theme-primary) transparent transparent;
    border-style: solid;
    border-width: 2px;
    box-shadow: 0 0 0 1px transparent;
  }

  .multiselect__spinner::before {
    animation: spinning 2.4s cubic-bezier(0.41, 0.26, 0.2, 0.62);
    animation-iteration-count: infinite;
  }

  .multiselect__spinner::after {
    animation: spinning 2.4s cubic-bezier(0.51, 0.09, 0.21, 0.8);
    animation-iteration-count: infinite;
  }

  .multiselect__loading-enter-active,
  .multiselect__loading-leave-active {
    transition: opacity 0.4s ease-in-out;
    opacity: 1;
  }

  .multiselect__loading-enter,
  .multiselect__loading-leave-active {
    opacity: 0;
  }

  .multiselect,
  .multiselect__input,
  .multiselect__single {
    font-family: inherit;
    font-size: 16px;
    touch-action: manipulation;
  }

  .multiselect {
    box-sizing: content-box;
    display: block;
    position: relative;
    width: 100%;
    min-height: 40px;
    text-align: left;
    color: #35495e;
  }

  .multiselect * {
    box-sizing: border-box;
  }

  .multiselect:focus {
    outline: none;
  }

  .multiselect--disabled {
    background: #ededed;
    pointer-events: none;
    opacity: 0.6;
  }

  .multiselect--active {
    z-index: 50;
  }

  .multiselect--active:not(.multiselect--above) .multiselect__current,
  .multiselect--active:not(.multiselect--above) .multiselect__input,
  .multiselect--active:not(.multiselect--above) .multiselect__tags {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .multiselect--active .multiselect__select {
    transform: rotateZ(180deg);
  }

  .multiselect--above.multiselect--active .multiselect__current,
  .multiselect--above.multiselect--active .multiselect__input,
  .multiselect--above.multiselect--active .multiselect__tags {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .multiselect__input,
  .multiselect__single {
    position: relative;
    display: inline-block;
    min-height: 20px;
    line-height: 20px;
    border: none;
    border-radius: 5px;
    background: #fff;
    padding: 0 0 0 5px;
    width: calc(100%);
    transition: border 0.1s ease;
    box-sizing: border-box;
    margin-bottom: 8px;
    vertical-align: top;
  }

  .multiselect__input::placeholder {
    color: #35495e;
  }

  .multiselect__tag ~ .multiselect__input,
  .multiselect__tag ~ .multiselect__single {
    width: auto;
  }

  .multiselect__input:hover,
  .multiselect__single:hover {
    border-color: #cfcfcf;
  }

  .multiselect__input:focus,
  .multiselect__single:focus {
    border-color: #a8a8a8;
    outline: none;
  }

  .multiselect__single {
    padding-left: 5px;
    margin-bottom: 8px;
  }

  .multiselect__tags-wrap {
    display: inline;
  }

  .multiselect__tags {
    height: 26px;
    display: block;
    padding: 2px 40px 0 8px;
    border-radius: 5px;
    border: 1px solid #e8e8e8;
    background: #fff;
    font-size: 14px;
  }

  .multiselect__tag {
    position: relative;
    display: inline-block;
    padding: 0 26px 0 10px;
    border-radius: 5px;
    margin-right: 10px;
    color: #fff;
    line-height: 1;
    background: var(--theme-primary);
    /* margin-bottom: 5px; */
    white-space: nowrap;
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    & span {
        display: flex;
        align-items: center;
        height: 20px;
    }
  }

  .multiselect__tag-icon {
    cursor: pointer;
    margin-left: 7px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    font-weight: 700;
    font-style: initial;
    width: 22px;
    text-align: center;
    line-height: 20px;
    transition: all 0.2s ease;
    border-radius: 5px;
  }

  .multiselect__tag-icon::after {
    content: "×";
    color: #e6e6e6;
    font-size: 14px;
  }

  /* // Remove these lines to avoid green closing button
  //.multiselect__tag-icon:focus,
  //.multiselect__tag-icon:hover {
  //  background: #369a6e;
  //} */

  .multiselect__tag-icon:focus::after,
  .multiselect__tag-icon:hover::after {
    color: white;
  }

  .multiselect__current {
    line-height: 16px;
    min-height: 40px;
    box-sizing: border-box;
    display: block;
    overflow: hidden;
    padding: 8px 12px 0;
    padding-right: 30px;
    white-space: nowrap;
    margin: 0;
    text-decoration: none;
    border-radius: 5px;
    border: 1px solid #e8e8e8;
    cursor: pointer;
  }

  .multiselect__select {
    line-height: 16px;
    display: block;
    position: absolute;
    box-sizing: border-box;
    width: 40px;
    height: 25px;
    right: 1px;
    top: 1px;
    padding: 4px 8px;
    margin: 0;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .multiselect__select::before {
    position: relative;
    right: 0;
    top: 65%;
    color: #999;
    margin-top: 4px;
    border-style: solid;
    border-width: 5px 5px 0 5px;
    border-color: #999 transparent transparent transparent;
    content: "";
  }

  .multiselect__placeholder {
    color: #adadad;
    display: inline-block;
    margin-bottom: 10px;
    padding-top: 2px;
  }

  .multiselect--active .multiselect__placeholder {
    display: none;
  }

  .multiselect__content-wrapper {
    position: absolute;
    display: block;
    background: #fff;
    width: 100%;
    max-height: 240px;
    overflow: auto;
    border: 1px solid #e8e8e8;
    border-top: none;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    z-index: 50;
    -webkit-overflow-scrolling: touch;
  }

  .multiselect__content {
    list-style: none;
    display: inline-block;
    padding: 0;
    margin: 0;
    min-width: 100%;
    vertical-align: top;
  }

  .multiselect--above .multiselect__content-wrapper {
    bottom: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom: none;
    border-top: 1px solid #e8e8e8;
  }

  .multiselect__content::-webkit-scrollbar {
    display: none;
  }

  .multiselect__element {
    display: block;
  }

  .multiselect__option {
    display: block;
    padding: 12px;
    min-height: 40px;
    line-height: 16px;
    text-decoration: none;
    text-transform: none;
    vertical-align: middle;
    position: relative;
    cursor: pointer;
    white-space: nowrap;
  }

  .multiselect__option::after {
    top: 0;
    right: 0;
    position: absolute;
    line-height: 40px;
    padding-right: 12px;
    padding-left: 20px;
    font-size: 13px;
  }

  .multiselect__option--highlight {
    background: var(--theme-primary);
    outline: none;
    color: white;
  }

  .multiselect__option--highlight::after {
    content: attr(data-select);
    background: var(--theme-primary);
    color: white;
  }

  .multiselect__option--selected {
    background: #f3f3f3;
    color: #35495e;
    font-weight: bold;
  }

  .multiselect__option--selected::after {
    content: attr(data-selected);
    color: silver;
  background: inherit;
  }

  .multiselect__option--selected.multiselect__option--highlight {
    background: #ff6a6a;
    color: #fff;
  }

  .multiselect__option--selected.multiselect__option--highlight::after {
    background: #ff6a6a;
    content: attr(data-deselect);
    color: #fff;
  }

  .multiselect--disabled .multiselect__current,
  .multiselect--disabled .multiselect__select {
    background: #ededed;
    color: #a6a6a6;
  }

  .multiselect__option--disabled {
    background: #ededed !important;
    color: #a6a6a6 !important;
    cursor: text;
    pointer-events: none;
  }

  .multiselect__option--group {
    background: #ededed;
    color: #35495e;
  }

  .multiselect__option--group.multiselect__option--highlight {
    background: #35495e;
    color: #fff;
  }

  .multiselect__option--group.multiselect__option--highlight::after {
    background: #35495e;
  }

  .multiselect__option--disabled.multiselect__option--highlight {
    background: #dedede;
  }

  .multiselect__option--group-selected.multiselect__option--highlight {
    background: #ff6a6a;
    color: #fff;
  }

  .multiselect__option--group-selected.multiselect__option--highlight::after {
    background: #ff6a6a;
    content: attr(data-deselect);
    color: #fff;
  }

  .multiselect-enter-active,
  .multiselect-leave-active {
    transition: all 0.15s ease;
  }

  .multiselect-enter,
  .multiselect-leave-active {
    opacity: 0;
  }

  .multiselect__strong {
    margin-bottom: 8px;
    line-height: 20px;
    display: inline-block;
    vertical-align: top;
    /* override weight/color for selected values */
    font-weight: 400;
    color: inherit;
  }

  *[dir="rtl"] .multiselect {
    text-align: right;
  }

  *[dir="rtl"] .multiselect__select {
    right: auto;
    left: 1px;
  }

  *[dir="rtl"] .multiselect__tags {
    padding: 8px 8px 0 40px;
  }

  *[dir="rtl"] .multiselect__content {
    text-align: right;
  }

  *[dir="rtl"] .multiselect__option::after {
    right: auto;
    left: 0;
  }

  *[dir="rtl"] .multiselect__clear {
    right: auto;
    left: 12px;
  }

  *[dir="rtl"] .multiselect__spinner {
    right: auto;
    left: 1px;
  }

  @keyframes spinning {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(2turn);
    }
  }
@media (max-width: 600px) {
    .model-cntr {
        max-width: 90dvw;
    }
}
</style>