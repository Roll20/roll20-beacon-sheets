<template>
  <div v-if="entity" class="cru-builder">
    <nav class="cru-builder__tabs">
      <button
        v-for="step in builder.steps"
        :key="step"
        class="tof-small cru-builder__tab"
        :class="{ on: builder.currentStep === step }"
        @click="builder.goTo(step)"
      >
        {{ BUILDER_STEP_LABELS[step] }}
      </button>
    </nav>

    <div class="cru-builder__body">
      <!-- ============================== Concept ============================ -->
      <section v-if="builder.currentStep === 'concept'" class="tof-panel">
        <h3 class="tof-h2">Concept</h3>
        <div class="cru-form">
          <label class="tof-label"
            >Name
            <input
              class="tof-input"
              :value="entity.identity.name"
              @input="patchIdentity('name', $event)"
            />
          </label>
          <label class="tof-label"
            >Kind
            <select class="tof-select" :value="entity.kind" @change="setKind($event)">
              <option v-for="k in ENTITY_KINDS" :key="k" :value="k">
                {{ ENTITY_KIND_LABELS[k] }}
              </option>
            </select>
          </label>
          <label class="tof-label cru-form__wide"
            >Concept (one line)
            <input
              class="tof-input"
              :value="entity.identity.concept"
              @input="patchIdentity('concept', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Description (players may see this)
            <textarea
              class="tof-textarea"
              rows="4"
              :value="entity.identity.description"
              @input="patchIdentity('description', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >GM notes (never shown to players)
            <textarea
              class="tof-textarea"
              rows="3"
              :value="entity.identity.gmNotes"
              @input="patchIdentity('gmNotes', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Apply a template
            <div class="cru-form__row">
              <select v-model="templatePick" class="tof-select">
                <option value="">Choose a template overlay...</option>
                <option v-for="t in CREATURE_TEMPLATES" :key="t.id" :value="t.id">
                  {{ t.name }} (TR {{ t.threatRatingDelta >= 0 ? '+' : ''
                  }}{{ t.threatRatingDelta }})
                </option>
              </select>
              <button
                class="tof-btn tof-btn--ghost"
                :disabled="!templatePick"
                @click="applyTemplate"
              >
                Apply
              </button>
            </div>
            <span
              v-if="entity.creationContext.appliedTemplateIds.length"
              class="tof-small tof-muted"
            >
              Applied: {{ entity.creationContext.appliedTemplateIds.join(', ') }}
            </span>
          </label>
        </div>
      </section>

      <!-- ========================== Classification ========================= -->
      <section v-else-if="builder.currentStep === 'classification'" class="tof-panel">
        <h3 class="tof-h2">Classification</h3>
        <div class="cru-form">
          <label class="tof-label"
            >Size
            <select
              class="tof-select"
              :value="entity.classification.sizeId"
              @change="setSize($event)"
            >
              <option v-for="s in CREATURE_SIZES" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.grid }}, {{ s.hitDie }})
              </option>
            </select>
          </label>
          <label class="tof-label cru-form__wide"
            >Roles (stacking conflicting roles is flagged)
            <div class="cru-form__chips">
              <button
                v-for="role in CREATURE_ROLES"
                :key="role.id"
                class="tof-tag cru-chip"
                :class="{ on: entity.classification.roleIds.includes(role.id) }"
                :title="role.summary"
                @click="toggleRole(role.id)"
              >
                {{ role.name }}
              </button>
            </div>
          </label>
          <label class="tof-label cru-form__wide"
            >Creature tags
            <div class="cru-form__row">
              <select v-model="tagPick" class="tof-select">
                <option value="">Add a tag...</option>
                <option v-for="t in CREATURE_TAGS" :key="t.id" :value="t.name">{{ t.name }}</option>
              </select>
              <button class="tof-btn tof-btn--ghost" :disabled="!tagPick" @click="addTag">
                Add
              </button>
            </div>
            <div class="cru-form__chips">
              <button
                v-for="tag in entity.classification.tagIds"
                :key="tag"
                class="tof-tag cru-chip on"
                @click="removeTag(tag)"
              >
                {{ tag }} x
              </button>
            </div>
          </label>
          <label class="tof-label cru-form__wide"
            >Languages (comma separated)
            <input
              class="tof-input"
              :value="entity.classification.languages.join(', ')"
              @change="setLanguages($event)"
            />
          </label>
        </div>
      </section>

      <!-- ============================== Party ============================== -->
      <section v-else-if="builder.currentStep === 'party'" class="tof-panel">
        <h3 class="tof-h2">Party Target</h3>
        <p class="tof-small tof-muted">Who is this being balanced against?</p>
        <div class="cru-form">
          <label class="tof-label"
            >Party size
            <input
              class="tof-input"
              type="number"
              min="1"
              max="12"
              :value="entity.creationContext.partyTarget.size"
              @input="patchParty('size', $event)"
            />
          </label>
          <label class="tof-label"
            >Average level
            <input
              class="tof-input"
              type="number"
              min="0"
              max="60"
              :value="entity.creationContext.partyTarget.averageLevel"
              @input="patchParty('averageLevel', $event)"
            />
          </label>
          <label class="tof-label"
            >Desired difficulty
            <select
              class="tof-select"
              :value="entity.creationContext.desiredDifficulty"
              @change="setDifficulty($event)"
            >
              <option value="any">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="deadly">Deadly</option>
            </select>
          </label>
          <label class="tof-label"
            >How many will you field?
            <input
              class="tof-input"
              type="number"
              min="1"
              :value="entity.creationContext.plannedCount"
              @input="setPlannedCount($event)"
            />
          </label>
        </div>
        <CrucibleThreatPanel
          :party-check="builder.partyCheck"
          :recommendation="builder.recommendation"
        />
        <button
          v-if="builder.recommendation"
          class="tof-btn tof-btn--ghost"
          @click="adoptRecommendation"
        >
          Adopt the recommended Threat Rating &amp; level
        </button>
      </section>

      <!-- ============================== Stats ============================== -->
      <section v-else-if="builder.currentStep === 'stats'" class="tof-panel">
        <h3 class="tof-h2">Stats</h3>
        <div class="cru-form">
          <label class="tof-label"
            >Level
            <input
              class="tof-input"
              type="number"
              min="0"
              max="60"
              :value="entity.progression.level"
              @input="patchProgression('level', $event)"
            />
          </label>
          <label class="tof-label"
            >Threat Rating
            <input
              class="tof-input"
              type="number"
              min="0"
              :value="entity.progression.threatRating"
              @input="patchProgression('threatRating', $event)"
            />
          </label>
          <label class="tof-label"
            >PB override (blank = derived {{ derivedPb }})
            <input
              class="tof-input"
              type="number"
              min="0"
              :value="entity.progression.proficiencyBonusOverride ?? ''"
              @input="setPbOverride($event)"
            />
          </label>
        </div>
        <div class="cru-form cru-form--attrs">
          <label v-for="attr in ATTRIBUTES" :key="attr.key" class="tof-label">
            {{ attr.label }}
            <input
              class="tof-input"
              type="number"
              min="1"
              max="40"
              :value="entity.attributes[attr.key]"
              @input="setAttribute(attr.key, $event)"
            />
            <span class="tof-small tof-muted"
              >mod {{ fmtMod(entity.derived.modifiers[attr.key]) }}</span
            >
          </label>
        </div>
        <h4 class="tof-h2 tof-small">Saves</h4>
        <div class="cru-form">
          <label v-for="save in SAVE_IDS" :key="save" class="tof-label tof-small">
            <input
              type="checkbox"
              :checked="entity.saves.proficient[save]"
              @change="toggleSaveProficiency(save, $event)"
            />
            {{ SAVE_LABELS[save] }} proficient (current {{ fmtMod(entity.derived.saves[save]) }})
          </label>
        </div>
        <h4 class="tof-h2 tof-small">Talents</h4>
        <div class="cru-form__row">
          <select v-model="talentPick" class="tof-select">
            <option value="">Add a talent...</option>
            <option v-for="s in SKILLS" :key="s.id" :value="s.name">{{ s.name }}</option>
          </select>
          <button class="tof-btn tof-btn--ghost" :disabled="!talentPick" @click="addTalent">
            Add
          </button>
        </div>
        <div v-for="(t, i) in entity.talents.entries" :key="t.talentId" class="cru-form__row">
          <span class="cru-talent__name">{{ t.talentId }}</span>
          <select class="tof-select" :value="t.tier" @change="setTalentTier(i, $event)">
            <option value="proficient">Proficient</option>
            <option value="expert">Expert</option>
            <option value="masterful">Masterful</option>
            <option value="mythical">Mythical</option>
          </select>
          <span class="tof-small tof-muted">{{
            fmtMod(entity.derived.talentBonuses[t.talentId] ?? 0)
          }}</span>
          <button class="tof-btn tof-btn--ghost tof-small" @click="removeTalent(i)">x</button>
        </div>
      </section>

      <!-- ============================= Defenses ============================ -->
      <section v-else-if="builder.currentStep === 'defenses'" class="tof-panel">
        <h3 class="tof-h2">Defenses</h3>
        <div class="cru-form">
          <label class="tof-label"
            >Armor mode
            <select
              class="tof-select"
              :value="entity.defenses.armorMode"
              @change="patchDefensesSel('armorMode', $event)"
            >
              <option value="natural">Natural Armor (10 + Instinct)</option>
              <option value="toughenedHide">Toughened Hide (10 + Instinct + Conviction)</option>
              <option value="armor">Worn armor (10 + Instinct + PB/2 + armor + shield)</option>
              <option value="manual">Manual AC</option>
            </select>
          </label>
          <label class="tof-label"
            >AC descriptor
            <input
              class="tof-input"
              :value="entity.defenses.armorDescriptor"
              @input="patchDefensesStr('armorDescriptor', $event)"
            />
          </label>
          <label v-if="entity.defenses.armorMode === 'armor'" class="tof-label"
            >Armor bonus
            <input
              class="tof-input"
              type="number"
              :value="entity.defenses.armorBonus"
              @input="patchDefensesNum('armorBonus', $event)"
            />
          </label>
          <label v-if="entity.defenses.armorMode === 'armor'" class="tof-label"
            >Shield bonus
            <input
              class="tof-input"
              type="number"
              :value="entity.defenses.shieldBonus"
              @input="patchDefensesNum('shieldBonus', $event)"
            />
          </label>
          <label v-if="entity.defenses.armorMode === 'manual'" class="tof-label"
            >Manual AC
            <input
              class="tof-input"
              type="number"
              :value="entity.defenses.manualArmorClass"
              @input="patchDefensesNum('manualArmorClass', $event)"
            />
          </label>
          <label class="tof-label"
            >Misc AC bonus
            <input
              class="tof-input"
              type="number"
              :value="entity.defenses.miscAcBonus"
              @input="patchDefensesNum('miscAcBonus', $event)"
            />
          </label>
          <label class="tof-label"
            >Hit dice count (blank = level)
            <input
              class="tof-input"
              type="number"
              min="1"
              :value="entity.defenses.hitDiceCount ?? ''"
              @input="setHitDiceCount($event)"
            />
          </label>
          <label class="tof-label"
            >Manual HP (blank = computed {{ entity.derived.hitPoints }})
            <input
              class="tof-input"
              type="number"
              min="1"
              :value="entity.defenses.manualHitPoints ?? ''"
              @input="setManualHp($event)"
            />
          </label>
          <label class="tof-label"
            >Regeneration / round
            <input
              class="tof-input"
              type="number"
              min="0"
              :value="entity.defenses.regeneration"
              @input="patchDefensesNum('regeneration', $event)"
            />
          </label>
        </div>
        <div class="cru-form">
          <label class="tof-label cru-form__wide"
            >Resistances (comma separated)
            <input
              class="tof-input"
              :value="entity.defenses.resistances.join(', ')"
              @change="setDefenseList('resistances', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Immunities
            <input
              class="tof-input"
              :value="entity.defenses.immunities.join(', ')"
              @change="setDefenseList('immunities', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Vulnerabilities
            <input
              class="tof-input"
              :value="entity.defenses.vulnerabilities.join(', ')"
              @change="setDefenseList('vulnerabilities', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Condition immunities
            <input
              class="tof-input"
              :value="entity.defenses.conditionImmunities.join(', ')"
              @change="setDefenseList('conditionImmunities', $event)"
            />
          </label>
        </div>
        <p class="tof-small">
          Current: AC {{ entity.derived.armorClass }} ({{ entity.derived.armorClassSource }}), HP
          {{ entity.derived.hitPoints }} ({{ entity.derived.hitPointsFormula }})
        </p>
      </section>

      <!-- ============================= Movement ============================ -->
      <section v-else-if="builder.currentStep === 'movement'" class="tof-panel">
        <h3 class="tof-h2">Movement &amp; Senses</h3>
        <div class="cru-form">
          <label v-for="m in MOVE_KINDS" :key="m" class="tof-label">
            {{ m }} (ft)
            <input
              class="tof-input"
              type="number"
              min="0"
              step="5"
              :value="entity.movement[m]"
              @input="setMovement(m, $event)"
            />
          </label>
          <label class="tof-label tof-small">
            <input type="checkbox" :checked="entity.movement.hover" @change="setHover($event)" />
            Hover
          </label>
        </div>
        <label class="tof-label"
          >Senses (comma separated, e.g. "Darkvision 60 ft.")
          <input
            class="tof-input"
            :value="entity.senses.entries.join(', ')"
            @change="setSenses($event)"
          />
        </label>
      </section>

      <!-- ============================== Traits ============================= -->
      <section v-else-if="builder.currentStep === 'traits'" class="tof-panel">
        <h3 class="tof-h2">Traits</h3>
        <div class="cru-form__row">
          <select v-model="traitPick" class="tof-select">
            <option value="">Add from the trait library...</option>
            <option v-for="t in CREATURE_TRAITS" :key="t.id" :value="t.id">
              {{ t.name }} ({{ t.category }}, +{{ t.threatCost }} TR)
            </option>
          </select>
          <button class="tof-btn tof-btn--ghost" :disabled="!traitPick" @click="addTrait">
            Add
          </button>
          <button class="tof-btn tof-btn--ghost" @click="addBlankTrait">New Blank Trait</button>
        </div>
        <div v-for="(t, i) in entity.traits" :key="t.id" class="tof-card cru-trait">
          <div class="cru-form__row">
            <input class="tof-input" :value="t.name" @input="patchTrait(i, 'name', $event)" />
            <label class="tof-small"
              ><input type="checkbox" :checked="t.gmOnly" @change="patchTraitGm(i, $event)" />
              GM-only</label
            >
            <button class="tof-btn tof-btn--ghost tof-small" @click="removeTrait(i)">Remove</button>
          </div>
          <textarea
            class="tof-textarea"
            rows="2"
            :value="t.description"
            @input="patchTrait(i, 'description', $event)"
          />
        </div>
      </section>

      <!-- ============================== Actions ============================ -->
      <section v-else-if="builder.currentStep === 'actions'" class="tof-panel">
        <h3 class="tof-h2">Actions</h3>
        <p class="tof-small tof-muted">
          {{ entity.derived.actionPoints }} Action Points per turn. Core attacks cost 2 AP, quick
          actions 1 AP. Estimated damage per round: {{ entity.derived.damagePerRound }}.
        </p>
        <h4 class="tof-h2 tof-small">Core Actions</h4>
        <CrucibleActionComposer
          :model-value="entity.actions"
          :categories="['core']"
          @update:model-value="setList('actions', $event)"
        />
        <h4 class="tof-h2 tof-small">Quick Actions</h4>
        <CrucibleActionComposer
          :model-value="entity.quickActions"
          :categories="['quick']"
          @update:model-value="setList('quickActions', $event)"
        />
        <h4 class="tof-h2 tof-small">Reactions</h4>
        <CrucibleActionComposer
          :model-value="entity.reactions"
          :categories="['reaction']"
          @update:model-value="setList('reactions', $event)"
        />
        <template v-if="isBossKind">
          <h4 class="tof-h2 tof-small">Apex Actions</h4>
          <CrucibleActionComposer
            :model-value="entity.apexActions"
            :categories="['apex']"
            @update:model-value="setList('apexActions', $event)"
          />
          <h4 class="tof-h2 tof-small">Overture Actions</h4>
          <CrucibleActionComposer
            :model-value="entity.overtureActions"
            :categories="['overture']"
            @update:model-value="setList('overtureActions', $event)"
          />
        </template>
      </section>

      <!-- =============================== Magic ============================= -->
      <section v-else-if="builder.currentStep === 'magic'" class="tof-panel">
        <h3 class="tof-h2">Artes &amp; Aether</h3>
        <label class="tof-label tof-small">
          <input type="checkbox" :checked="entity.magic.isCaster" @change="toggleCaster($event)" />
          This creature casts Artes
        </label>
        <div v-if="entity.magic.isCaster" class="cru-form">
          <label class="tof-label"
            >Caster track
            <select
              class="tof-select"
              :value="entity.magic.casterType"
              @change="patchMagicSel('casterType', $event)"
            >
              <option value="Low-Caster">Low-Caster</option>
              <option value="Mid-Caster">Mid-Caster</option>
              <option value="High-Caster">High-Caster</option>
            </select>
          </label>
          <label class="tof-label"
            >Casting attribute
            <select
              class="tof-select"
              :value="entity.magic.castingAttribute ?? 'resonance'"
              @change="patchMagicSel('castingAttribute', $event)"
            >
              <option v-for="a in ATTRIBUTES" :key="a.key" :value="a.key">{{ a.label }}</option>
            </select>
          </label>
          <label class="tof-label"
            >Source
            <select
              class="tof-select"
              :value="entity.magic.sources[0] ?? 'Arcane'"
              @change="setMagicSource($event)"
            >
              <option v-for="s in ARTE_SOURCES" :key="s.name" :value="s.name">{{ s.name }}</option>
            </select>
          </label>
          <div class="tof-small cru-form__wide">
            Caster level {{ entity.derived.casterLevel }} - Max tier
            {{ entity.derived.maxArteTier }} - Aether {{ entity.derived.aether }} - Arte DC
            {{ entity.derived.arteSaveDc }} - Arte attack
            {{ fmtMod(entity.derived.arteAttack) }}
          </div>
          <label class="tof-label cru-form__wide"
            >Find Artes (tier {{ entity.derived.maxArteTier }} and below,
            {{ entity.magic.sources[0] ?? 'any' }} source)
            <input
              v-model="arteSearch"
              class="tof-input"
              placeholder="search the 830-Arte list..."
            />
          </label>
          <div class="cru-form__wide cru-artelist">
            <button
              v-for="arte in arteMatches"
              :key="arte.id"
              class="tof-tag cru-chip"
              :class="{ on: entity.magic.knownArteIds.includes(arte.id) }"
              :title="arte.description.slice(0, 160)"
              @click="toggleArte(arte.id)"
            >
              {{ arte.name }} (T{{ arte.tier }})
            </button>
          </div>
          <label class="tof-label cru-form__wide"
            >Innate casting note (printed on the statblock)
            <textarea
              class="tof-textarea"
              rows="2"
              :value="entity.magic.innateNote"
              @input="patchMagicStr('innateNote', $event)"
            />
          </label>
        </div>
      </section>

      <!-- ============================== Phases ============================= -->
      <section v-else-if="builder.currentStep === 'phases'" class="tof-panel">
        <h3 class="tof-h2">Boss Phases</h3>
        <button class="tof-btn tof-btn--ghost" @click="addPhase">Add Phase</button>
        <div v-for="(phase, i) in phases" :key="phase.id" class="tof-card cru-phase">
          <div class="cru-form">
            <label class="tof-label"
              >Name
              <input
                class="tof-input"
                :value="phase.name"
                @input="patchPhase(i, { name: strVal($event) })"
              />
            </label>
            <label class="tof-label"
              >Trigger
              <select
                class="tof-select"
                :value="phase.trigger.type"
                @change="setPhaseTrigger(i, strVal($event))"
              >
                <option value="manual">Manual</option>
                <option value="hpThreshold">HP threshold</option>
                <option value="roundStart">Round start</option>
                <option value="death">On death</option>
              </select>
            </label>
            <label v-if="phase.trigger.type === 'hpThreshold'" class="tof-label"
              >HP %
              <input
                class="tof-input"
                type="number"
                min="0"
                max="100"
                :value="phaseTriggerValue(phase)"
                @input="setPhaseTriggerValue(i, $event)"
              />
            </label>
            <label class="tof-label"
              >HP behaviour
              <select
                class="tof-select"
                :value="phase.hpBehavior"
                @change="
                  patchPhase(i, { hpBehavior: strVal($event) as CruciblePhase['hpBehavior'] })
                "
              >
                <option value="sharedPool">Shared pool</option>
                <option value="newPool">New pool</option>
                <option value="restorePercent">Restore percent</option>
                <option value="temporaryPool">Temporary pool</option>
              </select>
            </label>
            <label class="tof-label cru-form__wide"
              >Transition text (read aloud)
              <textarea
                class="tof-textarea"
                rows="2"
                :value="phase.transitionText"
                @input="patchPhase(i, { transitionText: strVal($event) })"
              />
            </label>
            <label class="tof-label cru-form__wide"
              >GM-only notes
              <textarea
                class="tof-textarea"
                rows="2"
                :value="phase.gmOnlyNotes ?? ''"
                @input="patchPhase(i, { gmOnlyNotes: strVal($event) })"
              />
            </label>
          </div>
          <button class="tof-btn tof-btn--danger tof-small" @click="removePhase(i)">
            Remove Phase
          </button>
        </div>
      </section>

      <!-- =============================== NPC =============================== -->
      <section v-else-if="builder.currentStep === 'npc'" class="tof-panel">
        <h3 class="tof-h2">Persona</h3>
        <div class="cru-form">
          <label class="tof-label"
            >Depth
            <select
              class="tof-select"
              :value="npc.npcDepth"
              @change="patchNpcSel('npcDepth', $event)"
            >
              <option value="quick">Quick (social only)</option>
              <option value="standard">Standard (social + combat)</option>
              <option value="fullCharacter">Full character (link a maker draft)</option>
            </select>
          </label>
          <label class="tof-label"
            >Archetype
            <select
              class="tof-select"
              :value="npc.archetypeId ?? ''"
              @change="applyArchetype($event)"
            >
              <option value="">Choose an archetype...</option>
              <option v-for="a in NPC_ARCHETYPES" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </label>
          <label class="tof-label"
            >Occupation
            <input
              class="tof-input"
              :value="npc.occupation"
              @input="patchNpcStr('occupation', $event)"
            />
          </label>
          <label class="tof-label"
            >Ancestry
            <input
              class="tof-input"
              :value="npc.ancestry"
              @input="patchNpcStr('ancestry', $event)"
            />
          </label>
          <label class="tof-label"
            >Disposition to party ({{ npc.dispositionTowardParty }})
            <input
              class="tof-input"
              type="range"
              min="-5"
              max="5"
              :value="npc.dispositionTowardParty"
              @input="patchNpcNum('dispositionTowardParty', $event)"
            />
          </label>
          <label class="tof-label"
            >Motivation preset
            <select class="tof-select" value="" @change="applyMotivation($event)">
              <option value="">Apply a motivation...</option>
              <option v-for="m in NPC_MOTIVATIONS" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </label>
          <label class="tof-label cru-form__wide"
            >Motivation
            <textarea
              class="tof-textarea"
              rows="2"
              :value="npc.motivation"
              @input="patchNpcStr('motivation', $event)"
            />
          </label>
          <label class="tof-label"
            >Fear
            <input class="tof-input" :value="npc.fear" @input="patchNpcStr('fear', $event)" />
          </label>
          <label class="tof-label"
            >Flaw
            <input class="tof-input" :value="npc.flaw" @input="patchNpcStr('flaw', $event)" />
          </label>
          <label class="tof-label cru-form__wide"
            >Secret (GM-only)
            <textarea
              class="tof-textarea"
              rows="2"
              :value="npc.secret"
              @input="patchNpcStr('secret', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Voice
            <input class="tof-input" :value="npc.voice" @input="patchNpcStr('voice', $event)" />
          </label>
          <label class="tof-label cru-form__wide"
            >Appearance
            <textarea
              class="tof-textarea"
              rows="2"
              :value="npc.appearance"
              @input="patchNpcStr('appearance', $event)"
            />
          </label>
        </div>

        <h4 class="tof-h2 tof-small">Knowledge ({{ npc.knowledge.length }})</h4>
        <button class="tof-btn tof-btn--ghost tof-small" @click="addKnowledge">
          Add knowledge entry
        </button>
        <div v-for="(k, i) in npc.knowledge" :key="k.id" class="tof-card cru-form">
          <label class="tof-label"
            >Topic
            <input class="tof-input" :value="k.topic" @input="patchKnowledge(i, 'topic', $event)" />
          </label>
          <label class="tof-label"
            >Shares it...
            <select class="tof-select" :value="k.difficulty" @change="patchKnowledgeSel(i, $event)">
              <option value="freely">Freely</option>
              <option value="ifAsked">If asked</option>
              <option value="ifTrusted">If trusted</option>
              <option value="ifPressured">If pressured</option>
              <option value="ifBribed">If bribed</option>
              <option value="never">Never</option>
            </select>
          </label>
          <label class="tof-label cru-form__wide"
            >What they know
            <textarea
              class="tof-textarea"
              rows="2"
              :value="k.content"
              @input="patchKnowledge(i, 'content', $event)"
            />
          </label>
          <button class="tof-btn tof-btn--ghost tof-small" @click="removeKnowledge(i)">
            Remove
          </button>
        </div>

        <h4 class="tof-h2 tof-small">Quest Hooks ({{ npc.questHooks.length }})</h4>
        <button class="tof-btn tof-btn--ghost tof-small" @click="addQuestHook">
          Add quest hook
        </button>
        <div v-for="(q, i) in npc.questHooks" :key="q.id" class="tof-card cru-form">
          <label class="tof-label"
            >Title
            <input class="tof-input" :value="q.title" @input="patchQuest(i, 'title', $event)" />
          </label>
          <label class="tof-label cru-form__wide"
            >The ask
            <textarea
              class="tof-textarea"
              rows="2"
              :value="q.ask"
              @input="patchQuest(i, 'ask', $event)"
            />
          </label>
          <label class="tof-label"
            >Reward
            <input class="tof-input" :value="q.reward" @input="patchQuest(i, 'reward', $event)" />
          </label>
          <button class="tof-btn tof-btn--ghost tof-small" @click="removeQuest(i)">Remove</button>
        </div>
      </section>

      <!-- ============================= Behavior ============================ -->
      <section v-else-if="builder.currentStep === 'behavior'" class="tof-panel">
        <h3 class="tof-h2">Behavior &amp; Tactics</h3>
        <div class="cru-form">
          <label class="tof-label"
            >Preferred range
            <select
              class="tof-select"
              :value="monster.combatProfile.preferredRange"
              @change="patchCombatSel('preferredRange', $event)"
            >
              <option value="melee">Melee</option>
              <option value="close">Close</option>
              <option value="mid">Mid</option>
              <option value="long">Long</option>
              <option value="variable">Variable</option>
            </select>
          </label>
          <label class="tof-label"
            >Morale (1 flees, 10 fights to the death)
            <input
              class="tof-input"
              type="number"
              min="1"
              max="10"
              :value="monster.combatProfile.morale ?? 5"
              @input="patchCombatNum('morale', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Opening move
            <input
              class="tof-input"
              :value="monster.combatProfile.openingMove"
              @input="patchCombatStr('openingMove', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Standard turn
            <textarea
              class="tof-textarea"
              rows="2"
              :value="monster.combatProfile.standardTurn"
              @input="patchCombatStr('standardTurn', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >When bloodied
            <input
              class="tof-input"
              :value="monster.combatProfile.bloodiedBehavior"
              @input="patchCombatStr('bloodiedBehavior', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Retreat behaviour
            <input
              class="tof-input"
              :value="monster.combatProfile.retreatBehavior"
              @input="patchCombatStr('retreatBehavior', $event)"
            />
          </label>
          <label class="tof-label cru-form__wide"
            >Weakness clues (one per line; players can discover these)
            <textarea
              class="tof-textarea"
              rows="3"
              :value="monster.weaknessClues.join('\n')"
              @change="setWeaknessClues($event)"
            />
          </label>
        </div>
      </section>

      <!-- =============================== Loot ============================== -->
      <section v-else-if="builder.currentStep === 'loot'" class="tof-panel">
        <h3 class="tof-h2">Loot</h3>
        <label class="tof-label"
          >Currency
          <input
            class="tof-input"
            :value="entity.loot.currency"
            placeholder="e.g. 3d6 x 10 silver"
            @input="patchLootStr('currency', $event)"
          />
        </label>
        <button class="tof-btn tof-btn--ghost tof-small" @click="addLoot">Add loot entry</button>
        <div v-for="(l, i) in entity.loot.entries" :key="l.id" class="cru-form__row">
          <input
            class="tof-input"
            :value="l.name"
            placeholder="item"
            @input="patchLoot(i, 'name', $event)"
          />
          <input
            class="tof-input cru-loot__chance"
            type="number"
            min="0"
            max="100"
            :value="l.chance"
            @input="patchLootNum(i, $event)"
          />
          <span class="tof-small tof-muted">%</span>
          <input
            class="tof-input"
            :value="l.rarity"
            placeholder="rarity"
            @input="patchLoot(i, 'rarity', $event)"
          />
          <button class="tof-btn tof-btn--ghost tof-small" @click="removeLoot(i)">x</button>
        </div>
        <label class="tof-label"
          >Notes (GM-only)
          <textarea
            class="tof-textarea"
            rows="2"
            :value="entity.loot.notes"
            @input="patchLootStr('notes', $event)"
          />
        </label>
      </section>

      <!-- =============================== Token ============================= -->
      <section v-else-if="builder.currentStep === 'token'" class="tof-panel">
        <h3 class="tof-h2">Token &amp; Roll20</h3>
        <CrucibleTokenConfig
          :token="entity.token"
          :size-id="entity.classification.sizeId"
          @update="patchToken"
        />
        <h4 class="tof-h2 tof-small">Roll20 Output</h4>
        <CrucibleRoll20Preview :entity="entity" @update="patchRoll20" />
      </section>

      <!-- ============================== Review ============================= -->
      <CrucibleReview
        v-else-if="builder.currentStep === 'review'"
        @saved="$emit('saved', $event)"
      />
    </div>

    <div v-if="builder.currentStep !== 'review'" class="cru-builder__nav">
      <button class="tof-btn tof-btn--ghost" @click="builder.back()">Back</button>
      <button class="tof-btn" @click="builder.next()">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { AttributeKey } from '@/maker/types';
import { ATTRIBUTES, SKILLS } from '@/maker/data/attributes';
import { ARTES, ARTE_SOURCES } from '@/maker/data/artes';
import {
  useCrucibleBuilderStore,
  BUILDER_STEP_LABELS,
} from '@/crucible/store/crucibleBuilder.store';
import {
  ENTITY_KINDS,
  ENTITY_KIND_LABELS,
  SAVE_IDS,
  SAVE_LABELS,
  type CrucibleEntityKind,
  type SaveId,
} from '@/crucible/schemas/crucibleCommon';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { CruciblePhase } from '@/crucible/schemas/cruciblePhase.schema';
import { createPhase } from '@/crucible/schemas/cruciblePhase.schema';
import { createNpcBlock, type CrucibleNpcBlock } from '@/crucible/schemas/crucibleNpc.schema';
import {
  createMonsterBlock,
  type CrucibleMonsterBlock,
} from '@/crucible/schemas/crucibleMonster.schema';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import type {
  CrucibleTokenBlock,
  CrucibleRoll20Block,
} from '@/crucible/schemas/crucibleRoll20.schema';
import { CREATURE_SIZES, sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';
import { CREATURE_ROLES } from '@/crucible/data/registries/creatureRoles.registry';
import { CREATURE_TAGS } from '@/crucible/data/registries/creatureTags.registry';
import { CREATURE_TRAITS, traitById } from '@/crucible/data/registries/creatureTraits.registry';
import { CREATURE_TEMPLATES } from '@/crucible/data/registries/creatureTemplates.registry';
import {
  NPC_ARCHETYPES,
  npcArchetypeById,
} from '@/crucible/data/registries/npcArchetypes.registry';
import {
  NPC_MOTIVATIONS,
  npcMotivationById,
} from '@/crucible/data/registries/npcMotivations.registry';
import { applyCrucibleTemplate } from '@/crucible/engine/applyCrucibleTemplate';
import CrucibleActionComposer from './CrucibleActionComposer.vue';
import CrucibleTokenConfig from './CrucibleTokenConfig.vue';
import CrucibleRoll20Preview from './CrucibleRoll20Preview.vue';
import CrucibleThreatPanel from './CrucibleThreatPanel.vue';
import CrucibleReview from './CrucibleReview.vue';

defineEmits<{ (e: 'saved', id: string): void }>();

const builder = useCrucibleBuilderStore();
const entity = computed(() => builder.working);

const templatePick = ref('');
const tagPick = ref('');
const talentPick = ref('');
const traitPick = ref('');
const arteSearch = ref('');

const MOVE_KINDS = ['ground', 'climb', 'swim', 'fly', 'burrow'] as const;

const isBossKind = computed(
  () => entity.value?.kind === 'boss' || entity.value?.kind === 'mythicBoss',
);
const derivedPb = computed(() => entity.value?.derived.proficiencyBonus ?? 1);
const phases = computed(() => entity.value?.boss?.phases ?? []);
const npc = computed<CrucibleNpcBlock>(() => entity.value?.npc ?? createNpcBlock());
const monster = computed<CrucibleMonsterBlock>(() => entity.value?.monster ?? createMonsterBlock());

const strVal = (e: Event) => (e.target as HTMLInputElement).value;
const numVal = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;
const fmtMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

// --- Concept ---------------------------------------------------------------

function patchIdentity(key: 'name' | 'concept' | 'description' | 'gmNotes', e: Event) {
  builder.patch('identity', { [key]: strVal(e) });
}
function setKind(e: Event) {
  const kind = strVal(e) as CrucibleEntityKind;
  if (!entity.value) return;
  builder.set('kind', kind);
  // Boss kinds need a boss block; NPCs need an npc block.
  if ((kind === 'boss' || kind === 'mythicBoss') && !entity.value.boss) {
    builder.set('boss', {
      phases: [],
      activePhaseId: null,
      apexActionsPerRound: kind === 'mythicBoss' ? 3 : 2,
      overtureUnlocksAtPhase: null,
      legendaryResistances: kind === 'mythicBoss' ? 3 : 2,
      lairInitiative: null,
      lairDescription: '',
    });
  }
  if (kind === 'npc' && !entity.value.npc) builder.set('npc', createNpcBlock());
}
function applyTemplate() {
  if (!entity.value || !templatePick.value) return;
  const result = applyCrucibleTemplate(entity.value, templatePick.value);
  builder.working = result.entity;
  builder.recompute();
  templatePick.value = '';
}

// --- Classification ---------------------------------------------------------

function setSize(e: Event) {
  const sizeId = strVal(e);
  builder.patch('classification', { sizeId });
  const size = sizeOrDefault(sizeId);
  builder.patch('token', { gridWidth: size.gridWidth, gridHeight: size.gridHeight });
}
function toggleRole(roleId: string) {
  if (!entity.value) return;
  const roles = entity.value.classification.roleIds.includes(roleId)
    ? entity.value.classification.roleIds.filter((r) => r !== roleId)
    : [...entity.value.classification.roleIds, roleId];
  builder.patch('classification', { roleIds: roles });
}
function addTag() {
  if (!entity.value || !tagPick.value) return;
  if (!entity.value.classification.tagIds.includes(tagPick.value)) {
    builder.patch('classification', {
      tagIds: [...entity.value.classification.tagIds, tagPick.value],
    });
  }
  tagPick.value = '';
}
function removeTag(tag: string) {
  if (!entity.value) return;
  builder.patch('classification', {
    tagIds: entity.value.classification.tagIds.filter((t) => t !== tag),
  });
}
function setLanguages(e: Event) {
  builder.patch('classification', {
    languages: strVal(e)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  });
}

// --- Party -------------------------------------------------------------------

function patchParty(key: 'size' | 'averageLevel', e: Event) {
  if (!entity.value) return;
  builder.patch('creationContext', {
    partyTarget: { ...entity.value.creationContext.partyTarget, [key]: Math.max(0, numVal(e)) },
  });
}
function setDifficulty(e: Event) {
  builder.patch('creationContext', {
    desiredDifficulty: strVal(e) as CrucibleEntitySchema['creationContext']['desiredDifficulty'],
  });
}
function setPlannedCount(e: Event) {
  builder.patch('creationContext', { plannedCount: Math.max(1, numVal(e)) });
}
function adoptRecommendation() {
  const rec = builder.recommendation;
  if (!rec) return;
  builder.patch('progression', {
    threatRating: Math.round((rec.threatRatingLow + rec.threatRatingHigh) / 2),
    level: rec.level,
  });
}

// --- Stats -------------------------------------------------------------------

function patchProgression(key: 'level' | 'threatRating', e: Event) {
  builder.patch('progression', { [key]: Math.max(0, numVal(e)) });
}
function setPbOverride(e: Event) {
  const raw = strVal(e).trim();
  builder.patch('progression', {
    proficiencyBonusOverride: raw === '' ? null : Math.max(0, Number(raw) || 0),
  });
}
function setAttribute(key: AttributeKey, e: Event) {
  if (!entity.value) return;
  builder.set('attributes', { ...entity.value.attributes, [key]: Math.max(1, numVal(e)) });
}
function toggleSaveProficiency(save: SaveId, e: Event) {
  if (!entity.value) return;
  builder.patch('saves', {
    proficient: {
      ...entity.value.saves.proficient,
      [save]: (e.target as HTMLInputElement).checked,
    },
  });
}
function addTalent() {
  if (!entity.value || !talentPick.value) return;
  if (!entity.value.talents.entries.some((t) => t.talentId === talentPick.value)) {
    builder.patch('talents', {
      entries: [
        ...entity.value.talents.entries,
        { talentId: talentPick.value, tier: 'proficient' as const },
      ],
    });
  }
  talentPick.value = '';
}
function setTalentTier(index: number, e: Event) {
  if (!entity.value) return;
  const entries = [...entity.value.talents.entries];
  entries[index] = { ...entries[index], tier: strVal(e) as (typeof entries)[number]['tier'] };
  builder.patch('talents', { entries });
}
function removeTalent(index: number) {
  if (!entity.value) return;
  builder.patch('talents', { entries: entity.value.talents.entries.filter((_, i) => i !== index) });
}

// --- Defenses ----------------------------------------------------------------

function patchDefensesSel(key: 'armorMode', e: Event) {
  builder.patch('defenses', { [key]: strVal(e) as CrucibleEntitySchema['defenses']['armorMode'] });
}
function patchDefensesStr(key: 'armorDescriptor', e: Event) {
  builder.patch('defenses', { [key]: strVal(e) });
}
function patchDefensesNum(
  key: 'armorBonus' | 'shieldBonus' | 'manualArmorClass' | 'miscAcBonus' | 'regeneration',
  e: Event,
) {
  builder.patch('defenses', { [key]: numVal(e) });
}
function setHitDiceCount(e: Event) {
  const raw = strVal(e).trim();
  builder.patch('defenses', { hitDiceCount: raw === '' ? null : Math.max(1, Number(raw) || 1) });
}
function setManualHp(e: Event) {
  const raw = strVal(e).trim();
  builder.patch('defenses', { manualHitPoints: raw === '' ? null : Math.max(1, Number(raw) || 1) });
}
function setDefenseList(
  key: 'resistances' | 'immunities' | 'vulnerabilities' | 'conditionImmunities',
  e: Event,
) {
  builder.patch('defenses', {
    [key]: strVal(e)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  });
}

// --- Movement ----------------------------------------------------------------

function setMovement(kind: (typeof MOVE_KINDS)[number], e: Event) {
  builder.patch('movement', { [kind]: Math.max(0, numVal(e)) });
}
function setHover(e: Event) {
  builder.patch('movement', { hover: (e.target as HTMLInputElement).checked });
}
function setSenses(e: Event) {
  builder.patch('senses', {
    entries: strVal(e)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  });
}

// --- Traits ------------------------------------------------------------------

function addTrait() {
  if (!entity.value || !traitPick.value) return;
  const def = traitById[traitPick.value];
  if (def && !entity.value.traits.some((t) => t.registryId === def.id)) {
    builder.set('traits', [
      ...entity.value.traits,
      {
        id: uuidv4(),
        registryId: def.id,
        name: def.name,
        description: def.description,
        uses: def.uses,
        threatCost: def.threatCost,
        origin: 'userProvided' as const,
      },
    ]);
  }
  traitPick.value = '';
}
function addBlankTrait() {
  if (!entity.value) return;
  builder.set('traits', [
    ...entity.value.traits,
    {
      id: uuidv4(),
      registryId: null,
      name: 'New Trait',
      description: '',
      threatCost: 0,
      origin: 'userProvided' as const,
    },
  ]);
}
function patchTrait(index: number, key: 'name' | 'description', e: Event) {
  if (!entity.value) return;
  const traits = [...entity.value.traits];
  traits[index] = { ...traits[index], [key]: strVal(e) };
  builder.set('traits', traits);
}
function patchTraitGm(index: number, e: Event) {
  if (!entity.value) return;
  const traits = [...entity.value.traits];
  traits[index] = { ...traits[index], gmOnly: (e.target as HTMLInputElement).checked };
  builder.set('traits', traits);
}
function removeTrait(index: number) {
  if (!entity.value) return;
  builder.set(
    'traits',
    entity.value.traits.filter((_, i) => i !== index),
  );
}

// --- Actions -----------------------------------------------------------------

function setList(
  key: 'actions' | 'quickActions' | 'reactions' | 'apexActions' | 'overtureActions',
  value: CrucibleActionInstance[],
) {
  builder.set(key, value);
}

// --- Magic -------------------------------------------------------------------

function toggleCaster(e: Event) {
  const on = (e.target as HTMLInputElement).checked;
  builder.patch('magic', {
    isCaster: on,
    casterType: on
      ? entity.value?.magic.casterType === 'Non-Caster'
        ? 'Mid-Caster'
        : entity.value?.magic.casterType
      : 'Non-Caster',
    castingAttribute: entity.value?.magic.castingAttribute ?? 'resonance',
  });
}
function patchMagicSel(key: 'casterType' | 'castingAttribute', e: Event) {
  builder.patch('magic', { [key]: strVal(e) });
}
function patchMagicStr(key: 'innateNote', e: Event) {
  builder.patch('magic', { [key]: strVal(e) });
}
function setMagicSource(e: Event) {
  builder.patch('magic', { sources: [strVal(e)] });
}
const arteMatches = computed(() => {
  if (!entity.value) return [];
  const maxTier = entity.value.derived.maxArteTier;
  const source = entity.value.magic.sources[0];
  const search = arteSearch.value.trim().toLowerCase();
  return ARTES.filter((a) => {
    if (a.tier > maxTier) return false;
    if (source && !a.sources.includes(source)) return false;
    if (
      search &&
      !a.name.toLowerCase().includes(search) &&
      !a.school.toLowerCase().includes(search)
    )
      return false;
    return entity.value?.magic.knownArteIds.includes(a.id) || search.length > 0;
  }).slice(0, 40);
});
function toggleArte(arteId: string) {
  if (!entity.value) return;
  const known = entity.value.magic.knownArteIds.includes(arteId)
    ? entity.value.magic.knownArteIds.filter((id) => id !== arteId)
    : [...entity.value.magic.knownArteIds, arteId];
  builder.patch('magic', { knownArteIds: known });
}

// --- Phases ------------------------------------------------------------------

function ensureBoss() {
  if (!entity.value) return;
  if (!entity.value.boss) {
    builder.set('boss', {
      phases: [],
      activePhaseId: null,
      apexActionsPerRound: 2,
      overtureUnlocksAtPhase: null,
      legendaryResistances: 2,
      lairInitiative: null,
      lairDescription: '',
    });
  }
}
function addPhase() {
  if (!entity.value) return;
  ensureBoss();
  const boss = entity.value.boss;
  if (!boss) return;
  builder.set('boss', {
    ...boss,
    phases: [
      ...boss.phases,
      createPhase({
        id: uuidv4(),
        order: boss.phases.length + 1,
        name: `Phase ${boss.phases.length + 1}`,
        trigger: boss.phases.length === 0 ? { type: 'manual' } : { type: 'hpThreshold', value: 50 },
      }),
    ],
  });
}
function patchPhase(index: number, value: Partial<CruciblePhase>) {
  const boss = entity.value?.boss;
  if (!boss) return;
  const phasesNext = [...boss.phases];
  phasesNext[index] = { ...phasesNext[index], ...value };
  builder.set('boss', { ...boss, phases: phasesNext });
}
function removePhase(index: number) {
  const boss = entity.value?.boss;
  if (!boss) return;
  builder.set('boss', { ...boss, phases: boss.phases.filter((_, i) => i !== index) });
}
function setPhaseTrigger(index: number, type: string) {
  const trigger: CruciblePhase['trigger'] =
    type === 'hpThreshold'
      ? { type: 'hpThreshold', value: 50 }
      : type === 'roundStart'
      ? { type: 'roundStart', round: 2 }
      : type === 'death'
      ? { type: 'death' }
      : { type: 'manual' };
  patchPhase(index, { trigger });
}
function phaseTriggerValue(phase: CruciblePhase): number {
  return phase.trigger.type === 'hpThreshold' ? phase.trigger.value : 50;
}
function setPhaseTriggerValue(index: number, e: Event) {
  patchPhase(index, {
    trigger: { type: 'hpThreshold', value: Math.max(0, Math.min(100, numVal(e))) },
  });
}

// --- NPC ---------------------------------------------------------------------

function ensureNpc(): CrucibleNpcBlock {
  if (entity.value && !entity.value.npc) builder.set('npc', createNpcBlock());
  return entity.value?.npc ?? createNpcBlock();
}
function patchNpc(value: Partial<CrucibleNpcBlock>) {
  const current = ensureNpc();
  builder.set('npc', { ...current, ...value });
}
function patchNpcStr(
  key:
    | 'occupation'
    | 'ancestry'
    | 'motivation'
    | 'fear'
    | 'flaw'
    | 'secret'
    | 'voice'
    | 'appearance',
  e: Event,
) {
  patchNpc({ [key]: strVal(e) });
}
function patchNpcSel(key: 'npcDepth', e: Event) {
  patchNpc({ [key]: strVal(e) as CrucibleNpcBlock['npcDepth'] });
}
function patchNpcNum(key: 'dispositionTowardParty', e: Event) {
  patchNpc({ [key]: numVal(e) });
}
function applyArchetype(e: Event) {
  const archetype = npcArchetypeById[strVal(e)];
  if (!archetype) return;
  patchNpc({
    archetypeId: archetype.id,
    occupation: archetype.occupation,
    publicRole: archetype.publicRole,
  });
}
function applyMotivation(e: Event) {
  const motivation = npcMotivationById[strVal(e)];
  if (!motivation) return;
  patchNpc({
    motivation: motivation.statement,
    fear: motivation.fear,
    flaw: motivation.flaw,
    secret: motivation.secret,
    contradiction: motivation.contradiction,
    breakingPoint: motivation.breakingPoint,
    negotiationLevers: motivation.negotiationLevers,
  });
}
function addKnowledge() {
  const current = ensureNpc();
  patchNpc({
    knowledge: [
      ...current.knowledge,
      {
        id: uuidv4(),
        topic: '',
        content: '',
        difficulty: 'ifAsked',
        dc: null,
        isMisinformation: false,
        gmOnly: true,
      },
    ],
  });
}
function patchKnowledge(index: number, key: 'topic' | 'content', e: Event) {
  const current = ensureNpc();
  const knowledge = [...current.knowledge];
  knowledge[index] = { ...knowledge[index], [key]: strVal(e) };
  patchNpc({ knowledge });
}
function patchKnowledgeSel(index: number, e: Event) {
  const current = ensureNpc();
  const knowledge = [...current.knowledge];
  knowledge[index] = {
    ...knowledge[index],
    difficulty: strVal(e) as CrucibleNpcBlock['knowledge'][number]['difficulty'],
  };
  patchNpc({ knowledge });
}
function removeKnowledge(index: number) {
  const current = ensureNpc();
  patchNpc({ knowledge: current.knowledge.filter((_, i) => i !== index) });
}
function addQuestHook() {
  const current = ensureNpc();
  patchNpc({
    questHooks: [
      ...current.questHooks,
      { id: uuidv4(), title: '', summary: '', ask: '', reward: '', requires: '', gmOnly: true },
    ],
  });
}
function patchQuest(index: number, key: 'title' | 'ask' | 'reward', e: Event) {
  const current = ensureNpc();
  const questHooks = [...current.questHooks];
  questHooks[index] = { ...questHooks[index], [key]: strVal(e) };
  patchNpc({ questHooks });
}
function removeQuest(index: number) {
  const current = ensureNpc();
  patchNpc({ questHooks: current.questHooks.filter((_, i) => i !== index) });
}

// --- Behavior ----------------------------------------------------------------

function ensureMonster(): CrucibleMonsterBlock {
  if (entity.value && !entity.value.monster) builder.set('monster', createMonsterBlock());
  return entity.value?.monster ?? createMonsterBlock();
}
function patchMonster(value: Partial<CrucibleMonsterBlock>) {
  const current = ensureMonster();
  builder.set('monster', { ...current, ...value });
}
function patchCombatSel(key: 'preferredRange', e: Event) {
  const current = ensureMonster();
  patchMonster({
    combatProfile: {
      ...current.combatProfile,
      [key]: strVal(e) as CrucibleMonsterBlock['combatProfile']['preferredRange'],
    },
  });
}
function patchCombatStr(
  key: 'openingMove' | 'standardTurn' | 'bloodiedBehavior' | 'retreatBehavior',
  e: Event,
) {
  const current = ensureMonster();
  patchMonster({ combatProfile: { ...current.combatProfile, [key]: strVal(e) } });
}
function patchCombatNum(key: 'morale', e: Event) {
  const current = ensureMonster();
  patchMonster({ combatProfile: { ...current.combatProfile, [key]: numVal(e) } });
}
function setWeaknessClues(e: Event) {
  patchMonster({
    weaknessClues: strVal(e)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  });
}

// --- Loot --------------------------------------------------------------------

function patchLootStr(key: 'currency' | 'notes', e: Event) {
  if (!entity.value) return;
  builder.set('loot', { ...entity.value.loot, [key]: strVal(e) });
}
function addLoot() {
  if (!entity.value) return;
  builder.set('loot', {
    ...entity.value.loot,
    entries: [
      ...entity.value.loot.entries,
      { id: uuidv4(), name: '', chance: 100, quantity: '1', rarity: '', notes: '' },
    ],
  });
}
function patchLoot(index: number, key: 'name' | 'rarity', e: Event) {
  if (!entity.value) return;
  const entries = [...entity.value.loot.entries];
  entries[index] = { ...entries[index], [key]: strVal(e) };
  builder.set('loot', { ...entity.value.loot, entries });
}
function patchLootNum(index: number, e: Event) {
  if (!entity.value) return;
  const entries = [...entity.value.loot.entries];
  entries[index] = { ...entries[index], chance: Math.max(0, Math.min(100, numVal(e))) };
  builder.set('loot', { ...entity.value.loot, entries });
}
function removeLoot(index: number) {
  if (!entity.value) return;
  builder.set('loot', {
    ...entity.value.loot,
    entries: entity.value.loot.entries.filter((_, i) => i !== index),
  });
}

// --- Token / Roll20 ----------------------------------------------------------

function patchToken(value: Partial<CrucibleTokenBlock>) {
  builder.patch('token', value);
}
function patchRoll20(value: Partial<CrucibleRoll20Block>) {
  builder.patch('roll20', value);
}
</script>

<style scoped lang="scss">
.cru-builder__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.7rem;
}
.cru-builder__tab {
  background: transparent;
  border: 1px solid var(--tof-panel-border);
  color: var(--tof-cream);
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
  &.on {
    background: linear-gradient(180deg, var(--tof-gold), #c4861a);
    color: #2a1d05;
    font-weight: 700;
  }
}
.cru-builder__nav {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem;
}
.cru-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.55rem;
  margin-bottom: 0.6rem;
}
.cru-form--attrs {
  grid-template-columns: repeat(6, 1fr);
}
.cru-form__wide {
  grid-column: 1 / -1;
}
.cru-form__row {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
  .tof-select {
    min-width: 200px;
  }
}
.cru-form__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.3rem;
}
.cru-chip {
  cursor: pointer;
  border: 1px solid var(--tof-panel-border);
  background: transparent;
  &.on {
    background: linear-gradient(180deg, var(--tof-gold), #c4861a);
    color: #2a1d05;
    font-weight: 700;
  }
}
.cru-talent__name {
  min-width: 9rem;
}
.cru-trait {
  margin: 0.4rem 0;
}
.cru-phase {
  margin: 0.5rem 0;
}
.cru-artelist {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-height: 180px;
  overflow-y: auto;
}
.cru-loot__chance {
  max-width: 70px;
}
@media (max-width: 800px) {
  .cru-form--attrs {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
