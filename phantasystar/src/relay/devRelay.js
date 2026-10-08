import { reactive } from 'vue'

export const devChatLog = reactive([])

export const clearDevChat = () => devChatLog.splice(0, devChatLog.length)

const d = (sides) => 1 + Math.floor(Math.random() * sides)

const rollTerm = (expression) => {
  const rolls = []
  let flat = 0

  const text = String(expression).replace(/\s+/g, '')
  const parts = text.match(/[+-]?[^+-]+/g) ?? []

  for (const part of parts) {
    const sign = part.startsWith('-') ? -1 : 1
    const body = part.replace(/^[+-]/, '')
    const dice = /^(\d*)d(\d+)$/i.exec(body)
    if (dice) {
      const count = dice[1] === '' ? 1 : Number(dice[1])
      const sides = Number(dice[2])
      const results = Array.from({ length: count }, () => d(sides))
      rolls.push({ dice: count, sides, results: sign === 1 ? results : results.map((n) => -n) })
    } else if (body !== '') {
      flat += sign * (Number(body) || 0)
    }
  }

  const diceTotal = rolls.reduce((sum, r) => sum + r.results.reduce((a, b) => a + b, 0), 0)
  return {
    results: {
      result: diceTotal + flat,
      expression: String(expression),
      rolls,
    },
  }
}

export default async () => ({
  roll: async ({ rolls }) => ({
    results: Object.fromEntries(
      Object.entries(rolls).map(([key, expression]) => [key, rollTerm(expression)]),
    ),
  }),
  post: async ({ content }) => {
    devChatLog.push({ id: devChatLog.length + 1, content })
    return content
  },
  update: (...args) => console.log('devRelay update', args),
  updateCharacter: (...args) => console.log('devRelay updateCharacter', args),
  updateSharedSettings: async ({ settings }) => {
    console.log('devRelay updateSharedSettings', settings)
  },
  characters: {},
  updateTokensByCharacter: () => '',
})
