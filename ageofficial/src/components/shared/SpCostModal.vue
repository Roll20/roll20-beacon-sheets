<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click.self="$emit('cancel')">
      <div class="modal-container age-modal sp-cost-modal">
        <div class="age-modal-header">
          <h3 class="age-modal-details-header">{{ stuntName }}</h3>
          <button type="button" class="btn-close" @click="$emit('cancel')" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="sp-cost-prompt">How many stunt points?</p>
          <div class="sp-cost-options">
            <button
              v-for="amount in options"
              :key="amount"
              type="button"
              class="age-btn sp-cost-btn"
              @click="$emit('confirm', amount)"
            >
              {{ amount }} SP
            </button>
          </div>
          <div class="sp-cost-cancel">
            <button type="button" class="age-btn-link" @click="$emit('cancel')">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  stuntName: string;
  options: number[];
}>();

defineEmits<{
  confirm: [amount: number];
  cancel: [];
}>();
</script>

<style scoped>
.sp-cost-modal {
  min-width: 240px;
  max-width: 320px;
}
.sp-cost-prompt {
  font-size: 0.9rem;
  margin-bottom: 12px;
  text-align: center;
  opacity: 0.8;
}
.sp-cost-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
}
.sp-cost-btn {
  min-width: 56px;
  width: auto;
}
.sp-cost-cancel {
  text-align: center;
}
.age-btn-link {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.6;
}
.age-btn-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
