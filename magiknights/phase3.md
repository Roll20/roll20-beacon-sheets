# Phase 3 Implementation Summary

## Task 3.1: Weapon Qualities System

### sheetStore.js - Weapon Qualities

Changed `soul_weapon.qualities` from a text string to an object with boolean flags:

```javascript
qualities: ref({
  accurate: false,      // +1 to attack rolls
  coupled: false,       // Can be used with another weapon (informational)
  ensnaring: false,     // Grapple on hit (informational)
  finesse: false,       // Can use DEX instead of STR for attack/damage
  forceful: false,      // +1 to damage rolls
  massive: false,       // -2 to attack, +4 to damage
  staggeringBlow: false, // Knockback effect (informational)
  twoHanded: false,     // Requires both hands (informational)
  veilPiercing: false,  // Critical hit on 16+ (instead of only 20)
  vicious: false        // On crit, maximize duplicated damage dice
})
```

**Computed Properties Added:**
- `weaponQualityDefs` - Quality definitions with name, effect, and category for UI
- `weaponQualityAttackBonus` - Calculates attack bonus from qualities (Accurate: +1, Massive: -2)
- `weaponQualityDamageBonus` - Calculates damage bonus from qualities (Forceful: +1, Massive: +4)
- `weaponCritRange` - Returns 16 if Veil-Piercing is active, otherwise 20
- `activeWeaponQualities` - List of active quality names for display

**Roll Functions Updated:**
- `rollKnightAttack` - Now includes quality attack bonus and displays crit range
- `rollKnightDamage` - Now includes quality damage bonus

### WeaponQualitiesSelector.vue

New component for selecting weapon qualities:
- Checkbox grid organized by category (Attack Modifiers, Damage Modifiers, Attack & Damage, Special)
- Shows active qualities summary with tags
- Displays modifier badges (Attack, Damage, Crit Range)
- Two-Handed + Shield conflict warning

---

## Task 3.2: Soul Guns System

### sheetStore.js - Soul Gun Data

Added complete Soul Gun data structure parallel to Soul Weapon:

```javascript
const soul_gun = {
  name: ref(''),
  range: ref(''),
  damage: ref(''),
  damageType: ref('physical'),
  qualities: ref({
    accurate: false,      // +1 to attack rolls
    longRange: false,     // Double effective range
    rapidFire: false,     // Can attack twice with -2 penalty
    scatter: false,       // +2 damage at close range (5ft)
    silenced: false,      // Does not reveal position (informational)
    veilPiercing: false,  // Critical hit on 16+
    vicious: false        // On crit, maximize duplicated dice
  }),
  collapsed: ref(true)
};
```

**Computed Properties Added:**
- `gunQualityDefs` - Quality definitions for UI
- `gunQualityAttackBonus` - Calculates attack bonus (Accurate: +1)
- `gunQualityDamageBonus` - Placeholder for situational bonuses
- `gunCritRange` - Returns 16 if Veil-Piercing is active
- `activeGunQualities` - List of active quality names

**Roll Functions Added:**
- `rollGunAttack()` - Rolls gun attack with quality bonuses, displays crit range and weapon range
- `rollGunDamage()` - Rolls gun damage with quality bonuses, shows Scatter reminder if active

### GunQualitiesSelector.vue

New component for selecting gun qualities:
- Checkbox grid organized by category (Attack Modifiers, Damage Modifiers, Special)
- Shows active qualities summary
- Displays modifier badges (Attack, Damage, Crit Range)

### KnightView.vue Updates

- Added Soul Gun section after Soul Weapon section
- Collapsed view shows Attack/Damage roll buttons, gun name, damage type tag, and active qualities
- Expanded view shows name, range, damage inputs with damage type selector and qualities selector

---

## Task 3.3: Magical Implements System

### sheetStore.js - Magical Implement Data

Added Magical Implement data structure for spell-casting focus:

```javascript
const magical_implement = {
  name: ref(''),
  description: ref(''),
  qualities: ref({
    manaAttunement: false,    // MP = MCO * 3 instead of MCO * 2
    spellFocus: false,        // +1 to spell attack rolls
    channeling: false,        // +1 to spell DC
    quickCast: false,         // Can cast one Tier I spell as bonus action per rest
    wardingFocus: false       // +1 to magical damage resistance
  }),
  collapsed: ref(true)
};
```

**Key Feature: Mana Attunement**

Updated `mp_max` computed property to use the MCO × 3 multiplier when Mana Attunement is active:

```javascript
const mp_max = computed({
  get() {
    // ...
    const mamMod = abilityScores[mam.value]?.mod.value || 0;
    const mco = level.value + mamMod + reputation.value;
    // Mana Attunement (from Magical Implement): MCO × 3, Standard: MCO × 2
    const hasManaAttunement = magical_implement?.qualities?.value?.manaAttunement ?? false;
    const multiplier = hasManaAttunement ? 3 : 2;
    return mco * multiplier;
  }
});
```

**Computed Properties Added:**
- `implementQualityDefs` - Quality definitions for UI
- `hasManaAttunement` - Boolean for checking Mana Attunement status
- `implementSpellAttackBonus` - +1 if Spell Focus is active
- `implementSpellDCBonus` - +1 if Channeling is active
- `activeImplementQualities` - List of active quality names

### ImplementQualitiesSelector.vue

New component for selecting implement qualities:
- Checkbox grid organized by category (Mana, Spell Attack, Spell DC, Special)
- Shows active qualities summary
- Displays modifier badges (MP formula, Spell Attack bonus, Spell DC bonus)

### KnightView.vue Updates

- Added Magical Implement section after Soul Gun section
- Collapsed view shows implement name, Mana Attunement badge, and active qualities
- Expanded view shows name, description textarea, and qualities selector

---

## Files Modified

- `src/stores/sheetStore.js` - Added soul_gun, magical_implement data structures, computed properties, roll functions, dehydrate/hydrate functions, and exports
- `src/views/PC/KnightView.vue` - Added Soul Gun and Magical Implement sections with UI
- `src/components/WeaponQualitiesSelector.vue` - New component (from Task 3.1)
- `src/components/GunQualitiesSelector.vue` - New component
- `src/components/ImplementQualitiesSelector.vue` - New component

## Data Persistence

All three systems (Soul Weapon, Soul Gun, Magical Implement) include:
- Dehydrate functions to save data to Roll20
- Hydrate functions to restore data from Roll20
- Backwards compatibility handling for quality objects (ignores old string format)
