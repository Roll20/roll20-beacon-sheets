export class ActorSheetHelper {
    static async _sendRollMessage(roll = null, title, image = null, description = '', allowCrits = false) {
        if (!roll) return;

        let critRollInfo = null;
        let additionalText = '';
        if (allowCrits) {
            const evaluatedRoll = await roll.evaluate();
            const natRoll = evaluatedRoll.dice[0].results[0].result;
            if (natRoll === 1 || natRoll === 10) {
                console.log('---ATTEMPTING CRIT ROLL---');
                console.log(`initial nat roll: ${natRoll}`);
                critRollInfo = await this._getCriticalRollInfo(evaluatedRoll);
                additionalText = this._getCriticalText(critRollInfo.critResult, critRollInfo.critSuccess, critRollInfo.critFailure);
            }
        }

        const imageElem = image ? `<img class="flex0" src="${image}">` : '';
        const flavorContent = `
			<div>
				<h2>${title}</h2>
				${additionalText}
				<div class="flexrow">${imageElem}${description}</div>
			</div>
		`;

        return roll.toMessage({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: flavorContent,
        });
    }

    static _getCriticalText(critResult, critSuccess, critFailure) {
        if (critSuccess) return `<div class="flexrow">Critical Success!</div>`;
        if (critFailure) return `<div class="flexrow">Critical Failure!</div>`;
        return `<div class="flexrow">2nd Roll: ${critResult}</div>`;
    }

    static async _getCriticalRollInfo(initialRoll) {
        const natRoll = initialRoll.dice[0].results[0].result;
        if (natRoll !== 1 && natRoll !== 10) return { critResult: null, critSuccess: false, critFailure: false };

        const critResult = await this._doCriticalRoll(initialRoll, natRoll);
        const critSuccess = critResult == 10 && natRoll === 10;
        const critFailure = critResult == 1 && natRoll === 1;

        if (critSuccess) console.warn('Critical Success!');
        if (critFailure) console.warn('Critical Failure!');

        return { critResult, critSuccess, critFailure };
    }

    static async _doCriticalRoll(initialRoll, natRoll) {
        if (!initialRoll || !natRoll) return null;

        const secondRoll = await initialRoll.reroll();
        const secondNatRoll = secondRoll.dice[0].results[0].result;
        console.log(`second nat roll: ${secondNatRoll}`);
        return secondNatRoll;
    }

    static _sendMessage(title, image = null, description = '') {
        const imageElem = image ? `<img class="flex0" src="${image}">` : '';

        const flavorContent = `
            <div>
                <h2>${title}</h2>
                <div class="">${imageElem}${description}</div>
            </div>
        `;

        return ChatMessage.create({
            content: flavorContent,
        });
    }

    /**
     * An object containing a Foundry Roll and the readable (and localized) roll string.
     * @typedef {Object} TgRoll
     * @property {Object} roll - The Foundry Roll object
     * @property {string} rollOutput - Readable and i18n'd roll string
     */

    /**
     * Takes an object with score parts and builds a dynamic TG Roll from it.
     * @param {Object} scoreParts - An object containing the score parts.
     * @returns {TgRoll} A TgRoll object containing the Foundry Roll and the readable roll string.
     */
    static _buildDynamicRoll(scoreParts) {
        const die = '1d10'; // TODO: Fetch from settings.
        let rollString = die;
        let rollOutput = die;

        for (const [key, value] of Object.entries(scoreParts)) {
            // Filter out values that do not need to be parsed.
            const scoresToFilter = ['bonus', 'penalty', 'healthModifier', 'stanceModifier', 'total'];
            if (value === 0 || (value === null && scoresToFilter.includes(key))) {
                delete scoreParts[key];
            } else {
                rollString += ` + @${key}`;
                rollOutput += ` + ${this._fetchTranslation(key)}`;
            }
        }

        let roll = new Roll(this._simplifyRollScore(rollString, scoreParts), this._absScores(scoreParts));

        return { roll, rollOutput };
    }

    /**
     * Fetches the localized translation for a given key.
     *
     * @param {string} key - The key for which to fetch the translation.
     * @returns {string} The localized translation for the given key.
     */
    static _fetchTranslation(key) {
        let fetchedTranslation = null;
        const paths = ['common', 'ways', 'domains', 'disciplines'];

        for (let path of paths) {
            fetchedTranslation = game.i18n.localize(`tg.${path}.${key}`);
            if (!fetchedTranslation.includes('tg.')) {
                return fetchedTranslation;
            }
        }
        return fetchedTranslation;
    }

    // TODO: Foundry already has Roll.simplifyTerms(terms). Maybe use that instead?
    static _simplifyRollScore(rollString, score) {
        let modifiedRollString = rollString;

        Object.entries(score).forEach(([key, value]) => {
            const pattern = new RegExp(`[\\+\\-]\\s*@${key}`, 'g');
            if (value < 0) {
                modifiedRollString = modifiedRollString.replace(pattern, `- @${key}`);
            }
        });

        return modifiedRollString;
    }

    static _absScores(score) {
        const absScores = {};

        for (const [key, value] of Object.entries(score)) {
            absScores[key] = Math.abs(value);
        }

        return absScores;
    }
}

import { ActorSheetHelper } from './actor-sheet-helper.js';

export class TgActorSheet extends ActorSheet {
    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['tg', 'sheet', 'actor'],
            width: 1140,
            height: 750,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'domains',
                },
            ],
            scrollY: ['.items', '.tab'],
            dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
        });
    }

    /** @inheritdoc */
    get template() {
        return 'systems/tg/templates/actor-sheet.hbs';
    }

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

        context.actor.system.itemTypes = context.actor.system.featureItemTypes.concat(context.actor.system.inventoryItemTypes);

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
                    if (domain && context.items[i].system.parent && context.data.system.domainsAndDisciplines.hasOwnProperty(domain)) {
                        let domainObject = context.data.system.domainsAndDisciplines[context.items[i].system.parent];
                        let way = context.actor.system.ways[domainObject.way.title.toLowerCase()];
                        context.items[i].system.bonus = domainObject.bonus;
                        context.items[i].system.penalty = domainObject.penalty;
                        context.items[i].system.total =
                            context.items[i].system.base + context.items[i].system.bonus + way - context.items[i].system.penalty;

                        // check if discipline is already in disciplines array
                        let foundObject = context.actor.system.domainsAndDisciplines[item.system.parent].disciplines.find(
                            (object) => object._id === context.items[i]._id,
                        );

                        if (!foundObject) {
                            context.actor.system.domainsAndDisciplines[item.system.parent].disciplines.push(context.items[i]);
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
        } else if (context.actor.system.ways.creativity >= 2 && context.actor.system.ways.creativity < 5) {
            context.actor.system.potential = 2;
        } else if (context.actor.system.ways.creativity === 1) {
            context.actor.system.potential = 1;
        }

        // Mental Resistance = Conviction + 5
        context.actor.system.mentalResistance = context.actor.system.ways.conviction + 5;

        let attackInitial = 0;
        let defenseInitial = context.actor.system.ways.reason + context.actor.system.ways.awareness + 5;
        let speedInitial = context.actor.system.ways.combativeness + context.actor.system.ways.awareness;

        for (const key in context.actor.system.fightingStances) {
            if (context.actor.system.fightingStances.hasOwnProperty(key)) {
                switch (key) {
                    case 'standard':
                        context.actor.system.fightingStances[key].attack = attackInitial;
                        context.actor.system.fightingStances[key].defense = defenseInitial;
                        context.actor.system.fightingStances[key].speed = speedInitial;
                        break;
                    case 'offensive':
                        context.actor.system.fightingStances[key].attack = attackInitial + context.actor.system.potential;
                        context.actor.system.fightingStances[key].defense = defenseInitial - context.actor.system.potential;
                        context.actor.system.fightingStances[key].speed = speedInitial;
                        break;
                    case 'defensive':
                        context.actor.system.fightingStances[key].attack = attackInitial - context.actor.system.potential;
                        context.actor.system.fightingStances[key].defense = defenseInitial + context.actor.system.potential;
                        context.actor.system.fightingStances[key].speed = speedInitial;
                        break;
                    case 'movement':
                        context.actor.system.fightingStances[key].attack = null;
                        context.actor.system.fightingStances[key].defense = defenseInitial - context.actor.system.potential;
                        context.actor.system.fightingStances[key].speed = speedInitial;
                        break;
                }
            }
        }

        console.log(context);

        Hooks.call('tgActorUpdated', context);

        return context;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-control').click(this._onItemControl.bind(this));
        html.find('.domain-control').click(this._onDomainControl.bind(this));
        html.find('.advantage-control').click(this._onAdvantageControl.bind(this));
        html.find('.disadvantage-control').click(this._onDisadvantageControl.bind(this));
        html.find('.torment-control').click(this._onTormentControl.bind(this));
        html.find('.rout-control').click(this._onRoutControl.bind(this));
        html.find('.ascension-item-control').click(this._onAscensionItemControl.bind(this));

        html.find('.rollable-torment').click(this._onTormentRoll.bind(this));
        html.find('.rollable-rout').click(this._onRoutRoll.bind(this));
        html.find('.rollable-advantage').click(this._onAdvantageRoll.bind(this));
        html.find('.rollable-disadvantage').click(this._onDisadvantageRoll.bind(this));
        html.find('.rollable-domain').click(this._onDomainRoll.bind(this));
        html.find('.rollable-discipline').click(this._onDisciplineRoll.bind(this));
        html.find('.rollable-way').click(this._onWayRoll.bind(this));
        html.find('.rollable-weapon').click(this._onWeaponRoll.bind(this));
        html.find('.rollable-spell').click(this._onSpellRoll.bind(this));
        html.find('.rollable-parry').click(this._onParryRoll.bind(this));
        html.find('.rollable-ascension-item').click(this._onAscensionItemRoll.bind(this));

        html.find('.discipline-change').change(this._onDisciplineChange.bind(this));
        html.find('.domains-extended-view').click(this._domainsExtendedView.bind(this));
        html.find('.openItemsModal').click(this._itemsModal.bind(this));
        html.find('.healthRadioValue').click(this._setHealthValue.bind(this));
        html.find('.ascensionGaugeRadioValue').click(this._setAscensionGaugeValue.bind(this));
    }

    /**
     * Handle click events for Item control buttons
     * @param event
     * @private
     */
    _onItemControl(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const li = button.closest('.item');
        const item = this.actor.items.get(li?.dataset.itemId);

        switch (button.dataset.action) {
            case 'edit':
                return item.sheet.render(true);
            case 'delete':
                let d = Dialog.confirm({
                    title: game.i18n.localize('tg.common.deleteItem'),
                    content: game.i18n.localize('tg.common.deleteItemConfirm'),
                    yes: () => item.delete(),
                    defaultYes: false,
                });
        }
    }

    /**
     * Handle click events for Domain control buttons
     * @param event
     * @private
     */
    _onDomainControl(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const disciplineElem = button.closest('.flexrow').querySelector('[data-discipline-id]');
        const discipline = this.actor.items.get(disciplineElem?.dataset.disciplineId);

        switch (button.dataset.action) {
            case 'edit':
                return item.sheet.render(true);
            case 'delete':
                let d = Dialog.confirm({
                    title: game.i18n.localize('tg.common.deleteItem'),
                    content: game.i18n.localize('tg.common.deleteItemConfirm'),
                    yes: () => discipline.delete(),
                    defaultYes: false,
                });
        }
    }

    /**
     * Handle click events for advantages edit buttons
     * @param event
     * @private
     */
    _onAdvantageControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * Handle click events for disadvantages edit buttons
     * @param event
     * @private
     */
    _onDisadvantageControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * Handle click events for torments edit buttons
     * @param event
     * @private
     */
    _onTormentControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * Handle click events for routs edit buttons
     * @param event
     * @private
     */
    _onRoutControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * Handle click events for routs edit buttons
     * @param event
     * @private
     */
    _onAscensionItemControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * Handle edit event for Domains
     * @param event
     * @private
     */
    async _domainsExtendedView(event) {
        event.preventDefault();

        const content = await renderTemplate('systems/tg/templates/modals/domains.hbs', {
            data: this.actor,
        });

        const obj = this;

        let d = new Dialog(
            {
                title: game.i18n.localize('tg.plurals.domainAndDiscipline'),
                content: content,
                buttons: {},
                render: (html) => {
                    html.find('.update-item').change(this._onValueChange.bind(this));
                    html.find('.rollable-domain').click(this._onDomainRoll.bind(this));
                    html.find('.discipline-change').change(this._onDisciplineChange.bind(this));
                },
            },
            {
                resizable: true,
                width: 650,
            },
        ).render(true);

        let that = this;

        Hooks.on('tgActorUpdated', async (context) => {
            const content = await renderTemplate('systems/tg/templates/modals/domains.hbs', {
                data: that.actor,
            });

            let data = d.getData();
            data.content = content;
            data.title = game.i18n.localize('tg.plurals.domainAndDiscipline');
            data.render = (html) => {
                html.find('.update-item').change(this._onValueChange.bind(this));
                html.find('.rollable-domain').click(this._onDomainRoll.bind(this));
                html.find('.discipline-change').change(this._onDisciplineChange.bind(this));
            };
            d.data = data;
            d.render();
        });
    }

    /**
     * Handle click events for Item control buttons
     * @param event
     * @private
     */
    _onDisciplineChange(event) {
        event.preventDefault();
        const elem = event.currentTarget;
        const itemId = elem.dataset.itemId;
        const item = this.actor.items.get(itemId);
        return item.update({ 'system.base': parseInt(event.target.value) });
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
            ActorSheetHelper._sendMessage(item.name ? item.name : game.i18n.localize('tg.rolls.routRoll'), null, item.system.description);
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
     * Listen for roll click on way items.
     * @param {MouseEvent} event    The originating left click event
     */
    _onWayRoll(event) {
        const elem = $(event.currentTarget);
        const elemRollWay = elem.data('rollWay');

        let score = {
            [elemRollWay]: this.actor.system.ways[elemRollWay],
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        const rollResult = ActorSheetHelper._buildDynamicRoll(score);
        ActorSheetHelper._sendRollMessage(
            rollResult.roll,
            `${game.i18n.localize('tg.rolls.wayRoll')}: "${elem.attr('title')}"`,
            null,
            rollResult.rollOutput,
            true,
        );
    }

    /**
     * Listen for roll click on domain items.
     * @param {MouseEvent} event    The originating left click event
     */
    _onDomainRoll(event) {
        const elem = $(event.currentTarget);
        const elemRollDomain = elem.data('rollDomain');
        const matchedDomain = this.actor.system.domainsAndDisciplines[elemRollDomain];

        // Formula: 1D10 + (Domain + Bonus - Penalty) + Way + Health Modifier
        const score = {
            [elemRollDomain]: matchedDomain.total,
            [matchedDomain.way.title.toLowerCase()]: this.actor.system.ways[matchedDomain.way.title.toLowerCase()],
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        const rollResult = ActorSheetHelper._buildDynamicRoll(score);
        ActorSheetHelper._sendRollMessage(
            rollResult.roll,
            `${game.i18n.localize('tg.rolls.domainRoll')}: "${elem.attr('title')}"`,
            null,
            rollResult.rollOutput,
            true,
        );
    }

    /**
     * Listen for roll click on discipline items.
     * @param {MouseEvent} event    The originating left click event
     */
    _onDisciplineRoll(event) {
        const elem = $(event.currentTarget);
        const domain = elem.data('rollDomain');
        const disciplineId = elem.data('disciplineId');

        const matchedDomain = this.actor.system.domainsAndDisciplines[domain];
        const matchedDiscipline = matchedDomain.disciplines.find((d) => d._id === disciplineId);

        // TODO: Throw error?
        if (!matchedDiscipline) return;

        // Formula: 1D10 + (Discipline + Bonus - Penalty) + Way + Health Modifier
        const score = {
            [matchedDiscipline.name.toLowerCase()]: matchedDiscipline.system.total,
            [matchedDomain.way.title.toLowerCase()]: this.actor.system.ways[matchedDomain.way.title.toLowerCase()],
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        const rollResult = ActorSheetHelper._buildDynamicRoll(score);
        ActorSheetHelper._sendRollMessage(
            rollResult.roll,
            `${game.i18n.localize('tg.rolls.disciplineRoll')}: "${matchedDiscipline.name}"`,
            matchedDiscipline.img,
            `${rollResult.rollOutput} <br>${matchedDiscipline.system.description}`,
            true,
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
        const matchedDiscipline = actorMagicDisciplines.find((d) => d.name.toLowerCase() === spellDiscipline.toLowerCase());
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
     * Listen for roll click on weapon items.
     * @param {MouseEvent} event
     */
    _onWeaponRoll(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const li = button.closest('.item');
        const item = this.actor.items.get(li?.dataset.itemId);
        let domOrDiscVal = null;
        let domOrDiscName = null;

        // TODO: Make sure armor and weapons always have a domain!
        if (item.system.domain === null) console.error('Weapon has no domain set!');

        if (item.system.discipline !== null) {
            const matchedDiscipline = this.actor.system.domainsAndDisciplines[item.system.domain].disciplines.find(
                (d) => d.name.toLowerCase() === item.system.discipline.toLowerCase(),
            );
            console.log(matchedDiscipline);
            // domainOrDiscipline = item.system.discipline.toLowerCase();
        }

        // TODO: Fix this!

        if (!domainOrDiscipline) domainOrDiscipline = this.actor.system.domainsAndDisciplines[item.system.domain];
        console.log(domainOrDiscipline);
        const fsAttack = this.actor.system.fightingStances[this.actor.system.selectedFightingStance].attack;

        let score = {
            combativeness: this.actor.system.ways.combativeness,
            [domainOrDiscipline.name.toLowerCase()]: domainOrDiscipline.total ? domainOrDiscipline.total : 0,
            stanceModifier: fsAttack ? fsAttack : 0,
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        const rollResult = ActorSheetHelper._buildDynamicRoll(score);
        ActorSheetHelper._sendRollMessage(
            rollResult.roll,
            `${game.i18n.localize('tg.rolls.attackRoll')}: "${item.name}"`,
            item.img,
            rollResult.rollOutput,
        );
    }

    /**
     * Listen for roll click on parry "item"
     * @param {MouseEvent} event
     */
    _onParryRoll(event) {
        event.preventDefault();

        // TODO: Should closeCombat be base or total? In its current implementation, base is always 0.
        let score = {
            combativeness: this.actor.system.ways.combativeness,
            closeCombat: this.actor.system.domainsAndDisciplines.closeCombat.total,
            // closeCombat: this.actor.system.domainsAndDisciplines.closeCombat.base,
            stanceModifier: 0,
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        if (this.actor.system.selectedFightingStance === 'defensive') {
            score.stanceModifier = this.actor.system.potential;
        }

        const rollResult = ActorSheetHelper._buildDynamicRoll(score);
        ActorSheetHelper._sendRollMessage(rollResult.roll, game.i18n.localize('tg.rolls.parryRoll'), null, rollResult.rollOutput);
    }

    /**
     * @param {MouseEvent} event
     */
    _onAscensionItemRoll(event) {
        const item = this.actor.items.get(event.currentTarget?.dataset.id);

        if (item) {
            ActorSheetHelper._sendMessage(item.name ? item.name : item.name, null, item.system.description);
        }
    }

   

}
