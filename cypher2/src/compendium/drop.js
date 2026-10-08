import { useSheetStore } from '@/stores/sheetStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
// Import cycle (relay.js → handlers.js → drop.js → stores → relay.js): read relay bindings only inside functions, never at module top level.
import { awaitHydrationIdle, blockUpdate } from '@/relay/relay.js'
import { fetchPage } from '@/compendium/fetchPage.js'
import { readPayload, CYPHER_ITEM_ATTRIBUTE } from '@/compendium/readPayload.js'
import { handlerFor } from '@/compendium/categoryHandlers.js'
import * as say from '@/compendium/messages.js'

// The compendium drop coordinator (spec ⑥ §4.2). Every check runs before anything is
// written, so a drop adds one complete row or changes nothing saved.

// One deadline for the whole drop, fetch and hydration wait together (decision 10). Ten
// seconds is a judgment call, not a measurement.
export const DROP_DEADLINE_MS = 10000

// Raw drop facts for walkthrough item 9. Gated on DEV, never MODE: the sandbox runs mode
// 'staging', so a MODE gate would ship this log to players (ddd-dxk).
const devLog = (label, data) => {
  if (import.meta.env.DEV) console.info(`[cypher-drop] ${label}`, data)
}

// The reference sheets decode pageName. A name containing '%' makes decoding throw, and
// then the raw value is the name (§5 "Name encoding").
const decodeName = (value) => {
  const text = String(value ?? '')
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

const startDeadline = () => {
  let timer
  const expired = new Promise((resolve) => {
    timer = setTimeout(resolve, DROP_DEADLINE_MS)
  })
  return { expired, cancel: () => clearTimeout(timer) }
}

// Only the latest-STARTED drop may change the notice, the segment, the highlight or the
// status text (decision 16), the same rule ddd-4l3w gave the import panels.
let latestAttempt = 0

export const handleDrop = async (args = {}, dispatch) => {
  const { dropData } = args
  const attempt = ++latestAttempt
  const isLatest = () => attempt === latestAttempt
  const sheet = useSheetStore()
  const npc = useNpcStore()
  // The whole message the SDK passed, not a destructured copy, so an unexpected host
  // shape still shows where the data went.
  devLog('drop', args)

  const pageName = decodeName(dropData?.pageName)
  const categoryName = decodeName(dropData?.categoryName)
  const refuse = (message) => {
    if (isLatest()) sheet.showDropNotice(message)
    return { ok: false, message }
  }

  // Step 2: an NPC card has no lists to show a row in.
  if (npc.isNpc) return refuse(say.NPC_MODE)
  // Step 3: no handler, no request.
  const handler = handlerFor(categoryName)
  if (!handler) return refuse(say.notAnItem(categoryName))

  const deadline = startDeadline()
  try {
    // Step 4.
    const fetched = await fetchPage(
      dispatch,
      { pageName, categoryName, expansionId: dropData?.expansionId },
      { expired: deadline.expired, log: devLog }
    )
    if (!fetched.ok) {
      // The build rejects duplicate titles within a category, so two matches is a
      // malformed compendium, not a loading problem.
      return refuse(fetched.reason === 'ambiguous' ? say.malformed(pageName) : say.couldNotLoad(pageName))
    }

    // Step 5.
    const raw = fetched.page.properties?.[CYPHER_ITEM_ATTRIBUTE]
    devLog('data-CypherItem', { type: typeof raw, raw })
    const read = readPayload(fetched.page.properties)
    if (!read.ok) {
      if (read.reason === 'newer') return refuse(say.NEWER)
      if (read.reason === 'malformed') return refuse(say.malformed(pageName))
      // Details are for bug reports, never for the notice (§6.2).
      console.warn(`[cypher-drop] "${pageName}" does not match $defs/dropPayload`, read.errors)
      return refuse(say.unreadable(pageName))
    }

    // Step 6.
    const target = handler(read.envelope)
    if (!target.ok) return refuse(say.malformed(pageName))

    // Step 7. A write while a hydrate holds the lock is never saved and is overwritten
    // (§5). The loop re-checks after every wake, because another hydrate can start
    // before this continuation runs.
    while (blockUpdate.value) {
      const idle = await Promise.race([
        awaitHydrationIdle().then(() => true),
        deadline.expired.then(() => false)
      ])
      if (!idle) return refuse(say.couldNotAdd(pageName))
    }

    // Step 8, in the same synchronous run as the write. The mode can change during the
    // fetch, and the hydrate that released the lock can itself switch to NPC mode.
    if (npc.isNpc) return refuse(say.NPC_MODE)

    // Step 9. Every valid drop adds its row. Only the latest drop gives feedback.
    const id = sheet.addDroppedRow(target.list, target.item)
    if (isLatest()) {
      sheet.ui[target.segmentKey] = target.segment
      sheet.highlightDroppedRow(id)
      sheet.announceDrop(say.added(target.item.name, categoryName))
      sheet.dismissDropNotice()
    }
    return { ok: true, id }
  } finally {
    deadline.cancel()
  }
}
