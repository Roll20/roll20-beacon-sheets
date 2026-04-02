<template>
  <NineSlicedBox theme="g">
    <div class="section biography-section">
      <div class="columns columns-4">
        <label class="span-1">
          <span class="label">{{ $t('titles.name') }}</span>
          <input type="text" v-model="meta.name" />
        </label>
        <label class="span-1">
          <span class="label">
            <SidebarLink
              ref="classSidebarLink"
              componentName="ClassesSidebar"
              :options="{
                title: t('actions.edit-classes'),
                hasSave: true,
                hasDelete: false,
                hasAdd: true,
                addLabel: t('actions.add-new-class'),
              }"
              :label="$t('titles.character-class-and-level')"
              class="input-like"
            />
          </span>
          <input type="text" :value="progression.getClassesSummary" readonly @click="triggerSidebarLink"/>
        </label>
        <label class="span-1">
          <span class="label">
            <SidebarLink
              ref="backgroundSidebarLink"
              componentName="BackgroundSidebar"
              :options="{
                title: t('actions.edit-background'),
                hasSave: true,
                addLabel: t('actions.add-new-background'),
              }"
              :label="$t('titles.background')"
              class="input-like"
            />
          </span>
          <input type="text" :value="progression.background.name" readonly @click="triggerBackgroundSidebarLink"/>
        </label>
        <label class="span-1">
          <span class="label">
            <SidebarLink
              ref="ancestrySidebarLink"
              componentName="AncestrySidebar"
              :options="{
                title: t('actions.edit-ancestry'),
                hasSave: true,
                addLabel: t('actions.add-new-ancestry'),
              }"
              :label="$t('titles.ancestry')"
              class="input-like"
            />
          </span>
          <input type="text" :value="progression.getAncestrySummary" readonly @click="triggerAncestrySidebarLink"/>
        </label>
        <!-- <label class="span-1">
          <span class="label">
            <SidebarLink
              ref="transformationSidebarLink"
              componentName="TransformationSidebar"
              :options="{
                title: t('actions.edit-transformation'),
                hasSave: true
              }"
              :label="$t('titles.transformation')"
              class="input-like"
            />
          </span>
          <input type="text" :value="progression.getTransformationSummary" readonly @click="triggerTransformationSidebarLink"/>
        </label> -->
        <label class="span-1">
          <span class="label">{{ $t('titles.alignment') }}</span>
          <div class="alignment">
            <input type="text" :value="biography.alignment ? $t(`titles.alignments.${biography.alignment}`) : ''" readonly />
            <select v-model="biography.alignment">
              <option value="">{{ $t(`titles.alignments.unaligned`) }}</option>
              <option v-for="alignment in config.alignments" :key="alignment" :value="alignment">
                {{ $t(`titles.alignments.${alignment}`) }}
              </option>
            </select>
          </div>
        </label>
        <label class="span-1">
          <span class="label">{{ $t('titles.size') }}</span>
          <div class="size">
            <input type="text" :value="$t(`titles.sizes.${biography.size}`)" readonly />
            <select v-model="biography.size">
              <option v-for="size in config.sizes" :key="size" :value="size">
                {{ $t(`titles.sizes.${size}`) }}
              </option>
            </select>
          </div>
        </label>
        <label class="span-1">
          <span class="label">{{ $t('titles.gender') }}</span>
          <input type="text" v-model="biography.gender" />
        </label>
        <label class="span-1">
          <span class="label">{{ $t('titles.experience-points') }}</span>
          <input type="number" v-model="progression.experiencePoints" />
        </label>
      </div>
    </div>
  </NineSlicedBox>
</template>

<script setup>
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBiographyStore } from '@/sheet/stores/biography/biographyStore';
import { config } from '@/config';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { ref } from 'vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';

const { t } = useI18n();

const meta = useMetaStore();
const biography = useBiographyStore();
const progression = useProgressionStore();

const classSidebarLink = ref();
const ancestrySidebarLink = ref();
const backgroundSidebarLink = ref();
const transformationSidebarLink = ref();

const triggerSidebarLink = () => {
  classSidebarLink.value?.openSidebar();
}
const triggerAncestrySidebarLink = () => {
  ancestrySidebarLink.value?.openSidebar();
}
const triggerBackgroundSidebarLink = () => {
  backgroundSidebarLink.value?.openSidebar();
}
const triggerTransformationSidebarLink = () => {
  transformationSidebarLink.value?.openSidebar();
}
</script>

<style lang="scss" scoped>
.biography-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  box-sizing: border-box;
  .columns {
    gap: var(--size-gap-small) var(--size-gap-medium);
  }
  .label {
    display: block;
    margin-bottom: 0;
    font-weight: normal;//var(--weight-bold);
  }
  input {
    padding: 3px 0;
    font-size: var(--size-font-medium);
    //font-family: 'Courier New', Courier, monospace;
    outline: none;
  }
  .alignment, .size {
    position: relative;
    select {
      position: absolute;
      border: 0;
      padding: 0;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }
}
</style>
<style lang="scss">
.biography-section {
  .sidebar-link {
    font-weight: normal;//var(--weight-bold);
  }
  select {
    appearance: textfield;
  }
}
.sheet {
  .biography-section {
    input,
    .input-like {
      border-color: var(--color-secondary);
    }
  }
}
</style>
