/*
This is a utility function that will handle converting an array into a list of objects in a firebase friendly format.
 */
export const arrayToObject = (array) => {
  const isValidArray = array.every((item) => '_id' in item)

  if (!isValidArray) throw new Error('Tried to objectify an array, but not every item had ids')

  const newObject = {}

  array.forEach((item, index) => {
    const { _id, ...rest } = item

    newObject[_id] = {
      ...rest,
      arrayPosition: index
    }
  })

  return newObject
}

/*
A stored position counts only when it reads as a number. Roll20 can hand a saved number
back as a string, and index assignment read '3' as position 3, so a numeric string keeps
ordering by its number instead of counting as missing.
 */
const positionOf = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/*
Numbers first, ascending. A row whose stored position is missing or unreadable goes last,
because a damaged number says nothing about where its row belongs. Array.prototype.sort is
stable, so ties keep the stored key order.
 */
const byPosition = (a, b) => {
  if (a.position !== null && b.position !== null) return a.position - b.position
  if ((a.position === null) !== (b.position === null)) return a.position === null ? 1 : -1
  return 0
}

/*
This is a utility function that will handle converting an object from firebase into an array.

Rows are sorted by their stored position rather than written to it. Index assignment let a
damaged position decide a row's fate: a duplicate overwrote the row already at that index,
a huge one built a sparse array whose whole length the following filter then walked, which
measured 86.7 seconds for one list, and anything that was not an array index became a
plain string property and vanished. Sorting gives the same order on a healthy document,
where positions are dense and start at 0, and loses no row on a damaged one. See
beacon-mapping §3.2 and ddd-4u8n.
 */
export const objectToArray = (object) => {
  if (!object) return []

  const rows = []

  Object.keys(object).forEach((key) => {
    const stored = object[key]
    // A stored value that is not a row never had a position to be placed by, so it was
    // dropped before and is dropped here.
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return

    rows.push({
      position: positionOf(stored.arrayPosition),
      // arrayPosition is overwritten rather than deleted. Export is written against that
      // key being present and undefined (beacon-mapping §3.2).
      item: {
        _id: key,
        ...stored,
        arrayPosition: undefined
      }
    })
  })

  return rows.sort(byPosition).map((row) => row.item)
}
