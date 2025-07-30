import { ActorSheetHelper } from './actor-sheet-helper.js';

export class TgCreatureSheet extends ActorSheet {
    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['tg', 'sheet', 'creature'],
            width: 500,
            height: 900,
            scrollY: ['.tg', '.sheet-body'],
            dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
        });
    }

    /** @inheritdoc */
    get template() {
        return 'systems/tg/templates/creature-sheet.hbs';
    }

    /** @inheritdoc */
    async getData(options) {
        const context = await super.getData(options);

        context.descriptionHTML = await TextEditor.enrichHTML(context.data.system.description, {
            secrets: this.document.isOwner,
            async: true,
        });

        context.actor.system.itemTypes = ['trait', 'specialAbility'];

        context.actor.system.traits = [];
        context.actor.system.specialAbilities = [];

        for (let i = 0; i < context.items.length; i++) {
            let item = context.items[i];

            if (context.items[i].type === 'trait') {
                context.actor.system.traits.unshift(context.items[i]);
            } else if (context.items[i].type === 'specialAbility') {
                context.actor.system.specialAbilities.unshift(context.items[i]);
            }
        }

        console.log(context);

        Hooks.call('tgCreatureUpdated', context);

        return context;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-control').click(this._onItemControl.bind(this));

        html.find('.trait-control').click(this._onTraitControl.bind(this));

        html.find('.special-ability-control').click(this._onSpecialAbilityControl.bind(this));

        html.find('.rollable-attack').click(this._onAttackRoll.bind(this));
        html.find('.rollable-defense').click(this._onDefenseRoll.bind(this));
        html.find('.rollable-trait').click(this._onTraitRoll.bind(this));
        html.find('.rollable-special-ability').click(this._onSpecialAbilityRoll.bind(this));
        html.find('.rollable-domain').click(this._onDomainRoll.bind(this));

        html.find('.openItemsModal').click(this._itemsModal.bind(this));

        html.find('.healthRadioValue').click(this._setHealthValue.bind(this));
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
     * Handle click events for traits edit buttons
     * @param event
     * @private
     */
    _onTraitControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * Handle click events for special abilities edit buttons
     * @param event
     * @private
     */
    _onSpecialAbilityControl(event) {
        event.preventDefault();
        const item = this.actor.items.get(event.currentTarget?.dataset.id);
        return item.sheet.render(true);
    }

    /**
     * @param {MouseEvent} event
     */
    _onAttackRoll(event) {
        const elem = $(event.currentTarget);
        let score = {
            base: 0,
            healthModifier: this._getHealthRollScore(
                this.actor.system.health,
                this.actor.system.healthCriticalMax,
                this.actor.system.healthBadMax,
                this.actor.system.healthOkayMax,
            ),
        };

        if (this.actor.system.attack !== null) {
            score.base = this.actor.system.attack;
        }

        let roll = new Roll(
            ActorSheetHelper._simplifyRollScore('1d10 + @base - @healthModifier', score),
            ActorSheetHelper._absScores(score),
        );

        ActorSheetHelper._sendRollMessage(
            roll,
            game.i18n.localize('tg.rolls.attackRoll'),
            null,
            `${game.i18n.localize('tg.attributes.attack')}: ${this.actor.system.attack}<br> ${game.i18n.localize('tg.common.damage')}: ${
                this.actor.system.damage
            }<br> ${game.i18n.localize('tg.common.healthModifier')}: ${score.healthModifier}`,
        );
    }

    /**
     * @param {MouseEvent} event
     */
    _onDefenseRoll(event) {
        ActorSheetHelper._sendMessage(
            game.i18n.localize('tg.attributes.defense'),
            null,
            `${game.i18n.localize('tg.attributes.defense')}: ${this.actor.system.defense}<br> ${game.i18n.localize(
                'tg.attributes.protection',
            )}: ${this.actor.system.protection}`,
        );
    }

    /**
     * @param {MouseEvent} event
     */
    _onTraitRoll(event) {
        const item = this.actor.items.get(event.currentTarget?.dataset.id);

        if (item) {
            ActorSheetHelper._sendMessage(item.name ? item.name : game.i18n.localize('tg.rolls.traitRoll'), null, item.system.description);
        }
    }

    /**
     * @param {MouseEvent} event
     */
    _onSpecialAbilityRoll(event) {
        const item = this.actor.items.get(event.currentTarget?.dataset.id);

        if (item) {
            ActorSheetHelper._sendMessage(
                item.name ? item.name : game.i18n.localize('tg.rolls.specialAbilityRoll'),
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
            healthModifier: this._getHealthRollScore(
                this.actor.system.health,
                this.actor.system.healthCriticalMax,
                this.actor.system.healthBadMax,
                this.actor.system.healthOkayMax,
            ),
        };

        for (let domain in this.actor.system.domainsAndDisciplines) {
            if (domain === elemRollDomain) {
                const domainObject = this.actor.system.domainsAndDisciplines[domain];
                score.base = domainObject.base;
            }
        }

        let roll = new Roll(
            ActorSheetHelper._simplifyRollScore('1d10 + @base - @healthModifier', score),
            ActorSheetHelper._absScores(score),
        );

        ActorSheetHelper._sendRollMessage(
            roll,
            `${elem.attr('title')} ${game.i18n.localize('tg.common.roll')}`,
            null,
            '1d10 + Domain - Health modifier',
        );
    }

    /**
     * Handle edit event for Domains
     * @param event
     * @private
     */
    async _itemsModal(event) {
        event.preventDefault();

        const content = await renderTemplate('systems/tg/templates/modals/creature/items.hbs', { data: this.actor });

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

        Hooks.on('tgCreatureUpdated', async (context) => {
            const content = await renderTemplate('systems/tg/templates/modals/items.hbs', { data: that.actor });

            let data = d.getData();
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
        let setValue = parseInt(elem.val()) + 1;

        if (this.actor.system.health !== elem.val()) {
            setValue = elem.val();
        }

        this.actor.update({
            'system.health': setValue,
        });
    }

    _getHealthRollScore(healthValue = 0, criticalMax, badMax, okayMax) {
        if (healthValue <= criticalMax) {
            return 3;
        } else if (healthValue <= badMax) {
            return 2;
        } else if (healthValue <= okayMax) {
            return 1;
        } else {
            return 0;
        }
    }
}
