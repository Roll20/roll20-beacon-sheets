import { describe, it, expect } from 'vitest';

import { createEmptyEntity } from '@/crucible/schemas/crucibleEntity.schema';
import { migrateEntity, parseCrucibleEntity } from '@/crucible/schemas/crucibleValidation';
import { createAction } from '@/crucible/schemas/crucibleAction.schema';

import { threatBudgetForLevel, calculateThreatBudget } from './calculateThreatBudget';
import { calculateThreatRating } from './calculateThreatRating';
import { calculateEncounterDifficulty } from './calculateEncounterDifficulty';
import { recommendCreatureStats } from './recommendCreatureStats';
import { computeCrucibleDerived } from './computeCrucibleDerived';
import { validateCrucibleEntity, canDeploy } from './validateCrucibleEntity';
import { scaleCrucibleEntity } from './scaleCrucibleEntity';
import { applyCrucibleTemplate } from './applyCrucibleTemplate';
import { parseCrucibleIntent } from './parseCrucibleIntent';
import { generateEntityFromPrompt } from './generateEntityDraft';
import { formatStatblockText } from './formatStatblock';
import { convertEntityToRoll20, playerSafeEntity } from './convertEntityToRoll20';
import { generateTokenActions } from './generateTokenActions';
import { createRng } from './seededRandom';
import {
  outnumberingModifier,
  bandFor,
  proficiencyBonusForLevel,
} from '@/crucible/data/registries/threatBalance.registry';
import { stepHitDie, sizeById } from '@/crucible/data/registries/creatureSizes.registry';
import { CREATURE_ROLES, roleById } from '@/crucible/data/registries/creatureRoles.registry';
import { CREATURE_TEMPLATES } from '@/crucible/data/registries/creatureTemplates.registry';
import { CREATURE_TRAITS } from '@/crucible/data/registries/creatureTraits.registry';
import { CREATURE_ACTIONS } from '@/crucible/data/registries/creatureActions.registry';
import {
  NPC_ARCHETYPES,
  npcArchetypeById,
} from '@/crucible/data/registries/npcArchetypes.registry';
import { npcMotivationById } from '@/crucible/data/registries/npcMotivations.registry';
import { ENCOUNTER_ENVIRONMENTS } from '@/crucible/data/registries/encounterEnvironments.registry';
import { hazardTypeById } from '@/crucible/data/registries/hazardTypes.registry';

const NOW = '2026-08-06T00:00:00.000Z';

// ---------------------------------------------------------------------------
// Threat Budget (Bestiary L68: 3 at L0, 5 at L1, +1/level, reset to 5 on PB up)
// ---------------------------------------------------------------------------

describe('threatBudgetForLevel', () => {
  it('is 3 at level 0 and 5 at level 1', () => {
    expect(threatBudgetForLevel(0)).toBe(3);
    expect(threatBudgetForLevel(1)).toBe(5);
  });

  it('increases by 1 per level and resets to 5 when PB rises', () => {
    // PB progression 1+floor((L-1)/3): PB rises at 4, 7, 10, ...
    expect(threatBudgetForLevel(2)).toBe(6);
    expect(threatBudgetForLevel(3)).toBe(7);
    expect(threatBudgetForLevel(4)).toBe(5); // PB 1 -> 2, reset
    expect(threatBudgetForLevel(5)).toBe(6);
    expect(threatBudgetForLevel(6)).toBe(7);
    expect(threatBudgetForLevel(7)).toBe(5); // PB 2 -> 3, reset
  });

  it('adds Curio rarity steps above Common to the budget', () => {
    const result = calculateThreatBudget([{ level: 3, highestCurioRarity: 'rare' }, { level: 3 }]);
    expect(result.perMember[0].budget).toBe(7 + 2);
    expect(result.perMember[1].budget).toBe(7);
    expect(result.total).toBe(16);
  });

  it('honours manual overrides', () => {
    const result = calculateThreatBudget([{ level: 10, manualThreatBudgetOverride: 42 }]);
    expect(result.total).toBe(42);
    expect(result.perMember[0].overridden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Outnumbering (Bestiary L77-79)
// ---------------------------------------------------------------------------

describe('outnumberingModifier', () => {
  it('matches the Bestiary worked examples', () => {
    expect(outnumberingModifier(10, 5)).toBe(2); // 5 PCs vs 10 enemies = +2
    expect(outnumberingModifier(15, 5)).toBe(3); // 5 PCs vs 15 enemies = +3
    expect(outnumberingModifier(3, 5)).toBe(-1); // PCs outnumber = -1
    expect(outnumberingModifier(5, 5)).toBe(0);
    expect(outnumberingModifier(6, 5)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Greater Proficiency + Curios on creatures (Bestiary L85-88)
// ---------------------------------------------------------------------------

describe('calculateThreatRating', () => {
  it('adjusts by the PB gap and floors at zero', () => {
    const entity = createEmptyEntity('e1', 'monster', NOW);
    entity.progression.threatRating = 5;
    entity.progression.level = 10; // PB +4

    const vsWeaker = calculateThreatRating(entity, { averagePartyProficiencyBonus: 2 });
    expect(vsWeaker.adjustedThreat).toBe(7); // 5 + (4-2)

    const vsStronger = calculateThreatRating(entity, { averagePartyProficiencyBonus: 10 });
    expect(vsStronger.adjustedThreat).toBe(0); // floored
    expect(vsStronger.zeroed).toBe(true);
  });

  it('raises threat by Curio rarity above Common', () => {
    const entity = createEmptyEntity('e2', 'monster', NOW);
    entity.progression.threatRating = 4;
    entity.progression.level = 4; // PB +2
    entity.progression.highestCurioRarity = 'veryRare';
    const result = calculateThreatRating(entity, { averagePartyProficiencyBonus: 2 });
    expect(result.adjustedThreat).toBe(7); // 4 + 3 rarity steps
  });
});

// ---------------------------------------------------------------------------
// Encounter difficulty
// ---------------------------------------------------------------------------

describe('calculateEncounterDifficulty', () => {
  const enemy = (tr: number, level: number, count = 1) => {
    const e = createEmptyEntity(`enemy-${tr}-${count}-${level}`, 'monster', NOW);
    e.identity.name = `TR${tr}`;
    e.progression.threatRating = tr;
    e.progression.level = level;
    return { entity: e, count };
  };

  it('produces the four bands in order', () => {
    // 4 x level 5 PCs: budget 6 each = 24, partySize 4.
    const party = Array.from({ length: 4 }, (_, i) => ({ name: `PC${i}`, level: 5 }));
    const run = (tr: number) =>
      calculateEncounterDifficulty({
        party,
        enemies: [enemy(tr, 5)],
        alliedCreatures: [],
        hazards: [],
        environmentModifiers: [],
      });
    // level-5 enemy has PB 2, same as the party, so no adjustment; but a single
    // enemy vs 4 PCs takes the -1 outnumbered modifier.
    expect(run(5).difficulty).toBe('easy'); // 5-1=4 < 12
    expect(run(13).difficulty).toBe('medium'); // 12 <= 12 < 20
    expect(run(22).difficulty).toBe('hard'); // 20 <= 21 < 28
    expect(run(40).difficulty).toBe('deadly'); // 39 >= 28
  });

  it('subtracts allies, adds hazards and environment', () => {
    const party = [{ level: 5 }, { level: 5 }];
    const result = calculateEncounterDifficulty({
      party,
      enemies: [enemy(8, 5, 2)],
      alliedCreatures: [enemy(3, 5)],
      hazards: [enemy(2, 5)],
      environmentModifiers: [{ id: 'env', label: 'Storm', value: 1 }],
    });
    // enemies 16, hazard +2, env +1, allies -3, outnumbering 0 (2v2 enemies... actually
    // enemyCount 2 vs 2 PCs = 0) => 16.
    expect(result.enemyThreatTotal).toBe(16);
    expect(result.lines.some((l) => l.label === 'Friendly Monsters')).toBe(true);
  });

  it('counts every 10 zero-rated creatures as +1', () => {
    const party = [{ level: 30 }, { level: 30 }]; // huge PB
    const result = calculateEncounterDifficulty({
      party,
      enemies: [enemy(1, 1, 20)], // 20 chaff floored to 0
      alliedCreatures: [],
      hazards: [],
      environmentModifiers: [],
    });
    expect(result.zeroedThreat).toBe(2);
  });

  it('formats a human-readable derivation', () => {
    const party = [{ level: 7 }, { level: 7 }, { level: 7 }, { level: 7 }];
    const result = calculateEncounterDifficulty({
      party,
      enemies: [enemy(12, 7)],
      alliedCreatures: [],
      hazards: [],
      environmentModifiers: [],
    });
    // Level 7: PB just rose (reset) -> budget 5 each = 20.
    expect(result.partyBudget.total).toBe(20);
    expect(result.reason.length).toBeGreaterThan(20);
    expect(result.lines[0].detail?.length).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

describe('recommendCreatureStats', () => {
  it('recommends a coherent standard enemy', () => {
    const rec = recommendCreatureStats({
      partySize: 4,
      partyLevels: [6, 6, 6, 6],
      desiredDifficulty: 'medium',
      enemyCount: 1,
      roleIds: ['bruiser'],
      kind: 'standard',
    });
    expect(rec.threatRatingLow).toBeGreaterThan(0);
    expect(rec.threatRatingHigh).toBeGreaterThanOrEqual(rec.threatRatingLow);
    expect(rec.hitPointsHigh).toBeGreaterThan(rec.hitPointsLow);
    expect(rec.proficiencyBonus).toBe(proficiencyBonusForLevel(6));
    expect(rec.allowApex).toBe(false);
    expect(rec.reason).toContain('4 level 6 PCs');
    // A single standard creature should warn about action economy.
    expect(rec.warnings.length).toBeGreaterThan(0);
  });

  it('scales bosses up and minions down', () => {
    const base = {
      partySize: 4,
      partyLevels: [8, 8, 8, 8],
      desiredDifficulty: 'hard' as const,
      enemyCount: 1,
      roleIds: ['tank'],
    };
    const boss = recommendCreatureStats({ ...base, kind: 'boss' });
    const minion = recommendCreatureStats({ ...base, kind: 'minion', enemyCount: 8 });
    expect(boss.hitPointsHigh).toBeGreaterThan(minion.hitPointsHigh * 3);
    expect(boss.allowApex).toBe(true);
    expect(boss.actionPoints).toBeGreaterThan(3);
    expect(minion.allowApex).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Derived stats (formulas verified against Bestiary exemplars)
// ---------------------------------------------------------------------------

describe('computeCrucibleDerived', () => {
  it('reproduces the Bandit Veteran hit points (15d8+45 = 112)', () => {
    const e = createEmptyEntity('bandit', 'monster', NOW);
    e.attributes = {
      might: 18,
      instinct: 14,
      focus: 10,
      conviction: 16,
      resonance: 12,
      presence: 11,
    };
    e.classification.sizeId = 'medium'; // d8
    e.defenses.hitDiceCount = 15;
    const d = computeCrucibleDerived(e);
    expect(d.hitPoints).toBe(112); // floor(15*4.5)=67 + 15*3=45
    expect(d.hitPointsFormula).toBe('15d8+45');
    expect(d.initiative).toBe(2);
  });

  it('computes Natural Armor and Toughened Hide per the Bestiary', () => {
    const e = createEmptyEntity('hide', 'monster', NOW);
    e.attributes.instinct = 14;
    e.attributes.conviction = 16;
    e.defenses.armorMode = 'natural';
    expect(computeCrucibleDerived(e).armorClass).toBe(12);
    e.defenses.armorMode = 'toughenedHide';
    expect(computeCrucibleDerived(e).armorClass).toBe(15);
  });

  it('computes saves from paired attributes with proficiency', () => {
    const e = createEmptyEntity('saves', 'monster', NOW);
    e.attributes = {
      might: 18,
      instinct: 14,
      focus: 10,
      conviction: 16,
      resonance: 12,
      presence: 11,
    };
    e.progression.level = 7; // PB +3... 1+floor(6/3)=3
    e.saves.proficient.body = true;
    const d = computeCrucibleDerived(e);
    expect(d.proficiencyBonus).toBe(3);
    expect(d.saves.body).toBe(4 + 2 + 3); // Might +4, Instinct +2, PB
    expect(d.saves.mind).toBe(0 + 3); // Focus 0, Conviction +3
    expect(d.saves.soul).toBe(1 + 0);
  });

  it('applies role modifiers: tank steps the hit die and adds PB hit dice', () => {
    const e = createEmptyEntity('tank', 'monster', NOW);
    e.progression.level = 7; // PB 3
    e.classification.sizeId = 'medium'; // d8 -> d10 with tank
    e.defenses.hitDiceCount = 5; // + PB 3 => 8 dice
    e.classification.roleIds = ['tank'];
    const d = computeCrucibleDerived(e);
    expect(d.hitDieSize).toBe(10);
    expect(d.hitDiceCount).toBe(8);
  });

  it('computes caster values through the maker formulas', () => {
    const e = createEmptyEntity('caster', 'monster', NOW);
    e.progression.level = 8;
    e.attributes.resonance = 16;
    e.attributes.focus = 14;
    e.magic.isCaster = true;
    e.magic.casterType = 'High-Caster';
    e.magic.castingAttribute = 'resonance';
    const d = computeCrucibleDerived(e);
    expect(d.casterLevel).toBe(8);
    expect(d.maxArteTier).toBe(4);
    expect(d.aether).toBe(16);
    // DC = 6 + casting attr (3) + PB (1+floor(7/3)=3) + resonance (3) = 15
    expect(d.arteSaveDc).toBe(15);
    // Attack = casting attr (3) + PB (3) + focus (2) = 8
    expect(d.arteAttack).toBe(8);
  });

  it('estimates damage per round from the best affordable actions', () => {
    const e = createEmptyEntity('dpr', 'monster', NOW);
    e.attributes.might = 18;
    e.actions = [
      createAction({
        id: 'bite',
        name: 'Bite',
        actionPointCost: 2,
        damage: [
          { id: 'd1', count: 2, die: 8, flat: 0, abilityBonus: 'might', damageType: 'Piercing' },
        ],
      }),
    ];
    const d = computeCrucibleDerived(e);
    // 2d8 avg 9 + 4 = 13; AP 3 allows one 2-AP attack = 13
    expect(d.damagePerRound).toBe(13);
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe('validateCrucibleEntity', () => {
  it('errors on a nameless entity and blocks deployment', () => {
    const e = createEmptyEntity('v1', 'monster', NOW);
    e.derived = computeCrucibleDerived(e);
    const issues = validateCrucibleEntity(e);
    expect(issues.some((i) => i.code === 'missing-name' && i.level === 'error')).toBe(true);
    expect(canDeploy(issues)).toBe(false);
  });

  it('warns when a minion token has linked HP', () => {
    const e = createEmptyEntity('v2', 'minion', NOW);
    e.identity.name = 'Grunt';
    e.token.bar1.linked = true;
    e.derived = computeCrucibleDerived(e);
    const issues = validateCrucibleEntity(e);
    expect(issues.some((i) => i.code === 'minion-linked-hp')).toBe(true);
  });

  it('warns when a boss has no off-turn actions or phases', () => {
    const e = createEmptyEntity('v3', 'boss', NOW);
    e.identity.name = 'The Warden';
    e.derived = computeCrucibleDerived(e);
    const issues = validateCrucibleEntity(e);
    expect(issues.some((i) => i.code === 'boss-no-off-turn')).toBe(true);
    expect(issues.some((i) => i.code === 'boss-no-phases')).toBe(true);
  });

  it('errors when a phase references a missing action', () => {
    const e = createEmptyEntity('v4', 'boss', NOW);
    e.identity.name = 'Phased';
    e.boss = {
      phases: [
        {
          id: 'p1',
          name: 'Two',
          order: 1,
          trigger: { type: 'hpThreshold', value: 50 },
          hpBehavior: 'sharedPool',
          addedTraits: [],
          removedTraits: [],
          addedActions: ['missing-action'],
          removedActions: [],
          defenseChanges: [],
          resourceChanges: [],
          transitionText: '',
        },
      ],
      activePhaseId: null,
      apexActionsPerRound: 2,
      overtureUnlocksAtPhase: null,
      legendaryResistances: 0,
      lairInitiative: null,
      lairDescription: '',
    };
    e.derived = computeCrucibleDerived(e);
    const issues = validateCrucibleEntity(e);
    expect(issues.some((i) => i.code === 'phase-missing-action' && i.level === 'error')).toBe(true);
  });

  it('warns on unspendable Aether', () => {
    const e = createEmptyEntity('v5', 'monster', NOW);
    e.identity.name = 'Mage';
    e.magic.isCaster = true;
    e.magic.casterType = 'Mid-Caster';
    e.progression.level = 6;
    e.derived = computeCrucibleDerived(e);
    const issues = validateCrucibleEntity(e);
    expect(issues.some((i) => i.code === 'unspendable-aether')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scaling and templates
// ---------------------------------------------------------------------------

describe('scaleCrucibleEntity', () => {
  it('moves hit points toward the target band and re-rates the entity', () => {
    const e = createEmptyEntity('s1', 'monster', NOW);
    e.identity.name = 'Scaley';
    e.attributes = {
      might: 14,
      instinct: 12,
      focus: 10,
      conviction: 14,
      resonance: 10,
      presence: 10,
    };
    e.defenses.hitDiceCount = 5;
    e.progression.threatRating = 3;
    e.derived = computeCrucibleDerived(e);
    const before = e.derived.hitPoints;

    const result = scaleCrucibleEntity(e, { targetThreatRating: 10 });
    expect(result.entity.progression.threatRating).toBe(10);
    expect(result.entity.derived.hitPoints).toBeGreaterThan(before);
    expect(result.notes.length).toBeGreaterThan(0);
  });
});

describe('applyCrucibleTemplate', () => {
  it('applies deltas, lists, and records the template id', () => {
    const template = CREATURE_TEMPLATES[0];
    const e = createEmptyEntity('t1', 'monster', NOW);
    e.identity.name = 'Base';
    e.derived = computeCrucibleDerived(e);
    const result = applyCrucibleTemplate(e, template.id);
    expect(result.entity.creationContext.appliedTemplateIds).toContain(template.id);
    expect(result.notes.length).toBeGreaterThan(0);
    // The source entity must not be mutated.
    expect(e.creationContext.appliedTemplateIds).toHaveLength(0);
  });

  it('reports unknown templates instead of throwing', () => {
    const e = createEmptyEntity('t2', 'monster', NOW);
    const result = applyCrucibleTemplate(e, 'no-such-template');
    expect(result.unresolved).toContain('no-such-template');
  });
});

// ---------------------------------------------------------------------------
// Intent parsing (deterministic Spark mode)
// ---------------------------------------------------------------------------

describe('parseCrucibleIntent', () => {
  it('parses the directive example prompt', () => {
    const intent = parseCrucibleIntent(
      'Make me a level 8 blackstone war beast for 4 level 7 players.',
    );
    expect(intent.level?.value).toBe('8');
    expect(intent.partySize?.value).toBe('4');
    expect(intent.partyLevel?.value).toBe('7');
    expect(intent.roleIds.map((r) => r.value)).toContain('bruiser'); // "war beast"
    expect(intent.themeWords).toContain('blackstone');
  });

  it('reads a social NPC prompt as an NPC', () => {
    const intent = parseCrucibleIntent(
      'Make a suspicious merchant who secretly knows where the Fallstar relic is.',
    );
    expect(intent.kind?.value).toBe('npc');
    expect(intent.socialLean).toBe(true);
    expect(intent.properName).toContain('Fallstar');
  });

  it('is deterministic: same prompt, same seed', () => {
    const a = parseCrucibleIntent('a terrifying cathedral monster');
    const b = parseCrucibleIntent('a terrifying cathedral monster');
    expect(a.seed).toBe(b.seed);
    expect(a.descriptors).toContain('terrifying');
  });

  it('detects swarms, hazards, and difficulty words', () => {
    expect(parseCrucibleIntent('a swarm of rats').kind?.value).toBe('swarm');
    expect(parseCrucibleIntent('a poison gas trap for the vault').kind?.value).toBe('trap');
    expect(parseCrucibleIntent('a deadly lich boss').difficulty?.value).toBe('deadly');
  });
});

// ---------------------------------------------------------------------------
// Full prompt-to-entity generation
// ---------------------------------------------------------------------------

describe('generateEntityFromPrompt', () => {
  it('produces a deployable creature from the directive example', () => {
    const { entity } = generateEntityFromPrompt(
      'Make me a level 8 blackstone war beast for 4 level 7 players.',
      { id: 'gen1', now: NOW },
    );
    expect(entity.identity.name.length).toBeGreaterThan(0);
    expect(entity.progression.level).toBe(8);
    expect(entity.creationContext.partyTarget.size).toBe(4);
    expect(entity.creationContext.partyTarget.averageLevel).toBe(7);
    expect(entity.derived.hitPoints).toBeGreaterThan(0);
    expect(entity.actions.length).toBeGreaterThan(0);
    expect(entity.assumptions.length).toBeGreaterThan(0);
    // No blocking errors: it should be playable as generated.
    expect(entity.validation.filter((v) => v.level === 'error')).toHaveLength(0);
    // Bruiser attribute spread leads with Might.
    expect(entity.attributes.might).toBeGreaterThanOrEqual(entity.attributes.focus);
  });

  it('is reproducible: same prompt yields the same entity', () => {
    const a = generateEntityFromPrompt('a terrifying cathedral monster', { id: 'x', now: NOW });
    const b = generateEntityFromPrompt('a terrifying cathedral monster', { id: 'x', now: NOW });
    expect(a.entity.identity.name).toBe(b.entity.identity.name);
    expect(a.entity.attributes).toEqual(b.entity.attributes);
    expect(a.entity.derived.hitPoints).toBe(b.entity.derived.hitPoints);
  });

  it('creates a social NPC with persona and no blocking errors', () => {
    const { entity } = generateEntityFromPrompt(
      'Make a suspicious merchant who secretly knows where the Fallstar relic is.',
      { id: 'npc1', now: NOW },
    );
    expect(entity.kind).toBe('npc');
    expect(entity.npc).toBeDefined();
    expect(entity.npc?.motivation.length).toBeGreaterThan(0);
    expect(entity.npc?.secret?.length).toBeGreaterThan(0);
    expect(entity.roll20.defaultOutput).toBe('gmWhisper');
    expect(entity.validation.filter((v) => v.level === 'error')).toHaveLength(0);
  });

  it('creates a boss with phases and apex actions', () => {
    const { entity } = generateEntityFromPrompt(
      'A brutal lich boss for 5 level 10 players, deadly difficulty',
      { id: 'boss1', now: NOW },
    );
    expect(entity.kind).toBe('boss');
    expect(entity.boss?.phases.length).toBeGreaterThanOrEqual(2);
    expect(entity.apexActions.length).toBeGreaterThan(0);
  });

  it('creates minions with generic unlinked tokens', () => {
    const { entity } = generateEntityFromPrompt(
      'a pack of 6 goblin minions for 3 level 2 players',
      {
        id: 'min1',
        now: NOW,
      },
    );
    expect(entity.kind).toBe('minion');
    expect(entity.token.identity).toBe('generic');
    expect(entity.token.bar1.linked).toBe(false);
  });

  it('creates a hazard with trigger and disable data', () => {
    const { entity } = generateEntityFromPrompt('a poison gas trap for a level 5 party', {
      id: 'haz1',
      now: NOW,
    });
    expect(entity.kind).toBe('trap');
    expect(entity.hazard).toBeDefined();
    expect(entity.hazard?.disable.dc).toBeGreaterThan(0);
  });

  it('marks generated flavour as [PROPOSED]', () => {
    const { entity } = generateEntityFromPrompt('a terrifying cathedral monster', {
      id: 'p1',
      now: NOW,
    });
    expect(entity.identity.description).toContain('[PROPOSED]');
  });
});

// ---------------------------------------------------------------------------
// Statblock output
// ---------------------------------------------------------------------------

describe('formatStatblockText', () => {
  it('renders the Convergence statblock sections in order', () => {
    const { entity } = generateEntityFromPrompt(
      'Make me a level 8 blackstone war beast for 4 level 7 players.',
      { id: 'sb1', now: NOW },
    );
    const text = formatStatblockText(entity);
    expect(text).toContain(entity.identity.name);
    expect(text).toContain('Threat Rating:');
    expect(text).toContain('Proficiency Bonus:');
    expect(text).toContain('Armor Class:');
    expect(text).toContain('Hit Points:');
    expect(text).toContain('Action Points:');
    expect(text).toContain('Body Save');
    // Bestiary print order: Conviction before Focus.
    expect(text.indexOf('Conviction')).toBeLessThan(text.indexOf('Focus'));
    expect(text).toContain('Core Actions');
  });

  it('drops GM-only sections in player-safe mode', () => {
    const { entity } = generateEntityFromPrompt('a terrifying cathedral monster', {
      id: 'sb2',
      now: NOW,
    });
    entity.identity.gmNotes = 'TOP SECRET';
    const safe = formatStatblockText(entity, { playerSafe: true });
    expect(safe).not.toContain('TOP SECRET');
    expect(safe).not.toContain('Behavior');
  });
});

// ---------------------------------------------------------------------------
// Roll20 conversion: secrets never reach the player channel
// ---------------------------------------------------------------------------

describe('convertEntityToRoll20', () => {
  it('keeps NPC secrets out of player-visible attributes', () => {
    const { entity } = generateEntityFromPrompt(
      'Make a suspicious merchant who secretly knows where the Fallstar relic is.',
      { id: 'r20', now: NOW },
    );
    entity.roll20.playerVisible = true;
    entity.identity.gmNotes = 'THE-SECRET-LOCATION';
    if (entity.npc) entity.npc.secret = 'KNOWS-THE-RELIC';

    const payload = convertEntityToRoll20(entity);
    const visible = JSON.stringify({
      crucible: payload.attributes.crucible,
      crucibleFlat: payload.attributes.crucibleFlat,
      crucibleStatblock: payload.attributes.crucibleStatblock,
    });
    expect(visible).not.toContain('THE-SECRET-LOCATION');
    expect(visible).not.toContain('KNOWS-THE-RELIC');
    // But the GM notes channel does carry them.
    expect(payload.gmNotes).toContain('KNOWS-THE-RELIC');
  });

  it('uses the concealed name when configured', () => {
    const e = createEmptyEntity('r21', 'monster', NOW);
    e.identity.name = 'Karvath the Devourer';
    e.roll20.concealName = true;
    e.roll20.concealedAs = 'Unknown Horror';
    e.derived = computeCrucibleDerived(e);
    expect(convertEntityToRoll20(e).name).toBe('Unknown Horror');
  });

  it('playerSafeEntity strips gmOnly content structurally', () => {
    const e = createEmptyEntity('r22', 'monster', NOW);
    e.identity.gmNotes = 'secret';
    e.traits.push({
      id: 'tr',
      registryId: null,
      name: 'Hidden Weakness',
      description: 'secret trait',
      threatCost: 0,
      origin: 'userProvided',
      gmOnly: true,
    });
    const safe = playerSafeEntity(e);
    expect(safe.identity.gmNotes).toBe('');
    expect(safe.traits).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Token actions
// ---------------------------------------------------------------------------

describe('generateTokenActions', () => {
  it('always includes Initiative and collapses large sets into menus', () => {
    const { entity } = generateEntityFromPrompt(
      'A brutal lich boss for 5 level 10 players, deadly difficulty',
      { id: 'tok1', now: NOW },
    );
    const macros = generateTokenActions(entity);
    expect(macros.some((m) => m.name === 'Initiative')).toBe(true);
    expect(macros.some((m) => m.name === 'Next Phase' && m.gmOnly)).toBe(true);
    const totalActions =
      entity.actions.length +
      entity.quickActions.length +
      entity.reactions.length +
      entity.apexActions.length +
      entity.overtureActions.length;
    if (totalActions > entity.roll20.macroMenuThreshold) {
      expect(macros.some((m) => m.action === 'crucible_action_menu')).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Registries: structural integrity
// ---------------------------------------------------------------------------

describe('registry integrity', () => {
  it('size ladder steps correctly and clamps', () => {
    expect(stepHitDie(8, 1)).toBe(10);
    expect(stepHitDie(8, -1)).toBe(6);
    expect(stepHitDie(1, -1)).toBe(1);
    expect(stepHitDie(1000, 1)).toBe(1000);
    expect(sizeById.medium.hitDieSize).toBe(8);
    expect(sizeById.superplanetary.hitDieSize).toBe(1000);
  });

  it('has all nine creature roles with effects', () => {
    expect(CREATURE_ROLES).toHaveLength(9);
    for (const role of CREATURE_ROLES) {
      expect(role.effects.length).toBeGreaterThan(0);
      expect(roleById[role.id]).toBe(role);
    }
    expect(roleById.minion.effects[0].kind).toBe('minionRules');
  });

  it('trait and action registries are well-formed and cross-resolve', () => {
    expect(CREATURE_TRAITS.length).toBeGreaterThanOrEqual(50);
    expect(CREATURE_ACTIONS.length).toBeGreaterThanOrEqual(45);
    const traitIds = new Set(CREATURE_TRAITS.map((t) => t.id));
    const actionIds = new Set(CREATURE_ACTIONS.map((a) => a.id));
    expect(traitIds.size).toBe(CREATURE_TRAITS.length);
    expect(actionIds.size).toBe(CREATURE_ACTIONS.length);
  });

  it('NPC archetype motivation references resolve', () => {
    expect(NPC_ARCHETYPES.length).toBeGreaterThanOrEqual(35);
    for (const archetype of NPC_ARCHETYPES) {
      for (const motivationId of archetype.motivationIds) {
        expect(npcMotivationById[motivationId], `${archetype.id} -> ${motivationId}`).toBeDefined();
      }
      expect(npcArchetypeById[archetype.id]).toBe(archetype);
    }
  });

  it('environment hazard references resolve', () => {
    expect(ENCOUNTER_ENVIRONMENTS.length).toBeGreaterThanOrEqual(25);
    for (const env of ENCOUNTER_ENVIRONMENTS) {
      for (const hazardId of env.commonHazardIds) {
        expect(hazardTypeById[hazardId], `${env.id} -> ${hazardId}`).toBeDefined();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Import / migration
// ---------------------------------------------------------------------------

describe('migrateEntity / parseCrucibleEntity', () => {
  it('upgrades a minimal older payload without dropping data', () => {
    const migrated = migrateEntity(
      {
        id: 'old-1',
        kind: 'monster',
        identity: { name: 'Old One' },
        attributes: {
          might: 16,
          instinct: 12,
          focus: 8,
          conviction: 14,
          resonance: 10,
          presence: 10,
        },
        someFutureField: { canBe: 'anything' },
      },
      NOW,
    );
    expect(migrated.identity.name).toBe('Old One');
    expect(migrated.attributes.might).toBe(16);
    expect(migrated._unrecognized?.someFutureField).toEqual({ canBe: 'anything' });
    // Round-trip keeps the unknown field.
    const again = migrateEntity(JSON.parse(JSON.stringify(migrated)), NOW);
    expect(again._unrecognized?.someFutureField).toEqual({ canBe: 'anything' });
  });

  it('accepts challengeRating as a Threat Rating alias', () => {
    const migrated = migrateEntity({ id: 'cr', kind: 'monster', challengeRating: 7 }, NOW);
    expect(migrated.progression.threatRating).toBe(7);
  });

  it('rejects structurally invalid payloads with readable errors', () => {
    const result = parseCrucibleEntity({ id: '', kind: 'dragon-rider' });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('export -> import round-trips a generated entity losslessly', () => {
    const { entity } = generateEntityFromPrompt(
      'Make me a level 8 blackstone war beast for 4 level 7 players.',
      { id: 'rt1', now: NOW },
    );
    const result = parseCrucibleEntity(JSON.parse(JSON.stringify(entity)), NOW);
    expect(result.ok).toBe(true);
    expect(result.entity?.identity.name).toBe(entity.identity.name);
    expect(result.entity?.attributes).toEqual(entity.attributes);
    expect(result.entity?.actions.map((a) => a.name)).toEqual(entity.actions.map((a) => a.name));
    expect(result.entity?.npc ?? null).toEqual(entity.npc ?? null);
  });
});

// ---------------------------------------------------------------------------
// Seeded RNG
// ---------------------------------------------------------------------------

describe('createRng', () => {
  it('is deterministic per seed and independent per fork', () => {
    const a = createRng('same-seed');
    const b = createRng('same-seed');
    expect(a.int(1, 100)).toBe(b.int(1, 100));
    expect(a.pick(['x', 'y', 'z'])).toBe(b.pick(['x', 'y', 'z']));
    const forkA = createRng('s').fork('one');
    const forkB = createRng('s').fork('two');
    // Different labels should diverge (overwhelmingly likely across 8 draws).
    const seqA = Array.from({ length: 8 }, () => forkA.int(0, 1_000_000));
    const seqB = Array.from({ length: 8 }, () => forkB.int(0, 1_000_000));
    expect(seqA).not.toEqual(seqB);
  });

  it('sample never repeats items', () => {
    const rng = createRng(42);
    const picked = rng.sample([1, 2, 3, 4, 5], 5);
    expect([...picked].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

// ---------------------------------------------------------------------------
// Difficulty bands
// ---------------------------------------------------------------------------

describe('bandFor', () => {
  it('brackets exactly at the band edges', () => {
    // budget 24, party 4: easy < 12, medium < 20, hard < 28, deadly >= 28
    expect(bandFor(11, 24, 4)).toBe('easy');
    expect(bandFor(12, 24, 4)).toBe('medium');
    expect(bandFor(19, 24, 4)).toBe('medium');
    expect(bandFor(20, 24, 4)).toBe('hard');
    expect(bandFor(27, 24, 4)).toBe('hard');
    expect(bandFor(28, 24, 4)).toBe('deadly');
  });
});
