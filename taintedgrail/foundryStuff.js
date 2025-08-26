import { ActorSheetHelper } from './actor-sheet-helper.js';

export class TgActorSheet extends ActorSheet {
  /** @inheritdoc */
  async getData(options) {
    const context = await super.getData(options);

    // Sort domains
    let objectEntries = Object.entries(context.data.system.domainsAndDisciplines);
    objectEntries.sort((a, b) => a[0].localeCompare(b[0]));
    context.actor.system.domainsAndDisciplines = Object.fromEntries(objectEntries);

    context.colors = ['blue', 'brown', 'gray', 'green', 'red'];

    context.actor.system.featureItemTypes = [
      'discipline',
      'torment',
      'rout',
      'advantage',
      'disadvantage',
      'premise',
      'awakening',
      'rise',
      'ascension',
    ];

    context.actor.system.inventoryItemTypes = ['weapon', 'armor', 'equipment'];

    context.actor.system.itemTypes = context.actor.system.featureItemTypes.concat(
      context.actor.system.inventoryItemTypes,
    );

    context.fightingStances = ['standard', 'offensive', 'defensive', 'movement'];

    context.rollableItemTypes = ['discipline'];

    context.descriptionHTML = await TextEditor.enrichHTML(context.data.system.description, {
      secrets: this.document.isOwner,
      async: true,
    });

    let advantagesAttackBonus = 0;
    context.actor.system.torments = [];
    context.actor.system.routs = [];
    context.actor.system.advantages = [];
    context.actor.system.disadvantages = [];

    context.actor.system.premises = [];
    context.actor.system.rises = [];
    context.actor.system.awakenings = [];
    context.actor.system.ascensions = [];

    for (let domain in context.data.system.domainsAndDisciplines) {
      if (context.data.system.domainsAndDisciplines.hasOwnProperty(domain)) {
        let domainObject = context.data.system.domainsAndDisciplines[domain];
        let way = context.data.system.ways[domainObject.way.title.toLowerCase()];
        domainObject.total = domainObject.base + domainObject.bonus + way - domainObject.penalty;
      }
    }

    for (let i = 0; i < context.items.length; i++) {
      if (context.items[i].type === 'discipline') {
        let item = context.items[i];
        for (let domain in context.data.system.domainsAndDisciplines) {
          if (
            domain &&
            context.items[i].system.parent &&
            context.data.system.domainsAndDisciplines.hasOwnProperty(domain)
          ) {
            let domainObject =
              context.data.system.domainsAndDisciplines[context.items[i].system.parent];
            let way = context.actor.system.ways[domainObject.way.title.toLowerCase()];
            context.items[i].system.bonus = domainObject.bonus;
            context.items[i].system.penalty = domainObject.penalty;
            context.items[i].system.total =
              context.items[i].system.base +
              context.items[i].system.bonus +
              way -
              context.items[i].system.penalty;

            // check if discipline is already in disciplines array
            let foundObject = context.actor.system.domainsAndDisciplines[
              item.system.parent
            ].disciplines.find((object) => object._id === context.items[i]._id);

            if (!foundObject) {
              context.actor.system.domainsAndDisciplines[item.system.parent].disciplines.push(
                context.items[i],
              );
            }
          }
        }
      } else if (context.items[i].type === 'torment') {
        context.actor.system.torments.unshift(context.items[i]);
      } else if (context.items[i].type === 'rout') {
        context.actor.system.routs.unshift(context.items[i]);
      } else if (context.items[i].type === 'advantage') {
        if (typeof context.items[i].system.attackBonus !== 'undefined') {
          // advantagesAttackBonus += parseInt(
          //     context.items[i].system.attackBonus
          // )
        }

        context.actor.system.advantages.push(context.items[i]);
      } else if (context.items[i].type === 'disadvantage') {
        context.actor.system.disadvantages.push(context.items[i]);
      } else if (context.items[i].type === 'premise') {
        context.actor.system.premises.push(context.items[i]);
      } else if (context.items[i].type === 'awakening') {
        context.actor.system.awakenings.push(context.items[i]);
      } else if (context.items[i].type === 'rise') {
        context.actor.system.rises.push(context.items[i]);
      } else if (context.items[i].type === 'ascension') {
        context.actor.system.ascensions.push(context.items[i]);
      }
    }

    if (context.actor.system.ways.creativity >= 5) {
      context.actor.system.potential = 3;
    } else if (
      context.actor.system.ways.creativity >= 2 &&
      context.actor.system.ways.creativity < 5
    ) {
      context.actor.system.potential = 2;
    } else if (context.actor.system.ways.creativity === 1) {
      context.actor.system.potential = 1;
    }

    // Mental Resistance = Conviction + 5
    context.actor.system.mentalResistance = context.actor.system.ways.conviction + 5;

    let attackInitial = 0;
    let defenseInitial = context.actor.system.ways.reason + context.actor.system.ways.awareness + 5;
    let speedInitial =
      context.actor.system.ways.combativeness + context.actor.system.ways.awareness;

    for (const key in context.actor.system.fightingStances) {
      if (context.actor.system.fightingStances.hasOwnProperty(key)) {
        switch (key) {
          case 'standard':
            context.actor.system.fightingStances[key].attack = attackInitial;
            context.actor.system.fightingStances[key].defense = defenseInitial;
            context.actor.system.fightingStances[key].speed = speedInitial;
            break;
          case 'offensive':
            context.actor.system.fightingStances[key].attack =
              attackInitial + context.actor.system.potential;
            context.actor.system.fightingStances[key].defense =
              defenseInitial - context.actor.system.potential;
            context.actor.system.fightingStances[key].speed = speedInitial;
            break;
          case 'defensive':
            context.actor.system.fightingStances[key].attack =
              attackInitial - context.actor.system.potential;
            context.actor.system.fightingStances[key].defense =
              defenseInitial + context.actor.system.potential;
            context.actor.system.fightingStances[key].speed = speedInitial;
            break;
          case 'movement':
            context.actor.system.fightingStances[key].attack = null;
            context.actor.system.fightingStances[key].defense =
              defenseInitial - context.actor.system.potential;
            context.actor.system.fightingStances[key].speed = speedInitial;
            break;
        }
      }
    }

    console.log(context);

    Hooks.call('tgActorUpdated', context);

    return context;
  }

  /**
   * @param {MouseEvent} event
   */
  _onTormentRoll(event) {
    const item = this.actor.items.get(event.currentTarget?.dataset.id);

    if (item) {
      ActorSheetHelper._sendMessage(
        item.name ? item.name : game.i18n.localize('tg.rolls.tormentRoll'),
        null,
        item.system.description,
      );
    }
  }

  /**
   * @param {MouseEvent} event
   */
  _onRoutRoll(event) {
    const item = this.actor.items.get(event.currentTarget?.dataset.id);

    if (item) {
      ActorSheetHelper._sendMessage(
        item.name ? item.name : game.i18n.localize('tg.rolls.routRoll'),
        null,
        item.system.description,
      );
    }
  }

  /**
   * @param {MouseEvent} event
   */
  _onAdvantageRoll(event) {
    const item = this.actor.items.get(event.currentTarget?.dataset.id);

    if (item) {
      ActorSheetHelper._sendMessage(
        item.name ? item.name : game.i18n.localize('tg.rolls.advantageRoll'),
        null,
        item.system.description,
      );
    }
  }

  /**
   * @param {MouseEvent} event
   */
  _onDisadvantageRoll(event) {
    const item = this.actor.items.get(event.currentTarget?.dataset.id);

    if (item) {
      ActorSheetHelper._sendMessage(
        item.name ? item.name : game.i18n.localize('tg.rolls.disadvantageRoll'),
        null,
        item.system.description,
      );
    }
  }

  /**
   * Listen for roll click on discipline items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onDisciplineRoll(event) {
    const elem = $(event.currentTarget);
    const elemRollDomain = elem.data('rollDomain');
    let score = {
      base: 0,
      bonus: 0,
      way: 0,
      penalty: 0,
      total: 0,
      healthModifier: this._getHealthRollScore(this.actor.system.health),
    };
    let discipline = null;

    for (let domain in this.actor.system.domainsAndDisciplines) {
      if (domain === elemRollDomain) {
        for (
          let dId = 0;
          dId < this.actor.system.domainsAndDisciplines[domain].disciplines.length;
          dId++
        ) {
          discipline = this.actor.system.domainsAndDisciplines[domain].disciplines[dId];
          const domainObject = this.actor.system.domainsAndDisciplines[domain];
          score.base = discipline.system.base;
          score.bonus = discipline.system.bonus;
          score.way = this.actor.system.ways[domainObject.way.title.toLowerCase()];
          score.penalty = discipline.system.penalty;
          score.total = discipline.system.total;
        }
      }
    }

    let roll = new Roll(
      ActorSheetHelper._simplifyRollScore(
        '1d10 + @base + @bonus + @way - @penalty - @healthModifier',
        score,
      ),
      ActorSheetHelper._absScores(score),
    );

    ActorSheetHelper._sendRollMessage(
      roll,
      `${game.i18n.localize('tg.rolls.disciplineRoll')}: "${discipline.name}"`,
      discipline.img,
      '1d10 + Score + Bonus + Way - Penalty - Health Modifier<br>' + discipline.system.description,
    );
  }

  /**
   * Listen for roll click on weapon items.
   * @param {MouseEvent} event
   */
  _onWeaponRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const li = button.closest('.item');
    const item = this.actor.items.get(li?.dataset.itemId);
    let itemDiscipline = null;
    let itemDomain = null;
    let score = {
      combativeness: this.actor.system.ways.combativeness,
      disciplineScore: 0,
      domainScore: 0,
      stanceModifier: 0,
      healthModifier: this._getHealthRollScore(this.actor.system.health),
    };

    // first try to find a discipline
    if (item.system.discipline !== null) {
      for (let domain in this.actor.system.domainsAndDisciplines) {
        for (
          let dId = 0;
          dId < this.actor.system.domainsAndDisciplines[domain].disciplines.length;
          dId++
        ) {
          if (
            this.actor.system.domainsAndDisciplines[domain].disciplines[dId].name.toLowerCase() ===
            item.system.discipline.toLowerCase()
          )
            itemDiscipline = this.actor.system.domainsAndDisciplines[domain].disciplines[dId];
        }
      }
    }

    // when no discipline is found try domain
    if (itemDiscipline === null) {
      for (let domain in this.actor.system.domainsAndDisciplines) {
        if (domain === item.system.domain) {
          itemDomain = this.actor.system.domainsAndDisciplines[domain];
        }
      }
    }

    if (itemDiscipline) {
      score.disciplineScore = itemDiscipline.system.base !== null ? itemDiscipline.system.base : 0;
    } else if (itemDomain) {
      score.domainScore = itemDomain.base !== null ? itemDomain.base : 0;
    }

    if (
      this.actor.system.selectedFightingStance !== null &&
      this.actor.system.selectedFightingStance !== ''
    ) {
      const fightingStance =
        this.actor.system.fightingStances[this.actor.system.selectedFightingStance];

      if (fightingStance) {
        score.stanceModifier = fightingStance.attack;
      }
    }

    let roll = null;
    let domainOrDiscipline = '';

    if (itemDiscipline) {
      domainOrDiscipline = itemDiscipline.name;
      roll = new Roll(
        ActorSheetHelper._simplifyRollScore(
          '@combativeness + @disciplineScore + @stanceModifier + 1d10 - @healthModifier',
          score,
        ),
        ActorSheetHelper._absScores(score),
      );
    } else {
      domainOrDiscipline = domainOrDiscipline.name;
      roll = new Roll(
        ActorSheetHelper._simplifyRollScore(
          '@combativeness + @domainScore + @stanceModifier + 1d10 - @healthModifier',
          score,
        ),
        ActorSheetHelper._absScores(score),
      );
    }

    ActorSheetHelper._sendRollMessage(
      roll,
      `${game.i18n.localize('tg.rolls.attackRoll')}: "${item.name}"`,
      item.img,
      `${game.i18n.localize(
        'tg.ways.combativeness',
      )} + Discipline/Domain base + Stance modifier + 1d10 - Health Modifier`,
    );
  }

  /**
   * Listen for roll click on parry "item"
   * @param {MouseEvent} event
   */
  _onParryRoll(event) {
    event.preventDefault();

    // TODO: Add scores conditionally.
    let score = {
      combativeness: this.actor.system.ways.combativeness,
      domainScore: this.actor.system.domainsAndDisciplines.closeCombat.base,
      stanceModifier: 0,
      healthModifier: this._getHealthRollScore(this.actor.system.health),
    };

    if (
      this.actor.system.selectedFightingStance !== null &&
      this.actor.system.selectedFightingStance !== ''
    ) {
      const fightingStance =
        this.actor.system.fightingStances[this.actor.system.selectedFightingStance];

      if (this.actor.system.selectedFightingStance === 'defensive') {
        score.stanceModifier = this.actor.system.potential;
      }
    }

    let roll = null;

    roll = new Roll(
      ActorSheetHelper._simplifyRollScore(
        '@combativeness + @domainScore + @stanceModifier + 1d10 - @healthModifier',
        score,
      ),
      ActorSheetHelper._absScores(score),
    );

    ActorSheetHelper._sendRollMessage(
      roll,
      game.i18n.localize('tg.rolls.parryRoll'),
      null,
      'Combativeness + Close Combat + Stance modifier + 1d10 - Health Modifier',
    );
  }

  /**
   * Listen for roll click on spells.
   * @param {MouseEvent} event    The originating left click event
   */
  _onSpellRoll(event) {
    const button = event.currentTarget;
    const li = button.closest('.item');
    const spell = this.actor.items.get(li?.dataset.itemId);
    const spellDiscipline = spell.system.discipline;
    const actorMagicDisciplines = this.actor.system.domainsAndDisciplines.magic.disciplines;
    const matchedDiscipline = actorMagicDisciplines.find(
      (d) => d.name.toLowerCase() === spellDiscipline.toLowerCase(),
    );
    const associatedWay = this.actor.system.ways[matchedDiscipline.system.way.toLowerCase()];

    // 1D10 + Spell Discipline + Associated Way + Health Modifier
    const score = {
      [spellDiscipline]: matchedDiscipline.system.total,
      [matchedDiscipline.system.way.toLowerCase()]: associatedWay,
      healthModifier: this._getHealthRollScore(this.actor.system.health),
    };

    const rollResult = ActorSheetHelper._buildDynamicRoll(score);
    ActorSheetHelper._sendRollMessage(
      rollResult.roll,
      `${game.i18n.localize('tg.rolls.spellRoll')}: "${spell.name}"`,
      spell.img,
      `${rollResult.rollOutput} <br>${spell.system.description}`,
      true,
    );
  }

  /**
   * @param {MouseEvent} event
   */
  _onAscensionItemRoll(event) {
    const item = this.actor.items.get(event.currentTarget?.dataset.id);

    if (item) {
      ActorSheetHelper._sendMessage(
        item.name ? item.name : item.name,
        null,
        item.system.description,
      );
    }
  }
}
