<template>
  <div class="section ways">
    <div class="section__body ways__body">
      <div class="ways__form">
        <div class="ways__avatar">
          <img v-if="meta.avatar && meta.avatar !== ''" :src="meta.avatar || DEFAULT_AVATAR_URL" />
        </div>
        <h3 class="ways__header">Color</h3>
        <select :id="`color`" v-model="character.color" :style="{ color: getColorValue(character.color), fontWeight: 'bold' }">
          <option value="" disabled hidden>None</option>
          <option value="blue" style="color: initial;">Blue</option>
          <option value="brown" style="color: initial;">Brown</option>
          <option value="gray" style="color: initial;">Gray</option>
          <option value="green" style="color: initial;">Green</option>
          <option value="red" style="color: initial;">Red</option>
        </select>
        <h3 class="ways__header">Ways</h3>
        <div class="ways__list">
          <label for="combativeness">
            <div class="label-container">
              <span class="roll-icon" @click="ways.rollWay('combativeness')">
                <img :src="dieIcon" title="Roll Combativeness" />
              </span>
              <span class="label">Combativeness</span>
            </div>
            <input
              id="combativeness"
              :value="ways.combativeness"
              @input="(event) => ways.setCombativeness(Number((event.target as HTMLInputElement)?.value) || 0)"
              type="number"
              min="0"
            />
            <span class="label">Passion</span>
          </label>
          <label for="creativity">
            <div class="label-container">
              <span class="roll-icon" @click="ways.rollWay('creativity')">
                <img :src="dieIcon" title="Roll Creativity" />
              </span>
              <span class="label">Creativity</span>
            </div>
            <input 
              id="creativity" 
              :value="ways.creativity" 
              @input="(event) => ways.setCreativity(Number((event.target as HTMLInputElement)?.value) || 0)" 
              type="number" 
              min="0" 
            />
            <span class="label">Subversion</span>
          </label>
          <label for="awareness">
            <div class="label-container">
              <span class="roll-icon" @click="ways.rollWay('awareness')">
                <img :src="dieIcon" title="Roll Awareness" />
              </span>
              <span class="label">Awareness</span>
            </div>
            <input 
              id="awareness" 
              :value="ways.awareness" 
              @input="(event) => ways.setAwareness(Number((event.target as HTMLInputElement)?.value) || 0)" 
              type="number" 
              min="0" 
            />
            <span class="label">Influence</span>
          </label>
          <label for="reason">
            <div class="label-container">
              <span class="roll-icon" @click="ways.rollWay('reason')">
                <img :src="dieIcon" title="Roll Reason" />
              </span>
              <span class="label">Reason</span>
            </div>
            <input 
              id="reason" 
              :value="ways.reason" 
              @input="(event) => ways.setReason(Number((event.target as HTMLInputElement)?.value) || 0)" 
              type="number" 
              min="0" 
            />
            <span class="label">Doubt</span>
          </label>
          <label for="conviction">
            <div class="label-container">
              <span class="roll-icon" @click="ways.rollWay('conviction')">
                <img :src="dieIcon" title="Roll Conviction" />
              </span>
              <span class="label">Conviction</span>
            </div>
            <input 
              id="conviction" 
              :value="ways.conviction" 
              @input="(event) => ways.setConviction(Number((event.target as HTMLInputElement)?.value) || 0)" 
              type="number" 
              min="0" 
            />
            <span class="label">Guilt</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useWaysStore } from '@/sheet/stores/ways/waysStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';


const DEFAULT_AVATAR_URL = new URL('@/assets/mystery-man.svg', import.meta.url).href;
const dieIcon = new URL('@/assets/d10.svg', import.meta.url).href;

const character = useCharacterStore();
const meta = useMetaStore();
const ways = useWaysStore();

const getColorValue = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'blue',
    brown: '#8B4513',
    gray: '#666666',
    green: '#01B901',
    red: 'red'
  };
  return colorMap[color] || 'inherit';
};
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
