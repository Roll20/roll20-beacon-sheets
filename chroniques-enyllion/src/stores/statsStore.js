import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { rollEnyllion } from '@/utility/rolls.js'
import { computeSanteLevel, computeSanteEffet } from '@/utility/sante.js'

/*
 * Store principal de la fiche PJ "Les Chroniques d'Enyllion".
 * Couvre l'onglet PJ > Principal : infos personnage, caractéristiques, santé, bourse.
 * La logique de santé (niveau, effet, malus) est portée depuis les sheet workers legacy
 * vers des `computed` réactifs.
 */

// Les 8 caractéristiques d'Enyllion. L'ordre/codes correspondent à la fiche legacy.
export const CARAC_KEYS = ['FO', 'ED', 'DEX', 'CH', 'CON', 'PO', 'PE', 'SF']

export const CARAC_LABELS = {
  FO: 'Force',
  ED: 'Éducation',
  DEX: 'Dexterité',
  CH: 'Charisme',
  CON: 'Constitution',
  PO: 'Pouvoir/Chance',
  PE: 'Perception',
  SF: 'Sang-Froid'
}

// Calcule le niveau du personnage à partir de l'expérience (seuils de la fiche legacy).
const XP_THRESHOLDS = [
  [300000, 20],
  [180000, 19],
  [130000, 18],
  [105000, 17],
  [80000, 16],
  [55000, 15],
  [45000, 14],
  [35000, 13],
  [25000, 12],
  [20000, 11],
  [15000, 10],
  [10000, 9],
  [7500, 8],
  [5000, 7],
  [3000, 6],
  [1500, 5],
  [750, 4],
  [350, 3],
  [100, 2]
]
const computeLevel = (xp) => {
  const x = parseInt(xp, 10) || 0
  for (const [seuil, lvl] of XP_THRESHOLDS) if (x >= seuil) return lvl
  return 1
}

const statsStore = () => {
  // --- Infos personnage ---
  const infos = reactive({
    pcEthnie: '',
    pcBornPlace: '',
    pcDivinity: '',
    pcSocialClass: '',
    pcSex: '',
    pcAge: '',
    pcWeigth: '',
    pcHeight: '',
    pcExperience: 0,
    pcRace: '0',
    pcClass: '0',
    pcSpeciality: '',
    pcGuild: ''
  })

  // Niveau calculé automatiquement depuis l'expérience (lecture seule).
  const level = computed(() => computeLevel(infos.pcExperience))

  // --- Caractéristiques : { FO: { base, mod }, ... } ---
  const caracs = reactive(
    CARAC_KEYS.reduce((acc, key) => {
      acc[key] = { base: 0, mod: 0 }
      return acc
    }, {})
  )

  // --- Santé ---
  const hpActual = ref(0)
  const hpTotal = ref(0)

  const santeLevel = computed(() => computeSanteLevel(hpActual.value, hpTotal.value))
  const effetSante = computed(() => computeSanteEffet(santeLevel.value).effet)
  const malusSante = computed(() => computeSanteEffet(santeLevel.value).malus)

  // --- Bourse ---
  const goldPieces = ref(0)
  const silverPieces = ref(0)
  const copperPieces = ref(0)

  // --- Honneur (0-20) -> alignement + jauge inversée (reproduit change:pcHonneur) ---
  const honneur = ref(0)
  const alignement = computed(() => {
    const h = parseInt(honneur.value) || 0
    if (h >= 14 && h <= 20) return 'Bon'
    if (h >= 7 && h <= 13) return 'Neutre'
    if (h >= 1 && h <= 6) return 'Mauvais'
    return 'Âme damnée'
  })
  // Remplissage de la jauge d'honneur : honneur 1 => 20 segments, 20 => 1, 0 => 0.
  const honEchFill = computed(() => {
    const h = parseInt(honneur.value) || 0
    return h === 0 ? 0 : 21 - h
  })

  // --- Affinité divine (0-10) -> jauge (reproduit change:pcAffDiv) ---
  const affDiv = ref(0)
  const affDivFill = computed(() => {
    const a = parseInt(affDiv.value)
    if (Number.isNaN(a) || a < 0 || a > 10) return 0
    return a + 1
  })

  // --- Attributs ---
  const attributs = reactive({
    pcTraitsCarac1: '',
    pcTraitsCarac2: '',
    pcNativeLanguage: '',
    pcLanguages: ''
  })

  // --- Caractéristiques de race (3 lignes : nom + bonus/malus) ---
  const caracRace = reactive([
    { nom: '', bonus: 0 },
    { nom: '', bonus: 0 },
    { nom: '', bonus: 0 }
  ])

  // --- Résistance magique ---
  const resMag = reactive({
    resistance: '',
    faiblesse: ''
  })

  // --- Notes libres ---
  const notes = ref('')

  // Lance un jet de caractéristique (d100). cible = modifié + malus santé (+ modificateur demandé au lancer).
  const rollCarac = (key, label) => {
    const carac = (parseInt(caracs[key].mod, 10) || 0) + malusSante.value
    return rollEnyllion({ name: label, carac })
  }

  // Sérialisation vers le data store (attributes.stats)
  const dehydrate = () => ({
    infos: { ...infos },
    level: level.value,
    caracs: JSON.parse(JSON.stringify(caracs)),
    hpActual: hpActual.value,
    hpTotal: hpTotal.value,
    // valeurs calculées persistées pour être exploitables côté macros/tokens
    santeLevel: santeLevel.value,
    effetSante: effetSante.value,
    malusSante: malusSante.value,
    goldPieces: goldPieces.value,
    silverPieces: silverPieces.value,
    copperPieces: copperPieces.value,
    honneur: honneur.value,
    alignement: alignement.value,
    affDiv: affDiv.value,
    attributs: { ...attributs },
    caracRace: JSON.parse(JSON.stringify(caracRace)),
    resMag: { ...resMag },
    notes: notes.value
  })

  // Hydratation depuis le data store
  const hydrate = (data = {}) => {
    if (data.infos) Object.assign(infos, data.infos)
    if (data.caracs) {
      CARAC_KEYS.forEach((key) => {
        if (data.caracs[key]) {
          caracs[key].base = data.caracs[key].base ?? 0
          caracs[key].mod = data.caracs[key].mod ?? 0
        }
      })
    }
    hpActual.value = data.hpActual ?? hpActual.value
    hpTotal.value = data.hpTotal ?? hpTotal.value
    goldPieces.value = data.goldPieces ?? goldPieces.value
    silverPieces.value = data.silverPieces ?? silverPieces.value
    copperPieces.value = data.copperPieces ?? copperPieces.value
    honneur.value = data.honneur ?? honneur.value
    affDiv.value = data.affDiv ?? affDiv.value
    if (data.attributs) Object.assign(attributs, data.attributs)
    if (Array.isArray(data.caracRace)) {
      data.caracRace.forEach((row, i) => {
        if (caracRace[i]) {
          caracRace[i].nom = row.nom ?? ''
          caracRace[i].bonus = row.bonus ?? 0
        }
      })
    }
    if (data.resMag) Object.assign(resMag, data.resMag)
    notes.value = data.notes ?? notes.value
  }

  return {
    infos,
    level,
    caracs,
    hpActual,
    hpTotal,
    santeLevel,
    effetSante,
    malusSante,
    goldPieces,
    silverPieces,
    copperPieces,
    honneur,
    alignement,
    honEchFill,
    affDiv,
    affDivFill,
    attributs,
    caracRace,
    resMag,
    notes,
    rollCarac,
    dehydrate,
    hydrate
  }
}

export const useStatsStore = defineStore('stats', statsStore)
