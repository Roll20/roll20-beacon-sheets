<script setup>
  // adapted from digital ocean https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component

  const emit = defineEmits(['close']);
  const close = () => {
    emit('close');
  }
  const props = defineProps({
    mclass: String
  })
</script>

<template>
  <div class="modal-backdrop">
    <div :class="`modal${props.mclass ? ` ${props.mclass}` : ''}`">
      <button @click="$emit('close')" class="btn-close material-symbols-outlined">close</button>
      <slot />
    </div>
  </div>
</template>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: #FFFFFF;
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
  }

  .btn-close {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    font-size: 20px;
    padding: 10px;
    cursor: pointer;
    font-weight: bold;
    color: #4AAE9B;
    background: transparent;
  }
</style>