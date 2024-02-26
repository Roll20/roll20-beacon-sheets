<template>
  <div class="trait">
    <div class="trait__row">
      <button class="trait__toggle" @click="toggleExpand">
        <span class="caret" :class="{ expanded }">►</span>
        <span class="label">{{ trait.name }}</span>
      </button>
      <div class="trait__buttons">
        <button class="link-btn print" title="Print" @click="handlePrint">⮑</button>
        <button class="link-btn delete" title="Delete" @click="handleDelete">✕</button>
      </div>
      <div class="trait__level">
        {{ index + 1 }}
      </div>
    </div>

    <div class="trait__expansion" :class="{ expanded }">
      <div class="trait__top">
        <label :for="`name-${trait._id}`">
          <span class="label">Name</span>
          <input :id="`name-${trait._id}`" v-model="trait.name" />
        </label>
        <label :for="`type-${trait._id}`">
          <span class="label">Type</span>
          <select :id="`type-${trait._id}`" v-model="trait.type">
            <option value="skill">Skill</option>
            <option value="power">Power</option>
          </select>
        </label>
      </div>
      <div class="trait__bottom">
        <textarea
          placeholder="Description"
          :id="`description-${trait._id}`"
          v-model="trait.description"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTraitsStore } from '@/sheet/stores/traits/traitsStore';

const props = defineProps({
  trait: { type: Object },
  index: { type: Number },
});

const expanded = ref(false);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};
const handleDelete = () => {
  const traitStore = useTraitsStore();
  traitStore.removeTrait(props.trait._id);
};
const handlePrint = () => {
  const traitStore = useTraitsStore();
  traitStore.printTrait(props.trait._id);
};
</script>

<style scoped lang="scss">
.trait {
  .label {
    font-weight: 600;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__buttons {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
    button {
      padding: 0 0.5rem;
      &.delete {
        font-size: 1.25rem;
      }
    }
  }

  &__level {
    font-weight: 600;
    width: 1rem;
  }

  &__toggle {
    font-weight: 600;
    display: inline-flex;
    gap: 1rem;
    align-traits: center;
    .caret {
      line-height: 1rem;
      transform: rotate(0deg);
      transition: transform 0.2s ease-in-out;
      &.expanded {
        transform: rotate(-90deg);
      }
    }
  }

  &__expansion {
    height: 0;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s linear;

    &.expanded {
      opacity: 1;
      height: 9rem;
      pointer-events: all;
    }
  }

  &__top {
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  &__bottom {
    width: 100%;
    margin-bottom: 1rem;

    textarea {
      width: 100%;
      height: 5rem;
    }
  }
}
</style>
