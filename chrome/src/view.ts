import { crabSvg } from './crab-svg.ts'

// The two things the extension draws, each in a host of its own with a shadow root, so claude.ai's
// styles and the crab's never touch. A render writes only what changed: the page's MutationObserver
// sees every write, and the dance would restart if the SVG were redrawn.

export type CrabState = { costume: string; working: boolean; step: string | null; phase: number }
export type CrabView = { host: HTMLElement; render(s: CrabState): void }
export type LimitsView = { host: HTMLElement; render(text: string | null, title: string): void }

const CRAB_STYLE = [
  ':host{display:inline-flex;align-items:center;gap:8px;min-width:0;max-width:100%;vertical-align:middle}',
  '[hidden]{display:none!important}',
  '.crab{display:inline-flex;flex:none;line-height:0}',
  '.crab svg{display:block;image-rendering:pixelated}',
  '.step{min-width:0;font-size:12px;line-height:16px;color:inherit;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
].join('\n')

const LIMITS_STYLE = 'font:11px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:inherit;opacity:.7;white-space:nowrap'

const hostOf = (doc: Document, kind: string): HTMLElement => {
  const host = doc.createElement('span')
  host.setAttribute('data-crab-band', kind)
  return host
}

export const createCrabView = (doc: Document): CrabView => {
  const host = hostOf(doc, 'crab')
  const root = host.attachShadow({ mode: 'open' })
  const style = doc.createElement('style')
  style.textContent = CRAB_STYLE
  const crab = doc.createElement('span')
  crab.className = 'crab'
  const step = doc.createElement('span')
  step.className = 'step'
  step.hidden = true
  root.append(style, crab, step)

  let drawn: { costume: string; working: boolean } | null = null
  let text = ''
  return {
    host,
    render(s) {
      if (drawn === null || drawn.costume !== s.costume || drawn.working !== s.working) {
        crab.innerHTML = crabSvg(s.costume, s.working, s.phase)
        drawn = { costume: s.costume, working: s.working }
      }
      const next = s.step ?? ''
      if (next !== text) {
        step.textContent = next
        step.title = next
        text = next
      }
      if (step.hidden !== (next === '')) step.hidden = next === ''
    },
  }
}

export const createLimitsView = (doc: Document): LimitsView => {
  const host = hostOf(doc, 'limits')
  host.hidden = true
  const root = host.attachShadow({ mode: 'open' })
  const line = doc.createElement('span')
  line.setAttribute('style', LIMITS_STYLE)
  root.append(line)

  return {
    host,
    render(text, title) {
      if (text === null) {
        if (!host.hidden) host.hidden = true
        return
      }
      if (line.textContent !== text) line.textContent = text
      if (host.title !== title) host.title = title
      if (host.hidden) host.hidden = false
    },
  }
}
