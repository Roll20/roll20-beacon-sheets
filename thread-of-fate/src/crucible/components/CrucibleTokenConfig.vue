<template>
  <div class="cru-token">
    <div class="cru-token__grid">
      <label class="tof-label"
        >Token identity
        <select
          class="tof-select"
          :value="token.identity"
          @change="patch({ identity: value($event) as 'unique' | 'generic' })"
        >
          <option value="unique">Unique (named NPC / boss - bars may link)</option>
          <option value="generic">Generic (stock enemy - bars stay per-token)</option>
        </select>
      </label>
      <label class="tof-label"
        >Token art URL
        <input
          class="tof-input"
          :value="token.imageUrl"
          placeholder="uses portrait when blank"
          @input="patch({ imageUrl: value($event) })"
        />
      </label>
      <label class="tof-label"
        >Grid size
        <span class="tof-small tof-muted"
          >{{ token.gridWidth }} x {{ token.gridHeight }} (from size: {{ sizeName }})</span
        >
      </label>
      <label class="tof-label tof-small">
        <input
          type="checkbox"
          :checked="token.showNameplate"
          @change="patch({ showNameplate: checked($event) })"
        />
        Show nameplate
      </label>
    </div>

    <h4 class="tof-h2 tof-small">Token Bars</h4>
    <p v-if="token.identity === 'generic'" class="tof-small tof-warn--soft">
      Generic tokens keep bars unlinked so damaging one copy never damages the others.
    </p>
    <div v-for="bar in BARS" :key="bar" class="cru-token__bar">
      <span class="cru-token__barname">{{ bar.toUpperCase() }}</span>
      <select
        class="tof-select"
        :value="token[bar].computed"
        @change="patchBar(bar, { computed: value($event) as TokenBarConfig['computed'] })"
      >
        <option value="crucible_hp">Hit Points</option>
        <option value="crucible_stamina">Stamina</option>
        <option value="crucible_aether">Aether</option>
        <option value="crucible_ap">Action Points</option>
        <option value="crucible_ac">Armor Class</option>
        <option value="none">(empty)</option>
      </select>
      <label class="tof-small">
        <input
          type="checkbox"
          :checked="token[bar].linked"
          @change="patchBar(bar, { linked: checked($event) })"
        />
        linked
      </label>
      <select
        class="tof-select"
        :value="token[bar].visibility"
        @change="patchBar(bar, { visibility: value($event) as 'all' | 'gm' })"
      >
        <option value="all">players see it</option>
        <option value="gm">GM only</option>
      </select>
    </div>

    <div class="cru-token__grid">
      <label class="tof-label"
        >Night vision (ft)
        <input
          class="tof-input"
          type="number"
          min="0"
          :value="token.nightVisionRange"
          @input="patch({ nightVisionRange: num($event) })"
        />
      </label>
      <label class="tof-label"
        >Light radius (ft)
        <input
          class="tof-input"
          type="number"
          min="0"
          :value="token.lightRadius"
          @input="patch({ lightRadius: num($event) })"
        />
      </label>
      <label class="tof-label"
        >Aura radius (ft)
        <input
          class="tof-input"
          type="number"
          min="0"
          :value="token.auraRadius"
          @input="patch({ auraRadius: num($event) })"
        />
      </label>
      <label class="tof-label"
        >Aura color
        <input
          class="tof-input"
          :value="token.auraColor"
          @input="patch({ auraColor: value($event) })"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CrucibleTokenBlock, TokenBarConfig } from '@/crucible/schemas/crucibleRoll20.schema';
import { sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';

const props = defineProps<{ token: CrucibleTokenBlock; sizeId: string }>();
const emit = defineEmits<{ (e: 'update', value: Partial<CrucibleTokenBlock>): void }>();

const BARS = ['bar1', 'bar2', 'bar3'] as const;

const sizeName = computed(() => sizeOrDefault(props.sizeId).name);

const value = (e: Event) => (e.target as HTMLInputElement).value;
const num = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;
const checked = (e: Event) => (e.target as HTMLInputElement).checked;

const patch = (partial: Partial<CrucibleTokenBlock>) => emit('update', partial);
const patchBar = (bar: (typeof BARS)[number], partial: Partial<TokenBarConfig>) =>
  emit('update', { [bar]: { ...props.token[bar], ...partial } } as Partial<CrucibleTokenBlock>);
</script>

<style scoped lang="scss">
.cru-token__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.cru-token__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  .tof-select {
    max-width: 180px;
  }
}
.cru-token__barname {
  font-weight: 700;
  width: 3.2rem;
  color: var(--tof-gold);
}
</style>
