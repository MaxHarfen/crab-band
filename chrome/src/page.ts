// What the extension reads from claude.ai. These are claude.ai's internal names (recon on 2026-10-22,
// build 6f837c723e) and can change at any time: a selector that misses reads as "nothing there".
export const SEL = {
  stop: '[data-testid="chat-input-stop"]',
  assistant: '[data-testid="assistant-message"]',
  footerRow: '[data-testid="chat-footer-row"]',
  spark: '[data-testid="chat-footer-spark"]',
  model: '[data-testid="model-selector-dropdown"]',
} as const

// No chat text: whether Claude is working, the model picker's label, and where to draw.
export type PageState = {
  working: boolean
  modelLabel: string | null
  footerRow: Element | null
  modelButton: Element | null
}

const last = <T extends Element>(list: ArrayLike<T> | undefined): T | null => (list && list.length > 0 ? list[list.length - 1] : null)

// The row under the last reply where claude.ai keeps its spark; the last such row, else the last row.
const footerRowOf = (doc: Document): Element | null => {
  const rows = [...doc.querySelectorAll(SEL.footerRow)]
  return last(rows.filter(r => r.querySelector(SEL.spark) !== null)) ?? last(rows)
}

export const readPage = (doc: Document): PageState => {
  const reply = last(doc.querySelectorAll(SEL.assistant))
  const working = doc.querySelector(SEL.stop) !== null || reply?.getAttribute('data-is-streaming') === 'true'
  const modelButton = doc.querySelector(SEL.model)
  const label = modelButton?.getAttribute('aria-label')?.replace(/^\s*model:/i, '').trim()
  return {
    working,
    modelLabel: label ? label : null,
    footerRow: footerRowOf(doc),
    modelButton,
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The org the usage request is for, from the lastActiveOrg cookie claude.ai sets (not HttpOnly).
// Anything but a UUID is no org, so nothing odd ever lands in the request path.
export const orgIdFromCookie = (cookie: string): string | null => {
  for (const part of cookie.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0 || part.slice(0, eq).trim() !== 'lastActiveOrg') continue
    let value = part.slice(eq + 1).trim()
    try { value = decodeURIComponent(value) } catch { return null }
    return UUID.test(value) ? value : null
  }
  return null
}
