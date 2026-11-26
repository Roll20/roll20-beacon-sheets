<script setup>
import SegmentedControl from '@/components/SegmentedControl.vue'

defineProps({
  label: { type: String, required: true },
  segments: { type: Array, required: true },
  // key -> component. Passing the map in keeps this component free of any knowledge
  // of what a segment contains.
  panels: { type: Object, required: true },
  // ONE already-resolved key, fed to BOTH the control and the panel host below. The
  // retired tabs.js had to warn in a comment that App.vue and TabBar.vue must each
  // remember to resolve; here there is only one value and nothing to forget.
  active: { type: String, required: true }
})
defineEmits(['select'])
</script>

<!-- ARCHITECTURE (spec §7 constraint 4). Every panel is mounted at every width and CSS
     decides what is visible: above 27rem .cluster__panels hides the ones without
     [data-active]; below it, stack mode shows all of them and hides the control. That
     is what makes narrow mode pure CSS — no resize listener, no extra state — and it
     means any panel-level onMounted work runs for all seven segments at startup.

     Panels are <section aria-label>, i.e. named landmarks. In stack mode there is no
     control, so these regions and their banner headings are the only navigation. -->
<template>
  <section class="cluster" :aria-label="label">
    <SegmentedControl
      :segments="segments"
      :active="active"
      :label="label"
      @select="$emit('select', $event)"
    />
    <div class="cluster__panels">
      <section
        v-for="s in segments"
        :key="s.key"
        class="cluster__panel"
        :data-segment="s.key"
        :data-active="active === s.key || null"
        :aria-label="s.label"
      >
        <component :is="panels[s.key]" />
      </section>
    </div>
  </section>
</template>
