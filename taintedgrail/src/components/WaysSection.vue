<template>
  <div class="section ways">
    <div class="section__body ways__body">
      <div class="ways__form">
        <div class="ways__avatar">
          <img :src="bio.avatar || DEFAULT_AVATAR" />
        </div>
        <h3 class="ways__header">Color</h3>
        <select :id="`color`" v-model="bio.color">
          <option value="">None</option>
          <option value="blue">Blue</option>
          <option value="brown">Brown</option>
          <option value="gray">Gray</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
        </select>
        <h3 class="ways__header">Ways</h3>
        <div class="ways__list">
          <label for="combativeness">
            <div class="label-container">
              <span class="roll-icon" @click="waysStore.rollWay('combativeness')">
                <img :src="dieIcon" title="Roll Combativeness" />
              </span>
              <span class="label">Combativeness</span>
            </div>
            <input
              id="combativeness"
              v-model="waysStore.combativenessModel"
              type="number"
              min="0"
            />
            <span class="label">Passion</span>
          </label>
          <label for="creativity">
            <div class="label-container">
              <span class="roll-icon" @click="waysStore.rollWay('creativity')">
                <img :src="dieIcon" title="Roll Creativity" />
              </span>
              <span class="label">Creativity</span>
            </div>
            <input id="creativity" v-model="waysStore.creativityModel" type="number" min="0" />
            <span class="label">Subversion</span>
          </label>
          <label for="awareness">
            <div class="label-container">
              <span class="roll-icon" @click="waysStore.rollWay('awareness')">
                <img :src="dieIcon" title="Roll Awareness" />
              </span>
              <span class="label">Awareness</span>
            </div>
            <input id="awareness" v-model="waysStore.awarenessModel" type="number" min="0" />
            <span class="label">Influence</span>
          </label>
          <label for="reason">
            <div class="label-container">
              <span class="roll-icon" @click="waysStore.rollWay('reason')">
                <img :src="dieIcon" title="Roll Reason" />
              </span>
              <span class="label">Reason</span>
            </div>
            <input id="reason" v-model="waysStore.reasonModel" type="number" min="0" />
            <span class="label">Doubt</span>
          </label>
          <label for="conviction">
            <div class="label-container">
              <span class="roll-icon" @click="waysStore.rollWay('conviction')">
                <img :src="dieIcon" title="Roll Conviction" />
              </span>
              <span class="label">Conviction</span>
            </div>
            <input id="conviction" v-model="waysStore.convictionModel" type="number" min="0" />
            <span class="label">Guilt</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useWaysStore } from '@/sheet/stores/waysStore';

const DEFAULT_AVATAR = new URL('@/assets/mystery-man.svg', import.meta.url).href;
const dieIcon = new URL('@/assets/d10.svg', import.meta.url).href;

const bio = useBioStore();
const waysStore = useWaysStore();
</script>

<style scoped lang="scss">
.ways {
  width: 110px;
  margin-right: 10px;

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  &__header {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }

  &__form {
    width: 110px;

    select {
      margin-bottom: 1.1rem;
    }
  }

  &__avatar {
    width: 110px;
    box-sizing: border-box;
    border: 1px solid #000;
    border-radius: 2px;
    aspect-ratio: 1/1;
    img {
      object-fit: cover;
      width: 100%;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .label-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 0.25rem;

      .roll-icon {
        cursor: pointer;
        width: 16px;
        height: 16px;
        img {
          width: 100%;
        }
      }
    }

    label {
      margin-bottom: 4px;
      padding-top: 5px;
      padding-bottom: 5px;
      border-bottom: 1px solid #aaa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    input {
      width: 110px;
      box-sizing: border-box;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.05);
      border: 1px solid #7a7971;
      border-radius: 3px;
      padding: 0.25rem;
    }
  }

  .label {
    font-weight: 600;
    display: inline-block;
  }

  select {
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid #7a7971;
    border-radius: 2px;
    text-align: center;
    width: 100%;
    padding: 0.25rem;

    &:focus {
      outline: none;
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
