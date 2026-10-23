import { crabSvg } from './crab-svg.ts'

// The two things the extension draws, each in a host of its own with a shadow root, so claude.ai's
// styles and the crab's never touch. A render writes only what changed: the page's MutationObserver
// sees every write, and the dance would restart if the SVG were redrawn.

export type CrabState = { costume: string; working: boolean; phase: number }
export type CrabView = { host: HTMLElement; render(s: CrabState): void }
export type LimitsView = { host: HTMLElement; render(text: string | null, title: string): void }

// The host fills the rest of the footer row, and the crab walks it sideways, there and back, while
// Claude works (dancing as it goes); done, it stands at the start, beside claude.ai's spark.
// claude.ai keeps the footer row `invisible` while its spark is hidden; the crab shows regardless.
const WALK_SECONDS = 16
const CRAB_STYLE = [
  ':host{display:block;flex:1 1 auto;min-width:0;container-type:inline-size;visibility:visible;line-height:0}',
  '.crab{display:inline-block;line-height:0}',
  `.crab.walk{animation:crab-walk ${WALK_SECONDS}s ease-in-out infinite}`,
  '@keyframes crab-walk{0%,100%{transform:translateX(0)}50%{transform:translateX(calc(100cqw - 100%))}}',
  '.crab svg{display:block;image-rendering:pixelated}',
  '@media (prefers-reduced-motion: reduce){.walk{animation:none!important}}',
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
  root.append(style, crab)

  let drawn: { costume: string; working: boolean } | null = null
  return {
    host,
    render(s) {
      if (drawn === null || drawn.costume !== s.costume || drawn.working !== s.working) {
        crab.innerHTML = crabSvg(s.costume, s.working, s.phase)
        if (drawn === null || drawn.working !== s.working) crab.classList.toggle('walk', s.working)
        drawn = { costume: s.costume, working: s.working }
      }
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
