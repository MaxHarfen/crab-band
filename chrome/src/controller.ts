import { fetchLimits, limitsText, limitsTitle } from './limits.ts'
import { outfitFromLabel } from './outfit.ts'
import { orgIdFromCookie, readPage } from './page.ts'
import { createCrabView, createLimitsView } from './view.ts'

export type Deps = { doc: Document; fetch: typeof fetch; now: () => number; cookie: () => string }

// How often the limits are read while the tab is visible, besides at the end of each reply.
export const LIMITS_EVERY_MS = 300_000

// Brings the page and the two views into line. `tick` is idempotent and writes only what changed,
// so the page's MutationObserver may call it as often as it likes: a tick with nothing new is silent.
// Nothing here ever throws into the page; a page it cannot read gets no crab and no limits.
export const createController = (deps: Deps): { tick(): void; refreshLimits(): Promise<void> } => {
  const crab = createCrabView(deps.doc)
  const limits = createLimitsView(deps.doc)
  let wasWorking = false
  let since = 0

  // The limits sit just before the model picker, in its own row.
  const placeLimits = (button: Element | null) => {
    const parent = button?.parentNode
    if (!button || !parent) {
      if (limits.host.parentNode) limits.host.remove()
      return
    }
    if (limits.host.nextSibling !== button) parent.insertBefore(limits.host, button)
  }

  const refreshLimits = async (): Promise<void> => {
    try {
      const org = orgIdFromCookie(deps.cookie())
      const got = org === null ? null : await fetchLimits(org, deps.fetch)
      limits.render(got && limitsText(got), got ? limitsTitle(got, deps.now()) : '')
      placeLimits(readPage(deps.doc).modelButton)
    } catch {
      // A page we cannot read keeps whatever it had; the next refresh tries again.
    }
  }

  const tick = (): void => {
    try {
      const page = readPage(deps.doc)
      if (page.working && !wasWorking) since = deps.now()
      const ended = wasWorking && !page.working
      wasWorking = page.working

      // The crab sits as the last child of the row under the last reply, and follows the row when
      // claude.ai renders a new one.
      const row = page.footerRow
      if (row) {
        crab.render({
          costume: outfitFromLabel(page.modelLabel),
          working: page.working,
          phase: page.working ? (deps.now() - since) / 1000 : 0,
        })
        if (row.lastElementChild !== crab.host) row.append(crab.host)
      } else if (crab.host.parentNode) {
        crab.host.remove()
      }

      placeLimits(page.modelButton)
      if (ended) void refreshLimits()
    } catch {
      // Same: draw nothing new rather than break claude.ai.
    }
  }

  return { tick, refreshLimits }
}
