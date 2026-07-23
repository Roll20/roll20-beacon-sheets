<template>
  <div class="compact-wrapper bg-background font-lexend">

    
    <div class="compact-card max-w-[1440px] lg:columns-2 lg:gap-12 mx-auto p-6 text-sm leading-relaxed text-black">

      
      <div class="flex gap-4 items-start mb-4 break-inside-avoid">
        
        <img
          v-if="avatarValid"
          :src="sheet.meta.avatar"
          class="w-[100px] h-[100px] object-cover shrink-0 border-[3px] border-black"
          alt="Avatar"
        />

        <div class="flex-1 min-w-0">
          
          <div class="flex justify-between items-center border-b-4 border-black pb-2 mb-3">
            <LazyInput 
              v-if="editMode" 
              v-model="sheet.meta.name" 
              placeholder="Character Name" 
              class="font-space-grotesk font-black uppercase text-2xl tracking-widest leading-tight bg-transparent border-b-2 border-dashed border-zinc-300 focus:border-black focus:outline-none w-full mr-4" 
            />
            <h1 v-else class="font-space-grotesk font-black uppercase text-2xl tracking-widest leading-tight">
              {{ sheet.meta.name || 'Unnamed Character' }}
            </h1>
            <button
              type="button"
              @click="editMode = !editMode"
              class="print-invisible flex items-center gap-1.5 px-2 py-1 border-2 border-black font-space-grotesk font-black uppercase text-xs tracking-wider transition-colors shrink-0"
              :class="editMode ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'"
            >
              <span class="material-symbols-outlined text-sm leading-none">{{ editMode ? 'visibility' : 'edit' }}</span>
              {{ editMode ? 'View' : 'Edit' }}
            </button>
          </div>

          
          <p v-if="!editMode && sheet.biography.civilianName" class="text-xs text-zinc-800 mb-1 leading-relaxed">
            <strong class="font-space-grotesk font-black text-black">Name: </strong>{{ sheet.biography.civilianName }}
          </p>

          
          <div v-if="!editMode && sheet.biography.about" class="text-xs text-zinc-600 mb-3 leading-normal prose prose-sm max-w-none prose-zinc prose-p:my-1" v-html="DOMPurify.sanitize(md.render(sheet.biography.about))"></div>

          
          <div v-if="!editMode" class="flex flex-wrap gap-x-4 gap-y-1 leading-relaxed text-zinc-800">
            <span v-if="sheet.biography.role">
              <strong class="font-space-grotesk font-black text-black">Role:</strong> <span class="capitalize">{{ sheet.biography.role }}</span>
            </span>
            <span v-if="sheet.biography.personalDossier.occupation">
              <strong class="font-space-grotesk font-black text-black">Occupation:</strong> {{ sheet.biography.personalDossier.occupation }}
            </span>
            <span v-if="sheet.biography.personalDossier.personality">
              <strong class="font-space-grotesk font-black text-black">Personality:</strong> {{ sheet.biography.personalDossier.personality }}
            </span>
            <span v-if="sheet.biography.personalDossier.drive">
              <strong class="font-space-grotesk font-black text-black">Drive:</strong> {{ sheet.biography.personalDossier.drive }}
            </span>
            <span v-if="sheet.biography.personalDossier.flaw">
              <strong class="font-space-grotesk font-black text-black">Flaw:</strong> {{ sheet.biography.personalDossier.flaw }}
            </span>
          </div>
          
          <div v-else class="flex flex-col gap-2">
            <div class="flex items-center gap-2 mb-2">
              <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Civ. Name</strong>
              <LazyInput v-model="sheet.biography.civilianName" type="text" placeholder="Civilian Name..." class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm" />
            </div>
            <div class="flex items-start gap-2 mb-2">
              <strong class="font-space-grotesk font-black uppercase shrink-0 w-24 mt-1.5">About</strong>
              <div class="flex-1 min-w-0 bg-white">
                <MarkdownEditor v-model="sheet.biography.about" height="150px" />
              </div>
            </div>
            <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Role</strong>
          <SelectWithCustom
            v-model="sheet.biography.role"
            class="flex-1"
            :options="[
              { value: 'blaster', label: $t('roles.blaster') },
              { value: 'brains', label: $t('roles.brains') },
              { value: 'brawn', label: $t('roles.brawn') },
              { value: 'controller', label: $t('roles.controller') },
              { value: 'defender', label: $t('roles.defender') },
              { value: 'leader', label: $t('roles.leader') },
              { value: 'striker', label: $t('roles.striker') },
              { value: 'wildcard', label: $t('roles.wildcard') }
            ]"
            :placeholder="$t('roles.select_role')"
            spanClass="block w-full font-space-grotesk font-bold text-zinc-700 bg-transparent text-sm p-0 border-b-2 border-zinc-200 pb-0.5 cursor-pointer text-left"
            selectClass="w-full font-space-grotesk font-bold text-zinc-700 bg-transparent focus:outline-none text-sm p-0 border-b-2 border-black pb-0.5 cursor-pointer appearance-none"
            inputClass="w-full font-space-grotesk font-bold text-zinc-700 bg-transparent focus:outline-none text-sm p-0 border-b-2 border-black pb-0.5"
          />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Occupation</strong>
          <LazyInput v-model="sheet.biography.personalDossier.occupation" type="text" class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm" />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Personality</strong>
          <LazyInput v-model="sheet.biography.personalDossier.personality" type="text" class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm" />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Drive</strong>
          <LazyInput v-model="sheet.biography.personalDossier.drive" type="text" class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm" />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Flaw</strong>
          <LazyInput v-model="sheet.biography.personalDossier.flaw" type="text" class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm" />
        </div>
      </div>
      </div>
      </div>
      <div class="border-t border-zinc-300 my-3" />

      
      <div v-if="!editMode && (Number(reputationModified.value) > 0 || Number(resourcesModified.value) > 0)" class="flex gap-6 mb-3 break-inside-avoid">
        <RollButton
          v-if="Number(reputationModified.value) > 0"
          :characterName="sheet.meta.name"
          :title="`Reputation Check`"
          :components="reputationRollComponents"
          :solver="actionRollSolver"
          class="cursor-pointer hover:text-primary transition-colors group"
        >
          <strong class="font-space-grotesk font-black uppercase text-black group-hover:text-primary transition-colors">Reputation:</strong> 
          {{ reputationModified.value }}
        </RollButton>
        <span v-if="Number(resourcesModified.value) > 0">
          <strong class="font-space-grotesk font-black uppercase text-black">Resources:</strong> 
          {{ resourcesModified.value }}
        </span>
      </div>
      <div v-else-if="editMode" class="flex flex-col gap-2 mb-3 break-inside-avoid">
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Reputation</strong>
          <ModifiedValueInput
            :modifiedValue="reputationModified"
            @update:baseValue="sheet.biography.reputation = String($event)"
            class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
            unstyled
            :min="0"
            :max="6"
          />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">Resources</strong>
          <ModifiedValueInput
            :modifiedValue="resourcesModified"
            @update:baseValue="sheet.biography.resources = Number($event)"
            class="flex-1 bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
            unstyled
            :min="0"
            :max="6"
          />
        </div>
      </div>

      <div v-if="editMode || Number(reputationModified.value) > 0 || Number(resourcesModified.value) > 0" class="border-t border-zinc-300 my-3" />

      
      <div v-if="editMode" class="grid grid-cols-2 gap-x-8 gap-y-2 mb-3 break-inside-avoid">
        
        <div class="flex flex-col gap-2">
          <template v-for="attr in abilityList.slice(0, 3)" :key="attr.key">
            <div class="flex items-center gap-2">
              <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">{{ attr.label }}</strong>
              <ModifiedValueInput
                :modifiedValue="abilitiesModified[attr.key].value"
                @update:baseValue="sheet.abilities[attr.key] = Number($event)"
                class="flex-1 w-full bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
                unstyled
              />
            </div>
          </template>
        </div>
        <!-- Right Column -->
        <div class="flex flex-col gap-2">
          <template v-for="attr in abilityList.slice(3, 6)" :key="attr.key">
            <div class="flex items-center gap-2">
              <strong class="font-space-grotesk font-black uppercase shrink-0 w-24">{{ attr.label }}</strong>
              <ModifiedValueInput
                :modifiedValue="abilitiesModified[attr.key].value"
                @update:baseValue="sheet.abilities[attr.key] = Number($event)"
                class="flex-1 w-full bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
                unstyled
              />
            </div>
          </template>
        </div>
      </div>
      <div v-else class="mb-3 leading-relaxed break-inside-avoid">
        <template v-for="(attr, index) in abilityList" :key="attr.key">
          <RollButton
            :characterName="sheet.meta.name"
            :title="`${attr.label} Roll`"
            :components="[{ rollFormula: `${abilitiesModified[attr.key].value.value}d6`, label: attr.label }]"
            :solver="actionRollSolver"
            class="inline cursor-pointer hover:text-primary transition-colors group"
          ><span class="whitespace-nowrap"><span class="text-zinc-500 mr-1">{{ abilityRank(abilitiesModified[attr.key].value.value) }} </span><strong class="font-space-grotesk font-black uppercase group-hover:text-primary transition-colors">{{ attr.label }}</strong> {{ abilitiesModified[attr.key].value.value }}</span></RollButton>
          <span v-if="index < abilityList.length - 1" class="text-zinc-400">, </span>
        </template>
      </div>

      <div class="border-t border-zinc-300 my-3" />

      <!-- COMBAT STATS -->
      <div v-if="!editMode" class="flex flex-wrap gap-x-6 gap-y-2 mb-3 break-inside-avoid">
        <span class="flex items-baseline gap-1">
          <strong class="font-space-grotesk font-black text-black uppercase">Health:</strong> 
          <LazyInput v-model.number="sheet.combat.health" class="print-transparent w-8 text-center bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none font-bold text-sm" /> 
          <span>/ {{ healthMaxModified.value }}</span>
        </span>
        <span class="flex items-baseline gap-1">
          <strong class="font-space-grotesk font-black text-black uppercase">Resolve:</strong> 
          <LazyInput v-model.number="sheet.combat.resolve" class="print-transparent w-8 text-center bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none font-bold text-sm" /> 
          <span>/ {{ resolveMaxModified.value }}</span>
        </span>
        <RollButton
          :characterName="sheet.meta.name"
          :title="$t('sheet.slugfest_attack')"
          :components="slugfestRollComponents"
          :solver="actionDamageRollSolver"
          class="flex items-baseline gap-1 cursor-pointer hover:text-primary transition-colors group"
        >
          <strong class="font-space-grotesk font-black text-black uppercase group-hover:text-primary transition-colors">Slugfest:</strong> 
          <span>{{ slugfestDamageModified.value }}</span>
        </RollButton>
      </div>
      <div v-else class="grid grid-cols-3 gap-6 mb-3 break-inside-avoid">
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0">Health</strong>
          <ModifiedValueInput
            :modifiedValue="healthMaxModified"
            @update:baseValue="sheet.combat.health_max = Number($event)"
            class="flex-1 w-full bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
            unstyled
          />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0">Resolve</strong>
          <ModifiedValueInput
            :modifiedValue="resolveMaxModified"
            @update:baseValue="sheet.combat.resolve_max = Number($event)"
            class="flex-1 w-full bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
            unstyled
          />
        </div>
        <div class="flex items-center gap-2">
          <strong class="font-space-grotesk font-black uppercase shrink-0">Slugfest</strong>
          <ModifiedValueInput
            :modifiedValue="slugfestDamageModified"
            @update:baseValue="sheet.combat.slugfest_damage = Number($event)"
            class="flex-1 w-full bg-transparent border-b-2 border-zinc-200 focus:border-black focus:outline-none transition-colors font-space-grotesk font-bold text-zinc-700 pb-0.5 text-sm"
            unstyled
          />
        </div>
      </div>

      <div class="border-t border-zinc-300 my-3" />

      <!-- INJURIES -->
      <div v-if="sheet.combat.criticalInjuries.length > 0" class="mb-4 break-inside-avoid">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Injuries</h3>
        </div>
        <p class="text-sm text-zinc-700 leading-relaxed">
          <template v-for="(injury, index) in sheet.combat.criticalInjuries" :key="injury._id || index">
            <span v-if="!editMode" v-tooltip="getInjuryTooltip(injury)" class="cursor-help">{{ injury.name }}</span>
            <span v-else class="inline-flex items-center gap-0.5 bg-zinc-100 px-1.5 rounded">
              {{ injury.name }}
              <button @click="handleDeleteInjury(index)" type="button" class="text-zinc-500 hover:text-red-600 flex items-center leading-none" v-tooltip="'Delete'"><span class="material-symbols-outlined text-[14px]">delete</span></button>
            </span><span v-if="index < sheet.combat.criticalInjuries.length - 1">, </span>
          </template>
        </p>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

      <!-- ACTIONS -->
      <div class="mb-4 break-inside-avoid" v-if="editMode || visibleActions.length > 0">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Actions</h3>
          <button v-if="editMode" @click="handleAddAction('quick')" class="compact-add-btn" type="button"><span class="material-symbols-outlined text-[1rem] leading-none">add</span></button>
        </div>
        <div v-if="visibleActions.length === 0" class="text-zinc-400 italic text-sm">No actions.</div>
        <div v-else class="space-y-3">
          <div v-if="quickActions.length > 0">
            <h4 class="font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500 mb-1">Quick Actions</h4>
            <div class="leading-relaxed text-sm text-zinc-700">
              <template v-for="(action, index) in quickActions" :key="action._id">
                <span v-if="!editMode && action.attributeUsed && action.attributeUsed !== '-'" class="inline-block" v-tooltip="getActionTooltip(action)">
                  <RollButton
                    :characterName="sheet.meta.name"
                    :title="action.name"
                    :isQuery="action.attributeUsed === 'varies'"
                    :components="action._components"
                    :solver="action.damage ? actionDamageRollSolver : actionRollSolver"
                    class="cursor-pointer hover:text-primary transition-colors group inline"
                  >
                    <strong class="uppercase text-black group-hover:text-primary transition-colors text-sm font-black">{{ action.name }}</strong>
                    <span v-if="action.bonus || action.damage" class="text-zinc-500 text-sm ml-0.5 whitespace-nowrap group-hover:text-primary transition-colors">(<span v-if="action.bonus">bonus +{{ action.bonus }}</span><span v-if="action.bonus && action.damage">, </span><span v-if="action.damage">damage {{ action.damage }}</span>)</span>
                  </RollButton>
                </span>
                <span
                  v-else
                  v-tooltip="editMode ? 'Edit' : getActionTooltip(action)"
                  :class="[editMode ? 'cursor-pointer hover:bg-zinc-50 px-0.5 rounded' : (getActionTooltip(action) ? 'cursor-help' : ''), 'inline']"
                  @click="editMode ? handleEditAction(action) : undefined"
                >
                  <strong class="uppercase text-black text-sm font-black">{{ action.name }}</strong>
                  <span v-if="action.bonus || action.damage" class="text-zinc-500 text-sm ml-0.5 whitespace-nowrap">(<span v-if="action.bonus">bonus +{{ action.bonus }}</span><span v-if="action.bonus && action.damage">, </span><span v-if="action.damage">damage {{ action.damage }}</span>)</span>
                </span><span v-if="index < quickActions.length - 1" class="text-zinc-400 mr-1.5">, </span>
              </template>
            </div>
          </div>

          <div v-if="fullActions.length > 0">
            <h4 class="font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500 mb-1">Full Actions</h4>
            <div class="leading-relaxed text-sm text-zinc-700">
              <template v-for="(action, index) in fullActions" :key="action._id">
                <span v-if="!editMode && action.attributeUsed && action.attributeUsed !== '-'" class="inline-block" v-tooltip="getActionTooltip(action)">
                  <RollButton
                    :characterName="sheet.meta.name"
                    :title="action.name"
                    :isQuery="action.attributeUsed === 'varies'"
                    :components="action._components"
                    :solver="action.damage ? actionDamageRollSolver : actionRollSolver"
                    class="cursor-pointer hover:text-primary transition-colors group inline"
                  >
                    <strong class="uppercase text-black group-hover:text-primary transition-colors text-sm font-black">{{ action.name }}</strong>
                    <span v-if="action.bonus || action.damage" class="text-zinc-500 text-sm ml-0.5 whitespace-nowrap group-hover:text-primary transition-colors">(<span v-if="action.bonus">bonus +{{ action.bonus }}</span><span v-if="action.bonus && action.damage">, </span><span v-if="action.damage">damage {{ action.damage }}</span>)</span>
                  </RollButton>
                </span>
                <span
                  v-else
                  v-tooltip="editMode ? 'Edit' : getActionTooltip(action)"
                  :class="[editMode ? 'cursor-pointer hover:bg-zinc-50 px-0.5 rounded' : (getActionTooltip(action) ? 'cursor-help' : ''), 'inline']"
                  @click="editMode ? handleEditAction(action) : undefined"
                >
                  <strong class="uppercase text-black text-sm font-black">{{ action.name }}</strong>
                  <span v-if="action.bonus || action.damage" class="text-zinc-500 text-sm ml-0.5 whitespace-nowrap">(<span v-if="action.bonus">bonus +{{ action.bonus }}</span><span v-if="action.bonus && action.damage">, </span><span v-if="action.damage">damage {{ action.damage }}</span>)</span>
                </span><span v-if="index < fullActions.length - 1" class="text-zinc-400 mr-1.5">, </span>
              </template>
            </div>
          </div>
        </div>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

      <!-- POWERS -->
      <div class="mb-4 break-inside-avoid" v-if="editMode || sheet.powers.list.length > 0 || sheet.powers.powerSourceDescription">
        
        <!-- POWER SOURCE -->
        <div v-if="editMode || sheet.powers.powerSourceDescription" class="mb-3">
          <div v-if="editMode">
            <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest mb-1">Power Source</h3>
            <div class="bg-white">
              <MarkdownEditor v-model="sheet.powers.powerSourceDescription" height="120px" />
            </div>
          </div>
          <div v-else class="text-sm text-zinc-700 leading-relaxed">
            <strong class="font-space-grotesk font-black uppercase mb-1 block">POWER SOURCE: </strong>
            <div class="prose prose-sm max-w-none prose-zinc prose-p:my-1" v-html="DOMPurify.sanitize(md.render(sheet.powers.powerSourceDescription))"></div>
          </div>
        </div>

        <div v-if="(editMode || sheet.powers.powerSourceDescription) && (editMode || sheet.powers.list.length > 0)" class="border-t border-zinc-300 my-3" />

        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Known Powers</h3>
          <button v-if="editMode" @click="handleAddPower" class="compact-add-btn" type="button"><span class="material-symbols-outlined text-[1rem] leading-none">add</span></button>
        </div>
        <div v-if="sheet.powers.list.length === 0" class="text-zinc-400 italic text-sm">No powers listed.</div>
        <ul v-else class="space-y-2 text-sm">
          <li
            v-for="power in sheet.powers.list"
            :key="power._id"
            class="flex flex-col gap-1"
            :class="editMode ? 'cursor-pointer hover:bg-zinc-50 -mx-1 px-1 py-1 ' : ''"
            @click="editMode ? handleEditPower(power) : undefined"
            v-tooltip="editMode ? 'Edit' : undefined"
          >
            <div class="flex gap-2 items-start">
              <span class="mt-0.5 shrink-0 font-bold text-zinc-500">✻</span>
              <div class="min-w-0 leading-relaxed text-zinc-700">
                <strong class="font-space-grotesk font-black text-black">{{ power.name }}:</strong>
                <span v-if="power.description"> {{ power.description }}</span>
              </div>
            </div>
            
            <div v-if="!editMode && power.modifiers && power.modifiers.length > 0" class="flex flex-col ml-4 gap-0.5 text-zinc-600">
              <div v-for="modifier in power.modifiers" :key="modifier._id" class="flex gap-1.5 items-start">
                <span class="material-symbols-outlined shrink-0 self-center !text-[10px]">adjust</span>
                <span class="leading-relaxed">
                  <strong class="capitalize font-bold">{{ modifier.type }}: </strong>
                  <span>{{ modifier.name }}</span>
                </span>
              </div>
            </div>
          </li>
        </ul>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

      <!-- TALENTS -->
      <div class="mb-4 break-inside-avoid" v-if="editMode || sheet.features.list.length > 0">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Known Talents</h3>
          <button v-if="editMode" @click="handleAddFeature" class="compact-add-btn" type="button"><span class="material-symbols-outlined text-[1rem] leading-none">add</span></button>
        </div>
        <div v-if="sheet.features.list.length === 0" class="text-zinc-400 italic text-sm">No talents listed.</div>
        <p v-else class="text-sm text-zinc-700 leading-relaxed">
          <template v-for="(feature, index) in sheet.features.list" :key="feature._id">
            <span
              v-tooltip="editMode ? 'Edit' : getItemTooltip(feature)"
              :class="editMode ? 'cursor-pointer hover:bg-zinc-50 rounded px-0.5' : (getItemTooltip(feature) ? 'cursor-help' : '')"
              @click="editMode ? handleEditFeature(feature) : undefined"
            >{{ feature.name }}</span><span v-if="index < sheet.features.list.length - 1">, </span>
          </template>
        </p>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

      <!-- DRAWBACKS -->
      <div class="mb-4 break-inside-avoid" v-if="editMode || sheet.biography.drawbacks">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Drawbacks</h3>
        </div>
        <div v-if="editMode" class="mt-2">
          <MarkdownEditor v-model="sheet.biography.drawbacks" height="120px" />
        </div>
        <div v-else class="text-sm text-zinc-700 leading-relaxed prose prose-sm max-w-none prose-zinc prose-p:my-1" v-html="DOMPurify.sanitize(md.render(sheet.biography.drawbacks))"></div>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

      <!-- SPECIAL -->
      <div class="mb-4 break-inside-avoid" v-if="editMode || sheet.biography.special">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Special</h3>
        </div>
        <div v-if="editMode" class="mt-2">
          <MarkdownEditor v-model="sheet.biography.special" height="120px" />
        </div>
        <div v-else class="text-sm text-zinc-700 leading-relaxed prose prose-sm max-w-none prose-zinc prose-p:my-1" v-html="DOMPurify.sanitize(md.render(sheet.biography.special))"></div>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

      <!-- GEAR -->
      <div v-if="sheet.gear.list.length > 0 || editMode" class="mb-4 break-inside-avoid">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-space-grotesk font-black uppercase text-sm tracking-widest">Gear</h3>
          <button v-if="editMode" @click="handleAddGear" class="compact-add-btn" type="button"><span class="material-symbols-outlined text-[1rem] leading-none">add</span></button>
        </div>
        <div v-if="sheet.gear.list.length === 0" class="text-zinc-400 italic text-sm">No gear listed.</div>
        <p v-else class="text-sm text-zinc-700 leading-relaxed">
          <template v-for="(gear, index) in sheet.gear.list" :key="gear._id">
            <span
              v-tooltip="editMode ? 'Edit' : getItemTooltip(gear)"
              :class="editMode ? 'cursor-pointer hover:bg-zinc-50 rounded px-0.5' : (getItemTooltip(gear) ? 'cursor-help' : '')"
              @click="editMode ? handleEditGear(gear) : undefined"
            >{{ gear.name }}</span><span v-if="index < sheet.gear.list.length - 1">, </span>
          </template>
        </p>
        <div class="border-t border-zinc-300 mt-4" />
      </div>

    </div>

    <!-- ── Modals ──────────────────────────────────────────── -->
    <EditFeatureModal
      :show="isEditFeatureModalOpen"
      :feature="editingFeature"
      :isNew="isNewFeature"
      @close="isEditFeatureModalOpen = false"
      @save="handleSaveFeature"
      @delete="handleDeleteFeature"
    />

    <EditActionModal
      :show="isActionModalOpen"
      :action="editingAction"
      :isNew="isNewAction"
      @close="isActionModalOpen = false"
      @save="handleSaveAction"
      @delete="handleDeleteAction"
    />

    <EditPowerModal
      :show="isPowerModalOpen"
      :power="editingPower"
      :isNew="isNewPower"
      @close="isPowerModalOpen = false"
      @save="handleSavePower"
      @delete="handleDeletePower"
    />

    <EditGearModal
      :show="isGearModalOpen"
      :gear="editingGear"
      :isNew="isNewGear"
      @close="isGearModalOpen = false"
      @save="handleSaveGear"
      @delete="handleDeleteGear"
    />

    <div v-if="cheatMode" class="max-w-[1440px] mx-auto pb-6">
      <SandboxSection />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { characterStore } from '@/sheet/stores';
import { actionRollSolver, actionDamageRollSolver } from '@/system/rolls/action';
import SandboxSection from '@/sections/SandboxSection.vue';
import { ruleSets } from '@/system';
import { calculateRollComponents } from '@/system/effects/calculateRollComponents';
import { useI18n } from 'vue-i18n';
import RollButton from '@/components/RollButton.vue';
import EditFeatureModal from '@/sections/EditFeatureModal.vue';
import EditActionModal from '@/sections/EditActionModal.vue';
import EditPowerModal from '@/sections/EditPowerModal.vue';
import EditGearModal from '@/sections/EditGearModal.vue';
import type { FeatureItem } from '@/schemas/hydrate/features';
import type { ActionItem } from '@/schemas/hydrate/actions';
import type { PowerItem } from '@/schemas/hydrate/powers';
import type { GearItem } from '@/schemas/hydrate/gear';
import type { InjuryItem } from '@/schemas/hydrate/injury';
import SelectWithCustom from '@/components/SelectWithCustom.vue';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';
import LazyInput from '@/components/LazyInput.vue';
import LazyTextarea from '@/components/LazyTextarea.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const sheet = characterStore();
const { t } = useI18n();

const getInjuryTooltip = (injury: InjuryItem) => {
  let content = '';
  if (injury.healingTime) content += `<strong class="font-bold">Healing Time:</strong> ${injury.healingTime}<br/>`;
  if (injury.description) content += `<strong class="font-bold">Description:</strong> ${injury.description}<br/>`;
  if (injury.effects && injury.effects.value && injury.effects.value.length > 0) {
    const mods = injury.effects.value.map((eff: any) => {
      let attrName = eff.label;
      if (!attrName && eff.attribute) {
         const tKey = `modifiers.${eff.attribute}`;
         const translated = t(tKey);
         attrName = translated !== tKey ? translated : eff.attribute;
      }
      return `${attrName}: ${eff.operation === 'add' && eff.value >= 0 ? '+' : ''}${eff.value}`;
    });
    content += `<strong class="font-bold">Modifiers:</strong> ${mods.join(', ')}<br/>`;
  }
  return content ? { content, html: true } : undefined;
};

const handleDeleteInjury = (index: number) => {
  sheet.combat.criticalInjuries.splice(index, 1);
};

const editMode = ref(false);

const avatarValid = ref(false);
watch(() => sheet.meta.avatar, (url) => {
  if (!url) {
    avatarValid.value = false;
    return;
  }
  const img = new Image();
  img.onload = () => { avatarValid.value = true; };
  img.onerror = () => { avatarValid.value = false; };
  img.src = url;
}, { immediate: true });

const reputationModified = computed(() => ruleSets.reputation());
const resourcesModified = computed(() => ruleSets.resources());

const reputationRollComponents = computed(() => {
  return [
    { label: t('sheet.reputation'), rollFormula: `${reputationModified.value.value}d6` }
  ];
});

const healthMaxModified = computed(() => ruleSets.health_max());
const resolveMaxModified = computed(() => ruleSets.resolve_max());
const slugfestDamageModified = computed(() => ruleSets.slugfest_damage());

const fighting = computed(() => ruleSets.fighting().value || 0);
const slugfestDamage = computed(() => { 
  const dmg = slugfestDamageModified.value;
  if(dmg.error) return 0;
  return Number(dmg.value) || 0;
});

const actionComponents = computed(() => {
  return calculateRollComponents({
    attributes: ['fighting_roll' as any],
    baseComponents: [
      { rollFormula: `${fighting.value}d6`, label: 'Fighting' }
    ],
  });
});

const damageComponents = computed(() => {
  return calculateRollComponents({
    attributes: ['slugfest_damage_roll' as any, 'slugfest_damage' as any],
    baseComponents: [
      { value: slugfestDamage.value, label: t('sheet.slugfest_dmg') }
    ],
  });
});

const slugfestRollComponents = computed(() => {
  return {
    action: actionComponents.value,
    damage: damageComponents.value,
  };
});

const getItemTooltip = (item: any) => {
  if (!item.type && !item.description) return undefined;
  let content = '';
  if (item.type) content += `<strong class="capitalize">${item.type}</strong><br/>`;
  if (item.description) content += item.description;
  return content ? { content, html: true } : undefined;
};

const getActionTooltip = (action: any) => {
  if (!action.description) return undefined;
  const dirtyHtml = md.render(action.description);
  return { content: DOMPurify.sanitize(dirtyHtml), html: true };
};

const cheatMode = ref(false);
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.repeat) return;
  if ((e.ctrlKey || e.metaKey) && e.code === 'Backquote') {
    e.preventDefault();
    cheatMode.value = !cheatMode.value;
  }
};
onMounted(() => document.addEventListener('keydown', handleKeyDown));
onUnmounted(() => document.removeEventListener('keydown', handleKeyDown));

const RANKS: Record<number, string> = {
  1: 'Typical', 2: 'Typical', 3: 'Good', 4: 'Great',
  5: 'Extraordinary', 6: 'Incredible', 7: 'Amazing', 8: 'Spectacular',
};
const abilityRank = (val: number | string) => {
  const n = Number(val);
  return RANKS[n] ?? (n > 8 ? 'Phenomenal' : 'Typical');
};

const abilityList = [
  { key: 'fighting' as const,  label: 'Fighting'  },
  { key: 'agility' as const,   label: 'Agility'   },
  { key: 'strength' as const,  label: 'Strength'  },
  { key: 'reason' as const,    label: 'Reason'    },
  { key: 'intuition' as const, label: 'Intuition' },
  { key: 'presence' as const,  label: 'Presence'  },
] as const;

const abilitiesModified = {
  fighting: computed(() => ruleSets.fighting()),
  agility: computed(() => ruleSets.agility()),
  strength: computed(() => ruleSets.strength()),
  reason: computed(() => ruleSets.reason()),
  intuition: computed(() => ruleSets.intuition()),
  presence: computed(() => ruleSets.presence()),
};

const buildActionComponents = (action: ActionItem) => {
  const attr = action.attributeUsed;
  let baseDice = 0;
  let label = 'Base';
  if (attr && attr !== '-' && attr !== 'varies') {
    const fn = ruleSets[attr as keyof typeof ruleSets] as () => { value: number | string };
    baseDice = Number(fn().value) || 0;
    label = t(`sheet.${attr}`);
  }
  return [
    ...(attr !== 'varies' ? [{ rollFormula: `${baseDice}d6`, label }] : []),
    ...(action.bonus ? [{ rollFormula: `${action.bonus}d6`, label: 'Bonus' }] : []),
  ];
};

const buildActionDamageComponents = (action: ActionItem) => {
  const attr = action.attributeUsed;
  let baseDice = 0;
  let label = 'Base';
  if (attr && attr !== '-' && attr !== 'varies') {
    const fn = ruleSets[attr as keyof typeof ruleSets] as () => { value: number | string };
    baseDice = Number(fn().value) || 0;
    label = t(`sheet.${attr}`);
  }
  return {
    action: [
      ...(attr !== 'varies' ? [{ rollFormula: `${baseDice}d6`, label }] : []),
      ...(action.bonus ? [{ rollFormula: `${action.bonus}d6`, label: 'Bonus' }] : []),
    ],
    damage: [{ rollFormula: action.damage || '0', label: 'Damage' }],
  };
};

const visibleActions = computed(() =>
  sheet.actions.list
    .filter(a => !a.isDefault)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map(a => ({
      ...a,
      _components: a.damage ? buildActionDamageComponents(a) : buildActionComponents(a)
    }))
);

const quickActions = computed(() => visibleActions.value.filter(a => a.type === 'quick'));
const fullActions = computed(() => visibleActions.value.filter(a => a.type === 'full'));

const isEditFeatureModalOpen = ref(false);
const editingFeature = ref<FeatureItem | null>(null);
const isNewFeature = ref(false);

const handleEditFeature = (feature: FeatureItem) => {
  isNewFeature.value = false;
  editingFeature.value = feature;
  isEditFeatureModalOpen.value = true;
};

const handleAddFeature = () => {
  const f: FeatureItem = { _id: uuidv4(), name: 'New Feature', type: 'talent', description: '', effects: { value: [] } };
  isNewFeature.value = true;
  editingFeature.value = f;
  isEditFeatureModalOpen.value = true;
};

const handleSaveFeature = (updated: FeatureItem) => {
  if (isNewFeature.value) {
    sheet.features.list.push(updated);
    isNewFeature.value = false;
  } else {
    const i = sheet.features.list.findIndex(f => f._id === updated._id);
    if (i !== -1) sheet.features.list[i] = { ...updated };
  }
  isEditFeatureModalOpen.value = false;
  editingFeature.value = null;
};

const handleDeleteFeature = (id: string) => {
  sheet.deleteEntity(id);
  isEditFeatureModalOpen.value = false;
  editingFeature.value = null;
};

const isActionModalOpen = ref(false);
const editingAction = ref<ActionItem | null>(null);
const isNewAction = ref(false);

const handleEditAction = (action: ActionItem) => {
  isNewAction.value = false;
  editingAction.value = action;
  isActionModalOpen.value = true;
};

const handleAddAction = (type: 'quick' | 'full') => {
  const a: ActionItem = { _id: uuidv4(), name: 'New Action', type, attributeUsed: '-', bonus: 0, range: '-', damage: '', description: '', specialFeatures: '', isDefault: false, isActive: true };
  isNewAction.value = true;
  editingAction.value = a;
  isActionModalOpen.value = true;
};

const handleSaveAction = (updated: ActionItem) => {
  if (isNewAction.value) {
    sheet.actions.list.push(updated);
    isNewAction.value = false;
  } else {
    const i = sheet.actions.list.findIndex(a => a._id === updated._id);
    if (i !== -1) sheet.actions.list[i] = { ...updated };
  }
  isActionModalOpen.value = false;
  editingAction.value = null;
};

const handleDeleteAction = (id: string) => {
  sheet.deleteEntity(id);
  isActionModalOpen.value = false;
  editingAction.value = null;
};

const isPowerModalOpen = ref(false);
const editingPower = ref<PowerItem | null>(null);
const isNewPower = ref(false);

const handleEditPower = (power: PowerItem) => {
  isNewPower.value = false;
  editingPower.value = power;
  isPowerModalOpen.value = true;
};

const handleAddPower = () => {
  const p: PowerItem = { _id: uuidv4(), name: 'New Power', description: '', effects: { value: [] }, modifiers: [] };
  isNewPower.value = true;
  editingPower.value = p;
  isPowerModalOpen.value = true;
};

const handleSavePower = (updated: PowerItem) => {
  if (isNewPower.value) {
    sheet.powers.list.push(updated);
    isNewPower.value = false;
  } else {
    const i = sheet.powers.list.findIndex(p => p._id === updated._id);
    if (i !== -1) sheet.powers.list[i] = { ...updated };
  }
  isPowerModalOpen.value = false;
  editingPower.value = null;
};

const handleDeletePower = (id: string) => {
  sheet.deleteEntity(id);
  isPowerModalOpen.value = false;
  editingPower.value = null;
};

const isGearModalOpen = ref(false);
const editingGear = ref<GearItem | null>(null);
const isNewGear = ref(false);

const handleEditGear = (gear: GearItem) => {
  isNewGear.value = false;
  editingGear.value = gear;
  isGearModalOpen.value = true;
};

const handleAddGear = () => {
  const g: GearItem = { _id: uuidv4(), name: 'New Gear', type: 'other', description: '', effects: { value: [] }, isActive: true };
  isNewGear.value = true;
  editingGear.value = g;
  isGearModalOpen.value = true;
};

const handleSaveGear = (updated: GearItem) => {
  if (isNewGear.value) {
    sheet.gear.list.push(updated);
    isNewGear.value = false;
  } else {
    const i = sheet.gear.list.findIndex(g => g._id === updated._id);
    if (i !== -1) sheet.gear.list[i] = { ...updated };
  }
  isGearModalOpen.value = false;
  editingGear.value = null;
};

const handleDeleteGear = (id: string) => {
  sheet.deleteEntity(id);
  isGearModalOpen.value = false;
  editingGear.value = null;
};
</script>

<style lang="scss" scoped>
.compact-wrapper {
}

.compact-card {
  background: white;
}

.compact-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 1.4rem;
  height: 1.4rem;
  border: 2px solid black;
  background: white;
  font-family: var(--font-space-grotesk);
  font-weight: 900;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;

  &:hover {
    background: black;
    color: white;
  }

  .material-symbols-outlined {
    font-size: 1rem !important;
    line-height: 1 !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media print {
  .print-invisible {
    visibility: hidden!important;
  }
  .print-transparent {
    color: transparent !important;
  }
  .print-none {
    display: none !important;
  }
}
</style>
