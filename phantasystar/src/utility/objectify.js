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

export const objectToArray = (object) => {
  if (!object) return []

  const newArray = []
  const objectIds = Object.keys(object)

  objectIds.forEach((key) => {
    if (object[key]) {
      const position = object[key].arrayPosition
      const item = {
        _id: key,
        ...object[key],
        arrayPosition: undefined
      }
      newArray[position] = item
    }
  })

  return newArray.filter((x) => x)
}

export const paragraphsToObject = (list) =>
  Object.fromEntries((Array.isArray(list) ? list : []).map((text, i) => [`p${i}`, String(text ?? '')]))

export const objectToParagraphs = (value) => {
  if (Array.isArray(value)) return value.map((p) => String(p ?? ''))
  if (typeof value === 'string') {
    if (value.startsWith('$__$')) {
      try {
        const parsed = JSON.parse(value.slice(4))
        if (Array.isArray(parsed)) return parsed.map((p) => String(p ?? ''))
      } catch {
      }
    }
    return value.trim() ? [value] : []
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .filter((k) => /^p\d+$/.test(k))
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
      .map((k) => String(value[k] ?? ''))
  }
  return []
}
