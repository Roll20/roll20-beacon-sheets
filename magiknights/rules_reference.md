# Magi-Knights Awakening: Technical Rule Specification for AI System Parsing

## 1. Character Statistics and Base Modifiers
### 1.1 Core Statistics
Characters are defined by six primary Statistics: **Strength (STR)**, **Dexterity (DEX)**, **Constitution (CON)**, **Intelligence (INT)**, **Wisdom (WIS)**, and **Charisma (CHA)**.
*   **Generation (Herald’s Array):** 15, 14, 13, 12, 11, 8.
*   **Generation (Fate Influence):** Characters roll **5d4**. Players may **"Accept Fate"** (rerolling dice matching a secret Fate Die) or **"Deny Fate"** (removing the lowest die and reducing the highest by 1).
*   **Statistic Range:** During creation, values must be between **6 and 16**.
*   **Mortal Limit:** Statistics can reach **22**, but the **Statistic Modifier is capped at +5** until the **"Exceed a Mortal’s Limits"** requirement is met at **Reputation Level IV**.

### 1.2 Modifier Table
| Score | Modifier |
| :--- | :--- |
| 6–7 | -2 |
| 8–9 | -1 |
| 10–11 | +0 |
| 12–13 | +1 |
| 14–15 | +2 |
| 16–17 | +3 |
| 18–19 | +4 |
| 20–21 | +5 |
| 22 (Max) | +5 (Mortal) / +6 (Exceeded) |
*Citations:.*

## 2. Hit Point and Mana Resource Systems
### 2.1 Persona Hit Points
Characters maintain two independent HP pools.
*   **Student Hit Points (SHP):** `10 + CON Modifier + Reputation Level`.
*   **Magi-Knight Hit Points (Lv 1):** `10 + CON Modifier`.
*   **Magi-Knight HP Scaling:** Levels **2–15** gain `6 + CON Modifier` (implied by leveling logic in context).
*   **Recovery:** Students restore **1/2 total SHP** at the end of any Phase. Magi-Knights recover all HP only during a **Refreshing Sleep**.

### 2.2 Mana Points (MP)
Magic is fueled by MP, governed by the **Mana Coefficient (MCO)**.
*   **MCO Formula:** `Magi-Knight Level + Magic Ability Modifier (MAM) + Reputation Level`.
*   **Standard MP Total:** `MCO * 2`.
*   **Magical Implement MP:** `MCO * 3` (Requires **Mana Attunement** quality).

## 3. Combat and Magic Calculations
### 3.1 Martial Calculations
*   **Weapon Attack Bonus:** `Proficiency Bonus + STR Modifier` (or **DEX** for **Finesse** weapons).
*   **Weapon Damage:** `Base Dice + STR Modifier` (or **DEX** for Finesse weapons).
*   **Student Unarmed Attack:** `Proficiency Bonus + STR or DEX`.
*   **Student Damage:** `1d4 + STR or DEX Modifier` (upgraded to **1d6** with **Martial Artist** Tactic).

### 3.2 Magic Calculations
*   **Magic Ability Modifier (MAM):** Style-dependent (Ethereal: INT/WIS; Memento/Shaper/Release: INT/WIS/CHA; Soul: WIS/CHA; Verse: INT/CHA).
*   **Spell Attack Bonus:** `Proficiency Bonus + MAM`.
*   **Spell DC:** `8 + Proficiency Bonus + MAM`.
*   **Self-Healing Restriction:** Caster **cannot add modifiers** to healing or Temp HP if they are the target.

### 3.3 Defense and Movement
*   **Student Armor:** `10 + CON Modifier + DEX Modifier`.
*   **Magi-Knight Armor:** Fixed values based on **Elemental Affinity** (Earth 16, Fire 15, Air 14, Water 14, Void 13) + **Reputation/Form** bonuses.
*   **Movement:** Base 30 ft. Earth and Void elements reduce base to **20 ft.**.

## 4. Psychological and Death Mechanics
### 4.1 Stress and Exhaustion
*   **Cap:** Both track from **Level 0 to 6**.
*   **The Endurance Die:** Roll a **d6** when making checks; success if `d6 >= point level`.
*   **Level 6 Penalties:** Always imposes **Disadvantage** on applicable rolls; triggers **Oppressive Stress** (Trauma point).

### 4.2 Crystalline Fracturing (Death Logic)
Characters have **7 Facets**; an **8th fracture is permanent death**.
*   **Triggers:** Reaching **0 HP** (+1), using **Heroic Conviction** (+1), **Forced Transformation** (+3), or receiving attacks while **Exposed/Unconscious**.
*   **Exposed Condition:** Occurs at 0 HP if Heroic Conviction is not used. Character limited to **Free Actions**.

## 5. Condition Registry
| Condition | Core Mechanical Penalty | Removal Requirement |
| :--- | :--- | :--- |
| **Horrified** | Initiative floor; -10 to rolls; cannot attack; gain 1 Stress. | End-of-turn **Purity** check. |
| **Distressed** | **Disadvantage** on Skill/Attack checks; fail Leadership. | Standard Action **Purity** check. |
| **Berserk** | Immune to Horror/Distress; lose Magic and Total Focus. | End-of-turn **Purity** (DC 15). |
| **Drained** | MP costs +1 Tier; Move is 0; Disadvantage on attacks. | Standard Action **Mysticism** (DC 14). |
| **Restrained** | Move is 0; no Spells/Reactions; Melee range 5ft. | Standard Action **Athletics/Mysticism**. |
| **Silenced** | Cannot cast new spells or use speech-based skills. | Standard Action **Mysticism**. |

## 6. Action Economy
*   **Standard:** Attacks, spells, or complex object interaction.
*   **Move:** 30ft base (20ft for Earth/Void); 15ft used to change **Prone**.
*   **Bonus:** Summoning items, "Flare" abilities, or Quickened spells.
*   **Reaction:** One per round; used for **Provoked Attacks** or Parry techniques.
*   **Immediate:** Responses to triggers; can be used outside own turn.
*   **Full-Round:** Combination of Move, Standard, and Bonus actions.

## 7. Progression and Scaling
### 7.1 Proficiency Bonus (PB)
Scaled by **Reputation Level (RL)**:
*   **RL 0:** +2
*   **RL I–II:** +3
*   **RL III:** +4
*   **RL IV:** +5
*   **RL V:** +6

### 7.2 Unity and Formations
*   **Unity Points:** Used for **Combination Maneuvers**; cap increases with RL (Max 4).
*   **Tactical Formations:** Require **3 Magi-Knights** within 60 ft; cost **2–3 Inspiration Points**.

## 8. Target Logic
### 8.1 Enemy Ranks and Initiative
*   **Vassal:** Default fodder.
*   **Adversary:** Initiative 14 (approx); significant threats.
*   **Nemesis:** Major foes; typically immune to certain conditions.
*   **Horde/Swarm:** Usually **4 Units/Parts**. Damage to single units reduces total effectiveness; **Explosion** spells hit all parts.
