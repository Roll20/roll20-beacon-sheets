<script setup>
import { ref, computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'
import {
  ABILITIES, critRange, CRIT_RANGE_MIN, formatModifier,
  WEAPON_KINDS, MASTERY_FEATURES, distanceLabel,
  weaponTypesFor, rowProficiency,
  WEAPON_PROPERTIES, attackAbility, heavyDisadvantage,
} from '@/rules/index.js'

const props = defineProps({ id: { type: String, required: true } })

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const attack = computed(() => sheet.attacks.find((a) => a._id === props.id) ?? null)

const editing = ref(false)

if (!attack.value?.name) editing.value = true

const dmg = computed(() => sheet.damageFor(attack.value ?? {}))

const hasDamage = computed(() => !!(dmg.value.value || attack.value?.damage2))

const damageLine = computed(() =>
  [
    [dmg.value.value, attack.value?.damageType].filter(Boolean).join(' '),
    [attack.value?.damage2, attack.value?.damage2Type].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' + '),
)

const atk = computed(() => sheet.attackPowerFor(attack.value ?? {}))

const power = computed(() => formatModifier(atk.value.value))

const derivedParts = computed(() => {
  const { abilityId, abilityMod, bonus, misc } = atk.value
  const abbr = ABILITIES.find((a) => a.id === abilityId)?.abbr ?? ''
  const parts = [`${abbr} ${formatModifier(abilityMod)}`]
  if (bonus) parts.push(`bonus ${formatModifier(bonus)}`)
  if (misc) parts.push(`adj ${formatModifier(misc)}`)
  return `${parts.join(' + ')} = ${formatModifier(atk.value.derived)}`
})

const critLabel = computed(() => {
  const from = critRange(attack.value?.critFrom)
  return from < 20 ? `${from}-20` : null
})

const CRIT_OPTIONS = [20, 19, CRIT_RANGE_MIN]

const rangeLabel = computed(() => distanceLabel(attack.value?.kind))

const masteryLabel = computed(() =>
  dmg.value.mastered && attack.value?.mastery ? attack.value.mastery : null,
)

const heavyDis = computed(() => heavyDisadvantage(attack.value ?? {}, sheet.abilities))

const canTwoHand = computed(() => !!attack.value?.properties?.versatile && attack.value?.kind !== 'ranged')

const autoAbility = computed(() => {
  const id = attackAbility({ ...attack.value, ability: '' }, sheet.abilities)
  return ABILITIES.find((a) => a.id === id)?.abbr ?? ''
})

const typeOptions = computed(() => weaponTypesFor(sheet.proficiencies))

const gradeLabel = computed(() => {
  const { grade, gradeInUse } = dmg.value
  if (!grade) return null
  return gradeInUse === grade ? String(grade) : `${gradeInUse} (${grade})`
})

const autoRow = computed(() =>
  rowProficiency({ ...attack.value, proficient: 'auto', isMastery: 'auto' }, sheet.proficiencies),
)
const proficientOptions = computed(() => [
  { value: 'auto', label: `Auto (${autoRow.value.proficient ? 'Yes' : 'No'})` },
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
])
const masteryOptions = computed(() => [
  { value: 'auto', label: `Auto (${autoRow.value.mastered ? 'Yes' : 'No'})` },
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
])

const damageParts = computed(() => {
  const d = dmg.value
  if (!d.derived) return ''
  const abbr = ABILITIES.find((a) => a.id === d.abilityId)?.abbr ?? ''
  const parts = [d.dice]
  if (d.gradeBonus) parts.push(`grade ${formatModifier(d.gradeBonus)}`)
  if (d.ability) parts.push(`${abbr} ${formatModifier(d.ability)}`)
  if (d.misc) parts.push(`adj ${formatModifier(d.misc)}`)
  if (d.versatile) parts.push(`two-handed ${formatModifier(d.versatile)}`)
  return `${parts.join(' + ')} = ${d.derived}`
})
</script>

<template>
  <div v-if="attack" class="entry" :class="{ open: editing }">
    <div class="line">
      <button
        type="button"
        class="name"
        :title="editing ? 'Close' : 'Edit'"
        @click="editing = !editing"
      >
        <span class="caret" :class="{ turned: editing }">&#9656;</span>
        {{ attack.name || 'Unnamed attack' }}
      </button>

      <span class="roll-group">
        <button
          v-if="canTwoHand"
          type="button"
          class="roll roll--toggle"
          :aria-pressed="attack.twoHanded ? 'true' : 'false'"
          title="Two hands"
          @click="attack.twoHanded = !attack.twoHanded"
        >
          Two-Handed
        </button>
        <button
          v-if="attack.rollsToHit"
          type="button"
          class="roll"
          title="Roll to hit"
          @click="rolls.rollAttack(attack)"
        >
          Attack
        </button>
        <button
          type="button"
          class="roll"
          :disabled="!hasDamage"
          title="Roll damage"
          @click="rolls.rollWeaponDamage(attack)"
        >
          Damage
        </button>
        <button
          type="button"
          class="roll roll--crit"
          :disabled="!hasDamage"
          title="Roll damage with the dice doubled"
          @click="rolls.rollWeaponDamage(attack, { crit: true })"
        >
          Crit
        </button>
      </span>

      <ConfirmDelete class="del" title="Remove" @confirm="sheet.removeAttack(attack._id)" />
    </div>

    <div class="stats">
      <span v-if="gradeLabel" class="stat">
        <b>Grade</b>{{ gradeLabel }}
      </span>
      <span v-if="!dmg.proficient" class="stat stat--warn">
        <b>Proficient</b>No
      </span>
      <span v-if="attack.range" class="stat">
        <b>{{ rangeLabel }}</b>{{ attack.range }}
      </span>
      <span v-if="attack.rollsToHit" class="stat">
        <b>Atk Pwr</b><span :class="{ typed: atk.overridden }">{{ power }}</span>
      </span>
      <span v-if="critLabel" class="stat stat--crit">
        <b>Crit</b>{{ critLabel }}
      </span>
      <span v-if="damageLine" class="stat stat--damage">
        <b>Damage</b><span :class="{ typed: dmg.overridden }">{{ damageLine }}</span>
      </span>
      <span v-if="masteryLabel" class="stat stat--mastery">
        <b>Mastery</b>{{ masteryLabel }}
      </span>
      <span v-if="heavyDis" class="stat stat--warn">
        <b>Heavy</b>Disadvantage
      </span>
    </div>

    <div v-if="editing" class="editor">
      <label class="f f--full">
        <span>Name</span>
        <input v-model="attack.name" />
      </label>
      <label class="f">
        <span>Type</span>
        <select v-model="attack.type">
          <option value="">None</option>
          <option v-for="w in typeOptions" :key="w.id" :value="w.id">
            {{ w.parent ? `\u00a0\u00a0${w.name}` : w.name }}
          </option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>Grade</span>
        <input v-model="attack.grade" type="number" min="0" />
      </label>
      <label class="f f--narrow">
        <span>Melee/Ranged</span>
        <select v-model="attack.kind">
          <option v-for="k in WEAPON_KINDS" :key="k.id" :value="k.id">{{ k.name }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>{{ rangeLabel }}</span>
        <input v-model="attack.range" />
      </label>

      <div class="rule">Properties</div>

      <div class="props">
        <button
          v-for="p in WEAPON_PROPERTIES"
          :key="p.id"
          type="button"
          class="prop"
          :aria-pressed="attack.properties?.[p.id] ? 'true' : 'false'"
          @click="attack.properties[p.id] = !attack.properties[p.id]"
        >
          {{ p.name }}
        </button>
      </div>
      <label v-if="attack.properties?.thrown" class="f f--narrow">
        <span>Thrown range</span>
        <input v-model="attack.thrownRange" placeholder="20 ft." />
      </label>
      <label v-if="attack.properties?.ammunition" class="f">
        <span>Ammunition</span>
        <input v-model="attack.ammunitionType" placeholder="Clip" />
      </label>

      <div class="rule">Attack</div>

      <label class="f f--check">
        <input v-model="attack.rollsToHit" type="checkbox" />
        <span>Attack roll</span>
      </label>
      <label class="f f--narrow">
        <span>Ability</span>
        <select v-model="attack.ability" :disabled="!attack.rollsToHit">
          <option value="">Auto ({{ autoAbility }})</option>
          <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.abbr }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>Adjust</span>
        <input v-model="attack.attackMisc" :disabled="!attack.rollsToHit" />
      </label>
      <label class="f f--narrow">
        <span>Override</span>
        <input
          v-model="attack.attackPower"
          :disabled="!attack.rollsToHit"
          :placeholder="formatModifier(atk.derived)"
        />
      </label>
      <label class="f f--break">
        <span>Proficient</span>
        <select v-model="attack.proficient">
          <option v-for="o in proficientOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>Crits on</span>
        <select v-model.number="attack.critFrom" :disabled="!attack.rollsToHit">
          <option v-for="n in CRIT_OPTIONS" :key="n" :value="n">
            {{ n === 20 ? '20' : `${n}-20` }}
          </option>
        </select>
      </label>

      <p v-if="attack.rollsToHit" class="sum">{{ derivedParts }}</p>

      <div class="rule">Damage</div>

      <label class="f f--narrow">
        <span>Base dice</span>
        <input v-model="attack.baseDamage" placeholder="1d8" />
      </label>
      <label class="f">
        <span>Type</span>
        <input v-model="attack.damageType" />
      </label>
      <label class="f f--narrow">
        <span>Adjust</span>
        <input v-model="attack.damageMisc" />
      </label>
      <label class="f f--narrow">
        <span>Override</span>
        <input v-model="attack.damage" :placeholder="dmg.derived" />
      </label>
      <label class="f f--narrow">
        <span>Crit extra</span>
        <input v-model="attack.critExtra" />
      </label>

      <p v-if="damageParts" class="sum">{{ damageParts }}</p>

      <label class="f f--narrow f--break">
        <span>Damage 2</span>
        <input v-model="attack.damage2" />
      </label>
      <label class="f">
        <span>Type</span>
        <input v-model="attack.damage2Type" :disabled="!attack.damage2" />
      </label>
      <label class="f f--narrow">
        <span>Crit extra</span>
        <input v-model="attack.crit2Extra" :disabled="!attack.damage2" />
      </label>

      <div class="rule">Saving Throw</div>

      <label class="f f--narrow">
        <span>Ability</span>
        <select v-model="attack.saveAbility">
          <option value="">None</option>
          <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.abbr }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>DC</span>
        <input v-model="attack.saveDC" :disabled="!attack.saveAbility" />
      </label>
      <label class="f">
        <span>On a success</span>
        <input v-model="attack.saveEffect" :disabled="!attack.saveAbility" />
      </label>

      <div class="rule">Mastery</div>

      <label class="f">
        <span>Mastery</span>
        <select v-model="attack.isMastery">
          <option v-for="o in masteryOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>Feature</span>
        <select v-model="attack.mastery">
          <option value="">None</option>
          <option v-for="m in MASTERY_FEATURES" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>

      <label class="f f--full">
        <span>Notes</span>
        <textarea v-model="attack.notes" rows="2" />
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;
@use './attackRow.scss' as *;

@include attack-row;

.sum {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 10px;
  color: var(--ps-text-muted);
}

.stat--warn > b { color: var(--ps-red); }

.props {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.prop {
  @include ps-chip(true);
  font-size: 9px;
}

.roll--toggle[aria-pressed='true'] {
  background: var(--ps-fill);
  border-color: var(--ps-fill);
  color: var(--ps-on-fill);
}
</style>
