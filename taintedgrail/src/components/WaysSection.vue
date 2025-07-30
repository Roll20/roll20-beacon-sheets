<template>
	<div class="section ways">
	  <div class="section__body ways__body">
		<div class="ways__form">
			<div class="ways__avatar">
		  <img :src="meta.avatar || DEFAULT_AVATAR" />
		</div>
		<h3 class="ways__header">Color</h3>
		<select :id="`color`" v-model="bio.color">
			<option value="">None</option>
			<option value="blue">Blue</option>
            <option value="brown">Brown</option>
            <option value="gray">Gray</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
          </select>
		  <h3 class="ways__header">Ways</h3>
		  <div class="ways__list">
			<label for="combativeness">
				<span class="label">Combativeness</span>
				<input id="combativeness" v-model="bio.ways.combativeness" />
				<span class="label">Passion</span>
			</label>
			<label for="creativity">
				<span class="label">Creativity</span>
				<input id="creativity" v-model="bio.ways.creativity" />
				<span class="label">Subversion</span>
			</label>
			<label for="awareness">
				<span class="label">Awareness</span>
				<input id="awareness" v-model="bio.ways.awareness" />
				<span class="label">Influence</span>
			</label>
			<label for="reason">
				<span class="label">Reason</span>
				<input id="reason" v-model="bio.ways.reason" />
				<span class="label">Doubt</span>
			</label>
			<label for="conviction">
				<span class="label">Conviction</span>
				<input id="conviction" v-model="bio.ways.conviction" />
				<span class="label">Guilt</span>
			</label>
		  </div>
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { useMetaStore } from '@/sheet/stores/meta/metaStore';
  import { useBioStore } from '@/sheet/stores/bio/bioStore';

  const DEFAULT_AVATAR = new URL('@/assets/mystery-man.svg', import.meta.url).href;

  const meta = useMetaStore();
  const bio = useBioStore();
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
	}

	&__form {
		width: 110px;
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
			width: 110px ;
			box-sizing: border-box;
			text-align: center;
		}
	}
	
	.label {
	  font-weight: 600;
	  display: inline-block;
	}
	
	select {
		background: transparent;
		border: 1px solid #aaa;
		text-align: center;
		width: 100%;
		padding: 2px;
		
		&:focus {
			outline: none;
			background: rgba(255, 255, 255, 0.1);
		}
	}
  }
  </style>
  