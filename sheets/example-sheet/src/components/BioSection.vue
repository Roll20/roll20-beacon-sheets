<template>
  <div class="section bio">
    <div class="section__header">Your Hero</div>
    <div class="section__body bio__body">
      <div class="bio__avatar">
        <img :src="meta.avatar || DEFAULT_AVATAR_URL"/>
      </div>
      <div class="bio__form">
        <label for="name">
          <span class="label">Name</span>
          <input id="name" v-model="meta.name"/>
        </label>
        <label for="name">
          <span class="label">Title</span>
          <input id="name" v-model="bio.title"/>
        </label>
        <label for="name">
          <span class="label">Friends</span>
          <input id="name" v-model="bio.friends"/>
        </label>
        <label for="name">
          <span class="label">Enemies</span>
          <input id="name" v-model="bio.enemies"/>
        </label>
        <label for="name">
          <span class="label">Species</span>
          <input id="name" v-model="bio.species"/>
        </label>
        <label for="name">
          <span class="label">Likes</span>
          <input id="name" v-model="bio.likes"/>
        </label>
        <label for="name">
          <span class="label">Looks</span>
          <input id="name" v-model="bio.looks"/>
        </label>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useMetaStore } from '@/sheet/stores/meta/metaStore'
import { useBioStore } from '@/sheet/stores/bio/bioStore'

const DEFAULT_AVATAR_URL = 'http://placekitten.com/200/200'

const meta = useMetaStore()
const bio = useBioStore()
</script>

<style scoped lang="scss">
.bio {
  &__body {
    display: flex;
    gap: 0.5rem;
  }

  &__avatar {
    width: 14.5rem;
    aspect-ratio: 1/1;
    img {
      object-fit: cover;
      width: 100%;
    }
  }
  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .label {
    font-weight: 600;
    width: 4.75rem;
    display: inline-block;
  }
}

</style>