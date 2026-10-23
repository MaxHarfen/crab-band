// The content script: runs in Chrome's isolated world on claude.ai, reads the page and draws the crab
// and the limits. It never writes into claude.ai's own elements and never calls Claude.
import { createController, LIMITS_EVERY_MS } from './controller.ts'
import { OBSERVE } from './page.ts'

// At most one look at the page per quarter second, however busy claude.ai is.
const TICK_EVERY_MS = 250

const ctl = createController({
  doc: document,
  fetch: window.fetch.bind(window),
  now: () => Date.now(),
  cookie: () => document.cookie,
})

let lastRefresh = 0
const refresh = () => {
  lastRefresh = Date.now()
  void ctl.refreshLimits()
}

let pending = false
let lastTick = 0
const schedule = () => {
  if (pending) return
  pending = true
  setTimeout(() => {
    pending = false
    lastTick = Date.now()
    ctl.tick()
  }, Math.max(0, lastTick + TICK_EVERY_MS - Date.now()))
}

ctl.tick()
refresh()
new MutationObserver(schedule).observe(document.documentElement, OBSERVE)
setInterval(() => {
  if (document.visibilityState === 'visible') refresh()
}, LIMITS_EVERY_MS)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastRefresh >= LIMITS_EVERY_MS) refresh()
})
