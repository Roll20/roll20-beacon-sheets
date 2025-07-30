export class ActorSheetHelper {
    static _sendRollMessage(roll = null, title, image = null, description = '') {
        const imageElem = image ? `<img class="flex0" src="${image}">` : '';

        const flavorContent = `
            <div>
                <h2>${title}</h2>
                <div class="flexrow">${imageElem}${description}</div>
            </div>
        `;

        if (roll !== null) {
            return roll.toMessage({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: flavorContent,
            });
        }
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

    static _simplifyRollScore(rollString, score) {
        let modifiedRollString = rollString;

        Object.entries(score).forEach(([key, value]) => {
            const pattern = new RegExp(`[\\+\\-]\\s*@${key}`, 'g');
            if (value <= 0) {
                modifiedRollString = modifiedRollString.replace(pattern, `- @${key}`);
            }
        });
        console.log(modifiedRollString);
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
