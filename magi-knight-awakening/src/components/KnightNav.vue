<script setup>
import NotchContainer from './NotchContainer.vue';
</script>

<template>
  <nav class="knight-nav">
    <ul>
      <li>
        <RouterLink to="/">
          <NotchContainer class="nav-notch" notchType="wedge">Base Stats</NotchContainer>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/student">
          <NotchContainer class="nav-notch" notchType="wedge">
            Student
          </NotchContainer>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/knight">
          <NotchContainer class="nav-notch" notchType="wedge">
            Magi-Knight
          </NotchContainer>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss">
.knight-nav {
  a {
    color: inherit;
    text-decoration: none;
  }
}

.nav-notch {
  padding: var(--half-gap) var(--gap);
  --borderColor: var(--header-blue);

  &:hover,
  &:focus-visible {
    background-color: var(--header-blue);
    color: var(--masterBack);
  }
}

.router-link-active .nav-notch {
  background-color: var(--header-blue);
  color: var(--masterBack);
}
</style>