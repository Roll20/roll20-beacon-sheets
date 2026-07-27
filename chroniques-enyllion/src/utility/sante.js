// Logique de santé d'Enyllion, partagée entre PJ et PNJ.
// Reproduit les sheet workers legacy (niveau 1-19 selon % PV, puis effet + malus).

export const computeSanteLevel = (hpActual, hpTotal) => {
  const actual = parseInt(hpActual) || 0
  const total = parseInt(hpTotal) || 0
  if (total <= 0) return 0
  const pct = Math.round((actual / total) * 100)
  if (actual <= 1) return 19
  if (pct < 10) return 18
  if (pct < 15) return 17
  if (pct < 20) return 16
  if (pct < 25) return 15
  if (pct < 30) return 14
  if (pct < 35) return 13
  if (pct < 40) return 12
  if (pct < 45) return 11
  if (pct < 50) return 10
  if (pct < 55) return 9
  if (pct < 60) return 8
  if (pct < 65) return 7
  if (pct < 70) return 6
  if (pct < 75) return 5
  if (pct < 80) return 4
  if (pct < 85) return 3
  if (pct < 90) return 2
  if (pct <= 100) return 1
  return 0
}

export const computeSanteEffet = (sante) => {
  if (sante >= 5 && sante <= 9) return { effet: '-2 à tous les jets', malus: -2 }
  if (sante >= 10 && sante <= 14) return { effet: '-5 à tous les jets', malus: -5 }
  if (sante >= 15 && sante <= 16) return { effet: '-10 à tous les jets', malus: -10 }
  if (sante === 17) return { effet: '-15 à tous les jets', malus: -15 }
  if (sante === 18) return { effet: '-20 à tous les jets', malus: -20 }
  if (sante === 19) return { effet: "Inconscient jusqu'à soins", malus: -20 }
  return { effet: 'Tout va bien', malus: 0 }
}
