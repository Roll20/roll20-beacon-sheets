<script setup>

</script>

<template>
<div class="flex-box flex-column ability-score-container">
  <div class="ability-display">
    <div class="ability-header">
      <slot name="ability"></slot>
    </div>
    <div class="ability-circle">
      <div class="inner-ability-circle">
        <slot name="mod"></slot>
      </div>
      <div class="ability-score">
        <slot name="score"></slot>
      </div>
    </div>
  </div>
</div>
</template>

<style lang='scss'>
.ability-score-container{
  break-inside: avoid;
  margin-inline: auto;
  align-items: center;
}
.ability-header{
  text-align: center;
}
.ability-circle{
  --_size: 100px;
  width: var(--_size);
  height: var(--_size);
  background-image: var(--abilityImage);
  background-size: contain;
  display: grid;
  grid-template-rows:30px 23px;
  padding-top: 20px;
  padding-bottom:25px;
  background-repeat: no-repeat;
  place-items: center;
  input{
    width: 100%;
  }
  .inner-ability-circle,
  .ability-score{
    margin-bottom:10px;
  }
}
</style>