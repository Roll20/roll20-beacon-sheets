// Mirrors downloadDocument in exporter.js. It only serializes: the panel validates
// first, so a refused export never reaches the browser.
//
// The file name comes from baseName, never doc.name (spec §8.2). The panel passes the
// raw character name, while doc.name already carries the DEFAULT_CHARACTER_NAME
// fallback. A blank name therefore downloads as cypher-creature.json, and the document
// inside still meets the schema's minimum name length.
export const downloadCreatureDocument = (doc, baseName) => {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName || 'cypher-creature'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
