<template>
	<div class="taintedgrail-sheet">
	  <div class="taintedgrail__header"></div>
	  	<div class="taintedgrail__main">
        <div class="taintedgrail__avatar">
          <img :src="meta.avatar && meta.avatar !== '' ? meta.avatar : DEFAULT_AVATAR_URL" />
        </div>
		<div class="taintedgrail__character">
		  <NPCBioSection />
		</div>
		<div class="taintedgrail__health">
		  <NPCHealthSection />
		</div>
		<div class="taintedgrail__stats">
		  <NPCStatsSection />
		</div>
		<div class="taintedgrail__traits">
		  <NPCTraitsSection />
		</div>
		<div class="taintedgrail__domains">
		  <NPCDomainsSection />
		</div>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  import { useTaintedGrailStore } from '@/sheet/stores';
  import NPCBioSection from '@/components/npc/NPCBioSection.vue';
  import NPCHealthSection from '@/components/npc/NPCHealthSection.vue';
  import NPCStatsSection from '@/components/npc/NPCStatsSection.vue';
  import NPCTraitsSection from '@/components/npc/NPCTraitsSection.vue';
  import NPCDomainsSection from '@/components/npc/NPCDomainsSection.vue';
  import { useMetaStore } from '@/sheet/stores/meta/metaStore';
  

  const DEFAULT_AVATAR_URL = new URL('@/assets/mystery-man.svg', import.meta.url).href;
  const meta = useMetaStore();
  useTaintedGrailStore();
  </script>
  
  <style scoped lang="scss">
  @use '../common/scss/vars.scss' as vars;
  
  .taintedgrail {
	&__main {
	  display: grid;
	  gap: 1rem;
	  padding: 0.75rem;
	  margin-bottom: 1rem;
	  grid-template-columns: 110px 1fr 1fr;
	  grid-template-rows: auto auto auto;
	  grid-template-areas:
		"avatar character health"
		"avatar stats stats"
		"avatar traits domains";
	  box-sizing: border-box;
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
  
	&__character {
	  display: flex;
	  flex-direction: column;
	  grid-area: character;
	}
  
	&__health {
	  display: flex;
	  flex-direction: column;
	  grid-area: health;
	}

	&__stats {
	  display: flex;
	  flex-direction: column;
	  grid-area: stats;
	}

	&__traits {
	  display: flex;
	  flex-direction: column;
	  grid-area: traits;
	}

	&__domains {
	  display: flex;
	  flex-direction: column;
	  grid-area: domains;
	}

	&__avatar {
	  grid-area: avatar;
	}
  }
  </style>
  