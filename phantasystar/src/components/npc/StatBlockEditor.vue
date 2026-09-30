<script setup>
import { useNpcStore } from '@/stores/npcStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'
import NpcEntryEditor from './NpcEntryEditor.vue'
import NpcTechniquesEditor from './NpcTechniquesEditor.vue'
import {
  ABILITIES,
  CREATURE_SIZES,
  CREATURE_TYPES,
  CHALLENGE_RATINGS,
  formatModifier,
  tokenSizeForSize,
} from '@/rules/index.js'

const npc = useNpcStore()
const meta = useMetaStore()

const KINDS = [
  { kind: 'trait', title: 'Traits', list: 'traits' },
  { kind: 'action', title: 'Actions', list: 'actions' },
  { kind: 'specialAction', title: 'Special Actions', list: 'specialActions' },
  { kind: 'reaction', title: 'Reactions', list: 'reactions' },
]
</script>

<template>
  <div class="editor">
    <div class="col">
      <SheetPanel title="Name and Details">
        <div class="grid">
          <label class="wide">
            <span>Name</span>
            <input v-model="meta.name" placeholder="Creature name" />
          </label>
          <label>
            <span>Size</span>
            <select v-model="npc.size">
              <option v-for="s in CREATURE_SIZES" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </label>
          <label>
            <span>Token Size</span>
            <input v-model="npc.tokenSize" :placeholder="tokenSizeForSize(npc.size)" />
          </label>
          <label>
            <span>Type</span>
            <select v-model="npc.creatureType">
              <option value="">&mdash;</option>
              <option v-for="t in CREATURE_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </label>
          <label>
            <span>Tags</span>
            <input v-model="npc.tags" />
          </label>
          <label>
            <span>Alignment</span>
            <input v-model="npc.alignment" />
          </label>
        </div>
      </SheetPanel>

      <SheetPanel title="Combat">
        <div class="grid">
          <label>
            <span>Defense</span>
            <input v-model.number="npc.defense" type="number" />
          </label>
          <label>
            <span>Defense note</span>
            <input v-model="npc.defenseNote" />
          </label>
          <label>
            <span>HP now</span>
            <input v-model.number="npc.hp.current" type="number" />
          </label>
          <label>
            <span>HP max</span>
            <input v-model.number="npc.hp.max" type="number" />
          </label>
          <label>
            <span>Hit dice</span>
            <input v-model="npc.hitDice" />
          </label>
          <label>
            <span>Speed</span>
            <input v-model="npc.speed" />
          </label>
          <label>
            <span>Initiative</span>
            <input v-model.number="npc.initiative" type="number" />
          </label>
          <label>
            <span>Challenge</span>
            <select v-model="npc.cr">
              <option value="">&mdash;</option>
              <option v-for="c in CHALLENGE_RATINGS" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
        </div>

      </SheetPanel>

      <SheetPanel title="Abilities">
        <div class="abilities">
          <label v-for="ability in ABILITIES" :key="ability.id">
            <span>{{ ability.abbr }}</span>
            <input v-model.number="npc.abilities[ability.id]" type="number" />
            <label class="prof" :title="`Proficient in ${ability.name} saves`">
              <input v-model="npc.saveProficiencies[ability.id]" type="checkbox" />
              <small>{{ formatModifier(npc.saves[ability.id]) }}</small>
            </label>
          </label>
        </div>
      </SheetPanel>

      <SheetPanel title="Other Details">
        <div class="skill-head">
          <span>Skills</span>
          <button type="button" class="add" @click="npc.addSkill()">+</button>
        </div>
        <div v-for="skill in npc.skills" :key="skill._id" class="skill-row">
          <input v-model="skill.name" />
          <input v-model.number="skill.bonus" type="number" />
          <ConfirmDelete class="del" title="Remove" @confirm="npc.removeSkill(skill._id)" />
        </div>

        <div class="grid stacked">
          <label class="wide">
            <span>Senses</span>
            <input v-model="npc.senses" />
          </label>
          <label class="wide">
            <span>Languages</span>
            <input v-model="npc.languages" />
          </label>
          <label>
            <span>Resistances</span>
            <input v-model="npc.resistances" />
          </label>
          <label>
            <span>Immunities</span>
            <input v-model="npc.immunities" />
          </label>
        </div>
      </SheetPanel>

      <SheetPanel title="Notes">
        <textarea v-model="npc.notes" rows="2" />
      </SheetPanel>
    </div>

    <div class="col">

      <SheetPanel v-for="group in KINDS" :key="group.kind" :title="group.title">
        <div class="entry-head">
          <button type="button" class="add" @click="npc.addEntry(group.kind)">+ Add</button>
        </div>
        <NpcEntryEditor
          v-for="entry in npc[group.list]"
          :id="entry._id"
          :key="entry._id"
          :kind="group.kind"
        />
      </SheetPanel>

      <SheetPanel v-if="npc.techniques.enabled" title="Techniques">
        <div class="entry-head">
          <ConfirmDelete class="del" title="Remove the Techniques block" @confirm="npc.setSection('techniques', false)" />
        </div>
        <NpcTechniquesEditor />
      </SheetPanel>

      <SheetPanel v-if="npc.legendary.enabled" title="Legendary Actions">
        <div class="entry-head">
          <label class="uses"><span>Uses</span><input v-model.number="npc.legendary.uses" type="number" min="0" /></label>
          <button type="button" class="add" @click="npc.addEntry('legendary')">+ Add</button>
          <ConfirmDelete class="del" title="Remove Legendary Actions" @confirm="npc.setSection('legendary', false)" />
        </div>
        <textarea v-model="npc.legendary.text" rows="2" />
        <NpcEntryEditor
          v-for="entry in npc.legendary.actions"
          :id="entry._id"
          :key="entry._id"
          kind="legendary"
          with-cost
        />
      </SheetPanel>

      <SheetPanel v-if="npc.boss.enabled" title="Boss Actions">
        <div class="entry-head">
          <label class="uses"><span>Uses</span><input v-model.number="npc.boss.uses" type="number" min="0" /></label>
          <label class="uses uses--check"><input v-model="npc.boss.enraged" type="checkbox" /><span>Enraged</span></label>
          <button type="button" class="add" @click="npc.addEntry('boss')">+ Add</button>
          <ConfirmDelete class="del" title="Remove Boss Actions" @confirm="npc.setSection('boss', false)" />
        </div>
        <textarea v-model="npc.boss.text" rows="2" />
        <NpcEntryEditor
          v-for="entry in npc.boss.actions"
          :id="entry._id"
          :key="entry._id"
          kind="boss"
          with-cost
        />
      </SheetPanel>

      <div class="sections">
        <button v-if="!npc.techniques.enabled" type="button" class="add" @click="npc.setSection('techniques', true)">
          + Techniques
        </button>
        <button v-if="!npc.legendary.enabled" type="button" class="add" @click="npc.setSection('legendary', true)">
          + Legendary Actions
        </button>
        <button v-if="!npc.boss.enabled" type="button" class="add" @click="npc.setSection('boss', true)">
          + Boss Actions
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;

  @media (min-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.col {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  min-width: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 6px 10px;

  .wide { grid-column: 1 / -1; }
}

label {
  display: flex;
  flex-direction: column;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; margin-bottom: 1px; }
}

input:not([type='checkbox']), select, textarea {
  @include ps-well;
  width: 100%;
  min-width: 0;
  height: 24px;
  font-size: 12px;
  text-align: left;
  padding: 0 5px;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

input[type='checkbox'] { @include ps-pip-check; }

textarea {
  height: auto;
  padding: 4px 5px;
  line-height: 1.45;
  resize: vertical;
}

input[type='number'] { text-align: center; }


.abilities {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;

  > label { align-items: center; }
}

.prof {
  flex-direction: row;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
  cursor: pointer;

  small { font-size: 10px; color: var(--ps-text-muted); }
}

.skill-head, .entry-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  @include ps-caption;
  margin-bottom: 3px;
}

.entry-head { justify-content: flex-end; }

.uses {
  flex-direction: row;
  align-items: center;
  gap: 4px;

  > span { margin: 0; }
  input { width: 50px; }

}

.sections {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;

  .add { margin-left: 0; }
}

.skill-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 60px 22px;
  gap: 5px;
  align-items: center;
  margin-bottom: 4px;
}

.add {
  @include ps-caption;
  margin-left: auto;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 9px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.del {
  border: none;
  background: none;
  color: var(--ps-text-muted);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;

  &:hover { color: var(--ps-red); }
}

@media (max-width: 620px) {
  .abilities { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
