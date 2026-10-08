<script setup>
// arcs[].steps is a PLAIN nested array — no _id, no arrayPosition transform
// (beacon-mapping §3.3). Index keys are safe: rows are only appended/removed.
const props = defineProps({ row: { type: Object, required: true } })
const addStep = () => props.row.steps.push({ name: 'New step', completed: false })
const removeStep = (index) => props.row.steps.splice(index, 1)
</script>

<template>
  <div class="arc-steps">
    <div v-for="(step, i) in row.steps" :key="i" class="arc-steps__step">
      <input
        class="arc-steps__completed"
        type="checkbox"
        :checked="step.completed"
        @change="step.completed = $event.target.checked"
      />
      <input class="arc-steps__name field" v-model="step.name" />
      <button class="arc-steps__remove btn" type="button" aria-label="Remove step" @click="removeStep(i)">✕</button>
    </div>
    <button class="arc-steps__add btn" type="button" @click="addStep">Add step</button>
  </div>
</template>
