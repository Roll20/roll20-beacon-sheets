<template>
  <div class="view view--challenge">
    <button type="button" :class="`mode mode--${challenge.mode}`" @click="challenge.mode = (challenge.mode === 'edit' ? 'view' : 'edit')">
      <SvgIcon icon="Edit" />
    </button>
    <div class="challenge challenge--edit" v-if="challenge.mode === 'edit'">
      <div class="challenge__header">
        <div class="challenge__title">
          <div class="challenge__name"><input type="text" v-model="meta.name" placeholder="Challenge Name"></div>
          <div class="challenge__rating"><input type="number" v-model="challenge.meta.rating" placeholder="Rating"></div>
        </div>
        <!-- <div class="challenge__roles">
          <input type="text" v-model="challenge.meta.roles" placeholder="Roles (comma separated)"/>
        </div> -->
        <div class="challenge__description">
          <textarea v-model="challenge.meta.description" placeholder="Description"></textarea>
        </div>
      </div>
      <div class="challenge__left-col">
        <div class="challenge__limits">
          <span class="title title--dashed-center">Limits</span>
          <div class="list">
              <div class="limit deleteable" v-for="limit in challenge.limits" :key="limit._id">
                <div class="limit__meta">
                  <input type="text" v-model="limit.name" placeholder="Name">
                  <input type="number" v-model="limit.value" placeholder="Value">
                  <button type="button" @click="challenge.deleteLimit(limit._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
                </div>
                <textarea v-model="limit.description" placeholder="Progress Special Feature"></textarea>
              </div>
              <div class="newlimit">
                <div class="limit__meta">
                  <input type="text" v-model="newLimit.name" placeholder="New Limit">
                  <input type="number" v-model="newLimit.value" placeholder="Value">
                  <button @click="addLimit" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                </div>
              </div>
          </div>
        </div>
        <div class="challenge__tags-and-statuses">
          <span class="title title--dashed-center">Tags & Statuses</span>
          <div class="list">
              <div class="tag-or-status deleteable" v-for="tagOrStatus in challenge.tagsAndStatuses" :key="tagOrStatus._id">
                <input type="text" v-model="tagOrStatus.name">
                <input type="text" v-model="tagOrStatus.value">
                <button type="button" @click="challenge.deleteTagOrStatus(tagOrStatus._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
              </div>
              <div class="newtag-or-status">
                <input type="text" v-model="newTagOrStatus.name">
                <input type="number" v-model="newTagOrStatus.value">
                <button @click="addTagOrStatus" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
              </div>
          </div>
        </div>
        <!-- <div class="challenge__mighties">
          <span class="title title--dashed-center">Might</span>
          <div class="list">
              <div class="might deleteable" v-for="might in challenge.mighties" :key="might._id">
                <div class="might__type">
                  <div :class="`display display--${might.type.toLowerCase()}`">
                    <SvgIcon :icon="might.type" />
                    <span>▼</span>
                  </div>
                  <select v-model="might.type">
                    <option value="Self">Self</option>
                    <option value="Mythos">Mythos</option>
                    <option value="Noise">Noise</option>
                  </select>
                </div>
                <input type="text" v-model="might.description" placeholder="Description">
                <button type="button" @click="challenge.deleteMight(might._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
              </div>
              <div class="newmight">
                <div class="might__type">
                  <div :class="`display display--${newMight.type.toLowerCase()}`">
                    <SvgIcon :icon="newMight.type" />
                    <span>▼</span>
                  </div>
                  <select v-model="newMight.type">
                    <option value="Self">Self</option>
                    <option value="Mythos">Mythos</option>
                    <option value="Noise">Noise</option>
                  </select>
                </div>
                <input type="text" v-model="newMight.description" placeholder="New Might">
                <button @click="addMight" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
              </div>
          </div>
        </div> -->
        <div class="challenge__special-features">
          <span class="title title--dashed-center">Special Features</span>
          <div class="list">
              <div class="feature deleteable" v-for="feature in challenge.specialFeatures" :key="feature._id">
                <div class="actionable-row">
                  <input type="text" v-model="feature.name" placeholder="Name">
                  <button type="button" @click="challenge.deleteSpecialFeature(feature._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
                </div>
                <textarea v-model="feature.description" placeholder="Special Feature Description"></textarea>
              </div>
              <div class="newfeature">
                <div class="actionable-row">
                  <input type="text" v-model="newSpecialFeature.name" placeholder="New Feature">
                  <button @click="addSpecialFeature" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                </div>
              </div>
          </div>
        </div>
      </div>
      <div class="challenge__divider"></div>
      <div class="challenge__right-col">
          <div class="challenge__threats">
            <span class="title title--dashed-left">Threats & Consequences</span>
            <div class="list">
                <div class="threat deleteable" v-for="threat in challenge.threats" :key="threat._id">
                  <div class="threat__meta">
                    <div class="actionable-row">
                      <input class="threat__name" type="text" v-model="threat.name" placeholder="Threat">
                      <button class="threat__delete action-button action-button--delete" type="button" @click="challenge.deleteThreat(threat._id)"><SvgIcon icon="Delete" /></button>
                    </div>
                    <!-- <textarea class="threat__description" v-model="threat.description"></textarea> -->
                  </div>
                  <div class="threat__consequences">
                      <div class="list">
                        <div class="consequence deleteable" v-for="consequence in threat.consequences" :key="consequence._id">
                            <SvgIcon class="consequence__icon" icon="Power" />
                            <input type="text" v-model="consequence.description" placeholder="Description">
                            <button type="button" @click="challenge.deleteConsequence(threat._id, consequence._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
                        </div>
                        <div class="newconsequence">
                            <SvgIcon class="consequence__icon" icon="Power" />
                            <input type="text" v-model="newConsequence[threat._id]" placeholder="New Consequence">
                            <button type="button" @click="addConsequence(threat)" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                        </div>
                      </div>
                  </div>
                </div>
                <div class="newthreat actionable-row">
                  <input class="newthreat__name" type="text" v-model="newThreat" placeholder="New Threat">
                  <button type="button" @click="addThreat" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                </div>
            </div>
          </div>
      </div>
    </div>
    <div class="challenge challenge--view" v-else>
      <div class="challenge__header">
        <div class="challenge__title">
          <h1 class="challenge__name">{{ meta.name }}</h1>
          <div class="challenge__rating">
            <SvgIcon icon="Target" class="challenge__rating-icon" v-for="n in challenge.meta.rating" :key="n"/>
          </div>
        </div>
        <!-- <div class="challenge__roles">
          {{ challenge.meta.roles }}
        </div> -->
        <div class="challenge__description">
          {{ challenge.meta.description }}
        </div>     
      </div>
      <div class="challenge__left-col">
        <div class="challenge__limits">
          <span class="title title--dashed-center">Limits</span>
          <div class="list">
            <div class="limit" v-for="limit in challenge.limits" :key="limit._id">
              <div class="limit__meta">
                <span class="limit__name">{{ limit.name }}</span>
                <span class="limit__value" v-if="!limit.value">-</span>
                <span class="limit__value" v-else>{{ limit.value }}</span>
              </div>
              <span v-if="limit.description" class="limit__description">{{ limit.description }}</span>
            </div>
          </div>
        </div>
        <div class="challenge__tags-and-statuses">
          <span class="title title--dashed-center">Tags & Statuses</span>
          <!-- <div class="tags">{{ challenge.tagsAndStatuses.map(t => `${t.name}${t.value ? `-${t.value}` : ''}`).join(', ') }}</div> -->
          <div class="list">
            <div class="tag-or-status" v-for="tagOrStatus in challenge.tagsAndStatuses" :key="tagOrStatus._id">
              <span>{{ tagOrStatus.name }}</span>
              <span class="tag-or-status__value" v-if="tagOrStatus.value">-{{ tagOrStatus.value }}</span>
            </div>
            <!-- <div class="might" v-for="might in challenge.mighties" :key="might._id">
              <div :class="`display display--${might.type.toLowerCase()}`">
                <SvgIcon :icon="might.type" />
              </div>
              <span class="might__description">{{ might.description }}</span>
            </div> -->
          </div>
        </div>
        <div class="challenge__special-features">
          <span class="title title--dashed-center">Special Features</span>
          <div class="list">
            <div class="feature" v-for="feature in challenge.specialFeatures" :key="feature._id">
              <span class="feature__name">{{ feature.name }}.</span>
              <span class="feature__description" v-if="feature.description">{{ feature.description }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="challenge__divider"></div>
      <div class="challenge__right-col">
        <div class="challenge__threats">
          <span class="title title--dashed-left">Threats & Consequences</span>
          <div class="list">
            <div class="threat" v-for="threat in challenge.threats" :key="threat._id">
              <div class="threat__meta">
                <span class="threat__name">{{ threat.name }}</span>
                <!-- <span class="threat__description">{{ threat.description }}</span> -->
              </div>
              <div class="threat__consequences">
                <div class="list">
                  <div class="consequence" v-for="consequence in threat.consequences" :key="consequence._id">
                    <SvgIcon class="consequence__icon" icon="Power" />
                    <span class="consequence__description">{{ consequence.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sheet__trackers">
        <TrackingChip 
          v-for="tracker in trackers.trackers" 
          :key="tracker._id" 
          ref="trackerRefs"
          :tracker="tracker" 
        />
        <button class="sheet__add-tracker" type="button" @click="addTracker">
          <SvgIcon icon="Add" />
          <span v-if="trackers.trackers.length === 0" class="title">Add Tracker</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/shared/SvgIcon.vue';
import { challengeStore, type Threat } from '@/sheet/stores/challenge/challengeStore';
import { nextTick, ref } from 'vue';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { trackersStore } from '@/sheet/stores/trackers/trackersStore';
import TrackingChip from '@/components/tracking/TrackingChip.vue';

const meta = metaStore();
const challenge = challengeStore();
const trackers = trackersStore();

const newThreat = ref<string>('');
const newLimit = ref<{ name: string; value: number | null }>({ name: '', value: null });
const newTagOrStatus = ref<{ name: string; value: number | null }>({ name: '', value: null });
const newMight = ref<{ type: 'Self' | 'Mythos' | 'Noise'; description: string }>({ type: 'Self', description: '' });
const newSpecialFeature = ref<{ name: string; description: string }>({ name: '', description: '' });

const newConsequence = ref<Record<string, string>>({});

const addConsequence = (threat:Threat) => {
  const description = newConsequence.value[threat._id] || '';
  if (description.trim() !== '') {
    const updatedThreat: Threat = {
      ...threat,
      consequences: [...threat.consequences, { ...challenge.getEmptyConsequence(), description }]
    }
    challenge.updateThreat(updatedThreat);
    newConsequence.value[threat._id] = '';
  }
};

const addLimit = () => {
  if (newLimit.value.name.trim() !== '') {
    challenge.updateLimit({ name: newLimit.value.name, value: newLimit.value.value ? newLimit.value.value : undefined });
    newLimit.value.name = '';
    newLimit.value.value = 0;
  }
};

const addTagOrStatus = () => {
  if (newTagOrStatus.value.name.trim() !== '') {
    challenge.updateTagOrStatus({ name: newTagOrStatus.value.name, value: newTagOrStatus.value.value ? newTagOrStatus.value.value : undefined });
    newTagOrStatus.value.name = '';
    newTagOrStatus.value.value = 0;
  }
};

const addMight = () => {
  if (newMight.value.description.trim() !== '') {
    challenge.updateMight({ type: newMight.value.type, description: newMight.value.description });
    newMight.value.description = '';
    newMight.value.type = 'Self';
  }
};

const addSpecialFeature = () => {
  if (newSpecialFeature.value.name.trim() !== '') {
    challenge.updateSpecialFeature({ name: newSpecialFeature.value.name, description: newSpecialFeature.value.description });
    newSpecialFeature.value.name = '';
    newSpecialFeature.value.description = '';
  }
};

const addThreat = () => {
  if (newThreat.value.trim() !== '') {
    challenge.updateThreat({ ...challenge.getEmptyThreat(), name: newThreat.value });
    newThreat.value = '';
  }
};

const trackerRefs = ref<InstanceType<typeof TrackingChip>[]>([]);
const addTracker = async () => {
  trackers.updateTracker();
  
  await nextTick();
  
  const lastRef = trackerRefs.value[trackerRefs.value.length - 1];
  if (lastRef?.$el) {
    const input = lastRef.$el.querySelector('input[type="text"]');
    if (input) {
      input.focus();
    }
  }
};
</script>

<style scoped lang="scss">
.view {
  --color-palette-highlight: var(--color-palette-neon);
  --challenge-color-1: rgb(var(--color-palette-neon));
  --challenge-color-2: #724a32;
  --challenge-color-3: #63758B;
  --challenge-color-4: #e7e3d8;
  --challenge-color-5: #a13d29;
  --challenge-color-6: #d1a18d;
  --tag-box-height: 27px;
  --tag-box-inclination-right: calc(var(--tag-box-height) / 2);
  --tag-box-inclination-left: calc(var(--tag-box-inclination-right) / 4 * 3);
  padding: 20px 20px 90px 20px;
  color: var(--color-text-primary);
}
.mode {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 20px;
  right: 20px;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0 0 10px rgb(var(--color-palette-shadow));
  z-index: 9999;
  border: 2px solid rgb(var(--color-herocard));
  background-color: transparent;
  cursor: pointer;
  .svg-icon {
    width: 30px;
    height: 30px;
    fill: var(--color-text-secondary); 
  }
  &:hover {
    border-color: rgb(var(--color-palette-highlight));
    .svg-icon {
      fill: rgb(var(--color-palette-highlight));
    }
  }
  &--edit {
    border-color: rgb(var(--color-palette-highlight));
    .svg-icon {
      fill: rgb(var(--color-palette-highlight));
    }
  }
}
.challenge {
  display:grid;
  grid-template-areas: "header header header"
                       "left-col divider right-col";
  grid-template-columns: 200px 2px 1fr;
  gap: 15px;

  font-size: 14px;
  
  .title {
    margin-bottom: 5px;
    display: block;
  }

  input[type="text"], input[type="number"] {
    height: 26px;
  }

  .action-button {
    width: 26px;
    height: 26px;
    box-sizing: border-box;
    cursor: pointer;
    background-color: rgb(var(--color-palette-foreground) / 0.05);
    border-radius: 5px;
    color: var(--color-herocard-title);
    border: 1px solid rgb(var(--color-palette-foreground) / 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
    .svg-icon {
      width: 16px;
      height: 16px;
      fill: var(--color-text-secondary);
    }
    &:hover {
      opacity: 1;
    }
    &--add {
      &:hover {
        border-color: var(--color-positive);
        background-color: var(--color-positive);
        .svg-icon {
          fill: var(--color-text-primary);
        }
      }
    }
    &--delete {
      &:hover {
        border-color: var(--color-negative);
        background-color: var(--color-negative);
        .svg-icon {
          fill: var(--color-text-primary);
        }
      }
    }
  }
  
  .deleteable:has(> .action-button--delete:hover),
  .deleteable:has(.threat__meta .action-button--delete:hover),
  .deleteable:has(.limit__meta .action-button--delete:hover),
  .feature.deleteable:has(.action-button--delete:hover) {
    position: relative;
    &:after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      width: calc(100% + 6px);
      height: calc(100% + 6px);
      background: rgba(255, 0, 0, 0.05);
      pointer-events: none;
    }
  }

  input, textarea {
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
    width: 100%;
    padding: 3px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &__header {
    grid-area: header;
  }
  &__left-col {
    grid-area: left-col;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  &__divider {
    grid-area: divider;
    background: var(--color-text-tertiary);
    width: 1px;
    opacity: 0.5;
    height: calc(100% + 35px);
  }
  &__right-col {
    grid-area: right-col;
  }

  .actionable-row {
    display: grid;
    grid-template-columns: 1fr min-content;
    gap: 5px;
    align-items: center;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 10px;
  }

  .might__type {
    width: 100%;
    display: grid;
    grid-template-areas: "stack";
    .display, select {
      grid-area: stack;
    }
    select {
      width: 100%;
      opacity: 0;
    }
    .display {
      display: grid;
      grid-template-columns: 1fr 16px;
      align-items: center;
      background: white;
      border-radius: 3px;
      height: 23px;
      border: 1px solid #ccc;
      box-sizing: border-box;
      min-height: 100%;
      .svg-icon {
        justify-self: center;
        width: 15px;
        height: 15px;
      }
      span {
        text-align: center;
        font-size: 10px;
      }
      &--self {
        .svg-icon {
          fill: #4d8061;
        }
      }
      &--mythos {
        .svg-icon {
          fill: #7d3c3c;
        }
      }
      &--noise {
        .svg-icon {
          fill: #5b5b91;
        }
      }
    }
  }

  .title--dashed {
    &-left, &-center {
      display: grid;
      gap: 5px;
      font-family: var(--font-family-title);
      font-size: var(--font-size-small);
      color: var(--challenge-color-3);
      &:before, &:after {
        height: 1px;
        background: var(--challenge-color-3);
        align-self: center;
      }
    }
    &-left {
      grid-template-columns: max-content 1fr;
      &:after {
        content: '';
      }
    }
    &-center {
      grid-template-columns: 1fr max-content 1fr;
      &:before, &:after {
        content: '';
      }
    }
  }

  &--edit {
    .threat {
      border-bottom-style: solid;
      border-bottom-width: 1px;
      border-image: linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,1) 50%, rgba(255,0,0,0) 100%);
      padding-bottom: 10px;
      margin-bottom: 10px;
      &__description {
        margin: 5px 0;
      }
      .list {
        margin-top: 5px;
      }
    }
    .challenge__title {
      display: grid;
      grid-template-columns: 1fr 100px;
      gap: 5px;
      align-items: center;
    }
    .challenge__limits, .challenge__special-features {
      .list {
        gap: 10px;
      }
    }
    .consequence, .newconsequence {
      display: grid;
      grid-template-columns: min-content 1fr min-content;
      gap: 5px;
      align-items: center;
    }
    .limit, .newlimit {
      &__meta {
        display: grid;
        grid-template-columns: 1fr 60px min-content;
        gap: 5px;
        align-items: center;
      }
      textarea {
        margin-top: 5px;
      }
    }
    .tag-or-status, .newtag-or-status {
      display: grid;
      grid-template-columns: 1fr 60px min-content;
      gap: 5px;
      align-items: center;
    }
    .might, .newmight {
      display: grid;
      grid-template-columns: 40px 1fr min-content;
      gap: 5px;
    }
    .feature {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }

  &--view {
    .challenge__title {
      display: flex;
      gap: 15px;
      align-items: center;
      h1 {
        color: rgb(var(--color-palette-highlight));
        font-family: "Barlow Condensed", sans-serif;
        font-style: italic;
        font-weight: 900;
        text-transform: uppercase;
        text-shadow: 2px 2px 0 rgb(var(--color-palette-shadow));
      }
      .challenge__rating {
        display: flex;
        gap: 4px;
        .svg-icon {
          width: 20px;
          height: 20px;
          fill: var(--challenge-color-1);
        }
      }
    }
    .challenge__roles {
      font-weight: bold;
      font-size: 18px;
      font-style: italic;
      color: var(--challenge-color-2);
      margin-top: -10px;
      margin-bottom: 5px;
    }
    .challenge__description {
    }
    .threat {
      &:not(:last-child) {
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-image: linear-gradient(90deg, var(--challenge-color-3) 0%, var(--challenge-color-4) 75%) 1;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      &__meta {
        line-height: calc(1em + 5px);
      }
      &__name {
        margin-right: 5px;
        font-weight: normal;
        font-style: italic;
      }
      &__consequences {
        .list {
          margin: 5px 0;
          .consequence {
            display: grid;
            grid-template-columns: min-content 1fr;
            align-items: center;
            gap: 5px;
          }
        }
      }
    }
    .limit {
      position: relative;
      &__meta {
        display: grid;
        grid-template-columns: max-content min-content;
        align-items: center;
        z-index: 2;
        position: relative;
        .limit__name {
          background: var(--challenge-color-1);
          color: black;
          padding: 2px 5px;
          text-transform: uppercase;
          font-weight: bold;
          box-sizing: border-box;
          min-height: 100%;
          display: grid;
          align-items: center;
          font-weight: normal;
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            var(--tag-box-inclination-left) 100%,
            0 calc(100% - var(--tag-box-inclination-right))
          );
        }
        .limit__value {
          font-weight: bold;
          color: black;
          background: var(--challenge-color-1);
          display: block;
          min-height: 100%;
          font-size: 1.5em;
          padding-right: 5px;
          padding-left: 1px;
          margin-left: -1px;
        }
      }
      &__description {
        padding: 5px;
        background-color: #3E4E5F;
        display: block;
        position: relative;
        margin-top: 5px;
        z-index: 1;
        &:after {
          content: '';
          position: absolute;
          top: -30px;
          left: 0;
          width: 15px;
          height: 30px;
          background: #3E4E5F;
          display: block;
        }
      }
      > .svg-icon {
        position: absolute;
        top: 25px;
        left: 0px;
        width: 14px;
        height: 14px;
      }
    }
    .might {
      display: grid;
      grid-template-columns: 20px 1fr;
      gap: 2px;
      align-items: center;
      .display {
        width: 16px;
        height: 16px;
        .svg-icon {
          width: 16px;
          height: 16px;
        }
        &--self {
          .svg-icon {
            fill: #4d8061;
          }
        }
        &--mythos {
          .svg-icon {
            fill: #7d3c3c;
          }
        }
        &--noise {
          .svg-icon {
            fill: #5b5b91;
          }
        }
      }
    }
    .feature {
      .feature__name {
        font-weight: bold;
        margin-right: 2px;
      }
    }
  }
  .sheet__trackers {
    margin-top: 20px;
    grid-column: 1 / -1;
    border-top: 1px solid rgb(var(--color-palette-foreground) / calc(var(--color-palette-disabled) / 2));
    padding-top: 40px;
    .chip {
      box-shadow: none!important;
    }
    .sheet__add-tracker {
      &:hover {
        box-shadow: none!important;
      }
    }
  }
}
.challenge {
  select, input, textarea {
    background: transparent;
    border: 1px solid rgb(var(--color-palette-foreground) / var(--color-palette-disabled));
    color: var(--color-text-primary);
    font-family: var(--font-family-body);
    option {
      font-family: var(--font-family-body);
    }
    &::placeholder {
      color: var(--color-text-tertiary);
    }
    &:hover {
      border-color: rgb(var(--color-palette-foreground) / 0.5);
    }
  }
  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
  }
}
.consequence__icon {
  width: 8px;
  height: 8px;
  fill: rgb(var(--color-palette-highlight));
  rotate: 90deg;
}
</style>