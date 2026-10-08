<template>
  <div class="cru-r20">
    <div class="cru-r20__grid">
      <label class="tof-label"
        >Default chat output
        <select
          class="tof-select"
          :value="entity.roll20.defaultOutput"
          @change="patch({ defaultOutput: value($event) as 'public' | 'gmWhisper' })"
        >
          <option value="public">Public rolls</option>
          <option value="gmWhisper">Whisper everything to the GM</option>
        </select>
      </label>
      <label class="tof-label tof-small">
        <input
          type="checkbox"
          :checked="entity.roll20.hideMechanics"
          @change="patch({ hideMechanics: checked($event) })"
        />
        Hide DCs and to-hit math from players
      </label>
      <label class="tof-label tof-small">
        <input
          type="checkbox"
          :checked="entity.roll20.concealName"
          @change="patch({ concealName: checked($event) })"
        />
        Conceal the creature's name in chat
      </label>
      <label v-if="entity.roll20.concealName" class="tof-label"
        >Shown as
        <input
          class="tof-input"
          :value="entity.roll20.concealedAs"
          placeholder="Unknown Horror"
          @input="patch({ concealedAs: value($event) })"
        />
      </label>
      <label class="tof-label tof-small">
        <input
          type="checkbox"
          :checked="entity.roll20.playerVisible"
          @change="patch({ playerVisible: checked($event) })"
        />
        Players may open the sheet (secrets are stripped from their copy)
      </label>
    </div>

    <h4 class="tof-h2 tof-small">Token Actions ({{ macros.length }})</h4>
    <p class="tof-small tof-muted">
      Buttons past {{ entity.roll20.macroMenuThreshold }} actions collapse into category menus so
      the token bar is not flooded.
    </p>
    <div class="cru-r20__macros">
      <span
        v-for="m in macros"
        :key="`${m.name}-${m.action}`"
        class="tof-tag"
        :class="{ 'cru-r20__gm': m.gmOnly }"
        :title="m.gmOnly ? 'GM-only' : m.menu ? `In the ${m.menu} menu` : 'Token button'"
      >
        {{ m.tokenAction ? '#' : '-' }} {{ m.name }}
      </span>
    </div>

    <details class="tof-small cru-r20__attrs">
      <summary>Macro attributes ({{ Object.keys(payload).length }})</summary>
      <code v-for="(v, k) in payload" :key="k" class="cru-r20__attr"
        >@{{ '{' }}name|{{ k }}{{ '}' }} = {{ v }}</code
      >
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleRoll20Block } from '@/crucible/schemas/crucibleRoll20.schema';
import { generateTokenActions } from '@/crucible/engine/generateTokenActions';
import { buildAttributePayload } from '@/crucible/engine/convertEntityToRoll20';

const props = defineProps<{ entity: CrucibleEntitySchema }>();
const emit = defineEmits<{ (e: 'update', value: Partial<CrucibleRoll20Block>): void }>();

const macros = computed(() => generateTokenActions(props.entity));
const payload = computed(() => buildAttributePayload(props.entity));

const value = (e: Event) => (e.target as HTMLInputElement).value;
const checked = (e: Event) => (e.target as HTMLInputElement).checked;
const patch = (partial: Partial<CrucibleRoll20Block>) => emit('update', partial);
</script>

<style scoped lang="scss">
.cru-r20__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}
.cru-r20__macros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.6rem;
}
.cru-r20__gm {
  opacity: 0.65;
}
.cru-r20__attrs {
  margin-top: 0.4rem;
}
.cru-r20__attr {
  display: block;
  padding: 0.08rem 0;
}
</style>
