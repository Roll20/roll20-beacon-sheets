<template>
  <div class="age-content">
    <div class="enh-body-padding">
      <div class="enh-section-header">
        <div class="enh-section-body">
          <span v-if="enhancementStore.enhancements.length === 0"
            >Your Enhancements is empty.
          </span>
        </div>
        <button
          class="link-btn age-icon-btn enh-add-btn"
          @click="showModal = true"
          v-tippy="{ content: 'Add Enhancement' }"
        >
          <font-awesome-icon :icon="['fa', 'circle-plus']" />
        </button>
      </div>
      <div class="accordion" v-if="enhancementStore.enhancements.length > 0">
        <transition-group name="filtered-list" tag="div">
          <div
            class="accordion-item"
            v-for="(enhancement, index) in enhancementStore.enhancements"
            :key="enhancement._id"
          >
            <CharacterEnhancement
              :key="enhancement._id"
              :enhancement="enhancement"
              :index="index"
              :aim="aim"
              :aimValue="aimValue"
              :aimOption="aimOption"
            />
          </div>
        </transition-group>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <EnhancementsModal
      :show="showModal"
      @close="showModal = false"
      :enhancement="enhancementNew"
      :mode="'create'"
    >
      <template #header>
        <h3 class="age-attack-details-header">Enhancements</h3>
      </template>
    </EnhancementsModal>
  </Teleport>
</template>
<script setup>
import { ref } from "vue";
import EnhancementsModal from "@/components/enhancements/EnhancementsModalView.vue";
import CharacterEnhancement from "./CharacterEnhancement.vue";
import { useEnhancementStore } from "@/sheet/stores/enhancements/enhancementsStore";
const showModal = ref(false);
const enhancementStore = useEnhancementStore();

let enhancementNew = ref({
  description: "",
  part: "",
  cost: 0,
  _id: "",
});
</script>
<style scoped>
.enh-body-padding {
  padding: 6px;
}
.enh-section-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}
.enh-section-body {
  padding: 15px 6px 6px;
  width: 100%;
}
button.enh-add-btn {
  font-size: 1.5rem;
}
</style>
