import { dispatchRef, initValues } from '@/relay/relay.js'
import { createCaracRollTemplate, createDegatsTemplate } from '@/rollTemplates/index.js'
import { useUiStore } from '@/stores/uiStore.js'

/*
 * Chuchotage : un drapeau « le prochain jet est privé » consommé par les fonctions de
 * jet. Permet d'ajouter un bouton « chuchoter » à côté de n'importe quel jet existant
 * sans modifier toutes les fonctions intermédiaires.
 */
let pendingWhisper = false
export const whisper = (fn) => {
  pendingWhisper = true
  return fn()
}
const consumeWhisper = () => {
  const w = pendingWhisper
  pendingWhisper = false
  return w ? { whisper: 'gm' } : undefined
}

/*
 * Confirmation avant suppression (popup SDK). Si l'option n'est pas activée, exécute
 * directement. window.confirm étant bloqué dans l'iframe Roll20, on passe par dispatch.query.
 */
export const confirmRemove = async (fn) => {
  const ui = useUiStore()
  if (!ui.confirmDelete) return fn()
  const dispatch = dispatchRef.value
  if (!dispatch || !dispatch.query) return fn()
  const res = await dispatch.query({
    options: {
      title: 'Supprimer cet élément ?',
      text: 'Cette action est irréversible.',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }
  })
  const q = res?.results ?? res
  if (q && q.isConfirmed) fn()
}

// Noms des effets d'arme (index 0-7), repris de la fiche legacy.
export const EFFECT_NAMES = [
  'Aucun',
  'Paralysie',
  'Empoisonnement',
  'Affliction',
  'Brulûre',
  'Gel',
  'Électrocution',
  'Banissement'
]

// Catégorie de résultat d'un jet d100 d'Enyllion (réussite/échec + critiques).
// Reproduit la logique du roll template "enyllion" legacy, en une seule catégorie nette.
export const computeEnyllionResult = (roll, carac) => {
  if (roll <= 5) return { resultText: 'Réussite critique !', resultClass: 'crit' }
  if (roll <= 10) return { resultText: 'Réussite fabuleuse !', resultClass: 'success' }
  if (roll <= 20) return { resultText: 'Réussite exceptionnelle !', resultClass: 'success' }
  if (roll > 95) return { resultText: 'Échec critique !', resultClass: 'critfail' }
  if (roll <= carac) return { resultText: 'Réussite !', resultClass: 'success' }
  return { resultText: 'Échec !', resultClass: 'fail' }
}

/*
 * Lance un jet d100 d'Enyllion et poste le roll template au chat.
 * @param {object} p
 * @param {string} p.name   - nom affiché (caractéristique, compétence, sort...)
 * @param {string} [p.sub]  - sous-titre (ex. caractéristique associée d'une compétence)
 * @param {number} p.carac  - valeur cible (caractéristique + malus + bonus + modificateur)
 * @param {string} [p.description] - description optionnelle affichée dans le chat
 */
export const rollEnyllion = async ({ name, sub = '', carac = 0, description = '', promptMod = true, perso = null }) => {
  const dispatch = dispatchRef.value
  const options = consumeWhisper()
  if (!dispatch || !dispatch.roll) {
    console.warn('[Enyllion] rollEnyllion: dispatch indisponible (mode dev offline)')
    return
  }
  try {
    let total = carac
    // Demande un modificateur situationnel au lancer (popup, comme le ?{Modificateur} legacy).
    if (promptMod && dispatch.query) {
      const res = await dispatch.query({
        options: {
          title: name ? `Modificateur — ${name}` : 'Modificateur',
          input: 'number',
          inputValue: '0',
          showCancelButton: true,
          confirmButtonText: 'Lancer',
          cancelButtonText: 'Annuler'
        }
      })
      // dispatch.query résout avec { results: { isConfirmed, value, ... }, errors }
      const q = res?.results ?? res
      if (!q || !q.isConfirmed) return // annulé
      total += parseInt(q.value, 10) || 0
    }
    const { results } = await dispatch.roll({ rolls: { jet: '1d100' } })
    const roll = results.jet.results.result
    const { resultText, resultClass } = computeEnyllionResult(roll, total)
    const content = createCaracRollTemplate({
      perso: perso || initValues.character?.name || '',
      name,
      sub,
      carac: total,
      roll,
      resultText,
      resultClass,
      description
    })
    await dispatch.post({ characterId: initValues.character.id, content, options })
  } catch (err) {
    console.error('[Enyllion] rollEnyllion a échoué :', err)
  }
}

/*
 * Poste un message simple au chat (sans jet), au style des roll templates Enyllion.
 */
export const postMessage = async ({ name = '', sub = '', text = '' }) => {
  const dispatch = dispatchRef.value
  if (!dispatch || !dispatch.post) {
    console.warn('[Enyllion] postMessage: dispatch indisponible (mode dev offline)')
    return
  }
  const options = consumeWhisper()
  const perso = initValues.character?.name || ''
  const content =
    `<div class="enyllion-template">` +
    `<div class="enyllion-template__header">` +
    (perso ? `<div class="enyllion-template__perso">${perso}</div>` : '') +
    (name ? `<div class="enyllion-template__name">${name}${sub ? ` <span class="enyllion-template__sub">(${sub})</span>` : ''}</div>` : '') +
    `</div>` +
    (text ? `<hr class="enyllion-template__sep" /><div class="enyllion-template__line">${text}</div>` : '') +
    `</div>`
  try {
    await dispatch.post({ characterId: initValues.character.id, content, options })
  } catch (err) {
    console.error('[Enyllion] postMessage a échoué :', err)
  }
}

/*
 * Jet de dégâts d'une arme (template "degats" legacy).
 * Lance les dés de dégâts ; si l'arme a un effet, lance un d100 vs pourcentage pour
 * savoir s'il se déclenche (et le nombre de tours). Dégâts totaux = base + mod d'effet.
 */
export const rollDamage = async (weapon) => {
  const dispatch = dispatchRef.value
  const options = consumeWhisper()
  if (!dispatch || !dispatch.roll) {
    console.warn('[Enyllion] rollDamage: dispatch indisponible (mode dev offline)')
    return
  }
  const {
    name = '',
    perso = null,
    dmgDice = 0,
    dmgType = 0,
    dmgMod = 0,
    effect = 0,
    effectPct = 0,
    effectTurnsDice = 0,
    effectTurnsType = 0,
    effectTurnsMod = 0,
    effectDmgMod = 0
  } = weapon

  const nDice = parseInt(dmgDice, 10) || 0
  const dType = parseInt(dmgType, 10) || 0
  const dMod = parseInt(dmgMod, 10) || 0
  const eff = parseInt(effect, 10) || 0
  const pct = parseInt(effectPct, 10) || 0
  const tDice = parseInt(effectTurnsDice, 10) || 0
  const tType = parseInt(effectTurnsType, 10) || 0
  const tMod = parseInt(effectTurnsMod, 10) || 0
  const effDmg = parseInt(effectDmgMod, 10) || 0

  try {
    const rolls = { degats: `${nDice}d${dType}+${dMod}` }
    const hasEffect = eff > 0
    const hasTurns = tDice > 0 && tType > 0
    if (hasEffect) {
      rolls.trigger = '1d100'
      if (hasTurns) rolls.tours = `${tDice}d${tType}+${tMod}`
    }
    const { results } = await dispatch.roll({ rolls })
    const baseDamage = results.degats.results.result
    let triggered = false
    let turns = 0
    if (hasEffect) {
      triggered = (results.trigger.results.result || 0) <= pct
      turns = hasTurns ? results.tours.results.result : 0
    }
    const content = createDegatsTemplate({
      perso: perso || initValues.character?.name || '',
      name,
      hasEffect,
      effectName: EFFECT_NAMES[eff] || 'Aucun',
      triggered,
      turns,
      baseDamage,
      totalDamage: baseDamage + effDmg
    })
    await dispatch.post({ characterId: initValues.character.id, content, options })
  } catch (err) {
    console.error('[Enyllion] rollDamage a échoué :', err)
  }
}
