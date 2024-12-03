<template>
  <div class="section-card">
    <h1 class="age-section-header">
      Conditions
      
    </h1>
    <div class="config-container">
        <button type="button" class="config-btn age-icon-btn"  @click="showModal = true">
          <font-awesome-icon :icon="['fa', 'gear']" />
        </button>
      </div>      
    <div class="age-conditions">
      <div v-if="[...conditions.conditions,...customConditions.customConditions.filter(con => con.show === true)].length === 0">No Conditions</div>
      <div v-if="[...conditions.conditions,...customConditions.customConditions.filter(con => con.show === true)].length > 0">
        <!-- <div v-for="condition in [...conditions.conditions,...customConditions.customConditions.filter(con => con.show === true)]" :key="condition"> -->
          <div v-for="condition in [
                      ...conditions.conditions.map(item => ({ ...item, origin: 'conditions' })), 
                      ...customConditions.customConditions
                      .filter(con => con.show === true)
                      .map(item => ({ ...item, origin: 'customConditions' }))
                      ]" 
              :key="condition._id">
          {{ condition.name }}
          <label class="age-checkbox-toggle" style="margin:1rem;">
                                <input type="checkbox"  v-model="condition.enabled" @change="toggleCondition(condition)" />
                                <span class="slider round" ></span>
                            </label>
          <!-- <button class="delete-btn delete" title="Delete" @click="conditions.removeCondition(condition._id)">
                              ✕ Delete Condition
                          </button> -->
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <ConditionsModal v-if="showModal" :show="showModal" @close="showModal = false;" >
      <template #header>
        <h3 class="age-modal-details-header">Conditions</h3>
      </template>
    </ConditionsModal>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue';
import ConditionsModal from '@/components/conditions/conditionsModal.vue'
import { useConditionsStore } from '../../sheet/stores/conditions/conditionsStore';
import { useCustomConditionsStore } from '@/sheet/stores/conditions/customConditionsStore';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';

const conditions = useConditionsStore();
const customConditions = useCustomConditionsStore();
const showModal = ref(false);
const mods = useModifiersStore();
const toggleCondition = (selectedCondition) =>{
  mods.toggleMod(selectedCondition._id,selectedCondition.enabled);
  selectedCondition.show = selectedCondition.enabled;
  switch(selectedCondition.origin){
    case 'conditions':
    if(selectedCondition.enabled){
        const addedCondition = conditionsStore.addCondition(selectedCondition);
        Object.assign(basicConditions[i],{
            _id:addedCondition._id
        })
    } else {
        conditionsStore.removeCondition(selectedCondition._id)
    }
    break;
    case 'customConditions':
      customConditions.customConditions.find(con => con._id === selectedCondition._id).enabled = selectedCondition.enabled;
    break;      
  }
}
</script>