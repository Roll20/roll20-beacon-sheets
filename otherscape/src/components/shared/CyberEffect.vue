<template>
  <div class="cyber-effect">
    <img alt="Pixelated Effect" src="https://i.postimg.cc/s2xwTgwj/theme-box-bg.png" />
  </div>
</template>

<style lang="scss" scoped>
.cyber-effect {
  --cyber-effect: rgba(0,0,0,0.25);

  display: flex;
  position: absolute;
  width: 100%;

  left:0;
  bottom: 0;

  filter: drop-shadow(0px 9999999px 0 var(--cyber-effect));
  transform: translateY(-9999999px);

  pointer-events: none;

  img {
    width: 100%;
    height: auto;
  }
}
</style>