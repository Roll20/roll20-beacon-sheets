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
                    title: game.i18n.localize('tg.comnmon.deleteItem'),
                    content: game.i18n.localize('tg.common.deleteItemConfirm'),
                    yes: () => item.delete(),
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
            data.title = game.i18n.localize('tg.common.domainsAndDisciplines');
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
            ActorSheetHelper._sendMessage(item.name ? item.name : game.i18n.localize('tg.common.routRoll'), null, item.system.description);
        }
    }

    /**
     * @param {MouseEvent} event
     */
    _onAdvantageRoll(event) {
        const item = this.actor.items.get(event.currentTarget?.dataset.id);

        if (item) {
            ActorSheetHelper._sendMessage(
                item.name ? item.name : game.i18n.localize('tg.common.advantageRoll'),
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
                item.name ? item.name : game.i18n.localize('tg.common.disadvantageRoll'),
                null,
                item.system.description,
            );
        }
    }

    /**
     * Listen for roll click on domain items.
     * @param {MouseEvent} event    The originating left click event
     */
    _onDomainRoll(event) {
        const elem = $(event.currentTarget);
        const elemRollDomain = elem.data('rollDomain');
        let score = {
            base: 0,
            bonus: 0,
            way: 0,
            penalty: 0,
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        for (let domain in this.actor.system.domainsAndDisciplines) {
            if (domain === elemRollDomain) {
                const domainObject = this.actor.system.domainsAndDisciplines[domain];
                score.base = domainObject.base;
                score.bonus = domainObject.bonus;
                score.way = this.actor.system.ways[domainObject.way.title.toLowerCase()];
                score.penalty = domainObject.penalty;
                score.total = domainObject.total;
            }
        }

        let roll = new Roll(
            ActorSheetHelper._simplifyRollScore('1d10 + @base + @bonus + @way - @penalty - @healthModifier', score),
            ActorSheetHelper._absScores(score),
        );

        ActorSheetHelper._sendRollMessage(
            roll,
            `Domain roll: "${elem.attr('title')}"`,
            null,
            '1d10 + Score + Bonus + Way - Penalty - Health modifier',
        );
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
                for (let dId = 0; dId < this.actor.system.domainsAndDisciplines[domain].disciplines.length; dId++) {
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
            ActorSheetHelper._simplifyRollScore('1d10 + @base + @bonus + @way - @penalty - @healthModifier', score),
            ActorSheetHelper._absScores(score),
        );

        ActorSheetHelper._sendRollMessage(
            roll,
            `Discipline roll: "${discipline.name}"`,
            discipline.img,
            '1d10 + Score + Bonus + Way - Penalty - Health modifier<br>' + discipline.system.description,
        );
    }

    /**
     * Listen for roll click on way items.
     * @param {MouseEvent} event    The originating left click event
     */
    _onWayRoll(event) {
        const elem = $(event.currentTarget);
        const elemRollWay = elem.data('rollWay');
        let score = {
            base: this.actor.system.ways[elemRollWay],
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        let roll = new Roll(
            ActorSheetHelper._simplifyRollScore('1d10 + @base - @healthModifier', score),
            ActorSheetHelper._absScores(score),
        );

        ActorSheetHelper._sendRollMessage(roll, `Way roll: "${elem.attr('title')}"`, null, 'Way + 1d10 - Health modifier');
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
        let itemDomian = null;
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
                for (let dId = 0; dId < this.actor.system.domainsAndDisciplines[domain].disciplines.length; dId++) {
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
                    itemDomian = this.actor.system.domainsAndDisciplines[domain];
                }
            }
        }

        if (itemDiscipline) {
            score.disciplineScore = itemDiscipline.system.base !== null ? itemDiscipline.system.base : 0;
        } else if (itemDomian) {
            score.domainScore = itemDomian.base !== null ? itemDomian.base : 0;
        }

        if (this.actor.system.selectedFightingStance !== null && this.actor.system.selectedFightingStance !== '') {
            const fightingStance = this.actor.system.fightingStances[this.actor.system.selectedFightingStance];

            if (fightingStance) {
                score.stanceModifier = fightingStance.attack;
            }
        }

        let roll = null;
        let domainOrDiscipline = '';

        if (itemDiscipline) {
            domainOrDiscipline = itemDiscipline.name;
            roll = new Roll(
                ActorSheetHelper._simplifyRollScore('@combativeness + @disciplineScore + @stanceModifier + 1d10 - @healthModifier', score),
                ActorSheetHelper._absScores(score),
            );
        } else {
            domainOrDiscipline = domainOrDiscipline.name;
            roll = new Roll(
                ActorSheetHelper._simplifyRollScore('@combativeness + @domainScore + @stanceModifier + 1d10 - @healthModifier', score),
                ActorSheetHelper._absScores(score),
            );
        }

        ActorSheetHelper._sendRollMessage(
            roll,
            `Attack roll: "${item.name}"`,
            item.img,
            'Combativeness + Discipline/Domain base + Stance modifier + 1d10 - Health modifier',
        );
    }

    /**
     * Listen for roll click on parry "item"
     * @param {MouseEvent} event
     */
    _onParryRoll(event) {
        event.preventDefault();

        let score = {
            combativeness: this.actor.system.ways.combativeness,
            domainScore: this.actor.system.domainsAndDisciplines.closeCombat.base,
            stanceModifier: 0,
            healthModifier: this._getHealthRollScore(this.actor.system.health),
        };

        if (this.actor.system.selectedFightingStance !== null && this.actor.system.selectedFightingStance !== '') {
            const fightingStance = this.actor.system.fightingStances[this.actor.system.selectedFightingStance];

            if (this.actor.system.selectedFightingStance === 'defensive') {
                score.stanceModifier = this.actor.system.potential;
            }
        }

        let roll = null;

        roll = new Roll(
            ActorSheetHelper._simplifyRollScore('@combativeness + @domainScore + @stanceModifier + 1d10 - @healthModifier', score),
            ActorSheetHelper._absScores(score),
        );

        ActorSheetHelper._sendRollMessage(
            roll,
            'Parry roll',
            null,
            'Combativeness + Close Combat + Stance modifier + 1d10 - Health modifier',
        );
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

    /**
     * Handle edit event for Domains
     * @param event
     * @private
     */
    async _itemsModal(event) {
        event.preventDefault();

        const content = await renderTemplate('systems/tg/templates/modals/items.hbs', {
            data: this.actor,
        });

        let d = new Dialog(
            {
                title: game.i18n.localize('tg.common.items'),
                content: content,
                buttons: {},
                render: (html) => {
                    html.find('.item-control').click(this._onItemControl.bind(this));
                },
            },
            {
                resizable: true,
                width: 300,
            },
        ).render(true);

        let that = this;

        Hooks.on('tgActorUpdated', async (context) => {
            const content = await renderTemplate('systems/tg/templates/modals/items.hbs', {
                data: that.actor,
            });

            let data = d.getData();
            data.title = game.i18n.localize('tg.common.items');
            data.content = content;
            data.render = (html) => {
                html.find('.item-control').click(this._onItemControl.bind(this));
            };
            d.data = data;
            d.render();
        });
    }

    _setHealthValue(event) {
        const elem = $(event.currentTarget);
        let setValue = elem.val() - 1;

        if (this.actor.system.health !== elem.val()) {
            setValue = elem.val();
        }

        this.actor.update({
            'system.health': setValue,
        });
    }

    _setAscensionGaugeValue(event) {
        const elem = $(event.currentTarget);
        let setValue = elem.val() - 1;

        if (this.actor.system.ascensionGauge !== elem.val()) {
            setValue = elem.val();
        }

        this.actor.update({
            'system.ascensionGauge': setValue,
        });
    }

    _onValueChange(event) {
        const elem = $(event.currentTarget);
        const elemName = elem.attr('name');

        const updateData = {};

        if (elem.attr('type') === 'number') {
            updateData[elemName] = parseInt(elem.val());
        } else {
            updateData[elemName] = elem.val();
        }

        this.actor.update(updateData);
    }

    _getHealthRollScore(healthValue = 0) {
        if (healthValue >= 15) {
            return 3;
        } else if (healthValue >= 11) {
            return 2;
        } else if (healthValue >= 6) {
            return 1;
        } else {
            return 0;
        }
    }
}
