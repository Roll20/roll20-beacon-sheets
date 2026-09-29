import { dispatchRef } from '@/relay/relay'

export const ROLL_TIMEOUT_MS = 8000

export default async (requests, customDispatch) => {
  const dispatch = customDispatch || dispatchRef.value
  if (!dispatch?.roll) throw new Error('No relay dispatch available to roll with')
  if (requests.length === 0) return {}

  const rolls = {}
  for (const { key, count = 1, sides, formula } of requests) {
    rolls[key] = formula ?? `${count}d${sides}`
  }

  let timer
  try {
    const response = await Promise.race([
      dispatch.roll({ rolls }),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Roll20 did not answer the roll request')),
          ROLL_TIMEOUT_MS,
        )
      }),
    ])
    return collect(response)
  } finally {
    clearTimeout(timer)
  }
}

const collect = (response) => {
  const out = {}
  for (const [key, entry] of Object.entries(response.results ?? {})) {
    const results = entry.results ?? entry
    out[key] = {
      total: results.result ?? 0,
      faces: (results.rolls ?? []).flatMap((r) => r.results ?? []),
    }
  }
  return out
}
