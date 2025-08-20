<template>
  <div class="section traits">
    <div class="section__body traits__body">
      <!-- Torments -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Torments</span>
        </div>
        <div class="traits__divider"></div>
      </div>

      <!-- Routs -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Routs</span>
        </div>
        <div class="traits__divider"></div>
      </div>

      <!-- Advantages -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Advantages</span>
        </div>
        <div class="traits__divider"></div>
      </div>

      <!-- Disadvantages -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Disadvantages</span>
        </div>
        <div class="traits__divider"></div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped lang="scss">
.traits {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  &__group {
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.25rem 0;
  }

  &__divider {
    height: 1px;
    background-color: #7a7971;
    margin: 0.25rem 0 0.5rem 0;
  }
}
</style>
