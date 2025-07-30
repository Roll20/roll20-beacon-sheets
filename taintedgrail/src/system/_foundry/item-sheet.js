export class TgItemSheet extends ItemSheet {
    /** @inheritdoc */
    get template() {
        return `systems/tg/templates/items/${this.item.type}-sheet.hbs`
    }

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['tg', 'sheet', 'item'],
            width: 520,
            height: 380,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'description',
                },
            ],
            scrollY: ['.attributes'],
        })
    }

    /** @inheritdoc */
    async getData(options) {
        const context = await super.getData(options)

        if (
            context.data.type === 'discipline' ||
            context.data.type === 'weapon'
        ) {
            context.domains = [
                'closeCombat',
                'communication',
                'compassion',
                'craft',
                'erudition',
                'feats',
                'healing',
                'inspiration',
                'leadership',
                'magic',
                'monsters',
                'mountedCombat',
                'naturalEnvironment',
                'perception',
                'performance',
                'religion',
                'shootingAndThrowing',
                'stealth',
                'travel',
                'wyrdnessMysteries',
            ]
        } else if (context.data.type === 'profession') {
            context.extras = ['none', 'flux', 'exaltation', 'rindath']
        }

        if (context.data.type === 'weapon') {
            context.disciplines = [
                'firstAid',
                'authority',
                'swords',
                'tenacity',
            ]

            if (context.data.system.domain === '') {
                context.data.system.domain = null
            }
            if (context.data.system.discipline === '') {
                context.data.system.discipline = null
            }
        }

        context.descriptionHTML = await TextEditor.enrichHTML(
            context.data.system.description,
            {
                secrets: this.document.isOwner,
                async: true,
            }
        )
        return context
    }

    /** @inheritdoc */
    _getSubmitData(updateData) {
        let formData = super._getSubmitData(updateData)

        // this._updateDisciplines(formData, document);
        return formData
    }
}
